"use client";

import { useAuthContext } from "@/context/AuthProvider";
import { useEffect, useState } from "react";
import { getAuthErrorMessage, AuthErrorCode } from "@/utils/auth-errors";

export function useAuthErrors() {
  const { session } = useAuthContext();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session && (session as unknown as Record<string, unknown>)?.errorCode) {
      const code = (session as unknown as Record<string, unknown>).errorCode as string;
      const message = (session as unknown as Record<string, unknown>).errorMessage as string;
      
      setErrorCode(code);
      setErrorMessage(message || getAuthErrorMessage(code as AuthErrorCode));
      
      // Clear the error from session after reading it
      // This prevents the error from persisting across page loads
      setTimeout(() => {
        setErrorCode(null);
        setErrorMessage(null);
      }, 100);
    }
  }, [session]);

  const clearError = () => {
    setErrorCode(null);
    setErrorMessage(null);
  };

  const getError = () => {
    return {
      code: errorCode,
      message: errorMessage,
      hasError: !!errorCode,
    };
  };

  return {
    errorCode,
    errorMessage,
    hasError: !!errorCode,
    clearError,
    getError,
  };
} 
