import React, { useState } from "react";
import { formatBalance } from "@/utils/format";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { TbTrendingUp } from "react-icons/tb";
import { Info } from "lucide-react";
import FlexModal from "@/app/(site)/profile/common/modal/flex-modal";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import FlexLottieButton from "@/components/flex-cards/flex-button";
import { createFlexSnapshot } from "@/utils/flexSnapshot";
import { useUserProfit } from "@/hooks/useUserProfit";
import { useUserVolumeTraded } from "@/hooks/useUserVolumeTraded";
import { useUserLiquidityPositionsDetailed } from "@/hooks/useUserLiquidityPositionsDetailed";
import { PnLBreakdownDialog } from "@/components/profile/PnLBreakdownDialog";
import { Button } from "@/components/ui/button";

type ProfileStatsProps = {
  balance: number;
  isPublic: boolean;
};

type StatCard = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: number | string;
  footer?: {
    value: number | string;
    label: string;
  };
  height?: string;
  hasGraph?: boolean;
};

const ProfileStats = ({
  balance,
  isPublic,
}: ProfileStatsProps) => {
  const { data: profitData, isLoading: isProfitLoading } = useUserProfit();
  const { data: volumeTraded, isLoading: isVolumeLoading } = useUserVolumeTraded();
  const { data: liquidityData, isLoading: isLiquidityLoading } = useUserLiquidityPositionsDetailed();
  const [open, setOPen] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Check if any data is still loading
  const isDataLoading = isProfitLoading || isVolumeLoading || isLiquidityLoading;

  // Calculate total P&L including liquidity positions
  // Only calculate when data is available
  const totalProfit = isDataLoading 
    ? null 
    : (profitData?.totalProfit || 0) + (liquidityData?.summary.totalPnL || 0);

  // Check if breakdown should be shown
  const showPnLBreakdown = process.env.NEXT_PUBLIC_SHOW_PNL_BREAKDOWN === 'true';

  const statsCards: StatCard[] = [
    {
      icon: <RiMoneyDollarCircleLine className="w-5 h-5 text-white" />,
      iconBg: "bg-[#2E3144]",
      title: "Balance",
      value: isDataLoading ? "..." : formatBalance(balance),
      hasGraph: true,
    },
    {
      icon: <TbTrendingUp className="w-5 h-5 text-white" />,
      iconBg: "bg-[#2E3144]",
      title: "Profit/Loss",
      value: isDataLoading ? "..." : formatBalance(totalProfit),
      footer: {
        value: isDataLoading ? "..." : formatBalance(volumeTraded),
        label: "Volume traded",
      },
    },
  ];
  const data = [
    { value: 500 },
    { value: 610 },
    { value: 1000 },
    { value: 610 },
    { value: 1000 },
    { value: 1500 },
    { value: 720 },
    { value: 815 },
    { value: 9930 },
    { value: 5050 },
    { value: 3180 },
    { value: 9220 },
    { value: 8220 },
    { value: 7620 },
    { value: 8310 },
      ];

  const handleShareProfile = async () => {
    // Safety check - should not be called when data is loading
    if (isDataLoading || totalProfit === null) {
      console.warn('Cannot create flex card while data is loading');
      return;
    }

    setOPen("loading");
    
    try {
      // Pass the actual profile data to ensure consistency
      const profileData = {
        profit: totalProfit,
        volumeTraded: volumeTraded || 0,
        balance,
      };
      
      // Create snapshot using server-side generation with profile data
      const result = await createFlexSnapshot("flex9", undefined, profileData);
      
      // Get the OG image URL
      const imageUrl = `/api/og/flex?snapshotId=${result.snapshotId}`;
      setOPen(imageUrl);
    } catch (error) {
      console.error('Error creating profile snapshot:', error);
      setOPen(""); // Close modal on error
    }
  };

  return (
    <div className="flex gap-2 flex-col items-center mt-4 lg:mt-8 xl:mt-0 pMain w-full lg:w-auto">
      {statsCards.map((card, index) => (
        <div
          key={index}
          className={`relative border border-[#FFFFFF29] rounded-[16px] bg-[#16171E52] backdrop-blur-sm overflow-hidden w-full sm:w-[480px] lg:w-[360px] xl:w-[320px] pCard min-h-[180px] sm:min-h-[200px] ${
            card.height || ""
          } relative`}
        >
          {/* Card content */}
          <div className="p-3 sm:p-4 h-full flex justify-between">
            <div className="flex flex-col justify-between flex-1 pr-2 sm:pr-4">
              <div
                className={`flex items-center justify-center w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full ${card.iconBg} mb-6 sm:mb-8`}
              >
                {card.icon}
              </div>

              {!isPublic && (
                <>
                  {card.title === "Profit/Loss" && (
                    <>
                      <div className="absolute top-[6px] right-1 z-10 flex items-center justify-center w-[110px] sm:w-[130px]">
                        <div className={isDataLoading ? "opacity-50 pointer-events-none" : ""}>
                          <FlexLottieButton
                            text="Flex"
                            onClick={isDataLoading ? undefined : handleShareProfile}
                          />
                        </div>
                      </div>
                      {showPnLBreakdown && !isDataLoading && profitData?.breakdown && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-[#2E3144] hover:bg-[#3E4154] text-white"
                          onClick={() => setShowBreakdown(true)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="flex flex-col mt-2 sm:mt-4">
                <div className="text-[#9999AA] text-xs sm:text-sm mb-1">{card.title}</div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 break-all">
                  {card.value}
                </div>
              </div>
            </div>
            {card.footer && (
              <div className="text-xs text-[#FFFFFFA3] flex flex-col items-end justify-end mt-1">
                <span>{card.footer.value}</span>
                <span className="font-normal text-[#FFFFFF52]">{card.footer.label}</span>
              </div>
            )}
          </div>

          {card.hasGraph && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-[120px] h-[60px] sm:w-[140px] sm:h-[70px] rounded-lg p-1 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <Line
                    type="basis"
                    dataKey="value"
                    stroke="#00FF66"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}

      {open && (
        <FlexModal
          onClose={() => setOPen("")}
          image={open}
          type="flex9"
          isLoading={open === "loading"}
        />
      )}

      {showPnLBreakdown && profitData?.breakdown && (
        <PnLBreakdownDialog
          open={showBreakdown}
          onOpenChange={setShowBreakdown}
          breakdown={profitData.breakdown}
          totalProfit={totalProfit || 0}
          liquidityPnL={liquidityData?.summary.totalPnL || 0}
        />
      )}
    </div>
  );
};

export default ProfileStats;
