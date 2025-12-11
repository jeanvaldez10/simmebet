import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthContext } from "@/context/AuthProvider";
import { Position, PositionsResponse } from "@/types/positions";
import { useMarkets } from "./useMarkets";
import { type IMarketData } from "@/interfaces/market";

export function useOnchainPositions() {
  return useQuery({
    queryKey: ["onchainPositions"],
    queryFn: async () => {
      // Fetch on-chain positions
      const { data: onChainData } = await axios.get<PositionsResponse>(`/api/positions`);
      return onChainData.positions;
    },
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache longer
  });
}

export function usePositions() {
  const { dbUser } = useAuthContext();
  const { data: markets } = useMarkets();
  const { data: onchainPositions } = useOnchainPositions();

  return useQuery({
    queryKey: ["positions", dbUser?.walletAddress, markets?.length || 0, onchainPositions?.length || 0],
    queryFn: async () => {
      // Fetch markets first
      if (!markets || !onchainPositions) {
        return null;
      }

      // Get market pool addresses
      const marketPoolAddresses = new Set(
        markets.map((market) => market.poolAddress)
      );
      // Filter and map positions that match market pool addresses
      return onchainPositions
        .filter((position: Position) =>
          marketPoolAddresses.has(position.v4Position.poolPosition.poolId)
        )
        .map((position: Position) => {
          const market = markets.find(
            (m: IMarketData) => m.poolAddress === position.v4Position.poolPosition.poolId
          )!;

          return {
            id: market.id,
            marketId: market.id,
            amount:
              parseFloat(position.v4Position.poolPosition.amount0) /
              Math.pow(10, position.v4Position.poolPosition.token0.decimals),
            profit:
              parseFloat(position.v4Position.poolPosition.token0UncollectedFees) /
                Math.pow(10, position.v4Position.poolPosition.token0.decimals) +
              parseFloat(position.v4Position.poolPosition.token1UncollectedFees) /
                Math.pow(10, position.v4Position.poolPosition.token1.decimals),
            timestamp: position.timestamp * 1000,
            poolAddress: position.v4Position.poolPosition.tokenId,
            market: {
              ...market,
              status:
                position.status === "POSITION_STATUS_IN_RANGE"
                  ? "ACTIVE"
                  : "CLOSED",
            },
          };
        });
    },
    enabled: !!dbUser?.walletAddress && !!markets && !!onchainPositions, // Only run when we have all required data
  });
}
