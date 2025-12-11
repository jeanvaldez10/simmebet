import { NextResponse, type NextRequest } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ message: 'Market ID is required' }, { status: 400 });
    }

    // Check if the identifier is a contract address
    const isContractAddress = id.startsWith('0x') && id.length === 42;
    
    let marketId = id;
    
    if (isContractAddress) {
      // Look up the market by contract address to get the market ID
      const market = await prisma.market.findUnique({
        where: { contractAddress: id },
        select: { id: true }
      });
      
      if (!market) {
        return NextResponse.json({ message: "Market not found" }, { status: 404 });
      }
      
      marketId = market.id;
    }

    const spreadData = await prisma.liquiditySpreadData.findMany({
      where: {
        marketId: marketId,
      },
      orderBy: {
        value: 'asc',
      },
      select: {
        value: true,
        percentage: true,
        type: true,
      },
    });

    // Format the data for the chart
    const formattedData = spreadData.map((point) => ({
      value: point.value,
      percentage: parseFloat(point.percentage.toString()),
      type: point.type,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching liquidity spread data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 
