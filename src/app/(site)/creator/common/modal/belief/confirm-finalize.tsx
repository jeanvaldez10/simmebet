import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import Button from "@/components/Button";
import CommonModal from "@/components/modals";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useState } from "react";
import { useBeliefForm } from "./store/create-context";

const ConfirmFinalize = ({ onClose }: { onClose: () => void }) => {
  const { finalizeData, resetFinalizeData } = useBeliefForm();

  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);

  const gradient = finalizeData.result
    ? "linear-gradient(#33E06E 5%, #16171E 0%)"
    : "linear-gradient(#D32B3F 5%, #16171E 0%)";

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

  return (
    <CommonModal
      onClose={() => {
        onClose();
        resetFinalizeData();
      }}
      className="md:w-[364px] overflow-y-auto max-h-[95vh]"
    >
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Belief finalized!"
          subtitle={`You have finalized your belief market`}
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
      <div>
        <h2 className="text-2xl font-semibold text-[#F2F2FD]">
          Confirm finalization
        </h2>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden my-4">
          <div
            className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
            style={{ background: gradient }}
          />
          <div
            className={`flex items-center gap-4 rounded-lg px-0 py-2 relative z-10`}
          >
            <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
              <Image
                src={finalizeData.image}
                alt={"TKN"}
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-base font-semibold text-white">
              {finalizeData.name}
            </h3>
          </div>
          <div className=" relative z-10 border  border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
            <span className="text-[#FFFFFFA3] font-semibold  text-base">
              Result
            </span>
            <span
              className={cn(
                "text-base font-normal",
                finalizeData.result ? "text-[#36FD68]" : "text-[#D32B3F]"
              )}
            >
              {finalizeData.result ? "Yes" : "No"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 my-4">
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              resetFinalizeData();
            }}
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
      </div>
    </CommonModal>
  );
};

export default ConfirmFinalize;
