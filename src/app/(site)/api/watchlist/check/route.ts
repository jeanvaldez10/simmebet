import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { watchlistService } from "@/services/watchlistService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const itemType = searchParams.get("itemType") as "MARKET" | "OPTION";

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["MARKET", "OPTION"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    const isInWatchlist = await watchlistService.isInWatchlist(
      session.user.id,
      itemId,
      itemType
    );

    return NextResponse.json({ isInWatchlist });
  } catch (error) {
    console.error("Error checking watchlist status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
