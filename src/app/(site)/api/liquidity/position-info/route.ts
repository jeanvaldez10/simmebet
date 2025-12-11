import { NextRequest, NextResponse } from "next/server";
import api from "@/services/api/config";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId } = body;

    if (!tokenId) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    // Get real-time data from external API
    const response = await api.post("/bets/position-info/", body);
    const positionInfo = response.data;

    // Update database with latest data to keep in sync
    if (positionInfo) {
      try {
        await prisma.liquidityPositions.updateMany({
          where: {
            nftId: tokenId.toString(),
            isBurnt: false,
          },
          data: {
            token0FeesCollected: Number(positionInfo.token0Fees) / 1e18,
            token1FeesCollected: Number(positionInfo.token1Fees) / 1e18,
            token0Balance: Number(positionInfo.token0Balance) / 1e18,
            token1Balance: Number(positionInfo.token1Balance) / 1e18,
            lowerOdds: positionInfo.lowerOdds,
            upperOdds: positionInfo.upperOdds,
            lastUpdated: new Date(),
          },
        });
      } catch (dbError) {
        console.error("Database update failed:", dbError);
        // Continue and return the positionInfo even if DB update fails
      }
    }

    return NextResponse.json(positionInfo);
  } catch (error) {
    console.error("Error in position-info route:", error);
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
