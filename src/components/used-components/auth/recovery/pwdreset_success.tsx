/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Image from "next/image";

interface PasswordResetSucessModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
}
const PasswordResetSucessModal = ({
  isOpen,
  onClose,
  setAuthModal,
}: PasswordResetSucessModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-md">
      <div className="py-2 px-4 flex flex-col gap-2">
        <div className="mx-auto">
          <Image
            src={"/images/avatar.png"}
            className="rounde-full"
            width={100}
            height={100}
            alt="user_profile"
          />
        </div>
        <h4 className="text-[36px] leading-tight mt-4 text-center font-semibold">
          Password Reset
        </h4>
        <p className="text-[#FFFFFFA3] text-center">
          your password has been successfully reset!
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="primary"
            fullWidth
            className="text-center py-3"
            onClick={() => {
              setAuthModal("login");
            }}
          >
            Return to login
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordResetSucessModal;
