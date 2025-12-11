import { type NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/component'
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
) {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { marketId, amount, profit } = await req.json();
    const position = await prisma.userPosition.create({
      data: {
        userId: user.id,
        marketId,
        amount,
        profit,
      },
    });

    return NextResponse.json(position);
  } catch (error) {
    console.error("Error creating position:", error);
    return NextResponse.json({ message: "Error creating position" }, { status: 500 });
  }
}
