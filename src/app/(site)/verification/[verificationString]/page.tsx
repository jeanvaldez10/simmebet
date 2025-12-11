"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Button from "@/components/Button";
import { signIn } from "next-auth/react";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [counter, setCounter] = useState(5);
  const userId = params.verificationString as string;
  const emailString = searchParams.get("emailString") as string;

  const [status, setStatus] = useState<"loading" | "success" | "error" | "verified_but_not_logged_in">(
    "loading"
  );

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("/api/verify-email", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, emailString }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Verification error:", errorData);
          throw new Error(errorData.error || "Verification failed");
        }

        const data = await res.json();
        
        // After successful verification, try to automatically log the user in
        if (!data.user?.email) {
          setStatus("error");
          return;
        }

        try {
          
          // Try to sign in using the user's email
          // Since the email is now verified, this should work
          const signInResult = await signIn("credentials", {
            email: data.user.email,
            password: "VERIFICATION_LOGIN", // Special password for verification login
            redirect: false,
            callbackUrl: "/",
          });

          if (signInResult?.ok) {
            setStatus("success");
            return;
          } else {
            // Email verified but auto-login failed
            setStatus("verified_but_not_logged_in");
            return;
          }
        } catch {
          // Email verified but auto-login failed
          setStatus("verified_but_not_logged_in");
          return;
        }

        setStatus("success");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    };

    if (userId && emailString) {
      verify();
    } else {
      setStatus("error");
    }
  }, [userId, emailString]);

  useEffect(() => {
    if (status === "success" && counter > 0) {
      const timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (status === "success" && counter === 0) {
      router.push("/");
    }
  }, [status, counter, router]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-[#1A1A2A] rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center">
            {status === "loading" && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Verifying Your Email
                </h1>
                <p className="text-gray-400">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Email Verified Successfully!
                </h1>
                <p className="text-gray-400 mb-4">
                  Your email address has been confirmed. You can now access all features.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to home page in {counter} seconds...
                </p>
                <Button
                  variant="primary"
                  onClick={handleGoHome}
                  className="w-full mt-4"
                >
                  Go Home Now
                </Button>
              </div>
            )}

            {status === "verified_but_not_logged_in" && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Email Verified Successfully!
                </h1>
                <p className="text-gray-400 mb-4">
                  Your email address has been confirmed, but we couldn&apos;t automatically log you in. Please log in manually to access your account.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={() => router.push("/auth/signin")}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleGoHome}
                    className="w-full"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Verification Failed
                </h1>
                <p className="text-gray-400 mb-4">
                  We couldn&apos;t verify your email address. This could be due to an expired or invalid verification link.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={handleTryAgain}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleGoHome}
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Go Home
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
