import { useQuery } from "@tanstack/react-query";

interface HolderCountResponse {
  marketId: string;
  totalHolders: number;
}

export function useMarketHolderCount(marketId: string | undefined) {
  return useQuery<HolderCountResponse>({
    queryKey: ["marketHolderCount", marketId],
    queryFn: async () => {
      if (!marketId) {
        throw new Error("Market ID is required");
      }
      
      const response = await fetch(`/api/markets/holder-count?marketId=${marketId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch holder count");
      }
      
      return response.json();
    },
    enabled: !!marketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
