/**
 * Utility functions for generating Market OG Image URLs
 *
 * Similar to flex card generation, these helpers make it easy to create
 * Open Graph images for markets throughout the application.
 */

/**
 * Generate the OG image URL for a market
 * @param marketId - The UUID of the market OR contract address (0x...)
 * @param baseUrl - Optional base URL (defaults to NEXT_PUBLIC_APP_URL or relative path)
 * @returns Full URL to the market OG image
 */
export function getMarketOgImageUrl(
  marketId: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "";
  return `${base}/api/og/market?marketId=${marketId}`;
}

/**
 * Generate metadata for a market page
 * Used in Next.js page components to set OpenGraph and Twitter metadata
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const market = await getMarket(params.id);
 *   return generateMarketMetadata(market);
 * }
 * ```
 */
export function generateMarketMetadata(market: {
  id: string;
  question: string;
  name?: string;
}): {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    images: string[];
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
  };
} {
  const imageUrl = getMarketOgImageUrl(market.id);
  const title = market.question;
  const description = market.name || "Place your bet on this prediction market";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Generate share data for Web Share API
 * @example
 * ```typescript
 * const shareData = getMarketShareData(market);
 * if (navigator.share) {
 *   await navigator.share(shareData);
 * }
 * ```
 */
export function getMarketShareData(market: {
  id: string;
  question: string;
  name?: string;
}): {
  title: string;
  text: string;
  url: string;
} {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return {
    title: market.question,
    text: market.name || "Check out this prediction market!",
    url: `${baseUrl}/market/${market.id}`,
  };
}

/**
 * Generate Twitter share URL with market data
 * Opens Twitter with pre-filled tweet
 */
export function getMarketTwitterShareUrl(market: {
  id: string;
  question: string;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const marketUrl = `${baseUrl}/market/${market.id}`;
  const text = `Check out this prediction market: ${market.question}`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(marketUrl)}`;
}

/**
 * Validate that a market ID is a valid UUID or contract address
 */
export function isValidMarketId(marketId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const contractAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  return uuidRegex.test(marketId) || contractAddressRegex.test(marketId);
}
