import { NextRequest, NextResponse } from "next/server";
import { verificationEmail } from "@/utils/verificationEmail";
import { generateRecoveryCode } from "@/utils/date";
import prisma from "@/lib/prisma";

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3; // Max 3 requests per 5 minutes

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (isRateLimited(email)) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true, emailVerified: true }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account with this email exists, a verification email has been sent." },
        { status: 200 }
      );
    }

    // If user is already verified, don't send another email
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "This email is already verified." },
        { status: 400 }
      );
    }

    // Generate new verification string for the link
    const recoveryEmailCode = generateRecoveryCode();

    // Update user with new verification string
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationString: recoveryEmailCode,
      },
    });

    // Send verification email with the new template
    await verificationEmail({ email: user.email!, id: user.id }, recoveryEmailCode);

    return NextResponse.json(
      { message: "If an account with this email exists, a verification email has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error from resend verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}    
