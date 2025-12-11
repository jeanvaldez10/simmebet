import { useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";
import { ARBITRUM_USDC_CONTRACT_ADDRESS } from "@/constants";
import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { roundDownToCent } from "@/utils/format";


export function useUSDCBalance(userAddress: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["usdcBalance", userAddress],
    queryFn: async () => {
      const client = createPublicClient({
        chain: arbitrum,
        transport: http(arbitrum.rpcUrls.default.http[0]),
      });
      const data = await client.readContract({
        address: ARBITRUM_USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userAddress as `0x${string}`],
      })

      const balance = Number(data) / 1000000;
      return parseFloat(roundDownToCent(balance));
    },
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache longer
    enabled: !!userAddress, // Only run when we have a valid address
  });
}
