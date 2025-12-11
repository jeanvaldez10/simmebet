import { NextRequest, NextResponse } from "next/server";
import {
  validateAdminCredentials,
  setAdminSession,
} from "@/app/(admin)/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate credentials against environment variables
    const isValid = await validateAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Create session and set cookie
    await setAdminSession();

    return NextResponse.json(
      { success: true, message: "Admin login successful" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
