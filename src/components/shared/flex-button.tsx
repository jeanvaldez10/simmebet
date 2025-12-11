"use client";

import type React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlexButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function FlexButton({
  children = "Flex",
  className,
  onClick,
  disabled = false,
}: FlexButtonProps) {
  return (
    <div className="w-full">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden h-[46px] flex items-center justify-center  rounded-full px-8 py-3 pointer text-white font-medium text-lg",
          "bg-gradient-to-r from-[#2E3144] via-[#16171E] to-[#2E3144]",
          "active:scale-95 transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center gap-3 w-full",
          className
        )}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-2 left-8 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse"></div>
          <div
            className="absolute top-4 right-12 w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-3 left-16 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-6 left-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-90 animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute bottom-5 right-8 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-3 right-1/4 w-0.5 h-0.5 bg-white rounded-full opacity-80 animate-pulse"
            style={{ animationDelay: "0.3s" }}
          ></div>
          <div
            className="absolute bottom-2 left-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse"
            style={{ animationDelay: "1.2s" }}
          ></div>
          <div
            className="absolute top-5 right-6 w-0.5 h-0.5 bg-white rounded-full opacity-90 animate-pulse"
            style={{ animationDelay: "0.8s" }}
          ></div>
          <div
            className="absolute bottom-4 right-1/3 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{ animationDelay: "1.8s" }}
          ></div>
          <div
            className="absolute top-1 left-1/2 w-0.5 h-0.5 bg-white rounded-full opacity-70 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        <span className="relative z-10">{children}</span>
        <Upload className="relative z-10 w-5 h-5" />
      </button>
    </div>
  );
}
