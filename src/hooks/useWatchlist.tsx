import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface WatchlistItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: "MARKET" | "OPTION";
  createdAt: Date;
  updatedAt: Date;
}

export const useWatchlist = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Get user's watchlist
  const { data: watchlist = [], isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async (): Promise<WatchlistItem[]> => {
      const response = await fetch("/api/watchlist");
      if (!response.ok) {
        throw new Error("Failed to fetch watchlist");
      }
      const data = await response.json();
      return data.watchlist;
    },
    enabled: !!session?.user?.id,
  });

  // Check if specific item is in watchlist
  const checkWatchlistStatus = async (itemId: string, itemType: "MARKET" | "OPTION"): Promise<boolean> => {
    const response = await fetch(`/api/watchlist/check?itemId=${itemId}&itemType=${itemType}`);
    if (!response.ok) {
      throw new Error("Failed to check watchlist status");
    }
    const data = await response.json();
    return data.isInWatchlist;
  };

  // Add item to watchlist
  const addToWatchlistMutation = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: "MARKET" | "OPTION" }) => {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, itemType }),
      });
      if (!response.ok) {
        throw new Error("Failed to add to watchlist");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  // Remove item from watchlist
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: "MARKET" | "OPTION" }) => {
      const response = await fetch(`/api/watchlist?itemId=${itemId}&itemType=${itemType}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to remove from watchlist");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  // Clear all watchlist items
  const clearWatchlistMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/watchlist", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to clear watchlist");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  // Toggle watchlist status
  const toggleWatchlist = async (itemId: string, itemType: "MARKET" | "OPTION") => {
    const isInWatchlist = await checkWatchlistStatus(itemId, itemType);
    
    if (isInWatchlist) {
      await removeFromWatchlistMutation.mutateAsync({ itemId, itemType });
    } else {
      await addToWatchlistMutation.mutateAsync({ itemId, itemType });
    }
  };

  return {
    watchlist,
    isLoadingWatchlist,
    addToWatchlist: addToWatchlistMutation.mutateAsync,
    removeFromWatchlist: removeFromWatchlistMutation.mutateAsync,
    clearWatchlist: clearWatchlistMutation.mutateAsync,
    toggleWatchlist,
    checkWatchlistStatus,
    isAddingToWatchlist: addToWatchlistMutation.isPending,
    isRemovingFromWatchlist: removeFromWatchlistMutation.isPending,
    isClearingWatchlist: clearWatchlistMutation.isPending,
  };
}; 
