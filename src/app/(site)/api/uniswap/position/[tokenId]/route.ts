import { NextResponse } from 'next/server';
import { fetchUniswapPosition } from '@/utils/uniswap';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    
    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    const position = await fetchUniswapPosition(tokenId);
    
    if (!position) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json(position);
  } catch (error) {
    console.error('Error fetching Uniswap position:', error);
    return NextResponse.json(
      { error: 'Failed to fetch position' },
      { status: 500 }
    );
  }
}
