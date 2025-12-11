"use client";

import { useMarkets } from "@/hooks/useMarkets";
import { useUserTokenHoldings } from "@/hooks/useUserTokenHoldings";
import { useUserLiquidityPositions } from "@/hooks/useUserLiquidityPositions";
import { useLayoutHeights } from "@/hooks/use-layout-heights";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useState, useMemo } from "react";
import { MarketsGrid } from "@/components/market/MarketsGrid";
import { MarketCategories } from "@/components/market/MarketCategories";
import { SearchInput } from "../options/common/search-input";
import { SortOption } from "@/components/shared/FilterDropdown";
import { useAuthContext } from "@/context/AuthProvider";
import useHeaderModal from "@/hooks/use-header-modal";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MarketPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Active");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const { totalHeight } = useLayoutHeights();
  const { isAuthenticated } = useAuthContext();
  const { setAuthModal } = useHeaderModal();

  const { data: markets, isLoading: loading, error } = useMarkets();
  const { watchlist } = useWatchlist();
  
  useUserTokenHoldings();
  useUserLiquidityPositions();

  const filteredMarkets = useMemo(() => {
    let allMarkets = markets || [];
    
    // Get favorited market IDs
    const favoritedMarketIds = watchlist
      .filter(item => item.itemType === "MARKET")
      .map(item => item.itemId);
    
    // Apply filters
    allMarkets = allMarkets.filter((market) => {
      // Filter by active/resolved status
      if (activeTab !== "All") {
        const isResolved = activeTab === "Resolved";
        if (market.isResolved !== isResolved) return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return market.question.toLowerCase().includes(query) || false;
      }

      // Filter by category
      if (selectedCategory && selectedCategory !== "all") {
        if (selectedCategory === "favorites") {
          // For "favorites", show only favorited markets
          return favoritedMarketIds.includes(market.id);
        } else if (selectedCategory === "live") {
          // For "live", show only active markets
          return !market.isResolved;
        } else {
          // For database categories, filter by categories array
          return market.categories?.some(cat => cat.id === selectedCategory) || false;
        }
      }

      return true;
    });

    // Apply sorting
    if (sortBy !== "default") {
      allMarkets = [...allMarkets].sort((a, b) => {
        switch (sortBy) {
          case "soonest":
            const aSoonestDate = a.date ? new Date(a.date).getTime() : Infinity;
            const bSoonestDate = b.date ? new Date(b.date).getTime() : Infinity;
            return aSoonestDate - bSoonestDate;
          
          case "latest":
            const aLatestDate = a.date ? new Date(a.date).getTime() : 0;
            const bLatestDate = b.date ? new Date(b.date).getTime() : 0;
            return bLatestDate - aLatestDate;
          
          case "liquidity-most":
            const aLiquidityMost = Number(a.totalLiquidity || 0);
            const bLiquidityMost = Number(b.totalLiquidity || 0);
            return bLiquidityMost - aLiquidityMost;
          
          case "liquidity-least":
            const aLiquidityLeast = Number(a.totalLiquidity || 0);
            const bLiquidityLeast = Number(b.totalLiquidity || 0);
            return aLiquidityLeast - bLiquidityLeast;
          
          case "volume-most":
            const aVolumeMost = Number(a.volume || 0);
            const bVolumeMost = Number(b.volume || 0);
            return bVolumeMost - aVolumeMost;
          
          case "volume-least":
            const aVolumeLeast = Number(a.volume || 0);
            const bVolumeLeast = Number(b.volume || 0);
            return aVolumeLeast - bVolumeLeast;
          
          default:
            return 0;
        }
      });
    } else {
      // Default sorting uses orderIndex from admin
      allMarkets = [...allMarkets].sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return allMarkets;
  }, [activeTab, searchQuery, selectedCategory, markets, watchlist, sortBy]);

  return (
    <div style={{ paddingTop: `${totalHeight + 20}px` }}>
      {/* Fixed Market Categories */}
      <MarketCategories 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      {/* Gradient overlay to fade out cards behind fixed header */}
      <div 
        className="fixed left-0 right-0 pointer-events-none z-40"
        style={{ 
          top: '0',
          height: `${totalHeight + 115}px`,
          background: 'linear-gradient(to bottom, #000000 0%, #000000 65%, rgba(0, 0, 0, 0.8) 75%, transparent 100%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-[9px] pb-20">
        <div 
          className="border sticky z-50 border-[#FFFFFF29] flex items-center justify-between gap-6 bg-[rgba(3,3,3,0.9)] py-2 px-4 backdrop-blur-sm rounded-[16px] mb-2"
          style={{ top: `${totalHeight + 21}px` }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("Active")}
              className={`font-semibold text-xl transition-colors cursor-pointer ${
                activeTab === "Active"
                  ? "text-white !underline-offset-[18px] md:underline"
                  : "text-[#FFFFFF52]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab("Resolved")}
              className={`font-semibold text-xl transition-colors cursor-pointer ${
                activeTab === "Resolved"
                  ? "text-white !underline-offset-[18px] md:underline"
                  : "text-[#FFFFFF52]"
              }`}
            >
              Resolved
            </button>
          </div>

          <SearchInput 
            search={searchQuery} 
            setSearch={setSearchQuery}
            showSort={true}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Show auth message when favorites is selected and user is not authenticated */}
        {selectedCategory === "favorites" && !isAuthenticated ? (
          <div
            className={cn(
              "overflow-hidden relative mt-4 bg-black backdrop-blur-sm w-full border border-dashed border-[#FFFFFF29] p-4 rounded-[16px] flex items-center justify-center min-h-[401px]"
            )}
          >
            <div className="relative z-10 flex items-center justify-center gap-3 flex-col">
              <Image src="/watchlist-not-found.png" width={48} height={48} alt="not-found" />
              <div className="flex items-center justify-center gap-1 flex-col">
                <h2 className="text-2xl font-semibold text-center">Sign in to view your favorites</h2>
                <p className="text-[#FFFFFFA3] text-base text-center">
                  Create an account or sign in to save and track your favorite markets.
                </p>
              </div>

              <button
                onClick={() => setAuthModal("main_signup")}
                className={cn(
                  "bg-transparent border-1 cursor-pointer border-[#FFFFFF52] px-5 py-2 rounded-[80px] text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#FFFFFF0A]"
                )}
                aria-label="Create Account"
              >
                Create Account
              </button>
            </div>

            <div
              className="w-[366px] h-[366px] blur-[80px] absolute top-[-23%]"
              style={{ background: "linear-gradient(#FFFFFF52 32%, black 0%)" }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
            <MarketsGrid 
              markets={filteredMarkets}
              isLoading={loading}
              error={error}
            />
          </div>
        )}
        
        {loading && filteredMarkets.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-gray-800 rounded-full p-2 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPage;
