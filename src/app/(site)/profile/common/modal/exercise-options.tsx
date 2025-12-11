import React from "react";
import CommonModal from "@/components/modals";
import TradeInput from "@/components/shared/trade-input";
import Button from "@/components/Button";

type ExerciseOptionsModalProps = {
  onClose: () => void;
  onExerciseConfirm: (e: number) => void;
  amount: number;
  setAmount: (e: number) => void;
  balance: number;
};

const ExerciseOptions: React.FC<ExerciseOptionsModalProps> = ({
  onClose,
  amount,
  setAmount,
  onExerciseConfirm,
  balance,
}) => {
  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">
          Exercise Options
        </h2>

        <div className=" border border-[#FFFFFF29] rounded-[8px] p-4 mt-4">
          <TradeInput amount={amount} setAmount={setAmount} />
        </div>

        <div className="flex  flex-col gap-1 justify-between border border-[#FFFFFF29] p-3 rounded-[8px] mt-4">
          <div className="flex  gap-2 justify-between mt-1 items-center">
            <p className=" text-base font-semibold text-[#FFFFFFA3]">
              Estimated Profit
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="text-xl font-semibold">
                <span className="text-[#F2F2FD] text-center">
                  {amount ? `$${amount + 0.5}` : 0}
                </span>{" "}
              </div>
            </div>
          </div>

          <div className="flex  gap-2 justify-between  items-center">
            <p className=" text-base font-semibold text-[#FFFFFFA3]">
              Options Balance
            </p>
            <span className=" text-[#F2F2FD] text-xl font-semibold">
              {balance}
            </span>
          </div>
        </div>
        <Button
          className="!bg-white !text-sm !font-semibold h-[40px] w-full mt-4"
          onClick={() => onExerciseConfirm(amount)}
          disabled={!amount}
        >
          Exercise
        </Button>
      </div>
    </CommonModal>
  );
};

export default ExerciseOptions;
