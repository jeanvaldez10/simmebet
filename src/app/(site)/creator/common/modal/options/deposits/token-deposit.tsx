import React, { useState } from "react";
import CommonModal from "@/components/modals";
import Image from "next/image";
import { IoIosArrowForward } from "react-icons/io";
import Button from "@/components/Button";
import AdaptiveDollarInput from "../../belief/adpative-input";

type TokensDepositModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  onGoBack: () => void;
};

const TokensDepositModal: React.FC<TokensDepositModalProps> = ({
  onClose,
  onConfirm,
  onGoBack,
}) => {
  const [amount, setAmount] = useState<number>(500);
  console.log("TokensDepositModal rendered with amount:", amount);

  return (
    <CommonModal
      onClose={onClose}
      className="md:w-[480px] overflow-y-auto max-h-[95vh]"
    >
      <div className="text-sm">
        <h2 className="text-3xl font-semibold text-[#F2F2FD]">
          Deposit Tokens
        </h2>
        <p className="text-[#FFFFFFA3] text-base font-normal">
          Enter how much you would like to deposit
        </p>

        <div className="border cursor-pointer! text-[#FFFFFFA3] border-[#FFFFFF29] p-4 mt-4 rounded-md relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className={`flex items-center gap-4 rounded-lg relative z-10`}>
              <div className="h-11.5 w-11.5 overflow-hidden rounded-full">
                <Image
                  src={"/images/cup.png"}
                  alt={"TKN"}
                  width={46}
                  height={46}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">TKN</h3>
                <p className="text-xs text-[#FFFFFFA3] font-normal">
                  Token Name Here
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <p className="text-xl font-semibold text-white">10.54</p>
                <p className="text-xs font-normal text-[#FFFFFFA3] text-right">
                  $57.54
                </p>
              </div>
              <IoIosArrowForward size={25} />
            </div>
          </div>
        </div>

        <div className="flex mt-4 flex-col gap-2 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)]">
          <span className="text-base font-semibold text-center text-[#FFFFFFA3]">
            Enter Amount
          </span>
          <div className="flex justify-center items-center text-[40px] font-semibold text-[#F2F2FD]">
            <AdaptiveDollarInput
              setAmount={setAmount}
              outSideNumber={amount}
              isShowUSDSign={false}
            />
          </div>

          <div className="flex gap-3 items-center justify-between">
            {[10, 100, 200, 1000].map((item, index) => (
              <button
                className="w-full px-2 py-1 rounded-full border border-[#FFFFFF52]"
                key={index}
                onClick={() => setAmount(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex mt-4 justify-between flex-col gap-4 items-center">
          <Button
            onClick={onConfirm}
            type="submit"
            fullWidth
            className="!h-[46px]"
          >
            Deposit
          </Button>
          <Button
            onClick={onGoBack}
            fullWidth
            variant="ghost"
            className="!h-[46px]"
          >
            Go Back
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default TokensDepositModal;
