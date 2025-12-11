import React from "react";

interface CircularProgressProps {
  positivePercentage: number;
  negativePercentage: number;
  size?: number;
  strokeWidth?: number;
  positiveColor?: string;
  negativeColor?: string;
  textColor?: string;
  className?: string;
  showText?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  positivePercentage,
  negativePercentage,
  size = 48,
  strokeWidth = 4,
  positiveColor = "#46FD84",
  negativeColor = "#FF4D4D",
  className = "",
  showText = true,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;

  const circumference = 2 * Math.PI * radius;

  const positiveDashArray = `${
    (positivePercentage / 100) * circumference
  } ${circumference}`;
  const negativeDashArray = `${
    (negativePercentage / 100) * circumference
  } ${circumference}`;

  const negativeRotation = (positivePercentage / 100) * 360;

  const formatTextColor =
    positivePercentage > negativePercentage
      ? "#46FD84"
      : negativePercentage > positivePercentage
      ? "#FF4D4D"
      : "white";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={positivePercentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 drop-shadow-md"
        style={{
          filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"
        }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={positiveColor}
          strokeWidth={strokeWidth}
          strokeDasharray={positiveDashArray}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={negativeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={negativeDashArray}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
          style={{
            transform: `rotate(${negativeRotation}deg)`,
            transformOrigin: "center",
          }}
        />

        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[11px] font-semibold"
          fill={formatTextColor}
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${center}px ${center}px`,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {showText ? `${Math.round(positivePercentage)}%` : ""}
        </text>
      </svg>
    </div>
  );
};
