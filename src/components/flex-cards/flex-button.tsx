"use client";

import Lottie from "lottie-react";
import FlexLottieAnimation from "../../../public/lottie/flex_new_button.json";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import ShareIcon from "../shared/share-icon";

const FlexLottieButton = ({
  className,
  children,
  text = "Flex",
  onClick,
}: {
  className?: string;
  children?: ReactNode;
  text?: string;
  onClick?: () => void;
}) => {
  return (
    <button
      className={cn("w-full h-full !cursor-pointer relative", className)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={text || "Flex"}
      aria-label={text || "Flex"}
    >
      <Lottie
        animationData={FlexLottieAnimation}
        loop
        className="!cursor-pointer"
      />

      {children || (
        <span className="!cursor-pointer absolute inset-0 flex items-center justify-center text-[#FFFFFF] text-sm font-semibold z-10 gap-1 ">
          {text}{" "}
          <div style={{ "--icon-stroke": "#FFFFFF" } as React.CSSProperties}>
            <ShareIcon width="20" height="20" />
          </div>
        </span>
      )}
    </button>
  );
};

export default FlexLottieButton;
