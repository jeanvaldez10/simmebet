import { parseAbi } from "viem";
import { arbitrum } from "viem/chains";

import { client, prisma } from "./client";
import { getBlockTimestamp, getLatestBlock } from "./blockUtils";
import { getTransfers } from "./tokenUtils";
import { getLiquidityEvents, saveLiquidityEvents } from "./liquidity";

type SwapEntity = {
  txHash: `0x${string}`;
  blockHash: `0x${string}`;
  blockNumber: bigint;
  poolManagerAddress: `0x${string}`;
  txIndex: number;
  logIndex: number;
  eventName: string;
  marketId?: string;
  swapId: `0x${string}`;
  sender: `0x${string}`;
  liquidity: bigint;
  fee: number;
  tick: number;
  amount0: bigint;
  amount1: bigint;
  sqrtPriceX96: bigint;
};

type FormattedSwap = {
  marketId: string;
  timestamp: Date | string;
  txHash: string;
  rawPrice: number;
  price: number;
  volume: number;
  amount0: number;
  amount1: number;
};

// Constants
const POOL_MANAGER_ADDRESS = "0x360e68faccca8ca495c1b759fd9eee466db9fb32";
const SWAP_EVENT = parseAbi([
  "event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
]);

// Keep track of the latest block indexed
async function fetchSwaps(fromBlock: bigint, market: {
  id: string;
  poolAddress: string;
  yesTokenAddress: string | null;
  noTokenAddress: string | null;
} | undefined = undefined): Promise<SwapEntity[]> {
  try {
    const args = market?.poolAddress ? { id: market.poolAddress as `0x${string}` } : {};
    const logs = await client.getLogs({
      address: POOL_MANAGER_ADDRESS,
      event: SWAP_EVENT[0],
      fromBlock,
      toBlock: "latest",
      args,
    });

    return logs.map((log): SwapEntity => {
      const {
        address,
        args,
        blockHash,
        blockNumber,
        transactionHash,
        logIndex,
        transactionIndex,
        eventName,
      } = log;

      const {
        sender,
        amount0,
        amount1,
        sqrtPriceX96,
        liquidity,
        tick,
        fee,
        id,
      } = args;

      return {
        txHash: transactionHash,
        blockHash,
        blockNumber,
        poolManagerAddress: address,
        txIndex: transactionIndex,
        logIndex,
        eventName,
        swapId: id as `0x${string}`,
        sender: sender as `0x${string}`,
        liquidity: liquidity as bigint,
        fee: fee as number,
        tick: tick as number,
        amount0: amount0 as bigint,
        amount1: amount1 as bigint,
        sqrtPriceX96: sqrtPriceX96 as bigint,
        marketId: market?.id,
      };
    });
  } catch (error) {
    console.error("Error fetching swaps:", error);
    return [];
  }
}

export function getPriceFromSqrtPriceX96(sqrtPriceX96: bigint): number {
  const sqrt = Number(sqrtPriceX96) / 2 ** 96;
  return sqrt * sqrt;
}

export function calculateRedemptionPrices(sqrtPriceX96: bigint): { yesPrice: number; noPrice: number } {
  const price = getPriceFromSqrtPriceX96(sqrtPriceX96);
  
  let noProbability: number;
  let yesProbability: number;
  
  if (price >= 1) {
    // NO (outcome 0) is the favorite
    noProbability = price / (1 + price);
    yesProbability = 1 - noProbability;
  } else {
    // YES (outcome 1) is the favorite
    yesProbability = 1 / (1 + price);
    noProbability = 1 - yesProbability;
  }
  
  const yesPrice = yesProbability * 2;
  const noPrice = noProbability * 2;
  
  return { yesPrice, noPrice };
}

async function getLastMarketSwapBlock(): Promise<bigint> {
  const lastBlock = await prisma.indexerState.findUnique({
    where: { id: "market_swaps" },
  });

  return lastBlock?.lastBlockNumber || 0n;
}

export async function formatSwaps(swaps: SwapEntity[]): Promise<FormattedSwap[]> {
  const formattedSwaps = await Promise.all(swaps.map(async (swap) => {
    const price = getPriceFromSqrtPriceX96(swap.sqrtPriceX96);
    const amount0Normalized = Number(swap.amount0) / 1e18;
    const amount1Normalized = Number(swap.amount1) / 1e18;
    const timestamp = await getBlockTimestamp(swap.blockNumber);

    const noOdds = 1 / price; // Yes token price = price / (1 + price)
    const yesOddsNormalized = 1 / (1 + noOdds);

    console.log("yesOddsNormalized", price, yesOddsNormalized);

    return {
      marketId: swap.marketId!,
      txHash: swap.txHash,
      timestamp: timestamp,
      rawPrice: price,
      price: yesOddsNormalized,
      volume: Math.abs(amount0Normalized) + Math.abs(amount1Normalized),
      amount0: amount0Normalized,
      amount1: amount1Normalized,
    };
  }));

  return formattedSwaps;
}

