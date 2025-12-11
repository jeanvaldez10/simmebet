export const QUICK_AMOUNTS = ["1", "10", "20", "100", "Max"];
export const BALANCE = 100.0;
export const DEPOSIT_DISABLED = false; // Set to false to re-enable deposits
export const DEPOSIT_WALLET_ADDRESS =
  "0xb100d571ef85ec77677cfd5c5fc3243a99976558";

// Feature flags (controlled by environment variables)
export const ENABLE_OPTIONS =
  process.env.NEXT_PUBLIC_ENABLE_OPTIONS === "true" || false;
export const ENABLE_GAMES =
  process.env.NEXT_PUBLIC_ENABLE_GAMES === "true" || false;
export const ENABLE_LOBBIES =
  process.env.NEXT_PUBLIC_ENABLE_LOBBIES === "true" || false;
export const ENABLE_BLACKJACK_DEV_TOOLS =
  process.env.NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS === "true" || false;

// export const ARBITRUM_USDC_CONTRACT_ADDRESS =
//   "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`;

export const ARBITRUM_USDC_CONTRACT_ADDRESS = (process.env.USDC_ADDRESS ||
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831") as `0x${string}`;

export const USDT_CONTRACT_ADDRESS = "0x..." as `0x${string}`;

export const SIMPLE_ROUTER_ADDRESS =
  "0xE931c3EE125159eFC96F78CA06050229DE2dE129" as `0x${string}`;
export const CASHOUT_HELPER_ADDRESS =
  "0x612A43B035F9D3eA14AF6FeE0621A00116C05881" as `0x${string}`;
