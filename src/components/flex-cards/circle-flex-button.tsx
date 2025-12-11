"use client";

import Lottie from "lottie-react";
import FlexLottieAnimation from "../../../public/circle_flex.json";
import { cn } from "@/lib/utils";
import ShareIcon from "../shared/share-icon";

const CircleFlexLottieButton = ({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <button
      className={cn(
        "w-[27px] h-[27px] shrink-0 overflow-hidden rounded-full flex items-center justify-center pointer relative",
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
        className="!cursor-pointer w-full h-full"
      />

      <span
        className="!cursor-pointer absolute inset-0 flex items-center justify-center z-10 ml-[0.4px]"
        style={
          {
            width: "100%",
            height: "100%",
            transform: "translateY(-1.2px)",
            "--icon-stroke": "#FFFFFF",
          } as React.CSSProperties
        }
      >
        <div
          style={{
            width: "15px",
            height: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShareIcon width="15" height="15" />
        </div>
      </span>
    </button>
  );
};

export default CircleFlexLottieButton;
