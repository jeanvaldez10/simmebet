import React, { useEffect, useState } from "react";

interface SimpleChartProps {
  data?: number[];
  isNegative?: boolean;
}

const generateMockData = () => {
  const base = 0.0000007;
  const points = 50;
  const values: number[] = [];
  let last = base;

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * 0.0000004;
    const trend = Math.sin(i / 5) * 0.0000002;
    const val = Math.max(0.0000001, last + noise + trend);
    last = val;
    values.push(val);
  }

  return values;
};

const SimpleChart = ({
  data: propData,
  isNegative = false,
}: SimpleChartProps) => {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    if (propData && propData.length > 0) {
      setData(propData);
    } else {
      setData(generateMockData());
    }
  }, [propData]);

  if (data.length === 0) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  const createPath = () => {
    const width = 100;
    const height = 100;
    const stepX = width / (data.length - 1);

    return data
      .map((value, index) => {
        const x = index * stepX;
        const y = height - ((value - minValue) / range) * height;
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");
  };

  const createAreaPath = () => {
    const width = 100;
    const height = 100;
    const stepX = width / (data.length - 1);

    const line = data
      .map((value, index) => {
        const x = index * stepX;
        const y = height - ((value - minValue) / range) * height;
        return index === 0 ? `M ${x} ${height} L ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");

    return `${line} L ${(data.length - 1) * stepX} ${height} Z`;
  };

  const gradientId = `gradient-${isNegative ? "red" : "green"}`;
  const color = isNegative ? "#ef4444" : "#10b981";

  return (
    <div className="w-full h-full">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Gradient Area */}
        <path d={createAreaPath()} fill={`url(#${gradientId})`} />

        {/* Line Chart */}
        <path
          d={createPath()}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default SimpleChart;
