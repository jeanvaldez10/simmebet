import { createPublicClient, http, parseAbi, getContract, type Address, type Hex } from 'viem';
import { arbitrum } from 'viem/chains';
import { ARBITRUM_USDC_CONTRACT_ADDRESS } from '@/constants';
import { getV4PriceInfo, oddsFromSqrtPriceX96 } from '@/utils/uniswap-helpers';
import { prisma } from '../../prisma';

// ERC20 ABI for getting token decimals
const ERC20_ABI = parseAbi([
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]);

export interface TokenPriceInfo {
  priceInUSD: number;
  decimals: number;
  symbol: string;
}

export interface MarketTokenPriceParams {
  tokenAddress: Address;
  marketId?: string;
  poolAddress?: Address;
  rpcUrl?: string;
  chainId?: number;
}

/**
 * Get the price of a market token in USD
 * For USDC, returns $1. For market tokens, fetches from Uniswap pool
 * @param params - Parameters including token address, market ID, pool address, and RPC URL
 * @returns Promise<TokenPriceInfo> - Price information including USD value, decimals, and symbol
 */
export async function getMarketTokenPrice({
  tokenAddress,
  poolAddress,
  rpcUrl,
  chainId = arbitrum.id
}: MarketTokenPriceParams): Promise<TokenPriceInfo> {
  const client = createPublicClient({
    chain: { ...arbitrum, id: chainId },
    transport: http(rpcUrl || arbitrum.rpcUrls.default.http[0]),
  });

  try {
    // Get token info
    const tokenContract = getContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      client,
    });

    const [decimals, symbol] = await Promise.all([
      tokenContract.read.decimals(),
      tokenContract.read.symbol(),
    ]);

    // Check if this is USDC - return $1
    if (tokenAddress.toLowerCase() === ARBITRUM_USDC_CONTRACT_ADDRESS.toLowerCase()) {
      return {
        priceInUSD: 1.0,
        decimals: Number(decimals),
        symbol,
      };
    }

    // For market tokens, we need to get the price from the Uniswap pool
    if (!poolAddress) {
      throw new Error(`Pool address required for non-USDC token: ${tokenAddress}`);
    }

    // Get price from Uniswap V4 pool using pool address as pool ID
    const poolId = poolAddress as Hex;
    const priceInfo = await getV4PriceInfo(poolId, rpcUrl);
    
    // The priceInfo gives us the ratio between the two tokens in the pool
    // We need to determine which token is which and calculate USD value
    // For now, we'll use the yes/no odds as a proxy for price
    // This is a simplified approach - in practice, you might need more complex logic
    // depending on how the pool is structured
    
    // Convert sqrtPriceX96 to market probabilities
    const { yes, no } = oddsFromSqrtPriceX96(priceInfo.sqrtPriceX96);
    
    // Use the probability as a price proxy (0-1 range)
    // This is a simplified approach - you might want to adjust this based on your specific needs
    const priceInUSD = Math.max(yes, no) * 1.0; // Scale as needed

    return {
      priceInUSD,
      decimals: Number(decimals),
      symbol,
    };

  } catch (error) {
    console.error('Error fetching token price:', error);
    
    // Fallback: return a default price of $0.50 for market tokens
    // This prevents the system from failing completely if price fetching fails
    return {
      priceInUSD: 0.5,
      decimals: 18, // Default to 18 decimals
      symbol: 'UNKNOWN',
    };
  }
}

/**
 * Get prices for multiple tokens in batch
 * @param tokens - Array of token parameters
 * @returns Promise<TokenPriceInfo[]> - Array of price information
 */
export async function getBatchTokenPrices(
  tokens: MarketTokenPriceParams[]
): Promise<TokenPriceInfo[]> {
  const promises = tokens.map(token => getMarketTokenPrice(token));
  return Promise.all(promises);
}

/**
 * Calculate USD value for a token amount
 * @param amount - Token amount (as BigInt)
 * @param priceInfo - Token price information
 * @returns number - USD value
 */
export function calculateUSDValue(amount: bigint, priceInfo: TokenPriceInfo): number {
  const amountInTokens = Number(amount) / Math.pow(10, priceInfo.decimals);
  return amountInTokens * priceInfo.priceInUSD;
}

/**
 * Get market token addresses and pool address from market data
 * This is a helper function to extract the necessary data for price fetching
 */
export async function getMarketTokenData(marketId: string): Promise<{
  yesTokenAddress?: Address;
  noTokenAddress?: Address;
  poolAddress?: Address;
}> {
  // Try to find by contractAddress first (most common case)
  let market = await prisma.market.findUnique({
    where: { contractAddress: marketId },
    select: {
      yesTokenAddress: true,
      noTokenAddress: true,
      poolAddress: true,
    },
  });

  // If not found by contractAddress, try by id (for backward compatibility)
  if (!market) {
    market = await prisma.market.findUnique({
      where: { id: marketId },
      select: {
        yesTokenAddress: true,
        noTokenAddress: true,
        poolAddress: true,
      },
    });
  }

  if (!market) {
    throw new Error(`Market not found: ${marketId}`);
  }

  return {
    yesTokenAddress: market.yesTokenAddress as Address | undefined,
    noTokenAddress: market.noTokenAddress as Address | undefined,
    poolAddress: market.poolAddress as Address | undefined,
  };
}
