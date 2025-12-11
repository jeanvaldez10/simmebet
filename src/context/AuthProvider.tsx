'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useAuth, AuthState } from '@/hooks/useAuth';
// import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserMetadata {
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

interface AuthContextType extends AuthState {
  signInWithTwitter: () => Promise<void>;
  signIn: (provider: string, options?: Record<string, unknown>) => Promise<unknown>;
  signOut: () => Promise<void>;
  updateUser: (metadata: UserMetadata) => Promise<void>;
  refreshDbUser: () => Promise<void>;
  updateSession: () => Promise<unknown>;
  isOAuthInProgress: boolean;
  setOAuthInProgress: (inProgress: boolean) => void;
  sessionStatus: string;
  predictedAuthState: 'authenticated' | 'unauthenticated' | 'loading';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [isOAuthInProgress, setIsOAuthInProgress] = useState(false);
  
  // Initialize predicted auth state immediately from localStorage - no window check to eliminate delay
  const [predictedAuthState, setPredictedAuthState] = useState<'authenticated' | 'unauthenticated' | 'loading'>(() => {
    // Always return 'loading' during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return 'loading';
    }
    try {
      const storedAuthState = localStorage.getItem('predicted_auth_state');
      if (storedAuthState === 'authenticated' || storedAuthState === 'unauthenticated') {
        return storedAuthState;
      }
      
      // If no stored state, check for session cookies/tokens to make a better prediction
      // Check for NextAuth session cookie
      const hasNextAuthCookie = document.cookie.includes('next-auth.session-token') || 
                               document.cookie.includes('__Secure-next-auth.session-token');
      
      // Check for any auth-related cookies
      const hasAuthCookies = document.cookie.includes('auth') || 
                           document.cookie.includes('session') ||
                           document.cookie.includes('token');
      
      // If we have auth cookies, predict authenticated, otherwise predict unauthenticated
      if (hasNextAuthCookie || hasAuthCookies) {
        return 'authenticated';
      } else {
        return 'unauthenticated';
      }
    } catch (error) {
      // Ignore localStorage errors during SSR
      console.warn("Error predicting auth state", error);
      return 'unauthenticated'; // Default to unauthenticated on error
    }
  });
  
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Immediate session status check on mount to prevent shimmer flash
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      // Immediately check session status and update predicted state
      if (auth.sessionStatus === 'unauthenticated') {
        setPredictedAuthState('unauthenticated');
        localStorage.setItem('predicted_auth_state', 'unauthenticated');
      } else if (auth.sessionStatus === 'authenticated') {
        setPredictedAuthState('authenticated');
        localStorage.setItem('predicted_auth_state', 'authenticated');
      }
    }
  }, [isMounted, auth.sessionStatus]);

  // Update predicted auth state when actual auth state changes
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      // Immediately update predicted state based on session status
      if (auth.sessionStatus === 'unauthenticated') {
        setPredictedAuthState('unauthenticated');
        localStorage.setItem('predicted_auth_state', 'unauthenticated');
      } else if (auth.sessionStatus === 'authenticated' || auth.isAuthenticated) {
        setPredictedAuthState('authenticated');
        localStorage.setItem('predicted_auth_state', 'authenticated');
      } else if (auth.sessionStatus === 'loading') {
        // Only show loading if we don't have a stored prediction
        const storedAuthState = localStorage.getItem('predicted_auth_state');
        if (!storedAuthState) {
          setPredictedAuthState('loading');
        }
      }
    }
  }, [auth.isAuthenticated, auth.sessionStatus, isMounted]);

  // Clear predicted auth state when session becomes unauthenticated
  useEffect(() => {
    if (isMounted && auth.sessionStatus === 'unauthenticated') {
      setPredictedAuthState('unauthenticated');
      if (typeof window !== 'undefined') {
        localStorage.setItem('predicted_auth_state', 'unauthenticated');
      }
    }
  }, [auth.sessionStatus, isMounted]);

  const setOAuthInProgress = useCallback((inProgress: boolean) => {
    setIsOAuthInProgress(inProgress);
    // Persist OAuth state to localStorage
    if (typeof window !== 'undefined') {
      if (inProgress) {
        localStorage.setItem('oauth_in_progress', 'true');
      } else {
        localStorage.removeItem('oauth_in_progress');
      }
    }
  }, []);

  // Detect OAuth callback on page load
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      const hasError = urlParams.has('error');
      const hasState = urlParams.has('state');
      
      // Check if we're on the callback URL path
      const isCallbackPath = window.location.pathname.includes('/api/auth/callback') || 
                           window.location.pathname.includes('/auth/callback') ||
                           window.location.pathname.includes('/api/auth/[...nextauth]');
      
      // Check if we're on the root path with OAuth parameters (common NextAuth pattern)
      const isRootWithOAuthParams = window.location.pathname === '/' && (hasCode || hasError || hasState);
      
      // Don't treat error pages as OAuth callbacks
      const isErrorPage = window.location.pathname === '/auth/error' || 
                         window.location.pathname.includes('/error');
      
      // Check for OAuth state validation errors
      const isOAuthStateError = hasError && (
        urlParams.get('error') === 'InvalidCheck' || 
        urlParams.get('error') === 'Configuration'
      );
      
      // Consider it an OAuth callback if we have OAuth parameters and it's not a config error
      const isOAuthCallback = (hasCode || hasError || hasState || isCallbackPath || isRootWithOAuthParams) && 
                              !isErrorPage && 
                              !isOAuthStateError;
      
      // If there's a configuration or state error, clear OAuth states
      if (isOAuthStateError) {
        // console.log('AuthProvider: OAuth state/configuration error detected, clearing OAuth states');
        setIsOAuthInProgress(false);
        localStorage.removeItem('oauth_in_progress');
        return;
      }
      
      // Check URL parameters first
      if (isOAuthCallback) {
        setIsOAuthInProgress(true);
      } else {
        // Fallback to localStorage
        const storedOAuthState = localStorage.getItem('oauth_in_progress');
        if (storedOAuthState === 'true') {
          setIsOAuthInProgress(true);
        }
      }
    }
  }, [isMounted]);

  // Clear OAuth state after timeout to prevent it from getting stuck
  useEffect(() => {
    if (isOAuthInProgress) {
      const timeout = setTimeout(() => {
        setIsOAuthInProgress(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('oauth_in_progress');
        }
      }, 30000); // 30 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isOAuthInProgress]);

  // Clear OAuth progress state when session becomes unauthenticated
  useEffect(() => {
    if (isOAuthInProgress && auth.sessionStatus === 'unauthenticated') {
      // console.log('AuthProvider: Clearing OAuth progress state - session is unauthenticated');
      setIsOAuthInProgress(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oauth_in_progress');
      }
    }
  }, [isOAuthInProgress, auth.sessionStatus]);

  // Clear OAuth progress state when user is definitely not authenticated
  useEffect(() => {
    if (isOAuthInProgress && !auth.isAuthenticated && auth.sessionStatus !== 'loading') {
      // console.log('AuthProvider: Clearing OAuth progress state - user is not authenticated');
      setIsOAuthInProgress(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oauth_in_progress');
      }
    }
  }, [isOAuthInProgress, auth.isAuthenticated, auth.sessionStatus]);

  return (
    <AuthContext.Provider value={{ 
      ...auth, 
      isOAuthInProgress, 
      setOAuthInProgress, 
      sessionStatus: auth.sessionStatus,
      predictedAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
