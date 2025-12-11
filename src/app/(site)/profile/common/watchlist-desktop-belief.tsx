import React from "react";
import WatchListBeliefRow from "./table-row/watchlist-belief-row";
import { IMarketData } from "@/interfaces/market";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

const WatchListDesktopBelief = ({
  isError,
  isLoading,
  data,
}: {
  data: IMarketData[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const { totalHeight } = useLayoutHeights();
  let rows: React.ReactNode[] = [];
  if (isLoading || isError || data === undefined) {
    // TODO: make loading look nice with shimmer effect
    rows = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="text-[#FFFFFFA3] p-4 rounded-[16px] bg-gray-700 animate-pulse w-full h-[74px]"
      >
        <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
      </div>
    ));
  } else {
    rows = data.map((trade, index) => (
      <WatchListBeliefRow key={index} {...trade} />
    ));
  }

  return (
    <div className="w-full md:block hidden">
      <div className="w-full">
        <div
          className="bg-black backdrop-blur-sm rounded-b-[16px] border-t-transparent grid grid-cols-1 md:grid-cols-[2fr_1fr_1.5fr] gap-4 p-4 text-xs font-normal text-[#FFFFFFA3] capitalize tracking-wider border border-[#FFFFFF29] sticky z-30"
          style={{ top: `${totalHeight + 46}px` }}
        >
          <div>Market</div>
          <div className="text-center">Status</div>
          <div className="text-end">Bet</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-2">{rows}</div>
      </div>
    </div>
  );
};

export default WatchListDesktopBelief;
