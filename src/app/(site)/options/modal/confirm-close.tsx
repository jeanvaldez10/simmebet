import React, { useState } from "react";
import CommonModal from "@/components/modals";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import Image from "next/image";
import Button from "@/components/Button";
import SuccessModalContent from "@/app/(site)/market/trading-panel/modal/success-modal-content";
import { TOptionClose } from "../hooks/use-option-close";

type ConformCloseOptionsProps = {
  onClose: () => void;
} & TOptionClose;

const ConformCloseOptions: React.FC<ConformCloseOptionsProps> = ({
  onClose,
  name,
  image,
  symbol,
  optionListed,
  listPrice,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setModalState("pending");
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/options`;

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${url}`, "_blank");
  };

  return (
    <CommonModal onClose={onClose} className="w-[364px]">
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Order confirmed"
          subtitle={`Order confirmed for XYZ at ZYZ.`}
          isPositive={true}
          buttonText="Close"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        >
          <SuccessModalContent
            title="Listing Closed"
            desc="You no longer have access to this Option."
            amount={1000}
            onClick={handleModalClose}
            onFlexClick={handleModalClose}
            buttonNode={
              <div className="w-full mt-5">
                <Button className="!w-full" onClick={handleModalClose}>
                  Done
                </Button>
              </div>
            }
            amountNode={<p></p>}
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
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Confirm Close</h2>

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
                src={image}
                alt={symbol}
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-whit uppercasee">
                {symbol}
              </h3>
              <p className="text-sm text-gray-400 capitalize">{name}</p>
            </div>
          </div>
          <div className=" relative z-10 border  border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
            <span className="text-[#FFFFFFA3] font-semibold  text-base">
              Options listed
            </span>
            <span className="text-[#FFFFFF] text-base font-normal">
              {optionListed}
            </span>
          </div>
          <div className=" relative z-10 border  border-[#FFFFFF29] p-3 rounded-[8px] mt-1 flex items-center justify-between">
            <span className="text-[#FFFFFFA3] font-semibold  text-base">
              List Price
            </span>
            <span className="text-[#FFFFFF] text-base font-normal">
              ${listPrice}
            </span>
          </div>
        </div>

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

        <div className=" mt-4">
          <Button
            variant="primary"
            className="text-sm px-8 py-0"
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
            Close via Bluff
          </Button>

          <p className="text-center text-sm text-[#FFFFFFA3] mt-1">
            Close on X by tagging Bluff!
          </p>
        </div>
      </div>
    </CommonModal>
  );
};

export default ConformCloseOptions;
