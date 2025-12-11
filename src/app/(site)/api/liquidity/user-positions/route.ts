import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all the user's active liquidity positions across all markets
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
            image: true,
            contractAddress: true,
            status: true,
            resolvedOption: true,
            date: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recent first
      },
    });

    // Transform the data to a more usable format
    const positionsData = liquidityPositions.map((lp) => ({
      id: lp.id,
      userId: lp.userId,
      marketId: lp.marketId,
      marketName: lp.market.name,
      marketImage: lp.market.image,
      marketAddress: lp.market.contractAddress,
      marketStatus: lp.market.status,
      marketDate: lp.market.date,
      nftId: lp.nftId,
      isBurnt: lp.isBurnt,
      autoclose: lp.autoclose,
      autocloseTime: lp.autocloseTime,
      createdAt: lp.createdAt,
      token0FeesCollected: Number(lp.token0FeesCollected),
      token1FeesCollected: Number(lp.token1FeesCollected),
      token0Balance: lp.token0Balance ? Number(lp.token0Balance) : null,
      token1Balance: lp.token1Balance ? Number(lp.token1Balance) : null,
      lowerOdds: lp.lowerOdds ? Number(lp.lowerOdds) : null,
      upperOdds: lp.upperOdds ? Number(lp.upperOdds) : null,
    }));

    return NextResponse.json({
      liquidityPositions: positionsData,
    });
  } catch (error) {
    console.error("Error fetching user liquidity positions:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
