import React from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

interface TradeData {
  price: number;
  shares: number;
  total: number;
  height: number;
}

interface LiquiditySpreadV2Props {
  className?: string;
  lastPrice?: number;
  spread?: number;
}

// Shape props for recharts
interface ShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}

const YES_DATA: TradeData[] = [
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 30 },
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 60 },
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 90 },
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 70 },
];

const NO_DATA: TradeData[] = [
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 25 },
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 45 },
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 75 },
  { price: 3.9, shares: 27654.16, total: 1285.93, height: 55 },
];

const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;
const formatNumber = (value: number): string => value.toLocaleString();

export const LiquiditySpreadV2: React.FC<LiquiditySpreadV2Props> = ({
  className = "",
  lastPrice = 3.6,
  spread = 0.4,
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <h2 className="text-3xl font-bold text-white mb-6">Liquidity Spread</h2>

      <div className="flex gap-6 mb-6">
        <button className="text-2xl font-bold text-white cursor-pointer">
          Trade Yes
        </button>
        <button className="text-2xl font-bold text-gray-500 cursor-pointer">
          Trade No
        </button>
      </div>

      {/* Trade Yes Section */}
      <div className="bg-[#16171E] rounded-2xl mb-4 overflow-hidden w-full">
        <div className="p-6">
          <div className="grid grid-cols-4 text-gray-400 border-b border-gray-800 pb-2 mb-4">
            <div>Trade Yes</div>
            <div>Price</div>
            <div>Shares</div>
            <div>Total</div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Chart */}
            <div>
              <div className="h-[160px] flex items-end">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={YES_DATA}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="greenGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#46FD84" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#46FD84"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="height"
                      fill="url(#greenGradient)"
                      shape={(props: ShapeProps) => {
                        const {
                          x = 0,
                          y = 0,
                          width = 0,
                          height = 0,
                          fill = "",
                        } = props;
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={fill}
                            rx={4}
                          />
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Column */}
            <div className="space-y-3">
              {YES_DATA.map((item, index) => (
                <div key={`price-${index}`} className="text-white">
                  {formatCurrency(item.price)}
                </div>
              ))}
            </div>

            {/* Shares Column */}
            <div className="space-y-3">
              {YES_DATA.map((item, index) => (
                <div key={`shares-${index}`} className="text-white">
                  {formatNumber(item.shares)}
                </div>
              ))}
            </div>

            {/* Total Column */}
            <div className="space-y-3">
              {YES_DATA.map((item, index) => (
                <div key={`total-${index}`} className="text-white">
                  {formatCurrency(item.total)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#16171E] rounded-2xl mb-4 overflow-hidden w-full">
        <div className="p-6">
          <div className="grid grid-cols-4 text-gray-400 border-b border-gray-800 pb-2 mb-4">
            <div>Last: ${lastPrice?.toFixed(2)}</div>
            <div>Spread: ${spread?.toFixed(1)}</div>
            <div>Shares</div>
            <div>Total</div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* Chart */}
            <div>
              <div className="h-[160px] flex items-end">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={NO_DATA}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="redGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#FF4D4D" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#FF4D4D"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="height"
                      fill="url(#redGradient)"
                      shape={(props: ShapeProps) => {
                        const {
                          x = 0,
                          y = 0,
                          width = 0,
                          height = 0,
                          fill = "",
                        } = props;
                        return (
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={fill}
                            rx={4}
                          />
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Price Column */}
            <div className="space-y-3">
              {YES_DATA.map((item, index) => (
                <div key={`price-${index}`} className="text-white">
                  {formatCurrency(item.price)}
                </div>
              ))}
            </div>

            {/* Shares Column */}
            <div className="space-y-3">
              {YES_DATA.map((item, index) => (
                <div key={`shares-${index}`} className="text-white">
                  {formatNumber(item.shares)}
                </div>
              ))}
            </div>

            {/* Total Column */}
            <div className="space-y-3">
              {YES_DATA.map((item, index) => (
                <div key={`total-${index}`} className="text-white">
                  {formatCurrency(item.total)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
