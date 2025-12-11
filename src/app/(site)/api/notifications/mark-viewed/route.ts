import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.userNotification.updateMany({
      where: {
        userId: session.user.id,
        viewed: false,
      },
      data: {
        viewed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as viewed:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
