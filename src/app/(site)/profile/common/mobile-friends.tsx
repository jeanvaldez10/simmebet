import { IProfileFriends } from "@/hooks/use-profile-friends";
import Image from "next/image";
import React from "react";

const MobileFriends = (headers: IProfileFriends) => {
  const { name, image, profitLoss, volume } = headers;

  return (
    <div className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-[16px] overflow-hidden bg-gray-700 flex-shrink-0">
            <Image
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              width={40}
              height={40}
            />
          </div>

          <h2 className="text-base font-semibold">{name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[#FFFFFFA3] text-sm mb-1">Profit/Loss</p>
          <p className="text-white font-semibold text-md">{profitLoss}</p>
        </div>
        <div>
          <p className="text-[#FFFFFFA3] text-sm mb-1">Volume Traded</p>
          <p className="text-white font-semibold text-md">{volume}</p>
        </div>
        <div
          style={{
            alignSelf: "flex-end",
          }}
        >
          <button
            className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
            aria-label="View Market"
            tabIndex={0}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFriends;
