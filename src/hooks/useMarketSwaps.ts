import { useQuery } from "@tanstack/react-query";
import { marketsApi } from "@/services/api/markets";

export function useMarketSwaps(marketId: string | undefined, marketIdentifier: string | undefined, isContractAddress: boolean | undefined) {
  return useQuery({
    queryKey: ["swaps", marketId || marketIdentifier, isContractAddress],
    queryFn: () => {
      if (isContractAddress) {
        return marketsApi.getMarketSwapsByContractAddress(marketIdentifier as string);
      } else {
        return marketsApi.getMarketSwaps(marketId || marketIdentifier as string);
      }
    },
    refetchInterval: 10_000,
    enabled: !!(marketId || marketIdentifier),
  });
} 
