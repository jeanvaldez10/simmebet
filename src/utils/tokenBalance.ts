import { createPublicClient, http, erc20Abi, formatUnits } from "viem";
import { arbitrum } from "viem/chains";
import { generateMarketSlug } from "./marketSlug";

const client = createPublicClient({
  chain: arbitrum,
  transport: http(arbitrum.rpcUrls.default.http[0]),
});

export interface TokenBalances {
  yes: number;
  no: number;
  usdc: number;
}

export function serializeTokenBalances(balances: TokenBalances): Record<string, number> {
  return {
    yes: balances.yes,
    no: balances.no,
    usdc: balances.usdc
  };
}

export interface TokenAddresses {
  yesTokenAddress: string;
  noTokenAddress: string;
  usdcTokenAddress?: string;
}

export async function getTokenBalances(
  userWalletAddress: string,
  tokenAddresses: TokenAddresses
): Promise<TokenBalances> {
  try {
    const contracts = [
      {
        address: tokenAddresses.yesTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userWalletAddress as `0x${string}`],
      },
      {
        address: tokenAddresses.noTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userWalletAddress as `0x${string}`],
      },
    ];

    if (tokenAddresses.usdcTokenAddress) {
      contracts.push({
        address: tokenAddresses.usdcTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userWalletAddress as `0x${string}`],
      });
    }

    const results = await client.multicall({
      contracts,
      allowFailure: true,
    });

    const yesResult = results[0];
    const noResult = results[1];
    const usdcResult = results[2];
    
    const yesRaw = yesResult?.status === 'success' ? yesResult.result : undefined;
    const noRaw = noResult?.status === 'success' ? noResult.result : undefined;
    const usdcRaw = usdcResult?.status === 'success' ? usdcResult.result : undefined;

    const yes = yesRaw && typeof yesRaw === 'bigint' ? Number(formatUnits(yesRaw, 18)) : 0;
    const no = noRaw && typeof noRaw === 'bigint' ? Number(formatUnits(noRaw, 18)) : 0;
    const usdc = usdcRaw && typeof usdcRaw === 'bigint' ? Number(formatUnits(usdcRaw, 6)) : 0;

    return { yes, no, usdc };
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return { yes: 0, no: 0, usdc: 0 };
  }
}

export function calculateTokenDeltas(
  beforeBalances: TokenBalances,
  afterBalances: TokenBalances
): { yesDelta: number; noDelta: number; usdcDelta: number } {
  return {
    yesDelta: afterBalances.yes - beforeBalances.yes,
    noDelta: afterBalances.no - beforeBalances.no,
    usdcDelta: afterBalances.usdc - beforeBalances.usdc,
  };
}

export function generateTokenChangeMessage(
  yesDelta: number,
  noDelta: number,
  usdcDelta: number,
  marketQuestion: string,
  actionContext: string
): string {
  const marketSlug = generateMarketSlug(marketQuestion);
  
  return `${actionContext} in "${marketSlug}"`;
}

/**
 * Check if a swap would result in zero delta - user already holds tokens
 * and wants to update belief to the same side with no additional funds
 */
export function wouldSwapResultInZeroDelta(
  currentBalances: TokenBalances,
  amountIn: number,
  beliefPercentage: number
): boolean {
  // If no funds being added, check if they already hold tokens of the type they want
  if (amountIn === 0) {
    if (beliefPercentage === 0 && currentBalances.no > 0 && currentBalances.yes === 0) {
      // User wants NO position and already has NO tokens
      return true;
    }
    if (beliefPercentage === 100 && currentBalances.yes > 0 && currentBalances.no === 0) {
      // User wants YES position and already has YES tokens
      return true;
    }
  }
  
  return false;
}
