/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import { Star } from "lucide-react";
import Button from "../Button";
import SimpleChart from "./SimpleChart";
import { ExpiryIndicator } from "./ExpiryIndicator";

interface PortfolioCardProps {
  tokenSymbol: string;
  tokenName: string;
  currentPrice: string;
  priceChange: string;
  strikePrice: string;
  expiry: string;
  size: string;
  position: string;
  tokenImage: string;
  chartData: number[];
}

const PortfolioCard = ({
  tokenSymbol,
  tokenName,
  currentPrice,
  priceChange,
  strikePrice,
  expiry,
  size,
  position,
  tokenImage,
  chartData,
}: PortfolioCardProps) => {
  const isNegative = priceChange.startsWith("-");
  return (
    <div className="bg-[#16171E] rounded-3xl p-4 text-white shadow-2xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Token Image */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
            <Image
              src={tokenImage}
              alt={tokenSymbol}
              className="w-full h-full object-cover"
              width={50}
              height={50}
            />
          </div>

          {/* Token Info */}
          <div>
            <h2 className="text-2xl font-bold text-white">{tokenSymbol}</h2>
            <p className="text-gray-400 text-sm font-semibold">{tokenName}</p>
          </div>
        </div>

        {/* Icons and Price */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-[#FFFFFF52]" />
            <Image
              src="/images/buttons.png"
              alt="arrow-right"
              width={28}
              height={28}
            />
          </div>
          <div className="text-sm font-bold text-white">{currentPrice}</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`text-sm font-bold ${
              isNegative
                ? "text-red-500 bg-red-500/10 px-2 py-1 rounded-full"
                : "text-green-500 bg-green-500/10 px-2 py-1 rounded-full"
            }`}
          >
            {priceChange}
          </span>
        </div>
        <div className="h-32 w-full">
          <SimpleChart data={[]} isNegative={isNegative} />
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">Strike</p>
          <p className="text-white font-bold text-sm">{strikePrice}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Expiry</p>
          <div className="flex items-center justify-between">
            <ExpiryIndicator value={7} size={16} thickness={3} />
            <p className="text-white font-bold text-sm">{expiry}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Size</p>
          <p className="text-white font-bold text-sm">{size}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-1">Position</p>
          <p className="text-green-400 font-bold text-sm">{position}</p>
        </div>
      </div>

      {/* Buy Button */}
      <Button
        variant="ghost"
        className="w-full hover:bg-accent-foreground"
        size="sm"
      >
        Buy
      </Button>
    </div>
  );
};

export default PortfolioCard;
