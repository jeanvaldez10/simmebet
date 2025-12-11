// Authentication error codes and their corresponding user-friendly messages
export const AUTH_ERROR_MESSAGES = {
  MISSING_CREDENTIALS: "Email and password are required.",
  USER_EXISTS: "User already exists with this email or username.",
  USER_NOT_FOUND: "No account found with this email or username.",
  SOCIAL_ACCOUNT: "This account was created with social login. Please use the social login option.",
  INVALID_PASSWORD: "Invalid password.",
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
  RATE_LIMIT_EXCEEDED: "Twitter is currently experiencing high traffic. Please wait a few minutes and try again. This is a temporary limitation from Twitter's servers.",
  OAUTH_STATE_ERROR: "There was an issue with the authentication process. Please try logging in again.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

// Function to get user-friendly error message from error code
export function getAuthErrorMessage(errorCode: AuthErrorCode | string): string {
  return AUTH_ERROR_MESSAGES[errorCode as AuthErrorCode] || AUTH_ERROR_MESSAGES.GENERIC_ERROR;
}

// Function to determine if an error is a specific type
export function isAuthError(errorCode: string, type: AuthErrorCode): boolean {
  return errorCode === type;
}

// Function to handle NextAuth errors and extract error codes
export function handleAuthError(result: { error?: string }, isSignUp: boolean): { errorCode: string; message: string } {
  if (!result?.error) {
    return { errorCode: "SUCCESS", message: "" };
  }

  // Handle specific NextAuth errors
  if (result.error === "AccessDenied") {
    return { errorCode: "EMAIL_NOT_VERIFIED", message: AUTH_ERROR_MESSAGES.EMAIL_NOT_VERIFIED };
  }


  if (result.error === "RATE_LIMIT_EXCEEDED") {
    return { errorCode: "RATE_LIMIT_EXCEEDED", message: AUTH_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED };
  }

  if (result.error === "OAUTH_STATE_ERROR") {
    return { errorCode: "OAUTH_STATE_ERROR", message: AUTH_ERROR_MESSAGES.OAUTH_STATE_ERROR };
  }

  if (result.error === "CredentialsSignin") {
    // For CredentialsSignin, differentiate between signup and login
    if (isSignUp) {
    // For signup, CredentialsSignin could mean user already exists
    // We'll need to check the specific case, but for now assume user exists
      return { errorCode: "USER_EXISTS", message: AUTH_ERROR_MESSAGES.USER_EXISTS };
    } else {
      // For login, CredentialsSignin could mean invalid credentials
      // We'll need to check the specific case, but for now assume invalid credentials
      return { errorCode: "INVALID_CREDENTIALS", message: "Invalid username/email or password." };
    }
  }

  // Handle custom error messages
  const errorMessage = result.error;
  for (const [code, message] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (errorMessage === message) {
      return { errorCode: code, message };
    }
  }

  return { errorCode: "GENERIC_ERROR", message: errorMessage };
} 
