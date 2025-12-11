import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserById } from "@/services/userService";

export async function POST(
  req: NextRequest,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await getUserById(session.user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { nftId, autocloseTime } = body;

    if (!nftId) {
      return NextResponse.json(
        { error: "NFT ID is required" },
        { status: 400 }
      );
    }

    // Update the autoclose time for the specific position
    const updatedPosition = await prisma.liquidityPositions.updateMany({
      where: {
        userId: dbUser.id,
        nftId: nftId.toString(),
        isBurnt: false,
      },
      data: {
        autoclose: !!autocloseTime, // Set to true if date provided, false if null
        autocloseTime: autocloseTime ? new Date(autocloseTime) : null,
      },
    });

    if (updatedPosition.count === 0) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      autoclose: !!autocloseTime,
      autocloseTime: autocloseTime,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
