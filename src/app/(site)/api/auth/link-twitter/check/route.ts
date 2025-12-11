import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const twitterId = searchParams.get("twitterId");

    if (!twitterId) {
      return NextResponse.json(
        { error: "Twitter ID is required" },
        { status: 400 }
      );
    }

    // Check if this Twitter ID is already linked to any user
    const existingUser = await prisma.user.findFirst({
      where: {
        twitterId: twitterId,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      alreadyLinked: !!existingUser,
      userId: existingUser?.id || null,
    });

  } catch (error) {
    console.error("Error checking Twitter account link:", error);
    return NextResponse.json(
      { error: "Failed to check Twitter account link" },
      { status: 500 }
    );
  }
} 
