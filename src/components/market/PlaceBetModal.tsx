import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import Image from "next/image";
import { IMarketData } from "@/interfaces/market";
import { formatWalletAddress } from "@/utils/format";
import SuccessModal from "@/app/(site)/options/common/success-modal";

interface PlaceBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: IMarketData;
  amount: string;
  belief: number;
  walletAddress: string;
  selectedOption: string;
  txHash: `0x${string}` | null;
  onPlaceBet?: (option: string, amount: string) => Promise<void>;
}

const PlaceBetModal = ({
  isOpen,
  onClose,
  market,
  amount,
  belief,
  walletAddress,
  selectedOption,
  txHash,
  onPlaceBet,
}: PlaceBetModalProps) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onPlaceBet?.(selectedOption, amount);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // router.push("/markets");
    onClose();
  };

  const getOptionLabel = (option: string) => {
    return `${option === "yes" ? (market.yesSideName || "Yes") : (market.noSideName || "No")}`;
  };

  // const getOptionPrice = (option: string) => {
  //   return option === "yes" ? market.yesPrice : market.noPrice;
  // };

  return (
    <>
      {showSuccessModal && (
        <SuccessModal
          type="purchase"
          title="Bet Placed Successfully!"
          subtitle={`You placed a ${selectedOption.toUpperCase()} bet on "${
            market.question
          }"`}
          amount={amount}
          isPositive={true}
          buttonText="Confirm"
          onButtonClick={handleSuccessClose}
          onClose={handleSuccessClose}
          txHash={txHash}
          width="w-[300px]"
        />
      )}

      <Modal
        isOpen={isOpen && !showSuccessModal}
        onClose={onClose}
        width="max-w-[400px]"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">Place bet</h2>

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
              <span className="text-white">{`${belief}%`}</span>
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
                Total amount
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
              {isLoading ? "Placing Bet..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PlaceBetModal;
