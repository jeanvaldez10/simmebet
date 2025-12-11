import { QueryClient } from "@tanstack/react-query";

/**
 * Utility function to invalidate all liquidity position related caches
 * This ensures that liquidity position data is refreshed immediately after bet updates
 */
export const invalidateLiquidityPositionCaches = async (
  queryClient: QueryClient,
  marketId: string,
  userId?: string
) => {
  const invalidationPromises = [
    // Invalidate single position queries
    queryClient.invalidateQueries({
      queryKey: ["marketLiquidityPosition", userId, marketId],
    }),
    // Invalidate multiple positions queries
    queryClient.invalidateQueries({
      queryKey: ["marketLiquidityPositions", userId, marketId],
    }),
    // Invalidate position data queries
    queryClient.invalidateQueries({
      queryKey: ["liquidityPositionData", userId, marketId],
    }),
    // Invalidate multiple positions data queries
    queryClient.invalidateQueries({
      queryKey: ["liquidityPositionsData", userId, marketId],
    }),
    // Invalidate position info queries (for individual NFT positions)
    queryClient.invalidateQueries({
      queryKey: ["positionInfo"],
    }),
  ];

  await Promise.all(invalidationPromises);
};

/**
 * Utility function to invalidate all market-related caches including liquidity positions
 * This is a comprehensive cache invalidation for bet updates
 */
export const invalidateMarketCaches = async (
  queryClient: QueryClient,
  marketId: string,
  userId?: string,
  contractAddress?: string
) => {
  const invalidationPromises = [
    // Standard market caches
    queryClient.invalidateQueries({
      queryKey: ["market-last-price", marketId],
    }),
    queryClient.invalidateQueries({ queryKey: ["market", marketId] }),
    // Also invalidate market queries with contract address (for useMarket hook)
    queryClient.invalidateQueries({ queryKey: ["market", marketId, true] }),
    queryClient.invalidateQueries({ queryKey: ["market", marketId, false] }),
    // If we have contract address, also invalidate using that
    ...(contractAddress
      ? [
          queryClient.invalidateQueries({
            queryKey: ["market", contractAddress],
          }),
          queryClient.invalidateQueries({
            queryKey: ["market", contractAddress, true],
          }),
          queryClient.invalidateQueries({
            queryKey: ["market", contractAddress, false],
          }),
          queryClient.invalidateQueries({
            queryKey: ["market-last-price", contractAddress],
          }),
        ]
      : []),
    queryClient.invalidateQueries({ queryKey: ["swaps", marketId] }),
    // User-related caches
    ...(userId
      ? [
          queryClient.invalidateQueries({ queryKey: ["user", userId] }),
          queryClient.invalidateQueries({ queryKey: ["usdcBalance"] }),
          queryClient.invalidateQueries({
            queryKey: ["market-usdc-investment", userId, marketId],
          }),
          // Invalidate position belief to update profile positions list
          queryClient.invalidateQueries({ queryKey: ["positionBelief"] }),
        ]
      : []),
    // Liquidity position caches
    ...(userId
      ? [invalidateLiquidityPositionCaches(queryClient, marketId, userId)]
      : []),
  ];

  await Promise.all(invalidationPromises);
};
