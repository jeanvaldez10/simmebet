interface Token {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  isNative?: boolean;
}

interface PoolPosition {
  tokenId: string;
  tickLower: string; 
  tickUpper: string;
  liquidity: string;
  token0: Token;
  token1: Token;
  feeTier: string;
  currentTick: string;
  currentPrice: string;
  tickSpacing: string;
  token0UncollectedFees: string;
  token1UncollectedFees: string;
  amount0: string;
  amount1: string;
  poolId: string;
  totalLiquidityUsd: string;
  currentLiquidity: string;
}

interface Hook {
  address: string;
}

interface V4Position {
  poolPosition: PoolPosition;
  hooks: Hook[];
}

export interface Position {
  chainId: number;
  protocolVersion: string;
  status: string;
  timestamp: number;
  v4Position: V4Position;
}

export interface PositionsResponse {
  positions: Position[];
}
