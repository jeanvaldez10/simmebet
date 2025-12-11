import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/services/userService";
import { marketService } from "@/services/marketService";
import api from "@/services/api/config";
import { prisma } from "@/lib/prisma";
import { getTransfersAndWriteBalanceChanges } from "@/utils/onchain/transfers";

const TICK_SPACING = 200;

// Quantize tick to the nearest multiple of tick spacing
function quantizeTick(tick: number, spacing: number = TICK_SPACING): number {
  return Math.round(tick / spacing) * spacing;
}

// Convert odds (percentage) to tick
function oddsToTick(oddsPercent: number): number {
  // Clamp odds between 0.01 and 99.99 to avoid extreme values
  const clampedOdds = Math.max(0.01, Math.min(99.99, oddsPercent));

  // Convert percentage to price (0.0001 to 0.9999)
  const price = clampedOdds / 100;

  // Convert price to tick using the formula: tick = log(price) / log(1.0001)
  // For a prediction market, we use the price ratio
  const tick = Math.round(Math.log(price / (1 - price)) / Math.log(1.0001));

  // Quantize to tick spacing
  return quantizeTick(tick);
}

// Calculate lower and upper ticks based on odds and range
function calculateTicks(odds: number, selectRange: "single" | "3" | "5") {
  const centerTick = oddsToTick(odds);

  if (selectRange === "single") {
    // Single tick position - but ensure minimum spacing of 200
    return {
      lowerTick: centerTick,
      upperTick: centerTick + TICK_SPACING,
    };
  }

  // Calculate tick range based on percentage range
  // For ±3% or ±5%, we need to convert to tick space
  const rangePercent = selectRange === "3" ? 3 : 5;
  const lowerOdds = Math.max(0.01, odds - rangePercent);
  const upperOdds = Math.min(99.99, odds + rangePercent);

  let lowerTick = oddsToTick(lowerOdds);
  let upperTick = oddsToTick(upperOdds);

  // Ensure minimum spacing of 200 ticks
  const currentSpacing = upperTick - lowerTick;
  if (currentSpacing < TICK_SPACING) {
    // Expand the range symmetrically to meet minimum spacing
    const additionalSpacing = TICK_SPACING - currentSpacing;
    const halfSpacing = Math.floor(additionalSpacing / 2);

    lowerTick = quantizeTick(lowerTick - halfSpacing);
    upperTick = quantizeTick(upperTick + (additionalSpacing - halfSpacing));

    // Double-check spacing after quantization
    if (upperTick - lowerTick < TICK_SPACING) {
      upperTick = lowerTick + TICK_SPACING;
    }
  }

  return {
    lowerTick,
    upperTick,
  };
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ marketId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { marketId } = await context.params;

    if (!marketId) {
      return NextResponse.json(
        { error: "Market ID is required" },
        { status: 400 }
      );
    }

    const dbUser = await getUserById(session.user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the market to get the contract address
    const { market } = await marketService.getMarketById(marketId);

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (!market.contractAddress) {
      return NextResponse.json(
        { error: "Market contract address not found" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { odds, selectRange, liquidityAmount } = body;

    // Calculate ticks from odds and range
    const { lowerTick, upperTick } = calculateTicks(100 - odds, selectRange);

    // Log the request data
    console.log("Update Liquidity Request:", {
      userId: dbUser.id,
      marketId,
      contractAddress: market.contractAddress,
      lowerTick,
      upperTick,
      liquidityAmount,
    });

    const response = await api.post(
      `/bets/${dbUser.id}/zap-range/${market.contractAddress}`,
      {
        tickLower: lowerTick,
        tickUpper: upperTick,
        amountIn: liquidityAmount,
      }
    );

    console.log("Zap-range response:", response.data);

    const responseData = {
      success: true,
      message: "Liquidity position created successfully",
      txHash: response.data.txHash,
      liquidityNftId: response.data.liquidityNftId,
      data: {
        marketId,
        contractAddress: market.contractAddress,
        lowerTick,
        upperTick,
        liquidityAmount,
      },
    };

    // Start background operations without waiting
    setImmediate(async () => {
      try {
        await Promise.all([
          // Transfer processing
          response.data.txHash
            ? getTransfersAndWriteBalanceChanges({
                txHash: response.data.txHash as `0x${string}`,
                walletAddress: dbUser.walletAddress as `0x${string}`,
                userId: dbUser.id,
                marketId: market.id,
                rpcUrl: "https://arb1.arbitrum.io/rpc",
                chainId: 42161,
              })
            : Promise.resolve(),
          // Create liquidity position if NFT ID is returned
          response.data.liquidityNftId
            ? prisma.liquidityPositions.create({
                data: {
                  userId: dbUser.id,
                  marketId: market.id,
                  nftId: response.data.liquidityNftId.toString(),
                  isBurnt: false,
                  autoclose: false,
                },
              })
            : Promise.resolve(),
          // User activity creation
          prisma.userActivity.create({
            data: {
              userId: dbUser.id,
              action: "ADD_LP",
              details: {
                message: `Added liquidity: $${liquidityAmount} at ${odds}% Belief`,
                amount: liquidityAmount.toString(),
                txHash: response.data.txHash,
                marketId: market.id,
                lowerTick,
                upperTick,
                odds,
                selectRange,
              },
              timestamp: new Date(),
            },
          }),
        ]);
      } catch (error) {
        console.error("[UPDATE_LIQUIDITY] Background operations error:", error);
      }
    });

    // Return success response immediately
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error processing liquidity update:", error);
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
