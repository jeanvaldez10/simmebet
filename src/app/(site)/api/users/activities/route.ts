import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { formatTokenDeltas } from "@/utils/marketSlug";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const activities = await prisma.userActivity.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });

    const totalCount = await prisma.userActivity.count({
      where: {
        userId: session.user.id,
      },
    });

    const hasMore = skip + activities.length < totalCount;

    const formattedActivities = activities.map((activity) => {
      const details = activity.details as Record<string, unknown>;
      const tokenDeltas = details?.tokenDeltas as {
        yesDelta?: number;
        noDelta?: number;
        usdcDelta?: number;
      };

      let amount = (details?.amount as string) || "0";
      if (tokenDeltas) {
        amount = formatTokenDeltas(
          tokenDeltas.yesDelta || 0,
          tokenDeltas.noDelta || 0,
          tokenDeltas.usdcDelta || 0
        );
      }

      return {
        id: activity.id,
        message: (details?.message as string) || activity.action,
        amount: amount,
        when: new Date(activity.timestamp).toLocaleString(),
        type: activity.action.toLowerCase().replace("_", "_"),
        txHash: (details?.txHash as string) || null,
        marketId: (details?.marketId as string) || null,
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
