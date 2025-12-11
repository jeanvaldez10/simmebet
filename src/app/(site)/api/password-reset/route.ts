import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { passwordResetEmail } from "@/utils/passwordResetEmail";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Simple in-memory rate limiting (consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(email);
  if (!record) {
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (now > record.resetTime) {
    rateLimitMap.set(email, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (record.count >= MAX_REQUESTS) {
    return true;
  }
  record.count++;
  return false;
}

// Request password-reset link
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    // Rate limit per email
    if (isRateLimited(email)) {
      return NextResponse.json({ message: "Too many requests. Please wait before trying again." }, { status: 429 });
    }

    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true, email: true } });

    if (!user) {
      // Do not reveal whether user exists
      return NextResponse.json({ message: "If the account exists, a reset email has been sent." }, { status: 200 });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expires,
      },
    });

    await passwordResetEmail(email, rawToken);

    return NextResponse.json({ message: "If the account exists, a reset email has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Password reset POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Complete password reset
export async function PATCH(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ message: "Token and new password are required." }, { status: 400 });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Token is invalid or has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 });
  } catch (error) {
    console.error("Password reset PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}    
