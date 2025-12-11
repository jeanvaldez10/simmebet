'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UnauthorizedPage() {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification email');
      }

      toast.success('Verification email sent successfully! Check your inbox.');
      setEmailSent(true);
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#16171E] rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Email Verification Required
            </h1>
            <p className="text-gray-400 mb-6">
              Please verify your email address before continuing. Check your inbox for the verification link.
            </p>
            
            {!emailSent ? (
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 text-left">
                    Enter your email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-[#2c2f42] text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isResending}
                  />
                </div>
                
                <Button 
                  type="submit"
                  variant="primary" 
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Send Verification Link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-green-400 text-sm">
                  ✓ Verification email sent! Please check your inbox and spam folder.
                </div>
                <p className="text-gray-400 text-sm">
                  Click the verification link in the email to complete your registration.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  Send Another Email
                </Button>
              </div>
            )}
            
            <div className="mt-6 space-y-3">
              <Link href="/">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
