import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByIdBasic } from "@/services/userService";
import api from "@/services/api/config";

export interface WithdrawalRequest {
  amount: number;
  recipient: string;
  token: string;
}

const TOKEN_ADDRESS_MAP: Record<string, `0x${string}`> = {
  "usd-coin": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
}


export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body: WithdrawalRequest = await req.json();
    const { amount, recipient, token } = body;

    // Validate request body
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!recipient || typeof recipient !== 'string') {
      return NextResponse.json(
        { error: "Valid recipient address is required" },
        { status: 400 }
      );
    }

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: "Valid token is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await getUserByIdBasic(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tokenAddress = TOKEN_ADDRESS_MAP[token];
    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // Call account manager API
    const response = await api.post(`/withdrawals/${dbUser.id}`, {
      amount,
      recipient,
      tokenAddress,
    });

    return NextResponse.json({
      success: response.data?.success,
      txHash: response.data?.txHash,
      message: response.data?.message,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    
    // Handle API errors
    if (error && typeof error === "object" && "response" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.error || "Withdrawal failed";
      
      return NextResponse.json(
        { error: message },
        { status }
      );
    }

    // Handle other errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
