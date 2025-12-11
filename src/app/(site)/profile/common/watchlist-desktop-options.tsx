import React from "react";
import WatchListOptionsRow from "./table-row/watchlist-options-row";
import { IWatchListOptions } from "@/hooks/use-watchlist-options";

const WatchListDesktopOptions = ({
  isError,
  isLoading,
  data,
}: {
  data: IWatchListOptions[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  let rows: React.ReactNode[] = [];

  if (isLoading || isError || data === undefined) {
    // Loading skeleton
    rows = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="text-[#FFFFFFA3] p-4 rounded-[16px] bg-gray-700 animate-pulse w-full h-[74px]"
      >
        <div className="flex items-center gap-3 w-full col-span-1 h-[60px]" />
      </div>
    ));
  } else if (data.length === 0) {
    rows = [
      <div
        key="empty"
        className="text-[#FFFFFFA3] grid grid-cols-7 p-4 transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]"
      >
        <div className="col-span-full text-center py-8">
          <p className="text-gray-400 mb-4">No starred options found</p>
          <p className="text-sm text-gray-500">
            Star options to add them to your watchlist
          </p>
        </div>
      </div>,
    ];
  } else {
    rows = data.map((option) => (
      <WatchListOptionsRow key={option.id} {...option} />
    ));
  }

  return (
    <div className="w-full md:block hidden">
      <div className="overflow-hidden border-none">
        <div className="overflow-x-auto">
          <div className="w-[1256px]">
            <div className="bg-[#16171E52] border-t-transparent mb-2 backdrop-blur-sm rounded-b-[16px] grid grid-cols-7 p-4 text-xs font-normal text-[#FFFFFFA3] capitalize tracking-wider border border-[#FFFFFF29]">
              <div className="col-span-1">Token</div>
              <div className="col-span-1 text-center">Position</div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Options available</div>
              <div className="col-span-1 text-center">Strike</div>
              <div className="col-span-1 text-center">Expiry</div>
              <div className="col-span-1 text-end opacity-0">Action</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col gap-2">{rows}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchListDesktopOptions;
