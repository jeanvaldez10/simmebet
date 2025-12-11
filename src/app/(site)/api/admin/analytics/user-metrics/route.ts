import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/prisma";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    console.log("Fetching user metrics...");

    // Total users
    const totalUsers = await prisma.user.count();
    console.log("Total users:", totalUsers);

    // New signups in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newSignups30d = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get signups by day for the last 30 days (simplified approach)
    const signupsByDay = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySignups = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      signupsByDay.push({
        date: date.toISOString().split("T")[0],
        count: daySignups,
      });
    }

    // Users with positions (users who have placed bets)
    const usersWithPositions = await prisma.user.count({
      where: {
        positions: {
          some: {},
        },
      },
    });

    // Users with liquidity positions (liquidity providers)
    const liquidityProviders = await prisma.user.count({
      where: {
        liquidityPositions: {
          some: {},
        },
      },
    });

    // Active users in the last 7 days (users who placed bets or added liquidity)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers7d = await prisma.user.count({
      where: {
        OR: [
          {
            positions: {
              some: {
                createdAt: {
                  gte: sevenDaysAgo,
                },
              },
            },
          },
          {
            liquidityPositions: {
              some: {
                createdAt: {
                  gte: sevenDaysAgo,
                },
              },
            },
          },
        ],
      },
    });

    // Average bet size
    const avgBetSize = await prisma.userPosition.aggregate({
      _avg: {
        amount: true,
      },
    });

    // Simple retention calculation - users with more than 1 bet
    const usersWithMultipleBets = await prisma.userPosition.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const retentionRate =
      usersWithPositions > 0
        ? (usersWithMultipleBets.length / usersWithPositions) * 100
        : 0;

    const result = {
      totalUsers,
      newSignups30d,
      signupsByDay,
      usersWithPositions,
      liquidityProviders,
      retentionRate,
      activeUsers7d,
      averageBetSize: avgBetSize._avg.amount || 0,
      userBehavior: {
        bettorPercentage:
          usersWithPositions > 0 ? (usersWithPositions / totalUsers) * 100 : 0,
        lpPercentage:
          liquidityProviders > 0 ? (liquidityProviders / totalUsers) * 100 : 0,
      },
    };

    console.log("Returning user metrics:", JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user metrics:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
