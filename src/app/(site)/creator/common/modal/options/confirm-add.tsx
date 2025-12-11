import React, { useState } from "react";
import CommonModal from "@/components/modals";
import Image from "next/image";
import Button from "@/components/Button";
import HorizontalLine from "@/components/common/HorizontalLine";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import { useOptionsForm } from "./store/options-context";

type ConfirmAddModalProps = {
  onClose: () => void;
};

const ConfirmAddModal: React.FC<ConfirmAddModalProps> = ({ onClose }) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const { addOption, resetAddOption } = useOptionsForm();

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setModalState("pending");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setModalState("success");
    } catch (error) {
      console.log(error);
      setModalState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState("none");
    onClose();
  };

  const dataFields = [
    { label: "Options Added", value: addOption.amount },
    {
      label: "New Option Total",
      value: `${addOption.currentTokensPerOption + addOption.amount} of
            ${addOption.maxTokensPerOption + addOption.amount}`,
    },
  ];

  return (
    <CommonModal
      onClose={() => {
        onClose();
        resetAddOption();
      }}
      className="md:w-[364px] overflow-y-auto max-h-[95vh]"
    >
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Options added!"
          subtitle={`You have added more options`}
          buttonText="View Belief"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
          secondaryButton
          secondaryButtonText="Back to HUB"
          secondaryButtonClick={handleModalClose}
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
          subtitle="Please try again."
          isPositive={false}
          buttonText="Try again"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        />
      )}

      <div className="text-sm">
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Confirm Add</h2>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-6">
          <div
            className={`flex items-center gap-4 rounded-lg p-4 relative z-10`}
          >
            <div className="h-15 w-15 overflow-hidden rounded-full">
              <Image
                src={addOption.image}
                alt={addOption.symbol}
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white uppercase">
                {addOption.symbol}
              </h3>
              <p className="text-sm text-gray-400 capitalize">
                {addOption.name}
              </p>
            </div>
          </div>
          {dataFields.map((item) => {
            return (
              <div
                key={item.label}
                className=" relative z-10 border  border-[#FFFFFF29] p-3 my-1 rounded-[8px] flex items-center justify-between"
              >
                <span className="text-[#FFFFFFA3] font-semibold ">
                  {item.label}
                </span>
                <span className="text-[#FFFFFF] font-normal">{item.value}</span>
              </div>
            );
          })}
        </div>

        <div className="my-6">
          <HorizontalLine />
        </div>

        <div className="flex justify-between">
          <span className="font-semibold text-[#FFFFFFA3]">
            Transaction fee
          </span>
          {/* PLATFORM_FEE_TODO: Hardcoded fee for options - update when gas cost changes */}
          <span>$0.50</span>
        </div>

        <div className="my-6">
          <HorizontalLine />
        </div>

        <div className="flex justify-between gap-4 items-center">
          <Button
            onClick={() => {
              onClose();
              resetAddOption();
            }}
            fullWidth
            variant="ghost"
          >
            Close
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleConfirm}
            type="submit"
            fullWidth
          >
            Continue
          </Button>
        </div>
      </div>
    </CommonModal>
  );
};

export default ConfirmAddModal;
