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

    const yesTopHoldersRaw = await prisma.$queryRaw<Array<{
      chainId: number;
      tokenAddress: string;
      address: string;
      totalBalance: number;
    }>>`
      SELECT 
        th."chainId",
        th."tokenAddress",
        th."address",
        ROUND(th."total_balance" / 1e18, 4) AS "totalBalance"
      FROM token_holders th
      WHERE th."tokenAddress" = ${market.yesTokenAddress}
      ORDER BY th."total_balance" DESC
      LIMIT 10
    `;

    const noTopHoldersRaw = await prisma.$queryRaw<Array<{
      chainId: number;
      tokenAddress: string;
      address: string;
      totalBalance: number;
    }>>`
      SELECT 
        th."chainId",
        th."tokenAddress", 
        th."address",
        ROUND(th."total_balance" / 1e18, 4) AS "totalBalance"
      FROM token_holders th
      WHERE th."tokenAddress" = ${market.noTokenAddress}
      ORDER BY th."total_balance" DESC
      LIMIT 10
    `;

    // Get all unique holder addresses
    const allHolderAddresses = [
      ...yesTopHoldersRaw.map(h => h.address),
      ...noTopHoldersRaw.map(h => h.address)
    ];

    // Fetch user data for all holders with case-insensitive matching
    const usersForHolders = await prisma.user.findMany({
      where: {
        OR: allHolderAddresses.map(address => ({
          walletAddress: {
            equals: address,
            mode: 'insensitive'
          }
        }))
      },
      select: {
        walletAddress: true,
        username: true,
        avatar: true
      }
    });

    // Create a map for quick lookup using lowercase addresses
    const userMap = new Map(
      usersForHolders
        .filter(user => user.walletAddress !== null)
        .map(user => [user.walletAddress!.toLowerCase(), user])
    );

    // Merge holder data with user data
    const mergeHolderWithUser = (holder: { chainId: number; tokenAddress: string; address: string; totalBalance: number }) => {
      const user = userMap.get(holder.address.toLowerCase());
      return {
        chainId: holder.chainId,
        tokenAddress: holder.tokenAddress,
        address: holder.address,
        totalBalance: holder.totalBalance.toString(),
        username: user?.username || undefined,
        avatar: user?.avatar || undefined,
      };
    };

    const formattedYes = yesTopHoldersRaw.map(mergeHolderWithUser);
    const formattedNo = noTopHoldersRaw.map(mergeHolderWithUser);

    return NextResponse.json({
      yes: formattedYes,
      no: formattedNo,
    });
  } catch (error) {
    console.error("Error fetching top holders:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
