import { IProfileActivity } from "@/hooks/use-profile-activity";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export const getActivityTypeIcon = (action: string) => {
  if (action === "PLACE_BET_YES" || action === "PLACE_BET_NO") {
    return "/new-ticket.png";
  } else if (action === "CASH_OUT") {
    return "/close-ticket.png";
  } else if (action === "UPDATE_BET") {
    return "/update-ticket.png";
  } else if (action === "DEPOSIT") {
    return "/deposit.png";
  } else if (action === "WITHDRAWAL") {
    return "/withdraw.png";
  } else if (action === "ADD_LP") {
    return "/green-dollar.png";
  } else if (action === "REMOVE_LP") {
    return "/red-dollar.png";
  } else if (action === "EXERCISE_OPTION") {
    return "/exercise-option.png";
  } else if (action === "BOUGHT_OPTION") {
    return "/bought-option.png";
  }
  return "/new-ticket.png";
};


const ActivityRow = (activity: IProfileActivity) => {
  const router = useRouter();

  const { type, message, amount, when, txHash, marketId } = activity;
  const action = type.toUpperCase();

  return (
    <div className="text-[#FFFFFFA3] p-4 transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      {/* Mobile Layout - Stacked vertically */}
      <div className="flex flex-col space-y-3 md:hidden">
        {/* Activity description */}
        <div className="flex items-center gap-2">
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
        <div className="flex items-center justify-between text-sm">
          <div className="text-[#FFFFFFA3]">
            <span className="text-xs text-[#878787] block">Amount</span>
            <span className="text-[#FFFFFF]">
              {amount.startsWith('$') || amount.includes('YES') || amount.includes('NO') ? amount : `$${amount}`}
            </span>
          </div>
          <div className="text-[#FFFFFFA3] text-right">
            <span className="text-xs text-[#878787] block">When</span>
            <span className="text-[#FFFFFF]">{when}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
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

      {/* Desktop Layout - Grid */}
      <div className="hidden md:grid md:grid-cols-[2fr_100px_100px_1fr] lg:grid-cols-4">
        <div className="flex items-center gap-2 w-full col-span-1">
          <Image
            src={getActivityTypeIcon(action)}
            alt="Activity Icon"
            className="w-5 h-5"
            loading="lazy"
            width={20}
            height={20}
          />
          <div className="text-sm text-[#FFFFFF]">{message}</div>
        </div>

        <div className="col-span-1 flex items-center text-sm text-center justify-center">
          {amount.startsWith('$') || amount.includes('YES') || amount.includes('NO') ? amount : `$${amount}`}
        </div>

        <div className="col-span-1 text-sm flex items-center justify-center">
          {when}
        </div>

        <div className="flex items-center col-span-1 w-full justify-end text-sm whitespace-nowrap gap-2">
          {txHash && (
            <a
              href={`https://arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52] px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#FFFFFF1A]"
              aria-label="View on Arbiscan"
            >
              Arbiscan
            </a>
          )}
          <button
            className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52] px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#FFFFFF1A]"
            aria-label="View Market"
            tabIndex={0}
            onClick={() => marketId ? router.push(`/market/${marketId}`) : null}
            disabled={!marketId}
          >
            View Market
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityRow;
