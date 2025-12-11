/* eslint-disable @typescript-eslint/no-explicit-any */
// auth/auth.ts

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import TwitterProvider from "next-auth/providers/twitter";
import { v4 as uuidv4 } from "uuid";
import userService from "@/services/api/userService";
import { updateUserWallet } from "@/services/userService";
import { cookies } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
  // Disable default account linking by not using an adapter
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const { email, password }: any = credentials;
        
        // Handle verification login flow (after email verification)
        if (password === "VERIFICATION_LOGIN" && email) {
          const user = await prisma.user.findFirst({
            where: {
              email: { equals: email, mode: "insensitive" },
              emailVerified: { not: null }, // Email must be verified
            },
          });

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.username,
          };
        }

        if (!email || !password) {
          return null;
        }

        // Regular login flow
        const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: { equals: email as string, mode: "insensitive" } },
                { username: { equals: email as string, mode: "insensitive" } },
              ],
            },
          });

          if (!user) {
            return null;
          }


          if (!user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.username,
          };
      },
    }),
    TwitterProvider({
      clientId:
        process.env.AUTH_TWITTER_ID ||
        (() => {
          console.error("AUTH_TWITTER_ID environment variable is not set");
          throw new Error(
            "Twitter OAuth configuration missing: AUTH_TWITTER_ID"
          );
        })(),
      clientSecret:
        process.env.AUTH_TWITTER_SECRET ||
        (() => {
          console.error("AUTH_TWITTER_SECRET environment variable is not set");
          throw new Error(
            "Twitter OAuth configuration missing: AUTH_TWITTER_SECRET"
          );
        })(),
      // @ts-expect-error: Twitter OAuth v2
      version: "2.0",
      profile(profile) {
        try {
          // Check if this is a rate limit error (429)
          if (
            profile &&
            typeof profile === "object" &&
            "status" in profile &&
            profile.status === 429
          ) {
            console.error("Twitter rate limit exceeded (429):", profile);
            // Return a minimal profile to prevent the error from being thrown here
            // The actual error handling will be done in the signIn callback
            return {
              id: "rate_limit_error",
              name: "Rate Limit Error",
              image: null,
            };
          }

          // Check if profile and profile.data exist
          if (!profile || !profile.data) {
            console.error("Invalid Twitter profile structure:", profile);
            throw new Error("Invalid Twitter profile structure");
          }

          // Check if required fields exist
          if (!profile.data.id) {
            console.error("Twitter profile missing id:", profile.data);
            throw new Error("Twitter profile missing required id field");
          }

          return {
            id: profile.data.id,
            name: profile.data.name || "Twitter User",
            // Don't include email at all
            image: profile.data.profile_image_url || null,
          };
        } catch (error) {
          console.error("Error parsing Twitter profile:", error);
          // Return a fallback profile to prevent the OAuthProfileParseError
          return {
            id: "profile_parse_error",
            name: "Profile Parse Error",
            image: null,
          };
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Check if the URL contains error parameters
      try {
        const urlObj = new URL(url);
        const error = urlObj.searchParams.get("error");

        // Handle InvalidCheck error (OAuth state parsing issues)
        if (error === "InvalidCheck") {
          console.error("OAuth state parsing error - InvalidCheck");
          return `${baseUrl}/auth/error?error=OAUTH_STATE_ERROR`;
        }

        if (error === "Configuration" && url.includes("429")) {
          return `${baseUrl}/auth/error?error=RATE_LIMIT_EXCEEDED`;
        }

        if (error === "Configuration" && url.includes("Too Many Requests")) {
          return `${baseUrl}/auth/error?error=RATE_LIMIT_EXCEEDED`;
        }

        // Handle whitelist errors
        if (error === "NOT_WHITELISTED") {
          return `${baseUrl}/auth/error?error=NOT_WHITELISTED`;
        }

        // Check if this is a linking callback
        const linking = urlObj.searchParams.get("linking");
        if (linking === "twitter") {
          // console.log("Twitter linking callback detected");
          return `${baseUrl}/profile?linking=twitter`;
        }
      } catch {
        // Ignore URL parsing errors
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {

      // console.log("signIn callback called:", { user, account, profile });

      // For Twitter provider, check for rate limit errors
      if (account?.provider === "twitter") {
        // Check if profile contains rate limit error
        if (
          profile &&
          typeof profile === "object" &&
          "status" in profile &&
          profile.status === 429
        ) {
          // Redirect to error page with rate limit error
          return "/auth/error?error=RATE_LIMIT_EXCEEDED";
        }

        // Check if user has the rate limit error ID from profile function
        if (user && user.id === "rate_limit_error") {
          console.error("Twitter rate limit detected from profile function");
          // Redirect to error page with rate limit error
          return "/auth/error?error=RATE_LIMIT_EXCEEDED";
        }

        // Check if user has the profile parse error ID from profile function
        if (user && user.id === "profile_parse_error") {
          console.error(
            "Twitter profile parse error detected from profile function"
          );
          // Redirect to error page with OAuth state error
          return "/auth/error?error=OAUTH_STATE_ERROR";
        }

        // Check if there's an error in the account object
        if (account.error && typeof account.error === "string") {
          console.error("Twitter account error:", account.error);
          if (
            account.error.includes("429") ||
            account.error.includes("rate limit")
          ) {
            return "/auth/error?error=RATE_LIMIT_EXCEEDED";
          }
          return "/auth/error?error=OAUTH_STATE_ERROR";
        }

        // For account linking, we'll handle this in the JWT callback
        // since we can't access sessionStorage on the server side
        return true;
      }

      // For credentials provider
      if (account?.provider === "credentials") {
        const isVerificationPassword = (account as any)?.password === "VERIFICATION_LOGIN";

        // If no user is returned, authentication failed
        if (!user) {
          throw new Error("CredentialsSignin");
        }

        if (isVerificationPassword) {
          // For verification login, allow signin (email already verified in authorize)
          return true;
        }

        // For login (not signup), check email verification
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, emailVerified: true, walletAddress: true },
        });

        if (!dbUser?.emailVerified) {
          return false;
        }

        // console.log("dbUser", dbUser);
        if (!dbUser?.walletAddress) {
          const response = await userService.getAddress(dbUser.id);
          await updateUserWallet(dbUser.id as string, {
            walletAddress: response.address,
            walletType: response?.walletType || "",
          });
        }

        // Check if this is part of a linking flow by examining the callback URL
        // The callback URL will contain linking context if this is a linking request
        const callbackUrl = (account as any)?.callbackUrl;
        const isLinkingRequest =
          callbackUrl && callbackUrl.includes("/api/auth/link-callback");

        // If this is a linking request, we need to preserve the linking context
        // The JWT callback will handle setting the correct user ID for linking
        if (isLinkingRequest) {
          // console.log(
          //   "Linking request detected in credentials signIn, preserving linking context"
          // );
          // Don't prevent the sign-in, but mark it as a linking request
          // The JWT callback will handle the linking logic
          return true;
        }

        // console.log("Credentials user:", user);
        return true; // Allow all credentials sign ins for now
      }

      return true;
    },

    async jwt({ token, user, account, profile }) {
      // Handle error codes from failed authentication
      if (account?.provider === "credentials" && (account as any)?.errorCode) {
        token.errorCode = (account as any).errorCode;
        token.errorMessage = (account as any).errorMessage;
        return token;
      }


      // For Twitter provider, handle user creation/update here
      if (account?.provider === "twitter" && profile) {
        try {
          // Check for rate limit error in profile
          if (
            profile &&
            typeof profile === "object" &&
            "status" in profile &&
            profile.status === 429
          ) {
            console.error("Rate limit error detected in JWT callback");
            token.errorCode = "RATE_LIMIT_EXCEEDED";
            token.errorMessage =
              "Twitter is currently experiencing high traffic. Please wait a few minutes and try again.";
            return token;
          }

          // Validate profile structure
          if (!profile || typeof profile !== "object") {
            console.error("Invalid profile object in JWT callback:", profile);
            return token;
          }

          const twitterUsername = (profile as any)?.data?.username;
          const siteUsername = twitterUsername ? `@${twitterUsername}` : null;

          // Check if this is a linking request by looking for the linking cookie
          // `account` is only defined on the *first* JWT call—i.e. right after the user just signed in with Twitter
          if (account) {
            const cookieStore = await cookies();
            const linkingUserId = cookieStore.get(
              "twitterLinkingUserId"
            )?.value;

            // console.log("JWT callback - Twitter linking check:", {
            //   linkingUserId,
            //   tokenUserId: token.userId,
            //   hasExistingSession: !!token.userId,
            // });

            // If this is a linking request, don't create a new user
            // Just set the Twitter info in the token and let the linking callback handle the rest
            if (linkingUserId) {
              // console.log(
              //   "Twitter linking request detected, storing linking context for user:",
              //   linkingUserId
              // );
              // Store Twitter data for linking
              token.twitterId = account.providerAccountId;
              token.name = user.name;
              token.picture = (user as any)?.image;
              token.twitterUsername = twitterUsername;
              // Set the userId to the target user (the one who initiated the linking)
              token.userId = linkingUserId;
              // Mark this as a linking token
              token.isLinking = true;
              token.linkingUserId = linkingUserId;
              return token;
            }
          }

          // Check if this Twitter account is already linked to any user
          let twitterUser = await prisma.user.findFirst({
            where: {
              twitterId: account.providerAccountId,
            },
          });

          function getHighResTwitterImage(url: string | null): string | null {
            if (!url) return null;
            const isTwitterImage = url.includes("pbs.twimg.com");
            if (!isTwitterImage) return url;

            return url.replace("_normal", "_400x400");
          }

          if (!twitterUser) {
            // Whitelist check is handled in signIn callback

            // Create new user without email
             twitterUser = await prisma.user.create({
              data: {
                name: user.name || "Twitter User",
                username: siteUsername,
                xAccount: twitterUsername, // Store the Twitter username without @
                authenticatedType: "social",
                avatar: getHighResTwitterImage(user?.image || null),
                twitterId: account.providerAccountId,
                supabaseUserId: uuidv4(),
                email: (profile as any)?.data?.email || null,
              },
            });

            if (!twitterUser?.walletAddress) {
              const response = await userService.getAddress(twitterUser.id);
              await updateUserWallet(twitterUser.id as string, {
                walletAddress: response.address,
                walletType: response?.walletType || "",
              });
            }

            // Set token data for new user
            token.userId = twitterUser.id.toString();
            token.email = twitterUser.email || undefined;
            token.name = twitterUser.name;
            token.twitterId = account.providerAccountId;
          } else {
            // Whitelist check is handled in signIn callback

            // Update existing Twitter user
            await prisma.user.update({
              where: { twitterId: account.providerAccountId },
              data: {
                name: user.name || twitterUser.name,
                username: twitterUser.username || siteUsername,
                xAccount: twitterUsername,
                avatar:
                  getHighResTwitterImage(user?.image || null) ||
                  twitterUser.avatar,
                email:
                  (profile as any)?.data?.email || twitterUser.email,
              },
            });


            // Set token data for existing user
            token.userId = twitterUser.id.toString();
            token.email = twitterUser.email || undefined;
            token.name = twitterUser.name;
            token.twitterId = account.providerAccountId;
          }

          if (!twitterUser?.walletAddress) {
              const response = await userService.getAddress(
                twitterUser.id
              );
              await updateUserWallet(twitterUser.id as string, {
                walletAddress: response.address,
                walletType: response?.walletType || "",
              });
          }

        } catch (error) {
          console.error("Error in JWT callback for Twitter:", error);
          // Don't throw the error, just log it and continue
          // This prevents the entire authentication from failing
        }
      }

      // For credentials provider
      if (account?.provider === "credentials" && user) {
        // console.log("JWT callback for credentials user:", { user, account });

        // Check if we're in a linking context (Twitter data exists in token)
        if (token.isLinking && token.linkingUserId && token.twitterId) {
          // console.log(
          //   "Credentials sign-in during linking, preserving linking context"
          // );
          // Keep the linking context and set the credentials user info
          token.userId = token.linkingUserId; // Keep the target user ID
          token.email = user.email;
          token.name = user.name;
          token.credentials = true;
          token.image = (user as any)?.image;
          // Don't clear the linking context yet - let the callback handle it
          return token;
        }

        // Normal credentials sign-in
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.credentials = true;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).twitterId =
          (token.twitterId as string) || undefined;
        session.user.image = (token.image as string) || undefined;

        // Also set userId directly on session object for easier access
        (session as any).userId = token.userId as string;

        // Expose linking information to the client
        if (token.isLinking) {
          (session as any).isLinking = token.isLinking;
          (session as any).linkingUserId = token.linkingUserId;
          (session as any).twitterUsername = token.twitterUsername;
        }

        // Include error information if present
        if (token.errorCode) {
          (session as any).errorCode = token.errorCode;
          (session as any).errorMessage = token.errorMessage;
        }
      }

      return session;
    },

    // async jwt({ token, user, account }) {
    //   console.log("Jwt----------", { token, user, account });

    //   if (user) {
    //     token.userId = user.id;
    //   }
    //   if (account?.provider === "credentials") {
    //     token.credentials = true;
    //   }
    //   return token;
    // },

    // async session({ session, token }) {
    //   console.log("session----------", { session, token });

    //   if (token) {
    //     session.user.id = token.userId as string;
    //   }
    //   return session;
    // },
  },
  events: {
    async signIn() {
      // console.log("Sign in event");
    },
    async signOut() {
      // console.log("Sign out event");
    },
  },
});
