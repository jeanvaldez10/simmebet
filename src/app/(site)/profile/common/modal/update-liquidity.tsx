import CommonModal from "@/components/modals";
import { marketsApi } from "@/services/api/markets";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import LiquiditySummaryCard from "@/app/(site)/market/trading-panel/components/LiquiditySummaryCard";

const UpdateLiquidity = ({
  onClose,
  id,
}: {
  onClose: () => void;
  id: string;
}) => {
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ["market", id],
    queryFn: () => marketsApi.getMarketById(id as string),
    enabled: !!id,
  });

  const market = marketData?.market;

  return (
    <CommonModal onClose={onClose} className="max-h-[97vh] overflow-scroll">
      {marketLoading ? (
        <>
          <h1 className="text-[#F2F2FD] text-2xl mb-2 font-semibold">
            Manage Liquidity Position
          </h1>
          <div className="space-y-4 mt-4">
            {/* Position Mix Skeleton */}
            <div className="border border-[#FFFFFF29] rounded-lg p-4">
              <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mb-3" />
              <div className="h-3 w-full bg-gray-700 rounded-full animate-pulse mb-2" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            
            {/* Main Info Card Skeleton */}
            <div className="border border-[#FFFFFF0F] rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-32 bg-gray-700 rounded-full animate-pulse" />
                <div className="flex flex-col items-end gap-2">
                  <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2.5 mt-4">
                <div className="h-4 w-48 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            
            {/* Buttons Skeleton */}
            <div className="flex gap-2 w-full mt-4">
              <div className="flex-1 h-12 bg-gray-700 rounded-full animate-pulse" />
              <div className="flex-1 h-12 bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-[#F2F2FD] text-2xl mb-2 font-semibold">
            Manage Liquidity Position
          </h1>
          {market && (
            <LiquiditySummaryCard 
              market={market} 
              hideHeader={true}
              noPadding={true}
              onClose={onClose}
            />
          )}
        </>
      )}
    </CommonModal>
  );
};

export default UpdateLiquidity;

