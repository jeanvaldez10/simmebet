import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from "react";
import { createPublicClient, http, parseAbi, getContract, formatUnits, slice } from "viem";
import { arbitrum } from "viem/chains";
import type { Address, Hex } from "viem";
import { Minus, Plus, RotateCcw } from "lucide-react";

/**
 * Uniswap v4 Liquidity Ranges Viewer — Arbitrum One
 * ------------------------------------------------------------
 * Visualizes per-range (between initialized ticks) active liquidity for a v4 pool
 * and shows token0/token1 amounts at the current price in a tooltip.
 *
 * Example:
 *   <V4LiquidityViewer poolId="0x6392a7e6fd5190fafdca88a10966b1fb8a338481786e0a2e7fc4bc590ecb7b37" />
 */

// -----------------------------
// Addresses (Arbitrum One, Aug 2025)
// -----------------------------
const ADDR: { poolManager: Address; positionManager: Address; stateView: Address } = {
  poolManager: "0x360e68faccca8ca495c1b759fd9eee466db9fb32" as Address,
  positionManager: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869" as Address,
  stateView: "0x76fd297e2d437cd7f76d50f01afe6160f86e9990" as Address,
};

// -----------------------------
// ABIs
// -----------------------------
const stateViewAbi = parseAbi([
  "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)",
  "function getTickBitmap(bytes32 poolId, int16 wordPos) view returns (uint256 tickBitmap)",
  "function getTickLiquidity(bytes32 poolId, int24 tick) view returns (uint128 liquidityGross, int128 liquidityNet)",
]);

const positionManagerAbi = parseAbi([
  "function poolKeys(bytes25 poolId) view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)",
]);

const erc20Abi = parseAbi([
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

// -----------------------------
// Math helpers (v3/v4-compatible)
// -----------------------------
const Q96: bigint = 1n << 96n;
const MAX_TICK = 887272;
const MIN_TICK = -MAX_TICK;

function mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
  return (a * b) / denominator;
}

function getSqrtRatioAtTick(tick: number): bigint {
  if (tick > MAX_TICK || tick < MIN_TICK) throw new Error("TICK_OUT_OF_BOUNDS");
  const absTick = tick < 0 ? -tick : tick;
  let ratio =
    absTick & 1
      ? 0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n;
  if (absTick & 2) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if (absTick & 4) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdcdn) >> 128n;
  if (absTick & 8) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if (absTick & 16) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if (absTick & 32) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if (absTick & 64) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if (absTick & 128) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if (absTick & 256) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if (absTick & 512) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if (absTick & 1024) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if (absTick & 2048) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if (absTick & 4096) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if (absTick & 8192) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if (absTick & 16384) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if (absTick & 32768) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if (absTick & 65536) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if (absTick & 131072) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if (absTick & 262144) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if (absTick & 524288) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;
  if (tick > 0) {
    ratio = (0xffffffffffffffffffffffffffffffffn * 0x100000000000000000000000000000000n) / ratio;
  }
  const rem = ratio % (1n << 32n);
  const result = ratio >> 32n;
  return rem === 0n ? result : result + 1n;
}

function amount0Delta(sqrtA: bigint, sqrtB: bigint, liquidity: bigint): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];
  return (liquidity * (sqrtB - sqrtA) * Q96) / (sqrtB * sqrtA);
}

function amount1Delta(sqrtA: bigint, sqrtB: bigint, liquidity: bigint): bigint {
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];
  return mulDiv(liquidity, sqrtB - sqrtA, Q96);
}

function amountsForLiquidity(
  sqrtP: bigint,
  sqrtA: bigint,
  sqrtB: bigint,
  liquidity: bigint
): { amount0: bigint; amount1: bigint } {
  if (sqrtP <= sqrtA) return { amount0: amount0Delta(sqrtA, sqrtB, liquidity), amount1: 0n };
  if (sqrtP < sqrtB)
    return { amount0: amount0Delta(sqrtP, sqrtB, liquidity), amount1: amount1Delta(sqrtA, sqrtP, liquidity) };
  return { amount0: 0n, amount1: amount1Delta(sqrtA, sqrtB, liquidity) };
}

function xScale(tick: number, minTick: number, maxTick: number, width: number): number {
  return ((tick - minTick) / (maxTick - minTick)) * width;
}

function fmtToken(amount: bigint, decimals: number): string {
  try {
    return formatUnits(amount, decimals);
  } catch {
    const s = amount.toString();
    if (decimals === 0) return s;
    const i = s.length - decimals;
    return i <= 0 ? `0.${"0".repeat(-i)}${s}` : `${s.slice(0, i)}.${s.slice(i)}`;
  }
}

