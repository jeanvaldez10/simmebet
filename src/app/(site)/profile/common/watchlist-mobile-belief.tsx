import { CircularProgress } from "@/components/common/CircularProgress";
import ShareIcon from "@/components/shared/share-icon";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const WatchListMobileBelief = () => {
  const type = "buy";
  return (
    <div className="bg-[#16171E] rounded-[16px] overflow-hidden w-full relative p-4">
      <div className=" flex items-start justify-between gap-3 mb-4">
        <div className="flex gap-3 items-center">
          <div className="w-20 h-20 rounded-[16px] overflow-hidden flex-shrink-0">
            <Image
              src={"/images/football.png"}
              alt={"football"}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <h3 className="font-geist font-semibold text-base leading-[140%] tracking-[-0.02em]">
            <Link href={`#`}>
              Will Spain beat Germany on the UEFA finals this year?
            </Link>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#FFFFFF52] hover:text-white" />
          <div style={{ "--icon-stroke": "#FFFFFF52" } as React.CSSProperties}>
            <ShareIcon width="20" height="20" />
          </div>
        </div>
      </div>

      <div className=" grid  grid-cols-3 gap-3 mb-4">
        <div>
          <p className=" text-xs text-[#FFFFFFA3]">Volume</p>
          <p className=" text-sm text-[#FFFFFFA3] font-semibold">$32m</p>
        </div>
        <div>
          <p className=" text-xs text-[#FFFFFFA3]">Total Bets</p>
          <p className=" text-sm text-[#FFFFFFA3] font-semibold">467</p>
        </div>
        <div>
          <CircularProgress
            positivePercentage={30}
            negativePercentage={70}
            size={35}
            strokeWidth={3}
          />
        </div>
      </div>

      {type === "buy" && (
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`#`}
            className="bg-[#46FD84] py-2 px-3 h-[46px] rounded-[80px] text-black flex items-center justify-center gap-1 font-geist font-semibold text-[14px] cursor-pointer"
          >
            Buy Yes
            <span className="bg-[#33E06E] px-2 py-[2px] rounded-[80px]">
              70%
            </span>
          </Link>
          <Link
            href={`#`}
            className="bg-[#FD465C] rounded-[80px] text-black py-2 px-3  h-[46px]  flex items-center justify-center gap-1 font-geist font-semibold text-[14px]  cursor-pointer"
          >
            Buy No
            <span className="bg-[#D32B3F] px-2 py-[2px] rounded-[80px]">
              70%
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WatchListMobileBelief;
