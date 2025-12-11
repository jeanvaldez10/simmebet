import { useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";
import axios from "axios";
import { useAuthContext } from "@/context/AuthProvider";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";

interface Market {
  id: string;
  question: string;
  image: string;
  status: string;
  poolAddress: string;
  yesTokenAddress: `0x${string}`;
  noTokenAddress: `0x${string}`;
}

interface MarketResponse {
  markets: Market[];
}

export function useMarketBalances() {
  const { dbUser } = useAuthContext();
  return useQuery({
    queryKey: ["marketBalances", dbUser?.walletAddress],
    queryFn: async () => {
      // Fetch markets first
      const marketsResponse = await axios.get<MarketResponse>(`/api/markets`);
      const markets = marketsResponse.data.markets.filter((market) => market.poolAddress.length == 66);

      if (!dbUser?.walletAddress) {
        return {};
      }
      const client = createPublicClient({
        chain: arbitrum,
        transport: http(arbitrum.rpcUrls.default.http[0]),
      });

      const yesBalances = await client.multicall({
        contracts: markets.map((market) => ({
          address: market.yesTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [dbUser?.walletAddress as `0x${string}`],
        })),
      });

      const noBalances = await client.multicall({
        contracts: markets.map((market) => ({
          address: market.noTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [dbUser?.walletAddress as `0x${string}`],
        })),
      });

      return {
        yesBalances: yesBalances.map((balance) => balance.result),
        noBalances: noBalances.map((balance) => balance.result),
      }
    },
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache longer
    enabled: !!dbUser?.walletAddress, // Only run when we have a wallet address
  });
}
