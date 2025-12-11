import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import CommonModal from "@/components/modals";
import SuccessModal from "@/app/(site)/options/common/success-modal";
import Button from "@/components/Button";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateMarketCaches } from "@/utils/liquidityCacheUtils";
import { RangeOption } from "../common/bookie";
import { IMarketData } from "@/interfaces/market";
import { useBalanceCheck } from "@/hooks/useBalanceCheck";
import { BalanceTooLowModal } from "@/components/modals/BalanceTooLowModal";

const PENDING_MESSAGES = {
  TITLE: "Transaction Pending",
  SUBTITLE: "Please wait while your transaction is being processed...",
  BUTTON_TEXT: "Processing...",
};

interface AddLiquidityModalProps {
  onClose: () => void;
  marketId: string;
  marketAddress: string;
  userId?: string;
  odds: number;
  selectRange: RangeOption;
  liquidityAmount: number;
  market: IMarketData;
  onSuccess?: () => void;
}

export const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({
  onClose,
  marketId,
  marketAddress,
  userId,
  odds,
  selectRange,
  liquidityAmount,
  market,
  onSuccess,
}) => {
  const [modalState, setModalState] = useState<"none" | "pending" | "success" | "error">("none");
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { checkBalanceForAction } = useBalanceCheck();
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);

  const getRangeDisplay = (odds: number) => {
    if (selectRange === "single") return `${odds}%`;
    const range = selectRange === "3" ? 3 : 5;
    return `${Math.max(0, odds - range).toFixed(2)}% - ${Math.min(100, odds + range).toFixed(2)}%`;
  };

  const handleConfirm = async () => {
    try {
      // PLATFORM_FEE_TODO: Check if user has sufficient balance for platform fees
      const { canProceed } = checkBalanceForAction('ADD_LIQUIDITY');
      if (!canProceed) {
        setShowBalanceTooLowModal(true);
        return;
      }
      
      setIsLoading(true);
      setModalState("pending");

      const response = await fetch(`/api/liquidity/update-liquidity/${marketId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          odds: Number(yesOdds),
          selectRange,
          liquidityAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add liquidity");
      }

      if (data.txHash) {
        setTxHash(data.txHash);
      }

      // Show success immediately
      setModalState("success");

      // Invalidate caches in the background (non-blocking)
      // Wait a bit for backend to complete database operations, then refresh
      setTimeout(async () => {
        await invalidateMarketCaches(queryClient, marketId, userId, marketAddress);
        queryClient.invalidateQueries({ queryKey: ["userActivities"] });
        queryClient.invalidateQueries({ queryKey: ["activities", userId] });
      }, 500);
    } catch (error) {
      console.error("Error adding liquidity:", error);
      setModalState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = async () => {
    // Invalidate one more time on close to ensure fresh data
    await invalidateMarketCaches(queryClient, marketId, userId, marketAddress);
    queryClient.invalidateQueries({ queryKey: ["liquidityPositions"] });
    queryClient.invalidateQueries({ queryKey: ["market"] });
    queryClient.invalidateQueries({ queryKey: ["userActivities"] });
    queryClient.invalidateQueries({ queryKey: ["activities", userId] });
    
    // Call onSuccess callback to reset amount when closing after success
    if (onSuccess) {
      onSuccess();
    }
    
    setModalState("none");
    onClose();
  };

  const yesOdds = (100 - odds).toFixed(2);

  return (
    <CommonModal onClose={modalState === "pending" ? () => {} : onClose} className="w-[364px]">
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Liquidity Added"
          subtitle={`Liquidity added to:\n${market.question}`}
          isPositive={true}
          buttonText="Done"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        >
          <div className="w-full">
            <h2 className="text-[#F2F2FD] font-semibold text-xl text-center">
              Liquidity Added
            </h2>
            <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
              Liquidity added to:<br />{market.question}
            </p>
            
            <div className="mt-4 space-y-1 text-center">
              <p className="text-[#F2F2FD] text-sm">
                <span className="text-[#FFFFFFA3]">Amount</span>{' '}
                <span className="text-[#36FD68] font-semibold">${liquidityAmount.toFixed(2)}</span>
              </p>
              <p className="text-[#F2F2FD] text-sm">
                <span className="text-[#FFFFFFA3]">Range</span>{' '}
                <span className="font-normal">{getRangeDisplay(Number(yesOdds))}</span>
              </p>
            </div>
            
            {txHash && (
              <p className="text-[#05B9FC] text-sm font-semibold mt-4 text-center">
                <a href={`https://arbiscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                  View on Arbiscan →
                </a>
              </p>
            )}
            
            <div className="w-full mt-5">
              <Button onClick={handleModalClose} fullWidth>Done</Button>
            </div>
          </div>
        </SuccessModal>
      )}

      {modalState === "pending" && (
        <SuccessModal
          type="option_pending"
          title={PENDING_MESSAGES.TITLE}
          subtitle={PENDING_MESSAGES.SUBTITLE}
          isPositive={true}
          buttonText={PENDING_MESSAGES.BUTTON_TEXT}
          onButtonClick={() => {}}
          onClose={() => {}}
          width="w-[300px]"
        />
      )}

      {modalState === "error" && (
        <SuccessModal
          type="option_fail"
          title="Something went wrong"
          subtitle="Failed to add liquidity. Please try again or contact support."
          isPositive={false}
          buttonText="Try again"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        />
      )}

      {modalState === "none" && (
        <div className="p-2">
          <h2 className="text-2xl font-semibold text-[#F2F2FD] mb-4 max-w-[280px]">
            Confirm Liquidity Position
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-[12px] shrink-0">
                <Image
                  src={market.image || "/images/cup.png"}
                  alt={market.question}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#F2F2FD] truncate">
                  {market.question}
                </h3>
              </div>
            </div>

            <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden">
              <div
                className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
                style={{ background: "linear-gradient(#36FD68 5%, #16171E 0%)" }}
              />
              <div className="relative z-10 space-y-3">
                <div className="border border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
                  <span className="text-[#FFFFFFA3] font-semibold text-base">
                    Amount
                  </span>
                  <span className="text-[#FFFFFF] text-base font-normal">
                    ${liquidityAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
                  <span className="text-[#FFFFFFA3] font-semibold text-base">
                    Target Odds
                  </span>
                  <span className="text-[#FFFFFF] text-base font-normal">
                    {yesOdds}%
                  </span>
                </div>
                <div className="border border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
                  <span className="text-[#FFFFFFA3] font-semibold text-base">
                    Exposure Range
                  </span>
                  <span className="text-[#FFFFFF] text-base font-normal">
                    {getRangeDisplay(Number(yesOdds))}
                  </span>
                </div>
                <div className="border border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
                  <span className="text-[#FFFFFFA3] font-semibold text-base">
                    Gas Fee
                  </span>
                  <span className="text-[#FFFFFF] text-base font-normal">
                    $0.02
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#FFFFFF29] my-4"></div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-[46px] px-4 py-2 bg-transparent border border-[#FFFFFF29] text-white rounded-lg hover:bg-[#FFFFFF10] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 h-[46px] px-4 py-2 text-[#070708] rounded-lg disabled:opacity-50 font-semibold",
                "bg-[#36FD68] hover:bg-[#36FD68]/90"
              )}
            >
              {isLoading ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </div>
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
    </CommonModal>
  );
};

