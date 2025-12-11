import React from "react";
import CommonModal from "../modals";
import Button from "../Button";
import { ErrorComp } from "../lottie/success-animation";
import { DEPOSIT_DISABLED } from "@/constants";

const EmptyFunds = ({
  onClose,
  onDeposit,
}: {
  onClose: () => void;
  onDeposit: () => void;
}) => {
  return (
    <CommonModal onClose={onClose} className="md:w-[300px]">
      <div className=" flex items-center justify-center w-full">
        <ErrorComp />
      </div>

      <div className="flex mt-6 flex-col items-center justify-center gap-2">
        <h2 className="font-semibold text-[#F2F2FD] text-xl text-center">
          Insuficient Funds
        </h2>
        <p className=" text-[#F2F2FD] font-semibold text-sm text-center w-[90%] m-auto">
          {DEPOSIT_DISABLED 
            ? "Deposits are currently disabled." 
            : "It seems like you don't have enough funds to complete this action."
          }
        </p>
      </div>

      <div className="w-full flex flex-col gap-2 mt-6">
        {!DEPOSIT_DISABLED && (
          <Button
            variant="primary"
            onClick={onDeposit}
            className="w-full !text-sm !h-[46px]"
          >
            Make a deposit
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full !text-sm !h-[46px]"
        >
          {DEPOSIT_DISABLED ? "Close" : "Maybe later"}
        </Button>
      </div>
    </CommonModal>
  );
};

export default EmptyFunds;
