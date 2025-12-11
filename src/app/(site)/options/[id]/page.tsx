"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import BuyOptionModal from "../common/buy-modal";
import TradeInput from "@/components/shared/trade-input";
import OptionInfo from "../common/option-info";
import { useTokenData } from "@/hooks/options/useTokenData";
import ShareModal from "@/app/(site)/profile/common/modal/share";
import { Copy, ExternalLink, Star } from "lucide-react";

import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useOptionWatchlist } from "@/hooks/useOptionWatchlist";
import { cn } from "@/lib/utils";
import ShareIcon from "@/components/shared/share-icon";
const TokenPriceChart = dynamic(
  () => import("@/components/charts/TokenPriceChart"),
  {
    ssr: false,
  }
);

const timeframes: { value: "1D" | "1W" | "1M" | "1Y"; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "1Y", label: "1Y" },
];

const OptionDetails = () => {
  const { id: tokenId } = useParams();
  const { data: tokenData, isPending } = useTokenData();
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1D" | "1W" | "1M" | "1Y"
  >("1D");
  const [selectedOption, setSelectedOption] = useState<"buy" | "exercise">(
    "buy"
  );
  const [amount, setAmount] = useState(0);
  const [isBuyOptionModalOpen, setIsBuyOptionModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Watchlist functionality
  const {
    isInWatchlist,
    toggleWatchlist,
    isLoadingStatus,
    isAddingToWatchlist,
    isRemovingFromWatchlist,
  } = useOptionWatchlist(tokenId as string);

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/options/${tokenId}`;

  const isDisabled = !amount || amount > 3000;

  if (isPending || !tokenData) {
    return (
      <div className="flex mt-8 sm:mt-1 lg:mt-0 lg:flex-row flex-col gap-6  p-3 max-w-7xl mx-auto">
        <div className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse h-[774px] w-full" />
        <div className="flex flex-col gap-4 w-full lg:w-[400px]">
          <div className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse h-[386px] w-full lg:w-[400px] " />
          <div className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse h-[372px] w-full lg:w-[400px] " />
        </div>
      </div>
    );
  }

  return (
    <main className="flex mt-8 sm:mt-1 lg:mt-0 lg:flex-row flex-col gap-6  p-3 max-w-7xl mx-auto">
      <section className="flex-1 rounded-2xl p-6 flex flex-col bg-no-repeat bg-[#16171E52] border border-[#FFFFFF29] backdrop-blur-md">
        {/* Token Header */}
        <div className="flex  flex-col lg:flex-row lg:items-center items-start lg:justify-between gap-2">
          <div className="flex flex-row items-center gap-2">
            <div className="h-20 w-20 overflow-hidden rounded-full">
              <Image
                src="/images/cup.png"
                alt="Token Icon"
                className="h-full w-full object-cover"
                width={58}
                height={58}
              />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-[#46FD84]">Long</div>
              <div className="flex items-center gap-1">
                <h2 className="text-3xl font-bold text-white">
                  {tokenData.symbol}
                </h2>

                <div className="flex flex-row items-center gap-2">
                  <span className="text-sm font-semibold text-[#FFFFFFA3]">
                    {tokenData.name}
                  </span>
                  <button
                    className={`hover:text-white transition-colors pointer text-[#FFFFFF52] ${
                      isInWatchlist ? "text-white" : ""
                    } ${
                      isAddingToWatchlist || isRemovingFromWatchlist
                        ? "opacity-50"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist();
                    }}
                    disabled={
                      isLoadingStatus ||
                      isAddingToWatchlist ||
                      isRemovingFromWatchlist
                    }
                    title={
                      isInWatchlist
                        ? "Remove from watchlist"
                        : "Add to watchlist"
                    }
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isInWatchlist ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <button
                    aria-label="Share"
                    tabIndex={0}
                    onClick={handleShare}
                    style={
                      { "--icon-stroke": "#FFFFFF52" } as React.CSSProperties
                    }
                  >
                    <ShareIcon width="20" height="20" />
                  </button>
                </div>
              </div>

              <div className="items-center gap-1 md:flex hidden">
                <div className="flex items-center justify-center rounded-[80px] border border-[#FFFFFF52] w-[25px] h-[25px]">
                  <Image
                    src={"/btc.png"}
                    alt="bitcoin"
                    width={17}
                    height={17}
                  />
                </div>
                <div
                  className="py-[3px] pointer px-3 rounded-[80px] border border-[#FFFFFF52] flex items-center gap-1 text-[#FFFFFF] text-xs font-semibold"
                  onClick={() => {
                    window.navigator.clipboard.writeText(
                      "0x9Af1220630f62084c8b0f6431cDa637622BCa87e"
                    );
                    toast.success("Contract address copied");
                  }}
                  role="button"
                >
                  <span>Contract Address</span>
                  <Copy className="h-[12px] w-[12px]" />
                </div>
                <a
                  className="py-[3px] px-3 pointer rounded-[80px] border border-[#FFFFFF52] flex items-center gap-1 text-[#FFFFFF] text-xs font-semibold"
                  href="https://etherscan.io/"
                  target="_blank"
                  referrerPolicy="no-referrer"
                >
                  <span>View on Block Explorer</span>
                  <ExternalLink className="h-[12px] w-[12px]" />
                </a>
              </div>
            </div>
            {isShareModalOpen && (
              <ShareModal
                tweetUrl={encodeURIComponent(
                  `Check out this prediction market on Bluff!\n\n${url}`
                )}
                url={url}
                onClose={() => setIsShareModalOpen(false)}
              />
            )}
          </div>

          <div className="flex items-center gap-1 mt-2 md:hidden">
            <div className="flex items-center justify-center rounded-[80px] border border-[#FFFFFF52] w-[25px] h-[25px]">
              <Image src={"/btc.png"} alt="bitcoin" width={17} height={17} />
            </div>
            <div className="py-[3px] px-3 rounded-[80px] border border-[#FFFFFF52] flex items-center gap-1 text-[#FFFFFF] text-xs font-semibold">
              <span>Contract Address</span>
              <Copy
                role="button"
                className="pointer h-[12px] w-[12px]"
                onClick={() => {
                  window.navigator.clipboard.writeText(
                    "0x9Af1220630f62084c8b0f6431cDa637622BCa87e"
                  );
                  toast.success("Contract address copied");
                }}
              />
            </div>
            <div className="py-[3px] px-3 rounded-[80px] border border-[#FFFFFF52] flex items-center gap-1 text-[#FFFFFF] text-xs font-semibold">
              <span>Block Explorer</span>
              <a
                href="https://etherscan.io/"
                target="_blank"
                referrerPolicy="no-referrer"
              >
                <ExternalLink className="cursor-pointer h-[12px] w-[12px]" />
              </a>
            </div>
          </div>

          <div className="flex flex-col lg:items-end">
            <span className="text-sm text-green-400">
              +{tokenData.change24h}% last 24h
            </span>
            <span className="text-2xl font-bold text-white">
              ${tokenData.price.toFixed(7)}
            </span>
            <div className="text-sm font-semibold text-[#FFFFFFA3]">
              Volume: {tokenData.volume.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex md:items-center justify-between gap-4 md:flex-row flex-col">
          <div className="mt-6 flex gap-2 border-1 border-[#FFFFFF29] rounded-2xl p-0.5 w-fit">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`rounded-2xl cursor-pointer px-6 py-2 text-sm font-medium transition-colors ${
                  selectedTimeframe === tf.value
                    ? "bg-[#2E3144] text-white"
                    : "bg-transparent text-gray-400 hover:bg-[#3A3D4D]"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FF237F52] py-[2px] rounded-[32px] text-sm px-2">
              Strike Price
            </span>
            <span className="bg-[#8423FF52] py-[2px] rounded-[32px] text-sm px-2">
              Token Price
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 mt-8 min-h-[300px] h-full">
          <TokenPriceChart
            tokenId={tokenId as string}
            timeframe={selectedTimeframe}
          />
        </div>
      </section>

      <section className="w-full lg:w-[400px] flex flex-col gap-4">
        <div className="rounded-2xl flex flex-col gap-4 bg-[#16171E] p-5">
          <h2 className="text-[28px] font-semibold text-[#F2F2FD]">
            Trade Options
          </h2>

          <div className="flex w-full bg-[#2E3144] rounded-[100px] p-1">
            <button
              onClick={() => {
                setSelectedOption("buy");
                setAmount(0);
              }}
              className={`flex-1 text-sm font-semibold  py-2.5 rounded-[100px] text-center transition-all cursor-pointer ${
                selectedOption === "buy"
                  ? "bg-[#46FD84] text-[#070708]"
                  : "text-white hover:bg-[#3A3D4D]"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => {
                setSelectedOption("exercise");
                setAmount(0);
              }}
              className={`flex-1 text-sm font-semibold py-2.5  rounded-[100px] text-center transition-all cursor-pointer ${
                selectedOption === "exercise"
                  ? "bg-[#FF4D4D] text-[#070708]"
                  : "text-white hover:bg-[#3A3D4D]"
              }`}
            >
              Exercise
            </button>
          </div>

          {selectedOption === "buy" ? (
            <Common amount={amount} setAmount={setAmount} type="buy" />
          ) : (
            <Common amount={amount} setAmount={setAmount} type="exercise" />
          )}

          <button
            onClick={() => setIsBuyOptionModalOpen(true)}
            className={cn(
              "w-full text-sm font-semibold text-[#070708] cursor-pointer px-8 py-[13px] rounded-[80px] border-[none]",
              selectedOption === "exercise" ? "bg-[#FF4D4D]" : "bg-[#46FD84]",
              isDisabled && "opacity-50 !cursor-not-allowed"
            )}
            disabled={!amount || amount > 3000}
          >
            {selectedOption === "exercise" ? "Exercise" : "Buy"}
          </button>
        </div>

        <OptionInfo
          optionsAvailable={3000}
          optionsTotal={10000}
          strikePrice={0.005}
          expiry={7}
          costPerOption={0.005}
          isLong={false}
        />
      </section>

      <BuyOptionModal
        title={
          selectedOption === "buy"
            ? "Confirm buy order"
            : "Confirm exercise order"
        }
        isOpen={isBuyOptionModalOpen}
        onClose={() => setIsBuyOptionModalOpen(false)}
        tokenSymbol={tokenData.symbol}
        tokenName={tokenData.name}
        selectedOption={selectedOption}
        tokenImage="/images/cup.png"
        strikePrice={0.005}
        optionCost={0.005}
        amount={amount}
        fees={0.5}
        priceChange={18.5}
        priceChangePercentage={2}
        expiry="7 Days"
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return true;
        }}
      />
    </main>
  );
};

const Common = ({
  amount,
  setAmount,
  type,
}: {
  amount: number;
  setAmount: (value: number) => void;
  type: "buy" | "exercise";
}) => {
  return (
    <>
      <div className="flex  flex-col gap-4 justify-between border border-[#FFFFFF29] p-4 rounded-[8px]">
        <TradeInput amount={amount} setAmount={setAmount} />
      </div>
      <div className="flex  flex-col gap-1 justify-center items-center border border-[#FFFFFF29] p-3 rounded-[8px] h-[62px]">
        {!amount ? (
          <p className=" text-lg font-semibold text-[#FFFFFF52] text-center">
            {type === "buy" ? "Total Cost" : "Estimated Profit"}
          </p>
        ) : (
          <span className="text-[#F2F2FD] text-center text-lg font-semibold">
            $100.23
          </span>
        )}
      </div>

      <div className="flex  gap-4 justify-center items-center border border-[#FFFFFF29] p-3 rounded-[8px]">
        <p className=" text-base font-semibold text-[#FFFFFFA3]">
          Options Balance
        </p>
        <span className=" text-[#F2F2FD] text-2xl font-semibold">3000</span>
      </div>
    </>
  );
};

export default OptionDetails;
