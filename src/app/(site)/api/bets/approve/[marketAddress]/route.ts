import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import api from "@/services/api/config";
import { prisma } from '@/prisma';

// In-memory store to track ongoing approval requests per user
const userApprovalLocks = new Map<string, boolean>();

// In-memory store to track approved users per market
// This is a fallback for server-side tracking, but the main cache is in localStorage
const approvedUsers = new Map<string, Set<string>>();

// type ApiResponse<T> = {
//   error?: string;
// } & T;

// Helper function to get market address from ID or address
async function getMarketAddress(marketIdOrAddress: string): Promise<string | null> {
  // If it's a valid Ethereum address (starts with 0x and has 42 characters), return it
  if (marketIdOrAddress.startsWith('0x') && marketIdOrAddress.length === 42) {
    return marketIdOrAddress;
  }
  
  // Otherwise, assume it's a market ID and query the database
  const market = await prisma.market.findUnique({
    where: { id: marketIdOrAddress },
    select: { contractAddress: true }
  });
  
  return market?.contractAddress || null;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ marketAddress: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { marketAddress: marketIdOrAddress } = await context.params;
  
  // Resolve market address from either ID or address
  const marketAddress = await getMarketAddress(marketIdOrAddress);
  
  if (!marketAddress) {
    return NextResponse.json({ 
      error: "Market not found" 
    }, { status: 404 });
  }
  
  // Check if user is already approved for this market
  if (approvedUsers.get(marketAddress)?.has(userId)) {
    return NextResponse.json({ 
      success: true, 
      message: "User already approved for this market",
      alreadyApproved: true
    });
  }
  
  // Check if user already has an approval request in progress
  if (userApprovalLocks.get(userId)) {
    return NextResponse.json({ 
      error: "You already have an approval request in progress. Please wait for it to complete." 
    }, { status: 200 });
  }

  try {
    // Set the lock for this user
    userApprovalLocks.set(userId, true);
    
    const response = await api.post(`/bets/${userId}/approve-market/${marketAddress}`);
    
    // Track that this user has been approved for this market
    if (!approvedUsers.has(marketAddress)) {
      approvedUsers.set(marketAddress, new Set());
    }
    approvedUsers.get(marketAddress)!.add(userId);
    
    return NextResponse.json({ 
      success: true, 
      txHash: response.data.txHash, 
      liquidityNftId: response.data.liquidityNftId, 
      amountOut: response.data.amountOut 
    });
  } finally {
    // Always release the lock, even if there's an error
    userApprovalLocks.delete(userId);
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ marketAddress: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { marketAddress: marketIdOrAddress } = await context.params;
  
  // Resolve market address from either ID or address
  const marketAddress = await getMarketAddress(marketIdOrAddress);
  
  if (!marketAddress) {
    return NextResponse.json({ 
      error: "Market not found" 
    }, { status: 404 });
  }
  
  // Check if user has been approved for this market
  // Note: This is a fallback check. The main approval status should be checked
  // via localStorage cache in the frontend for better performance
  const isApproved = approvedUsers.get(marketAddress)?.has(userId) || false;
  
  return NextResponse.json({ 
    approved: isApproved,
    marketAddress,
    message: isApproved 
      ? "User is approved for this market" 
      : "User is not approved for this market. Check localStorage cache for better performance."
  });
}                                                                                                                
