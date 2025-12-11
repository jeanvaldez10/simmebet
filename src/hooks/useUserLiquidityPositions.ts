import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";

export interface UserLiquidityPosition {
  id: string;
  userId: string;
  marketId: string;
  marketName: string;
  marketImage: string | null;
  marketAddress: string;
  marketStatus: string;
  marketDate: Date | null;
  nftId: string | null;
  isBurnt: boolean;
  autoclose: boolean;
  autocloseTime: Date | null;
  createdAt: Date;
  token0FeesCollected: number;
  token1FeesCollected: number;
  token0Balance: number | null;
  token1Balance: number | null;
  lowerOdds: number | null;
  upperOdds: number | null;
}

export function useUserLiquidityPositions(): UseQueryResult<
  UserLiquidityPosition[],
  Error
> {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["userLiquidityPositions", dbUser?.id],
    queryFn: async (): Promise<UserLiquidityPosition[]> => {
      if (!dbUser?.id) {
        return [];
      }

      const response = await fetch(`/api/liquidity/user-positions`);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No positions found
        }
        throw new Error("Failed to fetch user liquidity positions");
      }

      const data = await response.json();
      return data.liquidityPositions || [];
    },
    enabled: !!dbUser?.id,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
