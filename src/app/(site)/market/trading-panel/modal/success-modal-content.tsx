import Button from "@/components/Button";
import BigFlexLottieButton from "@/components/flex-cards/big-flex-button";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

const SuccessModalContent = ({
  title,
  desc,
  amount,
  onFlexClick,
  onClick,
  isClaim = false,
  amountNode,
  buttonNode,
  txHash,
  requestResponse,
  flexButtonText = "Flex",
  liquidityNftId,
}: {
  title: string;
  desc: string;
  amount: number;
  onFlexClick: (flexType?: "flex10" | "flex12") => void;
  onClick: () => void;
  isClaim?: boolean;
  amountNode?: ReactNode;
  buttonNode?: ReactNode;
  txHash?: `0x${string}` | null;
  requestResponse?: { yes?: string, no?: string };
  flexButtonText?: string;
  flexType?: "flex10" | "flex12";
  liquidityNftId?: string | null;
}) => {
  return (
    <div className="w-full">
      <h2 className="text-[#F2F2FD] font-semibold text-xl text-center">
        {title}
      </h2>
      <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
        {desc}
      </p>

      {amountNode ? (
        amountNode
      ) : (
        <p
          className={cn(
            "text-sm font-normal mt-3 text-center"
          )}
          data-amount={amount}
        >
          {requestResponse?.no && (
            <>
              <span className="text-[#D32B3F] text-sm font-normal mt-3 text-center">
                {requestResponse.no} NO
              </span>
              {requestResponse?.yes && ' | '}
            </>
          )}
          {requestResponse?.yes && (
            <span className="text-[#36FD68] text-sm font-normal mt-3 text-center">
              {requestResponse.yes} YES
            </span>
          )}
          {!requestResponse?.no && !requestResponse?.yes && (
            <span className="text-[#F2F2FD] text-sm font-normal mt-3 text-center">
              {amount} USD bet placed
            </span>
          )}
        </p>
      )}

      {txHash && (
        <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
          <a href={`https://arbiscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
            View on Arbiscan
          </a>
        </p>
      )}

      {liquidityNftId && (
        <p className="text-[#F2F2FD] text-sm font-semibold mt-2 text-center">
          <a href={`https://app.uniswap.org/positions/v4/arbitrum/${liquidityNftId}`} target="_blank" rel="noopener noreferrer">
            View Liquidity Position on Uniswap
          </a>
        </p>
      )}

      {buttonNode ? (
        buttonNode
      ) : (
        <div className="w-full flex flex-col gap-2 mt-5">
          <BigFlexLottieButton onClick={() => onFlexClick()} text={flexButtonText} />
          {!isClaim && <Button onClick={onClick}>Go to Market</Button>}
        </div>
      )}
    </div>
  );
};

export default SuccessModalContent;
