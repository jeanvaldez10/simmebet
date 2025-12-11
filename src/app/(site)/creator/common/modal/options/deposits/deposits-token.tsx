import React, { useState } from "react";
import CommonModal from "@/components/modals";
import Image from "next/image";
import { IoIosArrowForward } from "react-icons/io";
import { Search } from "lucide-react";
import SupportedNetworks from "./supported-networks";

type DepositTokensModalProps = {
  onClose: () => void;
  onConfirm: (e: string) => void;
};

const DepositTokensModal: React.FC<DepositTokensModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const [search, setSearch] = useState("");

  return (
    <CommonModal
      onClose={onClose}
      className="md:w-[480px] overflow-y-auto max-h-[95vh]"
    >
      <div className="text-sm">
        <h2 className="text-3xl font-semibold text-[#F2F2FD]">
          Deposit Tokens
        </h2>
        <p className="text-[#FFFFFFA3] text-base">
          Select a token to deposit into your Bluff account
        </p>
        <SupportedNetworks
          networks={[
            { alt: "Arbitrum", src: "/arbitrum.png" },
            { alt: "Ethereum(Mainnet)", src: "/ether.png" },
          ]}
        />

        <div className={"flex items-center gap-4 mt-4"}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={"Search for a token"}
              className="pl-10 pr-4 py-2 text-sm bg-[#2E3144] text-[#FFFFFFA3]  rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600 h-[45px] placeholder:text-[#FFFFFFA3]"
            />
          </div>
        </div>

        <div className="max-h-[430px] overflow-y-auto mt-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="pointer border  text-[#FFFFFFA3] border-[#FFFFFF29] p-4 rounded-md relative overflow-hidden my-1"
              onClick={() => onConfirm("TKN")}
            >
              <div className="flex justify-between items-center">
                <div
                  className={`flex items-center gap-4 rounded-lg relative z-10`}
                >
                  <div className="h-11.5 w-11.5 overflow-hidden rounded-full">
                    <Image
                      src={"/images/cup.png"}
                      alt={"TKN"}
                      width={46}
                      height={46}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">TKN</h3>
                    <p className="text-xs font-normal text-[#FFFFFFA3]">
                      Token Name Here
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex flex-col">
                    <p className="text-xl font-semibold text-white">10.54</p>
                    <p className="text-xs text-right font-normal text-[#FFFFFFA3]">
                      $57.54
                    </p>
                  </div>
                  <IoIosArrowForward
                    size={20}
                    className="text-[#FFFFFF52] !cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CommonModal>
  );
};

export default DepositTokensModal;
