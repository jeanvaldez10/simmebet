import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ARBITRUM_USDC_CONTRACT_ADDRESS } from '@/constants';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const marketId = searchParams.get('marketId');

  if (!marketId) {
    return NextResponse.json({ error: "Market ID is required" }, { status: 400 });
  }

  try {
    // Get all USDC balance changes for this market
    const usdcTransfers = await prisma.balanceChange.findMany({
      where: {
        userId: session.user.id,
        marketId: marketId,
        tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS.toLowerCase(),
      }
    });
    
    // Calculate net USDC investment using the signed amount values
    // Positive amount = money coming in (user receiving USDC)
    // Negative amount = money going out (user spending USDC)
    const netUsdcFlow = usdcTransfers.reduce((sum, transfer) => {
      const amount = Number(transfer.amount) / 1e6; // USDC has 6 decimals
      return sum + amount; // This will be negative for outgoing, positive for incoming
    }, 0);
    
    // Net investment is the absolute value of negative flow (money spent)
    // If netUsdcFlow is negative, that means user spent more than they received
    const totalUsdcInvestment = Math.abs(Math.min(netUsdcFlow, 0));
    
    return NextResponse.json({
      usdcInvestment: totalUsdcInvestment,
    });
  } catch (error) {
    console.error("Error calculating market USDC investment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
