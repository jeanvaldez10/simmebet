import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { generateRecoveryCode } from "@/utils/date";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        const code = generateRecoveryCode();

        if (!email) {
            return NextResponse.json(
                { message: "Email is required." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
        });

        if (!existingUser) {
            return NextResponse.json(
                { message: "User with this email does not exist." },
                { status: 404 }
            );
        }

        await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                recoveryCode: code,
            },
        });

        const result = await sendEmail({
            to: email,
            subject: "Your Recovery Code",
            text: `Your recovery code is: ${code}`,
        });

        if (result.success) {
            return NextResponse.json(
                {
                    message: "Email recovery code sent successfully",
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: "Failed to send recovery email", details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("API error from send recovery code mail:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { message: "Email and code are required." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
        });

        if (!user || !user.recoveryCode) {
            return NextResponse.json(
                { message: "Invalid recovery attempt." },
                { status: 400 }
            );
        }

        if (user.recoveryCode !== code) {
            return NextResponse.json(
                { message: "Incorrect recovery code." },
                { status: 401 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                recoveryCode: null,
            },
        });

        return NextResponse.json(
            { message: "Recovery code verified successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error verifying recovery code:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
