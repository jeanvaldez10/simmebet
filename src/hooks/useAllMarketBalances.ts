import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

import { useAuthContext } from "@/context/AuthProvider";
import { useMarkets } from "@/hooks/useMarkets";

export type MarketBalancesMap = Record<string, { yes: number; no: number }>;

export function useAllMarketBalances() {
  const { dbUser } = useAuthContext();
  const { data: markets } = useMarkets();

  return useQuery<MarketBalancesMap>({
    queryKey: [
      "allMarketBalances",
      dbUser?.walletAddress,
      markets?.length || 0,
    ],
    queryFn: async () => {
      if (!dbUser?.walletAddress || !markets || markets.length === 0) {
        return {};
      }

      const client = createPublicClient({
        chain: arbitrum,
        transport: http(arbitrum.rpcUrls.default.http[0]),
      });

      const yesResults = await client.multicall({
        contracts: markets.map((m) => ({
          address: m.yesTokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [dbUser.walletAddress as `0x${string}`],
        })),
        allowFailure: true,
      });

      const noResults = await client.multicall({
        contracts: markets.map((m) => ({
          address: m.noTokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [dbUser.walletAddress as `0x${string}`],
        })),
        allowFailure: true,
      });

      const balances: MarketBalancesMap = {};

      markets.forEach((market, idx) => {
        const yesResult = yesResults[idx];
        const noResult = noResults[idx];
        const yesRaw = yesResult.status === 'success' ? yesResult.result : undefined;
        const noRaw = noResult.status === 'success' ? noResult.result : undefined;

        const yes = yesRaw && typeof yesRaw === 'bigint' ? Number(formatUnits(yesRaw, 18)) : 0;
        const no = noRaw && typeof noRaw === 'bigint' ? Number(formatUnits(noRaw, 18)) : 0;

        balances[market.contractAddress] = { yes, no };
      });

      return balances;
    },
    gcTime: 5 * 60 * 1000,
    enabled: !!dbUser?.walletAddress,
  });
} 
