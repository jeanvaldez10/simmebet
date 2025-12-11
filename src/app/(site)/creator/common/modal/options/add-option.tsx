import Button from "@/components/Button";
import HorizontalLine from "@/components/common/HorizontalLine";
import CommonModal from "@/components/modals";
import React from "react";
import { useOptionsForm } from "./store/options-context";
import { cn } from "@/lib/utils";

type AddOptionModalProps = {
  onClose: () => void;
  onConfirm: () => void;
};

const AddOptionModal: React.FC<AddOptionModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const { addOption, setAddOption, resetAddOption } = useOptionsForm();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAddOption((prev) => ({ ...prev, amount: parseFloat(value) || 0 }));
    }
  };
  return (
    <CommonModal
      onClose={() => {
        onClose();
        resetAddOption();
      }}
      className="md:w-[480px] overflow-y-auto max-h-[95vh]"
    >
      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Add Options</h2>
        <div className="flex mt-6 flex-col gap-2 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)]">
          <span className="text-base font-semibold text-center text-[#FFFFFFA3]">
            Enter Amount
          </span>
          <div className="flex justify-center items-center text-[40px] font-semibold text-[#F2F2FD]">
            <input
              type="text"
              value={addOption.amount || ""}
              onChange={handleAmountChange}
              className="bg-transparent text-[40px] text-center font-semibold text-[#F2F2FD] outline-none max-w-[100px]"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm my-4">
          <div className="flex items-center justify-between">
            <p className="text-[#FFFFFFA3]">Current Options</p>
            <div className="text-sm font-semibold">
              {addOption.currentTokensPerOption} of{" "}
              {addOption.maxTokensPerOption}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#FFFFFFA3]">Tokens per Option</p>
            <p>100</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#FFFFFFA3]">Token Balance</p>
            <p>{addOption.amount}</p>
          </div>
        </div>

        <HorizontalLine />

        <div className="flex items-center justify-between text-sm my-4 gap-2">
          <p className="text-[#FFFFFFA3]">New Option Total</p>
          <div className="text-sm font-semibold">
            {addOption.currentTokensPerOption + addOption.amount} of{" "}
            {addOption.maxTokensPerOption + addOption.amount}
          </div>
        </div>

        <div className="flex mt-4 justify-between gap-4 items-center">
          <Button
            onClick={() => {
              onClose();
              resetAddOption();
            }}
            fullWidth
            variant="ghost"
          >
            Close
          </Button>
          <Button
            className={cn(
              addOption.amount === 0 ? "!cursor-not-allowed" : "pointer"
            )}
            onClick={onConfirm}
            type="submit"
            fullWidth
            disabled={addOption.amount === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default AddOptionModal;
