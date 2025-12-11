"use client";

import { useSession } from "next-auth/react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useQuery } from "@tanstack/react-query";
import { marketsApi } from "@/services/api/markets";
import { MarketsGrid } from "@/components/market/MarketsGrid";
import { IMarketData } from "@/interfaces/market";
import { Button } from "@/components/ui/button-old";

export default function WatchlistPage() {
  const { data: session } = useSession();
  const { watchlist, isLoadingWatchlist, clearWatchlist } = useWatchlist();

  // Get market IDs from watchlist
  const marketIds = watchlist
    .filter(item => item.itemType === "MARKET")
    .map(item => item.itemId);

  console.log("Watchlist data:", watchlist);
  console.log("Market IDs from watchlist:", marketIds);

  // Fetch market data for starred markets using batch approach
  const { data: starredMarkets = [], isLoading: isLoadingMarkets } = useQuery({
    queryKey: ["starred-markets", marketIds],
    queryFn: async (): Promise<IMarketData[]> => {
      console.log("Fetching markets for IDs:", marketIds);
      if (marketIds.length === 0) return [];
      
      try {
        // Use batch API instead of individual requests
        const batchData = await marketsApi.getMarketsBatch(marketIds);
        console.log("Batch response:", batchData);
        
        const markets = Object.values(batchData)
          .filter(Boolean)
          .map(item => item!.market)
          .filter(Boolean) as IMarketData[];
        
        console.log("Final markets array:", markets);
        return markets;
      } catch (error) {
        console.error("Error fetching markets batch:", error);
        return [];
      }
    },
    enabled: marketIds.length > 0,
  });

  console.log("Starred markets result:", starredMarkets);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-[#0A0B0F] text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Watchlist</h1>
          <p>Please sign in to view your watchlist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0C0F] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Watchlist</h1>
          {watchlist.length > 0 && (
            <Button
              onClick={() => clearWatchlist()}
              variant="destructive"
              size="sm"
            >
              Clear Watchlist
            </Button>
          )}
        </div>
        
        {isLoadingWatchlist ? (
          <div className="text-center py-8">
            <p>Loading your watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Your watchlist is empty</p>
            <p className="text-sm text-gray-500">
              Star markets and options to add them to your watchlist
            </p>
          </div>
        ) : (
          <div>
            {/* Markets Section */}
            {marketIds.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Markets ({marketIds.length})</h2>
                {isLoadingMarkets ? (
                  <div className="text-center py-4">
                    <p>Loading markets...</p>
                  </div>
                ) : (
                  <MarketsGrid 
                    markets={starredMarkets}
                    isLoading={isLoadingMarkets}
                    error={null}
                  />
                )}
              </div>
            )}

            {/* Options Section */}
            {watchlist.filter(item => item.itemType === "OPTION").length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Options ({watchlist.filter(item => item.itemType === "OPTION").length})
                </h2>
                <div className="text-center py-4">
                  <p className="text-gray-400">Options watchlist coming soon...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
