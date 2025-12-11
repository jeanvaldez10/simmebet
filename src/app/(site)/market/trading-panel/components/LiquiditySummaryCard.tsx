import React, { useState } from 'react';
import { IMarketData } from '@/interfaces/market';
import { useHasOpenLiquidityPosition, useHasOpenLiquidityPositions } from '@/hooks/useMarketLiquidityPosition';
import { useLiquidityPositionData, useLiquidityPositionsData } from '@/hooks/useLiquidityPositionData';
import ActiveLiquidityPosition from '@/components/common/ActiveLiquidityPosition';

interface LiquiditySummaryCardProps {
  market: IMarketData;
  hideHeader?: boolean;
  noPadding?: boolean;
  onClose?: () => void;
}

export default function LiquiditySummaryCard({ market, hideHeader = false, noPadding = false, onClose }: LiquiditySummaryCardProps) {
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);
  
  // Use hooks to get position information
  const { hasOpenPosition, position, isLoading: positionLoading } = useHasOpenLiquidityPosition(market.id);
  const { hasOpenPositions, positions, isLoading: positionsLoading } = useHasOpenLiquidityPositions(market.id);
  const { data: positionData, isLoading: positionDataLoading } = useLiquidityPositionData(market.id);
  const { data: positionsData, isLoading: positionsDataLoading } = useLiquidityPositionsData(market.id);

  // Show loading state
  if (positionLoading || positionsLoading || positionDataLoading || positionsDataLoading) {
    return (
      <div className={noPadding ? "" : "bg-[#16171E] rounded-2xl p-6 shadow-sm"}>
        {!hideHeader && <h3 className="text-2xl font-semibold text-[#F2F2FD] mb-4">Liquidity Summary</h3>}
        <div className="space-y-4">
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
          <div className="flex gap-2 w-full">
            <div className="flex-1 h-12 bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 h-12 bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no position
  if (!hasOpenPositions || !positions || !positionsData) {
    return null;
  }

  return (
    <div className={noPadding ? "" : "bg-[#16171E] rounded-2xl p-6 shadow-sm"}>
      {!hideHeader && <h3 className="text-2xl font-semibold text-[#F2F2FD] mb-4">Liquidity Summary</h3>}
      
      <ActiveLiquidityPosition
        noSideName={market.noSideName}
        yesSideName={market.yesSideName}
        positionData={positions.length > 1 ? 
          (positionsData[selectedPositionIndex] ? {
            ...positionsData[selectedPositionIndex],
            nftId: positions[selectedPositionIndex]?.nftId
          } : undefined) :
          (positionData ? {
            ...positionData,
            nftId: position?.nftId
          } : undefined)
        } 
        hasOpenPosition={hasOpenPosition}
        marketId={market.id}
        market={market}
        positions={positions.length > 1 ? positions : undefined}
        positionsData={positions.length > 1 ? positionsData : undefined}
        selectedPositionIndex={positions.length > 1 ? selectedPositionIndex : undefined}
        onPositionSelect={positions.length > 1 ? setSelectedPositionIndex : undefined}
        onClose={onClose}
      />
    </div>
  );
}

