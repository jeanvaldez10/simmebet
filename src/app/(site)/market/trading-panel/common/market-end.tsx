import Image from "next/image";
import React, { useState } from "react";
import { MarketResult } from "../context/TradingPanelContext";
import HorizontalLine from "@/components/common/HorizontalLine";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import ShareIcon from "@/components/shared/share-icon";
import { useAuthContext } from "@/context/AuthProvider";
import { betsService } from "@/services/api";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { IMarketData } from "@/interfaces/market";
import useMarketTokens from "@/hooks/useMarketTokens";
import { formatTokenAmount } from "@/utils/format";
import ClaimWinnings from "../modal/claim-winnings";
import { CustomTooltip } from "@/components/shared/custom-tooltip";
import { useBalanceCheck } from "@/hooks/useBalanceCheck";
import { BalanceTooLowModal } from "@/components/modals/BalanceTooLowModal";

const MarketEnd = ({
  // marketResult,
  market,
}: {
  marketResult: MarketResult;
  market: IMarketData;
}) => {
  const { contractAddress: marketAddress } = market;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);
  const { dbUser } = useAuthContext();
  const queryClient = useQueryClient();
  const { checkBalanceForAction } = useBalanceCheck();

  // tokenA = NO, tokenB = YES
  const { tokenABalance, tokenBBalance, refreshBalances } = useMarketTokens(
    marketAddress as `0x${string}`
  );
  // Handle both hardcoded "Yes"/"No" and custom side names
  const winningSide = (market.resolvedOption === "Yes" || market.resolvedOption === market.yesSideName) ? "yes" : "no";
  const hasWinningBalance = winningSide === "yes" ? (tokenBBalance ?? 0n) > 0n : (tokenABalance ?? 0n) > 0n;

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleClaimWinnings = () => {
    if (!dbUser?.id || !marketAddress) {
      toast.error("Unable to claim winnings. Please try again.");
      return;
    }
    
    // PLATFORM_FEE_TODO: Check if user has sufficient balance for platform fees
    const { canProceed } = checkBalanceForAction('CLAIM_WINNINGS');
    if (!canProceed) {
      setShowBalanceTooLowModal(true);
      return;
    }
    
    setIsClaimModalOpen(true);
  };

  const handleConfirmClaim = async (): Promise<{ claimedAmount?: string; amountOut?: string }> => {
    if (!dbUser?.id || !marketAddress) {
      toast.error("Unable to claim winnings. Please try again.");
      throw new Error("Unable to claim winnings. Please try again.");
    }

    try {
      const response = await betsService.claimWinnings(dbUser.id, marketAddress, {
        idempotencyKey: uuidv4(),
      });
      
      if (response.success) {
        // Refresh token balances and USDC balance
        queryClient.invalidateQueries({ queryKey: ["usdcBalance"] });
        queryClient.invalidateQueries({ queryKey: ["marketBalances"] });
        queryClient.invalidateQueries({ queryKey: ["allMarketBalances"] });
        queryClient.invalidateQueries({ queryKey: ["positionBelief"] });
        await refreshBalances();
        
        // Return the response data for the modal to use
        return {
          claimedAmount: response.claimedAmount?.toString(),
          amountOut: response.amountOut?.toString()
        };
      } else {
        throw new Error(response.message || "Failed to claim winnings");
      }
    } catch (error) {
      console.error("Error claiming winnings:", error);
      throw error; // Re-throw to be handled by the modal
    }
  };

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/market/${market.contractAddress}`;
  const winningSideBalance = winningSide === "yes" ? tokenBBalance : tokenABalance;

  return (
    <React.Fragment>
      <div>
        <h2 className="text-[#F2F2FD] font-semibold text-sl">Market Ended</h2>
        <p className="text-[#FFFFFFA3] text-sm font-semibold mb-4">
          Ended on {market.resolvedTime ? new Date(market.resolvedTime).toLocaleDateString() : "N/A"}
        </p>

        <HorizontalLine />
      </div>

       <div className="mx-auto flex flex-col items-center justify-center my-4 gap-2">
         <div className="text-2xl cursor-select">
           <Image
             src={
               (winningSide === "yes" ? market?.yesSideIcon : market?.noSideIcon) || `/images/end-${winningSide}.svg`
             }
             alt={
                 (winningSide === "yes" ? market?.yesSideName : market?.noSideName) || "..."
             }
             width={100}
             height={100}
             className={`rounded-[16px] border-2 bg-transparent ${
               winningSide === "yes" 
                 ? "border-[#36FD68]" 
                 : "border-[#FF4D4D]"
             }`}
           />
         </div>
         <p className="text-white font-semibold">Winner</p>
       </div>

      <div className="flex gap-2 my-4">
        <button
          className={`flex-1 py-3 rounded-lg font-semibold ${
            winningSide === "no"
              ? "bg-[#FF4D4D] text-black"
              : "border border-[#FFFFFF29] text-[#FFFFFFA3] bg-transparent"
          }`}
        >
          {market?.noSideName || "No"}
        </button>
        <button
          className={`flex-1 py-3 rounded-lg font-semibold ${
            winningSide === "yes"
              ? "bg-[#36FD68] text-black"
              : "border border-[#FFFFFF29] text-[#FFFFFFA3] bg-transparent"
          }`}
        >
          {market?.yesSideName || "Yes"}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-[#FFFFFFA3] text-sm font-semibold">Bet</span>
          <span className="text-[#FFFFFF] text-sm font-semibold">
            {`$${formatTokenAmount(winningSideBalance || 0n)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#FFFFFFA3] text-sm font-semibold">
            Profit/Loss
          </span>
          <CustomTooltip
            className="max-w-[320px] w-fit text-xs"
            align="end"
            name={
              <div className="space-y-2">
                <p className="font-semibold text-white">Settlement & Claim Fees</p>
                <p className="text-[#FFFFFFA3]">
                  After the market&apos;s oracle has reported the final outcome, the market is settled. At this stage, only the tokens corresponding to the winning outcome hold value.
                </p>
                <p className="text-[#FFFFFFA3]">
                  There is a 2% fee charged for claiming winnings, any swap fees from prior trades still apply.
                </p>
              </div>
            }
          >
            <span
              className="text-[#36FD68] text-sm font-semibold cursor-help underline decoration-[#36FD68] underline-offset-2"
            >
              {winningSideBalance ? `+$${formatTokenAmount(winningSideBalance * 2n || 0n)}` : "$0.0"}
            </span>
          </CustomTooltip>
        </div>
      </div>

      {hasWinningBalance && (
        <button
          onClick={handleClaimWinnings}
          className="w-full bg-white text-black font-medium rounded-full py-3 mt-4 cursor-pointer"
        >
          Claim
        </button>
      )}

      <button
        className="w-full cursor-pointer border border-[#FFFFFF52] text-white rounded-full py-3  flex items-center justify-center gap-2"
        onClick={handleShare}
        style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}
      >
        <span>Share</span>
        <ShareIcon width="16" height="16" />
      </button>
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

      {isClaimModalOpen && (
        <ClaimWinnings
          onClose={() => setIsClaimModalOpen(false)}
          imageSrc={winningSide === "yes" ? market?.yesSideIcon || "/images/cup.png" : market?.noSideIcon || "/images/cup.png"}
          name={winningSide === "yes" ? market?.yesSideName || "Yes" : market?.noSideName || "No"}
          winningsAmount={`$${formatTokenAmount((winningSideBalance || 0n) * 2n)}`}
          onConfirm={handleConfirmClaim}
        />
      )}
      
      {/* Balance Too Low Modal */}
      <BalanceTooLowModal
        isOpen={showBalanceTooLowModal}
        onClose={() => setShowBalanceTooLowModal(false)}
        onDeposit={() => {
          // TODO: Open deposit modal
          setShowBalanceTooLowModal(false);
        }}
      />
    </React.Fragment>
  );
};

export default MarketEnd;
