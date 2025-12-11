import { WhitelistService } from "@/services/whitelistService";
import { prisma } from "@/prisma";

describe("WhitelistService", () => {
  const testEmail = "test@example.com";
  const testTwitterId = "123456789";

  beforeEach(async () => {
    // Clean up any existing test data
    await prisma.whitelist_entries.deleteMany({
      where: {
        OR: [
          { email: testEmail },
          { twitterId: testTwitterId }
        ]
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.whitelist_entries.deleteMany({
      where: {
        OR: [
          { email: testEmail },
          { twitterId: testTwitterId }
        ]
      }
    });
    await prisma.$disconnect();
  });

  describe("isEmailWhitelisted", () => {
    it("should return false for non-whitelisted email", async () => {
      const result = await WhitelistService.isEmailWhitelisted(testEmail);
      expect(result).toBe(false);
    });

    it("should return true for whitelisted email", async () => {
      // Add email to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          email: testEmail,
          isActive: true,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.isEmailWhitelisted(testEmail);
      expect(result).toBe(true);
    });

    it("should return false for inactive whitelist entry", async () => {
      // Add inactive email to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          email: testEmail,
          isActive: false,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.isEmailWhitelisted(testEmail);
      expect(result).toBe(false);
    });
  });

  describe("isTwitterIdWhitelisted", () => {
    it("should return false for non-whitelisted Twitter ID", async () => {
      const result = await WhitelistService.isTwitterIdWhitelisted(testTwitterId);
      expect(result).toBe(false);
    });

    it("should return true for whitelisted Twitter ID", async () => {
      // Add Twitter ID to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          twitterId: testTwitterId,
          isActive: true,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.isTwitterIdWhitelisted(testTwitterId);
      expect(result).toBe(true);
    });
  });

  describe("isUserWhitelisted", () => {
    it("should return false when neither email nor Twitter ID provided", async () => {
      const result = await WhitelistService.isUserWhitelisted();
      expect(result).toBe(false);
    });

    it("should return true when email is whitelisted", async () => {
      // Add email to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          email: testEmail,
          isActive: true,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.isUserWhitelisted(testEmail);
      expect(result).toBe(true);
    });

    it("should return true when Twitter ID is whitelisted", async () => {
      // Add Twitter ID to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          twitterId: testTwitterId,
          isActive: true,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.isUserWhitelisted(undefined, testTwitterId);
      expect(result).toBe(true);
    });

    it("should return true when either email or Twitter ID is whitelisted", async () => {
      // Add email to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          email: testEmail,
          isActive: true,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.isUserWhitelisted(testEmail, testTwitterId);
      expect(result).toBe(true);
    });

    it("should return false when neither email nor Twitter ID is whitelisted", async () => {
      const result = await WhitelistService.isUserWhitelisted(testEmail, testTwitterId);
      expect(result).toBe(false);
    });
  });

  describe("addToWhitelist", () => {
    it("should add email to whitelist", async () => {
      const result = await WhitelistService.addToWhitelist(testEmail);
      
      expect(result.email).toBe(testEmail);
      expect(result.isActive).toBe(true);
      
      // Verify it was actually added
      const entry = await prisma.whitelist_entries.findUnique({
        where: { email: testEmail }
      });
      expect(entry).toBeTruthy();
      expect(entry?.isActive).toBe(true);
    });

    it("should add Twitter ID to whitelist", async () => {
      const result = await WhitelistService.addToWhitelist(undefined, testTwitterId);
      
      expect(result.twitterId).toBe(testTwitterId);
      expect(result.isActive).toBe(true);
      
      // Verify it was actually added
      const entry = await prisma.whitelist_entries.findUnique({
        where: { twitterId: testTwitterId }
      });
      expect(entry).toBeTruthy();
      expect(entry?.isActive).toBe(true);
    });

    it("should throw error when neither email nor Twitter ID provided", async () => {
      await expect(WhitelistService.addToWhitelist()).rejects.toThrow(
        "Either email or twitterId must be provided"
      );
    });
  });

  describe("removeFromWhitelist", () => {
    it("should deactivate email whitelist entry", async () => {
      // First add to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          email: testEmail,
          isActive: true,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.removeFromWhitelist(testEmail);
      expect(result).toBe(true);

      // Verify it was deactivated
      const entry = await prisma.whitelist_entries.findUnique({
        where: { email: testEmail }
      });
      expect(entry?.isActive).toBe(false);
    });

    it("should deactivate Twitter ID whitelist entry", async () => {
      // First add to whitelist
      await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          twitterId: testTwitterId,
          isActive: true,
          updated_at: new Date()
        }
      });

      const result = await WhitelistService.removeFromWhitelist(undefined, testTwitterId);
      expect(result).toBe(true);

      // Verify it was deactivated
      const entry = await prisma.whitelist_entries.findUnique({
        where: { twitterId: testTwitterId }
      });
      expect(entry?.isActive).toBe(false);
    });
  });
});
