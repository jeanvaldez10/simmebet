import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const emailContent = {
      to: body.to,
      subject: body.subject,
      text: body.text,
      html: body.html,
    };

    const result = await sendEmail({
      ...emailContent,
    });

    if (result.success) {
      return NextResponse.json(
        { message: "Email sent successfully", messageId: result.messageId },
        { status: 200 }
      );
    } else {
      console.error("[send-mail API] Email send failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[send-mail API] Unexpected error:", error);
    console.error(
      "[send-mail API] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
