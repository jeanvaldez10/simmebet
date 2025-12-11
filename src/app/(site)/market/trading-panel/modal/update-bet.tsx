import React, { useState } from "react";
import CommonModal from "@/components/modals";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import Image from "next/image";
import Button from "@/components/Button";
import SuccessModalContent from "./success-modal-content";
import { ArrowDown } from "lucide-react";
import useMarketTokens from "@/hooks/useMarketTokens";
import useRebalanceEstimate from "@/hooks/useRebalanceEstimate";
import { formatTokenAmount } from "@/utils/format";
import { useQueryClient } from "@tanstack/react-query";


type UpdateBetProps = {
  onClose: () => void;
  type: "yes" | "no";
  yesAmount?: string;
  beliefPercentage: number;
  totalAmount: string;
  noAmount?: string;
  imageSrc: string;
  name: string;
  teamName?: string;
  txHash?: `0x${string}` | null;
  onUpdateConfirm?: () => Promise<void>;
  requestResponse: { yes?: string, no?: string } | null;
  setRequestResponse: (response: { yes?: string, no?: string } | null) => void;
  marketContractAddress: `0x${string}`;
};

const UpdateBet: React.FC<UpdateBetProps> = ({
  onClose,
  type = "no",
  yesAmount,
  noAmount,
  totalAmount,
  imageSrc = "/images/cup.png",
  name,
  beliefPercentage,
  teamName,
  onUpdateConfirm,
  txHash,
  requestResponse,
  setRequestResponse,
  marketContractAddress,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Live balances for Previous
  const { tokenABalance, tokenBBalance } = useMarketTokens(marketContractAddress);
  const previousYes = formatTokenAmount(tokenABalance, 18);
  const previousNo = formatTokenAmount(tokenBBalance, 18);

  // Use form input amount for USD Added
  const inputAmount = type === "yes" ? yesAmount || "0" : noAmount || "0";

  // Estimate projected outs (fallback if precomputed not provided)
  const { token0Out, token1Out, isEstimating, error } = useRebalanceEstimate({
    marketContractAddress,
    amountUsd: inputAmount,
    beliefPercentage,
    selectedSide: type,
  });

  const displayedYesOut = isEstimating || error ? "—" : formatTokenAmount(token1Out, 18);
  const displayedNoOut = isEstimating || error ? "—" : formatTokenAmount(token0Out, 18);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setModalState("pending");
      
      if (onUpdateConfirm) {
        await onUpdateConfirm();
      }
      setModalState("success");
    } catch (error) {
      console.error(error);
      setModalState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState("none");
    onClose();
    setRequestResponse(null);
    
    queryClient.invalidateQueries({ queryKey: ["market"] });
    queryClient.invalidateQueries({ queryKey: ["swaps"] });
  };

  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Update confirmed"
          subtitle={`Bet confirmed for ${teamName || name}`}
          isPositive={true}
          buttonText="Close"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        >
          <SuccessModalContent
            title="Update Confirmed"
            desc={`Bet confirmed for ${teamName || name}`}
            amount={parseFloat(totalAmount)}
            onClick={handleModalClose}
            onFlexClick={handleModalClose}
            txHash={txHash}
            requestResponse={requestResponse ?? undefined}
          />
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
          subtitle="Please try again or contact our support for further help."
          isPositive={false}
          buttonText="Try again"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        />
      )}

      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Update Bet</h2>

        {/* Market header */}
        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div className="flex items-center gap-4 py-2">
            <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
              <Image
                src={imageSrc}
                alt={"TKN"}
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#F2F2FD] truncate">{name}</h3>
            </div>
          </div>
        </div>

        {/* Position Impact (wired to live values) */}
        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] my-4">
          <h4 className="text-sm font-semibold text-[#FFFFFFA3] mb-2">Position Impact</h4>

          <div className="flex items-center justify-between py-2">
            <span className="text-[#FFFFFFA3] text-sm font-semibold">Previous</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#36FD68] border border-[#36FD68]/30 rounded-[6px] px-2 py-1">
                Yes {previousYes}
              </span>
              <span className="text-xs font-semibold text-[#D32B3F] border border-[#D32B3F]/30 rounded-[6px] px-2 py-1">
                No {previousNo}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[#FFFFFFA3] text-sm font-semibold">USD Added</span>
            <span className="text-[#FFFFFF] text-sm font-semibold">+${Number(inputAmount || "0").toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[#FFFFFFA3] text-sm font-semibold">Belief</span>
            <span className="text-[#FFFFFF] text-sm font-semibold">{beliefPercentage}%</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[#FFFFFFA3] text-sm font-semibold">Gas Fee</span>
            <span className="text-[#FFFFFF] text-sm font-semibold">$0.02</span>
          </div>

          {/* Horizontal connector with centered arrow */}
          <div className="relative my-3 h-8">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#FFFFFF29]" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full border border-[#FFFFFF29] bg-[#16171E] backdrop-blur-md">
                <ArrowDown size={16} className="text-[#FFFFFFA3]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[#FFFFFFA3] text-sm font-semibold">Estimated Out</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#36FD68] border border-[#36FD68]/30 rounded-[6px] px-2 py-1">
                Yes {displayedYesOut}
              </span>
              <span className="text-xs font-semibold text-[#D32B3F] border border-[#D32B3F]/30 rounded-[6px] px-2 py-1">
                No {displayedNoOut}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#FFFFFF80] mt-1">Estimates shown for preview. Final settlement may vary.</p>
        </div>

        <div className="flex gap-2 my-4">
          <Button
            variant="ghost"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
            className="!h-[46px]"
          >
            Cancel
          </Button>
          <Button
            className="!h-[46px]"
            variant="primary"
            onClick={handleConfirm}
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default UpdateBet;
