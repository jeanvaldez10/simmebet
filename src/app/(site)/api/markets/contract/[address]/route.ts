import { NextResponse, type NextRequest } from 'next/server'
import { marketService } from '@/services/marketService';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  const { address } = await context.params;

  if (typeof address !== 'string') {
    return NextResponse.json({ error: 'Invalid contract address' }, { status: 400 });
  }

  // Validate that the address looks like a contract address
  if (!address.startsWith('0x') || address.length !== 42) {
    return NextResponse.json({ 
      error: `Invalid contract address format. Expected 0x followed by 40 hex characters, got: ${address}` 
    }, { status: 400 });
  }

  try {
    const { market } = await marketService.getMarketByContractAddress(address);
    return NextResponse.json({ market });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching market by contract address:', error);
      return NextResponse.json({ 
        error: error.message,
        details: `No market found with contract address: ${address}`
      }, { status: error.message === 'Market not found' ? 404 : 500 });
    } else {
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
} 
