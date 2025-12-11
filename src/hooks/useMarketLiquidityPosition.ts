import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";

export interface MarketLiquidityPosition {
  id: string;
  userId: string;
  marketId: string;
  nftId?: string;
  isBurnt: boolean;
  autoclose: boolean;
  autocloseTime?: Date;
  createdAt: Date;
  token0FeesCollected: number;
  token1FeesCollected: number;
}

export function useMarketLiquidityPosition(marketId: string) {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["marketLiquidityPosition", dbUser?.id, marketId],
    queryFn: async (): Promise<MarketLiquidityPosition | null> => {
      if (!dbUser?.id || !marketId) {
        return null;
      }

      const response = await fetch(`/api/liquidity/positions/${marketId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No position found
        }
        throw new Error("Failed to fetch liquidity position");
      }

      const data = await response.json();
      return data.liquidityPosition;
    },
    enabled: !!dbUser?.id && !!marketId,
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useMarketLiquidityPositions(marketId: string) {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["marketLiquidityPositions", dbUser?.id, marketId],
    queryFn: async (): Promise<MarketLiquidityPosition[]> => {
      if (!dbUser?.id || !marketId) {
        return [];
      }

      const response = await fetch(`/api/liquidity/positions/${marketId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No positions found
        }
        throw new Error("Failed to fetch liquidity positions");
      }

      const data = await response.json();
      return data.liquidityPositions || [];
    },
    enabled: !!dbUser?.id && !!marketId,
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useHasOpenLiquidityPosition(marketId: string) {
  const { data: position, isLoading } = useMarketLiquidityPosition(marketId);

  return {
    hasOpenPosition: !!position && !position.isBurnt && !!position.nftId,
    position,
    isLoading,
  };
}

export function useHasOpenLiquidityPositions(marketId: string) {
  const { data: positions, isLoading } = useMarketLiquidityPositions(marketId);

  const activePositions =
    positions?.filter((pos) => !pos.isBurnt && !!pos.nftId) || [];

  return {
    hasOpenPositions: activePositions.length > 0,
    positions: activePositions,
    isLoading,
  };
}
