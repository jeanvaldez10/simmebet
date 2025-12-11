/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import { ConnectButton } from "@/components/ConnectButton";
import { useAccount, useReadContract } from "wagmi";
import { ARBITRUM_USDC_CONTRACT_ADDRESS } from "@/constants";
import { erc20Abi } from "viem";
import Button from "@/components/Button";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  setAuthModal: any;
}

const ConnectWalletModal = ({
  isOpen,
  onClose,
  setAuthModal,
}: ConnectWalletModalProps) => {
  const { address } = useAccount();
  const { data: usdcTokenBalance } = useReadContract({
    address: ARBITRUM_USDC_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-4xl">
      <div className="relative overflow-hidden">
        {/* Background image that goes edge to edge */}
        <div className="absolute inset-0">
          <Image
            src="/images/modal-frame.png"
            alt="Betting interface preview"
            fill
            className="object-cover"
          />
        </div>

        {/* Right side content with curved background */}
        <div className="relative h-full flex justify-end">
          <div className="w-full md:w-96 h-full bg-white/95 backdrop-blur-sm rounded-l-3xl shadow-2xl flex flex-col">
            <div className="py-2 px-4 flex flex-col gap-2 h-full">
              <div className="mb-auto">
                <Image
                  src="/logo.png"
                  alt="Bluff"
                  width={200}
                  height={150}
                  className="h-14 w-auto mb-10"
                />
              </div>

              <div>
                <div className="flex flex-col gap-4 my-8">
                  <h2 className="text-[40px] leading-tight font-bold">
                    Connect Wallet
                  </h2>
                  <p className="text-gray-400 text-lg">
                    You have successfully signed up for bluff! Now connect your
                    wallet to enable betting
                  </p>
                </div>
                <div className="relative">
                  <ConnectButton
                    buttonText="Connect"
                    usdcBalance={
                      (parseFloat(usdcTokenBalance?.toString() || "0") / 1e6) *
                      1
                    }
                  />
                </div>

                <ConnectButton isWalletBalanceShow={false} usdcBalance={0}>
                  <Button
                    variant="secondary"
                    fullWidth
                    className="text-center mt-2 py-3"
                    onClick={() => {
                      setAuthModal("none");
                    }}
                  >
                    Connect
                  </Button>
                </ConnectButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;
