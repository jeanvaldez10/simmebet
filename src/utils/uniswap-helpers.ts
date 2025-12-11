import { createPublicClient, http, parseAbi, type Address, type Hex } from "viem";
import { arbitrum } from "viem/chains";
import { Q96, getSqrtPriceAtTick, getTickAtSqrtPrice } from "./uniswap-math";

// Minimal ABIs
const UNISWAP_V3_POOL_ABI = parseAbi([
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
]);

// Uniswap v4 StateView helper (Arbitrum default as used elsewhere in the app)
const UNISWAP_V4_STATE_VIEW_ABI = parseAbi([
  "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)",
]);

export type V3Slot0 = {
  sqrtPriceX96: bigint;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
};

export type V4Slot0 = {
  sqrtPriceX96: bigint;
  tick: number;
  protocolFee: number;
  lpFee: number;
};

export type PriceInfo = {
  sqrtPriceX96: bigint;
  tick: number;
  // Ratio: token1 per token0 (same as Uniswap price)
  ratioToken1PerToken0: number;
  ratioToken0PerToken1: number;
  // Implied odds from ratio (yes = ratio / (1 + ratio))
  yesOdds: number; // 0..1
  noOdds: number;  // 0..1
};

function getPublicClient(rpcUrl?: string) {
  return createPublicClient({
    chain: arbitrum,
    transport: http(rpcUrl || arbitrum.rpcUrls.default.http[0]),
  });
}

// -----------------------------
// Slot0 fetchers
// -----------------------------

export async function fetchV3Slot0(poolAddress: Address, rpcUrl?: string): Promise<V3Slot0> {
  const client = getPublicClient(rpcUrl);
  const result = await client.readContract({
    address: poolAddress,
    abi: UNISWAP_V3_POOL_ABI,
    functionName: "slot0",
    args: [],
  });

  const [sqrtPriceX96, tick, observationIndex, observationCardinality, observationCardinalityNext, feeProtocol, unlocked] = result as unknown as [
    bigint,
    number,
    number,
    number,
    number,
    number,
    boolean
  ];

  return {
    sqrtPriceX96,
    tick: Number(tick),
    observationIndex: Number(observationIndex),
    observationCardinality: Number(observationCardinality),
    observationCardinalityNext: Number(observationCardinalityNext),
    feeProtocol: Number(feeProtocol),
    unlocked: Boolean(unlocked),
  };
}

// Default StateView address for Arbitrum (keep in sync with LiquidityViewer)
export const DEFAULT_V4_STATE_VIEW_ADDRESS: Address = "0x76fd297e2d437cd7f76d50f01afe6160f86e9990";

export async function fetchV4Slot0(poolId: Hex, rpcUrl?: string, stateViewAddress: Address = DEFAULT_V4_STATE_VIEW_ADDRESS): Promise<V4Slot0> {
  const client = getPublicClient(rpcUrl);
  const result = await client.readContract({
    address: stateViewAddress,
    abi: UNISWAP_V4_STATE_VIEW_ABI,
    functionName: "getSlot0",
    args: [poolId],
  });

  const [sqrtPriceX96, tick, protocolFee, lpFee] = result as unknown as [bigint, number, number, number];
  return {
    sqrtPriceX96,
    tick: Number(tick),
    protocolFee: Number(protocolFee),
    lpFee: Number(lpFee),
  };
}

// -----------------------------
// Math helpers (built on uniswap-math)
// -----------------------------

export function priceFromSqrtPriceX96(sqrtPriceX96: bigint): number {
  const ratio = Number(sqrtPriceX96) / Number(Q96);
  return ratio * ratio;
}

export function ratioFromTick(tick: number): number {
  const sqrtPrice = getSqrtPriceAtTick(tick);
  return priceFromSqrtPriceX96(sqrtPrice);
}

export function tickFromSqrtPrice(sqrtPriceX96: bigint): number {
  return getTickAtSqrtPrice(sqrtPriceX96);
}

export function oddsFromRatio(ratioToken1PerToken0: number): { yes: number; no: number } {
  const yes = ratioToken1PerToken0 / (1 + ratioToken1PerToken0);
  const no = 1 - yes;
  return { yes, no };
}

export function oddsFromSqrtPriceX96(sqrtPriceX96: bigint): { yes: number; no: number } {
  const ratio = priceFromSqrtPriceX96(sqrtPriceX96);
  return oddsFromRatio(ratio);
}

// -----------------------------
// High-level convenience
// -----------------------------

export async function getV3PriceInfo(poolAddress: Address, rpcUrl?: string): Promise<PriceInfo> {
  const slot0 = await fetchV3Slot0(poolAddress, rpcUrl);
  const ratio = priceFromSqrtPriceX96(slot0.sqrtPriceX96);
  const { yes, no } = oddsFromRatio(ratio);
  return {
    sqrtPriceX96: slot0.sqrtPriceX96,
    tick: slot0.tick,
    ratioToken1PerToken0: ratio,
    ratioToken0PerToken1: ratio === 0 ? 0 : 1 / ratio,
    yesOdds: yes,
    noOdds: no,
  };
}

export async function getV4PriceInfo(poolId: Hex, rpcUrl?: string, stateViewAddress: Address = DEFAULT_V4_STATE_VIEW_ADDRESS): Promise<PriceInfo> {
  const slot0 = await fetchV4Slot0(poolId, rpcUrl, stateViewAddress);
  const ratio = priceFromSqrtPriceX96(slot0.sqrtPriceX96);
  const { yes, no } = oddsFromRatio(ratio);
  return {
    sqrtPriceX96: slot0.sqrtPriceX96,
    tick: slot0.tick,
    ratioToken1PerToken0: ratio,
    ratioToken0PerToken1: ratio === 0 ? 0 : 1 / ratio,
    yesOdds: yes,
    noOdds: no,
  };
}
