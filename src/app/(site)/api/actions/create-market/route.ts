import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import api from "@/services/api/config";
import { getUserById } from "@/services/userService";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: {
    marketName: string;
    outcomes: string[];
    collateralToken: string;
    oracleAddress: string;
    oracleData: string;
    initialLiquidity: number;
    initialOdds: number;
    fee: number;
    tickSpacing: number;
    protocolFeeBps: number;
    creatorFeeBps: number;
    minTick: number;
    maxTick: number;
  } = await req.json();
  const dbUser = await getUserById(session.user.id);

  try {
    const response = await api.post(
      `/actions/${dbUser?.id}/create-market`,
      body
    );
    return NextResponse.json({
      success: true,
      txHash: response.data.txHash,
      marketAddress: response.data.marketAddress,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
