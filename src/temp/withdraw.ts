export type BaseOption = {
  id: string;
  name: string;
  symbol?: string;
};

export type Network = BaseOption;
export type Currency = BaseOption & { symbol: string };
export type Wallet = BaseOption;

// Available wallets
export const WALLETS: Wallet[] = [
  { id: "new", name: "New Wallet" },
  { id: "simmulacrum", name: "Simmulacrum Wallet" },
  { id: "metamask", name: "MetaMask" },
  { id: "trustwallet", name: "Trust Wallet" },
  { id: "phantom", name: "Phantom" },
];

// Add more networks to test scrolling
export const NETWORKS: Network[] = [
  { id: "base", name: "Base" },
  { id: "solana", name: "Solana" },
  { id: "polygon", name: "Polygon" },
  { id: "ethereum", name: "Ethereum" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "optimism", name: "Optimism" },
  { id: "binance", name: "BNB Chain" },
  { id: "avalanche", name: "Avalanche" },
];

// Add more currencies to test scrolling
export const CURRENCIES: Currency[] = [
  { id: "dai", name: "Dai", symbol: "DAI" },
  { id: "sol", name: "Solana", symbol: "SOL" },
  { id: "usdt", name: "Tether", symbol: "USDT" },
  { id: "eth", name: "Ethereum", symbol: "ETH" },
  { id: "usd-coin", name: "USD Coin", symbol: "USDC" },
  { id: "matic", name: "Polygon", symbol: "MATIC" },
  { id: "avax", name: "Avalanche", symbol: "AVAX" },
  { id: "wbtc", name: "Wrapped Bitcoin", symbol: "WBTC" },
];