export async function loadMarkets(): Promise<
  { 
    id: string;
    contractAddress?: string;
    poolAddress: string;
    yesTokenAddress: `0x${string}` | null;
    noTokenAddress: `0x${string}` | null;
  }[]
> {
  const markets = await prisma.market.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            poolAddress: {
              not: "",
            },
          },
          {
            contractAddress: {
              not: "",
            },
            poolAddress: {
              equals: "",
            },
          }
        ]
      },
      select: {
        id: true,
        contractAddress: true,
        poolAddress: true,
        yesTokenAddress: true,
        noTokenAddress: true,
      },
    });

  return markets.filter((market) => 
    (market.poolAddress?.length === 66) || 
    (market.contractAddress?.length === 42 && market.poolAddress === "")
  ) as {
    id: string;
    contractAddress?: string;
    poolAddress: string;
    yesTokenAddress: `0x${string}` | null;
    noTokenAddress: `0x${string}` | null;
  }[];
}

async function updateMarketPricesAndVolume(marketId: string, latestSqrtPriceX96?: bigint) {
  const swaps = await prisma.formattedSwap.findMany({
    where: { marketId },
  });

  const totalVolume = swaps.reduce((sum, swap) => {
    return sum + swap.volume;
  }, 0);

  let yesPrice = 50;
  let noPrice = 50;
  
  if (latestSqrtPriceX96) {
    const prices = calculateRedemptionPrices(latestSqrtPriceX96);
    yesPrice = prices.yesPrice;
    noPrice = prices.noPrice;
  } else if (swaps.length > 0) {
    const latestSwap = swaps[swaps.length - 1];
    const sqrtPriceX96 = BigInt(Math.round(latestSwap.rawPrice * (2 ** 96)));
    const prices = calculateRedemptionPrices(sqrtPriceX96);
    yesPrice = prices.yesPrice;
    noPrice = prices.noPrice;
  }

  // Get market info for total liquidity calculation
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    select: {
      yesTokenAddress: true,
      noTokenAddress: true,
    },
  });

  let totalLiquidity = 0;
  if (market?.yesTokenAddress && market?.noTokenAddress) {
    try {
      const { calculateMarketTotalLiquidity } = await import("./totalLiquidity");
      totalLiquidity = await calculateMarketTotalLiquidity(
        marketId,
        market.yesTokenAddress,
        market.noTokenAddress,
        yesPrice,
        noPrice
      );
    } catch (error) {
      console.error(`Error calculating total liquidity for market ${marketId}:`, error);
    }
  }

  await prisma.market.update({
    where: { id: marketId },
    data: { 
      volume: totalVolume,
      yesPrice,
      noPrice,
      totalLiquidity
    },
  });
  
  console.log("UPDATED VOLUME, PRICES, AND LIQUIDITY", marketId, { 
    totalVolume, 
    yesPrice, 
    noPrice, 
    totalLiquidity 
  });
}

export async function getMarketData(fromBlock: bigint | undefined = undefined) {
  const startBlock = fromBlock == undefined ? (await getLastMarketSwapBlock()) + 1n : fromBlock;
  const endBlock = await getLatestBlock();

  const markets = await loadMarkets();

  for (const market of markets) {
    if (!market.poolAddress || market.poolAddress === "") {
      console.log("MARKET WITHOUT POOL:", market.contractAddress);
      continue;
    }

    console.log("MARKET:", market.poolAddress);
    const swaps = await fetchSwaps(startBlock, market);
    const formattedSwaps = await formatSwaps(swaps);
    console.log("formattedSwaps", formattedSwaps.length);

    if (formattedSwaps.length > 0) {
      // await prisma.formattedSwap.deleteMany({
      //   where: { marketId: market.id },
      // });
      await prisma.formattedSwap.createMany({
        data: formattedSwaps,
        skipDuplicates: true,
      });
      const latestSqrtPriceX96 = swaps[swaps.length - 1]?.sqrtPriceX96;
      await updateMarketPricesAndVolume(market.id, latestSqrtPriceX96);
    }

    if (market.yesTokenAddress) {
      await getTransfers(market.yesTokenAddress as `0x${string}`, startBlock);
    }
    if (market.noTokenAddress) {
      await getTransfers(market.noTokenAddress as `0x${string}`, startBlock);
    }

    const liquidityEvents = await getLiquidityEvents(startBlock, market);
    console.log("liquidityEvents", liquidityEvents.length);
    await saveLiquidityEvents(liquidityEvents);
  }

  await prisma.indexerState.upsert({
    where: { id: "market_swaps", chainId: arbitrum.id },
    create: {
      id: "market_swaps",
      lastBlockNumber: endBlock || startBlock,
      chainId: arbitrum.id,
    },
    update: {
      lastBlockNumber: endBlock || startBlock,
    },
  });
}

