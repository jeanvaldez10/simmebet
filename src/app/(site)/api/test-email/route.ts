import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { auth } from "@/auth";

export async function POST() {
  try {
    // Optional: Check if user is authenticated
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to send a test email" },
        { status: 401 }
      );
    }

    // Send test email to the logged-in user
    const result = await sendEmail({
      to: session.user.email,
      subject: "Test Email from Simmi Bets",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Test Email Success!</h1>
            </div>
            <div class="content">
              <h2>Hello ${session.user.name || "User"}!</h2>
              <p>This is a test email from <strong>Simmi Bets</strong>.</p>
              <p>If you're seeing this, it means our email system is working perfectly! 📧✨</p>
              <p>Here are some details about your account:</p>
              <ul>
                <li><strong>Email:</strong> ${session.user.email}</li>
                <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "https://callmybluff.io"
              }" class="button">
                Visit Simmi Bets
              </a>
            </div>
            <div class="footer">
              <p>This is a test email. You can safely ignore it.</p>
              <p>&copy; ${new Date().getFullYear()} Simmi Bets. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Test Email from Simmi Bets\n\nHello ${
        session.user.name || "User"
      }!\n\nThis is a test email. If you're seeing this, our email system is working!\n\nSent at: ${new Date().toLocaleString()}`,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${session.user.email}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
