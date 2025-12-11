import { NextRequest, NextResponse } from "next/server";
import { verificationEmail } from "@/utils/verificationEmail";
import { generateRecoveryCode } from "@/utils/date";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recoveryEmailCode = generateRecoveryCode();

    if (!body.email) {
      return NextResponse.json(
        { message: "Email are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: body.email, mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid verification attempt." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationString: recoveryEmailCode,
      },
    });

    await verificationEmail({ email: body.email, id: user.id }, recoveryEmailCode);

    return NextResponse.json(
      { message: "Email sent successfully" },
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
