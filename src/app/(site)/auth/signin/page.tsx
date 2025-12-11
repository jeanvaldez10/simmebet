'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Button from '@/components/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function SignIn() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const resetSuccess = searchParams.get('resetSuccess') === 'true';
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const router = useRouter();

  // Redirect authenticated users to home page
  const { isLoading } = useRequireAuth({
    redirectIfAuthenticated: true,
    redirectTo: callbackUrl
  });

  const handleTwitterSignIn = () => {
    signIn('twitter', { callbackUrl });
  };

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
      case 'Configuration':
        return 'Authentication service is not properly configured. Please contact support.';
      case 'InvalidCheck':
        return 'Authentication session expired. Please try signing in again.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500 mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#1A1A2A] rounded-2xl p-8 border border-white/10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Sign In
            </h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  {getErrorMessage(error)}
                </p>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">
                  Your password has been reset successfully. You can now sign in.
                </p>
                <Button
                  variant="primary"
                  className="mt-4 w-full"
                  onClick={() => router.push('/?login=true')}
                >
                  Log in with your new password
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {!resetSuccess && <Button 
                variant="primary" 
                className="w-full"
                onClick={handleTwitterSignIn}
              >
                Continue with Twitter
              </Button>}
              
              <div className="text-center">
                <Link href="/" className="text-gray-400 hover:text-white text-sm">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
