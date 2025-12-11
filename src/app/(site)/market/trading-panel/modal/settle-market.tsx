import React, { useState } from "react";
import CommonModal from "@/components/modals";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import Image from "next/image";
import HorizontalLine from "@/components/common/HorizontalLine";
import Button from "@/components/Button";
import SuccessModalContent from "./success-modal-content";

type SettleMarketProps = {
  onClose: () => void;
  imageSrc: string;
  name: string;
  onConfirm: () => Promise<void>;
};

const SettleMarket: React.FC<SettleMarketProps> = ({
  onClose,
  imageSrc = "/images/cup.png",
  name,
  onConfirm,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setModalState("pending");
      await onConfirm();
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

  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Settlement confirmed"
          subtitle="Market has been settled successfully."
          isPositive={true}
          buttonText="Done"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        >
          <SuccessModalContent
            title="Settlement Confirmed"
            desc="Market has been settled successfully."
            amount={0}
            onClick={handleModalClose}
            onFlexClick={handleModalClose}
          />
        </SuccessModal>
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

      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Settle Market</h2>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div className="flex items-center gap-4 rounded-lg py-4 relative z-10">
            <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
              <Image
                src={imageSrc}
                alt="Market"
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F2F2FD]">{name}</h3>
              <p className="text-sm text-[#FFFFFFA3]">Settle this market</p>
            </div>
          </div>
        </div>

        <HorizontalLine />

        <div className="flex gap-2 my-4">
          <Button
            variant="ghost"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
            className="!h-[46px]"
          >
            Cancel
          </Button>
          <Button
            className="!h-[46px]"
            variant="primary"
            onClick={handleConfirm}
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? "Settling..." : "Settle Market"}
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default SettleMarket;
