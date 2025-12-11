import React, { useEffect, useState } from "react";
import Image from "next/image";
import LinkIcon from "@/../public/images/LinkIcon";
import {
  marketService,
  type UserActivityWithUser,
} from "@/services/marketService";
// import { formatTokenDeltas } from "@/utils/marketSlug";
import NotFound from "@/components/shared/not-found";

// const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;

// const formatActivityDisplay = (activity: UserActivityWithUser): { action: string; change: string } => {
//   const details = activity.details as Record<string, unknown>;
//   const tokenDeltas = details?.tokenDeltas as { yesDelta?: number; noDelta?: number; usdcDelta?: number };
  
//   // Handle different activity types with consistent formatting
//   switch (activity.action) {
//     case "PLACE_BET_YES":
//       return {
//         action: "placed a YES bet",
//         change: tokenDeltas ? formatTokenDeltas(
//           tokenDeltas.yesDelta || 0,
//           tokenDeltas.noDelta || 0, 
//           tokenDeltas.usdcDelta || 0
//         ) : formatCurrency(parseFloat(details?.amount as string || "0"))
//       };
      
//     case "PLACE_BET_NO":
//       return {
//         action: "placed a NO bet", 
//         change: tokenDeltas ? formatTokenDeltas(
//           tokenDeltas.yesDelta || 0,
//           tokenDeltas.noDelta || 0, 
//           tokenDeltas.usdcDelta || 0
//         ) : formatCurrency(parseFloat(details?.amount as string || "0"))
//       };
      
//     case "CASHOUT":
//       return {
//         action: "cashed out",
//         change: `$${parseFloat(details?.amount as string || "0").toFixed(2)}`
//       };
      
//     case "UPDATE_POSITION":
//     default:
//       if (tokenDeltas) {
//         const formattedDeltas = formatTokenDeltas(
//           tokenDeltas.yesDelta || 0,
//           tokenDeltas.noDelta || 0, 
//           tokenDeltas.usdcDelta || 0
//         );
//         return {
//           action: "updated position",
//           change: formattedDeltas || "0"
//         };
//       }
      
//       // Fallback for activities without token deltas
//       const amount = parseFloat(details?.amount as string || "0");
//       return {
//         action: "updated position",
//         change: amount > 0 ? `$${amount.toFixed(2)}` : "0"
//       };
//   }
// };

interface ActivityItemProps {
  activity: UserActivityWithUser;
  yesSideName?: string;
  noSideName?: string;
}

interface UserActivityTabProps {
  marketId: string;
  yesSideName?: string;
  noSideName?: string;
}

const getActivityTypeText = (action: string) => {
  switch (action.toUpperCase()) {
    case "PLACE_BET_YES":
    case "PLACE_BET_NO":
    case "SWAP_TOKENS":
      return "Placed Bet";
    case "CASHOUT":
    case "CASH_OUT":
      return "Cashed Out";
    case "UPDATE_POSITION":
    case "UPDATE_BET":
      return "Updated Position";
    case "ADD_LP":
      return "Added LP";
    case "REMOVE_LP":
      return "Removed LP";
    default:
      return action;
  }
};

