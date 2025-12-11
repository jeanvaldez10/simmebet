import { NextRequest } from "next/server";
import { POST } from "@/app/(site)/api/markets/route";

jest.mock("@/services/marketService", () => ({
  marketService: {
    createMarket: jest.fn().mockResolvedValue({
      market: {
        id: "test-market-id",
        contractAddress: "0x1234567890123456789012345678901234567890",
        name: "Test Market",
        status: "ACTIVE",
      },
    }),
  },
}));

jest.mock("@/auth", () => ({
  auth: jest.fn().mockResolvedValue({
    user: {
      id: "550e8400-e29b-41d4-a716-446655440000",
    },
  }),
}));

jest.mock("@vercel/blob/client", () => ({
  upload: jest.fn().mockResolvedValue({
    url: "https://blob.vercel-storage.com/test-image.jpg",
  }),
}));

global.fetch = jest.fn();

describe("/api/markets POST endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLUFF_ACTIONS_URL = "http://localhost:8000";
    process.env.BLUFF_AI_ORACLE_ADDRESS =
      "0x1111111111111111111111111111111111111111";
    process.env.MANUAL_ORACLE_ADDRESS =
      "0x2222222222222222222222222222222222222222";
    process.env.USDC_ADDRESS = "0x3333333333333333333333333333333333333333";
    process.env.BLUFF_ACTIONS_API_KEY = "test-api-key";
  });

  it("should successfully create a market with valid FormData", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        txHash:
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        marketAddress: "0x1234567890123456789012345678901234567890",
      }),
    });

    const formData = new FormData();
    formData.append("marketName", "Test Market");
    formData.append("description", "Test Description");
    formData.append("oracle", "bluff_ai_oracle");
    formData.append("eventDate", "2024-12-31T23:59:59.000Z");
    formData.append("initialBelief", "65");
    formData.append("lpAmount", "1500");
    formData.append("urls", '["https://example.com/test"]');
    formData.append("tieIsPossible", "false");
    formData.append(
      "marketImage",
      new File(["test"], "test.jpg", { type: "image/jpeg" })
    );

    const request = {
      formData: async () => formData,
    } as NextRequest;

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.market).toBeDefined();
    expect(responseData.txHash).toBeDefined();
    expect(responseData.message).toBe("Market created successfully");
  });

  it("should handle bluff-actions API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      text: async () => '{"detail": "Invalid request"}',
    });

    const formData = new FormData();
    formData.append("marketName", "Test Market");
    formData.append("description", "Test Description");
    formData.append("oracle", "bluff_ai_oracle");
    formData.append("eventDate", "2024-12-31T23:59:59.000Z");
    formData.append("initialBelief", "65");
    formData.append("lpAmount", "1500");
    formData.append("urls", '["https://example.com/test"]');
    formData.append("tieIsPossible", "false");
    formData.append(
      "marketImage",
      new File(["test"], "test.jpg", { type: "image/jpeg" })
    );

    const request = {
      formData: async () => formData,
    } as NextRequest;

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toContain("Bluff Actions API error");
  });

  it("should properly format bluff-actions request payload", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        txHash: "0xtest",
        marketAddress: "0xtest",
      }),
    });

    const formData = new FormData();
    formData.append("marketName", "Test Market");
    formData.append("description", "Test Description");
    formData.append("oracle", "bluff_ai_oracle");
    formData.append("eventDate", "2024-12-31T23:59:59.000Z");
    formData.append("initialBelief", "65");
    formData.append("lpAmount", "1500");
    formData.append("urls", '["https://example.com/test"]');
    formData.append("tieIsPossible", "false");
    formData.append(
      "marketImage",
      new File(["test"], "test.jpg", { type: "image/jpeg" })
    );

    const request = {
      formData: async () => formData,
    } as NextRequest;

    await POST(request);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/actions/550e8400-e29b-41d4-a716-446655440000/create-market",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-API-Key": "test-api-key",
        }),
        body: expect.stringContaining('"marketName":"Test Market"'),
      })
    );
  });
});