/**
 * Index new swaps/data for a single market
 * @param marketId - The ID of the market to index
 * @param fromBlock - Optional starting block number (defaults to last indexed block + 1)
 * @returns Promise<void>
 */
export async function indexSingleMarket(marketId: string, fromBlock?: bigint): Promise<void> {
  try {
    console.log(`Starting indexing for market: ${marketId}`);
    
    // Get the market data
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      select: {
        id: true,
        contractAddress: true,
        poolAddress: true,
        yesTokenAddress: true,
        noTokenAddress: true,
        status: true,
      },
    });

    if (!market) {
      throw new Error(`Market with ID ${marketId} not found`);
    }

    if (market.status !== "ACTIVE") {
      throw new Error(`Market ${marketId} is not active (status: ${market.status})`);
    }

    if (!market.poolAddress || market.poolAddress === "") {
      throw new Error(`Market ${marketId} does not have a valid pool address`);
    }

    // Determine the starting block
    const startBlock = fromBlock ?? (await getLastMarketSwapBlock()) + 1n;
    const endBlock = await getLatestBlock();

    console.log(`Indexing from block ${startBlock} to ${endBlock} for market ${marketId}`);

    // Fetch swaps for this specific market
    const swaps = await fetchSwaps(startBlock, market);
    console.log(`Found ${swaps.length} swaps for market ${marketId}`);

    if (swaps.length > 0) {
      // Format the swaps
      const formattedSwaps = await formatSwaps(swaps);
      console.log(`Formatted ${formattedSwaps.length} swaps for market ${marketId}`);

      // Save formatted swaps to database
      await prisma.formattedSwap.createMany({
        data: formattedSwaps,
        skipDuplicates: true,
      });

      // Update market prices and volume
      const latestSqrtPriceX96 = swaps[swaps.length - 1]?.sqrtPriceX96;
      await updateMarketPricesAndVolume(market.id, latestSqrtPriceX96);
    }

    // Index token transfers for YES token
    if (market.yesTokenAddress) {
      console.log(`Indexing YES token transfers for market ${marketId}`);
      await getTransfers(market.yesTokenAddress as `0x${string}`, startBlock);
    }

    // Index token transfers for NO token
    if (market.noTokenAddress) {
      console.log(`Indexing NO token transfers for market ${marketId}`);
      await getTransfers(market.noTokenAddress as `0x${string}`, startBlock);
    }

    // Index liquidity events
    console.log(`Indexing liquidity events for market ${marketId}`);
    const liquidityEvents = await getLiquidityEvents(startBlock, market);
    console.log(`Found ${liquidityEvents.length} liquidity events for market ${marketId}`);
    await saveLiquidityEvents(liquidityEvents);

    // Update the indexer state for this specific market
    await prisma.indexerState.upsert({
      where: { 
        id: `market_${marketId}_swaps`,
        chainId: arbitrum.id 
      },
      create: {
        id: `market_${marketId}_swaps`,
        lastBlockNumber: endBlock || startBlock,
        chainId: arbitrum.id,
      },
      update: {
        lastBlockNumber: endBlock || startBlock,
      },
    });

    console.log(`Successfully indexed market ${marketId} up to block ${endBlock || startBlock}`);
  } catch (error) {
    console.error(`Error indexing market ${marketId}:`, error);
    throw error;
  }
}

/**
 * Get the last indexed block for a specific market
 * @param marketId - The ID of the market
 * @returns Promise<bigint> - The last indexed block number
 */
export async function getLastMarketIndexedBlock(marketId: string): Promise<bigint> {
  const lastBlock = await prisma.indexerState.findUnique({
    where: { 
      id: `market_${marketId}_swaps`,
      chainId: arbitrum.id 
    },
  });

  return lastBlock?.lastBlockNumber || 0n;
}

/**
 * Index all new data for a single market from the last indexed block
 * @param marketId - The ID of the market to index
 * @returns Promise<void>
 */
export async function indexSingleMarketFromLastBlock(marketId: string): Promise<void> {
  const lastBlock = await getLastMarketIndexedBlock(marketId);
  await indexSingleMarket(marketId, lastBlock + 1n);
}

// getMarketData(); // Commented out to prevent execution during tests

