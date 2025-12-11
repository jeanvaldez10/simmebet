import React from "react";
import OptionsTableRow, { TOptionBetUpdate } from "./table-row/options-row";
import { PortfolioOption } from "@/hooks/portfolio/usePortfolioOptions";
import { TOptionSell } from "@/app/(site)/options/hooks/use-option-sell";
import { TOptionExerciseForm } from "@/app/(site)/options/hooks/use-option-exercise";
import { TOptionClose } from "@/app/(site)/options/hooks/use-option-close";

const DesktopOptions = ({
  isError,
  isLoading,
  data,
  onExerciseOpen,
  onSellOpen,
  onClose,
  onUpdate,
  isPublic,
}: {
  data: PortfolioOption[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onSellOpen: (e: TOptionSell) => void;
  onExerciseOpen: (e: TOptionExerciseForm) => void;
  onUpdate: (e: TOptionBetUpdate) => void;
  onClose: (e: TOptionClose) => void;
  isPublic: boolean;
}) => {
  let rows: React.ReactNode[] = [];
  if (isLoading || isError || data === undefined) {
    // TODO: make loading look nice with shimmer effect
    rows = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_100px_250px] p-4  rounded-[16px] bg-gray-700 animate-pulse w-full"
      >
        <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
      </div>
    ));
  } else {
    rows = data.map((trade, index) => (
      <OptionsTableRow
        key={index}
        {...trade}
        expiry={7}
        expiryDays={7}
        onExerciseOpen={onExerciseOpen}
        onSellOpen={onSellOpen}
        onClose={onClose}
        onUpdate={onUpdate}
        isPublic={isPublic}
      />
    ));
  }

  return (
    <div className="w-full md:block hidden">
      <div className="overflow-hidden border-none">
        <div className="overflow-x-auto">
          <div className="w-[1256px]">
            <div
              className="bg-black border-t-transparent mb-2 backdrop-blur-sm rounded-b-[16px] grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_100px_370px] 
p-4 text-xs font-normal text-[#FFFFFFA3]  capitalize tracking-wider border border-[#FFFFFF29]"
            >
              <div className="col-span-1">Token</div>
              <div className="col-span-1 text-center">Side</div>
              <div className="col-span-1 text-center">Type</div>
              <div className="col-span-1 text-center">Token Price</div>
              <div className="col-span-1 text-center">Strike</div>
              <div className="col-span-1 text-center">Expiry</div>
              <div className="col-span-1 text-center">Amount</div>
              <div className="col-span-1 opacity-0 self-end">
                View transaction
              </div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col gap-2 mt-2">{rows}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopOptions;
