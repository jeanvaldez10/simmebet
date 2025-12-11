import { useMemo } from "react";
import { useWatchlist } from "./useWatchlist";

export const useMarketWatchlist = (marketId: string) => {
  const { 
    watchlist, 
    isLoadingWatchlist, 
    addToWatchlist, 
    removeFromWatchlist,
    isAddingToWatchlist,
    isRemovingFromWatchlist 
  } = useWatchlist();

  const isInWatchlist = useMemo(() => {
    return watchlist.some(item => item.itemId === marketId && item.itemType === "MARKET");
  }, [watchlist, marketId]);

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        console.log(`Removing market ${marketId} from watchlist`);
        await removeFromWatchlist({ itemId: marketId, itemType: "MARKET" });
      } else {
        console.log(`Adding market ${marketId} to watchlist`);
        await addToWatchlist({ itemId: marketId, itemType: "MARKET" });
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
    }
  };

  return {
    isInWatchlist,
    isLoadingStatus: isLoadingWatchlist,
    toggleWatchlist,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  };
}; 
