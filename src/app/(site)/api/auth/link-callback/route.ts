/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.redirect(new URL("/profile?error=missing_user_id", request.url));
    }

    // Get the current session to access the Twitter account info
    const session = await auth() as any;
    
    // Check if we have Twitter data in the session (from linking flow)
    const twitterId = session?.user?.twitterId;
    const twitterUsername = session?.user?.name;
    
    if (!twitterId) {
      return NextResponse.redirect(new URL("/profile?error=no_twitter_data", request.url));
    }

    // Check if this is a linking session
    const isLinking = (session as any)?.isLinking;
    const linkingUserId = (session as any)?.linkingUserId;

    console.log("Link callback - linking Twitter account:", {
      userId,
      linkingUserId,
      isLinking,
      twitterId,
      twitterUsername,
      sessionData: session
    });

    // If this is a linking session, use the linkingUserId as the target
    const targetUserId = isLinking && linkingUserId ? linkingUserId : userId;

    // Check if this Twitter account is already linked to any user
    const existingTwitterUser = await prisma.user.findFirst({
      where: {
        twitterId: twitterId,
      },
    });

    if (existingTwitterUser) {
      // Check if the Twitter account is already linked to the target user
      if (existingTwitterUser.id === targetUserId) {
        console.log("Twitter account already linked to target user");
        // Update the existing link
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            xAccount: twitterUsername?.replace("@", "") || null,
          },
        });
      } else {
        // Twitter account is linked to a different user
        console.log("Twitter account already linked to another user:", existingTwitterUser.id);
        return NextResponse.redirect(new URL("/profile?error=twitter_already_linked", request.url));
      }
    } else {
      // Link the Twitter account to the target user
      console.log("Linking Twitter account to target user:", targetUserId);
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          twitterId: twitterId,
          xAccount: twitterUsername?.replace("@", "") || null,
        },
      });
    }

    // Redirect back to profile with success message
    return NextResponse.redirect(new URL("/profile?linked=success", request.url));
  } catch (error) {
    console.error("Error in link callback:", error);
    return NextResponse.redirect(new URL("/profile?error=linking_failed", request.url));
  }
} 
