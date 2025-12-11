import { NextResponse, type NextRequest } from 'next/server'
import { PrismaClient, Prisma } from '@/generated/prisma'


const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const period = req.nextUrl.searchParams.get('period');

    console.log("PPPP", period);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ message: "Market ID is required" }, { status: 400 });
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

    const whereClause: Prisma.PriceChartDataWhereInput = {
      marketId: marketId,
    };

    if (period && period !== "All") {
      whereClause.createdAt = {
        gte: getStartDate(period),
      };
    }

    const chartData = await prisma.priceChartData.findMany({
      where: whereClause,
      orderBy: {
        date: "asc",
      },
      select: {
        date: true,
        yes: true,
        no: true,
      },
    });
    const formattedData = chartData.map((point) => ({
      date: formatDate(point.date),
      yes: parseFloat(point.yes.toString()),
      no: parseFloat(point.no.toString()),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching price chart data:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1h":
      return new Date(now.getTime() - 1 * 60 * 60 * 1000);
    case "6h":
      return new Date(now.getTime() - 6 * 60 * 60 * 1000);
    case "1d":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "1w":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1m":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 1 * 60 * 60 * 1000);
  }
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", { month: "short" });
}
