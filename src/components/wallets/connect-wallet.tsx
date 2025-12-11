import React from "react";
import CommonModal from "../modals";
import Image from "next/image";
import HorizontalLine from "../common/HorizontalLine";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "../Button";

const wallets = [
  {
    name: "Bluff Wallet",
    icon: "/simulcrum.png",
    isDetected: true,
  },
  {
    name: "MetaMask",
    icon: "/metamask.png",
    isDetected: true,
  },
  {
    name: "Coinlist",
    icon: "/coinlist.png",
  },
  {
    name: "Torus",
    icon: "/torus.png",
  },
  {
    name: "Bluff Wallet",
    icon: "/simulcrum.png",
    isDetected: true,
  },
];

const ConnectWallet = ({
  onClose,
  onBack,
}: {
  onClose: () => void;
  onBack: () => void;
}) => {
  const [showMore, setShowMore] = React.useState(false);
  const displayedWallets = showMore ? wallets : wallets.slice(0, 4);

  return (
    <CommonModal onClose={onClose} className="!w-[364px]">
      <div>
        <h2 className="text-[#F2F2FD] text-2xl font-semibold">
          Connect Wallet
        </h2>

        <div className=" mt-4">
          {displayedWallets.map((wallet, index) => (
            <div key={index}>
              <button
                className="flex items-center gap-2 justify-between p-3  w-full cursor-pointer"
                onClick={() => {
                  if (wallet.isDetected) {
                    console.log(`Connecting to ${wallet.name}`);
                  }
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
                  <span className="text-[#FFFFFF] text-sm  font-semibold">
                    {wallet.name}
                  </span>
                </div>

                {wallet.isDetected && (
                  <span className="bg-[#46FD8452] text-xs text-[#FFFFFF] py-[3px] px-2 rounded-2xl">
                    Detected
                  </span>
                )}
              </button>

              <HorizontalLine />
            </div>
          ))}
        </div>

        <button
          className=" flex items-center  mt-2 cursor-pointer ml-3"
          onClick={() => setShowMore(!showMore)}
        >
          <span className="text-[#fff] text-xs font-semibold">
            {showMore ? "Show Less" : "Show more"}
          </span>
          <ChevronDown
            className={cn("text-[#FFFFFF52] w-5 h-5 ml-2", {
              "rotate-180": showMore,
            })}
          />
        </button>

        <Button
          variant="ghost"
          className="w-full h-[46px] mt-4"
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </CommonModal>
  );
};

export default ConnectWallet;
