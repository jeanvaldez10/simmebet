import React from "react";

import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import SuccessModalContent from "./success-modal-content";

const MarketBetClaim = ({
  state,
  handleClose,
}: {
  state: "pending" | "success" | "error" | null;
  handleClose: () => void;
}) => {
  return (
    <React.Fragment>
      {state === "success" && (
        <SuccessModal
          type="option"
          title="Order confirmed"
          subtitle={`Order confirmed for XYZ at ZYZ.`}
          isPositive={true}
          buttonText="Close"
          onButtonClick={handleClose}
          onClose={handleClose}
          width="w-[300px]"
        >
          <SuccessModalContent
            title="Claim Confirmed"
            desc="Winnings claimed successfully."
            amount={1}
            onClick={handleClose}
            onFlexClick={handleClose}
            isClaim
          />
        </SuccessModal>
      )}

      {state === "pending" && (
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
      {state === "error" && (
        <SuccessModal
          type="option_fail"
          title="Something went wrong"
          subtitle="Please try again or contact our support for further help."
          isPositive={false}
          buttonText="Try again"
          onButtonClick={handleClose}
          onClose={handleClose}
          width="w-[300px]"
        />
      )}
    </React.Fragment>
  );
};

export default MarketBetClaim;
