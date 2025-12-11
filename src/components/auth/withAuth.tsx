"use client";

import { ComponentType, useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface WithAuthOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  requireAuth?: boolean;
  loadingComponent?: React.ComponentType;
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = "/",
    redirectIfAuthenticated = false,
    requireAuth = false,
    loadingComponent: LoadingComponent,
  } = options;

  function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useRequireAuth({
      redirectTo,
      redirectIfAuthenticated,
      requireAuth,
    });

    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
      // For redirectIfAuthenticated, wait for loading to complete
      if (redirectIfAuthenticated && isLoading) return;

      // For requireAuth, we can determine rendering immediately if we know the user is not authenticated
      if (requireAuth && !isLoading && !isAuthenticated) {
        setShouldRender(false);
        return;
      }

      // Only render the component after authentication check is complete
      if (!isLoading) {
        if (redirectIfAuthenticated) {
          // For pages that redirect if authenticated (like login pages)
          setShouldRender(!isAuthenticated);
        } else if (requireAuth) {
          // For protected pages - only render if authenticated
          setShouldRender(isAuthenticated);
        } else {
          // If no auth requirements, always render
          setShouldRender(true);
        }
      }
    }, [isAuthenticated, isLoading]);

    // Show loading component only when authenticated and loading user data
    if (isLoading && (isAuthenticated || !requireAuth)) {
      return LoadingComponent ? <LoadingComponent /> : null;
    }

    // Don't render if authentication requirements aren't met
    if (!shouldRender) {
      return null;
    }

    // Render the wrapped component if authentication requirements are met
    return <WrappedComponent {...props} />;
  }

  // Set display name for debugging
  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAuthComponent;
} 
