import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { MarketStatus } from "@prisma/client";

export async function GET() {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const markets = await prisma.market.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
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

    // Transform category assignments to categories array for each market
    const marketsWithCategories = markets.map((market) => ({
      ...market,
      categories:
        market.categoryAssignments?.map(
          (assignment: {
            category: { id: string; name: string; icon: string | null };
          }) => ({
            id: assignment.category.id,
            name: assignment.category.name,
            icon: assignment.category.icon,
          })
        ) || [],
    }));

    return NextResponse.json({ markets: marketsWithCategories });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    // Validate required fields
    const {
      contractAddress,
      poolAddress,
      blockchain = "ARBITRUM",
      status = "ACTIVE",
      name,
      question,
      date,
      image,
      volume = 0,
      createdBy = "Simmi",
      rules = [],
      yesPrice = 50,
      noPrice = 50,
      totalLiquidity = 0,
      yesTokenAddress,
      yesIcon = "/images/cup.png",
      noTokenAddress,
      noIcon = "/images/cup.png",
      currentRatio = 0,
      oracleMarketId,
      oracleType = "MANUAL",
      tieIsPossible = false,
      noSideIcon = "/images/cup.png",
      noSideName = "No",
      yesSideIcon = "/images/cup.png",
      yesSideName = "Yes",
      creatorAvatar = "/images/simmi.jpg",
      creatorName = "Simmi",
      orderIndex = 0,
      categoryIds = [],
    } = body;

    // Validate required fields
    if (!contractAddress || !poolAddress || !name || !question) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: contractAddress, poolAddress, name, question",
        },
        { status: 400 }
      );
    }

    // Validate status enum
    const validStatus = status.toUpperCase() as MarketStatus;
    if (!Object.values(MarketStatus).includes(validStatus)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be ACTIVE or RESOLVED" },
        { status: 400 }
      );
    }

    // Validate categories if provided
    if (categoryIds && categoryIds.length > 0) {
      const categoriesExist = await prisma.marketCategory.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categoriesExist.length !== categoryIds.length) {
        return NextResponse.json(
          { error: "One or more invalid category IDs" },
          { status: 400 }
        );
      }
    }

    // Create the market
    const market = await prisma.market.create({
      data: {
        contractAddress,
        poolAddress,
        blockchain,
        status: validStatus,
        name,
        question,
        date: date ? new Date(date) : null,
        image: image || null,
        volume: parseFloat(volume) || 0,
        createdBy,
        rules: Array.isArray(rules) ? rules : [],
        isResolved: validStatus === "RESOLVED",
        yesPrice: parseFloat(yesPrice) || 50,
        noPrice: parseFloat(noPrice) || 50,
        totalLiquidity: parseFloat(totalLiquidity) || 0,
        yesTokenAddress: yesTokenAddress || null,
        yesIcon: yesIcon || null,
        noTokenAddress: noTokenAddress || null,
        noIcon: noIcon || null,
        currentRatio: currentRatio ? parseFloat(currentRatio.toString()) : null,
        oracleMarketId: oracleMarketId || null,
        oracleType: oracleType || null,
        tieIsPossible: Boolean(tieIsPossible),
        noSideIcon: noSideIcon || null,
        noSideName: noSideName || null,
        yesSideIcon: yesSideIcon || null,
        yesSideName: yesSideName || null,
        creatorAvatar: creatorAvatar || null,
        creatorName: creatorName || null,
        orderIndex: parseInt(orderIndex) || 0,
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

    return NextResponse.json(
      {
        success: true,
        market,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating market:", error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      if (error.message.includes("contractAddress")) {
        return NextResponse.json(
          { error: "A market with this contract address already exists" },
          { status: 409 }
        );
      }
      if (error.message.includes("poolAddress")) {
        return NextResponse.json(
          { error: "A market with this pool address already exists" },
          { status: 409 }
        );
      }
      if (error.message.includes("yesTokenAddress")) {
        return NextResponse.json(
          { error: "A market with this yes token address already exists" },
          { status: 409 }
        );
      }
      if (error.message.includes("noTokenAddress")) {
        return NextResponse.json(
          { error: "A market with this no token address already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create market" },
      { status: 500 }
    );
  }
}
