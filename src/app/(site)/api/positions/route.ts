import { NextResponse } from 'next/server';

import api from "@/services/api/config";
import { getUserByIdBasic } from '@/services/userService';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getUserByIdBasic(session.user.id);
  const walletAddress = dbUser?.walletAddress;
  console.log('walletAddress', walletAddress);

  try {
    const response = await api.get(`/positions/address/${walletAddress}`);
    return NextResponse.json({ positions: response.data?.positions || [] }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.log("ERROR", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
} 
