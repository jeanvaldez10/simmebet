import { useQuery } from "@tanstack/react-query";
import {
  liquidityService,
  type PositionInfo,
} from "@/services/api/liquidityService";

export function usePositionInfo(tokenId: number | null) {
  return useQuery({
    queryKey: ["positionInfo", tokenId],
    queryFn: async (): Promise<PositionInfo | null> => {
      if (!tokenId) return null;
      try {
        const result = await liquidityService.getPositionInfo(tokenId);
        return result || null; // Ensure we never return undefined
      } catch {
        return null; // Return null instead of throwing
      }
    },
    enabled: !!tokenId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
