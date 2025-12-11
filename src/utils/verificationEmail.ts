import { sendEmail } from "@/lib/email";

export async function verificationEmail(
  user: { email: string; id?: string },
  recoveryEmailCode: string
) {
  const verificationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_PROJECT_URL
  }/verification/${user.id}?emailString=${recoveryEmailCode}`;

  // Call sendEmail directly instead of going through HTTP
  const result = await sendEmail({
    to: user.email!,
    subject: "Confirm your email - CallMyBluff.io",
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1C1C28 0%, #2A2A3A 100%); padding: 30px; border-radius: 12px; color: white;">
              <h2 style="color: #F2F2FD; margin-bottom: 20px; text-align: center;">Welcome to Bluff!</h2>
              <p style="color: #FFFFFFA3; margin-bottom: 25px; line-height: 1.6;">
                  Please click the button below to confirm your email address and complete your registration.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: 600; 
                            display: inline-block;
                            transition: all 0.3s ease;">
                      Verify Email Address
                  </a>
              </div>
              <p style="color: #FFFFFFA3; font-size: 14px; margin-top: 25px; text-align: center;">
                  If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="color: #6366F1; font-size: 12px; word-break: break-all; text-align: center; margin-top: 10px;">
                  ${verificationUrl}
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #FFFFFF1A; text-align: center;">
                  <p style="color: #FFFFFF80; font-size: 12px;">
                      This link will expire in 24 hours for security reasons.
                  </p>
              </div>
          </div>
      </div>
  `,
  });

  if (!result.success) {
    console.error("[verificationEmail] Email send failed:", result.error);
    throw new Error(
      `Failed to send verification email: ${result.error || "Unknown error"}`
    );
  }

  return result;
}
