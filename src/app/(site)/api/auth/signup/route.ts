import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verificationEmail } from "@/utils/verificationEmail";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password, referralCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate cryptographically secure verification string
    const verificationString = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username: email.split("@")[0], // Use email prefix as username
        verificationString,
        emailVerified: null, // Not verified yet
      },
    });

    // Handle referral code if provided
    if (referralCode) {
      try {
        // Find the referrer by username
        const referrer = await prisma.user.findUnique({
          where: { username: referralCode },
          select: { id: true, username: true },
        });

        // Only create referral if referrer exists and is not self-referral
        if (referrer && referrer.id !== user.id) {
          // Create the referral record
          await prisma.userReferral.create({
            data: {
              userId: user.id,
              referredBy: referralCode,
              referredById: referrer.id,
            },
          });

          // Update user to mark they've received the bonus
          await prisma.user.update({
            where: { id: user.id },
            data: {
              hasReceivedBonus: true,
              referralBonusApplied: new Date(),
            },
          });
        }
      } catch (referralError) {
        console.error("Failed to create referral record:", referralError);
        // Don't fail signup if referral creation fails, just log it
      }
    }

    // Send verification email
    try {
      await verificationEmail(
        { email: user.email!, id: user.id },
        verificationString
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail signup if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