export function formatCompactBigint(x: bigint): string {
  const s = x.toString();
  const units = ["", "k", "M", "B", "T", "P", "E"];
  let i = 0;
  let len = s.length;
  while (len > 3 && i < units.length - 1) {
    len -= 3;
    i++;
  }
  if (i === 0) return s;
  const head = s.slice(0, s.length - i * 3);
  const tail = s.slice(s.length - i * 3, s.length - i * 3 + 1);
  return `${head}${tail ? "." + tail : ""}${units[i]}`;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

interface TokenMeta { decimals: number; symbol: string }

export interface Range {
  lower: number;
  upper: number;
  liquidity: bigint;
  sqrtA: bigint;
  sqrtB: bigint;
  amount0: bigint;
  amount1: bigint;
}
export interface Data {
  currency0: Address;
  currency1: Address;
  t0: TokenMeta;
  t1: TokenMeta;
  tickSpacing: number;
  tick: number;
  sqrtPriceX96: bigint;
  ranges: Range[];
  minTick: number;
  maxTick: number;
}

interface ViewerProps {
  poolId: Hex; // bytes32
  rpcUrl?: string;
  wordsAround?: number;
  height?: number;
  width?: number; // if not provided, the viewer will expand to parent width
  initialMinTick?: number;
  initialMaxTick?: number;
  initialCenterOnCurrent?: boolean;
  initialTicksAround?: number;
  showVisibleRange?: boolean;
}

export default function V4LiquidityViewer({
  poolId,
  rpcUrl,
  wordsAround = 16,
  height = 340,
  width,
  initialMinTick,
  initialMaxTick,
  initialCenterOnCurrent = true,
  initialTicksAround,
  showVisibleRange = false,
}: ViewerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<Data | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  // Measure parent width when no explicit width provided
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) setContainerWidth(Math.round(cr.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const renderWidth = typeof width === "number" ? width : containerWidth;

  const client = useMemo(
    () =>
      createPublicClient({
        chain: arbitrum,
        transport: http(rpcUrl || undefined),
      }),
    [rpcUrl]
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const stateView = getContract({ address: ADDR.stateView, abi: stateViewAbi, client });
        const posm = getContract({ address: ADDR.positionManager, abi: positionManagerAbi, client });

        // Truncate poolId to bytes25 for PositionManager.poolKeys (v4 stores mapping by bytes25)
        const poolIdBytes25 = slice(poolId as Hex, 0, 25) as Hex;
        const [poolKey, slot0] = await Promise.all([
          posm.read.poolKeys([poolIdBytes25]),
          stateView.read.getSlot0([poolId]),
        ]);

        const pk = poolKey as unknown as readonly [Address, Address, bigint, bigint, Address];
        const currency0 = pk[0];
        const currency1 = pk[1];
        const tickSpacing = Number(pk[3]);
        if (!tickSpacing || Number.isNaN(tickSpacing)) throw new Error("PositionManager.poolKeys returned invalid tickSpacing (check poolId / chain)");
        const sqrtPriceX96 = (slot0 as unknown as readonly [bigint, bigint, bigint, bigint])[0];
        const tick = Number((slot0 as unknown as readonly [bigint, bigint, bigint, bigint])[1]);

        async function fetchTokenMeta(addr: Address): Promise<TokenMeta> {
          const isZero = /^0x0{40}$/i.test(addr);
          if (isZero) return { decimals: 18, symbol: "ETH" };
          try {
            const token = getContract({ address: addr, abi: erc20Abi, client });
            const [decimals, symbol] = await Promise.all([token.read.decimals(), token.read.symbol()]);
            return { decimals: Number(decimals), symbol };
          } catch {
            return { decimals: 18, symbol: "ETH" };
          }
        }
        const [t0, t1] = await Promise.all([fetchTokenMeta(currency0), fetchTokenMeta(currency1)]);

        const compressedTick = Math.trunc(tick / tickSpacing);
        const currentWord = Math.trunc(compressedTick / 256);

        const wordPositions: number[] = [];
        for (let w = currentWord - wordsAround; w <= currentWord + wordsAround; w++) wordPositions.push(w);

        const bitmapCalls = wordPositions.map((w) => ({
          address: ADDR.stateView as Address,
          abi: stateViewAbi,
          functionName: "getTickBitmap" as const,
          args: [poolId as Hex, BigInt(w)] as const,
        }));
        const bitmaps = await client.multicall({ contracts: bitmapCalls });

        const initializedTicks: number[] = [];
        for (let i = 0; i < wordPositions.length; i++) {
          const wordPos = wordPositions[i];
          const res = bitmaps[i] as { status: "success" | "reverted"; result?: bigint };
          if (!res || res.status !== "success" || res.result == null) continue;
          const bm = BigInt(res.result);
          if (bm === 0n) continue;
          for (let bit = 0; bit < 256; bit++) {
            if ((bm & (1n << BigInt(bit))) !== 0n) {
              const compressed = wordPos * 256 + bit;
              const t = compressed * tickSpacing;
              initializedTicks.push(t);
            }
          }
        }

        const uniq = Array.from(new Set(initializedTicks)).sort((a, b) => a - b);
        if (uniq.length === 0) throw new Error("No initialized ticks found in scanned window. Try increasing wordsAround.");

        const liqCalls = uniq.map((t) => ({
          address: ADDR.stateView as Address,
          abi: stateViewAbi,
          functionName: "getTickLiquidity" as const,
          args: [poolId as Hex, BigInt(t)] as const,
        }));
        const liqRes = await client.multicall({ contracts: liqCalls });
        const tickLiquidity = new Map<number, { gross: bigint; net: bigint }>();
        uniq.forEach((t, i) => {
          const r = liqRes[i] as { status: "success" | "reverted"; result?: readonly [bigint, bigint] };
          if (r && r.status === "success" && r.result) {
            const [gross, net] = r.result;
            tickLiquidity.set(t, { gross: BigInt(gross), net: BigInt(net) });
          }
        });

        const sqrtP = BigInt(sqrtPriceX96);
        const ranges: Range[] = [];
        let activeL: bigint = 0n;
        for (let i = 0; i < uniq.length - 1; i++) {
          const lower = uniq[i];
          const upper = uniq[i + 1];
          const netInfo = tickLiquidity.get(lower);
          if (netInfo) activeL += BigInt(netInfo.net);
          if (activeL > 0n) {
            const sqrtA = getSqrtRatioAtTick(lower);
            const sqrtB = getSqrtRatioAtTick(upper);
            const { amount0, amount1 } = amountsForLiquidity(sqrtP, sqrtA, sqrtB, activeL);
            ranges.push({ lower, upper, liquidity: activeL, sqrtA, sqrtB, amount0, amount1 });
          }
        }

        const minTick = uniq[0];
        const maxTick = uniq[uniq.length - 1];

        setData({ currency0, currency1, t0, t1, tickSpacing, tick, sqrtPriceX96: BigInt(sqrtPriceX96), ranges, minTick, maxTick });
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [poolId, client, wordsAround]);

  return (
    <div ref={containerRef} style={{ width: typeof width === "number" ? width : "100%", height }} className="">
      {error ? (
        <ErrorBox width="100%" msg={error} />
      ) : !data || loading || renderWidth <= 0 ? (
        <Skeleton width="100%" height={height} label="Loading onchain data…" />
      ) : (
        <Chart data={data} width={renderWidth} height={height} zoom={zoom} setZoom={setZoom} initialMinTick={initialMinTick} initialMaxTick={initialMaxTick} initialCenterOnCurrent={initialCenterOnCurrent} initialTicksAround={initialTicksAround} showVisibleRange={showVisibleRange} />
      )}
    </div>
  );
}

export function LiquidityHeader({ data }: { data: Data }) {
  const { t0, t1, ranges } = data;
  const totalL = ranges.reduce((a: bigint, r: Range) => a + r.liquidity, 0n);
  return (
    <div className="flex items-center justify-between mb-2 px-2">
      <div className="text-xl font-semibold text-white">Liquidity Spread</div>
      <div className="text-sm text-[#FFFFFFA3]">
        Total Liquidity: <span className="font-mono text-white">{formatCompactBigint(totalL)}</span> · {t0.symbol}/{t1.symbol}
      </div>
    </div>
  );
}

export function FooterNote() {
  return (
    <div className="text-xs text-[#FFFFFFA3] mt-3">
      Tip: Hover any bar to see token0/token1 at the current price for that range. Wider scans → increase <code className="text-white">wordsAround</code>.
    </div>
  );
}

function Skeleton({ width, height, label }: { width?: number | "100%"; height: number; label: string }) {
  return (
    <div style={{ width: width || "100%", height }} className="animate-pulse bg-[#1C1D26] rounded-2xl grid place-items-center">
      <span className="text-white text-sm">{label}</span>
    </div>
  );
}

function ErrorBox({ width, msg }: { width?: number | "100%"; msg: string }) {
  return (
    <div style={{ width: width || "100%" }} className="bg-[#1C1D26] border border-[#374151] text-white p-3 rounded-xl text-sm">{msg}</div>
  );
}

interface ChartProps {
  data: Data;
  width: number;
  height: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  initialMinTick?: number;
  initialMaxTick?: number;
  initialCenterOnCurrent?: boolean;
  initialTicksAround?: number;
  showVisibleRange?: boolean;
}

function Chart({ data, width, height, zoom, setZoom, initialMinTick, initialMaxTick, initialCenterOnCurrent, initialTicksAround, showVisibleRange }: ChartProps) {
  const { ranges, minTick, maxTick, tick, t0, t1, tickSpacing } = data;
  const padding = { left: 80, right: 24, top: 42, bottom: 60 } as const;
  const innerW = width - padding.left - padding.right; // visible width
  const innerH = height - padding.top - padding.bottom;
  const contentW = innerW * (zoom || 1); // zoomed content width
  const svgW = padding.left + padding.right + contentW;
  // Mirror x so liquidity runs right→left
  const xFlip = useCallback(
    (t: number) => contentW - xScale(t, minTick, maxTick, contentW),
    [contentW, minTick, maxTick]
  );
  const currentX = xFlip(tick);
  // const p0Current = 100 / (1 + Math.pow(1.0001, tick));
  const maxLiq = React.useMemo(() => ranges.reduce((m: bigint, r: Range) => (r.liquidity > m ? r.liquidity : m), 0n), [ranges]);
  type TooltipState = { x: number; y: number; range?: Range; kind: 'range' | 'current' } & ({ range: Range; kind: 'range' } | { kind: 'current' });
  const [tt, setTt] = useState<TooltipState | null>(null);
  const MAX_ZOOM = 128;
  const MIN_ZOOM = 1;
  const [tickVersion, setTickVersion] = useState<number>(0);

  // Visible tick-range tracking
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState<{ t0: number; t1: number }>({ t0: minTick, t1: maxTick });
  const [scrollLeftPx, setScrollLeftPx] = useState<number>(0);

  // Keep function stable and above effects that depend on it
  const updateVisible = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setVisible({ t0: minTick, t1: maxTick });
      setScrollLeftPx(0);
      return;
    }
    const sl = el.scrollLeft;
    setScrollLeftPx(sl);
    const x0 = Math.max(0, sl - padding.left); // left edge in content coords
    const x1 = Math.min(contentW, x0 + innerW); // right edge
    const span = maxTick - minTick;
    const tickAtX = (x: number) => Math.round(minTick + ((contentW - x) / contentW) * span);
    const tLeft = tickAtX(x0);
    const tRight = tickAtX(x1);
    setVisible({ t0: Math.min(tLeft, tRight), t1: Math.max(tLeft, tRight) });
  }, [minTick, maxTick, contentW, innerW, padding.left]);

  // Apply initial view range if provided
  const initAppliedRef = useRef<boolean>(false);
  useEffect(() => {
    initAppliedRef.current = false;
  }, [minTick, maxTick]);
  useLayoutEffect(() => {
    if (initAppliedRef.current) return;

    // Determine desired initial window
    let left: number | undefined;
    let right: number | undefined;

    if (initialMinTick != null && initialMaxTick != null) {
      left = Math.max(minTick, Math.min(initialMinTick, maxTick));
      right = Math.max(minTick, Math.min(initialMaxTick, maxTick));
    } else if (initialCenterOnCurrent) {
      const halfSpan = Math.max(1, initialTicksAround ?? tickSpacing * 32);
      left = tick - halfSpan;
      right = tick + halfSpan;
      left = Math.max(minTick, Math.min(left, maxTick));
      right = Math.max(minTick, Math.min(right, maxTick));
    }

    if (left == null || right == null || !(right > left)) return;

    const totalSpan = maxTick - minTick;
    const desiredSpan = right - left;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, totalSpan / desiredSpan));
    setZoom(newZoom);
    requestAnimationFrame(() => {
      const c = scrollRef.current;
      if (!c) return;
      const newContentW = innerW * newZoom;
      const centerTick = (left! + right!) / 2;
      const xCenter = ((maxTick - centerTick) / totalSpan) * newContentW; // flipped coords
      const targetScrollLeft = padding.left + xCenter - innerW / 2;
      c.scrollLeft = Math.max(0, Math.round(targetScrollLeft));
      initAppliedRef.current = true;
      updateVisible();
    });
  }, [initialMinTick, initialMaxTick, initialCenterOnCurrent, initialTicksAround, tick, tickSpacing, minTick, maxTick, innerW, setZoom, padding.left, updateVisible]);

  useEffect(() => {
    updateVisible();
  }, [zoom, minTick, maxTick, contentW, innerW, updateVisible]);

  // Drag-to-scroll state
  const [dragging, setDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartScrollLeft = useRef<number>(0);

  // Zoom keeping the center tick fixed in the viewport
  const setZoomCentered = React.useCallback((nextZoom: number) => {
    const el = scrollRef.current;
    const oldContentW = contentW;
    const newContentW = innerW * (nextZoom || 1);
    let newScrollLeft = 0;
    if (el) {
      const currentScrollLeft = el.scrollLeft;
      const anchorX = Math.max(0, currentScrollLeft - padding.left) + innerW / 2; // center x in content coords
      const u = oldContentW > 0 ? anchorX / oldContentW : 0; // [0..1]
      newScrollLeft = padding.left + u * newContentW - innerW / 2;
    }
    setZoom(nextZoom);
    setTickVersion((v) => v + 1);
    requestAnimationFrame(() => {
      const c = scrollRef.current;
      if (!c) return;
      c.scrollLeft = Math.max(0, Math.round(newScrollLeft));
      updateVisible();
    });
  }, [contentW, innerW, padding.left, setZoom, updateVisible]);

  // Binary search range at tick
  const rangeAtTick = React.useCallback((t: number): Range | null => {
    let lo = 0;
    let hi = ranges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const r = ranges[mid];
      if (t < r.lower) hi = mid - 1;
      else if (t >= r.upper) lo = mid + 1;
      else return r;
    }
    return null;
  }, [ranges]);

  // Price (token1 per token0) at current tick
  const price1Per0 = Math.pow(1.0001, tick);

  // Pointer handler on overlay to compute hovered range or current
  const onOverlayMove = React.useCallback((e: React.MouseEvent<SVGRectElement>) => {
    const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const xLocal = Math.max(0, Math.min(e.clientX - rect.left, contentW));
    const span = maxTick - minTick;
    const t = Math.round(minTick + ((contentW - xLocal) / contentW) * span);

    // Near current marker? show current tooltip
    const currentLocalX = xFlip(tick);
    if (Math.abs(xLocal - currentLocalX) <= 10) {
      setTt({ x: padding.left + currentLocalX, y: padding.top + innerH * 0.15, kind: 'current' });
      return;
    }

    const r = rangeAtTick(t);
    if (!r) {
      setTt(null);
      return;
    }
    const xL = xFlip(r.upper);
    const xR = xFlip(r.lower);
    const x = Math.min(xL, xR);
    const w = Math.max(1, Math.abs(xR - xL));
    const h = Number((r.liquidity * 1000n) / (maxLiq === 0n ? 1n : maxLiq));
    const barH = (h / 1000) * innerH;
    const y = innerH - barH;
    setTt({ x: padding.left + x + w / 2, y: padding.top + y, range: r, kind: 'range' });
  }, [contentW, maxTick, minTick, rangeAtTick, xFlip, maxLiq, innerH, padding.left, padding.top, tick]);



  return (
    <div className="bg-transparent" style={{ width, height }}>
      {/* Chart container */}
      <div className="relative" style={{ width, height }}>
        {/* Zoom controls overlay */}
        <div className="absolute top-2 right-2 z-20 flex gap-0.5">
          <button
            title="Zoom out"
            onClick={() => setZoomCentered(Math.max(MIN_ZOOM, zoom / 2))}
            className="bg-[#1C1D26]/90 backdrop-blur-sm border border-[#374151] text-white hover:bg-[#16171E]/90 rounded-md shadow-lg transition-colors w-8 h-8 flex items-center justify-center"
          >
            <Minus size={14} />
          </button>
          <button
            title="Zoom in"
            onClick={() => setZoomCentered(Math.min(MAX_ZOOM, zoom * 2))}
            className="bg-[#1C1D26]/90 backdrop-blur-sm border border-[#374151] text-white hover:bg-[#16171E]/90 rounded-md shadow-lg transition-colors w-8 h-8 flex items-center justify-center"
          >
            <Plus size={14} />
          </button>
          <button
            title="Full range" 
            onClick={() => { setZoom(MIN_ZOOM); if (scrollRef.current) scrollRef.current.scrollLeft = 0; updateVisible(); setTickVersion((v)=>v+1); }}
            className="bg-[#1C1D26]/90 backdrop-blur-sm border border-[#374151] text-white hover:bg-[#16171E]/90 rounded-md shadow-lg transition-colors h-8 flex items-center justify-center min-w-[60px] gap-1 px-2"
          >
            <RotateCcw size={12} />
            <span className="text-xs">Full</span>
          </button>
        </div>

        {showVisibleRange && (
          <div className="absolute top-2 right-32 z-20 bg-[#1C1D26]/90 backdrop-blur-sm border border-[#374151] rounded-md px-2 py-1 text-[11px] text-white font-mono">
            Visible: [{visible.t0}, {visible.t1}]
          </div>
        )}

        {/* Fixed Y-axis labels - positioned outside the scrollable area */}
        <div className="absolute left-0 top-0 z-10 pointer-events-none" style={{ width: padding.left, height }}>
          <svg width={padding.left} height={height} style={{ background: "transparent" }}>
            {([0, 20, 40, 60, 80, 100] as const).map((pct) => {
              const y = padding.top + innerH - (pct / 100) * innerH;
              return (
                <g key={`y-${pct}`} pointerEvents="none">
                  <text x={padding.left - 20} y={y} textAnchor="end" dominantBaseline="central" className="fill-white text-[10px]">{pct}%</text>
                </g>
              );
            })}
          </svg>
        </div>

      {/* Scroll container when zoomed */}
      <div
        ref={scrollRef}
        onScroll={updateVisible}
        onPointerDown={(e) => {
          const el = scrollRef.current;
          if (!el) return;
          setDragging(true);
          dragStartX.current = e.clientX;
          dragStartScrollLeft.current = el.scrollLeft;
          el.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          const el = scrollRef.current;
          if (!el) return;
          el.scrollLeft = dragStartScrollLeft.current - (e.clientX - dragStartX.current);
          updateVisible();
          e.preventDefault();
        }}
        onPointerUp={(e) => {
          setDragging(false);
          const el = scrollRef.current;
          el?.releasePointerCapture?.(e.pointerId);
        }}
        onPointerCancel={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        className={`h-full ${zoom > 1 ? 'overflow-x-auto' : ''} ${dragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        style={{ marginLeft: padding.left }}
      >
        <div style={{ width: svgW - padding.left, height }} className="relative bg-transparent">
          <svg width={svgW - padding.left} height={height} style={{ background: "#16171E" }}>
            <defs>
              <linearGradient id="barGloss" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF4D4D" />
                <stop offset="100%" stopColor="#FF4D4D" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="greenGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#46FD84" />
                <stop offset="100%" stopColor="#46FD84" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* X axis labels - positioned at liquidity position boundaries */}
            {(() => {
              const pAt = (t: number) => 100 / (1 + Math.pow(1.0001, t));
              const span = maxTick - minTick;
              const tickAtX = (x: number) => Math.round(minTick + ((contentW - x) / contentW) * span);

              // Visible window in content coordinates
              const x0 = Math.max(0, (scrollLeftPx || 0) - padding.left);
              const x1 = Math.min(contentW, x0 + innerW);

              // Get all unique tick boundaries from ranges
              const allTicks = new Set<number>();
              ranges.forEach(range => {
                allTicks.add(range.lower);
                allTicks.add(range.upper);
              });
              const sortedTicks = Array.from(allTicks).sort((a, b) => a - b);

              // Filter ticks that are visible in the current viewport
              // Use the same coordinate system as the liquidity bars
              const visibleTicks = sortedTicks.filter(tick => {
                const x = xFlip(tick);
                const isVisible = x >= x0 && x <= x1;
                return isVisible;
              });

              // Determine precision from visible probability span
              const pLeft = pAt(tickAtX(x0));
              const pRight = pAt(tickAtX(x1));
              const pMin = Math.min(pLeft, pRight);
              const pMax = Math.max(pLeft, pRight);
              const pSpan = Math.max(1e-9, pMax - pMin);
              const precision = pSpan >= 10 ? 1 : pSpan >= 1 ? 2 : pSpan >= 0.1 ? 3 : 4;

              // Adaptive tick selection based on zoom level and visible range
              // Calculate visible range directly from viewport coordinates for more accuracy
              const visibleTickLeft = tickAtX(x0);
              const visibleTickRight = tickAtX(x1);
              const visibleRange = Math.abs(visibleTickRight - visibleTickLeft);
              const totalRange = maxTick - minTick;
              const zoomLevel = totalRange / Math.max(1, visibleRange);
              
              // Calculate appropriate tick density based on zoom level
              let maxTicks: number;
              if (zoomLevel > 32) {
                // Very zoomed in - show more ticks
                maxTicks = 12;
              } else if (zoomLevel > 8) {
                // Moderately zoomed in
                maxTicks = 8;
              } else if (zoomLevel > 2) {
                // Slightly zoomed in
                maxTicks = 6;
              } else {
                // Zoomed out or full range
                maxTicks = 4;
              }
              
              // Ensure we don't exceed the number of available ticks
              maxTicks = Math.min(maxTicks, visibleTicks.length);
              
              // Select ticks with better distribution
              const tickStep = Math.max(1, Math.ceil(visibleTicks.length / maxTicks));
              let selectedTicks = visibleTicks.filter((_, index) => index % tickStep === 0);
              
              // If we still have too many ticks, use a more aggressive step
              if (selectedTicks.length > maxTicks) {
                const aggressiveStep = Math.ceil(visibleTicks.length / maxTicks);
                selectedTicks = visibleTicks.filter((_, index) => index % aggressiveStep === 0);
                // Always include the first and last visible ticks for context
                if (selectedTicks.length > 0 && selectedTicks[0] !== visibleTicks[0]) {
                  selectedTicks.unshift(visibleTicks[0]);
                }
                if (selectedTicks.length > 0 && selectedTicks[selectedTicks.length - 1] !== visibleTicks[visibleTicks.length - 1]) {
                  selectedTicks.push(visibleTicks[visibleTicks.length - 1]);
                }
              }
              
              // Always add left and right edge labels for context
              const leftEdgeTick = tickAtX(x0);
              const rightEdgeTick = tickAtX(x1);
              
              // Add edge ticks if they're not already in the selection
              if (!selectedTicks.includes(leftEdgeTick)) {
                selectedTicks.unshift(leftEdgeTick);
              }
              if (!selectedTicks.includes(rightEdgeTick) && rightEdgeTick !== leftEdgeTick) {
                selectedTicks.push(rightEdgeTick);
              }
              
              // Ensure we have at least 3 ticks: left edge, middle, right edge
              if (selectedTicks.length < 3) {
                // Add a middle tick if we don't have enough
                const middleTick = tickAtX(x0 + (x1 - x0) / 2);
                if (!selectedTicks.includes(middleTick)) {
                  // Insert in the middle of the array
                  const insertIndex = Math.floor(selectedTicks.length / 2);
                  selectedTicks.splice(insertIndex, 0, middleTick);
                }
                
                // If still not enough, add more ticks from visible range
                if (selectedTicks.length < 3 && visibleTicks.length > 0) {
                  const neededTicks = 3 - selectedTicks.length;
                  const step = Math.max(1, Math.floor(visibleTicks.length / neededTicks));
                  for (let i = 0; i < visibleTicks.length && selectedTicks.length < 3; i += step) {
                    const tick = visibleTicks[i];
                    if (!selectedTicks.includes(tick)) {
                      selectedTicks.push(tick);
                    }
                  }
                }
              }
              
              // Fallback: if no ticks selected, show at least the first and last visible ticks
              if (selectedTicks.length === 0 && visibleTicks.length > 0) {
                selectedTicks.push(visibleTicks[0]);
                if (visibleTicks.length > 1) {
                  selectedTicks.push(visibleTicks[visibleTicks.length - 1]);
                }
              }
              
              // Filter out ticks that are too close together (minimum 40px spacing)
              // But always preserve edge labels
              const minSpacing = 40;
              const filteredTicks = selectedTicks.filter((tick, index) => {
                if (index === 0) return true; // Always include first tick
                if (tick === leftEdgeTick || tick === rightEdgeTick) return true; // Always include edge ticks
                const x = xFlip(tick);
                const prevTick = selectedTicks[index - 1];
                const prevX = xFlip(prevTick);
                return Math.abs(x - prevX) >= minSpacing;
              });

              const labels: { x: number; vx: number; text: string; tick: number; isEdge: boolean }[] = [];
              filteredTicks.forEach(tick => {
                const x = xFlip(tick);
                const p = pAt(tick);
                // Calculate viewport-relative position for proper alignment
                const vx = x - x0;
                const isLeftEdge = tick === leftEdgeTick;
                const isRightEdge = tick === rightEdgeTick;
                const isEdge = isLeftEdge || isRightEdge;
                labels.push({ x, vx, text: `${p.toFixed(precision)}%`, tick, isEdge });
              });

              return (
                <g key={`xt-${tickVersion}-${visible.t0}-${visible.t1}-${scrollLeftPx}-${zoomLevel.toFixed(2)}`}>
                  {labels.map((lbl, i) => {
                    // Special positioning for edge labels
                    let x: number;
                    let anchor: 'start' | 'end' | 'middle';
                    
                    if (lbl.isEdge) {
                      if (lbl.tick === leftEdgeTick) {
                        // Left edge - position at the very left
                        x = x0 + 4;
                        anchor = 'start';
                      } else {
                        // Right edge - position at the very right
                        x = x1 - 4;
                        anchor = 'end';
                      }
                    } else {
                      // Regular positioning for non-edge labels
                      const edgePadding = 12;
                      const nearLeft = lbl.vx < edgePadding;
                      const nearRight = lbl.vx > innerW - edgePadding;
                      anchor = nearLeft ? 'start' : nearRight ? 'end' : 'middle';
                      const dx = nearLeft ? 6 : nearRight ? -6 : 0;
                      x = lbl.x + dx;
                    }
                    
                    return (
                      <g key={`${i}-${lbl.tick}`} pointerEvents="none">
                        <text 
                          x={x} 
                          y={padding.top + innerH + 12} 
                          textAnchor={anchor} 
                          className="fill-white text-[10px]"
                        >
                          {lbl.text}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
            
            <g transform={`translate(0,${padding.top})`}>

              {/* Market tick marker */}
              <g transform={`translate(${currentX},0)`} pointerEvents="none">
                <line y1={0} y2={innerH} stroke="#6b7280" strokeDasharray="4 4" />
                <rect x={-35} y={-24} width={70} height={18} rx={9} fill="#1C1D26" stroke="#374151" />
                <text y={-11} textAnchor="middle" className="fill-white text-[10px] font-semibold">Market</text>
              </g>

              {/* Liquidity bars */}
              {ranges.map((r: Range, idx: number) => {
                const xL = xFlip(r.upper);
                const xR = xFlip(r.lower);
                const x = Math.min(xL, xR);
                const w = Math.max(1, Math.abs(xR - xL));
                const h = Number((r.liquidity * 1000n) / (maxLiq === 0n ? 1n : maxLiq));
                const barH = (h / 1000) * innerH;
                const y = innerH - barH;

                const has0 = r.amount0 > 0n;
                const has1 = r.amount1 > 0n;

                if (has0 && !has1) {
                  // token0 only → red
                  return (
                    <g key={idx}>
                      <rect x={x} y={y} width={w} height={barH} fill="url(#redGradient)" rx={4} pointerEvents="none" />
                      <rect x={x} y={y} width={w} height={barH} fill="url(#barGloss)" rx={4} pointerEvents="none" />
                    </g>
                  );
                }
                if (!has0 && has1) {
                  // token1 only → green
                  return (
                    <g key={idx}>
                      <rect x={x} y={y} width={w} height={barH} fill="url(#greenGradient)" rx={4} pointerEvents="none" />
                      <rect x={x} y={y} width={w} height={barH} fill="url(#barGloss)" rx={4} pointerEvents="none" />
                    </g>
                  );
                }

                // Both token0 and token1 at current price (active bin): stack by composition
                const a0Num = Number.parseFloat(fmtToken(r.amount0, t0.decimals));
                const a1Num = Number.parseFloat(fmtToken(r.amount1, t1.decimals));
                const value0In1 = a0Num * price1Per0;
                const totalVal = value0In1 + a1Num;
                const redShare = totalVal > 0 ? value0In1 / totalVal : 0.5;
                const greenShare = 1 - redShare;
                const greenH = barH * greenShare;
                const redH = barH - greenH;

                return (
                  <g key={idx}>
                    {/* Green (token1) top segment */}
                    <rect x={x} y={y} width={w} height={greenH} fill="url(#greenGradient)" rx={4} pointerEvents="none" />
                    <rect x={x} y={y} width={w} height={greenH} fill="url(#barGloss)" rx={4} pointerEvents="none" />
                    {/* Red (token0) bottom segment */}
                    <rect x={x} y={y + greenH} width={w} height={redH} fill="url(#redGradient)" rx={4} pointerEvents="none" />
                    <rect x={x} y={y + greenH} width={w} height={redH} fill="url(#barGloss)" rx={4} pointerEvents="none" />
                  </g>
                );
              })}

              {/* Overlay for hover hit-testing */}
              <rect
                x={0}
                y={0}
                width={contentW}
                height={innerH}
                fill="transparent"
                pointerEvents="all"
                onMouseMove={onOverlayMove}
                onPointerMove={onOverlayMove as unknown as React.PointerEventHandler<SVGRectElement>}
                onMouseLeave={() => setTt(null)}
                onPointerLeave={() => setTt(null)}
              />



            </g>
          </svg>

          {/* Tooltip inside scrollable content so it follows scroll */}
          {tt && tt.kind === 'range' && tt.range && (
            <Tooltip x={tt.x} y={tt.y} range={tt.range} t0={t0} t1={t1} containerWidth={width} containerHeight={height} viewportWidth={width} scrollLeft={scrollLeftPx} />
          )}
          {tt && tt.kind === 'current' && (
            <CurrentTooltip
              x={padding.left + currentX}
              y={padding.top + innerH * 0.15}
              t0={t0}
              t1={t1}
              containerWidth={width}
              containerHeight={height}
              viewportWidth={width}
              scrollLeft={scrollLeftPx}
              price1Per0={price1Per0}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

interface TooltipProps {
  x: number;
  y: number;
  range: Range;
  t0: TokenMeta;
  t1: TokenMeta;
  containerWidth?: number;
  containerHeight?: number;
  scrollLeft?: number;
  viewportWidth?: number;
}

function Tooltip({ x, y, range, t0, t1, containerWidth, containerHeight, scrollLeft, viewportWidth }: TooltipProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: x, top: y });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vpW = viewportWidth ?? containerWidth ?? window.innerWidth;
    const sl = scrollLeft ?? 0;
    const minLeft = sl + 8;
    const maxLeft = sl + vpW - rect.width - 8;
    const maxTop = (containerHeight ?? window.innerHeight) - rect.height - 8;
    const left = Math.max(minLeft, Math.min(x, maxLeft));
    const top = Math.max(8, Math.min(y - rect.height - 8, maxTop));
    setPos({ left, top });
  }, [x, y, containerWidth, containerHeight, scrollLeft, viewportWidth]);

  const { lower, upper, liquidity, amount0, amount1 } = range;

  return (
    <div ref={ref} style={{ left: pos.left, top: pos.top }} className="pointer-events-none absolute z-30 bg-[#1C1D26]/95 backdrop-blur-sm border border-[#374151] shadow-xl rounded-2xl px-3 py-2 text-[12px] text-white">
      <div className="font-semibold mb-1">Range: <span className="font-mono">[{lower}, {upper})</span></div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="opacity-70">Liquidity</div>
        <div className="font-mono">{liquidity.toString()}</div>
        <div className="opacity-70">token0 ({t0.symbol})</div>
        <div className="font-mono">{fmtToken(amount0, t0.decimals)}</div>
        <div className="opacity-70">token1 ({t1.symbol})</div>
        <div className="font-mono">{fmtToken(amount1, t1.decimals)}</div>
      </div>
    </div>
  );
}

interface CurrentTooltipProps {
  x: number;
  y: number;
  t0: TokenMeta;
  t1: TokenMeta;
  price1Per0: number;
  containerWidth?: number;
  containerHeight?: number;
  scrollLeft?: number;
  viewportWidth?: number;
}

function CurrentTooltip(props: CurrentTooltipProps) {
  const { x, y, price1Per0, t0, t1, containerWidth, containerHeight, scrollLeft, viewportWidth } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: x, top: y });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vpW = viewportWidth ?? containerWidth ?? window.innerWidth;
    const sl = scrollLeft ?? 0;
    const minLeft = sl + 8;
    const maxLeft = sl + vpW - rect.width - 8;
    const top = Math.max(8, y + 10);
    const left = Math.max(minLeft, Math.min(x, maxLeft));
    setPos({ left, top });
  }, [x, y, containerWidth, containerHeight, scrollLeft, viewportWidth]);

  const priceStr = price1Per0.toFixed(6);
  const p0 = 100 / (1 + price1Per0);
  const p1 = 100 - p0;
  const p0Str = `${p0.toFixed(2)}%`;
  const p1Str = `${p1.toFixed(2)}%`;

  return (
    <div ref={ref} style={{ left: pos.left, top: pos.top }} className="pointer-events-none absolute z-30 bg-[#1C1D26]/95 backdrop-blur-sm border border-[#374151] shadow-xl rounded-2xl px-3 py-2 text-[12px] text-white">
      <div className="font-semibold mb-1">Current Price</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
        <div className="opacity-70">token1/token0</div>
        <div className="font-mono">{priceStr}</div>
      </div>
      <div className="font-semibold mb-1">Current Odds</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <div className="opacity-70">{t1.symbol}</div>
        <div className="font-mono">{p0Str}</div>
        <div className="opacity-70">{t0.symbol}</div>
        <div className="font-mono">{p1Str}</div>
      </div>
    </div>
  );
}
