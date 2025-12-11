/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  LineChart as ChartLine,
  Droplet,
  CircleArrowDown,
  Timer,
  Sword,
  Search,
} from "lucide-react";

interface FilterSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFilterClick: () => void;
}

export function FilterSidebar({
  activeTab,
  onTabChange,
  onFilterClick,
}: FilterSidebarProps) {
  const [sortByExpanded, setSortByExpanded] = useState(true);
  const [topicsExpanded, setTopicsExpanded] = useState(true);
  const [activeSort, setActiveSort] = useState("trending");
  const [activeTopic, setActiveTopic] = useState("top");

  return (
    <div className="h-full">
      <div className="text-white">
        {/* Sort By Section */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setSortByExpanded(!sortByExpanded)}
          >
            <h3 className="text-sm font-medium">Sort By</h3>
            {sortByExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>

          {sortByExpanded && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`justify-start text-sm py-1 px-2 ${
                    activeSort === "trending"
                      ? "bg-white border-white text-black font-bold"
                      : "text-gray-400 hover:text-white border border-gray-800"
                  } flex items-center rounded-md`}
                  onClick={() => setActiveSort("trending")}
                >
                  <ChartLine className="text-gray-500 h-4 mr-1" />
                  Trending
                </button>

                <button
                  className={`justify-start text-sm py-1 px-2 ${
                    activeSort === "liquidity"
                      ? "bg-white border-white text-black font-bold"
                      : "text-gray-400 hover:text-white border border-gray-800"
                  } flex items-center rounded-md`}
                  onClick={() => setActiveSort("liquidity")}
                >
                  <Droplet className="text-gray-500 h-4 mr-1" />
                  Liquidity
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`flex justify-start text-sm py-1 px-2 ${
                    activeSort === "volume"
                      ? "bg-white border-white text-black font-bold"
                      : "text-gray-400 hover:text-white border border-gray-800"
                  } items-center rounded-md`}
                  onClick={() => setActiveSort("volume")}
                >
                  <svg
                    className="text-gray-500 h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="10" width="4" height="10"></rect>
                    <rect x="10" y="4" width="4" height="16"></rect>
                    <rect x="18" y="8" width="4" height="12"></rect>
                  </svg>
                  Volume
                </button>

                <button
                  className={`justify-start text-sm py-1 px-2 ${
                    activeSort === "newest"
                      ? "bg-white border-white text-black font-bold"
                      : "text-gray-400 hover:text-white border border-gray-800"
                  } flex items-center rounded-md`}
                  onClick={() => setActiveSort("newest")}
                >
                  <CircleArrowDown className="text-gray-500 h-4 mr-1" />
                  Newest
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`justify-start text-sm py-1 px-2 ${
                    activeSort === "volume2"
                      ? "bg-white border-white text-black font-bold"
                      : "text-gray-400 hover:text-white border border-gray-800"
                  } flex items-center rounded-md`}
                  onClick={() => setActiveSort("volume2")}
                >
                  <Timer className="text-gray-500 h-4 mr-1" />
                  Volume
                </button>
                <button
                  className={`justify-start text-sm py-1 px-2 ${
                    activeSort === "competitive"
                      ? "bg-white border-white text-black font-bold"
                      : "text-gray-400 hover:text-white border border-gray-800"
                  } flex items-center rounded-md`}
                  onClick={() => setActiveSort("competitive")}
                >
                  <Sword className="text-gray-500 h-4 mr-1" />
                  Competitive
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Topics Section */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setTopicsExpanded(!topicsExpanded)}
          >
            <h3 className="text-sm font-medium">Topics</h3>
            {topicsExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>

          {topicsExpanded && (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {[
                { id: "top", label: "Top" },
                { id: "new", label: "New" },
                { id: "barcelona", label: "Barcelona" },
                { id: "ufc", label: "UFC" },
                { id: "europe-league", label: "Europe League" },
                { id: "nba", label: "NBA" },
                { id: "nfl", label: "NFL" },
                { id: "new-2", label: "New" },
                { id: "barcelona-2", label: "Barcelona" },
                { id: "ufc-2", label: "UFC" },
                { id: "europe-league-2", label: "Europe League" },
                { id: "nba-2", label: "NBA" },
                { id: "nfl-2", label: "NFL" },
              ].map((topic) => (
                <button
                  key={topic.id}
                  className={`w-full justify-start text-sm py-1 px-2 text-left ${
                    activeTopic === topic.id
                      ? "bg-gray-800 border border-gray-700 text-white rounded-2xl"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTopic(topic.id)}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}