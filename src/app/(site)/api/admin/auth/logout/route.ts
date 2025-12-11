import { NextResponse } from "next/server";
import { clearAdminSession } from "@/app/(admin)/lib/adminAuth";

export async function POST() {
  try {
    await clearAdminSession();

    return NextResponse.json(
      { success: true, message: "Admin logout successful" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
