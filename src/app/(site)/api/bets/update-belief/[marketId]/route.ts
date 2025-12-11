import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import api from "@/services/api/config";
import { getUserByIdBasic } from "@/services/userService";
import { marketService } from "@/services/marketService";
import { prisma } from "@/lib/prisma";
import { 
  generateTokenChangeMessage,
  getTokenBalances,
  wouldSwapResultInZeroDelta,
} from "@/utils/tokenBalance";
import { indexSingleMarketFromLastBlock } from "@/jobs/marketIndexer";
import { getTransfersAndWriteBalanceChanges } from "@/utils/onchain/transfers";

interface UpdateBeliefRequest {
  beliefPercentage: number;
  amountIn: number;
  idempotencyKey: string;
}

interface UpdateBeliefResponse {
  txHash: string;
  transfers: {
    tokenAddress: string;
    amount: string;
    sender: string;
    recipient: string;
  }[];
  liquidityNftId?: number;
}

// Calculate token deltas directly from transfer events
function calculateDeltasFromEvents(
  transfers: {
    tokenAddress: string;
    amount: string;
    sender: string;
    recipient: string;
  }[],
  userWalletAddress: string,
  yesTokenAddress: string,
  noTokenAddress: string,
  usdcTokenAddress: string
) {
  let yesDelta = 0;
  let noDelta = 0;
  let usdcDelta = 0;

  const tokenAmounts: { yes?: string; no?: string; usdc?: string } = {};

  for (const transfer of transfers) {
    const tokenAddress = transfer.tokenAddress.toLowerCase();
    const amount = Number(transfer.amount);
    const sender = transfer.sender.toLowerCase();
    const recipient = transfer.recipient.toLowerCase();
    const userAddress = userWalletAddress.toLowerCase();

    // Check if user is involved in this transfer
    const isUserSender = sender === userAddress;
    const isUserRecipient = recipient === userAddress;

    if (!isUserSender && !isUserRecipient) {
      continue; // Skip transfers not involving the user
    }

    // Calculate delta based on whether user is sender or recipient
    let delta = 0;
    if (isUserRecipient) {
      // User received tokens (positive delta)
      delta = amount;
    } else if (isUserSender) {
      // User sent tokens (negative delta)
      delta = -amount;
    }

    // Apply delta to appropriate token
    if (tokenAddress === yesTokenAddress.toLowerCase()) {
      yesDelta += delta;
      if (isUserRecipient) {
        tokenAmounts.yes = (amount / 1e18).toFixed(2).toString();
      }
    } else if (tokenAddress === noTokenAddress.toLowerCase()) {
      noDelta += delta;
      if (isUserRecipient) {
        tokenAmounts.no = (amount / 1e18).toFixed(2).toString();
      }
    } else if (tokenAddress === usdcTokenAddress.toLowerCase()) {
      usdcDelta += delta;
      if (isUserRecipient) {
        tokenAmounts.usdc = (amount / 1e6).toFixed(2).toString();
      }
    }
  }

  return {
    yesDelta: yesDelta / 1e18, // Convert from wei to tokens
    noDelta: noDelta / 1e18, // Convert from wei to tokens
    usdcDelta: usdcDelta / 1e6, // Convert from wei to USDC (6 decimals)
    tokenAmounts,
  };
}

export async function POST(
  req: NextRequest & { body: UpdateBeliefRequest },
  context: { params: Promise<{ marketId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { marketId } = await context.params;
  const body = await req.json();
  const amountIn: number = body.amountIn || 0;

  const [dbUser, { market }] = await Promise.all([
    getUserByIdBasic(session.user.id),
    marketService.getMarketByIdBasic(marketId),
  ]);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Get current user token balances to check for zero delta swaps
    const currentBalances = await getTokenBalances(
      dbUser.walletAddress!,
      {
        yesTokenAddress: market.yesTokenAddress!,
        noTokenAddress: market.noTokenAddress!,
        usdcTokenAddress: process.env.USDC_ADDRESS!
      }
    );

    // Check if this update would result in zero delta (no change to holdings)
    const wouldBeZeroDelta = wouldSwapResultInZeroDelta(
      currentBalances,
      amountIn,
      body.beliefPercentage
    );

    if (wouldBeZeroDelta) {
      return NextResponse.json(
        { 
          error: "This update would not change your current holdings. Either change sides for your bet or add more funds.",
          success: false 
        }, 
        { status: 400 }
      );
    }

    // Subtract $0.02 for gas fees before sending to bluff actions service
    const adjustedAmountIn = Math.max(0, amountIn - 0.02);
    
    // External API call with global timeout configured in api service
    const response = await api.post<UpdateBeliefResponse>(
      `/bets/${dbUser?.id}/update-belief/${market.contractAddress}`,
      {
        ...body,
        amountIn: adjustedAmountIn,
      }
    );

    // Calculate deltas directly from transfer events instead of making expensive API calls
    const { yesDelta, noDelta, usdcDelta, tokenAmounts } =
      calculateDeltasFromEvents(
        response.data.transfers,
        dbUser.walletAddress!,
        market.yesTokenAddress!,
        market.noTokenAddress!,
        process.env.USDC_ADDRESS!
      );

    const changeMessage = generateTokenChangeMessage(
      yesDelta,
      noDelta,
      usdcDelta,
      market.question,
      "Updated bet"
    );

    // Record activity and notification
    // If liquidityNftId is present, this is an LP operation, not a bet update
    const activityType = response.data.liquidityNftId ? "ADD_LP" : "UPDATE_BET";
    const activityAmount = amountIn; // Use original amount for activity tracking

    // Optimize: Return response immediately, do heavy operations in background
    const responseData = {
      success: true,
      txHash: response.data.txHash,
      liquidityNftId: response.data.liquidityNftId,
      tokenAmounts,
    };

    // Start background operations without waiting
    setImmediate(async () => {
      try {
        // Run all background operations in parallel
        await Promise.all([
          // Transfer processing
          getTransfersAndWriteBalanceChanges({
            txHash: response.data.txHash as `0x${string}`,
            walletAddress: dbUser.walletAddress as `0x${string}`,
            userId: dbUser.id,
            marketId: market.id,
            rpcUrl: "https://arb1.arbitrum.io/rpc",
            chainId: 42161,
          }),
          // User activity creation
          prisma.userActivity.create({
            data: {
              userId: dbUser.id,
              action: activityType,
              details: {
                message: changeMessage,
                amount: activityAmount.toString(),
                txHash: response.data.txHash,
                marketId: market.id,
                beliefPercentage: body.beliefPercentage,
                tokenDeltas: { yesDelta, noDelta, usdcDelta },
                amountIn,
              },
              timestamp: new Date(),
            },
          }),
          // User position creation
          prisma.userPosition.create({
            data: {
              userId: dbUser.id,
              marketId: market.id,
              amount: amountIn,
              profit: -amountIn,
              bought: true,
              txHash: response.data?.txHash,
            },
          }),
          // Create liquidity position if needed
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
          // Market indexing
          indexSingleMarketFromLastBlock(market.id).catch((error) => {
            console.error(
              `[UPDATE_BELIEF] Error indexing market ${market.id}:`,
              error
            );
          }),
        ]);
      } catch (error) {
        console.error(`[UPDATE_BELIEF] Error in background operations:`, error);
      }
    });

    // Return response immediately
    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error(`[UPDATE_BELIEF] Error occurred during update belief`, {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: dbUser?.id,
      marketId: market?.id,
    });

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
