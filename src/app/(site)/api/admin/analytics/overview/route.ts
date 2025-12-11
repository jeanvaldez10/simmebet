import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/prisma";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    // Get total liquidity across all markets
    const liquidityResult = await prisma.market.aggregate({
      _sum: {
        totalLiquidity: true,
      },
      where: {
        status: "ACTIVE",
      },
    });

    // Get total volume across all markets
    const volumeResult = await prisma.market.aggregate({
      _sum: {
        volume: true,
      },
    });

    // Get total fees collected from market swaps (actual fees from database)
    const totalFeesResult = await prisma.marketSwap.aggregate({
      _sum: {
        fee: true,
      },
    });

    // Get 24h volume and fees
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const volume24h = await prisma.formattedSwap.aggregate({
      _sum: {
        volume: true,
      },
      where: {
        timestamp: {
          gte: oneDayAgo,
        },
      },
    });

    // Get 24h fees from actual swap data
    const fees24hResult = await prisma.marketSwap.aggregate({
      _sum: {
        fee: true,
      },
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    const totalVolume = volumeResult._sum.volume || 0;
    const totalFees = totalFeesResult._sum.fee || 0;
    const fees24h = fees24hResult._sum.fee || 0;

    // Calculate trends (comparing last 24h to previous 24h)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const volumePrevious24h = await prisma.formattedSwap.aggregate({
      _sum: {
        volume: true,
      },
      where: {
        timestamp: {
          gte: twoDaysAgo,
          lt: oneDayAgo,
        },
      },
    });

    const volumeTrend =
      (volumePrevious24h._sum.volume || 0) > 0
        ? (((volume24h._sum.volume || 0) -
            (volumePrevious24h._sum.volume || 0)) /
            (volumePrevious24h._sum.volume || 0)) *
          100
        : 0;

    // Calculate fees trend (comparing last 24h to previous 24h)
    const feesPrevious24hResult = await prisma.marketSwap.aggregate({
      _sum: {
        fee: true,
      },
      where: {
        createdAt: {
          gte: twoDaysAgo,
          lt: oneDayAgo,
        },
      },
    });

    const feesTrend =
      (feesPrevious24hResult._sum.fee || 0) > 0
        ? ((fees24h - (feesPrevious24hResult._sum.fee || 0)) /
            (feesPrevious24hResult._sum.fee || 0)) *
          100
        : 0;

    // Get liquidity trend (current vs 24h ago)
    // This is a simplified calculation - you may want to track historical liquidity data
    const liquidityTrend = 0; // TODO: Implement proper liquidity tracking over time

    return NextResponse.json({
      totalLiquidity: liquidityResult._sum.totalLiquidity || 0,
      totalVolume: totalVolume,
      totalFees: totalFees,
      volume24h: volume24h._sum.volume || 0,
      fees24h: fees24h,
      trends: {
        liquidity: liquidityTrend,
        volume: volumeTrend,
        fees: feesTrend,
      },
    });
  } catch (error) {
    console.error("Error fetching overview analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview analytics" },
      { status: 500 }
    );
  }
}
