import { useQuery } from "@tanstack/react-query";
import { marketsApi } from "@/services/api/markets";
import { IMarketData } from "@/interfaces/market";

interface UseMarketsBatchParams {
  marketIds: string[];
  enabled?: boolean;
}

export function useMarketsBatch({ 
  marketIds, 
  enabled = true 
}: UseMarketsBatchParams) {
  return useQuery({
    queryKey: ["markets-batch", marketIds.sort()], // Sort to ensure consistent cache key
    queryFn: async () => {
      if (marketIds.length === 0) return {};
      return await marketsApi.getMarketsBatch(marketIds);
    },
    enabled: enabled && marketIds.length > 0,
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Helper hook for individual market data from the batch
export function useMarketFromBatch(
  marketId: string | undefined, 
  batchData: Record<string, { market: IMarketData } | null> | undefined,
  isLoading: boolean
) {
  const marketData = marketId ? batchData?.[marketId] : null;
  
  return {
    data: marketData,
    isLoading,
    error: null,
  };
}
