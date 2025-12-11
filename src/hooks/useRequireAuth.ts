"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthProvider";
import { useSession } from "next-auth/react";

interface UseRequireAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  requireAuth?: boolean;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { session, isAuthenticated } = useAuthContext();
  const { status } = useSession();
  const router = useRouter();
  const { 
    redirectTo = "/", 
    redirectIfAuthenticated = false,
    requireAuth = false
  } = options;

  useEffect(() => {
    // For redirectIfAuthenticated, wait for loading to complete
    if (redirectIfAuthenticated && status === "loading") return;

    // For requireAuth, we can redirect immediately if we know the user is not authenticated
    if (requireAuth && status === "unauthenticated") {
      router.replace(redirectTo);
      return;
    }

    // If we have a session and know the authentication status
    if (status !== "loading") {
      if (redirectIfAuthenticated) {
        // Redirect to home if user IS authenticated (for login/signup pages)
        if (isAuthenticated) {
          router.replace(redirectTo);
        }
      } else if (requireAuth) {
        // Only redirect if explicitly required AND user is NOT authenticated
        if (!isAuthenticated) {
          router.replace(redirectTo);
        }
      }
    }
    // If requireAuth is false, don't redirect at all
  }, [session, status, redirectTo, redirectIfAuthenticated, requireAuth, router, isAuthenticated]);

  return {
    isAuthenticated,
    isLoading: status === "loading",
    user: session?.user,
  };
} 
