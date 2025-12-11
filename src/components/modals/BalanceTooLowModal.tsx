"use client";

import React from "react";
import CommonModal from "@/components/modals";
import SuccessModal from "@/app/(site)/options/common/success-modal";
import Button from "@/components/Button";

interface BalanceTooLowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit?: () => void;
}

/**
 * Modal shown when user doesn't have enough balance to cover platform fees
 * 
 * Platform fees are charged to the user's Bluff wallet (USDC balance), not their positions.
 * This prevents users from performing actions even if they have valuable positions.
 * 
 * Uses the same SuccessModal component with type "option_fail" for consistency.
 */
export const BalanceTooLowModal: React.FC<BalanceTooLowModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
}) => {
  if (!isOpen) return null;

  const handleDeposit = () => {
    onClose();
    if (onDeposit) {
      onDeposit();
    }
  };

  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      <SuccessModal
        type="option_fail"
        title="Balance too low"
        subtitle="Platform fees are charged to your Bluff wallet."
        isPositive={false}
        buttonText="Deposit"
        onButtonClick={handleDeposit}
        onClose={onClose}
        width="w-[300px]"
      >
        <div className="w-full">
          <h2 className="text-[#F2F2FD] font-semibold text-xl text-center">
            Balance too low
          </h2>
          <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
            Platform fees are charged to your Bluff wallet.
          </p>
          <p className="text-[#FFFFFFA3] text-sm mt-2 text-center">
            Please deposit more or reduce your bet size and try again.
          </p>
          
          <div className="w-full mt-5">
            <Button onClick={handleDeposit} fullWidth>Deposit</Button>
          </div>
        </div>
      </SuccessModal>
    </CommonModal>
  );
};

