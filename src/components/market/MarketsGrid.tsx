import React from "react";
import { MarketCard } from "./MarketCard";
import { useMarketsLastPrices } from "@/hooks/useMarketsLastPrices";
import { useMarketsBatch } from "@/hooks/useMarketsBatch";
import { IMarketData } from "@/interfaces/market";

interface MarketsGridProps {
  markets: IMarketData[];
  isLoading?: boolean;
  error?: Error | null;
}

export function MarketsGrid({ markets, isLoading, error }: MarketsGridProps) {
  // Extract market IDs for batch fetching
  const marketIds = markets.map(market => market.id);
  
  // Fetch market details for all markets in a single request
  const {
    data: marketsData,
    error: marketsError
  } = useMarketsBatch({
    marketIds,
    enabled: markets.length > 0,
  });
  
  // Fetch last prices for all markets in a single request
  const {
    data: lastPricesData,
    error: lastPricesError 
  } = useMarketsLastPrices({
    marketIds,
    enabled: markets.length > 0,
  });

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="bg-[#16171E] rounded-xl overflow-hidden w-full relative p-2 animate-pulse"
          >
            <div className="relative p-4">
              <div className="absolute top-3 right-0">
                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              </div>
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-lg bg-gray-600 flex-shrink-0"></div>
                <div className="w-1/2 space-y-2">
                  <div className="h-4 bg-gray-600 rounded"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-600 py-4 rounded-[80px] h-12"></div>
                <div className="bg-gray-600 rounded-[80px] py-2 h-12"></div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 px-4">
              <div className="h-4 bg-gray-600 rounded w-16"></div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-600 rounded"></div>
                <div className="w-5 h-5 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <div className="col-span-4 text-red-500 text-center py-4">
        Error: {error?.message}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="col-span-4 text-center py-6 text-gray-400">
        No markets found matching your criteria
      </div>
    );
  }

  return (
    <>
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          lastPriceData={lastPricesData?.[market.id] || null}
          marketData={marketsData?.[market.id] || null}
          batchMarketsError={marketsError}
          batchLastPricesError={lastPricesError}
        />
      ))}
    </>
  );
}
