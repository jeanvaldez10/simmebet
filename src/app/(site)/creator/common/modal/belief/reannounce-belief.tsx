import React, { useState } from "react";
import CommonModal from "@/components/modals";
import Image from "next/image";
import Button from "@/components/Button";
import HorizontalLine from "@/components/common/HorizontalLine";
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import { useBeliefForm } from "./store/create-context";

type ReAnnounceBeliefModalProps = {
  onClose: () => void;
};

const RenounceBelief: React.FC<ReAnnounceBeliefModalProps> = ({ onClose }) => {
  const { renounce } = useBeliefForm();
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

  const gradient = renounce.result
    ? "linear-gradient(#33E06E 5%, #16171E 0%)"
    : "linear-gradient(#D32B3F 5%, #16171E 0%)";

  return (
    <CommonModal
      onClose={onClose}
      className="md:w-[364px] overflow-y-auto max-h-[95vh]"
    >
      {modalState === "success" && (
        <SuccessModal
          type="option"
          title="Belief renounced!"
          subtitle={`You have renounced your belief market`}
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
          Renounce Belief
        </h2>

        <p>
          After renouncing a market you will no longer be able to make any
          changes.
        </p>

        <div className="flex flex-col gap-2 border p-4 mt-6 rounded-lg border-solid relative overflow-hidden border-[rgba(255,255,255,0.16)]">
          <div
            className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
            style={{ background: gradient }}
          />
          <div className="z-10">
            <div className={`flex items-center gap-4 rounded-lg relative z-10`}>
              <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
                <Image
                  src={renounce.image}
                  alt={"football"}
                  width={60}
                  height={60}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#F2F2FD]">
                  {renounce.name}
                </h3>
              </div>
            </div>
            <p className="text-[#FFFFFFA3] my-4 line-clamp-2 z-10`">
              {renounce.desc}
            </p>
            <p className="text-[#FFFFFFA3] z-10`">{renounce.date}</p>
          </div>
        </div>
        <div className="my-6">
          <HorizontalLine />
        </div>

        <div className="flex justify-between gap-4 items-center">
          <Button onClick={onClose} fullWidth variant="ghost">
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

export default RenounceBelief;
