/* eslint-disable @typescript-eslint/no-explicit-any */
import { IMarketData, IMarketFilter } from "@/interfaces/market";
import { prisma } from "@/lib/prisma";

type WhereClause = {
  isResolved?: boolean;
};

export interface TopHolder {
  chainId: number;
  tokenAddress: string;
  address: string;
  totalBalance: string;
  username?: string;
  avatar?: string;
}

export interface TopHolders {
  yes: TopHolder[];
  no: TopHolder[];
}

export interface UserActivityWithUser {
  id: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

export const marketService = {
  async getAllMarkets(filter?: IMarketFilter) {
    try {
      const where: WhereClause = {};

      if (filter?.isResolved !== undefined) {
        where.isResolved = filter.isResolved;
      }

      const markets = await prisma.market.findMany({
        where,
        include: {
          categoryAssignments: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            orderIndex: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

      const swapCounts = await prisma.formattedSwap.groupBy({
        by: ["marketId"],
        _count: {
          id: true,
        },
      });

      const swapCountMap = new Map(
        swapCounts.map((item) => [item.marketId, item._count.id])
      );

      const mappedMarkets = markets.map((market: IMarketData | any) => {
        const yesPercentage =
          (market.yesPrice / (market.yesPrice + market.noPrice)) * 100;
        const noPercentage =
          (market.noPrice / (market.yesPrice + market.noPrice)) * 100;

        // Transform category assignments to categories array
        const categories =
          market.categoryAssignments?.map((assignment: any) => ({
            id: assignment.category.id,
            name: assignment.category.name,
            icon: assignment.category.icon,
          })) || [];

        return {
          ...market,
          categories,
          yesPercentage,
          noPercentage,
          totalBets: swapCountMap.get(market.id) || 0,
        };
      });

      return { markets: mappedMarkets };
    } catch (error) {
      console.error("Error fetching markets:", error);
      throw new Error("Failed to fetch markets");
    }
  },

  async getMarketByIdBasic(id: string) {
    try {
      const market = await prisma.market.findUnique({
        where: { id },
        select: {
          id: true,
          contractAddress: true,
          yesTokenAddress: true,
          noTokenAddress: true,
          question: true,
        },
      });

      if (!market) {
        throw new Error("Market not found");
      }

      return { market };
    } catch (error) {
      console.error("Error fetching market basic data:", error);
      throw new Error("Failed to fetch market");
    }
  },

  async getMarketById(id: string) {
    try {
      const market = await prisma.market.findUnique({
        where: { id },
        include: {
          activities: true,
          tweets: true,
          categoryAssignments: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
      });

      if (!market) {
        throw new Error("Market not found");
      }

      // Transform category assignments to categories array
      const categories =
        market.categoryAssignments?.map((assignment: any) => ({
          id: assignment.category.id,
          name: assignment.category.name,
          icon: assignment.category.icon,
        })) || [];

      // Calculate percentages
      const marketWithPercentages = {
        ...market,
        categories,
        yesPercentage:
          (market.yesPrice / (market.yesPrice + market.noPrice)) * 100,
        noPercentage:
          (market.noPrice / (market.yesPrice + market.noPrice)) * 100,
      };

      return { market: marketWithPercentages as IMarketData };
    } catch (error) {
      console.error("Error fetching market:", error);
      throw new Error("Failed to fetch market");
    }
  },

  async getMarketByContractAddress(contractAddress: string) {
    try {
      const market = await prisma.market.findUnique({
        where: { contractAddress },
        include: {
          activities: true,
          tweets: true,
          categoryAssignments: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
      });

      if (!market) {
        throw new Error("Market not found");
      }

      // Transform category assignments to categories array
      const categories =
        market.categoryAssignments?.map((assignment: any) => ({
          id: assignment.category.id,
          name: assignment.category.name,
          icon: assignment.category.icon,
        })) || [];

      // Calculate percentages
      const marketWithPercentages = {
        ...market,
        categories,
        yesPercentage:
          (market.yesPrice / (market.yesPrice + market.noPrice)) * 100,
        noPercentage:
          (market.noPrice / (market.yesPrice + market.noPrice)) * 100,
      };

      return { market: marketWithPercentages as IMarketData };
    } catch (error) {
      console.error("Error fetching market by contract address:", error);
      throw new Error("Failed to fetch market");
    }
  },

  async createMarket(
    data: Omit<IMarketData, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const market = await prisma.market.create({
        data: {
          contractAddress: data.contractAddress,
          poolAddress: data.poolAddress || "",
          blockchain: "ETH",
          status: data.status || "ACTIVE",
          name: data.question,
          question: data.question,
          date: data.date ? new Date(data.date) : null,
          image: data.image || null,
          imageSquare: data.imageSquare || null,
          volume: data.volume || 0,
          createdBy: data.createdBy,
          rules: data.rules || [],
          isResolved: data.isResolved || false,
          resolvedOption: data.resolvedOption || null,
          yesPrice: data.yesPrice || 50,
          noPrice: data.noPrice || 50,
          totalLiquidity: data.totalLiquidity || 0,
          yesTokenAddress: data.yesTokenAddress || null,
          noTokenAddress: data.noTokenAddress || null,
        },
      });

      return { market: market as IMarketData };
    } catch (error) {
      console.error("Error creating market:", error);
      throw new Error("Failed to create market");
    }
  },

  async updateMarket(id: string, data: Partial<IMarketData>) {
    try {
      // Extract categoryIds if present
      const { categoryIds, ...marketData } = data as any;

      // Convert null values to undefined for Prisma
      const prismaData = Object.fromEntries(
        Object.entries(marketData).map(([key, value]) => [
          key,
          value === null ? undefined : value,
        ])
      );

      const market = await prisma.market.update({
        where: { id },
        data: prismaData,
        include: {
          categoryAssignments: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
      });

      // Update category assignments if categoryIds are provided
      if (categoryIds !== undefined) {
        // Delete existing assignments
        await prisma.marketCategoryAssignment.deleteMany({
          where: { marketId: id },
        });

        // Create new assignments
        if (categoryIds.length > 0) {
          await prisma.marketCategoryAssignment.createMany({
            data: categoryIds.map((categoryId: string) => ({
              marketId: id,
              categoryId: categoryId,
            })),
          });
        }
      }

      // Transform category assignments to categories array
      const categories =
        market.categoryAssignments?.map((assignment: any) => ({
          id: assignment.category.id,
          name: assignment.category.name,
          icon: assignment.category.icon,
        })) || [];

      return {
        market: {
          ...market,
          categories,
        } as IMarketData,
      };
    } catch (error) {
      console.error("Error updating market:", error);
      throw new Error("Failed to update market");
    }
  },

  async deleteMarket(id: string) {
    try {
      await prisma.market.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting market:", error);
      throw new Error("Failed to delete market");
    }
  },

  async getTopHolders(marketId: string): Promise<TopHolders> {
    try {
      const response = await fetch(
        `/api/markets/top-holders?marketId=${marketId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch top holders");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching top holders:", error);
      return { yes: [], no: [] };
    }
  },

  async getMarketActivities(
    marketId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    activities: UserActivityWithUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const response = await fetch(
        `/api/markets/activities?marketId=${marketId}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch market activities");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching market activities:", error);
      throw error;
    }
  },
};
