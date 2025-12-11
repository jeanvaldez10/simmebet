import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http, parseAbi, getContract } from "viem";
import { arbitrum } from "viem/chains";
import type { Address, Hex } from "viem";
import { oddsFromSqrtPriceX96 } from "@/utils/uniswap-helpers";

// V4 State View ABI for getting pool slot0 data
const stateViewAbi = parseAbi([
  "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)",
]);

// V4 State View address on Arbitrum
const V4_STATE_VIEW_ADDRESS = "0x76fd297e2d437cd7f76d50f01afe6160f86e9990" as Address;

interface PoolPriceData {
  sqrtPriceX96: bigint;
  tick: number;
  yesProbability: number;
  noProbability: number;
}

interface UsePoolPriceParams {
  poolId: Hex;
  rpcUrl?: string;
  enabled?: boolean;
}

export function usePoolPrice({ 
  poolId, 
  rpcUrl = process.env.NEXT_PUBLIC_ARB_RPC_URL,
  enabled = true 
}: UsePoolPriceParams) {
  return useQuery<PoolPriceData>({
    queryKey: ["pool-price", poolId],
    queryFn: async () => {
      try {
        const client = createPublicClient({
          chain: arbitrum,
          transport: http(rpcUrl),
        });

        const stateView = getContract({
          address: V4_STATE_VIEW_ADDRESS,
          abi: stateViewAbi,
          client,
        });

        // Get current pool state
        const slot0 = await stateView.read.getSlot0([poolId]);
        const sqrtPriceX96 = slot0[0];
        const tick = Number(slot0[1]);

        // Convert sqrtPriceX96 to market probabilities
        const { yes, no } = oddsFromSqrtPriceX96(sqrtPriceX96);


        // Swap YES/NO probabilities as the token mapping appears to be reversed
        return {
          sqrtPriceX96,
          tick,
          yesProbability: no,  // Swap: use 'no' for yesProbability
          noProbability: yes,   // Swap: use 'yes' for noProbability
        };
      } catch (error) {
        console.error("Error fetching pool price for poolId:", poolId, error);
        throw error;
      }
    },
    enabled: enabled && !!poolId,
    staleTime: 2000, // Consider data fresh for 2 seconds
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
