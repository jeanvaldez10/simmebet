import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import api from "@/services/api/config";
import { getUserById } from '@/services/userService';
import { prisma } from '@/lib/prisma';
import { getTransfersAndWriteBalanceChanges } from '@/utils/onchain/transfers';
import { DEPOSIT_DISABLED } from '@/constants';

interface MintRequest {
  collateralAmount: number;
  idempotencyKey?: string;
}

export async function POST(
  req: NextRequest & { body: MintRequest },
  context: { params: Promise<{ marketId: string }> }
) {
  if (DEPOSIT_DISABLED) {
    return NextResponse.json({ error: "Deposit functionality is currently disabled" }, { status: 503 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { marketId } = await context.params;
  const body = await req.json();
  const dbUser = await getUserById(session.user.id);

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const response = await api.post(`/bets/${dbUser?.id}/mint/${marketId}`, {
      collateralAmount: body.collateralAmount,
    });

    getTransfersAndWriteBalanceChanges({
      txHash: response.data.txHash as `0x${string}`,
      walletAddress: dbUser.walletAddress as `0x${string}`,
      userId: dbUser.id,
      marketId: marketId,
    });

    if (dbUser?.id) {
      await prisma.userPosition.create({
        data: {
          userId: dbUser.id,
          marketId: marketId,
          amount: body.collateralAmount,
          profit: -body.collateralAmount, // USD in = loss
          bought: true,
          txHash: response.data?.txHash,
        },
      });

      await prisma.userActivity.create({
        data: {
          userId: dbUser.id,
          action: 'MINT_TOKENS',
          details: {
            timestamp: new Date().toISOString(),
            message: `Minted ${body.collateralAmount} tokens`,
            amount: body.collateralAmount.toString(),
            txHash: response.data.txHash,
            marketId: marketId,
          },
          timestamp: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, txHash: response.data.txHash });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
