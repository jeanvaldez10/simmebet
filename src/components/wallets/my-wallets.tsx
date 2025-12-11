import React from "react";
import CommonModal from "../modals";
import Button from "../Button";
import Image from "next/image";
import HorizontalLine from "../common/HorizontalLine";
import { LogOut } from "lucide-react";
import useWallet from "./hooks/use-wallet";
import { useAuthContext } from "@/context/AuthProvider";
import { ConnectButton } from "../ConnectButton";
import { useDisconnect } from "wagmi";

export const addressShortener = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const MyWallets = ({
  onClose,
  onPrivateKey,
  onAddWallet,
}: {
  onClose: () => void;
  onPrivateKey: () => void;
  onAddWallet: () => void;
}) => {
  const { dbUser } = useAuthContext();
  const { data, isPending } = useWallet({ userId: dbUser?.id || "" });
  const { disconnectAsync } = useDisconnect();

  return (
    <CommonModal onClose={onClose} className="!w-[364px]">
      <div>
        <h2 className="text-[#F2F2FD] text-2xl font-semibold">My Wallets</h2>

        {isPending ? (
          <div className="mt-6">
            {[...Array(2).keys()].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-[45px] bg-[#1E1E2F] rounded-[80px] flex items-center justify-between px-3 my-1 py-3" />
                {index < 2 && <HorizontalLine />}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            {data?.map((wallet, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 py-3  w-full cursor-pointer"
                    onClick={() => {
                      console.log(`Connecting to ${wallet.name}`);
                    }}
                  >
                    <div className=" flex items-center gap-2 w-full">
                      <Image
                        src={wallet.icon}
                        alt={`${wallet.name} icon`}
                        className="w-6 h-6"
                        width={24}
                        height={24}
                      />

                      <div className="flex flex-col w-full items-start">
                        <span className="text-[#FFFFFF] text-sm  font-semibold">
                          {wallet.name}
                        </span>
                        <span className="text-[#FFFFFFA3] text-xs font-normal">
                          {addressShortener(wallet.address)}
                        </span>
                      </div>
                    </div>
                  </button>

                  <div className=" flex items-center gap-2">
                    {wallet.name === "Bluff Wallet" && (
                      <Button
                        variant="ghost"
                        className="h-[25px] !text-[#fff] !text-xs !font-semibold whitespace-nowrap"
                        onClick={onPrivateKey}
                      >
                        Private Key
                      </Button>
                    )}
                    {wallet.name !== "Bluff Wallet" && (
                      <button
                        onClick={() => disconnectAsync()}
                        className="pointer"
                      >
                        <LogOut className="w-5 h-5 text-[#FD3748]" />
                      </button>
                    )}
                  </div>
                </div>

                <HorizontalLine />
              </div>
            ))}
          </div>
        )}

        <ConnectButton isWalletBalanceShow={false} usdcBalance={0}>
          <Button
            variant="primary"
            className="w-full h-[46px] mt-5 !text-sm !font-semibold"
            onClick={onAddWallet}
            disabled={isPending}
          >
            Add Wallet
          </Button>
        </ConnectButton>
      </div>
    </CommonModal>
  );
};

export default MyWallets;
