import React from "react";
import { ICreatorOPtionsHistory } from "../hook/use-creator-options-history";
import Image from "next/image";

const OptionsMobileHistory = ({
  data,
  isError,
  isLoading,
}: {
  data: ICreatorOPtionsHistory[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  return (
    <div className="grid md:hidden mt-4 gap-2 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] cursor-pointer">
      {isLoading || isError || data === undefined ? (
        Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[172px]"
          >
            <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
          </div>
        ))
      ) : (
        <>
          {data.map((item, idx) => (
            <div key={idx} className="bg-[#16171E] p-4 rounded-[16px]">
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={item?.image}
                    alt={item?.ticker}
                    className="w-full h-full object-cover"
                    width={32}
                    height={32}
                  />
                </div>

                <h2 className="text-base font-semibold text-[#FFFFFF] truncate">
                  {item.ticker} - {item.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Price</p>
                  <p className="text-[#FFFFFF] font-semibold text-sm">
                    ${item.optionPrice}
                  </p>
                </div>
                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Strike</p>
                  <p className="text-[#FFFFFF] font-semibold text-sm">
                    $${item.strike}
                  </p>
                </div>
                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Expiry Date</p>
                  <p className="text-[#FFFFFF] font-semibold text-sm">
                    {item.expiry}
                  </p>
                </div>

                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Contracts</p>
                  <p className="text-[#FFFFFF] font-semibold text-sm">
                    Sold: {item.contractCurrent} of {item.contractMax}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default OptionsMobileHistory;
