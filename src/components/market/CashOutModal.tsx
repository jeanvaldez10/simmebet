/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IMarketData } from "@/interfaces/market";
import { formatWalletAddress } from "@/utils/format";
import SuccessModal from "@/app/(site)/options/common/success-modal";

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actualCashoutAmount, setActualCashoutAmount] = useState<string>("");
  const router = useRouter();

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const response = await onCashOut?.(selectedOption, amount);
      if (response?.data?.amountOut) {
        const amountOutUSD = (Number(response.data.amountOut) / 1e6).toFixed(2);
        setActualCashoutAmount(amountOutUSD);
      } else {
        setActualCashoutAmount(amount);
      }
      setShowSuccessModal(true);
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    router.push("/markets");
    setShowSuccessModal(false);
    onClose();
  };

  const getOptionLabel = (option: string) => {
    return `${option === "yes" ? (market.yesSideName || "Yes") : (market.noSideName || "No")}`;
  };

  const getOptionPrice = (option: string) => {
    return option === "yes" ? market.yesPrice : market.noPrice;
  };

  return (
    <>
      {showSuccessModal && (
        <SuccessModal
          type="withdrawal"
          title="Cash Out Successful!"
          subtitle={`You cashed out your ${selectedOption.toUpperCase()} position on "${
            market.question
          }"`}
          amount={actualCashoutAmount || amount}
          isPositive={true}
          buttonText="Go to Markets"
          onButtonClick={handleSuccessClose}
          onClose={handleSuccessClose}
          width="w-[300px]"
        />
      )}

      <Modal
        isOpen={isOpen && !showSuccessModal}
        onClose={onClose}
        width="max-w-[400px]"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">Cash Out</h2>

          <div
            className={`flex flex-col items-center gap-3 border border-solid border-[#ffffff28] rounded-lg p-2 bg-gradient-to-b ${
              selectedOption === "yes"
                ? "from-[#4fc071] to-[#2E3144]/80"
                : "from-[#f04438] to-[#2E3144]/80"
            }`}
          >
            <div className="flex items-center gap-2 justify-between w-full">
              {market.image && (
                <div className="w-12 h-12 rounded-full overflow-hidden">
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
            <div className="flex items-center gap-2 justify-between w-full border border-solid border-[rgba(255,255,255,0.16)] rounded-lg p-2 bg-[#ffffff28]">
              <span
                className={`${
                  selectedOption === "yes" ? "text-[#4fc071]" : "text-[#f04438]"
                }`}
              >
                {getOptionLabel(selectedOption)}
              </span>
              <span className="text-white">
                {getOptionPrice(selectedOption)}%
              </span>
            </div>
          </div>

          {/* horizontal line */}
          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.16)]" />

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[rgba(255,255,255,0.64)]">Wallet</span>
              <span className="text-white font-mono">
                {formatWalletAddress(walletAddress)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[rgba(255,255,255,0.64)]">
                Cash Out Amount
              </span>
              <span className="text-white">${amount}</span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-[rgba(255,255,255,0.16)]" />

          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              fullWidth
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CashOutModal;
