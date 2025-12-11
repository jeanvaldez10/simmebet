import { FilterDropdownOption } from "@/components/options/FilterDropdown";

export type StatCard = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: number | string;
  footer?: {
    value: number | string;
    label: string;
  };
  width?: string;
  height?: string;
  hasGraph?: boolean;
};

// Sample data for dropdowns
export const tokenOptions: FilterDropdownOption[] = [
  { label: "All", value: "All" },
  { label: "BTC", value: "BTC" },
  { label: "ETH", value: "ETH" },
  { label: "SOL", value: "SOL" },
  { label: "AVAX", value: "AVAX" },
];

export const choiceOptions: FilterDropdownOption[] = [
  { label: "All", value: "All" },
  { label: "Call", value: "Call" },
  { label: "Put", value: "Put" },
];

export const strikeOptions: FilterDropdownOption[] = [
  { label: "$1-$5", value: "$1-$5" },
  { label: "$5-$10", value: "$5-$10" },
  { label: "$10-$20", value: "$10-$20" },
  { label: "$20-$50", value: "$20-$50" },
  { label: "$50+", value: "$50+" },
];

export const costOptions: FilterDropdownOption[] = [
  { label: "$1-$5", value: "$1-$5" },
  { label: "$5-$10", value: "$5-$10" },
  { label: "$10-$20", value: "$10-$20" },
  { label: "$20-$50", value: "$20-$50" },
  { label: "$50+", value: "$50+" },
];

export const expiryOptions: FilterDropdownOption[] = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "1Y", value: "1Y" },
];

export const volumeOptions: FilterDropdownOption[] = [
  { label: "1k", value: "1k" },
  { label: "5k", value: "5k" },
  { label: "10k", value: "10k" },
  { label: "20k", value: "20k" },
  { label: "50k", value: "50k" },
];

// Optimized options data with reduced repetition
const baseOption = {
  tokenSymbol: "TKN",
  tokenName: "Token Name Here",
  currentPrice: "$12.30",
  optionsAvailable: 5000,
  totalOptions: 10000,
  strikePrice: "$0.5",
  expiry: "7 days",
  position: "Long" as const,
  tokenImage: "/images/cup.png",
};

export const options = Array(12)
  .fill(null)
  .map((_, i) => ({
    ...baseOption,
    id: i + 1,
  }));

// Optimized portfolio data
const basePortfolioItem = {
  tokenSymbol: "TKN",
  tokenName: "Token Name Here",
  currentPrice: "$12.30",
  priceChange: 1742,
  strikePrice: 0.5,
  expiry: "7 days",
  position: "Long" as const,
  tokenImage: "/images/cup.png",
  size: "100",
};

const chartDataVariants = [
  [100, 135, 120, 145, 130, 160, 140, 175, 155, 190, 170, 200, 180, 220, 195],
  [120, 145, 135, 155, 148, 165, 158, 172, 168, 185, 175, 195, 188, 205, 198],
  [100, 115, 135, 148, 155, 158, 155, 148, 135, 125, 120, 125, 138, 152, 160],
];

export const portfolio = Array(4)
  .fill(null)
  .map((_, i) => ({
    ...basePortfolioItem,
    id: i + 1,
    chartData: chartDataVariants[i % chartDataVariants.length],
  }));

type TradeStatus = "Open" | "Closed";
type TradeType = "Buy" | "Sell";
type PositionType = "Long" | "Short";

export interface Trade {
  token: string;
  type: TradeType;
  tokenImage: string;
  position: PositionType;
  price: string;
  paidReceived: string;
  strike: string;
  premium: string;
  status: TradeStatus;
  profitLoss: number;
  expiry: string;
  date: string;
  transactionUrl: string;
}

// Optimized sample trades
const baseTrade = {
  token: "TKN",
  tokenImage: "/images/cup.png",
  price: "$0,00001",
  paidReceived: "$0,00001",
  strike: "$0,00001",
  premium: "$0,00001",
  profitLoss: 1742,
  expiry: "April 29, 2025",
  date: "April 29, 2025",
};

export const sampleTrades: Trade[] = [
  {
    ...baseTrade,
    type: "Buy",
    position: "Long",
    status: "Open",
    transactionUrl: "https://example.com/tx/1",
  },
  {
    ...baseTrade,
    type: "Sell",
    position: "Short",
    status: "Closed",
    transactionUrl: "https://example.com/tx/2",
  },
  {
    ...baseTrade,
    type: "Buy",
    position: "Long",
    status: "Open",
    transactionUrl: "https://example.com/tx/3",
  },
  {
    ...baseTrade,
    type: "Sell",
    position: "Short",
    status: "Closed",
    transactionUrl: "https://example.com/tx/4",
  },
  {
    ...baseTrade,
    type: "Buy",
    position: "Long",
    status: "Open",
    transactionUrl: "https://example.com/tx/5",
  },
  {
    ...baseTrade,
    type: "Sell",
    position: "Short",
    status: "Closed",
    transactionUrl: "https://example.com/tx/6",
  },
  {
    ...baseTrade,
    type: "Buy",
    position: "Long",
    status: "Open",
    transactionUrl: "https://example.com/tx/7",
  },
];

// Optimized listed options
const baseListedItem = {
  tokenSymbol: "TKN",
  tokenName: "Token Name Here",
  currentPrice: "$12.30",
  strikePrice: "$0.5",
  expiry: "7 days",
  position: "Long",
  tokenImage: "/images/cup.png",
  size: "100",
  listedPrice: "10.00",
};

export const listed = Array(4)
  .fill(null)
  .map((_, i) => ({
    ...baseListedItem,
    id: i + 1,
  }));
