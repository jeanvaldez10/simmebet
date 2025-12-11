import React, { useState } from "react";
import Image from "next/image";
import { Trophy, Clock, Star } from "lucide-react";
import { IMarketData } from "@/interfaces/market";
import { formatRelativeTime } from "@/utils/date";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import { useMarketWatchlist } from "@/hooks/useMarketWatchlist";
import ShareIcon from "../shared/share-icon";
import { useAuthContext } from "@/context/AuthProvider";
import useHeaderModal from "@/hooks/use-header-modal";

export interface MarketInfoProps {
  market: IMarketData;
  isRenounced: boolean;

  marketName?: string;
  marketQuestion?: string;
  marketProbability?: {
    yes: number;
    no: number;
  } | null;

  teamInfo: {
    team1: {
      name: string;
      imageUrl: string;
    };
    team2: {
      name: string;
      imageUrl: string;
    };
  };
}

export const MarketInfo: React.FC<MarketInfoProps> = ({
  market,
  marketProbability,
  marketQuestion,
  teamInfo,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const { setAuthModal } = useHeaderModal();

  const formatVolume = (volume: number | string) => {
    const numVolume = typeof volume === "string" ? parseFloat(volume) : volume;
    if (numVolume === 0 || isNaN(numVolume)) return `$${0.0} Volume`;
    if (numVolume >= 1000000) {
      return `$${(numVolume / 1000000).toFixed(2)}M Volume`;
    } else if (numVolume >= 1000) {
      return `$${(numVolume / 1000).toFixed(2)}K Volume`;
    }
    return `$${numVolume.toFixed(2)} Volume`;
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/market/${market.contractAddress}`;

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useMarketWatchlist(String(market.id));

  // Handle watchlist toggle with auth check
  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthModal("main_signup");
      return;
    }
    toggleWatchlist();
  };

  console.log(market);

  // Extract category name from market
  const categoryName =
    market.categories && market.categories.length > 0
      ? market.categories[0].name
      : null;

  return (
    <React.Fragment>
      <div className="flex flex-col gap-6 w-full text-white">
        {/* Desktop layout - image and title side by side */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-800">
            <Image
              src={
                market.imageSquare || market.image ||
                "https://cdn.builder.io/api/v1/image/assets/TEMP/c6dbbd8f2402720d154fc2a164bf5297c032f996"
              }
              alt="Market Icon"
              className="w-full h-full object-cover"
              width={240}
              height={240}
              quality={100}
              unoptimized
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {categoryName && (
              <div className="text-sm font-semibold text-[#FFFFFFA3] uppercase tracking-wide">
                {categoryName}
              </div>
            )}
            <div className="text-2xl font-semibold text-[#F2F2FD]">
              {marketQuestion}
            </div>
          </div>
        </div>

        {/* Mobile layout - banner image at top, title below */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden">
            <Image
              src={
                market.image || market.imageSquare ||
                "https://cdn.builder.io/api/v1/image/assets/TEMP/c6dbbd8f2402720d154fc2a164bf5297c032f996"
              }
              alt="Market Banner"
              fill
              className="object-cover"
              quality={100}
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-1">
            {categoryName && (
              <div className="text-xs font-semibold text-[#FFFFFFA3] uppercase tracking-wide">
                {categoryName}
              </div>
            )}
            <div className="text-xl font-semibold text-[#F2F2FD]">
              {marketQuestion}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Desktop layout for stats and icons */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[#FFFFFFA3]">
                <Trophy className="w-5 h-5" />
                <div className="text-sm">
                  {formatVolume(market.volume || 0)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#FFFFFFA3]">
                <Clock className="w-5 h-5" />
                <div className="text-sm">
                  {formatRelativeTime(market.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`hover:text-white transition-colors pointer text-[#FFFFFF52] ${
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

              <button
                aria-label="Share"
                tabIndex={0}
                onClick={handleShare}
                className="p-2 text-[#FFFFFFA3] pointer"
                style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}
              >
                <ShareIcon width="20" height="20" />
              </button>
            </div>
          </div>

          {/* Mobile layout for stats */}
          <div className="md:hidden flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#FFFFFFA3]">
              <Trophy className="w-4 h-4" />
              <div className="text-xs">
                {formatVolume(market.volume || 0)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#FFFFFFA3]">
              <Clock className="w-4 h-4" />
              <div className="text-xs">
                {formatRelativeTime(market.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            {!teamInfo.team1.name && (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 p-2 rounded-full border border-[#FFFFFF29] bg-[#111217]">
                    <div className="w-2 h-2 rounded-full bg-[#FF4D4D]" />
                    <div className="text-sm text-[#FFFFFFA3]">
                      No: {marketProbability?.no.toFixed(2)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-full border border-[#FFFFFF29] bg-[#111217]">
                    <div className="w-2 h-2 rounded-full bg-[#46FD84]" />
                    <div className="text-sm  text-[#FFFFFFA3]">
                      Yes: {marketProbability?.yes.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {/* Mobile action icons for non-team layout */}
                <div className="md:hidden flex items-center gap-2">
                  <button
                    className={`hover:text-white transition-colors pointer text-[#FFFFFF52] ${
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

                  <button
                    aria-label="Share"
                    tabIndex={0}
                    onClick={handleShare}
                    className="p-1 text-[#FFFFFFA3] pointer"
                    style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}
                  >
                    <ShareIcon width="20" height="20" />
                  </button>
                </div>
              </>
            )}

            {teamInfo.team1.name && (
              <>
                {/* Desktop layout */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="border border-[#FFFFFF29] p-1 rounded-[80px] flex items-center gap-2 pr-3">
                    <div className="rounded-full border border-[#FD3748] overflow-hidden w-10 h-10">
                      <Image
                        alt={teamInfo.team2.name}
                        src={teamInfo.team2.imageUrl}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover object-center"
                        unoptimized
                      />
                    </div>
                    <p className="text-[#FFFFFFA3] text-sm font-normal">
                      {teamInfo.team2.name}
                    </p>
                  </div>
                  <div className="border border-[#FFFFFF29] p-1 rounded-[80px] flex items-center gap-2 pr-3">
                    <div className="rounded-full border border-[#46FD84] overflow-hidden w-10 h-10">
                      <Image
                        alt={teamInfo.team1.name}
                        src={teamInfo.team1.imageUrl}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover object-center"
                        unoptimized
                      />
                    </div>
                    <p className="text-[#FFFFFFA3] text-sm font-normal">
                      {teamInfo.team1.name}
                    </p>
                  </div>
                </div>

                {/* Mobile layout with team icons only and right-aligned action icons */}
                <div className="md:hidden flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="border border-[#FFFFFF29] p-1 rounded-full">
                      <div className="rounded-full border border-[#FD3748] overflow-hidden w-8 h-8">
                        <Image
                          alt={teamInfo.team2.name}
                          src={teamInfo.team2.imageUrl}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover object-center"
                          unoptimized
                        />
                      </div>
                    </div>
                    <div className="border border-[#FFFFFF29] p-1 rounded-full">
                      <div className="rounded-full border border-[#46FD84] overflow-hidden w-8 h-8">
                        <Image
                          alt={teamInfo.team1.name}
                          src={teamInfo.team1.imageUrl}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover object-center"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Right-aligned action icons */}
                  <div className="flex items-center gap-2">
                    <button
                      className={`hover:text-white transition-colors pointer text-[#FFFFFF52] ${
                        isInWatchlist ? "text-white" : ""
                      } ${
                        isAddingToWatchlist || isRemovingFromWatchlist
                          ? "opacity-50"
                          : ""
                      }`}
                      onClick={handleWatchlistClick}
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

                    <button
                      aria-label="Share"
                      tabIndex={0}
                      onClick={handleShare}
                      className="p-1 text-[#FFFFFFA3] pointer"
                      style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}
                    >
                      <ShareIcon width="20" height="20" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* <div className="border border-[#FFFFFF29] rounded-[80px] py-1 pl-[6px] pr-3 flex items-center gap-1 w-fit">
              <CustomTooltip
                className="max-w-[320px] w-fit text-xs"
                name={
                  <div className="space-y-2">
                    <p>
                      This shows whether the market has been renounced. If
                      unrenounced, the creator can still edit the question,
                      description, oracles, reference links, and end date.
                    </p>

                    <p>
                      Once renounced, all these fields are permanently locked.
                      Ensuring the market rules stay fixed for all participants.
                    </p>
                  </div>
                }
              >
                <Info className="w-5 h-5 text-[#FFFFFF52] pointer hover:text-white" />
              </CustomTooltip>

              <span className="text-[#FFFFFFA3] text-sm font-normal">
                {isRenounced ? "Renounced" : "Unrenounced"}
              </span>
            </div> */}

          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          tweetUrl={encodeURIComponent(
            `Check out this prediction market on Bluff!\n\n${url}`
          )}
          url={url}
          marketName={market.name}
          marketImage={market.image}
          marketQuestion={market.question}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </React.Fragment>
  );
};
