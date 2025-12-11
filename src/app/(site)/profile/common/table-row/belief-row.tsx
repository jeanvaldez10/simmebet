import { IPositionBelief } from "@/hooks/use-position-belief";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import FlexModal from "../modal/flex-modal";
import CircleFlexLottieButton from "@/components/flex-cards/circle-flex-button";
import { useMarkets } from "@/hooks/useMarkets";
import { useAuthContext } from "@/context/AuthProvider";
import { createFlexSnapshot, BetData } from "@/utils/flexSnapshot";
import LiveIndicator from "@/app/(site)/options/common/live-badge";
import ArrowUp from "@/components/icons/ArrowUp";
import ArrowDown from "@/components/icons/ArrowDown";
import OngoingIcon from "@/components/icons/OngoingIcon";
import { formatBalance } from "@/utils/format";
import { useMarketUsdcInvestment } from "@/hooks/useMarketUsdcInvestment";

export const getStatusIcon = (status: string) => {
  if (status === "Ongoing" || status === "ACTIVE") {
    return "/ongoing.png";
  } else if (
    status === "Won" ||
    status === "resolved" ||
    status === "RESOLVED"
  ) {
    return "/won.png";
  } else {
    return "/loss.png";
  }
};

const BeliefRow = (
  headers: IPositionBelief & {
    onClaim: (marketAddress?: string) => void;
    onUpdate: (e: string) => void;
    onUpdateLP: (e: string) => void;
    isPublic: boolean;
    marketAddress?: string;
    marketId: string;
  }
) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState("");
  const [currentFlexType, setCurrentFlexType] = useState<"flex10" | "flex15">("flex10");
  const { dbUser } = useAuthContext();
  const { data: markets } = useMarkets();
  const router = useRouter();

  const {
    marketId,
    tokenImage,
    token,
    expectedValue,
    profit,
    currentMarketOdds,
    status,
    yesBet,
    noBet,
    onClaim,
    onUpdate,
    onUpdateLP,
    isPublic,
    marketAddress,
    type,
  } = headers;
  
  // Get the actual USDC investment for this market (same as markets screen)
  const { data: usdcInvestment } = useMarketUsdcInvestment(marketId);
  const actualUsdcInvestment = Number(usdcInvestment) || 0;

  // Find the market data to get the question
  const market = markets?.find(m => m.id === marketId);

  const handleShareBet = async () => {
    setIsShareModalOpen("loading");
    
    try {
      // Calculate bet data for the flex card
      const yesTokens = Number(yesBet) || 0;
      const noTokens = Number(noBet) || 0;
      const winningSide = yesTokens > noTokens ? 'YES' : 'NO';
      
      // Use actual USDC invested (not token calculation)
      const totalBetAmount = actualUsdcInvestment;
      
      // Determine if position is ongoing or completed
      const isOngoing = status === "Ongoing";
      const flexType = isOngoing ? "flex15" : "flex10";
      setCurrentFlexType(flexType);
      
      // For ongoing positions (flex15): use current value (expected value)
      // For completed positions (flex10): show profit/loss
      let amountWonValue: number;
      if (isOngoing) {
        // Current value = expected value (what they'd get if they cashed out now)
        const totalValue = type === "liquidity" 
          ? expectedValue.yes + expectedValue.no
          : Math.max(expectedValue.yes, expectedValue.no);
        amountWonValue = totalValue; // Always positive - shows current value
      } else {
        // Completed: show actual profit/loss
        const totalValue = type === "liquidity" 
          ? expectedValue.yes + expectedValue.no
          : Math.max(expectedValue.yes, expectedValue.no);
        amountWonValue = totalValue - Math.abs(Number(profit));
      }

      const betData: BetData = {
        question: market?.question || token,
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
        marketId: marketId,
        status: status,
        marketImage: market?.imageSquare || market?.image || tokenImage
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
    <div className="grid grid-cols-[350px_80px_1fr_100px_100px_100px_120px_220px] items-center p-4 bg-[#16171E52] border border-[#FFFFFF29] rounded-xl backdrop-blur-sm hover:bg-[#16171E70] transition-all duration-200">
      {/* Market & Token Info */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 hover:opacity-80 transition-opacity"
          onClick={() => router.push(`/market/${marketId}`)}
          style={{ cursor: 'pointer' }}
        >
          <Image
            src={market?.imageSquare || market?.image || tokenImage}
            alt={token}
            width={48}
            height={48}
            className="object-cover w-full h-full"
            style={{ cursor: 'pointer' }}
            unoptimized
          />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 
              className="font-semibold text-base text-white truncate"
              title={token}
            >
              {token}
            </h3>
            {/* Only show live indicator if market is not resolved */}
            {!headers.isResolved && <LiveIndicator />}
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="flex items-center justify-center">
        <span 
          className={cn(
            "text-sm font-medium capitalize",
            type === "liquidity" ? "text-[#05B9FC]" : "text-white"
          )} 
        >
          {type}
        </span>
      </div>

      {/* Position */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-6">
          {/* No Column - Total holdings (wallet + LP) */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-[#FFFFFF80] mb-1">{market?.noSideName || "No"}</div>
            <div className="text-[#FD3748] text-sm font-semibold mb-1">{noBet}</div>
            <div className="text-[#FFFFFF80] text-xs">{formatBalance(expectedValue.no)}</div>
          </div>
          
          {/* Yes Column - Total holdings (wallet + LP) */}
          <div className="flex flex-col items-center">
            <div className="text-xs text-[#FFFFFF80] mb-1">{market?.yesSideName || "Yes"}</div>
            <div className="text-[#60d87e] text-sm font-semibold mb-1">{yesBet}</div>
            <div className="text-[#FFFFFF80] text-xs">{formatBalance(expectedValue.yes)}</div>
          </div>
        </div>
        
      </div>
      
      {/* Odds */}
      <div className="flex items-center justify-center">
        <div className={cn(
          "text-sm font-semibold",
          currentMarketOdds >= 50 ? "text-[#60d87e]" : "text-[#FD3748]"
        )}>
          {currentMarketOdds < 50 ? `${(100 - currentMarketOdds).toFixed(0)}% ${market?.noSideName?.slice(0, 8)}` : `${currentMarketOdds.toFixed(0)}% ${market?.yesSideName?.slice(0, 8)}`}
        </div>
      </div>
      
      {/* Investment */}
      <div className="flex items-center justify-center">
        <div className="text-sm font-bold text-white">
          {formatBalance(actualUsdcInvestment)}
        </div>
      </div>
      
      {/* P&L */}
      <div className="flex items-center justify-center">
        <div className={cn(
          "text-sm font-bold",
          (() => {
            // For liquidity positions, use total value of both tokens
            // For regular bets, use the maximum value (existing logic)
            const totalValue = type === "liquidity" 
              ? expectedValue.yes + expectedValue.no
              : Math.max(expectedValue.yes, expectedValue.no);
            return (totalValue - actualUsdcInvestment) < 0 ? "text-[#FD3748]" : "text-[#60d87e]";
          })()
        )}>
          {(() => {
            // For liquidity positions, use total value of both tokens
            // For regular bets, use the maximum value (existing logic)
            const totalValue = type === "liquidity" 
              ? expectedValue.yes + expectedValue.no
              : Math.max(expectedValue.yes, expectedValue.no);
            const pnl = totalValue - actualUsdcInvestment;
            return pnl < 0 ? 
              `-${formatBalance(Math.abs(pnl))}` : 
              `+${formatBalance(pnl)}`;
          })()}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center">
        {headers.isResolved ? (
          <div
            className="flex items-center gap-1.5"
            style={{
              color: status === "Won" ? "#36FD68" : "#FD3748"
            }}
          >
            {/* Up or down arrow based on profit */}
            {status === "Won" ? (
              <ArrowUp width={20} height={20} color="#36FD68" />
            ) : (
              <ArrowDown width={20} height={20} color="#FD3748" />
            )}
            <span className="text-xs font-semibold">Finalized</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#DA8F05]">
            <OngoingIcon width={16} height={16} color="#DA8F05" />
            <span className="text-xs font-semibold capitalize">{status}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        {!isPublic && (
          <>
            {headers.isResolved ? (
              <button
                className="w-[110px] px-4 py-1.5 bg-white hover:bg-gray-100 text-black font-medium rounded-full transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                onClick={() => onClaim(marketAddress)}
                disabled={!headers.hasWinningPosition}
              >
                Claim
              </button>
            ) : type === "liquidity" ? (
              <button
                className="w-[110px] px-4 py-1.5 border border-[#FFFFFF52] text-white hover:bg-[#FFFFFF10] rounded-full transition-colors text-xs whitespace-nowrap"
                onClick={() => onUpdateLP(marketId)}
              >
                Update LP
              </button>
            ) : (
              <button
                className="w-[110px] px-4 py-1.5 border border-[#FFFFFF52] text-white hover:bg-[#FFFFFF10] rounded-full transition-colors text-xs whitespace-nowrap"
                onClick={() => onUpdate(marketId)}
              >
                Update Belief
              </button>
            )}
          </>
        )}

        <button
          className="w-[70px] px-3 py-1.5 border border-[#FFFFFF52] text-white hover:bg-[#FFFFFF10] rounded-full transition-colors text-xs whitespace-nowrap"
          onClick={() => router.push(`/market/${marketId}`)}
        >
          View
        </button>

        {type !== "liquidity" ? (
          <CircleFlexLottieButton
            onClick={handleShareBet}
          />
        ) : (
          <div className="w-[27px]" />
        )}
      </div>

      {isShareModalOpen && (
        <FlexModal
          isLoading={isShareModalOpen === "loading"}
          type={currentFlexType}
          image={isShareModalOpen}
          onClose={() => setIsShareModalOpen("")}
        />
      )}
    </div>
  );
};

export default BeliefRow;
