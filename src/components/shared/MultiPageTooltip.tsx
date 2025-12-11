"use client";

import { ReactNode, useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface TooltipSlide {
  title: string;
  content: ReactNode;
}

interface MultiPageTooltipProps {
  slides: TooltipSlide[];
  children: ReactNode;
  className?: string;
  align?: "center" | "end" | "start";
}

export const MultiPageTooltip = ({
  slides,
  children,
  className,
  align = "center",
}: MultiPageTooltipProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Preload all background images when tooltip opens
  useEffect(() => {
    if (isOpen) {
      // Preload all background images
      for (let i = 1; i <= slides.length; i++) {
        const img = new Image();
        img.src = `/images/tooltips/backgrounds/slide${i}.png`;
      }
    }
  }, [isOpen, slides.length]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // On last slide, "Got it!" closes the tooltip and resets to first slide
      setIsOpen(false);
      setCurrentSlide(0);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to first slide when closing
      setTimeout(() => setCurrentSlide(0), 200);
    }
  };

  const tooltipContent = (
    <div className="flex flex-col w-full">
      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-4">
        {slides[currentSlide].title}
      </h3>

      {/* Content */}
      <div className="mb-4">
        {slides[currentSlide].content}
      </div>

      {/* Navigation: Buttons and Dots in one row */}
      {slides.length > 1 && (
        <div className="flex items-center justify-between gap-2">
          {/* Back Button or Spacer */}
          {currentSlide > 0 ? (
            <button
              onClick={handleBack}
              className={cn(
                "flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm",
                "bg-[#2E3144] hover:bg-[#3A3D52] text-white",
                "transition-all duration-200 font-medium pointer"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div className="w-[60px]" />
          )}

          {/* Navigation Dots - centered */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300 pointer",
                  index === currentSlide
                    ? "bg-[#ABABAD]"
                    : "bg-[#2F3043] hover:bg-[#ABABAD]/70"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className={cn(
              "flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm w-[80px]",
              "bg-[#36FD68] hover:bg-[#36FD68]/90 text-[#070708]",
              "transition-all duration-200 font-semibold pointer"
            )}
          >
            {currentSlide < slides.length - 1 ? (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              "Got it!"
            )}
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          className={cn(
            "z-[999] text-white !border-white/10",
            "shadow-2xl shadow-black/50 border border-white/10",
            "w-[90vw] max-w-[380px] p-4",
            "bg-[#15161C] bg-cover bg-center bg-no-repeat",
            className
          )}
          style={{
            backgroundImage: `url('/images/tooltips/backgrounds/slide${currentSlide + 1}.png')`,
            backgroundColor: "#15161C",
          }}
          align={align}
        >
          {tooltipContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild className="pointer">
        {children}
      </TooltipTrigger>
      <TooltipContent
        className={cn(
          "z-[999] text-white !border-white/10",
          "shadow-2xl shadow-black/50 border border-white/10",
          "w-[380px] max-w-[90vw] p-5",
          "bg-[#15161C] bg-cover bg-center bg-no-repeat",
          className
        )}
        style={{
          backgroundImage: `url('/images/tooltips/backgrounds/slide${currentSlide + 1}.png')`,
          backgroundColor: "#15161C",
        }}
        align={align}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  );
};

