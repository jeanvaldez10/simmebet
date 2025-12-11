import { QueryClient } from "@tanstack/react-query";
import {
  invalidateLiquidityPositionCaches,
  invalidateMarketCaches,
} from "../liquidityCacheUtils";

// Mock QueryClient
const mockQueryClient = {
  invalidateQueries: jest.fn(),
} as unknown as QueryClient;

describe("liquidityCacheUtils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("invalidateLiquidityPositionCaches", () => {
    it("should invalidate all liquidity position related caches", async () => {
      const marketId = "test-market-id";
      const userId = "test-user-id";

      await invalidateLiquidityPositionCaches(
        mockQueryClient,
        marketId,
        userId
      );

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(5);

      // Check that all expected query keys are invalidated
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["marketLiquidityPosition", userId, marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["marketLiquidityPositions", userId, marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["liquidityPositionData", userId, marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["liquidityPositionsData", userId, marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["positionInfo"],
      });
    });

    it("should work without userId", async () => {
      const marketId = "test-market-id";

      await invalidateLiquidityPositionCaches(mockQueryClient, marketId);

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(5);
    });
  });

  describe("invalidateMarketCaches", () => {
    it("should invalidate all market-related caches including liquidity positions", async () => {
      const marketId = "test-market-id";
      const userId = "test-user-id";

      await invalidateMarketCaches(mockQueryClient, marketId, userId);

      // Should invalidate standard market caches + liquidity position caches
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["market-last-price", marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["market", marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["swaps", marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["user", userId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["usdcBalance"],
      });

      // Should also call liquidity position cache invalidation
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["marketLiquidityPosition", userId, marketId],
      });
    });

    it("should work without userId", async () => {
      const marketId = "test-market-id";

      await invalidateMarketCaches(mockQueryClient, marketId);

      // Should still invalidate market caches but not user-specific ones
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["market-last-price", marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["market", marketId],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["swaps", marketId],
      });
    });
  });
});
