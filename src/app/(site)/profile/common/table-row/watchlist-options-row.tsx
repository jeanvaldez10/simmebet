import { ExpiryIndicator } from "@/components/options/ExpiryIndicator";
import { useOptionWatchlist } from "@/hooks/useOptionWatchlist";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WatchListOptionsRow = (headers: any) => {
  const {
    tokenImage,
    token,
    position,
    currentPrice,
    optionsAvailable,
    strikePrice,
    expiry,
    tokenSymbol,
  } = headers;

  const router = useRouter();

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useOptionWatchlist(String(headers.id));

  return (
    <div className="text-[#FFFFFFA3] grid grid-cols-7 p-4  transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      <div className="flex items-center gap-3 w-full col-span-1">
        <button
          className={`hover:text-white pointer transition-colors text-[#FFFFFF52] ${
            isInWatchlist ? "text-white" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist();
          }}
          disabled={
            isLoadingStatus || isAddingToWatchlist || isRemovingFromWatchlist
          }
        >
          <Star className={`w-5 h-5 ${isInWatchlist ? "fill-current" : ""}`} />
        </button>
        <div className="w-[40px] h-[40px] rounded-[16px] overflow-hidden bg-gray-800 flex-shrink-0">
          <Image
            src={tokenImage}
            alt={token || "picture"}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
        <h2 className=" text-base text-white font-semibold">{token}</h2>
      </div>

      <div
        className={cn(
          "col-span-1 flex items-center text-sm justify-center",
          position === "Long" ? "text-[#36FD68]" : "text-[#FD3748]"
        )}
      >
        {position}
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        {currentPrice}
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        {optionsAvailable}
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        {strikePrice}
      </div>

      <div className="col-span-1 flex text-sm items-center justify-center gap-1">
        <ExpiryIndicator value={7} size={16} thickness={3} />
        <div>{expiry}</div>
      </div>

      <div className="flex items-center col-span-1 w-full justify-end  text-sm whitespace-nowrap gap-2">
        <button
          className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
          aria-label="View Market"
          tabIndex={0}
          onClick={() => router.push(`/options/${tokenSymbol}`)}
        >
          View Option
        </button>
      </div>
    </div>
  );
};

export default WatchListOptionsRow;
