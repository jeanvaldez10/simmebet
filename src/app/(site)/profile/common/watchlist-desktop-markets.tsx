import React from "react";
import { IMarketData } from "@/interfaces/market";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

const WatchListDesktopMarkets = ({
  isError,
  isLoading,
  data,
}: {
  data: IMarketData[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const { totalHeight } = useLayoutHeights();
  let rows: React.ReactNode[] = [];

  if (isLoading || isError || data === undefined) {
    // Loading skeleton
    rows = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="text-[#FFFFFFA3] p-4 rounded-[16px] bg-gray-700 animate-pulse w-full h-[74px]"
      >
        <div className="flex items-center gap-3 w-full col-span-1 h-[60px]" />
      </div>
    ));
  } else if (data.length === 0) {
    rows = [
      <div
        key="empty"
        className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr] p-4 transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]"
      >
        <div className="col-span-full text-center py-8">
          <p className="text-gray-400 mb-4">No starred markets found</p>
          <p className="text-sm text-gray-500">
            Star markets to add them to your watchlist
          </p>
        </div>
      </div>,
    ];
  } else {
    // Group markets into rows of 3
    const marketRows = [];
    for (let i = 0; i < data.length; i += 3) {
      const rowMarkets = data.slice(i, i + 3);
      marketRows.push(
        <div
          key={i}
          className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr] p-4 transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52] gap-4"
        >
          {rowMarkets.map((market) => (
            <div key={market.id} className="flex items-center gap-3">
              <Star className="w-5 h-5 text-[#FFFFFF52] hover:text-white fill-current" />
              <div className="w-[40px] h-[40px] rounded-[16px] overflow-hidden bg-gray-800 flex-shrink-0">
                <Image
                  src={market.imageSquare || market.image || "/images/football.png"}
                  alt={market.question}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#FFFFFF] truncate">
                  <Link href={`/market/${market.contractAddress}`}>{market.question}</Link>
                </p>
                <p className="text-xs text-gray-400">
                  Volume: ${market.volume?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          ))}
          {/* Fill empty slots if less than 3 markets in this row */}
          {Array.from({ length: 3 - rowMarkets.length }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="flex items-center gap-3 opacity-50"
            >
              <div className="w-5 h-5" />
              <div className="w-[40px] h-[40px] rounded-[16px] bg-gray-800" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded mb-1" />
                <div className="h-3 bg-gray-700 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    rows = marketRows;
  }

  return (
    <div className="w-full md:block hidden">
      <div className="overflow-hidden border-none">
        <div className="overflow-x-auto">
          <div className="w-[1256px]">
            <div 
              className="bg-black backdrop-blur-sm rounded-b-[16px] border-t-transparent grid grid-cols-[1fr_1fr_1fr] p-4 text-xs font-normal text-[#FFFFFFA3] capitalize tracking-wider border border-[#FFFFFF29] sticky z-30"
              style={{ top: `${totalHeight + 46}px` }}
            >
              <div className="col-span-1">Market 1</div>
              <div className="col-span-1 text-center">Market 2</div>
              <div className="col-span-1 text-end">Market 3</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col gap-2 mt-2">{rows}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchListDesktopMarkets;
