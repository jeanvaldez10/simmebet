import React from "react";
import { ICreatorBeliefHistory } from "../hook/use-creator-belief-history";
import Image from "next/image";
import { CircularProgress } from "@/components/common/CircularProgress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { formatBalance } from "@/utils/format";

const BeliefMobileHistory = ({
  data,
  isError,
  isLoading,
}: {
  data: ICreatorBeliefHistory[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const router = useRouter();
  return (
    <div className="grid md:hidden mt-4 gap-2 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] cursor-pointer">
      {isLoading || isError || data === undefined ? (
        Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[176px]"
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
                    alt={item?.title}
                    className="w-full h-full object-cover"
                    width={32}
                    height={32}
                    unoptimized
                  />
                </div>

                <h2 className="text-base font-semibold text-[#FFFFFF] truncate">
                  {item.title}
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-2 my-4">
                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Volume Traded</p>
                  <p className="text-[#FFFFFF] font-semibold text-sm">
                    ${formatBalance(item.volume)}
                  </p>
                </div>
                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Fees Earned</p>
                  <p className="text-[#FFFFFF] font-semibold text-sm">
                    ${formatBalance(item.fees)}
                  </p>
                </div>
                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Duration</p>
                  <div className="flex items-center gap-1">
                    <CircularProgress
                      positiveColor="#4F40FF"
                      negativeColor="#ffffffa3"
                      positivePercentage={50}
                      negativePercentage={50}
                      size={16}
                      strokeWidth={3}
                      showText={false}
                    />
                    <p className="text-[#FFFFFF] font-semibold text-sm">
                      {item.duration}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex  items-end justify-between gap-2">
                <div>
                  <p className="text-[#FFFFFFA3] text-xs mb-1">Final Result</p>

                  <p
                    className={cn(
                      " text-sm capitalize",
                      item.result === "yes"
                        ? "text-[#36FD68]"
                        : "text-[#FD3748]"
                    )}
                  >
                    {item.result}
                  </p>
                </div>

                <button
                  className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
                  aria-label="View Market"
                  tabIndex={0}
                  onClick={() =>
                    router.push(`/market/${item.id}`)
                  }
                >
                  View Market
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default BeliefMobileHistory;
