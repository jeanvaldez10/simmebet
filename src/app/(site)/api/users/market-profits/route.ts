import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userPositions = await prisma.userPosition.groupBy({
      by: ["marketId"],
      where: { userId: session.user.id },
      _sum: { profit: true },
    });

    const profitsByMarket = userPositions.reduce(
      (acc: Record<string, number>, position) => {
        acc[position.marketId] = Number(position._sum.profit || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({ profitsByMarket });
  } catch (error) {
    console.error("Error fetching market profits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
