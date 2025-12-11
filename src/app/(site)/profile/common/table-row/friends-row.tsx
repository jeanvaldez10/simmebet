import { IProfileFriends } from "@/hooks/use-profile-friends";
import Image from "next/image";
import React from "react";

const FriendsRow = (headers: IProfileFriends) => {
  const { name, image, profitLoss, volume } = headers;
  return (
    <div className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr_1fr] p-4  transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      <div className="flex items-center gap-3 w-full col-span-1">
        <div className="w-[30px] h-[30px] rounded-[16px] overflow-hidden bg-gray-800 flex-shrink-0">
          <Image
            src={image}
            alt={name}
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="font-medium">{name}</div>
      </div>

      <div className="col-span-1 flex items-center text-sm text-center justify-center">
        {profitLoss}
      </div>

      <div className="col-span-1 flex items-center text-sm text-center justify-center">
        ${volume}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
          aria-label="View Market"
          tabIndex={0}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default FriendsRow;
