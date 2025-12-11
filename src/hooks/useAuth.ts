import type { Prisma } from "@/generated/prisma";
import { useCallback, useMemo, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { signOut as signOutAuth, signIn as signInAuth } from "next-auth/react";
import { useSession } from "next-auth/react";

interface SessionUser {
  id: string;
  image: string;
  name?: string;
  email?: string;
  oauthInProgress?: boolean;
  walletAddress?: string;
  createdAt?: string;
  socials?: {
    x?: string;
    facebook?: string;
    telegram?: string;
    discord?: string;
  };
}

export type UserWithNotifications = Prisma.UserGetPayload<{
  include: {
    positions: true;
    notifications: true;
    activities: true;
    balance: true;
  };
}>;

export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  dbUser: UserWithNotifications | null;
  session: Session | null;
  isAuthenticated: boolean;
  userBalance: number | undefined;
}

export interface UserMetadata {
  name?: string;
  preferred_username?: string;
  avatar_url?: string;
  wallet_address?: string;
  socials?: {
    x?: string;
    facebook?: string;
    telegram?: string;
    discord?: string;
  };
}

export function useAuth() {
  const isLoggingOutRef = useRef(false);
  const queryClient = useQueryClient();

  // Move useSession to the top level
  const { data: session, status, update: updateSession } = useSession();

  // Check if we're in an OAuth callback state
  const isOAuthCallback = useMemo(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      // Check for OAuth callback parameters
      const hasCode = urlParams.has("code");
      const hasError = urlParams.has("error");
      const hasState = urlParams.has("state");

      // Also check if we're on the callback URL path
      const isCallbackPath =
        window.location.pathname.includes("/api/auth/callback") ||
        window.location.pathname.includes("/auth/callback");

      return hasCode || hasError || hasState || isCallbackPath;
    }
    return false;
  }, []);

  // Function to fetch user data
  const fetchUserData = useCallback(async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return response.json();
  }, []);

  // Get user ID from session token or session user
  const userId = useMemo(() => {
    // Try to get userId from session token first (more reliable)
    if (session && typeof session === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionAny = session as any;
      // Check for userId in the session object (set by session callback)
      if (sessionAny.userId) {
        return sessionAny.userId;
      }
      // Check for userId in the user object (set by session callback)
      if (sessionAny.user?.id) {
        return sessionAny.user.id;
      }
    }
    return undefined;
  }, [session]);

  // Use TanStack Query for user data
  const { data: dbUser, refetch: refetchUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => {
      if (!userId) throw new Error("No user ID");
      return fetchUserData(userId);
    },
    enabled: !!userId && !isLoggingOutRef.current,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const refreshDbUser = useCallback(async () => {
    if (!userId) return;
    // console.log("Refreshing database user", userId);
    await refetchUser();
  }, [userId, refetchUser]);

  const signIn = useCallback(
    async (provider: string, options?: Record<string, unknown>) => {
      return await signInAuth(provider, options);
    },
    []
  );

  const signInWithTwitter = useCallback(async () => {
    await signIn("twitter");
  }, [signIn]);

  const signOut = useCallback(async () => {
    try {
      isLoggingOutRef.current = true;

      // Clear predicted auth state from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("predicted_auth_state");
        localStorage.removeItem("authState");
      }

      // Sign out without redirecting - let the user stay on the current page
      await signOutAuth({ redirect: false });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateUser = useCallback(async (metadata: UserMetadata) => {
    // Implementation for updating user metadata
  }, []);

  // Get wallet balance if wallet address exists
  const walletAddress = dbUser?.walletAddress as `0x${string}` | undefined;
  const { data: usdBalance } = useUSDCBalance(
    isLoggingOutRef.current ? undefined : walletAddress
  );

  const refreshUserBalance = useCallback(async () => {
    if (!userId || !walletAddress) return;
    // console.log("Refreshing user balance", userId, walletAddress);
    
    // Invalidate and refetch both user data and USDC balance
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["usdcBalance"] });
    queryClient.invalidateQueries({ queryKey: ["usdcBalance", walletAddress] });
    
    // Force refetch both queries
    await Promise.all([
      refetchUser(),
      queryClient.refetchQueries({ queryKey: ["usdcBalance", walletAddress] })
    ]);
  }, [userId, walletAddress, refetchUser, queryClient]);

  // Determine loading state
  const isLoading = status === "loading" || isOAuthCallback;

  return {
    user: (session?.user as SessionUser) || null,
    session: (session as unknown as Session) || null,
    dbUser: dbUser || null,
    isLoading,
    isAuthenticated: !!session?.user,
    userBalance: usdBalance,
    signInWithTwitter,
    signIn,
    signOut,
    updateUser,
    refreshDbUser,
    refreshUserBalance,
    updateSession,
    walletAddress,
    sessionStatus: status,
  };
}
