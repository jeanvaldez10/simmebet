import { NextResponse, type NextRequest } from 'next/server'

import { prisma } from "@/lib/prisma";
import { loadGraphBins } from "@/utils/liquidity/getBins";

// Cache the response for 15 seconds
export const revalidate = 15;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "Market ID is required" }, { status: 400 });
    }

    // Check if the identifier is a contract address
    const isContractAddress = id.startsWith('0x') && id.length === 42;
    
    let marketId = id;
    
    if (isContractAddress) {
      // Look up the market by contract address to get the market ID
      const market = await prisma.market.findUnique({
        where: { contractAddress: id },
        select: { id: true }
      });
      
      if (!market) {
        return NextResponse.json({ message: "Market not found" }, { status: 404 });
      }
      
      marketId = market.id;
    }

    const market = await prisma.market.findUnique({
      where: {
        id: marketId,
      },
    });

    if (!market) {
      return NextResponse.json({ message: "Market not found" }, { status: 404 });
    }

    const bins = await loadGraphBins(market.poolAddress);

    const formattedBins = bins.map(bin => ({
      price0: bin.price0,
      price1: bin.price1,
      liquidityLockedToken0: bin.liquidityLockedToken0,
      liquidityLockedToken1: bin.liquidityLockedToken1,
      tickIndex: bin.tickIdx,
      isCurrent: bin.isCurrent,
      liquidityActiveChart: bin.liquidityActive,
    }));

    return NextResponse.json(
      { bins: formattedBins },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching market swaps:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
