import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import api from "@/services/api/config";
import { getUserById } from "@/services/userService";
import { createPublicClient, http, formatUnits, erc20Abi } from "viem";
import { arbitrum } from "viem/chains";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await getUserById(session.user.id);

    // 1. Calculate realized profit from resolved markets
    const profitSum = await prisma.userPosition.aggregate({
      where: {
        userId: session.user.id,
        market: {
          status: "RESOLVED",
        },
      },
      _sum: { profit: true },
      _count: true,
    });
    const dbProfit = Number(profitSum._sum.profit || 0);

    // 2. Calculate onchain LP fees (uncollected)
    let onchainProfit = 0;
    let onchainPositionsCount = 0;
    if (dbUser?.walletAddress) {
      try {
        const response = await api.get(
          `/positions/address/${dbUser.walletAddress}`
        );
        const positions = response.data?.positions || [];
        onchainPositionsCount = positions.length;

        onchainProfit = positions.reduce(
          (
            sum: number,
            position: {
              v4Position?: {
                poolPosition?: {
                  token0UncollectedFees?: string;
                  token1UncollectedFees?: string;
                  token0?: { decimals?: number };
                  token1?: { decimals?: number };
                };
              };
            }
          ) => {
            const token0Fees =
              parseFloat(
                position.v4Position?.poolPosition?.token0UncollectedFees || "0"
              ) /
              Math.pow(
                10,
                position.v4Position?.poolPosition?.token0?.decimals || 18
              );
            const token1Fees =
              parseFloat(
                position.v4Position?.poolPosition?.token1UncollectedFees || "0"
              ) /
              Math.pow(
                10,
                position.v4Position?.poolPosition?.token1?.decimals || 18
              );
            return sum + token0Fees + token1Fees;
          },
          0
        );
      } catch (error) {
        console.warn("Failed to fetch onchain positions:", error);
      }
    }

    // 3. Calculate unrealized P&L from active positions
    let unrealizedProfit = 0;
    const activePositionsBreakdown: Array<{
      marketId: string;
      marketName: string;
      invested: number;
      currentValue: number;
      unrealizedPnL: number;
      yesBalance: number;
      noBalance: number;
      yesPrice: number;
      noPrice: number;
    }> = [];

    if (dbUser?.walletAddress) {
      try {
        // Get all active markets where user has invested
        const activeMarkets = await prisma.market.findMany({
          where: {
            status: "ACTIVE",
            positions: {
              some: {
                userId: session.user.id,
                amount: { gt: 0 },
              },
            },
          },
          select: {
            id: true,
            name: true,
            question: true,
            contractAddress: true,
            yesPrice: true,
            noPrice: true,
            yesTokenAddress: true,
            noTokenAddress: true,
          },
        });

        if (activeMarkets.length > 0) {
          const client = createPublicClient({
            chain: arbitrum,
            transport: http(arbitrum.rpcUrls.default.http[0]),
          });

          // Fetch all YES token balances
          const yesBalanceResults = await client.multicall({
            contracts: activeMarkets.map((market) => ({
              address: market.yesTokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [dbUser.walletAddress as `0x${string}`],
            })),
            allowFailure: true,
          });

          // Fetch all NO token balances
          const noBalanceResults = await client.multicall({
            contracts: activeMarkets.map((market) => ({
              address: market.noTokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [dbUser.walletAddress as `0x${string}`],
            })),
            allowFailure: true,
          });

          // Calculate unrealized P&L for each market
          for (let i = 0; i < activeMarkets.length; i++) {
            const market = activeMarkets[i];

            // Get investments in this market
            const investments = await prisma.userPosition.aggregate({
              where: {
                userId: session.user.id,
                marketId: market.id,
                amount: { gt: 0 },
              },
              _sum: { amount: true },
            });

            const invested = Number(investments._sum.amount || 0);

            if (invested > 0) {
              const yesResult = yesBalanceResults[i];
              const noResult = noBalanceResults[i];

              const yesRaw =
                yesResult?.status === "success" ? yesResult.result : undefined;
              const noRaw =
                noResult?.status === "success" ? noResult.result : undefined;

              const yesBalance =
                yesRaw && typeof yesRaw === "bigint"
                  ? Number(formatUnits(yesRaw, 18))
                  : 0;
              const noBalance =
                noRaw && typeof noRaw === "bigint"
                  ? Number(formatUnits(noRaw, 18))
                  : 0;

              // Calculate current value using market token prices (0 - 2 USDC)
              const yesPrice = market.yesPrice || 0;
              const noPrice = market.noPrice || 0;
              const currentValue = yesBalance * yesPrice + noBalance * noPrice;

              const unrealizedPnL = currentValue - invested;
              unrealizedProfit += unrealizedPnL;

              activePositionsBreakdown.push({
                marketId: market.id,
                marketName: market.name,
                invested,
                currentValue,
                unrealizedPnL,
                yesBalance,
                noBalance,
                yesPrice,
                noPrice,
              });
            }
          }
        }
      } catch (error) {
        console.warn("Failed to calculate unrealized P&L:", error);
      }
    }

    // 4. Get detailed breakdown of realized positions by market
    const realizedPositionsBreakdown: Array<{
      marketId: string;
      marketName: string;
      totalInvested: number;
      totalReturned: number;
      netProfit: number;
      transactionCount: number;
    }> = [];

    try {
      // Get all resolved markets where user has positions
      const resolvedMarkets = await prisma.market.findMany({
        where: {
          status: "RESOLVED",
          positions: {
            some: {
              userId: session.user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      for (const market of resolvedMarkets) {
        // Get all positions for this market
        const positions = await prisma.userPosition.findMany({
          where: {
            userId: session.user.id,
            marketId: market.id,
          },
          select: {
            amount: true,
            profit: true,
          },
        });

        const totalInvested = positions.reduce(
          (sum, pos) => sum + (pos.amount > 0 ? pos.amount : 0),
          0
        );
        const netProfit = positions.reduce((sum, pos) => sum + pos.profit, 0);
        const totalReturned = totalInvested + netProfit;

        if (totalInvested > 0 || netProfit !== 0) {
          realizedPositionsBreakdown.push({
            marketId: market.id,
            marketName: market.name,
            totalInvested,
            totalReturned,
            netProfit,
            transactionCount: positions.length,
          });
        }
      }
    } catch (error) {
      console.warn("Failed to calculate realized positions breakdown:", error);
    }

    const totalProfit = dbProfit + onchainProfit + unrealizedProfit;

    return NextResponse.json({
      totalProfit,
      dbProfit,
      onchainProfit,
      unrealizedProfit,
      positionCount: profitSum._count,
      onchainPositionsCount,
      activePositionsCount: activePositionsBreakdown.length,
      // Detailed breakdown for debugging/display
      breakdown: {
        realized: {
          value: dbProfit,
          description: "Profit from resolved markets (claims and cashouts)",
          count: profitSum._count,
          positions: realizedPositionsBreakdown,
        },
        onchainFees: {
          value: onchainProfit,
          description: "Uncollected LP fees from onchain positions",
          count: onchainPositionsCount,
        },
        unrealized: {
          value: unrealizedProfit,
          description: "Unrealized P&L from active positions",
          count: activePositionsBreakdown.length,
          positions: activePositionsBreakdown,
        },
      },
    });
  } catch (error) {
    console.error("Error calculating user profit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
