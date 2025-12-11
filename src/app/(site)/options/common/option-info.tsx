import ProgressBar from "@/components/options/ProgressBar";
import HorizontalLine from "@/components/common/HorizontalLine";
import { CircularProgress } from "@/components/common/CircularProgress";

interface OptionInfoProps {
  optionsAvailable: number;
  optionsTotal: number;
  strikePrice: number;
  expiry: number;
  costPerOption: number;
  isLong: boolean;
}

export default function OptionInfo({
  optionsAvailable,
  optionsTotal,
  strikePrice,
  expiry,
  costPerOption,
  isLong,
}: OptionInfoProps) {
  const completionPercentage = (optionsAvailable / optionsTotal) * 100;
  return (
    <div className="rounded-2xl flex w-full lg:w-[400px] flex-col gap-6 bg-[#16171E52] backdrop-blur-md border border-[#FFFFFF29] p-5">
      <h2 className="text-[28px] font-semibold text-[#F2F2FD]">Option Info</h2>

      <div className="flex flex-col gap-4 mt-[-8px]">
        <div>
          <div className="text-[#FFFFFFA3]  font-semibold text-sm">
            Options available
          </div>
          <div className="flex text-xl items-center gap-2">
            <span className="font-semibold text-white">{optionsAvailable}</span>
            <span className="font-semibold text-[#FFFFFF52]">
              of {optionsTotal}
            </span>
          </div>

          <ProgressBar current={completionPercentage} total={100} />
        </div>
        <HorizontalLine />
        <div className="flex flex-col">
          <div className="flex justify-between py-4 first:pt-0">
            <div className="flex flex-col flex-1">
              <span className="text-[#FFFFFFA3] font-sm font-semibold">
                Strike
              </span>
              <p className="text-[20px] font-semibold text-[#F2F2FD]">
                ${strikePrice}
              </p>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div className="w-[1px] h-full bg-[#FFFFFF29] mr-2"></div>
              <div>
                <span className="text-[#FFFFFFA3] font-sm font-semibold">
                  Expiry
                </span>
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
                  <span className="text-[20px] font-semibold text-[#F2F2FD]">
                    {expiry} {expiry > 1 ? "Days" : "Day"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <HorizontalLine />

          <div className="flex justify-between py-4 first:pt-0">
            <div className="flex flex-col flex-1">
              <span className="text-[#FFFFFFA3]  font-sm font-semibold">
                Premium
              </span>
              <span className="text-[20px] font-semibold text-[#F2F2FD]">
                ${costPerOption}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div className="w-[1px] h-full bg-[#FFFFFF29] mr-2"></div>
              <div className="flex flex-col">
                <span className="text-[#FFFFFFA3]  font-sm font-semibold">
                  Position
                </span>
                <span
                  className={`text-[20px] font-semibold ${
                    isLong ? "text-[#46FD84]" : "text-[#FF4D4D]"
                  }`}
                >
                  {isLong ? "Long" : "Short"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
