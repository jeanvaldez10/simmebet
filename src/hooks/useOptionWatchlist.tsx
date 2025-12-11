import { useMemo } from "react";
import { useWatchlist } from "./useWatchlist";

export const useOptionWatchlist = (optionId: string) => {
  const { 
    watchlist, 
    isLoadingWatchlist, 
    addToWatchlist, 
    removeFromWatchlist,
    isAddingToWatchlist,
    isRemovingFromWatchlist 
  } = useWatchlist();

  const isInWatchlist = useMemo(() => {
    return watchlist.some(item => item.itemId === optionId && item.itemType === "OPTION");
  }, [watchlist, optionId]);

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        console.log(`Removing option ${optionId} from watchlist`);
        await removeFromWatchlist({ itemId: optionId, itemType: "OPTION" });
      } else {
        console.log(`Adding option ${optionId} to watchlist`);
        await addToWatchlist({ itemId: optionId, itemType: "OPTION" });
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
