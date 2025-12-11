import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/prisma";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    // Total users
    const totalUsers = await prisma.user.count();

    // Get users with positions (bettors)
    const bettorUserIds = await prisma.userPosition.findMany({
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    // Get users with liquidity positions (LPs)
    const lpUserIds = await prisma.liquidityPositions.findMany({
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    const bettorSet = new Set(bettorUserIds.map(u => u.userId));
    const lpSet = new Set(lpUserIds.map(u => u.userId));

    // Calculate overlaps
    const onlyBettors = bettorUserIds.filter(u => !lpSet.has(u.userId)).length;
    const onlyLPs = lpUserIds.filter(u => !bettorSet.has(u.userId)).length;
    const both = bettorUserIds.filter(u => lpSet.has(u.userId)).length;

    return NextResponse.json({
      totalUsers,
      usersWithPositions: bettorUserIds.length,
      liquidityProviders: lpUserIds.length,
      onlyBettors,
      onlyLPs,
      both,
    });
  } catch (error) {
    console.error("Error fetching user behavior:", error);
    return NextResponse.json(
      { error: "Failed to fetch user behavior" },
      { status: 500 }
    );
  }
}

