import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const CustomTooltip = ({
  children,
  name,
  align = "center",
  className,
}: {
  children: ReactNode;
  name: ReactNode | string;
  align?: "center" | "end" | "start";
  className?: string;
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          className={cn(
            className,
            "z-[999] bg-gradient-to-br from-[#1C1C28]/95 via-[#2A2A3A]/95 to-[#1C1C28]/95 text-white !border-white/10 !shadow-[20px]",
            "backdrop-blur-xl",
            "shadow-2xl shadow-black/50",
            "border border-white/10",
            "px-4 py-3"
          )}
          align={align}
        >
          {name}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild className="pointer">
        {children}
      </TooltipTrigger>
      <TooltipContent 
        className={cn(
          className,
          "z-[999] bg-gradient-to-br from-[#1C1C28]/95 via-[#2A2A3A]/95 to-[#1C1C28]/95 text-white !border-white/10 !shadow-[20px]",
          "backdrop-blur-xl",
          "shadow-2xl shadow-black/50",
          "border border-white/10",
          "px-4 py-3"
        )} 
        align={align}
      >
        {name}
      </TooltipContent>
    </Tooltip>
  );
};
