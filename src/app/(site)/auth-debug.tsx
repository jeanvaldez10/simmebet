'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthProvider';
import Button from '@/components/Button';

export default function AuthDebug() {
  const { user, session, isLoading, isAuthenticated, signInWithTwitter, signOut } = useAuthContext();
  const [sessionJSON, setSessionJSON] = useState<string>('');
  const [userJSON, setUserJSON] = useState<string>('');

  useEffect(() => {
    if (session) {
      setSessionJSON(JSON.stringify(session, null, 2));
    } else {
      setSessionJSON('No active session');
    }

    if (user) {
      setUserJSON(JSON.stringify(user, null, 2));
    } else {
      setUserJSON('No user data');
    }
  }, [user, session]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Auth Status</h2>
        <p className="mb-2">Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p className="mb-4">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            variant="primary" 
            onClick={signInWithTwitter}
          >
            Sign In with Twitter
          </Button>
          
          <Button 
            variant="primary" 
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">User Data</h2>
          <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">
            {userJSON}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">Session Data</h2>
          <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm">
            {sessionJSON}
          </pre>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Common Issues</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Make sure the Twitter callback URL in your Twitter Developer Portal is <code className="bg-gray-800 px-2 py-1 rounded text-green-400">https://girjiysdwesteyedywlb.supabase.co/auth/v1/callback</code></li>
          <li>Verify you&rsquo;ve added <code className="bg-gray-800 px-2 py-1 rounded text-green-400">http://localhost:4000/api/auth/callback</code> to the redirect URLs in Supabase Authentication settings</li>
          <li>Check your browser console for any errors</li>
          <li>Ensure &rdquo;Request email from users&rdquo; is enabled in your Twitter app settings</li>
        </ul>
      </div>
    </div>
  );
} 
