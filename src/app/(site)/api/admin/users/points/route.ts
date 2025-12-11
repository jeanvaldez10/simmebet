import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    // Get all users with their trading volume
    const usersWithVolume = await prisma.userPosition.groupBy({
      by: ["userId"],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        amount: {
          gt: 0,
        },
      },
    });

    // Get user details
    const userIds = usersWithVolume.map((u) => u.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        walletAddress: true,
        createdAt: true,
      },
    });

    // Combine data and calculate points
    const usersWithPoints = usersWithVolume.map((volumeData) => {
      const user = users.find((u) => u.id === volumeData.userId);
      const totalVolume = Number(volumeData._sum.amount || 0) * 2; // Double for both sides
      const points = totalVolume * 1.0; // 1 point per $1 traded
      const tradeCount = volumeData._count.id;

      return {
        userId: volumeData.userId,
        username: user?.username || "Unknown",
        email: user?.email || null,
        name: user?.name || null,
        avatar: user?.avatar || null,
        walletAddress: user?.walletAddress || null,
        createdAt: user?.createdAt || null,
        totalVolume,
        tradeCount,
        points,
      };
    });

    // Sort by points descending and add rank
    const sortedUsers = usersWithPoints.sort((a, b) => b.points - a.points);
    const usersWithRank = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({
      users: usersWithRank,
      totalUsers: usersWithRank.length,
      totalPoints: usersWithRank.reduce((sum, u) => sum + u.points, 0),
      totalVolume: usersWithRank.reduce((sum, u) => sum + u.totalVolume, 0),
      totalTrades: usersWithRank.reduce((sum, u) => sum + u.tradeCount, 0),
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
