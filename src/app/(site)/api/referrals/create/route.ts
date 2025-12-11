import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Check if user already has a referral record
    const existingReferral = await prisma.userReferral.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: "User already has a referral record" },
        { status: 400 }
      );
    }

    // Find the referrer by username
    const referrer = await prisma.user.findUnique({
      where: {
        username: referralCode,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // Prevent self-referral
    if (referrer.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot refer yourself" },
        { status: 400 }
      );
    }

    // Create the referral record
    const referralRecord = await prisma.userReferral.create({
      data: {
        userId: session.user.id,
        referredBy: referralCode,
        referredById: referrer.id,
      },
    });

    // Update user to mark they've received the bonus
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hasReceivedBonus: true,
        referralBonusApplied: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      referralRecord: {
        id: referralRecord.id,
        referredBy: referralRecord.referredBy,
      },
    });
  } catch (error) {
    console.error("Referral creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

