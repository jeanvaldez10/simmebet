import { NextResponse } from "next/server";
import { getAdminSession } from "@/app/(admin)/lib/adminAuth";

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.id,
          email: session.email,
          name: session.name,
          role: session.role,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
