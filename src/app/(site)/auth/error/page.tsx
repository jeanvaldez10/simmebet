'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { useEffect, useState } from 'react';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [countdown, setCountdown] = useState<number | null>(null);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'This account is already linked to another email address. Please sign in with the original method or contact support.';
      case 'AccessDenied':
        return 'Access denied. Please try again.';
      case 'Verification':
        return 'Verification failed. Please try again.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Twitter is currently experiencing high traffic. Please wait a few minutes and try again. This is a temporary limitation from Twitter\'s servers.';
      case 'OAUTH_STATE_ERROR':
        return 'There was an issue with the authentication process. Please try logging in again.';
      case 'Configuration':
        return 'Authentication service is not properly configured. Please contact support.';
      case 'InvalidCheck':
        return 'Authentication session expired. Please try signing in again.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case 'RATE_LIMIT_EXCEEDED':
        return 'Rate Limit Exceeded';
      case 'OAUTH_STATE_ERROR':
        return 'Authentication Error';
      case 'Configuration':
        return 'Configuration Error';
      case 'InvalidCheck':
        return 'Session Expired';
      default:
        return 'Authentication Error';
    }
  };

  const isRateLimitError = error === 'RATE_LIMIT_EXCEEDED';

  // Start countdown for rate limit errors
  useEffect(() => {
    if (isRateLimitError) {
      setCountdown(60); // 60 seconds countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev > 0) {
            return prev - 1;
          }
          return null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isRateLimitError]);

  const handleRetry = () => {
    // Clear any stored OAuth state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oauth_in_progress');
    }
    // Redirect to signin page
    window.location.href = '/auth/signin';
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#1A1A2A] rounded-2xl p-8 border border-white/10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {getErrorTitle(error)}
            </h1>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-4">
                {getErrorMessage(error)}
              </p>
              
              {isRateLimitError && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-400 text-sm font-medium">
                      Twitter Rate Limit
                    </span>
                  </div>
                  {countdown !== null && countdown > 0 && (
                    <p className="text-yellow-300 text-sm">
                      You can try again in {countdown} seconds
                    </p>
                  )}
                  {countdown === 0 && (
                    <p className="text-green-300 text-sm">
                      You can now try again
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {isRateLimitError && countdown === 0 && (
                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={handleRetry}
                >
                  Try Again
                </Button>
              )}
              
              <Link href="/">
                <Button variant="secondary" className="w-full">
                  Go Home
                </Button>
              </Link>
              
              {!isRateLimitError && (
                <Link href="/auth/signin">
                  <Button variant="secondary" className="w-full">
                    Try Again
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
