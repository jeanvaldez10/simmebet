/* eslint-disable @typescript-eslint/no-explicit-any */
import SuccessModal, { PENDING_MESSAGES } from "@/app/(site)/options/common/success-modal";
import React from "react";

const Claim = ({ onClose, type }: { onClose: () => void; type: any }) => {
  return (
    <React.Fragment>
      {type === "option_pending" && (
        <SuccessModal
          type={type}
          title={PENDING_MESSAGES.TITLE}
          subtitle={PENDING_MESSAGES.SUBTITLE}
          isPositive={true}
          buttonText={PENDING_MESSAGES.BUTTON_TEXT}
          onButtonClick={() => {}}
          onClose={() => {}}
          width="w-[300px]"
        />
      )}

      {type === "option" && (
        <SuccessModal
          type={type}
          title="Order confirmed"
          subtitle={`Order confirmed for XYZ at YZX.`}
          isPositive={true}
          buttonText="Done"
          onButtonClick={onClose}
          onClose={onClose}
          secondaryButton={true}
          amount="$10000"
          width="w-[300px]"
        />
      )}
    </React.Fragment>
  );
};

export default Claim;
