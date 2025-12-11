import { Star } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { IPositionBelief } from "@/hooks/use-position-belief";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMarketWatchlist } from "@/hooks/useMarketWatchlist";
import LiveIndicator from "@/app/(site)/options/common/live-badge";
import FlexModal from "./modal/flex-modal";
import { useMarkets } from "@/hooks/useMarkets";
import { useAuthContext } from "@/context/AuthProvider";
import CircleFlexLottieButton from "@/components/flex-cards/circle-flex-button";
import { createFlexSnapshot, BetData } from "@/utils/flexSnapshot";
import ClockIcon from "@/components/shared/clock-icon";
import ArrowUp from "@/components/icons/ArrowUp";
import ArrowDown from "@/components/icons/ArrowDown";
import OngoingIcon from "@/components/icons/OngoingIcon";
import { formatBalance } from "@/utils/format";
import { useMarketUsdcInvestment } from "@/hooks/useMarketUsdcInvestment";

const MobileBeliefCard = ({
  belief,
  idx,
  onClaim,
  onUpdate,
  onUpdateLP,
  // onView,
  isPublic,
}: {
  belief: IPositionBelief;
  idx: number;
  onUpdate: (e: string) => void;
  onUpdateLP: (e: string) => void;
  onClaim: (marketAddress?: string) => void;
  onView: () => void;
  isPublic: boolean;
}) => {
  const router = useRouter();
  const { dbUser } = useAuthContext();
  const { data: markets } = useMarkets();

  const [isShareModalOpen, setIsShareModalOpen] = useState("");
  const [currentFlexType, setCurrentFlexType] = useState<"flex10" | "flex15">("flex10");
  
  // Get the actual USDC investment for this market (same as markets screen)
  const { data: usdcInvestment } = useMarketUsdcInvestment(belief.marketId);
  const actualUsdcInvestment = Number(usdcInvestment) || 0;

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useMarketWatchlist(belief.marketId);

  // Find the market data to get the question
  const market = markets?.find(m => m.id === belief.marketId);

  const handleShareBet = async () => {
    setIsShareModalOpen("loading");
    
    try {
      // Calculate bet data for the flex card
      const yesTokens = Number(belief.yesBet) || 0;
      const noTokens = Number(belief.noBet) || 0;
      const winningSide = yesTokens > noTokens ? 'YES' : 'NO';
      
      // Use actual USDC invested (not token calculation)
      const totalBetAmount = actualUsdcInvestment;
      
      // Determine if position is ongoing or completed
      const isOngoing = belief.status === "Ongoing";
      const flexType = isOngoing ? "flex15" : "flex10";
      setCurrentFlexType(flexType);
      
      // For ongoing positions (flex15): use current value (expected value)
      // For completed positions (flex10): show profit/loss
      let amountWonValue: number;
      if (isOngoing) {
        // Current value = expected value (what they'd get if they cashed out now)
        const totalValue = belief.type === "liquidity" 
          ? belief.expectedValue.yes + belief.expectedValue.no
          : Math.max(belief.expectedValue.yes, belief.expectedValue.no);
        amountWonValue = totalValue; // Always positive - shows current value
      } else {
        // Completed: show actual profit/loss
        const totalValue = belief.type === "liquidity" 
          ? belief.expectedValue.yes + belief.expectedValue.no
          : Math.max(belief.expectedValue.yes, belief.expectedValue.no);
        amountWonValue = totalValue - actualUsdcInvestment;
      }

      const betData: BetData = {
        question: market?.question || belief.token,
        amountWon: `+$${amountWonValue.toFixed(2)}`, // Always positive for flex15
        betAmount: `$${totalBetAmount.toFixed(2)}`,
        side: winningSide,
        // Don't include belief for flex15 (ongoing positions)
        ...(flexType === "flex10" && {
          belief: `${winningSide === 'YES' ? 
            Math.round((yesTokens / (yesTokens + noTokens)) * 100) : 
            Math.round((noTokens / (yesTokens + noTokens)) * 100)}%`
        }),
        user: {
          name: dbUser?.username || "Anonymous",
          level: "88"
        },
        timestamp: "Bet Placed 11:22:00 UTC via @Simmi on X",
        marketId: belief.marketId,
        status: belief.status,
        marketImage: market?.imageSquare || market?.image || belief.tokenImage
      };

      // Create snapshot using server-side generation
      const result = await createFlexSnapshot(flexType, betData);
      
      // Get the OG image URL
      const imageUrl = `/api/og/flex?snapshotId=${result.snapshotId}`;
      setIsShareModalOpen(imageUrl);
    } catch (error) {
      console.error('Error creating bet snapshot:', error);
      setIsShareModalOpen(""); // Close modal on error
    }
  };

  return (
    <React.Fragment>
      <div
        className="bg-[#1A1B23] rounded-2xl text-white shadow-lg border border-[#FFFFFF08] backdrop-blur-sm relative overflow-hidden"
        key={idx}
      >
        {/* Full width image at the top */}
        <div className="p-6 pb-0">
          <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden">
            <Image
              src={belief.tokenImage}
              alt={belief.token}
              fill
              className="object-cover"
              onClick={() => router.push(`/market/${belief.marketId}`)}
              unoptimized
            />
            {/* Only show live indicator if market is not resolved */}
            {!belief.isResolved && (
              <div className="absolute top-4 left-4">
                <LiveIndicator />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="mb-4">
            <h3 
              className="text-white font-semibold text-base cursor-pointer hover:text-[#FFFFFFCC] transition-colors leading-5 line-clamp-2 overflow-hidden mb-2" 
              title={belief.token}
              onClick={() => router.push(`/market/${belief.marketId}`)}
            >
              {belief.token}
            </h3>
            {/* Show Finalized status for resolved markets */}
            {belief.isResolved ? (
              <div
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  color: belief.status === "Won" ? "#36FD68" : "#FD3748"
                }}
              >
                {belief.status === "Won" ? (
                  <ArrowUp width={20} height={20} color="#36FD68" />
                ) : (
                  <ArrowDown width={20} height={20} color="#FD3748" />
                )}
                <span>Finalized</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#DA8F05]">
                <OngoingIcon width={16} height={16} color="#DA8F05" />
                <span className="text-xs font-semibold">Ongoing</span>
              </div>
            )}
          </div>
          <div className="border-b border-[#FFFFFF29] mb-4"></div>

          {/* Position */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#FFFFFF80] text-xs font-medium">Position</span>
              <span 
                className="text-xs font-medium"
                title={belief.lpNftId ? `NFT ID: ${belief.lpNftId}` : undefined}
              >
                <span className="text-[#FFFFFFA3]">Type: </span>
                <span className={cn(
                  "capitalize",
                  belief.type === "liquidity" ? "text-[#05B9FC]" : "text-white"
                )}>
                  {belief.type}
                </span>
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#FD3748] text-sm font-semibold">{belief.noBet} {market?.noSideName || "No"}</span>
                <span className="text-[#FFFFFF] text-sm font-semibold">{formatBalance(belief.expectedValue.no)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#60d87e] text-sm font-semibold">{belief.yesBet} {market?.yesSideName || "Yes"}</span>
                <span className="text-[#FFFFFF] text-sm font-semibold">{formatBalance(belief.expectedValue.yes)}</span>
              </div>
            </div>
          </div>
          <div className="border-b border-[#FFFFFF29] mb-4"></div>

          {/* Investment Summary */}
          <div className="mb-4">
            <div className="text-[#FFFFFF80] text-xs mb-3 font-medium">Investments Summary</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#FFFFFFA3] text-xs font-semibold">Amount Invested</span>
                <span className="text-[#FFFFFF] text-sm font-semibold">{formatBalance(actualUsdcInvestment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#FFFFFFA3] text-xs font-semibold">PNL</span>
                <span className={cn(
                  "text-sm font-semibold",
                  (() => {
                    // For liquidity positions, use total value of both tokens
                    // For regular bets, use the maximum value (existing logic)
                    const totalValue = belief.type === "liquidity" 
                      ? belief.expectedValue.yes + belief.expectedValue.no
                      : Math.max(belief.expectedValue.yes, belief.expectedValue.no);
                    return (totalValue - actualUsdcInvestment) < 0 ? "text-[#FD3748]" : "text-[#60d87e]";
                  })()
                )}>
                  {(() => {
                    // For liquidity positions, use total value of both tokens
                    // For regular bets, use the maximum value (existing logic)
                    const totalValue = belief.type === "liquidity" 
                      ? belief.expectedValue.yes + belief.expectedValue.no
                      : Math.max(belief.expectedValue.yes, belief.expectedValue.no);
                    const pnl = totalValue - actualUsdcInvestment;
                    return pnl < 0 ? 
                      `-${formatBalance(Math.abs(pnl))}` : 
                      `+${formatBalance(pnl)}`;
                  })()}
                </span>
              </div>
            </div>
          </div>
          <div className="border-b border-[#FFFFFF29] mb-4"></div>

        {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-3">
          {!isPublic && (
              <>
                {belief.isResolved ? (
                  <button
                    className="flex-1 py-3 bg-white text-black hover:bg-[#FFFFFFCC] rounded-full transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim(belief.marketAddress);
                    }}
                    disabled={!belief.hasWinningPosition}
                  >
                    Claim
                  </button>
                ) : belief.type === "liquidity" ? (
                  <button
                    className="flex-1 py-3 border border-[#FFFFFF52] text-white hover:bg-[#FFFFFF10] rounded-full transition-colors text-xs font-medium whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLP(belief.marketId);
                    }}
                  >
                    Update LP
                  </button>
                ) : (
                  <button
                    className="flex-1 py-3 border border-[#FFFFFF52] text-white hover:bg-[#FFFFFF10] rounded-full transition-colors text-xs font-medium whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(belief.marketId);
                    }}
                  >
                    Update Belief
                  </button>
                )}
              </>
            )}

            <button
              className="flex-1 py-3 bg-transparent border border-[#FFFFFF52] text-white hover:bg-[#FFFFFF10] rounded-full transition-colors text-xs font-medium whitespace-nowrap"
              onClick={() => router.push(`/market/${belief.marketId}`)}
            >
              View Market
            </button>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between text-[#FFFFFF80] text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#FFFFFFA3] font-medium">
                {belief.currentMarketOdds.toFixed(0)}% Odds
              </span>
              <div className="w-px h-4 bg-[#FFFFFF29]"></div>
              <div className="flex items-center gap-1" style={{ "--icon-stroke": "#FFFFFFA3" } as React.CSSProperties}>
                <ClockIcon className="w-3 h-3 text-[#FFFFFFA3]" />
                <span className="text-[#FFFFFFA3]">
                  {belief.marketDate 
                    ? new Date(belief.marketDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'TBD'
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`hover:text-white transition-colors ${
                  isInWatchlist ? "text-white" : "text-[#FFFFFF52]"
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
                  className={`w-4 h-4 ${isInWatchlist ? "fill-current" : ""}`}
                />
              </button>
          {belief.type !== "liquidity" ? (
            <CircleFlexLottieButton
              onClick={handleShareBet}
            />
          ) : (
            <div className="w-[27px]" />
          )}
            </div>
          </div>
        </div>
      </div>
      {isShareModalOpen && (
        <FlexModal
          isLoading={isShareModalOpen === "loading"}
          image={isShareModalOpen}
          type={currentFlexType}
          onClose={() => setIsShareModalOpen("")}
        />
      )}
    </React.Fragment>
  );
};

export default MobileBeliefCard;
