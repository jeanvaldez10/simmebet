import React from "react";
import CommonModal from "@/components/modals";
import TradeInput from "@/components/shared/trade-input";
import Button from "@/components/Button";

type SellOptionsModalProps = {
  onClose: () => void;
  onSellConfirm: (e: number) => void;
  setPrice: (e: number) => void;
  setAmount: (e: number) => void;
  amount: number;
  price: number;
  balance: number;
};

const SellOptions: React.FC<SellOptionsModalProps> = ({
  onClose,
  onSellConfirm,
  amount,
  setAmount,
  price,
  setPrice,
  balance,
}) => {
  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Sell Options</h2>

        <div className=" border border-[#FFFFFF29] rounded-[8px] p-4 mt-4">
          <TradeInput amount={amount} setAmount={setAmount} />
        </div>

        <div className="flex  flex-col gap-2 justify-between mt-4">
          <div className=" border border-[#FFFFFF29] rounded-[8px] p-4">
            <TradeInput
              amount={price}
              setAmount={setPrice}
              placeHolder="Price"
            />
          </div>

          <div className="flex  gap-2 justify-between  items-center flex-col  border border-[#FFFFFF29] rounded-[8px] p-4">
            <p className=" text-base font-semibold text-[#FFFFFFA3]">
              Options Balance
            </p>
            <span className=" text-[#F2F2FD] text-xl font-semibold">
              {balance}
            </span>
          </div>
        </div>
        <Button
          className="!bg-[#FD3748] !text-sm !font-semibold h-[40px] w-full mt-4"
          onClick={() => onSellConfirm(amount)}
          disabled={!amount}
        >
          Sell
        </Button>
      </div>
    </CommonModal>
  );
};

export default SellOptions;
