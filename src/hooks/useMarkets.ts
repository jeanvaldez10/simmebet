import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { marketsApi } from "@/services/api/markets";
import { IMarketData } from "@/interfaces/market";

export function useMarkets(): UseQueryResult<IMarketData[], Error> {
  return useQuery({
    queryKey: ["markets"],
    queryFn: async () => {
      // Fetch markets first
      const marketsResponse = await marketsApi.getAllMarkets();
      const markets = marketsResponse.markets.filter((market) => market.poolAddress.length == 66);

      return markets;
    },
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  });
}
