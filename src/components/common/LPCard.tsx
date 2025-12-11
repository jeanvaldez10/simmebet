import React from "react";
import BeliefProgress from "@/app/(site)/profile/common/belief-progress";

interface LPCardProps {
  data: {
    totalLp: number;
    fees: number;
    time: string;
    yesPercent: number;
    noPercent: number;
  };
  onClose: () => void;
}

export const LPCard: React.FC<LPCardProps> = ({ data, onClose }) => {
  if (data.totalLp <= 0) {
    return null;
  }

  return (
    <div className="border border-[#FFFFFF29] p-4 rounded-[8px] w-full">
      <div className="flex items-center gap-2 justify-between flex-wrap">
        <div className=" gap-1 border border-[#FFFFFF29] rounded-[80px] py-1 px-2.5 text-sm font-normal flex items-center">
          <div className="bg-[#05B9FC] h-2 w-2 rounded-full" />
          <span className="text-[#FFFFFFA3]">Your LP:</span>
          <span className="text-[#fff]">${data.totalLp}</span>
        </div>
        <div className="flex items-center text-sm gap-1">
          <span className="text-[#FFFFFFA3]">Fees collected:</span>
          <span className="text-[#fff]">${data.fees}</span>
        </div>
        <button
          className="border border-[#FFFFFF52] text-xs text-[#FFFFFF]  rounded-[80px] px-3 py-1 cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-[70px_1fr_70px] gap-1 items-center w-full mt-3">
        <div className="flex flex-col text-sm  ">
          <span className="text-[#FFFFFFA3]">Holding</span>
          <span className="text-[#fff]">{data.noPercent}% No</span>
        </div>
        <BeliefProgress
          width="w-full"
          yes={data.yesPercent}
          no={data.noPercent}
        />
        <div className="flex text-sm  flex-col items-end justify-end">
          <span className="text-[#FFFFFFA3]">Holding</span>
          <span className="text-[#fff]">{data.yesPercent}% Yes</span>
        </div>
      </div>
    </div>
  );
};