const getActivityTypeColor = (action: string) => {
  switch (action.toUpperCase()) {
    case "PLACE_BET_YES":
    case "PLACE_BET_NO":
    case "SWAP_TOKENS":
      return "text-[#00D77F]"; // Green
    case "CASHOUT":
    case "CASH_OUT":
      return "text-[#FF4D4D]"; // Red
    case "UPDATE_POSITION":
    case "UPDATE_BET":
      return "text-[#4D9FFF]"; // Blue
    case "ADD_LP":
      return "text-[#00D77F]"; // Green
    case "REMOVE_LP":
      return "text-[#FF4D4D]"; // Red
    default:
      return "text-[#00D77F]";
  }
};

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, yesSideName = "YES", noSideName = "NO" }) => {
  const details = activity.details as Record<string, unknown>;
  const txHash = details?.txHash as string | null;
  
  // Extract belief with multiple fallbacks
  let belief: number | null = null;
  if (typeof details?.belief === 'number') {
    belief = details.belief;
  } else if (typeof details?.beliefPercentage === 'number') {
    belief = details.beliefPercentage;
  } else if (typeof details?.newBelief === 'number') {
    belief = details.newBelief;
  } else if (typeof details?.odds === 'number') {
    // For LP operations (ADD_LP/REMOVE_LP), odds is stored directly
    belief = details.odds as number;
  } else if (typeof details?.targetOdds === 'number') {
    // For SWAP_TOKENS, targetOdds is already the belief percentage (0-100)
    // 0% = betting on NO, 100% = betting on YES
    belief = details.targetOdds as number;
  }
  
  // Add logging for debugging if belief couldn't be extracted (but only in development)
  if ((belief === null || !isFinite(belief)) && process.env.NODE_ENV === 'development') {
    console.warn('[MarketActivityTab] Could not extract valid belief from activity:', {
      activityId: activity.id,
      action: activity.action,
      availableFields: Object.keys(details),
      details
    });
  }
  
  // Extract previous belief for updated positions
  let previousBelief: number | null = null;
  if (typeof details?.previousBelief === 'number') {
    previousBelief = details.previousBelief;
  } else if (typeof details?.previousBeliefPercentage === 'number') {
    previousBelief = details.previousBeliefPercentage;
  } else if (typeof details?.oldBelief === 'number') {
    previousBelief = details.oldBelief;
  }
  
  const tokenDeltas = details?.tokenDeltas as { yesDelta?: number; noDelta?: number; usdcDelta?: number } | null;
  
  const activityText = getActivityTypeText(activity.action);
  const activityColor = getActivityTypeColor(activity.action);
  
  // Get USDC amount
  let usdcAmount = "0.00";
  
  // For UPDATE_BET/UPDATE_POSITION, show the actual cost (amountIn) even if small
  // This represents the real USDC spent on the transaction
  if (details?.amountIn !== undefined && details.amountIn !== null) {
    const amountIn = parseFloat(details.amountIn as string);
    // Round to nearest cent, but show at least 0.01 if > 0
    usdcAmount = amountIn > 0 && amountIn < 0.01 
      ? "0.01" 
      : amountIn.toFixed(2);
  } else if (tokenDeltas?.usdcDelta && Math.abs(tokenDeltas.usdcDelta) > 0) {
    usdcAmount = Math.abs(tokenDeltas.usdcDelta).toFixed(2);
  } else if (details?.amount) {
    usdcAmount = parseFloat(details.amount as string || "0").toFixed(2);
  }
  
  // Format token deltas for display
  let tokenDeltaDisplay = "";
  if (tokenDeltas) {
    const parts = [];
    if (tokenDeltas.yesDelta !== undefined && tokenDeltas.yesDelta !== 0) {
      const sign = tokenDeltas.yesDelta > 0 ? "+" : "";
      parts.push(`${sign}${tokenDeltas.yesDelta.toFixed(2)} ${yesSideName}`);
    }
    if (tokenDeltas.noDelta !== undefined && tokenDeltas.noDelta !== 0) {
      const sign = tokenDeltas.noDelta > 0 ? "+" : "";
      parts.push(`${sign}${tokenDeltas.noDelta.toFixed(2)} ${noSideName}`);
    }
    tokenDeltaDisplay = parts.join(", ");
  }
  
  // Format the belief display
  let beliefDisplay = "";
  const amountInValue = parseFloat(details?.amountIn as string || "0");
  
  // Handle LP activities specially
  if (activity.action === "ADD_LP" || activity.action.toUpperCase() === "ADD_LP") {
    if (belief !== null && isFinite(belief)) {
      beliefDisplay = `$${usdcAmount} @ ${belief}% Belief`;
    } else {
      beliefDisplay = `$${usdcAmount}`;
    }
  } else if (activity.action === "REMOVE_LP" || activity.action.toUpperCase() === "REMOVE_LP") {
    // For removing LP, just show the message or a simple display
    beliefDisplay = details?.message as string || "Liquidity Removed";
  } else if ((activity.action === "UPDATE_BET" || activity.action === "UPDATE_POSITION") && amountInValue === 0) {
    // Position shift without adding capital
    if (belief !== null && isFinite(belief)) {
      beliefDisplay = `Position Shifted to ${belief}% Belief`;
    } else {
      beliefDisplay = `Position Shifted`;
    }
  } else if (activity.action === "UPDATE_POSITION" && previousBelief !== null && belief !== null) {
    beliefDisplay = `From ${previousBelief}% to ${belief}% Belief`;
  } else if ((activity.action === "UPDATE_BET" || activity.action === "UPDATE_POSITION") && belief !== null && isFinite(belief)) {
    // Update bet with capital added
    beliefDisplay = `Added $${usdcAmount} @ ${belief}% Belief`;
  } else if (belief !== null && isFinite(belief)) {
    // Regular bet (PLACE_BET, SWAP_TOKENS, etc.)
    beliefDisplay = `$${usdcAmount} @ ${belief}% Belief`;
  } else {
    // Fallback when no belief is available - show token deltas if available
    if (activity.action === "SWAP_TOKENS" && tokenDeltas) {
      const parts = [];
      if (tokenDeltas.yesDelta && tokenDeltas.yesDelta > 0) {
        parts.push(`${tokenDeltas.yesDelta.toFixed(2)} ${yesSideName}`);
      }
      if (tokenDeltas.noDelta && tokenDeltas.noDelta > 0) {
        parts.push(`${tokenDeltas.noDelta.toFixed(2)} ${noSideName}`);
      }
      if (parts.length > 0) {
        beliefDisplay = `$${usdcAmount} → ${parts.join(" + ")}`;
      } else {
        beliefDisplay = `$${usdcAmount}`;
      }
    } else {
      beliefDisplay = `$${usdcAmount}`;
    }
  }
  
  return (
    <div className="bg-[#16171E52] rounded-[20px] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border border-[#FFFFFF29] mb-2">
      <Image
        src={activity.user?.avatar || "/images/avatar.png"}
        alt={`${activity.user?.username || "Anonymous"}'s avatar`}
        width={48}
        height={48}
        className="rounded-full h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        {/* Username */}
        <div className="text-white text-[15px] sm:text-[17px] font-semibold leading-tight truncate">
          {activity.user?.username || "Anonymous"}
        </div>
        
        {/* Activity Type */}
        <div className={`${activityColor} text-[12px] sm:text-[13px] font-medium leading-tight mt-0.5 truncate`}>
          {activityText}
        </div>
      </div>
      
      {/* Right side info */}
      <div className="text-right flex-shrink-0 max-w-[45%] sm:max-w-none">
        {/* Amount and belief */}
        <div className="text-white text-[13px] sm:text-[15px] font-semibold leading-tight break-words">
          {beliefDisplay}
        </div>
        
        {/* Token deltas */}
        {tokenDeltaDisplay && (
          <div className="text-[#878787] text-[11px] sm:text-[13px] leading-tight mt-0.5 break-words">
            {tokenDeltaDisplay}
          </div>
        )}
      </div>
      
      {/* Icon */}
      <a
        href={txHash ? `https://arbiscan.io/tx/${txHash}` : "#"}
        target={txHash ? "_blank" : "_self"}
        rel={txHash ? "noopener noreferrer" : undefined}
        className="flex-shrink-0 text-[#878787] hover:text-white transition-colors hidden sm:block"
        aria-label={txHash ? "View transaction on Arbiscan" : "View details"}
      >
        <LinkIcon size={20} />
      </a>
    </div>
  );
};

