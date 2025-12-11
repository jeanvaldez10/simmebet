/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Image from "next/image";
import { ConnectButton } from "@/components/ConnectButton";

interface WelcomeBluffModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
}
const WelcomeBluffModal = ({
  isOpen,
  onClose,
  setAuthModal,
}: WelcomeBluffModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-sm"
      className="rounded-md"
    >
      <div className="py-2 px-4 flex flex-col gap-2">
        <div className="mx-auto">
          <Image
            src={"/images/avatar.png"}
            className="rounde-full mb-4"
            width={100}
            height={100}
            alt="user_profile"
          />
        </div>
        <h4 className="text-[36px] leading-tight font-semibold text-center">
          Welcome to Bluff
        </h4>
        <p className="text-[#FFFFFFA3] text-center">
          Connect your wallet for fully use our platform
        </p>

        <div className="flex gap-2 flex-col">
          <ConnectButton isWalletBalanceShow={false} usdcBalance={0}>
            <Button
              variant="secondary"
              fullWidth
              className="text-center mt-2 py-3"
              onClick={() => {
                setAuthModal("none");
              }}
            >
              Connect Wallet
            </Button>
          </ConnectButton>
          <Button
            onClick={() => {
              setAuthModal("none");
            }}
            variant="primary"
            fullWidth
            className="text-center mt-2 py-3"
          >
            Skip it
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeBluffModal;
