/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import Image from "next/image";
import { IMarketData } from "@/interfaces/market";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";

interface CashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: IMarketData;
  amount: string;
  walletAddress: string;
  selectedOption: string;
  onCashOut?: (option: string, amount: string) => Promise<{ data?: { amountOut?: string } } | void>;
}

const CashOutModal = ({
  isOpen,
  onClose,
  market,
  amount,
  walletAddress,
  selectedOption,
  onCashOut,
}: CashOutModalProps) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);
  const [actualCashoutAmount, setActualCashoutAmount] = useState<string>("");

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setModalState("pending");
      const response = await onCashOut?.(selectedOption, amount);
      if (response?.data?.amountOut) {
        const amountOutUSD = (Number(response.data.amountOut) / 1e6).toFixed(2);
        setActualCashoutAmount(amountOutUSD);
      } else {
        setActualCashoutAmount(amount);
      }
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

  const getOptionLabel = (option: string) => {
    return `${option === "yes" ? "Yes" : "No"}`;
  };

  const getOptionPrice = (option: string) => {
    return option === "yes" ? market.yesPrice : market.noPrice;
  };

  return (
    <>
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Bet Closed"
          subtitle={`Order confirmed for XYZ at ZYZ.`}
          isPositive={true}
          amount={actualCashoutAmount || amount}
          buttonText="Go to Markets"
          secondaryButton
          onButtonClick={handleModalClose}
          secondaryButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        />
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

      <Modal
        isOpen={isOpen && modalState === "none"}
        onClose={onClose}
        width="max-w-[400px]"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">Close Bet</h2>

          <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-2">
            <div
              className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
              style={{
                background: "linear-gradient(#46FD84 5%, transparent 0%)",
              }}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 w-full mb-2">
                {market.image && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <Image
                      src={market.image}
                      alt={market.question}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-white text-lg">{market.question}</p>
              </div>
              <div className="flex items-center gap-2 justify-between w-full border border-solid border-[rgba(255,255,255,0.16)] rounded-lg p-2.5">
                <span
                  className={`${
                    selectedOption === "yes"
                      ? "text-[#4fc071]"
                      : "text-[#f04438]"
                  }`}
                >
                  {getOptionLabel(selectedOption)}
                </span>
                <span className="text-white">
                  {getOptionPrice(selectedOption)}%
                </span>
              </div>
              <div className="flex text-gray-400 items-center gap-2 justify-between w-full border border-solid border-[rgba(255,255,255,0.16)] rounded-lg p-2.5">
                <span>Belief</span>
                <span className="text-gray-300">70%</span>
              </div>
            </div>
          </div>

          {/* horizontal line */}
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.16)]" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[rgba(255,255,255,0.64)]">Wallet</span>
              <span className="text-white font-mono">0✕1234...6543</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[rgba(255,255,255,0.64)]">
                Total Amount
              </span>
              <span className="text-white">${amount}</span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.16)]" />

          <div className="flex gap-2 my-4 ">
            <Button
              variant="ghost"
              onClick={onClose}
              fullWidth
              disabled={isLoading}
              className=" !h-[46px]"
            >
              Cancel
            </Button>
            <Button
              className=" !h-[46px]"
              variant="primary"
              onClick={handleConfirm}
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Confirming..." : "Confirm"}
            </Button>
          </div>

          <div className="relative w-full">
            <div className="w-full h-[1px] bg-[rgba(255,255,255,0.16)]" />
            {/* Green glow effect */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-[-1px] w-[100px] h-[40px] bg-green-600 opacity-50 blur-2xl rounded-full pointer-events-none" />
          </div>

          <div className="mt-2">
            <p className="text-center text-sm text-[#FFFFFFA3]">
              Place your bet on X by tagging Bluff!
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CashOutModal;
