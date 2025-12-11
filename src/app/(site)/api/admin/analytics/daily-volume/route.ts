import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { prisma } from "@/prisma";

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "90");

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get daily volume from formatted swaps
    const dailyVolume = await prisma.$queryRaw<
      Array<{ date: Date; volume: number }>
    >`
      SELECT 
        DATE(timestamp) as date,
        COALESCE(SUM(volume), 0)::float as volume
      FROM formatted_swaps
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY DATE(timestamp) ASC
    `;

    // Format dates for display
    const formattedData = dailyVolume.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      volume: item.volume,
    }));

    return NextResponse.json({
      dailyVolume: formattedData,
      totalDays: formattedData.length,
    });
  } catch (error) {
    console.error("Error fetching daily volume:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily volume" },
      { status: 500 }
    );
  }
}

