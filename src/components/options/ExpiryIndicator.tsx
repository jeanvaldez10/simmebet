import type React from "react";
import { cn } from "@/lib/utils";

interface ExpiryIndicatorProps {
  value: number
  size?: number
  thickness?: number
  color?: string
  backgroundColor?: string
  label?: React.ReactNode
  className?: string
}

export function ExpiryIndicator({
  value,
  size = 32,
  thickness = 3,
  color = "#6366f1",
  backgroundColor = "rgba(99, 102, 241, 0.2)",
  label,
  className,
}: ExpiryIndicatorProps) {
//   const normalizedValue = Math.min(Math.max(value, 0), 1)
  const progress = Math.max(0, (100 - value) / 100)
  
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * progress
  const center = size / 2

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke={backgroundColor} strokeWidth={thickness} />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {label && <div className="absolute inset-0 flex items-center justify-center">{label}</div>}
    </div>
  )
}
