import React from "react";
import CommonModal from "@/components/modals";
import TradeInput from "@/components/shared/trade-input";
import Button from "@/components/Button";

type UpdateListingModalProps = {
  onClose: () => void;
  onUpdateConfirm: (e: number) => void;
  currentPrice: number;
  setAmount: (e: number) => void
  amount: number;
};

const UpdateListing: React.FC<UpdateListingModalProps> = ({
  onClose,
  onUpdateConfirm,
  currentPrice,
  setAmount,
  amount,
}) => {
  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">
          Update Listing
        </h2>

        <div className=" border border-[#FFFFFF29] rounded-[8px] p-4 mt-4">
          <p className="text-center">Current Price</p>
          <p className="text-center text-xl font-semibold">${currentPrice}</p>
        </div>

        <div className=" border border-[#FFFFFF29] rounded-[8px] p-4 mt-4">
          <TradeInput
            amount={amount}
            setAmount={setAmount}
            isButtonShow={false}
            placeHolder="Update Price"
          />
        </div>

        <Button
          variant="primary"
          className="!text-sm !font-semibold h-[40px] w-full mt-4"
          onClick={() => onUpdateConfirm(amount)}
          disabled={!amount}
        >
          Update
        </Button>
      </div>
    </CommonModal>
  );
};

export default UpdateListing;
