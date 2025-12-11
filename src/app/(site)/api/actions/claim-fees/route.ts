import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import api from "@/services/api/config";
import { getUserById } from '@/services/userService';

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: {
    contractAddress: string;
    contractType: string;
    poolId?: string;
    currency?: string;
  } = await req.json();
  const dbUser = await getUserById(session.user.id);

  try {
    const response = await api.post(`/actions/${dbUser?.id}/claim-fees`, body);
    return NextResponse.json({ 
      success: true, 
      txHash: response.data.txHash,
      feesAmount: response.data.feesAmount 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
