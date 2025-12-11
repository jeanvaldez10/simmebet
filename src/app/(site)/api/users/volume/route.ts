import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Calculate volume from user positions (actual trade amounts)
    const userPositionsVolume = await prisma.userPosition.aggregate({
      where: {
        userId: session.user.id,
        amount: {
          gt: 0 // Only count positive amounts (actual trades, not profits/losses)
        }
      },
      _sum: { 
        amount: true 
      },
      _count: true,
    });
    
    // Double the amount to account for both sides of the trade (input + output)
    const totalVolume = Number(userPositionsVolume._sum.amount || 0) * 2;
    
    return NextResponse.json({
      totalVolume,
      tradeCount: userPositionsVolume._count,
    });
  } catch (error) {
    console.error("Error calculating user volume:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
