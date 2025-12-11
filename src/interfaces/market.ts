export interface IMarketData {
  id: string;
  name: string;
  question: string;
  date?: string | Date;
  image?: string;
  imageSquare?: string;
  volume: number;
  poolAddress: string;
  contractAddress: `0x${string}`;
  yesTokenAddress: `0x${string}`;
  noTokenAddress: `0x${string}`;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  rules: string[];
  isResolved: boolean;
  resolvedOption?: string;
  resolvedTime?: Date;
  resolutionEvidence?: string | null;
  isTie?: boolean;
  yesPrice: number;
  noPrice: number;
  totalLiquidity: number;
  yesPercentage?: number;
  noPercentage?: number;
  totalBets?: number;
  noSideName?: string;
  noSideIcon?: string;
  yesSideName?: string;
  yesSideIcon?: string;
  creatorName: string;
  creatorAvatar: string;
  orderIndex: number;
  categories?: {
    id: string;
    name: string;
    icon?: string | null;
  }[];

  status: "ACTIVE" | "RESOLVED";
}

export interface IMarketFilter {
  status?: "ACTIVE" | "RESOLVED";
  search?: string;
  isResolved?: boolean;
  poolAddress?: string;
}
