import { NextResponse, type NextRequest } from 'next/server'
import { marketService } from '@/services/marketService';
import { IMarketData } from '@/interfaces/market';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid market ID' }, { status: 400 });
  }

  try {
    // Check if the identifier is a contract address
    const isContractAddress = id.startsWith('0x') && id.length === 42;
    
    let market;
    if (isContractAddress) {
      const result = await marketService.getMarketByContractAddress(id);
      market = result.market;
    } else {
      const result = await marketService.getMarketById(id);
      market = result.market;
    }
    
    return NextResponse.json({ market });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Market not found' ? 404 : 500 });
    } else {
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
}

export async function PUT(
  req: NextRequest,
) {
  const reqUrl = req.url
  const { searchParams } = new URL(reqUrl)
  const id = searchParams.get('id');

  if (typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid market ID' }, { status: 400 });
  }

  try {
    const { market } = await marketService.updateMarket(id, req.body as Partial<IMarketData>);
    return NextResponse.json({ market });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Market not found' ? 404 : 500 });
    } else {
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
} 

export async function DELETE(
  req: NextRequest,
) {
  const reqUrl = req.url
  const { searchParams } = new URL(reqUrl)
  const id = searchParams.get('id');

  if (typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid market ID' }, { status: 400 });
  }

  try {
    await marketService.deleteMarket(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Market not found' ? 404 : 500 });
    } else {
      return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
  }
} 
