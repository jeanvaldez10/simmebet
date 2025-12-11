import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  const { address } = await context.params;
  try {
    if (!address || typeof address !== "string") {
      return NextResponse.json({ message: "Contract address is required" }, { status: 400 });
    }

    // Look up the market by contract address to get the market ID
    const market = await prisma.market.findUnique({
      where: { contractAddress: address },
      select: { id: true }
    });
    
    if (!market) {
      return NextResponse.json({ message: "Market not found" }, { status: 404 });
    }

    const swaps = await prisma.formattedSwap.findMany({
      where: {
        marketId: market.id,
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
