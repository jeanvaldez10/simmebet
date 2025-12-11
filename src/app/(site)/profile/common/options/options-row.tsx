import Image from "next/image";
import { SquareArrowOutUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ExpiryIndicator } from "@/components/options/ExpiryIndicator";

interface OptionsTableHeaders {
  tokenName: string;
  tokenImage: string;
  tokenPrice: string;
  strike: string;
  expiry: number;
  expiryDays: number;
  premium: string;
  size: number;
  onSellOpen: () => void;
  onExerciseOpen: () => void;
}

export default function OptionsTableRow(headers: OptionsTableHeaders) {
  const router = useRouter();

  const {
    tokenImage,
    tokenName,
    tokenPrice,
    strike,
    expiry,
    expiryDays,
    premium,
    size,
    onSellOpen,
    onExerciseOpen,
  } = headers;

  return (
    <div className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_100px_250px] p-4  transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      <div className="flex items-center gap-3 w-full col-span-1">
        <div className="w-[60px] h-[60px] rounded-[16px] overflow-hidden bg-gray-800 flex-shrink-0">
          <Image
            src={tokenImage}
            alt={tokenName}
            width={60}
            height={60}
            className="object-cover w-full h-full"
          />
        </div>
        <h2 className=" text-base text-white font-semibold">{tokenName}</h2>
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        {tokenPrice}
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        {strike}
      </div>

      <div className="col-span-1 flex text-sm items-center justify-center gap-1">
        <ExpiryIndicator value={expiry} size={16} thickness={3} />
        <div>{expiryDays}d</div>
      </div>

      <div className="col-span-1 text-sm text-center flex items-center justify-center">
        ${premium}
      </div>

      <div className="col-span-1 text-sm text-center flex items-center justify-center">
        {size}
      </div>

      <div className=" flex items-center gap-2">
        <button
          className="cursor-pointer col-span-1 flex items-center justify-center bg-[#FD3748] py-[2px] px-3 rounded-[80px] text-[#070708] font-semibold text-xs h-[32px] my-auto"
          onClick={onSellOpen}
        >
          Sell
        </button>
        <button
          className="  cursor-pointer col-span-1 flex items-center justify-center bg-[#FD3748] py-[2px] px-3 rounded-[80px] text-[#070708] font-semibold text-xs h-[32px] my-auto"
          onClick={onExerciseOpen}
        >
          Exercise
        </button>
      </div>

      <div className="flex items-center col-span-1 w-full justify-end  text-sm whitespace-nowrap gap-2">
        <button
          className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
          aria-label="View Market"
          tabIndex={0}
          onClick={() => router.push(`#`)}
        >
          View Transaction
        </button>
        <Image
          src="/images/buttons.png"
          alt="arrow-right"
          width={25}
          height={25}
        />
        <SquareArrowOutUpRight className="w-[22px] h-[22px] cursor-pointer" />
      </div>
    </div>
  );
}
