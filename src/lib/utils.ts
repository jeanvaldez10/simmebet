import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into a human-readable volume format (e.g., 1M, 2.5K, 13.4K, 12.2M)
 * @param value - The number to format
 * @returns A string representation of the formatted volume
 * @example
 * formatVolume(1000000) // returns "1M"
 * formatVolume(13400) // returns "13.4K"
 * formatVolume(12200000) // returns "12.2M"
 * formatVolume(500) // returns "500"
 */
export const formatVolume = (value: number): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    const millions = value / 1_000_000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }

  if (absValue >= 1_000) {
    const thousands = value / 1_000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }

  return Math.round(value).toString();
};
