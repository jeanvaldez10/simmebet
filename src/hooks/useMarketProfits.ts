import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";

interface MarketProfitsResponse {
  profitsByMarket: Record<string, number>;
}

export function useMarketProfits(marketId?: string) {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["marketProfits", dbUser?.id, marketId],
    queryFn: async () => {
      const response = await fetch("/api/users/market-profits");
      if (!response.ok) {
        throw new Error("Failed to fetch market profits");
      }
      const data: MarketProfitsResponse = await response.json();

      // If a specific market ID is provided, return just that market's profit
      if (marketId) {
        return data.profitsByMarket[marketId] || 0;
      }

      // Return all profits if no specific market is requested
      return data.profitsByMarket;
    },
    staleTime: 30000, // 30 seconds
    enabled: !!dbUser?.id, // Only run when user is authenticated
  });
}

// Hook for getting profit for a specific market by ID
export function useMarketProfitById(marketId: string) {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["marketProfit", dbUser?.id, marketId],
    queryFn: async () => {
      const response = await fetch("/api/users/market-profits");
      if (!response.ok) {
        throw new Error("Failed to fetch market profits");
      }
      const data: MarketProfitsResponse = await response.json();
      return data.profitsByMarket[marketId] || 0;
    },
    staleTime: 30000, // 30 seconds
    enabled: !!dbUser?.id && !!marketId, // Only run when user is authenticated and marketId is provided
  });
}
