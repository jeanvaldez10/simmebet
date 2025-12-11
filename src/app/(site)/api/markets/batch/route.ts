import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { IMarketData } from "@/interfaces/market";

export const revalidate = 30;

export async function POST(req: NextRequest) {
  try {
    const { marketIds } = await req.json();

    if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
      return NextResponse.json(
        { message: "Market IDs array is required" },
        { status: 400 }
      );
    }

    // Validate that all IDs are strings
    if (!marketIds.every((id) => typeof id === "string")) {
      return NextResponse.json(
        { message: "All market IDs must be strings" },
        { status: 400 }
      );
    }

    // Check if any of the identifiers are contract addresses
    const contractAddresses = marketIds.filter(
      (id) => id.startsWith("0x") && id.length === 42
    );
    const regularIds = marketIds.filter(
      (id) => !(id.startsWith("0x") && id.length === 42)
    );

    const marketIdMap: Record<string, string> = {};

    // If we have contract addresses, look them up to get market IDs
    if (contractAddresses.length > 0) {
      const markets = await prisma.market.findMany({
        where: {
          contractAddress: { in: contractAddresses },
        },
        select: {
          id: true,
          contractAddress: true,
        },
      });

      // Create mapping from contract address to market ID
      markets.forEach((market) => {
        if (market.contractAddress) {
          marketIdMap[market.contractAddress] = market.id;
        }
      });
    }

    // Combine regular IDs and resolved contract addresses
    const allMarketIds = [
      ...regularIds,
      ...contractAddresses.map((addr) => marketIdMap[addr]).filter(Boolean),
    ];

    if (allMarketIds.length === 0) {
      return NextResponse.json(
        { message: "No valid market IDs found" },
        { status: 404 }
      );
    }

    // Fetch all market details in a single query
    const markets = await prisma.market.findMany({
      where: {
        id: { in: allMarketIds },
      },
      include: {
        categoryAssignments: {
          include: {
            category: true,
          },
        },
      },
    });

    // Transform markets to match the individual API structure
    const transformedMarkets = markets.map((market) => {
      // Transform category assignments to categories array
      const categories =
        market.categoryAssignments?.map((assignment) => ({
          id: assignment.category.id,
          name: assignment.category.name,
          icon: assignment.category.icon,
        })) || [];

      // Calculate percentages
      const yesPercentage =
        (market.yesPrice / (market.yesPrice + market.noPrice)) * 100;
      const noPercentage =
        (market.noPrice / (market.yesPrice + market.noPrice)) * 100;

      return {
        ...market,
        date: market.date || undefined,
        image: market.image || undefined,
        imageSquare: market.imageSquare || undefined,
        contractAddress: market.contractAddress as `0x${string}`,
        yesTokenAddress: market.yesTokenAddress as `0x${string}`,
        noTokenAddress: market.noTokenAddress as `0x${string}`,
        resolvedOption: market.resolvedOption || undefined,
        resolvedTime: market.resolvedTime || undefined,
        isTie: market.isTie ?? undefined,
        noSideName: market.noSideName || undefined,
        noSideIcon: market.noSideIcon || undefined,
        yesSideName: market.yesSideName || undefined,
        yesSideIcon: market.yesSideIcon || undefined,
        creatorName: market.creatorName || "",
        creatorAvatar: market.creatorAvatar || "",
        categories,
        yesPercentage,
        noPercentage,
      };
    });

    // Create response mapping original IDs to market data
    const responseData: Record<string, { market: IMarketData } | null> = {};

    marketIds.forEach((originalId) => {
      let marketId = originalId;

      // If it's a contract address, use the mapped market ID
      if (originalId.startsWith("0x") && originalId.length === 42) {
        marketId = marketIdMap[originalId];
      }

      const market = transformedMarkets.find((m) => m.id === marketId);
      responseData[originalId] = market ? { market } : null;
    });

    const response = NextResponse.json(responseData);

    // Cache for 30 seconds
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("Error fetching market details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
