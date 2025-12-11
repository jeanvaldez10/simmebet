"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import { CgCloseO } from "react-icons/cg";
import { cn } from "@/lib/utils";
import BigFlexLottieButton from "@/components/flex-cards/big-flex-button";
import {
  ErrorComp,
  Pending,
  Success,
} from "@/components/lottie/success-animation";

export const PENDING_MESSAGES = {
  TITLE: "Pending transaction",
  SUBTITLE: "It might take a couple minutes to complete your transaction.",
  BUTTON_TEXT: "Please wait..."
} as const;

export type SuccessType =
  | "success"
  | "purchase"
  | "sell"
  | "deposit"
  | "withdrawal"
  | "option"
  | "option_fail"
  | "option_pending";

type SuccessModalProps = {
  type: SuccessType;
  title: string;
  subtitle?: string;
  amount?: string;
  isPositive?: boolean;
  buttonText?: string;
  secondaryButtonText?: string;
  txHash?: `0x${string}` | null;
  onButtonClick: () => void;
  onClose: () => void;
  secondaryButton?: boolean;
  secondaryButtonClick?: () => void;
  children?: ReactNode;
  width?: string;
  // nftId?: string | null;
};

const SuccessModal: React.FC<SuccessModalProps> = ({
  type = "success",
  title,
  subtitle,
  amount,
  isPositive = true,
  buttonText = "Go to Markets",
  onButtonClick,
  onClose,
  txHash,
  secondaryButton = false,
  secondaryButtonClick,
  secondaryButtonText,
  children,
  width = "w-[364px]",
  // nftId,
}) => {
  const getBackgroundStyle = () => {
    switch (type) {
      case "success":
      case "deposit":
        return {
          backgroundImage: "url('/images/successModalBg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      case "option":
        return {
          background: "#16171E",
        };
      case "option_fail":
        return {
          background: "#16171E",
        };
      case "option_pending":
        return {
          backgroundImage: "url('/images/pending-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      case "sell":
      case "purchase":
      case "withdrawal":
      default:
        return {
          backgroundImage: "url('/images/successModalBg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
    }
  };

  const getIconSrc = () => {
    switch (type) {
      case "success":
      case "deposit":
        return "/images/success-buy.png";
      case "option":
        return "/images/option-success.png";
      case "option_fail":
        return "/error.png";
      case "option_pending":
        return "/pending-option.png";
      case "sell":
      case "purchase":
      case "withdrawal":
      default:
        return "/images/option-success.png";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn("relative z-50", width)}>
        <div
          className={cn(
            "relative p-5 flex flex-col items-center rounded-lg overflow-hidden",
            type === "option_pending" ? "" : ""
          )}
          style={{
            ...getBackgroundStyle(),
            animationDuration: type === "option_pending" ? "3s" : undefined
          }}
        >
          <button
            onClick={type === "option_pending" ? () => {} : onClose}
            disabled={type === "option_pending"}
            className={cn(
              "absolute top-4 right-4 transition-colors pointer",
              type === "option_pending" 
                ? "text-gray-600 cursor-not-allowed" 
                : "text-gray-400 hover:text-white"
            )}
            aria-label="Close"
          >
            <CgCloseO className="h-6 w-6" />
          </button>

          <div className={cn(
            "mb-6 flex items-center justify-center",
            type === "option_pending" ? "relative" : ""
          )}>
            {type === "option" || type === "success" ? (
              <Success />
            ) : type === "option_fail" ? (
              <ErrorComp />
            ) : type === "option_pending" ? (
              <div className="relative">
                {/* Large atmospheric blur background */}
                <div
                  className="w-[366px] h-[366px] blur-[80px] absolute top-[-50%] left-1/2 transform -translate-x-1/2"
                />
                <div className="relative z-10">
                  <Pending />
                </div>
              </div>
            ) : (
              <Image
                src={getIconSrc()}
                alt={type}
                width={120}
                height={120}
                className="object-contain"
              />
            )}
          </div>

          {children ? (
            children
          ) : (
            <>
              <h2 className="text-xl font-semibold text-[#F2F2FD] mb-2 text-center">
                {title}
              </h2>

              {subtitle && (
                <p className="text-[#F2F2FD] font-semibold text-md mb-4 text-center text-sm">
                  {subtitle}
                </p>
              )}

              {amount && (
                <div className="text-base font-semibold text-[#4efa9c] mb-4 mt-[-10px]">
                  {isPositive ? "+ " : "- "}
                  {amount}
                </div>
              )}

              {txHash && (
                <div className="text-gray-300 font-semibold text-md mb-4 text-center">
                  <a
                    href={`https://arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Arbiscan
                  </a>
                </div>
              )}

              {buttonText && secondaryButton && !secondaryButtonText ? (
                <>
                  <BigFlexLottieButton onClick={type === "option_pending" ? () => {} : secondaryButtonClick} />
                  <button
                    onClick={type === "option_pending" ? () => {} : onButtonClick}
                    disabled={type === "option_pending"}
                    className={cn(
                      "w-full mt-4 py-3 h-[46px] rounded-full font-semibold text-sm transition-colors",
                      type === "option_pending" 
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                        : "bg-white text-black hover:bg-opacity-90 cursor-pointer"
                    )}
                  >
                    {type === "option_pending" ? PENDING_MESSAGES.BUTTON_TEXT : buttonText}
                  </button>
                </>
              ) : buttonText && secondaryButton && secondaryButtonText ? (
                <>
                  <button
                    onClick={type === "option_pending" ? () => {} : onButtonClick}
                    disabled={type === "option_pending"}
                    className={cn(
                      "w-full py-3 h-[46px] rounded-full font-semibold text-sm transition-colors",
                      type === "option_pending" 
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                        : "bg-white text-black hover:bg-opacity-90 cursor-pointer"
                    )}
                  >
                    {type === "option_pending" ? PENDING_MESSAGES.BUTTON_TEXT : buttonText}
                  </button>
                  <button
                    onClick={type === "option_pending" ? () => {} : secondaryButtonClick}
                    disabled={type === "option_pending"}
                    className={cn(
                      "w-full mt-4 py-3 h-[46px] rounded-full font-semibold text-sm transition-colors",
                      type === "option_pending" 
                        ? "text-white/30 border-white/10 border cursor-not-allowed" 
                        : "text-white border-[#FFFFFF52] border hover:bg-opacity-90 cursor-pointer"
                    )}
                  >
                    {type === "option_pending" ? PENDING_MESSAGES.BUTTON_TEXT : secondaryButtonText}
                  </button>
                </>
              ) : secondaryButton ? (
                <BigFlexLottieButton onClick={type === "option_pending" ? () => {} : secondaryButtonClick} />
              ) : (
                <button
                  onClick={type === "option_pending" ? () => {} : onButtonClick}
                  disabled={type === "option_pending"}
                  className={cn(
                    "w-full py-3 h-[46px] rounded-full font-semibold text-sm transition-colors",
                    type === "option_pending" 
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                      : "bg-white text-black hover:bg-opacity-90 cursor-pointer"
                  )}
                >
                  {type === "option_pending" ? PENDING_MESSAGES.BUTTON_TEXT : buttonText}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;

export const HorizontalLine = () => {
  return <div className="w-full h-[1px] bg-[rgba(255,255,255,0.16)]" />;
};
