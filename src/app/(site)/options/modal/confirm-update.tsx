import React, { useState } from "react";
import CommonModal from "@/components/modals";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import Image from "next/image";
import HorizontalLine from "@/components/common/HorizontalLine";
import Button from "@/components/Button";
import { ArrowDown, ArrowRight } from "lucide-react";
import SuccessModalContent from "@/app/(site)/market/trading-panel/modal/success-modal-content";
import { cn } from "@/lib/utils";

type ConfirmUpdateProps = {
  onClose: () => void;
  type: string;
  oldPrice?: number;
  newPrice: number;
  totalAmount: number;
  imageSrc: string;
  name: string;
  tokenName: string;
};

const ConfirmUpdate: React.FC<ConfirmUpdateProps> = ({
  onClose,
  type = "no",
  totalAmount,
  imageSrc = "/images/cup.png",
  name,
  oldPrice,
  newPrice,
  tokenName,
}) => {
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const gradient =
    type === "Long"
      ? "linear-gradient(#36FD68 5%, #16171E 0%)"
      : "linear-gradient(#D32B3F 5%, #16171E 0%)";

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
          buttonText="Done"
          onButtonClick={handleModalClose}
          onClose={handleModalClose}
          width="w-[300px]"
        >
          <SuccessModalContent
            title="Listing Updated"
            desc="Listing value updated"
            amount={newPrice}
            onClick={handleModalClose}
            onFlexClick={handleModalClose}
            buttonNode={
              <div className="w-full mt-5">
                <Button className="!w-full" onClick={handleModalClose}>
                  Done
                </Button>
              </div>
            }
            amountNode={
              <div className="flex items-center gap-1 mt-1 justify-center w-full">
                <p className="text-[#FFFFFF52] text-sm font-normal">
                  ${oldPrice}
                </p>
                <ArrowRight size={16} className="text-[#FFFFFF52]" />
                <p
                  className={cn(
                    newPrice > 0 ? "text-[#36FD68]" : "text-[#D32B3F]",
                    "text-sm font-normal  text-center"
                  )}
                >
                  ${newPrice}
                </p>
              </div>
            }
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
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">Update Bet</h2>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div
            className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
            style={{ background: gradient }}
          />
          <div
            className={`flex items-center gap-4 rounded-lg py-4 relative z-10`}
          >
            <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
              <Image
                src={imageSrc}
                alt={name}
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F2F2FD]  uppercase">
                {name}
              </h3>
              <p className="text-[#FFFFFFA3] font-semibold text-sm  capitalize">
                {tokenName}
              </p>
            </div>
          </div>

          <div className=" relative">
            <div className=" opacity-60 relative z-10 border  border-[#FFFFFF29] p-3 rounded-[8px] mt-1 flex items-center justify-between">
              <span className="text-[#FFFFFFA3] font-semibold  text-base">
                Old Price
              </span>
              <span className="text-[#FFFFFF] text-base font-normal">
                ${oldPrice}
              </span>
            </div>

            <div
              className="z-[10] absolute flex items-center justify-center w-[32px] h-[32px] rounded-full p-1 border border-[#FFFFFF29] bg-[#16171E] !backdrop-blur-md"
              style={{
                top: "100%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <ArrowDown size={16} />
            </div>
          </div>

          <div className="relative  border  border-[#FFFFFF29] p-3 rounded-[8px] mt-1 flex items-center justify-between">
            <span className="text-[#FFFFFFA3] font-semibold  text-base">
              New Price
            </span>
            <span className="text-[#FFFFFF] text-base font-normal">
              ${newPrice}
            </span>
          </div>
        </div>

        <HorizontalLine />

        <div className="my-4 flex items-center justify-between">
          <span className=" text-[#FFFFFFA3] font-semibold text-sm">
            Total Amount
          </span>
          <span className=" text-[#FFFFFF] font-normal text-sm">
            ${totalAmount}
          </span>
        </div>
        <HorizontalLine />

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
            Update via Bluff
          </Button>

          <p className="text-center text-sm text-[#FFFFFFA3] mt-1">
            Update on X by tagging Bluff!
          </p>
        </div>
      </div>
    </CommonModal>
  );
};

export default ConfirmUpdate;
