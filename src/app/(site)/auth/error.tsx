"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import PageLayout from '@/components/PageLayout';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="max-w-md w-full bg-[#18182A] p-8 rounded-2xl border border-white/10">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="mb-6 text-red-400">
            {error || 'There was a problem with the authentication process. This could be due to an expired link or an invalid request.'}
          </p>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Common Solutions:</h2>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-300">
              <li>Make sure your Twitter app has &rdquo;Request email from users&rdquo; enabled in the settings</li>
              <li>Check that your Twitter Developer Portal callback URL is correct</li>
              <li>Try signing in again</li>
            </ul>
          </div>
          <Link href="/" className="block w-full">
            <Button variant="primary" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
