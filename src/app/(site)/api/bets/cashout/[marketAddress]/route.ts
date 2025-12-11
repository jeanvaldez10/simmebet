import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import api from "@/services/api/config";
import { getUserByIdBasic } from "@/services/userService";
import { prisma } from "@/lib/prisma";
import { generateTokenChangeMessage } from "@/utils/tokenBalance";
import { getTransfersAndWriteBalanceChanges } from "@/utils/onchain/transfers";

// type ApiResponse<T> = {
//   error?: string;
// } & T;

interface CashoutRequest {
  amountIn: number;
  idempotencyKey: string;
}

export async function POST(
  req: NextRequest & { body: CashoutRequest },
  context: { params: Promise<{ marketAddress: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { marketAddress } = await context.params;
  const body = await req.json();
  const dbUser = await getUserByIdBasic(session.user.id);

  if (!dbUser?.id) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const market = await prisma.market.findFirst({
    where: { contractAddress: marketAddress },
    select: {
      id: true,
      question: true,
      yesTokenAddress: true,
      noTokenAddress: true,
    },
  });

  if (!market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  const amountIn = body.amountIn;

  try {
    const response = await api.post(
      `/bets/${dbUser?.id}/cashout/${marketAddress}`,
      body
    );
    const amountOut = response.data?.amountOut
      ? Number(response.data.amountOut) / 1e6
      : 0;

    await getTransfersAndWriteBalanceChanges({
      txHash: response.data.txHash as `0x${string}`,
      walletAddress: dbUser.walletAddress as `0x${string}`,
      userId: dbUser.id,
      marketId: market.id,
    });

    const changeMessage = market?.question
      ? generateTokenChangeMessage(
          -amountIn,
          -amountIn,
          amountOut,
          market.question,
          "Cashed out position"
        )
      : "Cashed out position";

    // Calculate net profit: cashout amount - initial investment
    const investments = await prisma.userPosition.aggregate({
      where: {
        userId: dbUser.id,
        marketId: market.id,
        amount: { gt: 0 },
      },
      _sum: { amount: true },
    });

    const totalInvested = Number(investments._sum.amount || 0);
    const netProfit = amountOut - totalInvested;

    await prisma.userPosition.create({
      data: {
        userId: dbUser.id,
        marketId: market.id,
        amount: 0,
        profit: netProfit, // NET PROFIT
        bought: true,
        txHash: response.data?.txHash,
      },
    });

    if (dbUser?.id) {
      await prisma.userActivity.create({
        data: {
          userId: dbUser.id,
          action: "CASHOUT",
          details: {
            timestamp: new Date().toISOString(),
            message: changeMessage,
            txHash: response.data?.txHash,
            marketId: market?.id,
            amount: String(amountOut),
            tokenDeltas: {
              yesDelta: -amountIn,
              noDelta: -amountIn,
              usdcDelta: amountOut,
            },
          },
          timestamp: new Date(),
        },
      });
    }

    const returnData = {
      success: true,
      txHash: response.data?.txHash,
      amountOut: (amountOut * 1e6).toString(), // Use our calculated amountOut (convert back to wei)
    };
    return NextResponse.json(returnData);
  } catch (error: unknown) {
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
