'use client';

import { signIn } from "next-auth/react";

export default function TestTwitter() {
  const handleTwitterSignIn = () => {
    signIn("twitter");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#1A1A2A] rounded-2xl p-8 border border-white/10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Test Twitter OAuth
            </h1>
            
            <button
              onClick={handleTwitterSignIn}
              className="w-full py-4 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Test Twitter Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
