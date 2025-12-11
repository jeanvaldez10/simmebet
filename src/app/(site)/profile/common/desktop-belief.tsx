import React from "react";
import BeliefRow from "./table-row/belief-row";
import { IPositionBelief } from "@/hooks/use-position-belief";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

const DesktopBelief = ({
  data,
  isError,
  isLoading,
  onClaim,
  onUpdate,
  onUpdateLP,
  isPublic,
}: {
  data: IPositionBelief[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onClaim: (marketAddress?: string) => void;
  onUpdate: (e: string) => void;
  onUpdateLP: (e: string) => void;
  isPublic: boolean;
}) => {
  const { totalHeight } = useLayoutHeights();
  let rows: React.ReactNode[] = [];
  if (isLoading || isError || data === undefined) {
    // TODO: make loading look nice with shimmer effect
    rows = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="text-[#FFFFFFA3] flex items-center p-5 rounded-xl bg-gray-700 animate-pulse w-full"
      >
        <div className="flex items-center gap-4 w-80 h-20" />
      </div>
    ));
  } else {
    rows = data.map((trade, index) => (
      <BeliefRow
        key={index}
        {...trade}
        onClaim={onClaim}
        onUpdate={onUpdate}
        onUpdateLP={onUpdateLP}
        isPublic={isPublic}
      />
    ));
  }

  return (
    <div className="w-full md:block hidden">
      <div className="w-full">
        <div
          className="bg-black backdrop-blur-sm rounded-b-[16px] border-t-transparent grid grid-cols-[350px_80px_1fr_100px_100px_100px_120px_220px] p-4 text-xs font-normal text-[#FFFFFFA3] capitalize tracking-wider border border-[#FFFFFF29] sticky z-30"
          style={{ top: `${totalHeight + 46}px` }}
        >
          <div className="col-span-1">Market</div>
          <div className="col-span-1 text-center">Type</div>
          <div className="col-span-1 text-center">Position</div>
          <div className="col-span-1 text-center">Odds</div>
          <div className="col-span-1 text-center">Investment</div>
          <div className="col-span-1 text-center">P&L</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-2">{rows}</div>
      </div>
    </div>
  );
};

export default DesktopBelief;
