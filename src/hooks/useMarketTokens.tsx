import { erc20Abi } from "viem";
import { useReadContracts } from "wagmi";
import marketBase from "@/abis/ConditionalTokenMarketBase.json";
import { arbitrum } from "viem/chains";

import { useAuthContext } from "@/context/AuthProvider";

const useMarketTokens = (marketContractAddress: `0x${string}`) => {
  const { dbUser } = useAuthContext();
  const marketBaseAbi = marketBase.abi;
 
  const { data: outcomeTokens } = useReadContracts({
    contracts: [
      {
        address: marketContractAddress,
        abi: marketBaseAbi,
        functionName: "outcomeTokens",
        args: [BigInt(0)],
        chainId: arbitrum.id,
      },
      {
        address: marketContractAddress,
        abi: marketBaseAbi,
        functionName: "outcomeTokens",
        args: [BigInt(1)],
        chainId: arbitrum.id,
      },
    ],
    // Only attempt to read when we have a market address
    query: { enabled: !!marketContractAddress },
  });

  const { data: tokenBalances, refetch: refetchTokenBalances } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: outcomeTokens?.[0]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [dbUser?.walletAddress as `0x${string}`],
      },
      {
        address: outcomeTokens?.[1]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [dbUser?.walletAddress as `0x${string}`],
      },
    ],
    // Ensure we only query balances when token addresses and wallet are available
    query: {
      enabled:
        !!dbUser?.walletAddress &&
        !!(outcomeTokens?.[0]?.result as `0x${string}` | undefined) &&
        !!(outcomeTokens?.[1]?.result as `0x${string}` | undefined),
    },
  });

  const { data: tokenTotalSupplies, refetch: refetchTokenTotalSupplies } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: outcomeTokens?.[0]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
      {
        address: outcomeTokens?.[1]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
    // Only query total supplies when token addresses are available
    query: {
      enabled:
        !!(outcomeTokens?.[0]?.result as `0x${string}` | undefined) &&
        !!(outcomeTokens?.[1]?.result as `0x${string}` | undefined),
    },
  });

  const refreshBalances = async () => {
    await refetchTokenBalances();
  };

  return {
    tokenABalance: tokenBalances?.[0],
    tokenBBalance: tokenBalances?.[1],
    tokenATotalSupply: tokenTotalSupplies?.[0],
    tokenBTotalSupply: tokenTotalSupplies?.[1],
    refetchTokenTotalSupplies,
    refreshBalances,
  };
};

export default useMarketTokens;
