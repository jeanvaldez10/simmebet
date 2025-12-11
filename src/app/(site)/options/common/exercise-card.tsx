/* eslint-disable @typescript-eslint/ban-ts-comment */
import Image from "next/image";
import { Star } from "lucide-react";
import SimpleChart from "@/components/options/SimpleChart";
import { ExpiryIndicator } from "@/components/options/ExpiryIndicator";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import { useOptionWatchlist } from "@/hooks/useOptionWatchlist";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createFlexSnapshot } from "@/utils/flexSnapshot";
import FlexModal from "@/app/(site)/profile/common/modal/flex-modal";
import CircleFlexLottieButton from "@/components/flex-cards/circle-flex-button";
import { TOptionExerciseForm } from "../hooks/use-option-exercise";
import { formatBalance } from "@/utils/format";
import { TOptionSell } from "../hooks/use-option-sell";

interface PortfolioCardProps {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  currentPrice: string;
  priceChange: number;
  strikePrice: number;
  expiry: string;
  size: string;
  position: string;
  tokenImage: string;
  chartData: number[];
  onSell: (e: TOptionSell) => void;
  onExercise: (e: TOptionExerciseForm) => void;
  isProfileComponent?: boolean;
  isPublic?: boolean;
}

const ExerciseCard = ({
  id,
  tokenSymbol,
  tokenName,
  currentPrice,
  priceChange,
  strikePrice,
  expiry,
  size,
  position,
  tokenImage,
  chartData,
  onExercise,
  onSell,
  isProfileComponent = true,
  isPublic = false,
}: PortfolioCardProps) => {
  const router = useRouter();
  const isNegative = priceChange < 0;
  const [isShareModalOpen, setIsShareModalOpen] = useState("");

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
        onClick={() => router.push(`/options/${id}`)}
      >
        <div className="flex items-center justify-between mb-3">
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
              <div className=" flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-[#FFFFFF]">
                  {tokenSymbol}
                </h2>

                <div className="flex items-center justify-center rounded-[80px] w-[16px] h-[16px]">
                  <Image
                    src={"/btc.png"}
                    alt="bitcoin"
                    width={16}
                    height={16}
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
                className={`hover:text-white transition-colors text-[#FFFFFF52]  ${
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

              <CircleFlexLottieButton
                // @ts-ignore
                onClick={async (e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  setIsShareModalOpen("loading");
                  try {
                    // Use server-side OG generation like bet cards
                    const flexType = position === "Short" ? "flex13" : "flex14";
                    const result = await createFlexSnapshot(flexType);
                    const imageUrl = `/api/og/flex?snapshotId=${result.snapshotId}`;
                    setIsShareModalOpen(imageUrl);
                  } catch (error) {
                    console.error('Error creating options snapshot:', error);
                    setIsShareModalOpen(""); // Close modal on error
                  }
                }}
              />
            </div>

            <div className="text-sm font-bold text-white">{currentPrice}</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-sm font-bold ${
                isNegative
                  ? "text-red-500 bg-red-500/10 px-2 py-1 rounded-full"
                  : "text-green-500 bg-green-500/10 px-2 py-1 rounded-full"
              }`}
            >
              {isNegative ? "-" : "+"}
              {formatBalance(priceChange)}
            </span>
          </div>
          <div className="h-10 w-full">
            <SimpleChart data={chartData} isNegative={isNegative} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3 justify-items-center">
          <div>
            <p className="text-[#FFFFFFA3] text-sm mb-1">Strike</p>
            <p className="text-[#FFFFFF] font-semibold text-sm">
              ${strikePrice}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-sm mb-1">Expiry</p>
            <div className="flex items-center justify-between gap-1">
              <ExpiryIndicator value={7} size={16} thickness={3} />
              <p className="text-[#FFFFFF] font-semibold text-xs">{expiry}</p>
            </div>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-sm mb-1">Size</p>
            <p className="text-[#FFFFFF] font-semibold text-sm">{size}</p>
          </div>
          <div>
            <p className="text-[#FFFFFFA3] text-sm mb-1">Position</p>
            <p className="text-green-400 font-semibold text-sm">{position}</p>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-2",
            !isProfileComponent && "flex-row-reverse"
          )}
        >
          {!isPublic && (
            <>
              <Button
                variant="tertiary"
                className="w-full h-[36px] !text-sm !font-semibold !bg-[#FD3748] "
                size="sm"
                // @ts-ignore
                onClick={(e) => {
                  e.stopPropagation();
                  onSell({
                    name: tokenName,
                    image: tokenImage,
                    symbol: tokenSymbol,
                    amount: 0,
                    price: 0,
                    type: position,
                  });
                }}
              >
                Sell
              </Button>

              <Button
                variant={"ghost"}
                className={cn(
                  "w-full h-[36px] !text-sm !font-semibold",
                  isProfileComponent &&
                    "md:!bg-[#FD3748] md:!text-black md:!outline-0"
                )}
                size="sm"
                // @ts-ignore
                onClick={(e) => {
                  e.stopPropagation();
                  onExercise({
                    name: tokenName,
                    image: tokenImage,
                    symbol: tokenSymbol,
                    amount: 0,
                    expiry,
                    optionBalance: 100,
                    optionCost: 30,
                    type: position,
                    priceImpact: priceChange,
                    priceImpactPercentage: 0.4,
                    strikePrice: strikePrice,
                    fee: 0.5,
                  });
                }}
              >
                Exercise
              </Button>
            </>
          )}

          <Button
            variant={"ghost"}
            className={cn(
              "w-full h-[36px] !text-sm !font-semibold",
              !isProfileComponent && "hidden"
            )}
            size="sm"
          >
            View
          </Button>
        </div>
      </div>
      {isShareModalOpen && (
        <FlexModal
          isLoading={isShareModalOpen === "loading"}
          image={isShareModalOpen}
          type={position === "Short" ? "flex13" : "flex14"}
          onClose={() => setIsShareModalOpen("")}
        />
      )}
    </React.Fragment>
  );
};

export default ExerciseCard;
