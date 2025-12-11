"use client";

import React, { useState } from "react";
import Image from "next/image";
import SuccessModal, { HorizontalLine, PENDING_MESSAGES } from "./success-modal";
import Button from "@/components/Button";
import CommonModal from "@/components/modals";

interface TransactionDetail {
  label: string;
  value: string | React.ReactNode;
}

interface BuyOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  selectedOption: string;
  tokenSymbol: string;
  tokenName: string;
  tokenImage: string;
  strikePrice: number;
  optionCost: number;
  amount: number;
  onConfirm: () => Promise<boolean | void>;
  expiry: string;
  fees: number;
  priceChange: number;
  priceChangePercentage: number;
}

const BuyOptionModal = ({
  isOpen,
  onClose,
  title,
  selectedOption,
  tokenSymbol,
  tokenName,
  tokenImage,
  strikePrice,
  optionCost,
  amount,
  onConfirm,
  expiry,
  fees,
  priceChange,
  priceChangePercentage,
}: BuyOptionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");

  const handleConfirm = async () => {
    try {
      onClose();
      setIsLoading(true);
      setModalState("pending");
      const success = await onConfirm();
      setModalState(success ? "success" : "error");
    } catch (error) {
      console.error(error);
      setModalState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const transactionDetails: TransactionDetail[] = [
    {
      label: "Strike price",
      value: `$${strikePrice}`,
    },
    {
      label: "Per Option Cost",
      value: `$${optionCost}`,
    },
    {
      label: "Expiry",
      value: expiry,
    },
    {
      label: "Amount",
      value: amount,
    },
    {
      label: "Estimated Price Impact",
      value: (
        <div className="flex items-center text-sm font-normal">
          <span className="text-[#FFFFFF]">{priceChangePercentage}%</span>
          <span className="text-[#FFFFFF52]">(${priceChange})</span>
        </div>
      ),
    },
    {
      label: "Transaction fee",
      value: `$${fees}`,
    },
    {
      label:
        selectedOption === "buy" ? "Total amount (in)" : "Total amount (out)",
      value: `$${amount + fees}`,
    },
  ];

  const handleModalClose = () => {
    setModalState("none");

    onClose();
  };

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/options`;

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${url}`, "_blank");
  };

  return (
    <React.Fragment>
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Order confirmed"
          subtitle={`Order confirmed for ${tokenSymbol} at ${amount}.`}
          isPositive={true}
          buttonText="Close"
          onButtonClick={handleModalClose}
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

      {isOpen && (
        <CommonModal
          onClose={onClose}
          className="md:w-[364px] overflow-y-auto max-h-[95vh]"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#F2F2FD]">{title}</h2>
            </div>

            <div className="flex items-center gap-4 rounded-lg p-4 relative overflow-hidden border border-[#FFFFFF29]">
              <div
                className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]  "
                style={{
                  background: `linear-gradient(${
                    selectedOption === "buy" ? "#33E06E 5%" : "#D32B3F 5%"
                  } , #16171E 0%)`,
                }}
              />
              <div className="h-12 w-12  rounded-full relative z-10">
                <Image
                  src={tokenImage}
                  alt={tokenName}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className=" relative z-10">
                <h3 className="text-2xl font-bold text-white">{tokenSymbol}</h3>
                <p className="text-sm text-gray-400">{tokenName}</p>
              </div>
            </div>

            <HorizontalLine />

            <div className="flex flex-col gap-4">
              {transactionDetails.map((detail, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-semibold text-[#FFFFFF52] text-sm">
                    {detail.label}
                  </span>
                  {typeof detail.value === "string" ? (
                    <span className="text-[#FFFFFF] font-normal text-sm">
                      {detail.value}
                    </span>
                  ) : (
                    detail.value
                  )}
                </div>
              ))}
            </div>

            <HorizontalLine />

            <div className="flex gap-2 mt-2 h-[46px]">
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
                {isLoading ? "Confirming..." : "Confirm"}
              </Button>
            </div>

            <HorizontalLine />

            <div className="overflow-hidden w-full relative pt-4  mt-[-16px]">
              <Button
                variant="primary"
                className="text-sm px-8 py-0 h-[46px] relative z-30"
                fullWidth
                onClick={handleTwitterShare}
                icon={
                  <Image
                    src="/images/twitterblack.png"
                    alt="X"
                    width={20}
                    height={20}
                  />
                }
              >
                {selectedOption === "buy" ? "Buy" : "Exercise"} via Simmi
              </Button>
            </div>

            <p className="text-center text-sm text-[rgba(255,255,255,0.64)] mt-[-5px]">
              {selectedOption === "buy" ? "Buy" : "Exercise"} on X tagging
              Bluff!
            </p>
          </div>
        </CommonModal>
      )}
    </React.Fragment>
  );
};

export default BuyOptionModal;
