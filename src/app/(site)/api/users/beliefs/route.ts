import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const latestBeliefs = await prisma.userActivity.findMany({
      where: {
        userId: session.user.id,
        action: {
          in: ['PLACE_BET_YES', 'PLACE_BET_NO', 'update_bet']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    const beliefsByMarket = latestBeliefs.reduce((acc, activity) => {
      const details = activity.details as {
        marketId?: string;
        belief?: number;
        beliefPercentage?: number;
      };
      const marketId = details.marketId;
      if (marketId && !acc[marketId]) {
        acc[marketId] = {
          marketId,
          belief: details.belief || details.beliefPercentage || 50,
          lastUpdated: activity.createdAt,
          action: activity.action,
        };
      }
      return acc;
    }, {} as Record<string, {
      marketId: string;
      belief: number;
      lastUpdated: Date;
      action: string;
    }>);

    return NextResponse.json(Object.values(beliefsByMarket));
  } catch (error) {
    console.error("Error fetching user beliefs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
