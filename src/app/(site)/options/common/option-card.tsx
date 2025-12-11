"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/options/ProgressBar";
import { ExpiryIndicator } from "@/components/options/ExpiryIndicator";
import Button from "@/components/Button";
import { useOptionWatchlist } from "@/hooks/useOptionWatchlist";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import ShareIcon from "@/components/shared/share-icon";

interface TokenCardProps {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  currentPrice: string;
  optionsAvailable: number;
  totalOptions: number;
  strikePrice: string;
  expiry: string;
  expiryProgress?: number;
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
  expiryProgress,
}: TokenCardProps) => {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/options/${id}`;

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useOptionWatchlist(id);

  return (
    <React.Fragment>
      <div
        className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl pointer"
        onClick={() => {
          router.push(`/options/${tokenSymbol}`);
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              <Image
                src={tokenImage}
                alt={tokenSymbol}
                className="w-full h-full object-cover"
                width={60}
                height={60}
              />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <h2 className="text-2xl font-semibold text-[#FFFFFF]">
                  {tokenSymbol}
                </h2>
                <div className="flex items-center justify-center rounded-[80px] w-[25px] h-[25px]">
                  <Image
                    src={"/btc.png"}
                    alt="bitcoin"
                    width={17}
                    height={17}
                  />
                </div>
              </div>
              <p className="text-[#FFFFFFA3] text-sm font-semibold">
                {tokenName}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                className={`hover:text-white transition-colors text-[#FFFFFF52] ${
                  isInWatchlist ? "text-white" : ""
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
              >
                <Star
                  className={`w-5 h-5 ${isInWatchlist ? "fill-current" : ""}`}
                />
              </button>

              <div
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareModalOpen(true);
                }}
                style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}
              >
                <ShareIcon width="20" height="20" />
              </div>
            </div>
            <div className="text-sm font-bold text-white">{currentPrice}</div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[#FFFFFFA3] text-sm mb-2">Options available</p>
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

        <div className="grid grid-cols-3 gap-4 mb-6 justify-items-start">
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Strike</p>
            <p className="text-[#FFFFFF] font-semibold text-sm text-md">
              {strikePrice}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Expiry</p>
            <div className="flex items-center gap-2">
              <ExpiryIndicator
                value={expiryProgress ?? 55}
                size={16}
                thickness={3}
              />
              <p className="text-[#FFFFFF] font-semibold text-sm text-md">
                {expiry}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-xs mb-1">Position</p>
            <p className="text-green-400 font-semibold text-md text-sm">
              {position}
            </p>
          </div>
        </div>

        <Button
          variant="tertiary"
          className="w-full h-[36px] !text-sm !font-semibold"
          onClick={() => {
            router.push(`/options/${tokenSymbol}`);
          }}
        >
          Buy
        </Button>
      </div>
      {isShareModalOpen && (
        <ShareModal
          tweetUrl={encodeURIComponent(
            `Check out this prediction market on Bluff!\n\n${url}`
          )}
          url={url}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </React.Fragment>
  );
};

export default TokenCard;
