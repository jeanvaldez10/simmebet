import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from "@/lib/prisma";

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

    const swaps = await prisma.formattedSwap.findMany({
      where: {
        marketId: marketId,
      },
      orderBy: {
        timestamp: "asc",
      },
    });
    console.log('swaps', swaps.length);

    return NextResponse.json({ swaps });
  } catch (error) {
    console.error("Error fetching market swaps:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
