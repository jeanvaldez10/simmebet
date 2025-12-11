import { formatUnits } from "viem";

/**
 * Formats a number or string value to USD currency format
 * @param value - The value to format (can be number, string, null, or undefined)
 * @param options - Formatting options
 * @returns Formatted string in USD format (e.g., "$1,234.56")
 */
export const formatBalance = (
  value: number | string | null | undefined,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDollarSign?: boolean;
  } = {}
): string => {
  if (!value || (typeof value === "string" && isNaN(parseFloat(value)))) {
    return options.noDollarSign ? "0.00" : "$0.00";
  }

  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    ...(!options.noDollarSign && {
      style: "currency",
      currency: "USD",
    }),
  }).format(numericValue);
};

export const formatWalletAddress = (address: string | undefined) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Formats a bigint token amount to a human readable string with specified decimals
 * @param amount The token amount as bigint
 * @param decimals The number of decimals for the token (default: 18)
 * @param maxDecimals Maximum number of decimal places to show (default: 2)
 * @returns Formatted string with the token amount
 */
export function formatTokenAmount(
  amount: bigint | undefined,
  decimals: number = 18,
  maxDecimals: number = 2
): string {
  if (!amount) return "0.00";
  
  const formatted = formatUnits(amount, decimals);
  const number = Number(formatted);
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: maxDecimals,
    maximumFractionDigits: maxDecimals
  });
}

/**
 * Rounds down a number to the nearest cent (2 decimal places)
 * This is useful for USDC balances to prevent showing more than what's actually available
 * @param value The value to round down
 * @returns The value rounded down to 2 decimal places
 */
export function roundDownToCent(value: number): string {
  if (isNaN(value) || value < 0) return "0.00";
  
  // Multiply by 100, floor it, then divide by 100 to round down to nearest cent
  const rounded = Math.floor(value * 100) / 100;
  
  return rounded.toFixed(2);
}
