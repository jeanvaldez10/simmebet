#!/usr/bin/env node

/**
 * Cron job script to update total liquidity for all markets
 * 
 * This script should be run periodically (e.g., every 5-10 minutes) to ensure
 * total liquidity values stay current as token prices change.
 * 
 * Usage:
 *   node scripts/update-total-liquidity.js
 *   node scripts/update-total-liquidity.js --market-id <marketId>
 */

const { PrismaClient } = require('@prisma/client');
const { createPublicClient, http, erc20Abi, formatUnits } = require('viem');
const { arbitrum } = require('viem/chains');

const prisma = new PrismaClient();

const client = createPublicClient({
  chain: arbitrum,
  transport: http(arbitrum.rpcUrls.default.http[0]),
});

async function calculateMarketTotalLiquidity(
  marketId,
  yesTokenAddress,
  noTokenAddress,
  yesPrice,
  noPrice
) {
  try {
    // Get total supplies for both tokens
    const [yesTotalSupply, noTotalSupply] = await Promise.all([
      client.readContract({
        address: yesTokenAddress,
        abi: erc20Abi,
        functionName: "totalSupply",
      }),
      client.readContract({
        address: noTokenAddress,
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

async function updateAllMarketsTotalLiquidity() {
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
          market.yesTokenAddress,
          market.noTokenAddress,
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

async function updateMarketTotalLiquidity(marketId) {
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

async function main() {
  try {
    const args = process.argv.slice(2);
    const marketIdIndex = args.indexOf('--market-id');
    
    if (marketIdIndex !== -1 && args[marketIdIndex + 1]) {
      // Update specific market
      const marketId = args[marketIdIndex + 1];
      console.log(`🎯 Updating total liquidity for market: ${marketId}`);
      const totalLiquidity = await updateMarketTotalLiquidity(marketId);
      console.log(`✅ Completed: Market liquidity = $${totalLiquidity.toFixed(2)}`);
    } else {
      // Update all markets
      console.log("🌍 Updating total liquidity for all markets...");
      const result = await updateAllMarketsTotalLiquidity();
      console.log(`✅ Completed: ${result.successful}/${result.totalMarkets} markets updated`);
    }
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
