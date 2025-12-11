import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, betData, profileData } = await request.json();

    if (
      !type ||
      ![
        "flex9",
        "flex10",
        "flex11",
        "flex12",
        "flex13",
        "flex14",
        "flex15",
      ].includes(type)
    ) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        balance: true,
        positions: true,
        marketProfits: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use profile data if provided (for consistency with profile page), otherwise calculate
    const balance =
      profileData?.balance ??
      (user.balance?.balance ? Number(user.balance.balance) : 0);
    const profitLoss =
      profileData?.profit ??
      user.positions.reduce((total, position) => {
        return total + Number(position.profit || 0);
      }, 0);
    const volumeTraded =
      profileData?.volumeTraded ??
      user.positions.reduce((total, position) => {
        return total + Number(position.amount);
      }, 0);

    const username = user.username || user.email?.split("@")[0] || "User";
    const avatar = user.avatar || user.image || null;

    // Prepare base snapshot data
    const baseSnapshotData: Prisma.FlexSnapshotCreateInput = {
      type,
      username,
      avatar,
      profitLoss,
      volumeTraded,
      balance,
      user: { connect: { id: user.id } },
    };

    // Add bet-specific data if provided (for flex10 bet cards, flex12 what-if cards, and flex15 ongoing position cards)
    const snapshotData: Prisma.FlexSnapshotCreateInput =
      (type === "flex10" || type === "flex12" || type === "flex15") && betData
        ? {
            ...baseSnapshotData,
            betData,
            marketId: betData.marketId,
            marketQuestion: betData.question,
            marketImage: betData.marketImage,
            betAmount: betData.betAmount
              ? parseFloat(betData.betAmount.replace("$", ""))
              : 0,
            betSide: betData.side,
            beliefPercentage: betData.belief
              ? parseFloat(betData.belief.replace("%", ""))
              : 0,
            amountWon: betData.amountWon
              ? parseFloat(betData.amountWon.replace(/[+$]/g, ""))
              : 0,
            betStatus: betData.status || "Ongoing",
            // Add potential amounts for flex12 what-if cards
            ...(type === "flex12" && {
              potentialWinAmount: betData.potentialWinAmount
                ? parseFloat(betData.potentialWinAmount.replace(/[+$]/g, ""))
                : 0,
              potentialLossAmount: betData.potentialLossAmount
                ? parseFloat(betData.potentialLossAmount.replace(/[+$]/g, ""))
                : 0,
            }),
          }
        : baseSnapshotData;

    // Create snapshot
    const snapshot = await prisma.flexSnapshot.create({
      data: snapshotData,
    });

    return NextResponse.json({
      snapshotId: snapshot.id,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/flex/${snapshot.id}`,
    });
  } catch (error) {
    console.error("Error creating flex snapshot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
