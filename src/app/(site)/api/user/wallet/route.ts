import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/services/userService";
import api from "@/services/api/config";

export interface PrivateKeyResponse {
  pkValue: string;
}

export async function GET() {
  try {
    console.log('Private key API route called');
    
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const dbUser = await getUserById(session.user.id);
    
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Call account manager API to get private key
    const response = await api.get(`/wallet/${dbUser.id}/pk`);

    // The account manager might return the private key in different field names
    // Let's check for common field names
    const privateKey = response.data?.pkValue || response.data?.privateKey || response.data?.private_key || response.data?.key;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: "Private key not found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      pkValue: privateKey,
    });
  } catch (error) {
    console.error("Private key fetch error:", error);
    
    // Handle API errors
    if (error && typeof error === "object" && "response" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.error || "Failed to fetch private key";
      
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
