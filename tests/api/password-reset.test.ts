// @ts-nocheck
import { POST, PATCH } from "@/app/(site)/api/password-reset/route";
import { NextRequest } from "next/server";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

import prisma from "@/lib/prisma";

// Instead of mocking the entire module (which leaks into other test suites),
// spy on just the methods we need. This keeps the real implementation
// available for integration tests that run later.

const findUniqueSpy = jest.spyOn(prisma.user, "findUnique");
const findFirstSpy = jest.spyOn(prisma.user, "findFirst");
const updateSpy = jest.spyOn(prisma.user, "update");

jest.mock("@/utils/passwordResetEmail", () => {
  return {
    __esModule: true,
    passwordResetEmail: jest.fn(),
  };
});

const { passwordResetEmail } = require("@/utils/passwordResetEmail");

describe("/api/password-reset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("returns 400 when email missing", async () => {
      const mockReq = { json: async () => ({}) } as unknown as NextRequest;
      const res = await POST(mockReq);
      expect(res.status).toBe(400);
    });

    it("sends reset email and hashes token when user exists", async () => {
      (findUniqueSpy as jest.Mock).mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });
      (updateSpy as jest.Mock).mockResolvedValue({});
      const mockReq = {
        json: async () => ({ email: "test@example.com" }),
      } as unknown as NextRequest;
      const res = await POST(mockReq);
      expect(res.status).toBe(200);
      expect(updateSpy).toHaveBeenCalled();
      expect(passwordResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.any(String)
      );
    });
  });

  describe("PATCH", () => {
    it("returns 400 when token or password missing", async () => {
      const mockReq = { json: async () => ({}) } as unknown as NextRequest;
      const res = await PATCH(mockReq);
      expect(res.status).toBe(400);
    });

    it("resets password when token valid", async () => {
      (findFirstSpy as jest.Mock).mockResolvedValue({ id: "1" });
      (updateSpy as jest.Mock).mockResolvedValue({});
      const mockReq = {
        json: async () => ({ token: "abc", password: "NewPass123" }),
      } as unknown as NextRequest;
      const res = await PATCH(mockReq);
      expect(res.status).toBe(200);
      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
