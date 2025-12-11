import React from "react";
import CommonModal from "@/components/modals";
import HorizontalLine from "@/components/common/HorizontalLine";
import Button from "@/components/Button";
import AdaptiveDollarInput from "./adpative-input";
import { useBeliefForm } from "./store/create-context";

type AddLiquidityModalProps = {
  onClose: () => void;
  onConfirm: () => void;
};

const AddLiquidity: React.FC<AddLiquidityModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const { lpAmount, setLPAmount, resetForm } = useBeliefForm();

  return (
    <CommonModal
      onClose={() => {
        onClose();
        resetForm();
        setLPAmount(0);
      }}
      className="md:w-[480px]  overflow-y-auto max-h-[95vh]"
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Add liquidity</h2>
        <p className="text-[#FFFFFFA3] mb-4">
          Deposit liquidity for the market to be tradeable
        </p>

        <div className="flex items-center gap-2 mb-4">
          <p className="text-[#FFFFFFA3]">Balance:</p>
          <p>$10.000</p>
        </div>

        <div className="flex flex-col gap-2 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)] overflow-hidden">
          <span className="text-base font-semibold text-center text-[#FFFFFFA3]">
            Enter Amount
          </span>
          <AdaptiveDollarInput setAmount={setLPAmount} value={lpAmount} />

          {lpAmount < 500 && (
            <div className="text-red-500 text-sm mt-2 mb-4 text-center">
              WARNING: You aren&apos;t providing enough liquidity
            </div>
          )}
          <HorizontalLine />
          <div className="flex text-sm items-center justify-center mt-2 gap-2">
            <p className="text-[#FFFFFFA3]">Suggested Liquidity:</p>
            <p>Above $500.0</p>
          </div>
        </div>
        <div className="flex mt-4 justify-between gap-4 items-center">
          <Button
            onClick={() => {
              onClose();
              resetForm();
              setLPAmount(0);
            }}
            fullWidth
            variant="ghost"
          >
            Close
          </Button>
          <Button
            onClick={onConfirm}
            type="submit"
            fullWidth
            disabled={lpAmount < 500}
          >
            Continue
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default AddLiquidity;
