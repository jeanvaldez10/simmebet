import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";

export interface LiquidityPositionData {
  token0Balance: number;
  token1Balance: number;
  feesCollected: number;
  timeElapsed: string;
  holdingNo: number;
  holdingYes: number;
  yourLp: number;
  autoclose: boolean;
  autocloseTime?: Date;
}

export function useLiquidityPositionData(marketId: string) {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["liquidityPositionData", dbUser?.id, marketId],
    queryFn: async (): Promise<LiquidityPositionData | null> => {
      if (!dbUser?.id || !marketId) {
        return null;
      }

      const response = await fetch(
        `/api/liquidity/positions/${marketId}?includeData=true`
      );
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No position found
        }
        throw new Error("Failed to fetch liquidity position data");
      }

      const data = await response.json();
      return data.positionData;
    },
    enabled: !!dbUser?.id && !!marketId,
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useLiquidityPositionsData(marketId: string) {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["liquidityPositionsData", dbUser?.id, marketId],
    queryFn: async (): Promise<LiquidityPositionData[]> => {
      if (!dbUser?.id || !marketId) {
        return [];
      }

      const response = await fetch(
        `/api/liquidity/positions/${marketId}?includeData=true`
      );
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No positions found
        }
        throw new Error("Failed to fetch liquidity positions data");
      }

      const data = await response.json();
      return data.positionsData || [];
    },
    enabled: !!dbUser?.id && !!marketId,
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
