import sgMail, { MailDataRequired } from "@sendgrid/mail";

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn(
    "SENDGRID_API_KEY is not set. Email functionality will not work."
  );
}

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {
    // Validate required environment variables
    if (!process.env.SENDGRID_API_KEY) {
      console.error("[sendEmail] SENDGRID_API_KEY is not configured");
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error("[sendEmail] SENDGRID_FROM_EMAIL is not configured");
      throw new Error("SENDGRID_FROM_EMAIL is not configured");
    }

    const fromName = process.env.SENDGRID_FROM_NAME || "CallMyBluff.io";
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    const msg: Partial<MailDataRequired> = {
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      subject,
    };

    // Add text content if provided
    if (text) {
      msg.text = text;
    }

    // Add html content if provided, otherwise use text
    if (html) {
      msg.html = html;
    } else if (text) {
      msg.html = text;
    }

    // Ensure at least one content type is provided
    if (!msg.text && !msg.html) {
      console.error("[sendEmail] No content provided");
      throw new Error("Email must have either text or html content");
    }

    const response = await sgMail.send(msg as MailDataRequired);

    return {
      success: true,
      messageId: response[0].headers["x-message-id"] || "sent",
    };
  } catch (error) {
    console.error("[sendEmail] ERROR sending email:", error);

    // SendGrid specific error handling
    if (error && typeof error === "object" && "response" in error) {
      const sgError = error as { response?: { body?: unknown } };
      console.error(
        "[sendEmail] SendGrid error details:",
        JSON.stringify(sgError.response?.body, null, 2)
      );

      // Check for specific SendGrid error codes
      if (
        sgError.response &&
        typeof sgError.response === "object" &&
        "body" in sgError.response
      ) {
        const body = sgError.response.body as {
          errors?: Array<{ message?: string; field?: string }>;
        };
        if (body.errors && Array.isArray(body.errors)) {
          console.error("[sendEmail] SendGrid validation errors:", body.errors);
        }
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[sendEmail] Final error message:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
};
