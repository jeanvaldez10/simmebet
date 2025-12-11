import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query the materialized view for the most recent two hourly data points for each market
    const marketData = await prisma.$queryRaw<
      Array<{
        hour: Date;
        marketId: string;
        high: number;
        open: number;
        close: number;
        low: number;
      }>
    >`
      SELECT 
        hour,
        "marketId",
        high,
        open,
        close,
        low
      FROM market_data_one_hour
      ORDER BY hour DESC
      LIMIT 100
    `;

    if (!marketData || marketData.length === 0) {
      return NextResponse.json({
        tickerItems: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    // Group data by marketId and get the most recent two entries for each market
    const marketGroups = marketData.reduce((acc, entry) => {
      if (!acc[entry.marketId]) {
        acc[entry.marketId] = [];
      }
      acc[entry.marketId].push(entry);
      return acc;
    }, {} as Record<string, typeof marketData>);

    // Get unique market IDs to fetch market information
    const marketIds = Object.keys(marketGroups);

    // Fetch market information for all markets
    const markets = await prisma.market.findMany({
      where: {
        id: {
          in: marketIds,
        },
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        question: true,
        contractAddress: true,
        categoryAssignments: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Create a map for quick market lookup
    const marketMap = new Map(markets.map((market) => [market.id, market]));

    // Calculate hourly changes for each market
    const tickerItems = Object.entries(marketGroups)
      .map(([marketId, entries]) => {
        // Sort by hour descending to get most recent first
        const sortedEntries = entries.sort(
          (a, b) => new Date(b.hour).getTime() - new Date(a.hour).getTime()
        );

        if (sortedEntries.length < 2) {
          // If we don't have at least 2 data points, skip this market
          return null;
        }

        const currentHour = sortedEntries[0];
        const previousHour = sortedEntries[1];

        // Calculate the change between the two most recent hours
        const currentPrice = currentHour.close;
        const previousPrice = previousHour.close;
        const priceChange = currentPrice - previousPrice;
        const percentChange =
          previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
        const isPositive = priceChange >= 0;

        // Get market information
        const market = marketMap.get(marketId);

        // Skip if market not found (e.g., resolved/inactive markets)
        if (!market) {
          return null;
        }

        return {
          id: `market-${marketId}`,
          marketName: market.name || market.question || "Unknown Market",
          category:
            market.categoryAssignments?.[0]?.category?.name || "General",
          currentPrice: currentPrice.toFixed(4),
          priceChange: priceChange.toFixed(4),
          percentChange: Math.abs(percentChange).toFixed(2),
          isPositive,
          timestamp: currentHour.hour,
          contractAddress: market.contractAddress,
        };
      })
      .filter(Boolean)
      .slice(0, 20); // Limit to 20 markets for the ticker

    return NextResponse.json({
      tickerItems,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in ticker API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
