import { type NextRequest, NextResponse } from "next/server";
import { createNotification } from "@/services/userService";
import { NotificationType } from "@/types/profile";

export async function POST(
  req: NextRequest,
) {
  try {
    const { userId, type, amount, message } = await req.json();
    await createNotification(userId, type as NotificationType, amount, message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
