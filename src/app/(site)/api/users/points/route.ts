import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's trading volume
    const positions = await prisma.userPosition.findMany({
      where: {
        userId: userId,
        amount: {
          gt: 0,
        },
      },
      select: {
        amount: true,
      },
    });

    // Calculate base trading volume (each position counts for both buy and sell)
    const totalVolume = positions.reduce((sum, pos) => sum + pos.amount, 0) * 2;

    // Base trading points (1 point per $1)
    const tradingPoints = totalVolume;

    // Check if user has referral bonus (10% boost)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasReceivedBonus: true,
        referralBonusApplied: true,
      },
    });

    // Apply 10% trading bonus if user was referred
    const tradingBonus = user?.hasReceivedBonus ? tradingPoints * 0.1 : 0;
    const totalTradingPoints = tradingPoints + tradingBonus;

    // Calculate referral points (Phase 3 - not yet implemented)
    const referralPoints = 0; // TODO: Calculate from Layer 1 and Layer 2 referrals

    // Count how many users this user has referred
    const referredCount = await prisma.userReferral.count({
      where: {
        referredById: userId,
      },
    });

    // Total points
    const totalPoints = totalTradingPoints + referralPoints;

    return NextResponse.json({
      tradingVolume: totalVolume,
      tradingPoints: tradingPoints,
      tradingBonus: tradingBonus,
      referralPoints: referralPoints,
      totalPoints: totalPoints,
      tradeCount: positions.length,
      hasReferralBonus: user?.hasReceivedBonus || false,
      referredFriends: referredCount,
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
