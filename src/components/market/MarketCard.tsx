import Image from "next/image";
import { StarIcon } from "lucide-react";
import Link from "next/link";
// import { useReadContract } from "wagmi";
import { cn, formatVolume } from "@/lib/utils";
import { IMarketData } from "@/interfaces/market";
// import { arbitrum } from "viem/chains";
// import marketBase from "@/abis/ConditionalTokenMarketBase.json";
import { useMarketWatchlist } from "@/hooks/useMarketWatchlist";
import { useRouter } from "next/navigation";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import React, { useState, useMemo } from "react";
import ShareIcon from "../shared/share-icon";
import ClockIcon from "../shared/clock-icon";
import { useUserLiquidityPositions } from "@/hooks/useUserLiquidityPositions";
import useMarketTokens from "@/hooks/useMarketTokens";
import { formatTokenAmount } from "@/utils/format";
import { useMarketProbabilityFromPool } from "@/hooks/useMarket";
import { useAuthContext } from "@/context/AuthProvider";
import useHeaderModal from "@/hooks/use-header-modal";

export function MarketCard({ 
  market, 
  lastPriceData,
  marketData,
  batchMarketsError,
  batchLastPricesError
}: { 
  market: IMarketData;
  lastPriceData?: { price: number; timestamp: Date } | null;
  marketData?: { market: IMarketData } | null;
  batchMarketsError?: Error | null;
  batchLastPricesError?: Error | null;
}) {
  // const marketBaseAbi = marketBase.abi;
  const router = useRouter();
  const [share, setShare] = useState("");
  const { isAuthenticated } = useAuthContext();
  const { setAuthModal } = useHeaderModal();

  const getDisplayType = () => {
    if (market.isResolved) {
      // Check for tie first
      if (market.resolvedOption === "Tie" || market.isTie) {
        return "tie";
      }
      
      // Check if resolved option matches YES side (handles both "Yes" and custom names like "Chiefs")
      if (
        market.resolvedOption === "Yes" || 
        market.resolvedOption === "YES" ||
        market.resolvedOption === market.yesSideName
      ) {
        return "yes-won";
      }
      
      // Check if resolved option matches NO side (handles both "No" and custom names like "Cowboys")
      if (
        market.resolvedOption === "No" || 
        market.resolvedOption === "NO" ||
        market.resolvedOption === market.noSideName
      ) {
        return "no-won";
      }
    }
    return "buy";
  };

  const type = getDisplayType();

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useMarketWatchlist(market.id);

  // Handle watchlist toggle with auth check
  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Star clicked - isAuthenticated:", isAuthenticated);
    if (!isAuthenticated) {
      console.log("Opening signup modal");
      setAuthModal("main_signup");
      return;
    }
    console.log("User authenticated, toggling watchlist");
    toggleWatchlist();
  };

  // Use the same logic as trading panel - read token balances directly from blockchain
  const { tokenABalance, tokenBBalance } = useMarketTokens(market.contractAddress as `0x${string}`);
  const formattedTokenABalance = formatTokenAmount(tokenABalance, 18);
  const formattedTokenBBalance = formatTokenAmount(tokenBBalance, 18);
  
  // Same logic as trading panel
  const tokenABalanceNum = parseFloat(formattedTokenABalance) || 0;
  const tokenBBalanceNum = parseFloat(formattedTokenBBalance) || 0;
  const hasUserPosition = tokenABalanceNum > 0 || tokenBBalanceNum > 0;

  // Memoize button styles to prevent unnecessary recalculations
  const buttonStyles = useMemo(() => {
    const isYesPosition = tokenBBalanceNum > 0;
    return {
      backgroundColor: isYesPosition ? "#46FD8452" : "#FD465C52",
      textColor: isYesPosition ? "#33E06E" : "#D32B3F",
      spanBackgroundColor: isYesPosition ? "#33E06E" : "#D32B3F",
      buttonText: isYesPosition ? `Bought ${market.yesSideName || "Yes"}` : `Bought ${market.noSideName || "No"}`
    };
  }, [tokenBBalanceNum, market.yesSideName, market.noSideName]);
  
  // Keep LP position logic from database
  const { data: userLiquidityPositions } = useUserLiquidityPositions();
  const userLPPosition = userLiquidityPositions?.find(position => position.marketId === market.id);
  const hasLPPosition = userLPPosition && !userLPPosition.isBurnt;


  // Get real-time market probabilities from pool
  const { data: marketProbability, isLoading: isProbabilityLoading } = useMarketProbabilityFromPool(
    market.id,
    false, // market.id is not a contract address
    lastPriceData,
    marketData,
    batchMarketsError,
    batchLastPricesError
  );

  // Use real-time probabilities if available, otherwise fall back to stored percentages
  const yesPercentage = (marketProbability as { yes?: number; no?: number })?.yes ?? market.yesPercentage ?? 50;
  const noPercentage = (marketProbability as { yes?: number; no?: number })?.no ?? market.noPercentage ?? 50;
  const isOddsLoading = isProbabilityLoading;
  
  return (
    <React.Fragment>
      <div
        className="bg-[#16171E] rounded-2xl overflow-hidden w-full relative pointer flex flex-col h-full"
        onClick={() => router.push(`/market/${market.contractAddress}`)}
      >
        {/* Main content container with consistent spacing */}
        <div className="flex flex-col h-full gap-3 p-4">
          {/* Full width image at the top */}
          <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden">
            <Image
              src={market.image || "/images/football.png"}
              alt={market.name || market.question}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          
          {/* Title section */}
          <h3 className="font-geist font-bold text-sm leading-[140%] tracking-[-0.02em] line-clamp-3">
            <Link href={`/market/${market.contractAddress}`}>
              {market.question}
            </Link>
          </h3>
          
          {/* Spacer to push content to bottom */}
          <div className="flex-grow"></div>
          
          {/* Content section - aligned to bottom */}
          <div className="flex flex-col gap-3">
            {/* Horizontal Progress Bar - only show when not resolved */}
            {type === "buy" && (
              <div className="relative z-20">
              {/* Progress Bar Container with inline text */}
              <div className="flex items-center justify-between text-xs font-regular text-[#FFFFFFA3]">
                <span>{isOddsLoading ? "..." : `${Math.round(noPercentage)}%`} {market.noSideName?.slice(0,3).toUpperCase()}</span>
                
                <div className="bg-[#2E3144] border border-[#4F5262] rounded-full p-1 flex gap-1 flex-1 mx-2 items-center">
                  {/* No Progress Bar */}
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isOddsLoading ? 'bg-[#4F5262] animate-pulse' : 'bg-[#ef4444]'
                    }`}
                    style={{ 
                      width: `${isOddsLoading ? 50 : noPercentage}%`
                    }}
                  />
                  {/* Yes Progress Bar */}
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isOddsLoading ? 'bg-[#4F5262] animate-pulse' : 'bg-[#22c55e]'
                    }`}
                    style={{ 
                      width: `${isOddsLoading ? 50 : yesPercentage}%`
                    }}
                  />
                </div>
                
                <span>{isOddsLoading ? "..." : `${Math.round(yesPercentage)}%`} {market.yesSideName?.slice(0,3).toUpperCase()}</span>
              </div>
            </div>
            )}

          {/* Buttons section with consistent spacing */}
          <div className="relative z-10">
            {/* Show LP position button when user has LP position AND market is not resolved */}
            {hasLPPosition && type === "buy" && (
              <div className="w-full">
                {/* Div for shadow - blue gradient */}
                <div
                  className="w-[366px] h-[366px] blur-[80px] absolute top-[80%] opacity-80 -z-10"
                  style={{
                    background: "linear-gradient(#05B9FC 32%, black 0%)",
                  }}
                />

                <button
                  className="w-full gap-1 py-2 rounded-[80px] text-black flex relative z-10 items-center justify-center font-geist font-semibold text-xs leading-[140%] tracking-[-0.02em] border-0 outline-none bg-[#05B9FC52] text-[#05B9FC] hover:bg-[#05B9FC52] focus:bg-[#05B9FC52] active:bg-[#05B9FC52]"
                  style={{
                    backgroundColor: "#05B9FC52",
                    color: "#05B9FC"
                  }}
                >
                  Providing LP{" "}
                  <span
                    className={cn(
                      "rounded-[80px] py-1 px-2 text-black border-0 outline-none",
                      isOddsLoading
                        ? "bg-[#4F5262] animate-pulse hover:bg-[#4F5262] focus:bg-[#4F5262] active:bg-[#4F5262]"
                        : "bg-[#05B9FC] hover:bg-[#05B9FC] focus:bg-[#05B9FC] active:bg-[#05B9FC]"
                    )}
                    style={{
                      backgroundColor: isOddsLoading ? "#4F5262" : "#05B9FC"
                    }}
                  >
                    {isOddsLoading ? "..." : Math.round(yesPercentage)}%
                  </span>
                </button>
              </div>
            )}

            {/* Show Bought button when user has placed a bet AND market is not resolved AND no LP position */}
            {hasUserPosition && type === "buy" && !hasLPPosition && (
              <div className="w-full">
                {/* Div for shadow */}
                <div
                  className="w-[366px] h-[366px] blur-[80px] absolute top-[80%] opacity-80 -z-10"
                  style={{
                    background: `linear-gradient(${
                      tokenBBalanceNum > 0
                        ? "#33E06E"
                        : "#D32B3F"
                    } 32%, black 0%)`,
                  }}
                />

                <button
                  className={cn(
                    "w-full gap-1 py-2 rounded-[80px] text-black flex relative z-10 items-center justify-center font-geist font-semibold text-xs leading-[140%] tracking-[-0.02em] border-0 outline-none",
                    tokenBBalanceNum > 0
                      ? "bg-[#46FD8452] text-[#33E06E] hover:bg-[#46FD8452] focus:bg-[#46FD8452] active:bg-[#46FD8452]"
                      : "bg-[#FD465C52] text-[#D32B3F] hover:bg-[#FD465C52] focus:bg-[#FD465C52] active:bg-[#FD465C52]"
                  )}
                  style={{
                    backgroundColor: buttonStyles.backgroundColor,
                    color: buttonStyles.textColor
                  }}
                >
                  {buttonStyles.buttonText}{" "}
                  <span
                    className={cn(
                      "rounded-[80px] py-1 px-2 text-black border-0 outline-none",
                      isOddsLoading
                        ? "bg-[#4F5262] animate-pulse hover:bg-[#4F5262] focus:bg-[#4F5262] active:bg-[#4F5262]"
                        : tokenBBalanceNum > 0
                        ? "bg-[#33E06E] hover:bg-[#33E06E] focus:bg-[#33E06E] active:bg-[#33E06E]"
                        : "bg-[#D32B3F] hover:bg-[#D32B3F] focus:bg-[#D32B3F] active:bg-[#D32B3F]"
                    )}
                    style={{
                      backgroundColor: isOddsLoading ? "#4F5262" : buttonStyles.spanBackgroundColor
                    }}
                  >
                    {isOddsLoading
                      ? "..."
                      : tokenBBalanceNum > 0
                      ? Math.round(yesPercentage)
                      : Math.round(noPercentage)}
                    %
                  </span>
                </button>
              </div>
            )}

            {/* Show Buy buttons when market is open AND user hasn't placed a bet AND no LP position */}
            {type === "buy" && !hasUserPosition && !hasLPPosition && (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/market/${market.contractAddress}/?option=no`}
                className="gap-1 bg-[#FD465C] rounded-[80px] text-black py-2 flex items-center justify-center font-geist font-semibold text-xs leading-[140%] tracking-[-0.02em] border-0 outline-none hover:bg-[#FD465C] focus:bg-[#FD465C] active:bg-[#FD465C]"
                style={{ 
                  backgroundColor: "#FD465C"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Buy {market.noSideName || "No"}{" "}
                <span className={`rounded-[80px] py-1 px-2 border-0 outline-none hover:bg-[#D32B3F] focus:bg-[#D32B3F] active:bg-[#D32B3F] ${
                  isOddsLoading ? 'bg-[#4F5262] animate-pulse' : 'bg-[#D32B3F]'
                }`} style={{ backgroundColor: isOddsLoading ? "#4F5262" : "#D32B3F" }}>
                  {isOddsLoading
                    ? "..."
                    : Math.round(noPercentage)}
                  %
                </span>
              </Link>

              <Link
                href={`/market/${market.contractAddress}/?option=yes`}
                className="gap-1 bg-[#46FD84] py-2 rounded-[80px] text-black flex items-center justify-center font-geist font-semibold text-xs leading-[140%] tracking-[-0.02em] border-0 outline-none hover:bg-[#46FD84] focus:bg-[#46FD84] active:bg-[#46FD84]"
                style={{ 
                  backgroundColor: "#46FD84"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Buy {market.yesSideName || "Yes"}{" "}
                <span className={`rounded-[80px] py-1 px-2 border-0 outline-none hover:bg-[#33E06E] focus:bg-[#33E06E] active:bg-[#33E06E] ${
                  isOddsLoading ? 'bg-[#4F5262] animate-pulse' : 'bg-[#33E06E]'
                }`} style={{ backgroundColor: isOddsLoading ? "#4F5262" : "#33E06E" }}>
                  {isOddsLoading
                    ? "..."
                    : Math.round(yesPercentage)}
                  %
                </span>
              </Link>
            </div>
          )}

            {/* Show resolved market button */}
            {(type === "yes-won" || type === "no-won" || type === "tie") && (
              <div className="flex flex-col items-center gap-3">
                {/* Finalized text */}
                <div className="text-[#FFFFFFA3] text-sm font-medium">
                  Finalized
                </div>
                
                {/* Winner button or tie button */}
                <button
                  className={cn(
                    "w-full py-2 rounded-[80px] flex items-center justify-center font-geist font-semibold text-sm leading-[140%] tracking-[-0.02em]",
                    type === "yes-won"
                      ? "bg-[#22c55e] text-[#070708]"
                      : type === "no-won"
                      ? "bg-[#ef4444] text-[#070708]"
                      : "bg-[#20212E] text-[#070708]"  // Tie with custom background
                  )}
                  style={{
                    opacity: type === "tie" ? 1 : 0.32  // Full opacity for tie
                  }}
                >
                  {type === "yes-won" 
                    ? `${market.yesSideName || "Yes"} Won` 
                    : type === "no-won"
                    ? `${market.noSideName || "No"} Won`
                    : "Tie"}
                </button>
              </div>
            )}
            </div>
            
            {/* Bottom section with volume/bets and icons */}
            <div className="flex items-center justify-between relative z-20">
          <div className="text-[#FFFFFFA3] text-xs flex items-center gap-1">
            ${formatVolume(market.volume)} Vol  &nbsp;&nbsp;|&nbsp;&nbsp;  {/* {market.totalBets || 0} Bets */}
            <div className="flex items-center gap-1" style={{ "--icon-stroke": "#FFFFFFA3" } as React.CSSProperties}>
              <ClockIcon className="w-3.5 h-3.5" />
              {market.date ? (
                new Date(market.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric', 
                  year: 'numeric'
                })
              ) : (
                "???"
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 relative z-20">
          <button
            className={`hover:text-white transition-colors text-[#FFFFFFA3] relative z-20 ${
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
            <StarIcon
              className={`w-4 h-4 ${isInWatchlist ? "fill-current" : ""}`}
            />
          </button>

          <button
            className="hover:text-white transition-colors text-[#FFFFFFA3] relative z-20"
            title="Share"
            onClick={(e) => {
              e.stopPropagation();
              setShare(
                `${process.env.NEXT_PUBLIC_APP_URL}/market/${market.contractAddress}`
              );
            }}
            style={{ "--icon-stroke": "#FFFFFFA3" } as React.CSSProperties}
          >
            <ShareIcon width="16" height="16" />
          </button>
          </div>
          </div>
          </div>
        </div>
      </div>
      {share && (
        <ShareModal
          onClose={() => setShare("")}
          url={share}
          marketName={market.name}
          marketImage={market.image}
          marketQuestion={market.question}
          tweetUrl={`Check out this prediction market on Simmi!\n\n${process.env.NEXT_PUBLIC_APP_URL}/market/${market.contractAddress}`}
        />
      )}
    </React.Fragment>
  );
}
