/* eslint-disable @typescript-eslint/ban-ts-comment */
import Image from "next/image";
import { Star } from "lucide-react";
import { ExpiryIndicator } from "@/components/options/ExpiryIndicator";
import Button from "@/components/Button";
import { TOptionsListed } from "../hooks/use-listed";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOptionWatchlist } from "@/hooks/useOptionWatchlist";
import { createFlexSnapshot } from "@/utils/flexSnapshot";
import FlexModal from "@/app/(site)/profile/common/modal/flex-modal";
import CircleFlexLottieButton from "@/components/flex-cards/circle-flex-button";
import { TOptionBetUpdate } from "@/app/(site)/profile/common/table-row/options-row";
import { TOptionClose } from "../hooks/use-option-close";

const ListedCard = ({
  tokenSymbol,
  tokenName,
  currentPrice,
  strikePrice,
  expiry,
  size,
  position,
  tokenImage,
  listedPrice,
  onClose,
  onUpdate,
  id,
}: TOptionsListed & {
  onUpdate: (e: TOptionBetUpdate) => void;
  onClose: (e: TOptionClose) => void;
}) => {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState("");

  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useOptionWatchlist(String(id));

  return (
    <React.Fragment>
      <div
        className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl pointer"
        onClick={() => router.push(`/options/${id}`)}
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
              <h2 className="text-2xl font-semibold text-[#FFFFFF]">
                {tokenSymbol}
              </h2>
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
                onClick={async (e) => {
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

        <div className="my-3">
          <div className="h-20 w-full">
            <p className=" text-[#FFFFFFA3] text-xs">Listed Price</p>
            <h2 className=" text-5xl font-semibold text-[#FFFFFF] mt-3">
              ${listedPrice}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3  justify-items-center">
          <div>
            <p className="text-[#FFFFFFA3] text-sm mb-1">Strike</p>
            <p className="text-[#FFFFFF] font-semibold text-sm">
              {strikePrice}
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

        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="ghost"
            className="w-full h-[36px] !text-sm !font-semibold"
            size="sm"
            // @ts-ignore
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({
                name: tokenName,
                image: tokenImage,
                symbol: tokenSymbol,
                type: position,
              });
            }}
          >
            Update
          </Button>

          <Button
            variant="ghost"
            className="w-full h-[36px] !text-sm !font-semibold"
            size="sm"
            // @ts-ignore
            onClick={(e) => {
              e.stopPropagation();
              onClose({
                name: tokenName,
                image: tokenImage,
                symbol: tokenSymbol,
                type: position,
                listPrice: 555,
                optionListed: 121,
              });
            }}
          >
            Close
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

export default ListedCard;
