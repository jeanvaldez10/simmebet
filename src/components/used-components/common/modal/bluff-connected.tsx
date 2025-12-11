/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Image from "next/image";

interface WelcomebluffModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
}
const ConnectedbluffModal = ({
  isOpen,
  onClose,
  setAuthModal,
}: WelcomebluffModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="max-w-sm"
      className="rounded-md"
    >
      <div className="py-2 px-4 flex flex-col gap-2">
        <div className="relative flex items-center justify-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden z-10">
            <Image
              src="/images/avatar.png"
              alt="user_profile"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="w-24 h-24 rounded-full bg-[#5567f4] flex items-center justify-center border-black border-l-2 -ml-6 z-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.79V6.21A2.21 2.21 0 0018.79 4H5.21A2.21 2.21 0 003 6.21v11.58A2.21 2.21 0 005.21 20h13.58A2.21 2.21 0 0021 17.79V12.79z"
              />
              <circle cx="17" cy="14" r="1.5" fill="white" />
            </svg>
          </div>
        </div>

        <h4 className="text-[36px] leading-tight font-semibold text-center">
          Connected!
        </h4>
        <p className="text-[#FFFFFFA3] text-center">
          Your Bluff account and Wallet are now connected. You can bet, deposit,
          withdraw, directly with your X account or using this platform.
        </p>

        <div className="flex gap-2 flex-col">
          <Button
            onClick={() => {
              setAuthModal("none");
            }}
            variant="primary"
            fullWidth
            className="text-center mt-2 py-3"
          >
            Explore the platform
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConnectedbluffModal;
