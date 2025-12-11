import React, { useState } from "react";
import CommonModal from "@/components/modals";
import Image from "next/image";
import Button from "@/components/Button";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import HorizontalLine from "@/components/common/HorizontalLine";
import { useOptionsForm } from "./store/options-context";
import { formatBalance } from "@/utils/format";

type ConfirmOptionPutModalProps = {
  onClose: () => void;
};

const ConfirmOptionPut: React.FC<ConfirmOptionPutModalProps> = ({
  onClose,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const { state, resetForm } = useOptionsForm();

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
    resetForm();
    setModalState("none");
    onClose();
  };

  const dataFields = [
    { label: "Option Price", value: formatBalance(state.data.premium) },
    { label: "Type", value: state.data.type.toUpperCase() },
    { label: "Strike", value: formatBalance(state.data.strike) },
    { label: "Expiry", value: state.data.expiry },
    { label: "Tokens per Option", value: state.data.tokensPerOption },
    { label: "Options Created", value: state.data.amount },
  ];

  return (
    <CommonModal
      onClose={() => {
        onClose();
        resetForm();
      }}
      className="md:w-[364px] overflow-y-auto max-h-[95vh]"
    >
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Option created!"
          subtitle={`You have created a new option`}
          buttonText="View option"
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

      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">
          Confirm Option
        </h2>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div
            className={`flex items-center gap-4 rounded-lg p-4 relative z-10`}
          >
            <div className="h-15 w-15 overflow-hidden rounded-full">
              <Image
                src={state.data.tokenImage}
                alt={"TKN"}
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {state.data.tokenSymbol}
              </h3>
              <p className="text-sm text-gray-400">{state.data.tokenName}</p>
            </div>
          </div>
          {dataFields.map((item) => {
            return (
              <div
                key={item.label}
                className=" relative z-10 border  border-[#FFFFFF29] p-3 my-1 rounded-[8px] flex items-center justify-between"
              >
                <span className="text-[#FFFFFFA3] font-semibold  text-base">
                  {item.label}
                </span>
                <span className="text-[#FFFFFF] text-base font-normal">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="my-6">
          <HorizontalLine />
        </div>

        <div className="flex text-[#FFFFFFA3] justify-between items-center">
          <p>Transaction fee</p>
          {/* PLATFORM_FEE_TODO: Hardcoded fee for options - update when gas cost changes */}
          <p>$0.50</p>
        </div>

        <div className="my-6">
          <HorizontalLine />
        </div>

        <div className="flex gap-2 my-4 ">
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              resetForm();
            }}
            fullWidth
            className="!h-[46px]"
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
      </div>
    </CommonModal>
  );
};

export default ConfirmOptionPut;
