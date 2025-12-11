/**
 * Username validation utilities
 * These functions provide consistent username validation across frontend and backend
 */

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a username according to the application's rules
 * @param username - The username to validate
 * @returns UsernameValidationResult with validation status and error message if invalid
 */
export function validateUsername(username: string): UsernameValidationResult {
  // Check if username is provided
  if (!username || username.trim().length === 0) {
    return {
      isValid: false,
      error: "Username is required"
    };
  }

  // Check minimum length
  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters long"
    };
  }

  // Check maximum length
  if (username.length > 20) {
    return {
      isValid: false,
      error: "Username must be 20 characters or less"
    };
  }

  // Check format - only allow alphanumeric, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: "Username can only contain letters, numbers, underscores, and hyphens"
    };
  }

  // Check that username doesn't start or end with special characters
  if (username.startsWith('-') || username.startsWith('_') || username.endsWith('-') || username.endsWith('_')) {
    return {
      isValid: false,
      error: "Username cannot start or end with hyphens or underscores"
    };
  }

  // Check for consecutive special characters
  if (username.includes('--') || username.includes('__') || username.includes('-_') || username.includes('_-')) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive hyphens or underscores"
    };
  }

  return { isValid: true };
}

/**
 * Throws an error if username is invalid (for backend use)
 * @param username - The username to validate
 * @throws Error if username is invalid
 */
export function validateUsernameOrThrow(username: string): void {
  const result = validateUsername(username);
  if (!result.isValid) {
    throw new Error(result.error);
  }
}

/**
 * Checks if a username contains only valid characters (for real-time input validation)
 * @param username - The username to check
 * @returns boolean indicating if the username contains only valid characters
 */
export function isValidUsernameCharacters(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]*$/;
  return usernameRegex.test(username);
} 
