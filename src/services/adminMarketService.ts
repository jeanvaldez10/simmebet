export interface AdminMarket {
  id: string;
  contractAddress: string;
  poolAddress: string;
  blockchain: string;
  status: "ACTIVE" | "RESOLVED";
  name: string;
  question: string;
  date: string | null;
  image: string | null;
  imageSquare: string | null;
  socialImage: string | null;
  volume: number;
  createdBy: string;
  rules: string[];
  isResolved: boolean;
  resolvedOption: string | null;
  yesPrice: number;
  noPrice: number;
  totalLiquidity: number;
  yesTokenAddress: string | null;
  yesIcon: string | null;
  noTokenAddress: string | null;
  noIcon: string | null;
  currentRatio: number | null;
  oracleMarketId: string | null;
  oracleType: string | null;
  tieIsPossible: boolean;
  noSideIcon: string | null;
  noSideName: string | null;
  noSideSymbol: string | null;
  yesSideIcon: string | null;
  yesSideName: string | null;
  yesSideSymbol: string | null;
  creatorAvatar: string | null;
  creatorName: string | null;
  resolvedTime: string | null;
  resolutionEvidence: string | null;
  orderIndex: number;
  categoryIds?: string[];
  categories?: {
    id: string;
    name: string;
    icon?: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing markets with proper admin authentication
 */
export class AdminMarketService {
  private static getAuthHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * Get all markets (admin only)
   */
  static async getMarkets(): Promise<AdminMarket[]> {
    const response = await fetch("/api/admin/markets", {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch markets");
    }

    const data = await response.json();
    return data.markets;
  }

  /**
   * Get a single market by ID (admin only)
   */
  static async getMarket(id: string): Promise<AdminMarket> {
    const response = await fetch(`/api/admin/markets/${id}`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch market");
    }

    const data = await response.json();
    return data.market;
  }

  /**
   * Create a new market (admin only)
   */
  static async createMarket(
    market: Omit<
      AdminMarket,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "isResolved"
      | "resolvedOption"
      | "resolvedTime"
    >
  ): Promise<AdminMarket> {
    const response = await fetch("/api/admin/markets", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(market),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create market");
    }

    const data = await response.json();
    return data.market;
  }

  /**
   * Update an existing market (admin only)
   */
  static async updateMarket(
    id: string,
    updates: Partial<AdminMarket>
  ): Promise<AdminMarket> {
    const response = await fetch(`/api/admin/markets/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update market");
    }

    const data = await response.json();
    return data.market;
  }

  /**
   * Delete a market (admin only)
   */
  static async deleteMarket(id: string): Promise<void> {
    const response = await fetch(`/api/admin/markets/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete market");
    }
  }
}
