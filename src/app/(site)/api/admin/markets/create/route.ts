import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import {
  marketCreationService,
  CreateMarketRequest,
} from "@/services/api/marketCreationService";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body: CreateMarketRequest = await req.json();

    console.log("Creating market via external API:", body);

    const response = await marketCreationService.createMarket(body);

    // Create the market
    const market = await prisma.market.create({
      data: {
        contractAddress: response.marketAddress,
        poolAddress: response.poolKey,
        blockchain: "ARBITRUM",
        status: "ACTIVE",
        name: body.marketName,
        question: body.marketName,
        date: body.date ? new Date(body.date) : null,
        image: body.image || null,
        imageSquare: body.imageSquare || null,
        volume: 0,
        createdBy: "Simmi",
        rules: Array.isArray(body.rules) ? body.rules : [],
        isResolved: false,
        yesTokenAddress: response.yesTokenAddress || null,
        yesIcon: body.outcomes[1].icon || null,
        noTokenAddress: response.noTokenAddress || null,
        noIcon: body.outcomes[0].icon || null,
        currentRatio: body.liquidity.initialOdds
          ? parseFloat(body.liquidity.initialOdds.toString())
          : null,
        oracleMarketId: response.oracleMarketId || null,
        oracleType: "MANUAL",
        tieIsPossible: Boolean(body.tieIsPossible),
        noSideIcon: body.outcomes[0].icon || null,
        noSideName: body.outcomes[0].name || null,
        noSideSymbol: body.outcomes[0].symbol || null,
        yesSideIcon: body.outcomes[1].icon || null,
        yesSideName: body.outcomes[1].name || null,
        yesSideSymbol: body.outcomes[1].symbol || null,
        creatorAvatar: "/images/simmi.jpg",
        creatorName: "Simmi",
      },
      include: {
        categoryAssignments: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    // Create category assignments if categories are provided
    if (body.categoryIds && body.categoryIds.length > 0) {
      await prisma.marketCategoryAssignment.createMany({
        data: body.categoryIds.map((categoryId) => ({
          marketId: market.id,
          categoryId: categoryId,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      ...response,
      marketId: market.id,
    });
  } catch (error) {
    console.error("Market creation failed:", error);

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
