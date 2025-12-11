import Image from "next/image";
import { useRouter } from "next/navigation";
import { ExpiryIndicator } from "@/components/options/ExpiryIndicator";
import { PortfolioOption } from "@/hooks/portfolio/usePortfolioOptions";
import { useState } from "react";
import { cn } from "@/lib/utils";
import FlexModal from "../modal/flex-modal";
import CircleFlexLottieButton from "@/components/flex-cards/circle-flex-button";
import { createFlexSnapshot } from "@/utils/flexSnapshot";
import { TOptionExerciseForm } from "@/app/(site)/options/hooks/use-option-exercise";
import { TOptionSell } from "@/app/(site)/options/hooks/use-option-sell";
import { TOptionClose } from "@/app/(site)/options/hooks/use-option-close";

export type TOptionBetUpdate = {
  name: string;
  image: string;
  symbol: string;
  type: string;
};

export default function OptionsTableRow(
  headers: PortfolioOption & {
    onSellOpen: (e: TOptionSell) => void;
    onExerciseOpen: (e: TOptionExerciseForm) => void;
    onUpdate: (e: TOptionBetUpdate) => void;
    onClose: (e: TOptionClose) => void;
    isPublic: boolean;
  }
) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState("");
  const {
    tokenImage,
    tokenName,
    token,
    tokenPrice,
    strike,
    expiry,
    expiryDays,
    onSellOpen,
    onExerciseOpen,
    amount,
    type,
    side,
    onClose,
    onUpdate,
    listedPrice,
    isPublic,
  } = headers;

  return (
    <div className="text-[#FFFFFFA3] grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_100px_370px] p-4  transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52]">
      <div className="flex items-center gap-3 w-full col-span-1">
        <div className="w-[60px] h-[60px] rounded-[16px] overflow-hidden bg-gray-800 flex-shrink-0">
          <Image
            src={tokenImage}
            alt={token}
            width={60}
            height={60}
            className="object-cover w-full h-full"
          />
        </div>
        <h2 className=" text-base text-white font-semibold">{token}</h2>
      </div>

      <div
        className={cn(
          "col-span-1 flex items-center text-sm justify-center",
          side === "Short" ? "text-[#FD3748]" : "text-[#36FD68]"
        )}
      >
        {side}
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        {type === "Holding"
          ? "Holding"
          : `Listed for $${listedPrice?.toFixed(2)}`}
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        {tokenPrice}
      </div>

      <div className="col-span-1 flex items-center text-sm justify-center">
        ${strike}
      </div>

      <div className="col-span-1 flex text-sm items-center justify-center gap-1">
        <ExpiryIndicator value={expiry} size={16} thickness={3} />
        <div>{expiryDays}d</div>
      </div>

      <div className="col-span-1 text-sm text-center flex items-center justify-center">
        {amount}
      </div>

      <div className="flex items-center col-span-1 w-full justify-end  text-sm whitespace-nowrap gap-2">
        {!isPublic && (
          <>
            {type === "Holding" ? (
              <>
                <button
                  className="w-[72px] cursor-pointer col-span-1 flex items-center justify-center bg-[#FD3748] py-1 px-3 rounded-[80px] text-[#070708] font-semibold text-xs  my-auto"
                  onClick={() =>
                    onSellOpen({
                      name: tokenName,
                      image: tokenImage,
                      symbol: token,
                      amount: 0,
                      price: 0,
                      type: side,
                    })
                  }
                >
                  Sell
                </button>
                <button
                  className=" w-[72px]  border-[#FFFFFF52] border  cursor-pointer col-span-1 flex items-center justify-center py-1 px-3 rounded-[80px] text-white font-semibold text-xs  my-auto"
                  onClick={() =>
                    onExerciseOpen({
                      name: tokenName,
                      image: tokenImage,
                      symbol: token,
                      amount: 0,
                      expiry: String(expiry),
                      optionBalance: 100,
                      optionCost: 30,
                      type: side,
                      priceImpact: 12,
                      priceImpactPercentage: 0.4,
                      strikePrice: strike,
                      fee: 0.5,
                    })
                  }
                >
                  Exercise
                </button>
              </>
            ) : (
              <>
                <button
                  className=" w-[72px]  border-[#FFFFFF52] border  cursor-pointer col-span-1 flex items-center justify-center py-1 px-3 rounded-[80px] text-white font-semibold text-xs  my-auto"
                  onClick={() => {
                    onUpdate({
                      name: headers.tokenName,
                      image: tokenImage,
                      symbol: token,
                      type: side,
                    });
                  }}
                >
                  Update
                </button>
                <button
                  className=" w-[72px] border-[#FFFFFF52] border  cursor-pointer col-span-1 flex items-center justify-center py-1 px-3 rounded-[80px] text-white font-semibold text-xs  my-auto"
                  onClick={() =>
                    onClose({
                      name: tokenName,
                      image: tokenImage,
                      symbol: token,
                      type: side,
                      listPrice: 555,
                      optionListed: 121,
                    })
                  }
                >
                  Close
                </button>
              </>
            )}
          </>
        )}

        <button
          className="bg-transparent border-1 cursor-pointer border-[#FFFFFF52]  px-3 md:px-4 py-1 rounded-xl text-xs font-semibold text-[#FFFFFF] transition-colors"
          aria-label="View Market"
          tabIndex={0}
          onClick={() => router.push(`/options/1`)}
        >
          View Options
        </button>

        <CircleFlexLottieButton
          onClick={async () => {
            setIsShareModalOpen("loading");
            try {
              // Use server-side OG generation like bet cards
              const result = await createFlexSnapshot(side === "Short" ? "flex13" : "flex14");
              const imageUrl = `/api/og/flex?snapshotId=${result.snapshotId}`;
              setIsShareModalOpen(imageUrl);
            } catch (error) {
              console.error('Error creating options snapshot:', error);
              setIsShareModalOpen(""); // Close modal on error
            }
          }}
        />
        {/* <a
          href="https://etherscan.io"
          target="_blank"
          referrerPolicy="no-referrer"
        >
          <SquareArrowOutUpRight className="w-[20px] h-[20px] cursor-pointer" />
        </a> */}
      </div>
      {isShareModalOpen && (
        <FlexModal
          isLoading={isShareModalOpen === "loading"}
          image={isShareModalOpen}
          type={side === "Short" ? "flex13" : "flex14"}
          onClose={() => setIsShareModalOpen("")}
        />
      )}
    </div>
  );
}
