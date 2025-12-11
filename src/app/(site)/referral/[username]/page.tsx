"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ReferralPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;

  useEffect(() => {
    if (username) {
      // Store the referral code in localStorage
      localStorage.setItem("referralCode", username);
      
      // Set expiry (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem("referralCodeExpiry", expiryDate.toISOString());
      
      // Redirect to home page with signup modal
      router.push("/?signup=true&ref=" + username);
    }
  }, [username, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500 mx-auto"></div>
        <p className="text-gray-400">
          {username ? `Setting up your referral from ${username}...` : "Loading..."}
        </p>
      </div>
    </div>
  );
}

