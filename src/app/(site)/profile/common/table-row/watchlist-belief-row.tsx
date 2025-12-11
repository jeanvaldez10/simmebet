import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import { getStatusIcon } from "./belief-row";
import { useMarketWatchlist } from "@/hooks/useMarketWatchlist";
import { IMarketData } from "@/interfaces/market";
import { useReadContract } from "wagmi";
import marketBase from "@/abis/ConditionalTokenMarketBase.json";
import { arbitrum } from "viem/chains";
import { CircularProgress } from "@/components/common/CircularProgress";
import { useRouter } from "next/navigation";
import { useMarketProbability } from "@/hooks/useMarket";

const WatchListBeliefRow = (headers: IMarketData) => {
  const router = useRouter();

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useMarketWatchlist(headers.id);

  const { data: marketName } = useReadContract({
    address: headers?.contractAddress as `0x${string}`,
    abi: marketBase.abi,
    functionName: "marketName",
    chainId: arbitrum.id,
  });

  const { data: marketProbability } = useMarketProbability(headers.id, false);

  return (
    <div className="text-[#FFFFFFA3] grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr] gap-4 p-4 transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      <div className="flex items-center gap-3 w-full">
        <button
          className={`hover:text-white transition-colors pointer text-[#FFFFFF52] ${
            isInWatchlist ? "text-white" : "text-[#FFFFFF52]"
          } ${
            isAddingToWatchlist || isRemovingFromWatchlist ? "opacity-50" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist();
          }}
          disabled={
            isLoadingStatus || isAddingToWatchlist || isRemovingFromWatchlist
          }
          title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          <StarIcon
            className={`w-5 h-5 ${isInWatchlist ? "fill-current" : ""}`}
          />
        </button>
        <div className="w-[40px] h-[40px] rounded-[16px] overflow-hidden bg-gray-800 flex-shrink-0">
          <Image
            src={headers.imageSquare || headers.image || "/images/football.png"}
            alt={headers.question}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <p className="font-semibold text-base text-[#FFFFFF] line-clamp-2">
            {(marketName as string) ?? headers.question}
          </p>
        </div>
      </div>

      <div className="flex flex-col text-sm items-center justify-center">
        <div
          className={cn(
            "flex items-center gap-1 text-sm",
            headers.status === "ACTIVE"
              ? "text-[#DA8F05]"
              : headers.status === "RESOLVED"
              ? "text-[#36FD68]"
              : "text-[#FD3748]"
          )}
        >
          <Image
            src={getStatusIcon(headers.status)}
            alt={headers.status}
            width={12}
            height={12}
          />
          <span className=" capitalize">{headers.status === "ACTIVE" ? "Ongoing" : headers.status.toLowerCase()}</span>
        </div>
      </div>

      <div className="flex items-center w-full justify-end text-sm gap-2">
        <span>Yes at ${Number(headers.yesPrice).toFixed(2)}</span>
        <CircularProgress
          positivePercentage={marketProbability?.yes ?? 0}
          negativePercentage={marketProbability?.no ?? 0}
          size={40}
          strokeWidth={3}
        />

        <button
          className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
          aria-label="View Market"
          tabIndex={0}
          onClick={() =>
            router.push(`/market/${headers.contractAddress}`)
          }
        >
          View Market
        </button>
      </div>
    </div>
  );
};

export default WatchListBeliefRow;
