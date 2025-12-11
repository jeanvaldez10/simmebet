import { validateUsername, validateUsernameOrThrow, isValidUsernameCharacters } from "@/utils/validation";

describe("Username Validation", () => {
  describe("validateUsername", () => {
    it("should return valid for valid usernames", () => {
      const validUsernames = [
        "john",
        "john_doe",
        "john-doe",
        "john123",
        "john_doe_123",
        "john-doe-123",
        "a1b2c3",
        "user_name",
        "user-name"
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it("should return invalid for usernames that are too short", () => {
      const result = validateUsername("ab");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username must be at least 3 characters long");
    });

    it("should return invalid for usernames that are too long", () => {
      const result = validateUsername("a".repeat(21));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username must be 20 characters or less");
    });

    it("should return invalid for usernames with invalid characters", () => {
      const invalidUsernames = [
        "john@doe",
        "john.doe",
        "john doe",
        "john!doe",
        "john#doe",
        "john$doe"
      ];

      invalidUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Username can only contain letters, numbers, underscores, and hyphens");
      });
    });

    it("should return invalid for usernames starting with special characters", () => {
      const result = validateUsername("_john");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username cannot start or end with hyphens or underscores");
    });

    it("should return invalid for usernames ending with special characters", () => {
      const result = validateUsername("john_");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username cannot start or end with hyphens or underscores");
    });

    it("should return invalid for usernames with consecutive special characters", () => {
      const invalidUsernames = [
        "john--doe",
        "john__doe",
        "john-_doe",
        "john_-doe"
      ];

      invalidUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Username cannot contain consecutive hyphens or underscores");
      });
    });

    it("should return invalid for empty usernames", () => {
      const result = validateUsername("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username is required");
    });

    it("should return invalid for whitespace-only usernames", () => {
      const result = validateUsername("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Username is required");
    });
  });

  describe("validateUsernameOrThrow", () => {
    it("should not throw for valid usernames", () => {
      expect(() => validateUsernameOrThrow("john_doe")).not.toThrow();
    });

    it("should throw for invalid usernames", () => {
      expect(() => validateUsernameOrThrow("jo")).toThrow("Username must be at least 3 characters long");
      expect(() => validateUsernameOrThrow("john@doe")).toThrow("Username can only contain letters, numbers, underscores, and hyphens");
    });
  });

  describe("isValidUsernameCharacters", () => {
    it("should return true for strings with only valid characters", () => {
      expect(isValidUsernameCharacters("john")).toBe(true);
      expect(isValidUsernameCharacters("john_doe")).toBe(true);
      expect(isValidUsernameCharacters("john-doe")).toBe(true);
      expect(isValidUsernameCharacters("john123")).toBe(true);
      expect(isValidUsernameCharacters("")).toBe(true);
    });

    it("should return false for strings with invalid characters", () => {
      expect(isValidUsernameCharacters("john@doe")).toBe(false);
      expect(isValidUsernameCharacters("john.doe")).toBe(false);
      expect(isValidUsernameCharacters("john doe")).toBe(false);
      expect(isValidUsernameCharacters("john!doe")).toBe(false);
    });
  });
}); 
