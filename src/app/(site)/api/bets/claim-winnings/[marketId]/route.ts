import { NextRequest, NextResponse } from "next/server";

import api from "@/services/api/config";
import { auth } from "@/auth";
import { getUserById } from "@/services/userService";
import { prisma } from "@/lib/prisma";
import { getTransfersAndWriteBalanceChanges } from "@/utils/onchain/transfers";

interface ClaimWinningsRequest {
  idempotencyKey: string;
}

export async function POST(
  req: NextRequest & { body: ClaimWinningsRequest },
  context: { params: Promise<{ marketId: string }> }
) {
  const session = await auth();
  const { marketId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const dbUser = await getUserById(session.user.id);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const market = await prisma.market.findUnique({
    where: {
      contractAddress: marketId,
    },
  });

  if (!market) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  let claimedAmount = 0;

  try {
    const response = await api.post(
      `/bets/${dbUser?.id}/claim-winnings/${marketId}`,
      {
        idempotencyKey: body.idempotencyKey,
      }
    );

    getTransfersAndWriteBalanceChanges({
      txHash: response.data.txHash as `0x${string}`,
      walletAddress: dbUser.walletAddress as `0x${string}`,
      userId: dbUser.id,
      marketId: market.id,
    });

    if (dbUser?.id) {
      claimedAmount = response.data?.claimAmount
        ? Number(response.data.claimAmount)
        : 0;

      if (claimedAmount > 0) {
        // Calculate net profit: claim amount - initial investment
        const investments = await prisma.userPosition.aggregate({
          where: {
            userId: dbUser.id,
            marketId: market.id,
            amount: { gt: 0 }, // Sum all initial bets
          },
          _sum: { amount: true },
        });

        const totalInvested = Number(investments._sum.amount || 0);
        const netProfit = claimedAmount - totalInvested;

        // Only create position record if there's actual profit/loss
        if (netProfit !== 0) {
          await prisma.userPosition.create({
            data: {
              userId: dbUser.id,
              marketId: market.id,
              amount: 0,
              profit: netProfit, // NET PROFIT (can be positive or negative)
              bought: true,
              txHash: response.data?.txHash,
            },
          });
        }
      }

      await prisma.userActivity.create({
        data: {
          userId: dbUser.id,
          action: "CLAIM_WINNINGS",
          details: {
            timestamp: new Date().toISOString(),
            message: `Claimed winnings`,
            amount: claimedAmount.toString(),
            txHash: response.data.txHash,
            marketId: marketId,
          },
          timestamp: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      claimedAmount,
      amountOut: `$${claimedAmount.toFixed(2)}`,
      txHash: response.data.txHash,
    });
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
