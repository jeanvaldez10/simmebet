import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
) {
  try {
    const reqUrl = req.url
    const { searchParams } = new URL(reqUrl)
    const marketId = searchParams.get('marketId');

    if (!marketId || typeof marketId !== "string") {
      return NextResponse.json({ message: "Market ID is required" }, { status: 400 });
    }

    const market = await prisma.market.findUnique({
      where: { id: marketId },
      select: {
        yesTokenAddress: true,
        noTokenAddress: true,
      },
    });

    if (!market) {
      return NextResponse.json({ message: "Market not found" }, { status: 404 });
    }

    const noTokenAddress = market.noTokenAddress!;
    const yesTokenAddress = market.yesTokenAddress!;

    // Calculate holders with balance > 0 by computing net balance for each address
    const holdersWithBalance = await prisma.$queryRaw`
      WITH all_addresses AS (
        SELECT "toAddress" as address FROM "token_transfers" WHERE "tokenAddress" IN (${noTokenAddress}, ${yesTokenAddress})
        UNION
        SELECT "fromAddress" as address FROM "token_transfers" WHERE "tokenAddress" IN (${noTokenAddress}, ${yesTokenAddress})
      ),
      token_balances AS (
        SELECT 
          aa.address,
          COALESCE(
            (SELECT SUM(amount::numeric) FROM "token_transfers" WHERE "toAddress" = aa.address AND "tokenAddress" IN (${noTokenAddress}, ${yesTokenAddress})), 0
          ) - COALESCE(
            (SELECT SUM(amount::numeric) FROM "token_transfers" WHERE "fromAddress" = aa.address AND "tokenAddress" IN (${noTokenAddress}, ${yesTokenAddress})), 0
          ) as balance
        FROM all_addresses aa
        WHERE aa.address IS NOT NULL
      )
      SELECT COUNT(*) as holder_count
      FROM token_balances
      WHERE balance > 0
    ` as Array<{ holder_count: bigint }>;

    const totalHolders = Number(holdersWithBalance[0]?.holder_count || 0);

    return NextResponse.json({
      marketId,
      totalHolders,
    });
  } catch (error) {
    console.error("Error fetching holder count:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
