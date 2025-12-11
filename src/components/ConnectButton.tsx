"use client";

import { useAppKit } from "@reown/appkit/react";
import Image from "next/image";
import { useAccount } from "wagmi";

export const ConnectButton = ({
  usdcBalance,
  isWalletBalanceShow = true,
  buttonText = "Connect Wallet",
  children,
  onConnect,
}: {
  usdcBalance?: number;
  isWalletBalanceShow?: boolean;
  buttonText?: string;
  children?: React.ReactNode;
  onConnect?: () => void;
}) => {
  const { isConnected, address } = useAccount();
  const c = useAppKit();

  return (
    <div className="flex items-center gap-1">
      {isWalletBalanceShow && (
        <>
          {isConnected && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 ml-2">
                <Image
                  src="/images/usdc.svg"
                  alt="USDC"
                  width={20}
                  height={20}
                />
                <p className="text-white font-semibold  text-sm sm:text-base">
                  {usdcBalance?.toFixed(2)}
                </p>
              </div>

              <button
                className="py-1 px-2 rounded-[80px] border border-[#FFFFFF52] !cursor-pointer text-whit text-xs sm:text-sm font-semibold"
                onClick={() => c.open()}
              >
                {address?.slice(0, 5)}...{address?.slice(-4)}
              </button>
            </div>
          )}
        </>
      )}

      {!children && (
        <>
          {!isConnected && (
            <button
              className="py-1 px-2 rounded-[80px] border border-[#FFFFFF52] !cursor-pointer text-whit text-sm font-semibold"
              onClick={async () => {
                await c.open();
                if (onConnect) {
                  onConnect();
                }
              }}
            >
              {buttonText}
            </button>
          )}
        </>
      )}

      {children && (
        <div
          className="w-full"
          onClick={async () => {
            await c.open();
            if (onConnect) {
              onConnect();
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
