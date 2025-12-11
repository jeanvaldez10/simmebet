import React from "react";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import useCreatorOptionsHistory, {
  ICreatorOPtionsHistory,
} from "../hook/use-creator-options-history";
import OptionsMobileHistory from "./options-mobile-history";
import { formatBalance } from "@/utils/format";

const OptionsHistory = ({ isEnabled }: { isEnabled: boolean }) => {
  const { dbUser } = useAuthContext();
  const { isLoading, isError, data } = useCreatorOptionsHistory(
    dbUser?.id || "",
    isEnabled
  );

  let rows: React.ReactNode[] = [];
  if (isLoading || isError || data === undefined) {
    // TODO: make loading look nice with shimmer effect
    rows = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_100px_250px]  rounded-[16px] bg-gray-700 animate-pulse w-full"
      >
        <div className="flex items-center gap-3 w-full col-span-1  h-[66px]" />
      </div>
    ));
  } else {
    rows = data.map((trade, index) => <OptionsRow key={index} {...trade} />);
  }

  return (
    <React.Fragment>
      <div className="w-full  md:block hidden">
        <div className="overflow-hidden border-none">
          <div className="overflow-x-auto">
            <div className="w-full">
              <div
                className=" bg-[#16171E52] border-t-transparent mb-2 backdrop-blur-sm rounded-b-[16px] grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] grid-cols-[200px_1fr_1fr_1fr_1fr]
p-4 text-xs font-normal text-[#FFFFFFA3]  capitalize tracking-wider border border-[#FFFFFF29]"
              >
                <div className="col-span-1">Token</div>
                <div className="col-span-1 text-center">Price</div>
                <div className="col-span-1 text-center">Strike</div>
                <div className="col-span-1 text-center">Expiry Date</div>
                <div className="col-span-1 text-center">Contracts</div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col gap-2">{rows}</div>
            </div>
          </div>
        </div>
      </div>
      <OptionsMobileHistory
        data={data}
        isError={isError}
        isLoading={isLoading}
      />
    </React.Fragment>
  );
};

export default OptionsHistory;

const OptionsRow = (headers: ICreatorOPtionsHistory) => {
  const {
    image,
    name,
    expiry,
    ticker,
    optionPrice,
    strike,
    contractCurrent,
    contractMax,
  } = headers;

  return (
    <div className="text-[#FFFFFFA3] grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] grid-cols-[200px_1fr_1fr_1fr_1fr] p-4  transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      <div className="flex items-center gap-3 w-full col-span-1">
        <div className="w-[32px] h-[32px] rounded-full overflow-hidden  flex-shrink-0">
          <Image
            src={image}
            alt={ticker}
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>

        <div>
          <h2 className="font-semibold text-base text-[#F2F2FD] truncate">
            {ticker} - {name}
          </h2>
        </div>
      </div>

      <div className="col-span-1 flex items-center text-sm text-center justify-center">
        ${formatBalance(optionPrice)}
      </div>

      <div className="col-span-1 flex-col flex items-center text-sm justify-center">
        ${formatBalance(strike)}
      </div>

      <div className="col-span-1 flex  gap-1  text-sm items-center justify-center">
        {expiry}
      </div>

      <div
        className={cn(
          "col-span-1  text-sm whitespace-nowrap capitalize   flex items-center justify-center"
        )}
      >
        Sol: {contractCurrent} of {contractMax}
      </div>
    </div>
  );
};
