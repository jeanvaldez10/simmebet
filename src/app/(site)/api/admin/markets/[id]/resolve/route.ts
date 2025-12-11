import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { MarketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import api from "@/services/api/config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { id } = await params;
    const { outcome, evidence, isTie } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 }
      );
    }

    if (outcome === undefined || outcome === null) {
      return NextResponse.json(
        { error: "Outcome is required" },
        { status: 400 }
      );
    }

    if (isTie === undefined || isTie === null) {
      return NextResponse.json(
        { error: "isTie parameter is required" },
        { status: 400 }
      );
    }

    // Get market data to get contract address
    const market = await prisma.market.findUnique({
      where: { id },
    });

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    // Check if market is already resolved
    if (market.status === "RESOLVED" || market.isResolved) {
      return NextResponse.json(
        { error: "Market is already resolved" },
        { status: 400 }
      );
    }

    if (!market.contractAddress) {
      return NextResponse.json(
        { error: "Market contract address not found" },
        { status: 400 }
      );
    }

    // Call external API to resolve market
    const response = await api.post(
      `/market/${market.contractAddress}/resolve`,
      {
        outcome: isTie ? 0 : outcome,
        isTie: isTie,
      }
    );

    await prisma.market.update({
      where: { id },
      data: {
        isResolved: true,
        status: MarketStatus.RESOLVED,
        resolvedOption: isTie
          ? "Tie"
          : outcome === 0
          ? market.noSideName
          : market.yesSideName,
        resolvedTime: new Date(),
        resolutionEvidence: evidence || null,
        isTie: isTie,
      },
    });

    return NextResponse.json({
      success: true,
      ...response.data,
    });
  } catch (error) {
    console.error("Market resolution failed:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
