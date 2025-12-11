import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export async function POST(req: NextRequest) {
  try {
    const { marketIds } = await req.json();
    
    if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
      return NextResponse.json({ message: "Market IDs array is required" }, { status: 400 });
    }

    // Validate that all IDs are strings
    if (!marketIds.every(id => typeof id === "string")) {
      return NextResponse.json({ message: "All market IDs must be strings" }, { status: 400 });
    }

    // Check if any of the identifiers are contract addresses
    const contractAddresses = marketIds.filter(id => id.startsWith('0x') && id.length === 42);
    const regularIds = marketIds.filter(id => !(id.startsWith('0x') && id.length === 42));

    const marketIdMap: Record<string, string> = {};
    
    // If we have contract addresses, look them up to get market IDs
    if (contractAddresses.length > 0) {
      const markets = await prisma.market.findMany({
        where: { 
          contractAddress: { in: contractAddresses }
        },
        select: { 
          id: true, 
          contractAddress: true 
        }
      });
      
      // Create mapping from contract address to market ID
      markets.forEach(market => {
        if (market.contractAddress) {
          marketIdMap[market.contractAddress] = market.id;
        }
      });
    }

    // Combine regular IDs and resolved contract addresses
    const allMarketIds = [
      ...regularIds,
      ...contractAddresses.map(addr => marketIdMap[addr]).filter(Boolean)
    ];

    if (allMarketIds.length === 0) {
      return NextResponse.json({ message: "No valid market IDs found" }, { status: 404 });
    }

    // Fetch last prices for all markets in a single query
    const lastPrices = await prisma.formattedSwap.findMany({
      where: {
        marketId: { in: allMarketIds },
      },
      select: {
        marketId: true,
        price: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Group by marketId and get the most recent price for each market
    const latestPricesByMarket: Record<string, { price: number; timestamp: Date }> = {};
    
    lastPrices.forEach(swap => {
      if (!latestPricesByMarket[swap.marketId] || 
          swap.timestamp > latestPricesByMarket[swap.marketId].timestamp) {
        latestPricesByMarket[swap.marketId] = {
          price: swap.price,
          timestamp: swap.timestamp
        };
      }
    });

    // Create response mapping original IDs to prices
    const responseData: Record<string, { price: number; timestamp: Date } | null> = {};
    
    marketIds.forEach(originalId => {
      let marketId = originalId;
      
      // If it's a contract address, use the mapped market ID
      if (originalId.startsWith('0x') && originalId.length === 42) {
        marketId = marketIdMap[originalId];
      }
      
      responseData[originalId] = marketId ? latestPricesByMarket[marketId] || null : null;
    });

    const response = NextResponse.json(responseData);
    
    // Cache for 30 seconds
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    
    return response;
  } catch (error) {
    console.error("Error fetching market last prices:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
