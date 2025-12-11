import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserById } from '@/services/userService';
import { ApprovalService } from '@/services/approvalService';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getUserById(session.user.id);
  if (!dbUser?.walletAddress) {
    return NextResponse.json({ error: "User wallet address not found" }, { status: 400 });
  }

  try {
    // Check if user has approval for the simple router to spend USDC
    const approval = await ApprovalService.checkUniversalRouterApproval(
      session.user.id,
      dbUser.walletAddress
    );

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error checking approval status:', error);
    return NextResponse.json({ error: 'Failed to check approval status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: {
    contractAddress: string;
    spenderAddress: string;
    tokenAddress: string;
    amount?: string;
    approvalHash?: string;
  } = await req.json();

  const dbUser = await getUserById(session.user.id);
  if (!dbUser?.walletAddress) {
    return NextResponse.json({ error: "User wallet address not found" }, { status: 400 });
  }

  try {
    // Update the approval record
    const result = await ApprovalService.updateApproval({
      userId: session.user.id,
      contractAddress: body.contractAddress,
      spenderAddress: body.spenderAddress,
      tokenAddress: body.tokenAddress,
      amount: body.amount,
      approvalHash: body.approvalHash,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating approval status:', error);
    return NextResponse.json({ error: 'Failed to update approval status' }, { status: 500 });
  }
} 
