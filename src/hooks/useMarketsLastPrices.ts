import { useQuery } from "@tanstack/react-query";
import { marketsApi } from "@/services/api/markets";

interface UseMarketsLastPricesParams {
  marketIds: string[];
  enabled?: boolean;
}

export function useMarketsLastPrices({ 
  marketIds, 
  enabled = true 
}: UseMarketsLastPricesParams) {
  return useQuery({
    queryKey: ["markets-last-prices", marketIds.sort()], // Sort to ensure consistent cache key
    queryFn: async () => {
      if (marketIds.length === 0) return {};
      return await marketsApi.getMarketsLastPrices(marketIds);
    },
    enabled: enabled && marketIds.length > 0,
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Helper hook for individual market last price from the batch
export function useMarketLastPriceFromBatch(
  marketId: string | undefined, 
  batchData: Record<string, { price: number; timestamp: Date } | null> | undefined,
  isLoading: boolean
) {
  const lastPriceData = marketId ? batchData?.[marketId] : null;
  
  return {
    data: lastPriceData ? { price: lastPriceData.price } : { price: 0 },
    isLoading,
    error: null,
  };
}
