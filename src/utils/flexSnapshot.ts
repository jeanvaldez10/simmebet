/**
 * Utility functions for Flex Snapshot system
 */

export type FlexType =
  | "flex9"
  | "flex10"
  | "flex11"
  | "flex12"
  | "flex13"
  | "flex14"
  | "flex15";

export interface FlexSnapshotData {
  id: string;
  userId: string;
  type: FlexType;
  username: string;
  profitLoss: number;
  volumeTraded: number;
  balance: number;
  createdAt: Date;
}

export interface BetData {
  question: string;
  amountWon: string;
  betAmount: string;
  side: string;
  belief?: string; // Made optional - only shown when accurately calculable
  user: {
    name: string;
    avatar?: string;
    level?: string;
  };
  timestamp?: string;
  marketId?: string;
  status?: string;
  marketImage?: string;
  marketCategory?: string; // Category name (e.g., "Sports", "Politics")
  // For flex12 (What If) template
  potentialWinAmount?: string;
  potentialLossAmount?: string;
}

export interface CreateSnapshotResponse {
  snapshotId: string;
  shareUrl: string;
}

/**
 * Creates a new flex snapshot for the current user
 */
export async function createFlexSnapshot(
  type: FlexType,
  betData?: BetData,
  profileData?: {
    profit?: number;
    volumeTraded?: number;
    balance?: number;
  }
): Promise<CreateSnapshotResponse> {
  // Clean the betData to remove any potential circular references
  const cleanBetData = betData
    ? {
        question: String(betData.question || ""),
        amountWon: String(betData.amountWon || ""),
        betAmount: String(betData.betAmount || ""),
        side: String(betData.side || ""),
        // Only include belief if provided (no fallback)
        ...(betData.belief && { belief: String(betData.belief) }),
        user: {
          name: String(betData.user?.name || ""),
          avatar: betData.user?.avatar
            ? String(betData.user.avatar)
            : undefined,
          level: betData.user?.level ? String(betData.user.level) : undefined,
        },
        timestamp: betData.timestamp ? String(betData.timestamp) : undefined,
        marketId: betData.marketId ? String(betData.marketId) : undefined,
        status: betData.status ? String(betData.status) : undefined,
        marketImage: betData.marketImage
          ? String(betData.marketImage)
          : undefined,
        marketCategory: betData.marketCategory
          ? String(betData.marketCategory)
          : undefined,
        potentialWinAmount: betData.potentialWinAmount
          ? String(betData.potentialWinAmount)
          : undefined,
        potentialLossAmount: betData.potentialLossAmount
          ? String(betData.potentialLossAmount)
          : undefined,
      }
    : undefined;

  // Try to stringify and catch any circular reference errors
  let requestBody: string;
  try {
    requestBody = JSON.stringify({
      type,
      betData: cleanBetData,
      profileData: profileData
        ? {
            profit: profileData.profit,
            volumeTraded: profileData.volumeTraded,
            balance: profileData.balance,
          }
        : undefined,
    });
  } catch (stringifyError) {
    console.error("❌ JSON.stringify error:", stringifyError);
    throw new Error(
      `Failed to serialize snapshot data: ${
        stringifyError instanceof Error
          ? stringifyError.message
          : "Unknown serialization error"
      }`
    );
  }

  const response = await fetch("/api/flex/snapshot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestBody,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create snapshot: ${error}`);
  }

  return response.json();
}

/**
 * Generates the OG image URL for a snapshot
 */
export function getOGImageUrl(snapshotId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_PROJECT_URL ||
    "";
  return `${baseUrl}/api/og/flex?snapshotId=${snapshotId}`;
}

/**
 * Generates the share page URL for a snapshot
 */
export function getShareUrl(snapshotId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_PROJECT_URL ||
    "";
  return `${baseUrl}/share/flex/${snapshotId}`;
}

/**
 * Pre-warms the OG image by making a request to ensure it's generated and cached
 */
export async function preWarmOGImage(snapshotId: string): Promise<boolean> {
  try {
    const ogImageUrl = getOGImageUrl(snapshotId);
    const response = await fetch(ogImageUrl, {
      method: "HEAD", // Use HEAD to avoid downloading the full image
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to pre-warm OG image:", error);
    return false;
  }
}

/**
 * Opens Twitter share dialog with flex card
 */
export function shareToTwitter(shareUrl: string, username?: string): void {
  const text = username
    ? `Check out ${username}'s trading stats on Bluff! 📈`
    : `Check out my latest belief on @CallMyBluff_io`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(shareUrl)}`;
  window.open(twitterUrl, "_blank");
}

/**
 * Creates a snapshot, pre-warms the OG image, and then opens Twitter
 */
export async function createSnapshotAndShare(
  type: FlexType,
  username?: string,
  betData?: BetData
): Promise<CreateSnapshotResponse> {
  // Create the snapshot
  const result = await createFlexSnapshot(type, betData);

  // Pre-warm the OG image to ensure it's cached
  // This provides extra assurance, but the share page will also pre-warm during metadata generation
  await preWarmOGImage(result.snapshotId);

  // Small delay to ensure the image is fully cached
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Now share to Twitter
  shareToTwitter(result.shareUrl, username);

  return result;
}

/**
 * Validates flex type
 */
export function isValidFlexType(type: string): type is FlexType {
  return [
    "flex9",
    "flex10",
    "flex11",
    "flex12",
    "flex13",
    "flex14",
    "flex15",
  ].includes(type);
}

/**
 * Formats profit/loss with proper sign and currency
 */
export function formatProfitLoss(amount: number): string {
  const sign = amount >= 0 ? "+" : "";
  return `${sign}$${amount.toFixed(2)}`;
}

/**
 * Formats volume with currency
 */
export function formatVolume(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Get flex type display name
 */
export function getFlexTypeDisplayName(type: FlexType): string {
  const names: Record<FlexType, string> = {
    flex9: "Profit/Loss Card",
    flex10: "Bet Card",
    flex11: "Performance Card",
    flex12: "What If Card",
    flex13: "Achievement Card",
    flex14: "Summary Card",
    flex15: "Ongoing Position Card",
  };
  return names[type] || type;
}
