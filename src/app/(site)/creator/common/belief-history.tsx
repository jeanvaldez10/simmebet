import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useCreatorBeliefHistory, {
  ICreatorBeliefHistory,
} from "../hook/use-creator-belief-history";
import { useAuthContext } from "@/context/AuthProvider";
import { CircularProgress } from "@/components/common/CircularProgress";
import { cn } from "@/lib/utils";
import BeliefMobileHistory from "./belief-mobile-history";
import { formatBalance } from "@/utils/format";

const BeliefHistory = ({ isEnabled }: { isEnabled: boolean }) => {
  const { dbUser } = useAuthContext();
  const { isLoading, isError, data } = useCreatorBeliefHistory(
    dbUser?.id || "",
    isEnabled
  );

  let rows: React.ReactNode[] = [];
  if (isLoading || isError || data === undefined) {
    // TODO: make loading look nice with shimmer effect
    rows = Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_100px_250px] rounded-[16px] bg-gray-700 animate-pulse w-full "
      >
        <div className="flex items-center gap-3 w-full col-span-1  h-[66px]" />
      </div>
    ));
  } else {
    rows = data.map((trade, index) => <BeliefRow key={index} {...trade} />);
  }

  return (
    <React.Fragment>
      <div className="w-full  md:block hidden">
        <div className="overflow-hidden border-none">
          <div className="overflow-x-auto">
            <div className="w-full">
              <div
                className=" bg-[#16171E52] border-t-transparent mb-2 backdrop-blur-sm rounded-b-[16px] grid lg:grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] grid-cols-[210px_1fr_1fr_1fr_1fr_1fr] 
p-4 text-xs font-normal text-[#FFFFFFA3]  capitalize tracking-wider border border-[#FFFFFF29]"
              >
                <div className="col-span-1">Title</div>
                <div className="col-span-1 text-center">Volume traded</div>
                <div className="col-span-1 text-center">Fees earned</div>
                <div className="col-span-1 text-center">Duration</div>
                <div className="col-span-1 text-center">Final result</div>
                <div className="col-span-1 opacity-0 self-end">View market</div>
              </div>

              {/* Table Body */}
              <div className="flex flex-col gap-2">{rows}</div>
            </div>
          </div>
        </div>
      </div>
      <BeliefMobileHistory
        data={data}
        isLoading={isLoading}
        isError={isError}
      />
    </React.Fragment>
  );
};

export default BeliefHistory;

const BeliefRow = (headers: ICreatorBeliefHistory) => {
  const router = useRouter();

  const { id, image, title, volume, fees, duration, result } = headers;

  return (
    <div className="text-[#FFFFFFA3] grid lg:grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] grid-cols-[210px_1fr_1fr_1fr_1fr_1fr] p-4  transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      <div className="flex items-center gap-3 w-full col-span-1">
        <div className="w-[32px] h-[32px] rounded-full overflow-hidden  flex-shrink-0">
          <Image
            src={image}
            alt={title}
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        </div>
        <h2 className="font-semibold text-base text-[#F2F2FD] truncate">
          {title.length > 100 ? `${title.slice(0, 97)}...` : title}
        </h2>
      </div>

      <div className="col-span-1 flex items-center text-sm text-center justify-center">
        ${formatBalance(volume)}
      </div>

      <div className="col-span-1 flex-col flex items-center text-sm justify-center">
        ${formatBalance(fees)}
      </div>

      <div className="col-span-1 flex  gap-1  text-sm items-center justify-center">
        <CircularProgress
          positiveColor="#4F40FF"
          negativeColor="#ffffffa3"
          positivePercentage={50}
          negativePercentage={50}
          size={16}
          strokeWidth={3}
          showText={false}
        />
        <div>{duration}</div>
      </div>

      <div
        className={cn(
          "col-span-1  text-sm capitalize   flex items-center justify-center",
          result === "yes" ? "text-[#36FD68]" : "text-[#FD3748]"
        )}
      >
        {result}
      </div>

      <div className="flex items-center col-span-1 w-full justify-end  text-sm whitespace-nowrap gap-2">
        <button
          className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
          aria-label="View Market"
          tabIndex={0}
          onClick={() =>
            router.push(`/market/${id}`)
          }
        >
          View Market
        </button>
      </div>
    </div>
  );
};
