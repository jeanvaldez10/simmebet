import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/prisma";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    // Get markets ordered by volume
    const marketsByVolume = await prisma.market.findMany({
      select: {
        id: true,
        name: true,
        question: true,
        volume: true,
        totalLiquidity: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        volume: "desc",
      },
      take: 20,
    });

    // Get markets ordered by liquidity
    const marketsByLiquidity = await prisma.market.findMany({
      select: {
        id: true,
        name: true,
        question: true,
        volume: true,
        totalLiquidity: true,
        status: true,
        createdAt: true,
      },
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        totalLiquidity: "desc",
      },
      take: 20,
    });

    // Get market activity counts for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const marketActivity = await prisma.marketActivity.groupBy({
      by: ["marketId"],
      _count: {
        id: true,
      },
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 20,
    });

    // Get market details for most active markets
    const activeMarketIds = marketActivity.map((m) => m.marketId);
    const activeMarkets = await prisma.market.findMany({
      where: {
        id: {
          in: activeMarketIds,
        },
      },
      select: {
        id: true,
        name: true,
        question: true,
        volume: true,
        totalLiquidity: true,
        status: true,
      },
    });

    // Combine activity count with market details
    const marketsByActivity = marketActivity.map((activity) => {
      const market = activeMarkets.find((m) => m.id === activity.marketId);
      return {
        ...market,
        activityCount: activity._count.id,
      };
    });

    return NextResponse.json({
      byVolume: marketsByVolume,
      byLiquidity: marketsByLiquidity,
      byActivity: marketsByActivity,
    });
  } catch (error) {
    console.error("Error fetching market rankings:", error);
    return NextResponse.json(
      { error: "Failed to fetch market rankings" },
      { status: 500 }
    );
  }
}
