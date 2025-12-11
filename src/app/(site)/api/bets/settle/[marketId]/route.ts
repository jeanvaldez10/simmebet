import { NextRequest, NextResponse } from 'next/server';

import api from "@/services/api/config";
import { auth } from '@/auth';
import { getUserById } from '@/services/userService';
import { prisma } from '@/lib/prisma';
import { getTransfersAndWriteBalanceChanges } from '@/utils/onchain/transfers';

interface SettleRequest {
  idempotencyKey: string;
}

export async function POST(
  req: NextRequest & { body: SettleRequest },
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

  try {
    const response = await api.post(`/bets/${dbUser?.id}/settle/${marketId}`, {
      idempotencyKey: body.idempotencyKey,
    });

    getTransfersAndWriteBalanceChanges({
      txHash: response.data.txHash as `0x${string}`,
      walletAddress: dbUser.walletAddress as `0x${string}`,
      userId: dbUser.id,
      marketId: marketId,
    });

    if (dbUser?.id) {
      await prisma.userActivity.create({
        data: {
          userId: dbUser.id,
          action: 'SETTLE_MARKET',
          details: {
            timestamp: new Date().toISOString(),
            message: `Settled market`,
            amount: '0',
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
