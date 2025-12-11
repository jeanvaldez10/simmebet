import { prisma } from "@/lib/prisma";

export interface WatchlistItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: "MARKET" | "OPTION";
  createdAt: Date;
  updatedAt: Date;
}

export const watchlistService = {
  // Add item to watchlist
  async addToWatchlist(userId: string, itemId: string, itemType: "MARKET" | "OPTION"): Promise<WatchlistItem> {
    return await prisma.watchlistItem.create({
      data: {
        userId,
        itemId,
        itemType,
      },
    });
  },

  // Remove item from watchlist
  async removeFromWatchlist(userId: string, itemId: string, itemType: "MARKET" | "OPTION"): Promise<void> {
    await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        itemId,
        itemType,
      },
    });
  },

  // Check if item is in user's watchlist
  async isInWatchlist(userId: string, itemId: string, itemType: "MARKET" | "OPTION"): Promise<boolean> {
    const item = await prisma.watchlistItem.findFirst({
      where: {
        userId,
        itemId,
        itemType,
      },
    });
    return !!item;
  },

  // Get user's watchlist
  async getUserWatchlist(userId: string, itemType?: "MARKET" | "OPTION"): Promise<WatchlistItem[]> {
    const where: {userId: string, itemType?: "MARKET" | "OPTION"} = { userId };

    if (itemType) {
      where.itemType = itemType;
    }

    return await prisma.watchlistItem.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  // Get watchlist status for multiple items
  async getWatchlistStatus(userId: string, itemIds: string[], itemType: "MARKET" | "OPTION"): Promise<Record<string, boolean>> {
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: {
        userId,
        itemId: { in: itemIds },
        itemType,
      },
    });

    const statusMap: Record<string, boolean> = {};
    itemIds.forEach(id => {
      statusMap[id] = watchlistItems.some(item => item.itemId === id);
    });

    return statusMap;
  },

  // Clear all watchlist items for a user
  async clearUserWatchlist(userId: string): Promise<void> {
    await prisma.watchlistItem.deleteMany({
      where: {
        userId,
      },
    });
  },
}; 
