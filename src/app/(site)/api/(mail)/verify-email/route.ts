import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const userId = body.userId;
    const verificationString = body.emailString;

    if (!verificationString || !userId) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Validate userId format (should be a valid UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        verificationString,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Verification failed, user not found" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        verificationString: null,
      },
    });

    return NextResponse.json(
      { 
        message: "Email verified successfully",
        user: {
          email: updatedUser.email,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error from send mail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
