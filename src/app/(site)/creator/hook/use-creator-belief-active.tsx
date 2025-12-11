import { useQuery } from "@tanstack/react-query";

interface MarketApiResponse {
  id: string;
  question?: string;
  name?: string;
  image?: string;
  yesPercentage?: number;
  noPercentage?: number;
  volume?: number;
  date?: string;
  oracleType?: string;
  status?: string;
  createdBy?: string;
}

export interface ICreatorBeliefActive {
  id: number;
  marketId: string;

  title: string;
  image: string;
  yes: number;
  no: number;
  volume: number;
  fees: number;
  duration: string;

  oracle: "manual" | "ai";

  isRenounced: boolean;
}

const useCreatorBeliefActive = (userId: string) => {
  return useQuery({
    queryKey: ["creator-belief-active", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const response = await fetch('/api/markets');
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }
      
      const { markets } = await response.json();
      
      return markets
        .filter((market: MarketApiResponse) => market.createdBy === userId)
        .map((market: MarketApiResponse) => ({
          id: market.id,
          title: market.question || market.name,
          image: market.image || "/images/cup.png",
          yes: Math.round(market.yesPercentage || 50),
          no: Math.round(market.noPercentage || 50),
          volume: market.volume || 0,
          fees: ((market.volume || 0) * 0.03),
          duration: market.date ? 
            `${new Date().toLocaleDateString()} - ${new Date(market.date).toLocaleDateString()}` :
            "Ongoing",
          oracle: market.oracleType === 'bluff_ai_oracle' ? "ai" : "manual",
          isRenounced: market.status === "RESOLVED",
        }));
    },
    staleTime: 30000,
    enabled: !!userId,
  });
};

export default useCreatorBeliefActive;
