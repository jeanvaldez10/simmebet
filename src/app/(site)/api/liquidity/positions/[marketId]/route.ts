import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ marketId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { marketId } = await context.params;

    if (!marketId || typeof marketId !== "string") {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 }
      );
    }

    // Check if this is a request for position data (summary)
    const { searchParams } = new URL(request.url);
    const includeData = searchParams.get("includeData") === "true";

    // Find all the user's liquidity positions for this market
    const liquidityPositions = await prisma.liquidityPositions.findMany({
      where: {
        userId: session.user.id,
        marketId: marketId,
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
            poolAddress: true,
            totalLiquidity: includeData,
            yesPrice: includeData,
            noPrice: includeData,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recent first
      },
    });

    if (!liquidityPositions || liquidityPositions.length === 0) {
      return NextResponse.json(
        { error: "No liquidity positions found" },
        { status: 404 }
      );
    }

    // Transform the data to match our interface
    const positionsData = liquidityPositions.map((liquidityPosition) => ({
      id: liquidityPosition.id,
      userId: liquidityPosition.userId,
      marketId: liquidityPosition.marketId,
      nftId: liquidityPosition.nftId,
      isBurnt: liquidityPosition.isBurnt,
      autoclose: liquidityPosition.autoclose,
      autocloseTime: liquidityPosition.autocloseTime,
      createdAt: liquidityPosition.createdAt,
      token0FeesCollected: Number(liquidityPosition.token0FeesCollected),
      token1FeesCollected: Number(liquidityPosition.token1FeesCollected),
      market: liquidityPosition.market,
    }));

    // If requesting position data, include calculated summary for all positions
    if (includeData) {
      const positionsWithData = liquidityPositions.map((liquidityPosition) => {
        const token0Fees = Number(liquidityPosition.token0FeesCollected);
        const token1Fees = Number(liquidityPosition.token1FeesCollected);
        const totalFeesCollected = token0Fees + token1Fees;

        // Calculate time elapsed since position creation
        const now = new Date();
        const createdAt = liquidityPosition.createdAt;
        const timeDiffMs = now.getTime() - createdAt.getTime();
        const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (timeDiffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        const timeElapsed = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        // Token balances are already converted from wei in the database
        const token0Balance = Number(liquidityPosition.token0Balance || 0);
        const token1Balance = Number(liquidityPosition.token1Balance || 0);

        const holdingNo = Number(liquidityPosition.lowerOdds || 0);
        const holdingYes = Number(liquidityPosition.upperOdds || 0);

        // Calculate USD value directly using market prices (same as PositionSummaryCard)
        const noTokenValue = token0Balance * liquidityPosition.market.noPrice;
        const yesTokenValue = token1Balance * liquidityPosition.market.yesPrice;
        const yourLp = noTokenValue + yesTokenValue;

        return {
          position: {
            id: liquidityPosition.id,
            userId: liquidityPosition.userId,
            marketId: liquidityPosition.marketId,
            nftId: liquidityPosition.nftId,
            isBurnt: liquidityPosition.isBurnt,
            autoclose: liquidityPosition.autoclose,
            autocloseTime: liquidityPosition.autocloseTime,
            createdAt: liquidityPosition.createdAt,
            token0FeesCollected: Number(liquidityPosition.token0FeesCollected),
            token1FeesCollected: Number(liquidityPosition.token1FeesCollected),
            market: liquidityPosition.market,
          },
          positionData: {
            token0Balance,
            token1Balance,
            feesCollected: totalFeesCollected,
            timeElapsed,
            holdingNo,
            holdingYes,
            yourLp,
            autoclose: liquidityPosition.autoclose,
            autocloseTime: liquidityPosition.autocloseTime,
          },
        };
      });

      return NextResponse.json({
        liquidityPositions: positionsWithData.map((p) => p.position),
        positionsData: positionsWithData.map((p) => p.positionData),
        // For backward compatibility, also include the first position
        liquidityPosition: positionsWithData[0]?.position,
        positionData: positionsWithData[0]?.positionData,
      });
    }

    return NextResponse.json({
      liquidityPositions: positionsData,
      // For backward compatibility, also include the first position
      liquidityPosition: positionsData[0],
    });
  } catch (error) {
    console.error("Error fetching liquidity position:", error);
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
