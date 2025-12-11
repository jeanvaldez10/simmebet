/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartFilter } from "./ChartFilter";
import type { FormattedSwap } from "@/generated/prisma";

interface PriceChartProps {
  swaps: FormattedSwap[];
  className?: string;
}

interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  yes: number;
  no: number;
  timestamp: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const yesValue = (Number(payload[0]?.value || 0) * 100).toFixed(2);
  const noValue = (Number(payload[1]?.value || 0) * 100).toFixed(2);

  const timestamp = new Date(payload[0].payload.timestamp).toLocaleTimeString(
    "en-US",
    { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }
  );

  return (
    <div className="bg-[#2E3144] px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.16)]">
      <div className="flex items-center gap-2">
        <span className="text">Time:</span>
        <span className="text-white font-medium">{timestamp}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#FF4D4D]">No:</span>
        <span className="text-white font-medium">{noValue}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[#46FD84]">Yes:</span>
        <span className="text-white font-medium">{yesValue}%</span>
      </div>
    </div>
  );
};

const processSwapsData = (swaps: FormattedSwap[], interval: string) => {
  // No data case
  if (!swaps || swaps.length === 0) return [];

  let groupedData: { [key: string]: OHLCV };
  
  switch (interval) {
    case "15m":
      // Group into 15 minute blocks
      const fifteenMinBlocks: { [key: string]: FormattedSwap[] } = {};
      swaps.forEach((swap) => {
        const date = new Date(swap.timestamp);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = Math.floor(date.getMinutes() / 15) * 15;
        const minuteStr = String(minute).padStart(2, "0");
        const blockKey = `${year}-${month}-${day}-${hour}-${minuteStr}`;
        if (!fifteenMinBlocks[blockKey]) fifteenMinBlocks[blockKey] = [];
        fifteenMinBlocks[blockKey].push(swap);
      });

      groupedData = Object.entries(fifteenMinBlocks).reduce(
        (acc, [blockKey, block]) => {
          const prices = block.map((swap) => swap.price);
          const volume = block.reduce(
            (acc, swap) => acc + Number(swap.volume),
            0
          );
          const close = prices[prices.length - 1];

          return {
            ...acc,
            [blockKey]: {
              yes: close.toFixed(4),
              no: (1 - close).toFixed(4),
              open: prices[0],
              high: Math.max(...prices),
              low: Math.min(...prices),
              close: prices[prices.length - 1],
              volume,
              timestamp: block[block.length - 1].timestamp.toLocaleString(),
            },
          };
        },
        {}
      );
      break;

    case "1H":
      // Group into 1 hour blocks
      const hourBlocks: { [key: string]: FormattedSwap[] } = {};
      swaps.forEach((swap) => {
        const date = new Date(swap.timestamp);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, "0");
        const blockKey = `${year}-${month}-${day}-${hour}`;
        if (!hourBlocks[blockKey]) hourBlocks[blockKey] = [];
        hourBlocks[blockKey].push(swap);
      });

      groupedData = Object.entries(hourBlocks).reduce(
        (acc, [blockKey, block]) => {
          const prices = block.map((swap) => swap.price);
          const volume = block.reduce(
            (acc, swap) => acc + Number(swap.volume),
            0
          );
          const close = prices[prices.length - 1];

          return {
            ...acc,
            [blockKey]: {
              yes: close.toFixed(4),
              no: (1 - close).toFixed(4),
              open: prices[0],
              high: Math.max(...prices),
              low: Math.min(...prices),
              close: prices[prices.length - 1],
              volume,
              timestamp: block[block.length - 1].timestamp.toLocaleString(),
            },
          };
        },
        {}
      );
      break;

    case "4H":
      // Group into 4 hour blocks
      const fourHourBlocks: { [key: string]: FormattedSwap[] } = {};
      swaps.forEach((swap) => {
        const date = new Date(swap.timestamp);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const hour = Math.floor(date.getHours() / 4) * 4;
        const hourStr = String(hour).padStart(2, "0");
        const blockKey = `${year}-${month}-${day}-${hourStr}`;
        if (!fourHourBlocks[blockKey]) fourHourBlocks[blockKey] = [];
        fourHourBlocks[blockKey].push(swap);
      });

      groupedData = Object.entries(fourHourBlocks).reduce(
        (acc, [blockKey, block]) => {
          const prices = block.map((swap) => swap.price);
          const volume = block.reduce(
            (acc, swap) => acc + Number(swap.volume),
            0
          );
          const close = prices[prices.length - 1];

          return {
            ...acc,
            [blockKey]: {
              yes: close.toFixed(4),
              no: (1 - close).toFixed(4),
              open: prices[0],
              high: Math.max(...prices),
              low: Math.min(...prices),
              close: prices[prices.length - 1],
              volume,
              timestamp: block[block.length - 1].timestamp.toLocaleString(),
            },
          };
        },
        {}
      );
      break;

    case "1D":
      // Group into day blocks
      const dayBlocks: { [key: string]: FormattedSwap[] } = {};
      swaps.forEach((swap) => {
        const date = new Date(swap.timestamp);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const blockKey = `${year}-${month}-${day}`;
        if (!dayBlocks[blockKey]) dayBlocks[blockKey] = [];
        dayBlocks[blockKey].push(swap);
      });
      
      groupedData = Object.entries(dayBlocks).reduce(
        (acc, [blockKey, block]) => {
          const prices = block.map((swap) => swap.price);
          const volume = block.reduce(
            (acc, swap) => acc + Number(swap.volume),
            0
          );
          return {
            ...acc,
            [blockKey]: {
              yes: prices[prices.length - 1].toFixed(4),
              no: (1 - prices[prices.length - 1]).toFixed(4),
              open: prices[0],
              high: Math.max(...prices),
              low: Math.min(...prices),
              close: prices[prices.length - 1],
              volume,
              timestamp: block[block.length - 1].timestamp,
            },
          };
        },
        {}
      );
      break;

    default:
      // Default to 1H if invalid interval
      return processSwapsData(swaps, "1H");
  }

  return Object.values(groupedData).sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
};

