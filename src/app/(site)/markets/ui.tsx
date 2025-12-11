/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";

import { SearchBar } from "@/components/SearchBar";
import { useState, useMemo } from "react";
import { MarketCard } from "@/components/market/MarketCard";

const MarketPage = ({ allMarkets }: { allMarkets: any[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Active");

  const filteredMarkets = useMemo(() => {
    return allMarkets.filter((market) => {
      if (activeTab !== "All") {
        const isResolved = activeTab === "Resolved";
        if (market.isResolved !== isResolved) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return market.question.toLowerCase().includes(query) || false;
      }

      return true;
    });
  }, [allMarkets, activeTab, searchQuery]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto md:px-2 sm:px-6 mt-4">
      <SearchBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0 lg:px-0">
        {allMarkets.length === 0 ? (
          <>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="bg-[#16171E] rounded-xl overflow-hidden w-full relative p-2 animate-pulse">
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
        ) : filteredMarkets.length === 0 ? (
          <div className="col-span-3 text-center py-6 text-gray-400">
            No markets found matching your criteria
          </div>
        ) : (
          filteredMarkets.map((market) => (
            <Link href={`/market/${market.contractAddress}`} key={market.id} className="h-full">
              <MarketCard market={market} />
            </Link>
          ))
        )}

        {allMarkets.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-gray-800 rounded-full p-2 shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPage;
