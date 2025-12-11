import { type NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/services/userService";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = user?.id as string;
  try {
    const user = await getUserById(userId);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userData = await req.json();
    const updatedUser = await updateUser(session.user.id, userData);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
