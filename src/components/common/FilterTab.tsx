/* eslint-disable @typescript-eslint/no-unused-vars */
import type { LucideIcon } from "lucide-react";

interface FilterTabProps {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  dot?: boolean;
  dotColor?: string;
  onClick: (label: string) => void;
}

export function FilterTab({
  label,
  icon: Icon,
  active = false,
  dot = false,
  dotColor = "bg-green-500",
  onClick,
}: FilterTabProps) {
  return (
    <button
      className={`px-4 py-1.5 rounded-full flex items-center text-sm whitespace-nowrap relative cursor-pointer ${
        active
          ? "bg-white/10 text-white font-medium"
          : "text-white/70 hover:bg-white/5"
      }`}
      tabIndex={0}
      aria-pressed={active}
      onClick={() => onClick(label)}
    >
      {Icon && <Icon className="w-4 h-4 mr-1.5" />}
      {label}
    </button>
  );
}
