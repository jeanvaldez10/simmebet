import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchMultipleUniswapPositions } from '@/utils/uniswap';

export async function GET() {
  try {
    console.log('Starting NFT positions update cron job...');
    
    // Get all active liquidity positions with NFT IDs
    const liquidityPositions = await prisma.liquidityPositions.findMany({
      where: {
        isBurnt: false,
        nftId: {
          not: null,
        },
      },
      select: {
        id: true,
        nftId: true,
        marketId: true,
      },
    });

    if (liquidityPositions.length === 0) {
      console.log('No active NFT positions found to update');
      return NextResponse.json({ 
        message: 'No active NFT positions found',
        updated: 0,
        total: 0 
      });
    }

    console.log(`Found ${liquidityPositions.length} active NFT positions to update`);

    // Extract unique NFT IDs
    const nftIds = [...new Set(liquidityPositions.map(pos => pos.nftId!))];
    
    // Fetch fresh data from Uniswap
    const uniswapData = await fetchMultipleUniswapPositions(nftIds);
    
    console.log(`Fetched data for ${uniswapData.size} positions from Uniswap`);

    // Update positions with fresh data
    let updatedCount = 0;
    let errorCount = 0;
    const updatePromises = liquidityPositions.map(async (position) => {
      if (!position.nftId) return;
      
      const uniswapPosition = uniswapData.get(position.nftId);
      if (!uniswapPosition) {
        console.warn(`No Uniswap data found for NFT ${position.nftId}`);
        return;
      }


      try {
        // Convert wei values to proper decimal format for database storage
        // Database fields are Decimal(10, 2) so we need to convert from wei (18 decimals) to 2 decimals
        const convertWeiToDecimal = (weiValue: string, decimals: number = 18): string => {
          const wei = BigInt(weiValue);
          const divisor = BigInt(10 ** decimals); // Convert from wei to actual token amount
          const result = wei / divisor;
          const remainder = wei % divisor;
          
          // Convert to 2 decimal places: multiply by 100 and add the first 2 decimal places
          const scaledResult = result * BigInt(100) + (remainder * BigInt(100)) / divisor;
          
          // Convert to decimal string with 2 decimal places
          const integerPart = scaledResult / BigInt(100);
          const decimalPart = scaledResult % BigInt(100);
          const decimalString = decimalPart.toString().padStart(2, '0');
          
          return `${integerPart}.${decimalString}`;
        };

        // Get current token balances directly from Uniswap and convert to proper scale
        const token0Balance = convertWeiToDecimal(uniswapPosition.depositedToken0, uniswapPosition.token0Decimals);
        const token1Balance = convertWeiToDecimal(uniswapPosition.depositedToken1, uniswapPosition.token1Decimals);

        // Calculate total fees collected (uncollected fees) and convert to proper scale
        const totalFeesToken0 = convertWeiToDecimal(uniswapPosition.collectedFeesToken0, uniswapPosition.token0Decimals);
        const totalFeesToken1 = convertWeiToDecimal(uniswapPosition.collectedFeesToken1, uniswapPosition.token1Decimals);


        await prisma.liquidityPositions.update({
          where: { id: position.id },
          data: {
            token0Balance,
            token1Balance,
            token0FeesCollected: totalFeesToken0,
            token1FeesCollected: totalFeesToken1,
            lastUpdated: new Date(),
          },
        });

        updatedCount++;
        console.log(`Updated position ${position.id} (NFT ${position.nftId})`);
      } catch (error) {
        errorCount++;
        console.error(`Error updating position ${position.id}:`, error);
      }
    });

    await Promise.all(updatePromises);

    console.log(`Successfully updated ${updatedCount} out of ${liquidityPositions.length} positions (${errorCount} errors)`);

    return NextResponse.json({
      message: 'NFT positions update completed',
      updated: updatedCount,
      errors: errorCount,
      total: liquidityPositions.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in NFT positions update cron job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update NFT positions',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
