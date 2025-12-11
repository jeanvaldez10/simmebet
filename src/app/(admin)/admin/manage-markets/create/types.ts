export interface Market {
  id?: string;
  contractAddress: string;
  poolAddress: string;
  blockchain: string;
  status: "ACTIVE" | "RESOLVED";
  name: string;
  question: string;
  date?: string | null;
  image?: string | null;
  imageSquare?: string | null;
  socialImage?: string | null;
  volume: number;
  createdBy: string;
  rules: string[];
  yesPrice: number;
  noPrice: number;
  totalLiquidity: number;
  yesTokenAddress?: string | null;
  yesIcon?: string | null;
  noTokenAddress?: string | null;
  noIcon?: string | null;
  currentRatio?: number | null;
  oracleMarketId?: string | null;
  oracleType?: string | null;
  tieIsPossible: boolean;
  noSideIcon?: string | null;
  noSideName: string;
  noSideSymbol: string;
  yesSideIcon?: string | null;
  yesSideName: string;
  yesSideSymbol: string;
  creatorAvatar?: string | null;
  creatorName?: string | null;
  resolvedTime?: string | null;
  resolutionEvidence?: string | null;
  categoryIds?: string[];
  categories?: {
    id: string;
    name: string;
    icon?: string | null;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketFormData {
  initialLiquidity: number;
  initialOdds: number;
  collateralToken: string;
  collateralMultiplier: number;
  oracle: string;
  oracleType: number;
  creatorFeeBps: number;
  poolFee: number;
  tickSpacing: number;
  minTick: number;
  maxTick: number;
  showAdvancedDetails: boolean;
}

export const blockchainOptions = [{ value: "ARBITRUM", label: "Arbitrum" }];

export const statusOptions = [
  { value: "ACTIVE", label: "Active" },
  { value: "RESOLVED", label: "Resolved" },
];