export const MarketActivityTab: React.FC<UserActivityTabProps> = ({
  marketId,
  yesSideName,
  noSideName,
}) => {
  const [activities, setActivities] = useState<UserActivityWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);
  const limit = 10;

  useEffect(() => {
    async function fetchActivities() {
      try {
        setIsLoading(true);
        const data = await marketService.getMarketActivities(marketId, currentPage, limit);
        setActivities(data.activities);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();
  }, [marketId, currentPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#16171E52] rounded-[20px] p-4 h-[80px] border border-[#FFFFFF29]" />
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <NotFound
        className="md:mt-[-5px] mt-[-3px]"
        imageURL="/market_activity.png"
        heading="There are no activities yet"
        desc="Be the first one to buy shares of this market"
        isButtonShow={false}
      />
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} yesSideName={yesSideName} noSideName={noSideName} />
        ))}
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6 pt-4 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={!pagination.hasPrev}
            className="px-3 sm:px-4 py-2 bg-[#1A1B23] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2A2B33] transition-colors text-sm"
          >
            Previous
          </button>
          
          <span className="text-[#878787] text-xs sm:text-sm px-2">
            Page {currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!pagination.hasNext}
            className="px-3 sm:px-4 py-2 bg-[#1A1B23] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2A2B33] transition-colors text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

