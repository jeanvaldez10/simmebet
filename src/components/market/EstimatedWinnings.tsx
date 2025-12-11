import React from "react";
import { formatBalance } from "@/utils/format";

interface EstimatedWinningsProps {
  currency0Balance: string | number | null;
  currency1Balance: string | number | null;
  initialValue: number;
  isEstimating: boolean;
  error: boolean;
  hideWinningsCards?: boolean;
  marketOdds?: number | null;
  belief?: number | null;
  persist?: boolean;
  showAdvanced?: boolean;
}

const EstimatedWinnings: React.FC<EstimatedWinningsProps> = ({
  currency0Balance,
  currency1Balance,
  initialValue,
  isEstimating,
  error,
  hideWinningsCards = false,
  marketOdds = null,
  belief = null,
  persist = false,
  showAdvanced = false,
}) => {
  const noValue = (Number(currency0Balance) || 0) * 2;
  const noNetChange = noValue - initialValue;

  const yesValue = (Number(currency1Balance) || 0) * 2;
  const yesNetChange = yesValue - initialValue;
  const isYesSelected = marketOdds !== null && belief !== null && belief >= marketOdds;

  return (
    <div className="flex flex-col gap-2 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)] mt-1">
      <span className="text-base text-[#FFFFFFA3] font-semibold">
        Potential Payout
      </span>
      {!hideWinningsCards && (
        <>
          {/* If No Wins Card */}
          {!isYesSelected && <div className="flex items-start justify-between rounded-lg">
            <div className="flex flex-col">
              {/* <span className="text-base text-[rgba(255,255,255,0.6)] font-semibold">If <span className="text-white">No</span> Wins</span> */}
              <span className={`text-[40px] font-semibold ${noNetChange < 0 ? 'text-[#FD3748]' : 'text-white'}`}>
                  {isEstimating ? (
                    <span className="text-[rgba(255,255,255,0.48)] text-sm">Calculating…</span>
                  ) : error ? (
                    <span className={`text-[${noNetChange > 0 ? 'rgba(51,224,110,0.9)' : 'rgba(255,96,96,0.9)'}`}>—</span>
                  ) : formatBalance(noValue.toFixed(2))
                }
                </span>
            </div>
            {/* <span className="text-base text-[rgba(255,255,255,0.6)] font-semibold">
              {noNetChange >= 0 ? "You Win" : "You Lose"}
            </span> */}
          </div>}

          {/* If Yes Wins Card */}
          {isYesSelected && <div className="flex items-start justify-between rounded-lg">
            <div className="flex flex-col">
              {/* <span className="text-base text-[rgba(255,255,255,0.6)] font-semibold">If <span className="text-white">You</span> Wins</span> */}
              <span className="text-[40px] font-semibold">
                  {isEstimating ? (
                    <span className="text-[rgba(255,255,255,0.48)] text-sm">Calculating…</span>
                    ) : error ? (
                      <span className="text-[rgba(255,255,255,0.48)]">—</span>
                    ) : (
                      <span className={`${yesNetChange >= 0 ? 'text-white' : 'text-[#FD3748]'}`}>{formatBalance(yesValue.toFixed(2))}</span>
                    )
                  }
                </span>
            </div>
            {/* <span className="text-base text-[rgba(255,255,255,0.6)] font-semibold">
              {yesNetChange >= 0 ? "You Win" : "You Lose"}
            </span> */}
          </div>}
        </>
      )}

      {/* New Position Mix Card - Only show when advanced is toggled */}
      {showAdvanced && <div className="p-3 rounded-lg border border-[rgba(255,255,255,0.16)] mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#FFFFFFA3] text-sm font-semibold">New Position Mix</span>
          <span className="text-sm font-semibold">
            {isEstimating ? (
              <span className="text-[rgba(255,255,255,0.48)]">Calculating…</span>
            ) : error ? (
              <span className="text-[rgba(255,96,96,0.9)]">—</span>
            ) : (
              (() => {
                if (!currency0Balance && !currency1Balance) return "—";
                try {
                  const noAmount = parseFloat(currency0Balance ? currency0Balance.toString() : "0");
                  const yesAmount = parseFloat(currency1Balance ? currency1Balance.toString() : "0");
                  
                  if (noAmount === 0 && yesAmount === 0) return "0%";
                  
                  // Use belief to determine position when available
                  if (persist && belief !== null && marketOdds !== null) {
                    const isBettingYes = belief >= marketOdds;
                    
                    if (isBettingYes) {
                      // Betting YES - show belief percentage
                      return <><span className="text-[#22c55e]">Yes</span> <span className="text-white">{belief.toFixed(0)}%</span></>;
                    } else {
                      // Betting NO - show belief percentage (not inverted)
                      return <><span className="text-[#ef4444]">No</span> <span className="text-white">{belief.toFixed(0)}%</span></>;
                    }
                  }
                  
                  // Fallback: use token amounts
                  // If all no, show "No 100%"
                  if (noAmount > 0 && yesAmount === 0) {
                    return <><span className="text-[#ef4444]">No</span> <span className="text-white">100%</span></>;
                  }
                  
                  // If all yes, show "Yes 100%"
                  if (yesAmount > 0 && noAmount === 0) {
                    return <><span className="text-[#22c55e]">Yes</span> <span className="text-white">100%</span></>;
                  }
                  
                  // Mixed tokens - show majority side
                  const totalAmount = noAmount + yesAmount;
                  const noPercentage = (noAmount / totalAmount) * 100;
                  const yesPercentage = (yesAmount / totalAmount) * 100;
                  
                  if (yesPercentage >= noPercentage) {
                    return <><span className="text-[#22c55e]">Yes</span> <span className="text-white">{yesPercentage.toFixed(0)}%</span></>;
                  } else {
                    return <><span className="text-[#ef4444]">No</span> <span className="text-white">{noPercentage.toFixed(0)}%</span></>;
                  }
                } catch {
                  return "0%";
                }
              })()
            )}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-[#2E3144] border border-[#4F5262] rounded-full p-1 flex gap-1 mb-2">
          {(() => {
            if (isEstimating) {
              return <div className="h-1.5 bg-gray-500 rounded-full flex-1"></div>;
            }
            
            if (error || !currency0Balance && !currency1Balance) {
              return <div className="h-1.5 bg-gray-500 rounded-full flex-1"></div>;
            }
            
            try {
              const noAmount = Number(parseFloat(String(currency0Balance || "0")).toFixed(4));
              const yesAmount = Number(parseFloat(String(currency1Balance || "0")).toFixed(4));
              
              if (noAmount === 0 && yesAmount === 0) {
                return <div className="h-1.5 bg-gray-500 rounded-full flex-1"></div>;
              }
              
              const totalAmount = noAmount + yesAmount;
              
              // Calculate percentages based on belief when available
              let noPercentage = 0;
              let lpPercentage = 0;
              let yesPercentage = 0;
              
              if (persist && belief !== null && marketOdds !== null) {
                // Determine which side user is betting on
                const isBettingYes = belief >= marketOdds;
                
                // If betting at X% belief, show X% directional and (100-X)% as LP
                if (isBettingYes) {
                  // Betting YES: show belief% as YES, remainder as LP
                  yesPercentage = belief;
                  lpPercentage = 100 - belief;
                } else {
                  // Betting NO: show belief% as NO, remainder as LP
                  noPercentage = 100 - belief;
                  lpPercentage = belief;
                }
              } else {
                // Fallback to token-based calculation
                const lpAmount = persist ? Math.min(noAmount, yesAmount) : 0;
                const remainingNo = noAmount - lpAmount;
                const remainingYes = yesAmount - lpAmount;
                
                noPercentage = (remainingNo / totalAmount) * 100;
                lpPercentage = (lpAmount * 2 / totalAmount) * 100; // *2 because LP provides both sides
                yesPercentage = (remainingYes / totalAmount) * 100;
              }
              
              // If all no (no LP), show all red
              if (noPercentage === 100 || (noAmount > 0 && yesAmount === 0 && lpPercentage === 0)) {
                return <div className="h-1.5 bg-[#ef4444] rounded-full transition-all duration-300 flex-1"></div>;
              }
              
              // If all yes (no LP), show all green
              if (yesPercentage === 100 || (yesAmount > 0 && noAmount === 0 && lpPercentage === 0)) {
                return <div className="h-1.5 bg-[#22c55e] rounded-full transition-all duration-300 flex-1"></div>;
              }
              
              // Mixed tokens - show No (red), LP (blue), Yes (green)
              return (
                <>
                  {noPercentage > 0 && (
                    <div 
                      className="h-1.5 bg-[#ef4444] rounded-full transition-all duration-300"
                      style={{ width: `${noPercentage}%` }}
                    />
                  )}
                  {lpPercentage > 0 && (
                    <div 
                      className="h-1.5 bg-[#05B9FC] rounded-full transition-all duration-300"
                      style={{ width: `${lpPercentage}%` }}
                    />
                  )}
                  {yesPercentage > 0 && (
                    <div 
                      className="h-1.5 bg-[#22c55e] rounded-full transition-all duration-300"
                      style={{ width: `${yesPercentage}%` }}
                    />
                  )}
                </>
              );
            } catch (err) {
              console.error('Error calculating position mix:', err);
              return <div className="h-1.5 bg-gray-500 rounded-full flex-1"></div>;
            }
          })()}
        </div>
        
        {/* Progress Bar Labels */}
        <div className="text-xs text-[#FFFFFFA3] flex justify-between">
          {isEstimating ? (
            <span>Calculating…</span>
          ) : error ? (
            ""
          ) : (
            (() => {
              try {
                const noAmount = parseFloat(currency0Balance ? currency0Balance.toString() : "0");
                const yesAmount = parseFloat(currency1Balance ? currency1Balance.toString() : "0");
                const totalAmount = noAmount + yesAmount;
                
                if (totalAmount === 0) return <span>0%</span>;
                
                // Calculate percentages based on belief when available
                let noPercentage = 0;
                let lpPercentage = 0;
                let yesPercentage = 0;
                
                // Determine which side user is betting on (for LP label)
                let isBettingYes = false;
                
                if (persist && belief !== null && marketOdds !== null) {
                  // Determine which side user is betting on
                  isBettingYes = belief >= marketOdds;
                  
                  // If betting at X% belief, show X% directional and (100-X)% as LP
                  if (isBettingYes) {
                    // Betting YES: show belief% as YES, remainder as LP
                    yesPercentage = belief;
                    lpPercentage = 100 - belief;
                  } else {
                    // Betting NO: show belief% as NO, remainder as LP
                    noPercentage = 100 - belief;
                    lpPercentage = belief;
                  }
                } else {
                  // Fallback to token-based calculation
                  const lpAmount = persist ? Math.min(noAmount, yesAmount) : 0;
                  const remainingNo = noAmount - lpAmount;
                  const remainingYes = yesAmount - lpAmount;
                  
                  noPercentage = (remainingNo / totalAmount) * 100;
                  lpPercentage = (lpAmount * 2 / totalAmount) * 100; // *2 because LP provides both sides
                  yesPercentage = (remainingYes / totalAmount) * 100;
                  
                  // Determine betting side from token amounts
                  isBettingYes = yesPercentage > noPercentage;
                }
                
                // Build label elements with only non-zero percentages
                const labels = [];
                if (noPercentage > 0) {
                  labels.push(<span key="no" className="text-left">{noPercentage.toFixed(0)}% No</span>);
                }
                if (persist && lpPercentage > 0) {
                  // LP label matches the side being bet on
                  const lpLabel = isBettingYes ? "Yes (LP)" : "No (LP)";
                  labels.push(<span key="lp" className="text-right">{lpPercentage.toFixed(0)}% {lpLabel}</span>);
                }
                if (yesPercentage > 0) {
                  labels.push(<span key="yes" className="text-right">{yesPercentage.toFixed(0)}% Yes</span>);
                }
                
                // If only one label, keep it left aligned
                if (labels.length === 1) {
                  return labels[0];
                }
                
                // If multiple labels, show first on left, last on right
                return (
                  <>
                    {labels[0]}
                    {labels[labels.length - 1]}
                  </>
                );
              } catch {
                return <span>0%</span>;
              }
            })()
          )}
        </div>
      </div>}
    </div>
  );
};

export default EstimatedWinnings;
