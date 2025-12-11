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
    const itemType = searchParams.get("itemType") as "MARKET" | "OPTION" | undefined;

    const watchlist = await watchlistService.getUserWatchlist(session.user.id, itemType);
    
    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, itemType } = await request.json();

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["MARKET", "OPTION"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    const watchlistItem = await watchlistService.addToWatchlist(
      session.user.id,
      itemId,
      itemType
    );

    return NextResponse.json({ watchlistItem });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const itemType = searchParams.get("itemType") as "MARKET" | "OPTION";

    if (!itemId || !itemType) {
      // If no itemId provided, clear all watchlist items for the user
      await watchlistService.clearUserWatchlist(session.user.id);
      return NextResponse.json({ success: true, message: "Watchlist cleared" });
    }

    if (!["MARKET", "OPTION"].includes(itemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    await watchlistService.removeFromWatchlist(
      session.user.id,
      itemId,
      itemType
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
