"use client";

import Lottie from "lottie-react";
import FlexLottieAnimation from "../../../public/big_flex_button.json";
import { cn } from "@/lib/utils";
import ShareIcon from "../shared/share-icon";

const BigFlexLottieButton = ({
  className,
  onClick,
  text = "Flex",
}: {
  className?: string;
  onClick?: () => void;
  text?: string;
}) => {
  return (
    <button
      className={cn(
        "w-full !h-[46px] rounded-full flex items-center justify-center pointer relative",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <Lottie
        animationData={FlexLottieAnimation}
        loop
        className="!cursor-pointer w-full"
      />

      <div className="!cursor-pointer absolute inset-0 flex items-center justify-center gap-1 text-[#FFFFFF] text-sm font-semibold z-10">
        {text}{" "}
        <div style={{ "--icon-stroke": "#FFFFFF" } as React.CSSProperties}>
          <ShareIcon width="20" height="20" />
        </div>
      </div>
    </button>
  );
};

export default BigFlexLottieButton;