const formatXAxisLabel = (timestamp: string, interval: string) => {
  const date = new Date(timestamp);
  
  switch (interval) {
    case "15m":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    case "1H":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    case "4H":
      return date.toLocaleTimeString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        hour12: false
      });
    case "1D":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    default:
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
  }
};

export const PriceChart: React.FC<PriceChartProps> = ({
  swaps,
  className = "",
}) => {
  const [selectedInterval, setSelectedInterval] = useState("1H");

  const chartData = useMemo(() => {
    if (!swaps || !swaps.length) return [];
    return processSwapsData(swaps, selectedInterval);
  }, [swaps, selectedInterval]);

  // Handle interval change
  const handleIntervalChange = (interval: string) => {
    setSelectedInterval(interval);
  };

  if (!chartData.length) {
    return (
      <div className={`w-full ${className}`}>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-white text-sm">
            No data available for the selected time range
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full  ${className}`}>
      <div className="h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="gradientYes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#46FD84" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#46FD84" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientNo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF4D4D" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#FF4D4D" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 8"
              horizontal={true}
              vertical={false}
              stroke="rgba(255,255,255,0.08)"
            />

            <XAxis
              dataKey="timestamp"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 14 }}
              padding={{ left: 0, right: 0 }}
              interval="preserveStartEnd"
              tickFormatter={(value) => formatXAxisLabel(value, selectedInterval)}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 14 }}
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              tickFormatter={(value) => `${value * 100}%`}
              width={60}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="no"
              stroke="#46FD84"
              strokeWidth={2}
              fill="url(#gradientYes)"
              dot={false}
              activeDot={{ r: 4, fill: "#46FD84" }}
              isAnimationActive={false}
            />

            <Area
              type="monotone"
              dataKey="yes"
              stroke="#FF4D4D"
              strokeWidth={2}
              fill="url(#gradientNo)"
              dot={false}
              activeDot={{ r: 4, fill: "#FF4D4D" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ChartFilter
        selectedInterval={selectedInterval}
        onIntervalChange={handleIntervalChange}
        className="mb-4"
      />
    </div>
  );
};
