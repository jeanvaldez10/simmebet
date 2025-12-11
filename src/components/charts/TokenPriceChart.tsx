/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Label,
  ReferenceDot,
} from "recharts";
import { useTokenChartData } from "@/hooks/options/useTokenChartData";
// Removed date-fns import

interface TokenPriceChartProps {
  tokenId: string;
  timeframe: "1D" | "1W" | "1M" | "1Y";
}

const TokenPriceChart = ({ tokenId, timeframe }: TokenPriceChartProps) => {
  const [crosshair, setCrosshair] = useState<{
    x: number;
    y: number;
    price: number;
    strikePrice: number;
    timestamp: number;
    index: number;
  } | null>(null);

  const { data } = useTokenChartData(tokenId, timeframe);

  // Memoize the array so its reference only changes when the underlying data changes
  const chartData = useMemo(() => data ?? [], [data]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  // Unified mouse move handler leveraging stable chart coordinates to prevent flicker
  const handleChartMouseMove = (e: any) => {
    // Ensure the mouse is over chart area with a tooltip index
    if (!e || e.activeTooltipIndex == null) return;

    const idx: number = e.activeTooltipIndex;
    const dataPoint = chartData[idx];
    if (!dataPoint) return;

    // Coordinates: prefer the exact point coordinates if provided, otherwise use
    // the cursor's chart coordinates.
    const x = (e as any).activeCoordinate?.x ?? e.chartX;
    const y = (e as any).activeCoordinate?.y ?? e.chartY;

    setCrosshair((prev) => {
      if (prev && prev.index === idx && prev.x === x && prev.y === y) {
        return prev; // nothing changed
      }

      return {
        x,
        y,
        price: dataPoint.price,
        strikePrice: dataPoint.strikePrice,
        timestamp: dataPoint.timestamp,
        index: idx,
      };
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only clear the crosshair if the pointer actually left the entire wrapper,
    // not when moving between children within it.
    const currentTarget = e.currentTarget as HTMLElement;
    const related = e.relatedTarget as HTMLElement | null;

    if (related instanceof Node && currentTarget.contains(related)) {
      // Pointer is still inside the wrapper—don't clear.
      return;
    }

    setCrosshair(null);
  };

  // Build segmented data with leftPrice (purple) and rightPrice (gray)
  const segmentedData = useMemo(() => {
    return chartData.map((d: any, i: number) => {
      const index = crosshair?.index ?? chartData.length - 1;
      return {
        ...d,
        leftPrice: i <= index ? d.price : null,
        rightPrice: i >= index ? d.price : null,
      };
    });
  }, [chartData, crosshair?.index]);

  // Compute the minimum Y value in the dataset to anchor the vertical line at the
  // bottom of the chart. Include both price and strikePrice values.
  const minY = useMemo(() => {
    if (chartData.length === 0) return 0;
    let min = Number.POSITIVE_INFINITY;
    chartData.forEach((d: any) => {
      if (typeof d.price === "number") min = Math.min(min, d.price);
      if (typeof d.strikePrice === "number") min = Math.min(min, d.strikePrice);
    });
    return min;
  }, [chartData]);

  return (
    <div
      className="w-full h-[300px] relative md:h-full"
      onMouseLeave={handleMouseLeave}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          className="bg-transparent"
          margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
          onMouseMove={handleChartMouseMove}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B3DFF" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#8B3DFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="1 1"
            stroke="rgba(46, 49, 68, 0.3)"
            horizontal={true}
            vertical={true}
          />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={["dataMin", "dataMax"]}
            scale="time"
            tickFormatter={formatXAxis}
            stroke="rgba(46, 49, 68, 0.6)"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(46, 49, 68, 0.6)" }}
            tickLine={{ stroke: "rgba(46, 49, 68, 0.6)" }}
            tickCount={6}
            minTickGap={50}
          />
          <YAxis
            stroke="rgba(46, 49, 68, 0.6)"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(46, 49, 68, 0.6)" }}
            tickLine={{ stroke: "rgba(46, 49, 68, 0.6)" }}
            tickCount={8}
            domain={["dataMin - 2", "dataMax + 2"]}
            tickFormatter={(value) => value.toPrecision(4)}
            width={50}
          />

          {/* Crosshair lines */}

          {crosshair?.price != null && (
            <ReferenceLine
              y={crosshair.price}
              stroke="#8B3DFF"
              strokeDasharray="3 3"
              strokeWidth={1}
              opacity={0.8}
            >
              <Label
                position="left"
                content={({ viewBox }) => {
                  const { x, y }: any = viewBox;
                  return (
                    <foreignObject
                      x={x - 50}
                      y={y - 12}
                      width={50}
                      height={24}
                      style={{ pointerEvents: "none" }}
                    >
                      <div
                        className="bg-[#8B3DFF] text-white text-[10px] font-mono rounded text-center px-1 truncate"
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {crosshair?.price.toPrecision(4)}
                      </div>
                    </foreignObject>
                  );
                }}
              />
            </ReferenceLine>
          )}

          {crosshair?.strikePrice != null && (
            <ReferenceLine
              y={crosshair.strikePrice}
              stroke="#FF6B9D"
              strokeDasharray="1 1"
              strokeWidth={1}
              opacity={0.8}
            >
              <Label
                position="left"
                content={({ viewBox }) => {
                  const { x, y }: any = viewBox;
                  return (
                    <foreignObject
                      x={x - 50}
                      y={y - 12}
                      width={50}
                      height={24}
                      style={{ pointerEvents: "none" }}
                    >
                      <div
                        className="bg-[#FF6B9D] text-white text-[10px] font-mono rounded text-center px-1 truncate"
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {crosshair?.strikePrice}
                      </div>
                    </foreignObject>
                  );
                }}
              />
            </ReferenceLine>
          )}
          <Tooltip cursor={false} contentStyle={{ display: "none" }} />

          {/* Strike Price Line */}
          <Line
            type="monotone"
            dataKey="strikePrice"
            stroke="#FF6B9D"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
            activeDot={false}
            isAnimationActive={false}
          />

          {/* Purple segment (left) */}
          <Line
            key="purpleSeg"
            type="monotone"
            data={segmentedData}
            dataKey="leftPrice"
            stroke="#8B3DFF"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            connectNulls={false}
          />

          {/* Custom dot tied to crosshair */}
          {crosshair && (
            <ReferenceDot
              x={crosshair.timestamp}
              y={crosshair.price}
              r={4}
              fill="#8B3DFF"
              stroke="#ffffff"
              strokeWidth={1}
              isFront
            />
          )}

          {/* Gray segment (right) overlays */}
          <Line
            key="graySeg"
            type="monotone"
            data={segmentedData}
            dataKey="rightPrice"
            stroke="#7E7E94"
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
            connectNulls={false}
          />

          {/* Vertical crosshair line from dot down to chart bottom */}
          {crosshair && (
            <ReferenceLine
              key="vCrosshair"
              segment={[
                { x: crosshair.timestamp, y: crosshair.price },
                { x: crosshair.timestamp, y: minY },
              ]}
              stroke="#8B3DFF"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.8}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TokenPriceChart;
