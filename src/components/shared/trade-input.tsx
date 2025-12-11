import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

const TradeInput = ({
  amount,
  handleAmountChange,
  setAmount,
  placeHolder = "Amount (options)",
  isButtonShow = true,
  className = "",
}: {
  amount: number;
  handleAmountChange?: (type: "minus" | "plus", value: number) => void;
  placeHolder?: string;
  className?: string;
  isButtonShow?: boolean;
  setAmount?: (value: number) => void;
}) => {
  return (
    <div className="flex items-center gap-4 justify-between  w-full">
      {isButtonShow && (
        <button
          className="border border-[#FFFFFF52] flex items-center justify-center rounded-full p-1 w-[25px] h-[25px] pointer"
          onClick={() => {
            if (setAmount) {
              setAmount(Math.max(0, amount - 10));
            } else {
              if (!handleAmountChange) return;
              handleAmountChange("minus", amount);
            }
          }}
        >
          <Minus color="#ffff" />
        </button>
      )}
      <input
        type="text"
        disabled={!setAmount}
        value={amount || ""}
        className={cn(
          `w-full bg-transparent text-xl font-semibold text-[#F2F2FD] outline-none text-center`,
          className
        )}
        placeholder={placeHolder}
        onChange={(e) => {
          if (setAmount) {
            setAmount(Number(e.target.value));
          }
        }}
      />
      {isButtonShow && (
        <button
          className="border border-[#FFFFFF52] flex items-center justify-center flex-e rounded-full p-1 w-[25px] h-[25px] pointer"
          onClick={() => {
            if (setAmount) {
              setAmount(amount + 10);
            } else {
              if (!handleAmountChange) return;
              handleAmountChange("plus", amount);
            }
          }}
        >
          <Plus color="#ffff" />
        </button>
      )}
    </div>
  );
};

export default TradeInput;
