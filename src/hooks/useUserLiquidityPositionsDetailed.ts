import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";

export interface LiquidityPositionDetailed {
  id: string;
  marketId: string;
  nftId: string | null;
  marketName: string;
  marketQuestion: string;
  marketImage: string | null;
  marketAddress: string;
  marketStatus: string;
  marketDate: Date | null;
  isResolved: boolean;
  resolvedOption: string | null;
  
  // Token balances
  token0Balance: number;
  token1Balance: number;
  token0Value: number;
  token1Value: number;
  totalValue: number;
  
  // Fees and P&L
  feesCollected: number;
  currentPnL: number;
  
  // Position details
  lowerOdds: number | null;
  upperOdds: number | null;
  createdAt: Date;
  lastUpdated: Date | null;
  
  // Market prices
  yesPrice: number;
  noPrice: number;
}

export interface LiquidityPositionsSummary {
  totalValue: number;
  totalFees: number;
  totalPnL: number;
  activePositions: number;
  resolvedPositions: number;
  totalPositions: number;
}

export interface LiquidityPositionsResponse {
  positions: LiquidityPositionDetailed[];
  summary: LiquidityPositionsSummary;
}

export function useUserLiquidityPositionsDetailed() {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["userLiquidityPositionsDetailed", dbUser?.id],
    queryFn: async (): Promise<LiquidityPositionsResponse> => {
      if (!dbUser?.id) {
        return { positions: [], summary: { totalValue: 0, totalFees: 0, totalPnL: 0, activePositions: 0, resolvedPositions: 0, totalPositions: 0 } };
      }

      const response = await fetch(`/api/users/liquidity-positions`);
      if (!response.ok) {
        if (response.status === 404) {
          return { positions: [], summary: { totalValue: 0, totalFees: 0, totalPnL: 0, activePositions: 0, resolvedPositions: 0, totalPositions: 0 } };
        }
        throw new Error("Failed to fetch user liquidity positions");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!dbUser?.id,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
