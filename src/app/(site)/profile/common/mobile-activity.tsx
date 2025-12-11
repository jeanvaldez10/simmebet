import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { IProfileActivity } from "@/hooks/use-profile-activity";
import { getActivityTypeIcon } from "./table-row/activity-row";


const MobileActivity = (activity: IProfileActivity) => {
  const router = useRouter();
  const { type, message, amount, when, txHash, marketId } = activity;
  const action = type.toUpperCase();

  return (
    <div className="bg-[#16171E] rounded-[16px] p-4">
      <div className="flex items-center gap-2 w-full col-span-1">
        <Image
          src={getActivityTypeIcon(action)}
          alt="Activity Icon"
          className="w-5 h-5 flex-shrink-0"
          loading="lazy"
          width={20}
          height={20}
        />
        <div className="text-sm text-[#FFFFFF] flex-1 min-w-0">{message}</div>
      </div>
      
      {/* Amount and timestamp row */}
      <div className="flex items-center justify-between text-sm mt-3">
        <div className="text-[#FFFFFFA3]">
          <span className="text-xs text-[#878787] block">Amount</span>
          <span className="text-[#FFFFFF] text-sm font-semibold">
            {amount.startsWith('$') || amount.includes('YES') || amount.includes('NO') ? amount : `$${amount}`}
          </span>
        </div>
        <div className="text-[#FFFFFFA3] text-right">
          <span className="text-xs text-[#878787] block">When</span>
          <span className="text-[#FFFFFF] text-sm font-semibold">{when}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        {txHash && (
          <a
            href={`https://arbiscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52] px-3 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#FFFFFF1A] flex-1 text-center"
            aria-label="View on Arbiscan"
          >
            Arbiscan
          </a>
        )}
        <button
          className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52] px-3 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#FFFFFF1A] flex-1"
          aria-label="View Market"
          tabIndex={0}
          onClick={() => marketId ? router.push(`/market/${marketId}`) : null}
          disabled={!marketId}
        >
          View Market
        </button>
      </div>
    </div>
  );
};

export default MobileActivity;
