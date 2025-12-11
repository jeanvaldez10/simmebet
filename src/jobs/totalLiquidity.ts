import { prisma } from "@/lib/prisma";
import { createPublicClient, http, erc20Abi } from "viem";
import { arbitrum } from "viem/chains";
import { formatUnits } from "viem";

const client = createPublicClient({
  chain: arbitrum,
  transport: http(arbitrum.rpcUrls.default.http[0]),
});

/**
 * Calculate total liquidity for a market based on current token prices and total supplies
 * 
 * Formula: totalLiquidity = (yesTokenSupply * yesPrice) + (noTokenSupply * noPrice)
 * 
 * Where:
 * - yesTokenSupply: Total supply of YES tokens
 * - noTokenSupply: Total supply of NO tokens  
 * - yesPrice: Current USD price per YES token (0-2 range)
 * - noPrice: Current USD price per NO token (0-2 range)
 * 
 * At market end: winning token = $2, losing token = $0
 * So totalLiquidity represents the total USD value locked in the market
 */
export async function calculateMarketTotalLiquidity(
  marketId: string,
  yesTokenAddress: string,
  noTokenAddress: string,
  yesPrice: number,
  noPrice: number
): Promise<number> {
  try {
    // Get total supplies for both tokens
    const [yesTotalSupply, noTotalSupply] = await Promise.all([
      client.readContract({
        address: yesTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "totalSupply",
      }),
      client.readContract({
        address: noTokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "totalSupply",
      }),
    ]);

    // Convert from wei to token units (18 decimals)
    const yesSupply = Number(formatUnits(yesTotalSupply, 18));
    const noSupply = Number(formatUnits(noTotalSupply, 18));

    // Calculate total liquidity in USD
    const totalLiquidity = (yesSupply * yesPrice) + (noSupply * noPrice);

    console.log(`📊 Market ${marketId} liquidity calculation:`, {
      yesSupply,
      noSupply,
      yesPrice,
      noPrice,
      totalLiquidity,
    });

    return totalLiquidity;
  } catch (error) {
    console.error(`❌ Error calculating liquidity for market ${marketId}:`, error);
    return 0;
  }
}

/**
 * Update total liquidity for all active markets
 */
export async function updateAllMarketsTotalLiquidity() {
  try {
    console.log("🔄 Starting total liquidity update for all markets...");

    // Get all active markets with token addresses
    const markets = await prisma.market.findMany({
      where: {
        status: "ACTIVE",
        yesTokenAddress: { not: null },
        noTokenAddress: { not: null },
      },
      select: {
        id: true,
        name: true,
        yesTokenAddress: true,
        noTokenAddress: true,
        yesPrice: true,
        noPrice: true,
        totalLiquidity: true,
      },
    });

    console.log(`📈 Found ${markets.length} active markets to update`);

    const updates = await Promise.allSettled(
      markets.map(async (market) => {
        const totalLiquidity = await calculateMarketTotalLiquidity(
          market.id,
          market.yesTokenAddress!,
          market.noTokenAddress!,
          market.yesPrice,
          market.noPrice
        );

        // Update the market with new total liquidity
        await prisma.market.update({
          where: { id: market.id },
          data: { totalLiquidity },
        });

        return {
          marketId: market.id,
          marketName: market.name,
          oldLiquidity: market.totalLiquidity,
          newLiquidity: totalLiquidity,
        };
      })
    );

    // Log results
    const successful = updates.filter((result) => result.status === "fulfilled");
    const failed = updates.filter((result) => result.status === "rejected");

    console.log(`✅ Successfully updated ${successful.length} markets`);
    
    if (failed.length > 0) {
      console.log(`❌ Failed to update ${failed.length} markets`);
      failed.forEach((result) => {
        if (result.status === "rejected") {
          console.error("Update failed:", result.reason);
        }
      });
    }

    // Log some examples of the updates
    successful.slice(0, 5).forEach((result) => {
      if (result.status === "fulfilled") {
        const { marketName, oldLiquidity, newLiquidity } = result.value;
        console.log(`📊 ${marketName}: $${oldLiquidity.toFixed(2)} → $${newLiquidity.toFixed(2)}`);
      }
    });

    return {
      totalMarkets: markets.length,
      successful: successful.length,
      failed: failed.length,
    };
  } catch (error) {
    console.error("❌ Error updating total liquidity for all markets:", error);
    throw error;
  }
}

/**
 * Update total liquidity for a specific market
 */
export async function updateMarketTotalLiquidity(marketId: string) {
  try {
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      select: {
        id: true,
        name: true,
        yesTokenAddress: true,
        noTokenAddress: true,
        yesPrice: true,
        noPrice: true,
        totalLiquidity: true,
      },
    });

    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    if (!market.yesTokenAddress || !market.noTokenAddress) {
      throw new Error(`Market ${marketId} missing token addresses`);
    }

    const totalLiquidity = await calculateMarketTotalLiquidity(
      market.id,
      market.yesTokenAddress,
      market.noTokenAddress,
      market.yesPrice,
      market.noPrice
    );

    await prisma.market.update({
      where: { id: marketId },
      data: { totalLiquidity },
    });

    console.log(`✅ Updated market ${market.name}: $${market.totalLiquidity.toFixed(2)} → $${totalLiquidity.toFixed(2)}`);

    return totalLiquidity;
  } catch (error) {
    console.error(`❌ Error updating liquidity for market ${marketId}:`, error);
    throw error;
  }
}

// Export the main function for use in cron jobs or API endpoints
export default updateAllMarketsTotalLiquidity;
