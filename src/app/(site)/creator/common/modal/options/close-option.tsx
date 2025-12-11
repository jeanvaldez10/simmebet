import React, { useState } from "react";
import CommonModal from "@/components/modals";
import Image from "next/image";
import Button from "@/components/Button";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import HorizontalLine from "@/components/common/HorizontalLine";
import { useOptionsForm } from "./store/options-context";
import { formatBalance } from "@/utils/format";

type ConfirmOptionCallModalProps = {
  onClose: () => void;
};

const CloseOptionModal: React.FC<ConfirmOptionCallModalProps> = ({
  onClose,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const { closeOption } = useOptionsForm();

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
    { label: "Option Price", value: formatBalance(closeOption.optionsPrice) },
    { label: "Type", value: closeOption.type?.toUpperCase() },
    { label: "Strike", value: formatBalance(closeOption.strike) },
    { label: "Expiry", value: closeOption.expiry },
    { label: "Options", value: closeOption.options },
  ];

  const returnedTokens =
    closeOption.type === "call"
      ? closeOption.options * closeOption.tokensPerOption
      : formatBalance(closeOption.options * closeOption.tokensPerOption);

  const name =
    closeOption.type === "call" ? "Returned Tokens" : "Returned USDC";

  // PLATFORM_FEE_TODO: Hardcoded fee for options - update when gas cost changes
  const otherSectionField = [
    { label: name, value: returnedTokens },
    { label: "Transaction fee", value: "$0.50" },
  ];

  return (
    <CommonModal
      onClose={onClose}
      className="md:w-[364px] overflow-y-auto max-h-[95vh]"
    >
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Options Closed"
          subtitle={`You have closed your option listing`}
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
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Close Option</h2>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div
            className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
            style={{ background: "linear-gradient(#D32B3F 5%, #16171E 0%)" }}
          />
          <div
            className={`flex items-center gap-4 rounded-lg p-4 relative z-10`}
          >
            <div className="h-15 w-15 overflow-hidden rounded-full">
              <Image
                src={closeOption.image}
                alt={closeOption.symbol}
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white uppercase">
                {closeOption.symbol}
              </h3>
              <p className="text-sm text-gray-400">{closeOption.name}</p>
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

        <div className="my-5">
          <HorizontalLine />
        </div>

        {otherSectionField.map((item, index) => {
          return (
            <div
              key={item.label}
              className="flex text-[#FFFFFFA3] my-2 text-sm justify-between items-center"
            >
              <p>{item.label}</p>
              <p
                className={`${
                  index === 0
                    ? "text-[#36FD68]"
                    : index === 1
                    ? "text-[#FD3748]"
                    : "text-white"
                }`}
              >
                {item.value}
              </p>
            </div>
          );
        })}

        <div className="my-5">
          <HorizontalLine />
        </div>

        <div className="flex gap-2 my-4 ">
          <Button
            variant="ghost"
            onClick={onClose}
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

export default CloseOptionModal;
