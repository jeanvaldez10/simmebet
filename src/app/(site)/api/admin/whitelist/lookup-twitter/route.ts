import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/app/(admin)/lib/adminAuth";

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Call RapidAPI Twitter service
    const url = new URL('https://twitter241.p.rapidapi.com/user');
    url.searchParams.append('username', username);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'ec8ed93951msh6c550dd490fdcdep15947fjsn9059555be20f',
        'x-rapidapi-host': 'twitter241.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the rest_id from the nested response structure
    if (data.result?.data?.user?.result?.rest_id) {
      const user = data.result.data.user.result;
      return NextResponse.json({
        id: user.rest_id,
        username: user.core?.screen_name,
        name: user.core?.name,
        verified: user.is_blue_verified || user.verification?.verified || false
      });
    } else {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("Error looking up Twitter user:", error);
    return NextResponse.json(
      { error: "Failed to lookup Twitter user" },
      { status: 500 }
    );
  }
}
