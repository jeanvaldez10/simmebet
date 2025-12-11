import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active liquidity positions for the user
    const liquidityPositions = await prisma.liquidityPositions.findMany({
      where: {
        userId: session.user.id,
        isBurnt: false, // Only active positions
        nftId: {
          not: null, // Must have an NFT
        },
      },
      include: {
        market: {
          select: {
            id: true,
            name: true,
            question: true,
            image: true,
            contractAddress: true,
            status: true,
            resolvedOption: true,
            date: true,
            yesPrice: true,
            noPrice: true,
            yesTokenAddress: true,
            noTokenAddress: true,
            poolAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recent first
      },
    });

    // Calculate current values for each liquidity position
    const positionsWithValues = await Promise.all(
      liquidityPositions.map(async (position) => {
        const market = position.market;
        
        // Get current token balances for this position
        const token0Balance = position.token0Balance ? Number(position.token0Balance) : 0;
        const token1Balance = position.token1Balance ? Number(position.token1Balance) : 0;
        
        // Calculate current value based on market prices
        const yesPrice = market.yesPrice || 0;
        const noPrice = market.noPrice || 0;
        
        // Calculate USD value of tokens
        // Each token is worth $2 at 100% odds, so value = tokens * (odds/100) * 2
        const token0Value = token0Balance * (yesPrice / 100) * 2;
        const token1Value = token1Balance * (noPrice / 100) * 2;
        const totalValue = token0Value + token1Value;
        
        // Calculate fees collected
        const feesCollected = Number(position.token0FeesCollected) + Number(position.token1FeesCollected);
        
        // Calculate total P&L (current value + fees - initial investment)
        // For now, we'll use the current value as the P&L since we don't have initial investment data
        const currentPnL = totalValue + feesCollected;
        
        return {
          id: position.id,
          marketId: position.marketId,
          nftId: position.nftId,
          marketName: market.name,
          marketQuestion: market.question,
          marketImage: market.image,
          marketAddress: market.contractAddress,
          marketStatus: market.status,
          marketDate: market.date,
          isResolved: market.status === 'RESOLVED',
          resolvedOption: market.resolvedOption,
          
          // Token balances
          token0Balance,
          token1Balance,
          token0Value,
          token1Value,
          totalValue,
          
          // Fees and P&L
          feesCollected,
          currentPnL,
          
          // Position details
          lowerOdds: position.lowerOdds ? Number(position.lowerOdds) : null,
          upperOdds: position.upperOdds ? Number(position.upperOdds) : null,
          createdAt: position.createdAt,
          lastUpdated: position.lastUpdated,
          
          // Market prices
          yesPrice,
          noPrice,
        };
      })
    );

    // Calculate totals
    const totalValue = positionsWithValues.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalFees = positionsWithValues.reduce((sum, pos) => sum + pos.feesCollected, 0);
    const totalPnL = positionsWithValues.reduce((sum, pos) => sum + pos.currentPnL, 0);
    const activePositions = positionsWithValues.filter(pos => pos.marketStatus === 'ACTIVE').length;
    const resolvedPositions = positionsWithValues.filter(pos => pos.marketStatus === 'RESOLVED').length;

    return NextResponse.json({
      positions: positionsWithValues,
      summary: {
        totalValue,
        totalFees,
        totalPnL,
        activePositions,
        resolvedPositions,
        totalPositions: positionsWithValues.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user liquidity positions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
