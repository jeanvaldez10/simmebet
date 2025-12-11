import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { MarketLiquidityPosition } from '@/hooks/useMarketLiquidityPosition';
import type { LiquidityPositionData } from '@/hooks/useLiquidityPositionData';

interface PositionSelectorProps {
  positions: MarketLiquidityPosition[];
  positionsData: LiquidityPositionData[];
  selectedPositionIndex: number;
  onPositionSelect: (index: number) => void;
  className?: string;
}

const PositionSelector: React.FC<PositionSelectorProps> = ({
  positions,
  positionsData,
  selectedPositionIndex,
  onPositionSelect,
  className = "",
}) => {
  const selectedPosition = positions[selectedPositionIndex];
  const selectedPositionData = positionsData[selectedPositionIndex];

  if (!selectedPosition || !selectedPositionData) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 border border-[#FFFFFF29] rounded-[80px] px-3 py-2 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0"></div>
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-white text-xs font-semibold leading-none">
          Your LP: ${selectedPositionData.yourLp.toFixed(2)}
        </span>
        {positions.length > 1 && (
          <>
            <div className="w-px h-3 bg-[#FFFFFF29] self-center"></div>
            <div className="relative flex items-center">
              <select
                value={selectedPositionIndex}
                onChange={(e) => onPositionSelect(parseInt(e.target.value))}
                className="appearance-none bg-transparent text-[#FFFFFFA3] text-[10px] font-medium leading-none pr-4 cursor-pointer focus:outline-none"
              >
                {positions.map((position, index) => (
                  <option key={position.id} value={index} className="bg-[#16171E] text-[#FFFFFFA3] text-[10px]">
                    NFT #{position.nftId}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#FFFFFFA3] pointer-events-none" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PositionSelector;
