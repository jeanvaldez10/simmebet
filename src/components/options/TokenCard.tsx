import React from "react";
import { useRouter } from "next/navigation";
import { Star, Upload } from "lucide-react";
import ProgressBar from "./ProgressBar";
import Button from "../Button";
import Image from "next/image";
import { ExpiryIndicator } from "./ExpiryIndicator";
import { useOptionWatchlist } from "@/hooks/useOptionWatchlist";

interface TokenCardProps {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  currentPrice: string;
  optionsAvailable: number;
  totalOptions: number;
  strikePrice: string;
  expiry: string;
  position: string;
  tokenImage: string;
}

const TokenCard = ({
  id,
  tokenSymbol,
  tokenName,
  currentPrice,
  optionsAvailable,
  totalOptions,
  strikePrice,
  expiry,
  position,
  tokenImage,
}: TokenCardProps) => {
  const router = useRouter();

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useOptionWatchlist(id);
  return (
    <div className="bg-gray-900 rounded-3xl p-4 text-white shadow-2xl cursor-pointer">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Token Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
            <Image
              src={tokenImage}
              alt={tokenSymbol}
              className="w-full h-full object-cover"
              width={64}
              height={64}
            />
          </div>

          {/* Token Info */}
          <div>
            <h2 className="text-2xl font-bold text-white">{tokenSymbol}</h2>
            <p className="text-gray-400 text-sm font-semibold">{tokenName}</p>
          </div>
        </div>

        {/* Icons and Price */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              className={`hover:text-white transition-colors text-[#FFFFFF52] ${
                isInWatchlist ? "text-white" : ""
              } ${
                isAddingToWatchlist || isRemovingFromWatchlist
                  ? "opacity-50"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist();
              }}
              disabled={
                isLoadingStatus ||
                isAddingToWatchlist ||
                isRemovingFromWatchlist
              }
              title={
                isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
              }
            >
              <Star
                className={`w-5 h-5 ${isInWatchlist ? "fill-current" : ""}`}
              />
            </button>
            <Upload className="w-5 h-5 text-[#FFFFFF52]" />
          </div>
          <div className="text-sm font-bold text-white">{currentPrice}</div>
        </div>
      </div>

      {/* Options Available Section */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm font-semibold mb-2">
          Options available
        </p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-white text-md font-bold">
            {optionsAvailable.toLocaleString()}
          </span>
          <span className="text-gray-500 text-md font-bold">
            of {totalOptions.toLocaleString()}
          </span>
        </div>
        <ProgressBar current={optionsAvailable} total={totalOptions} />
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-gray-400 text-sm mb-1">Strike</p>
          <p className="text-white font-bold text-md">{strikePrice}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Expiry</p>
          <div className="flex items-center gap-2">
            <ExpiryIndicator value={7} size={16} thickness={3} />
            <p className="text-white font-bold text-md">{expiry}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Position</p>
          <p className="text-green-400 font-bold text-md">{position}</p>
        </div>
      </div>

      {/* Buy Button */}
      <Button
        variant="tertiary"
        className="w-full"
        onClick={() => {
          router.push(`/options/${tokenSymbol}`);
        }}
      >
        Buy
      </Button>
    </div>
  );
};

export default TokenCard;
