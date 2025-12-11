"use client";

import { useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFilterClick: () => void;
}

export function StatusBar({
  activeTab,
  onTabChange,
  onFilterClick,
}: StatusTabsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { totalHeight } = useLayoutHeights();

  const tabs = ["All", "Active", "Resolved"];

  return (
    <div 
      className="fixed left-0 right-0 md:left-64 z-40 flex flex-col md:flex-row items-center justify-between p-5 bg-black border-b border-white/10"
      style={{ top: `${totalHeight}px` }}
    >
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-0 py-1 text-xl font-medium ${
              activeTab === tab ? "text-white" : "text-gray-500"
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={onFilterClick}
          className="ml-auto md:hidden  p-2 rounded-md"
        >
          <Image
            src="/images/filter.svg"
            alt="Filter"
            width={20}
            height={20}
            className="h-5 w-5 text-gray-400"
          />
        </button>
      </div>

      <div className="flex items-center gap-2 justify-end mt-4 md:mt-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Search market"
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600"
          />
        </div>

        <div className="flex border border-gray-700 rounded-md overflow-hidden">
          <button
            className={`h-8 w-8 flex items-center justify-center ${
              viewMode === "grid" ? "bg-gray-800" : "bg-transparent"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
          <button
            className={`h-8 w-8 flex items-center justify-center ${
              viewMode === "list" ? "bg-gray-800" : "bg-transparent"
            }`}
            onClick={() => setViewMode("list")}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H21M3 12H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
