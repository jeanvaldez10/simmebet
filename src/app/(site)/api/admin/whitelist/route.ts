import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";
import { WhitelistService } from "@/services/whitelistService";

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const type = (searchParams.get('type') || 'all') as 'all' | 'email' | 'twitter';

    const result = await WhitelistService.getWhitelistEntries(page, limit, search, type);

    return NextResponse.json({
      entries: result.entries,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    console.error("Error fetching whitelist entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch whitelist entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const { email, twitterId, twitterUsername } = body;

    if (!email && !twitterId && !twitterUsername) {
      return NextResponse.json(
        { error: "Either email, twitterId, or twitterUsername must be provided" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate Twitter ID format if provided (should be numeric)
    if (twitterId && !/^\d+$/.test(twitterId)) {
      return NextResponse.json(
        { error: "Twitter ID must be numeric" },
        { status: 400 }
      );
    }

    // Validate Twitter username format if provided
    if (twitterUsername && !/^@?[a-zA-Z0-9_]+$/.test(twitterUsername)) {
      return NextResponse.json(
        { error: "Invalid Twitter username format" },
        { status: 400 }
      );
    }

    const entry = await WhitelistService.addToWhitelist(email, twitterId, twitterUsername);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error adding whitelist entry:", error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: "Entry with this email, Twitter ID, or username already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add whitelist entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const twitterId = searchParams.get('twitterId');
    const twitterUsername = searchParams.get('twitterUsername');

    if (!email && !twitterId && !twitterUsername) {
      return NextResponse.json(
        { error: "Either email, twitterId, or twitterUsername must be provided" },
        { status: 400 }
      );
    }

    const success = await WhitelistService.removeFromWhitelist(email || undefined, twitterId || undefined, twitterUsername || undefined);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove whitelist entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing whitelist entry:", error);
    return NextResponse.json(
      { error: "Failed to remove whitelist entry" },
      { status: 500 }
    );
  }
}
