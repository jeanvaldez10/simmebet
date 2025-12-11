"use client";

import { Search } from "lucide-react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

export function SearchBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearch,
}: Props) {
  const tabs = ["Active", "Resolved"];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 md:mt-0 px-4 md:px-0">
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`font-semibold text-2xl md:text-3xl transition-colors  cursor-pointer ${
              activeTab === tab ? "text-white" : "text-gray-500"
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 justify-end mt-0 md:mt-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search market"
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600 h-[36px]"
          />
        </div>
      </div>
    </div>
  );
}
