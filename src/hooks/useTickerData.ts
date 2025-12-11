import { useQuery } from "@tanstack/react-query";

export interface TickerItem {
  id: string;
  marketName: string;
  category: string;
  currentPrice: string;
  priceChange: string;
  percentChange: string;
  isPositive: boolean;
  timestamp: string;
  contractAddress?: string;
}

export interface TickerResponse {
  tickerItems: TickerItem[];
  lastUpdated: string;
}

export function useTickerData() {
  return useQuery({
    queryKey: ["ticker-data"],
    queryFn: async (): Promise<TickerResponse> => {
      const response = await fetch("/api/ticker");

      if (!response.ok) {
        throw new Error("Failed to fetch ticker data");
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
    gcTime: 60000, // Keep in cache for 1 minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
