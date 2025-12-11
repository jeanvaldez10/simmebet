import React, { useState } from "react";
import CommonModal from "@/components/modals";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import Image from "next/image";
import HorizontalLine from "@/components/common/HorizontalLine";
import Button from "@/components/Button";
import SuccessModalContent from "./success-modal-content";

type ClaimWinningsProps = {
  onClose: () => void;
  imageSrc: string;
  name: string;
  winningsAmount: string;
  onConfirm: () => Promise<{ claimedAmount?: string; amountOut?: string }>;
};

const ClaimWinnings: React.FC<ClaimWinningsProps> = ({
  onClose,
  imageSrc = "/images/cup.png",
  name,
  winningsAmount,
  onConfirm,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);
  const [actualClaimedAmount, setActualClaimedAmount] = useState<string>(winningsAmount);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setModalState("pending");
      const result = await onConfirm();
      
      // Update the displayed amount with the actual claimed amount from API
      if (result?.amountOut) {
        // amountOut should be formatted USDC amount from the API (e.g., "$123.45")
        // Ensure it's properly formatted as a string with $ prefix
        const amountOutStr = result.amountOut.toString();
        if (amountOutStr.startsWith('$')) {
          setActualClaimedAmount(amountOutStr);
        } else {
          // If amountOut doesn't have $ prefix, parse and format it
          const numericAmount = parseFloat(amountOutStr) || 0;
          setActualClaimedAmount(`$${numericAmount.toFixed(2)}`);
        }
      } else if (result?.claimedAmount) {
        // Fallback to claimedAmount if amountOut is not available
        const numericAmount = typeof result.claimedAmount === 'string' 
          ? parseFloat(result.claimedAmount) || 0
          : (result.claimedAmount || 0);
        const formattedAmount = `$${numericAmount.toFixed(2)}`;
        setActualClaimedAmount(formattedAmount);
      }
      // If neither amountOut nor claimedAmount is provided, keep the original winningsAmount
      
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
  };

  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Winnings claimed"
          subtitle={`You have claimed ${actualClaimedAmount}.`}
          isPositive={true}
          buttonText="Close"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        >
          <SuccessModalContent
            title="Winnings Claimed"
            desc="Your winnings have been successfully claimed"
            amount={parseFloat(actualClaimedAmount.replace(/[$,\s]/g, "")) || 0}
            onClick={handleModalClose}
            onFlexClick={handleModalClose}
            amountNode={
              <div className="flex justify-center mt-3">
                <span className="text-[#36FD68] text-sm font-normal text-center">
                  {actualClaimedAmount} claimed
                </span>
              </div>
            }
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
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">
          Claim Winnings
        </h2>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div className="flex items-center gap-4 rounded-lg py-4 relative z-10">
            <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
              <Image
                src={imageSrc}
                alt="Market"
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F2F2FD]">{name}</h3>
              <p className="text-sm text-[#FFFFFFA3]">Claim your winnings</p>
            </div>
          </div>
          <div className="relative z-10 border border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
            <span className="text-[#36FD68] font-semibold text-base">
              Expected USDC
            </span>
            <span className="text-[#FFFFFF] text-base font-normal">
              {actualClaimedAmount}
            </span>
          </div>
        </div>

        <HorizontalLine />

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
            {isLoading ? "Claiming..." : "Claim"}
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default ClaimWinnings;
