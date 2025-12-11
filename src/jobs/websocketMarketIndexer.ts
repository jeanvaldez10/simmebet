import { parseAbi, createPublicClient, webSocket } from "viem";
import { arbitrum } from "viem/chains";
import { prisma } from "./client";
import { getTransfers } from "./tokenUtils";
import { getLiquidityEvents, saveLiquidityEvents } from "./liquidity";
import { formatSwaps, loadMarkets, calculateRedemptionPrices } from "./marketIndexer";

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

const wsClient = createPublicClient({
  chain: arbitrum,
  transport: webSocket(process.env.ARBITRUM_WS_RPC_URL || 'wss://arb1.arbitrum.io/ws'),
});

const POOL_MANAGER_ADDRESS = "0x360e68faccca8ca495c1b759fd9eee466db9fb32";
const SWAP_EVENT = parseAbi([
  "event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
]);

const INDEXER_INSTANCE_ID = `websocket_indexer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


async function updateLastProcessedBlock(blockNumber: bigint) {
  await prisma.indexerState.upsert({
    where: { id: "websocket_market_swaps" },
    create: {
      id: "websocket_market_swaps",
      lastBlockNumber: blockNumber,
      chainId: arbitrum.id,
    },
    update: {
      lastBlockNumber: blockNumber,
    },
  });
}

async function processSwapEvent(log: {
  transactionHash: string;
  blockHash: string;
  blockNumber: bigint;
  address: string;
  transactionIndex: number;
  logIndex: number;
  eventName?: string;
  args: {
    id: string;
    sender: string;
    liquidity: bigint;
    fee: number;
    tick: number;
    amount0: bigint;
    amount1: bigint;
    sqrtPriceX96: bigint;
  };
}, marketId: string) {
  const swapEntity: SwapEntity = {
    txHash: log.transactionHash as `0x${string}`,
    blockHash: log.blockHash as `0x${string}`,
    blockNumber: log.blockNumber,
    poolManagerAddress: log.address as `0x${string}`,
    txIndex: log.transactionIndex,
    logIndex: log.logIndex,
    eventName: log.eventName || 'Swap',
    swapId: log.args.id as `0x${string}`,
    sender: log.args.sender as `0x${string}`,
    liquidity: log.args.liquidity as bigint,
    fee: log.args.fee as number,
    tick: log.args.tick as number,
    amount0: log.args.amount0 as bigint,
    amount1: log.args.amount1 as bigint,
    sqrtPriceX96: log.args.sqrtPriceX96 as bigint,
    marketId,
  };

  const formattedSwaps = await formatSwaps([swapEntity]);
  
  if (formattedSwaps.length > 0) {
    await prisma.formattedSwap.createMany({
      data: formattedSwaps,
      skipDuplicates: true,
    });
    
    const swaps = await prisma.formattedSwap.findMany({
      where: { marketId },
    });
    
    const totalVolume = swaps.reduce((sum, swap) => sum + swap.volume, 0);
    
    const prices = calculateRedemptionPrices(log.args.sqrtPriceX96);
    
    await prisma.market.update({
      where: { id: marketId },
      data: { 
        volume: totalVolume,
        yesPrice: prices.yesPrice,
        noPrice: prices.noPrice 
      },
    });
    
    console.log(`[${INDEXER_INSTANCE_ID}] Processed swap for market ${marketId}, volume: ${totalVolume}`);
  }
}

async function processTokenTransfers(market: {
  yesTokenAddress?: string | null;
  noTokenAddress?: string | null;
}, blockNumber: bigint) {
  if (market.yesTokenAddress) {
    await getTransfers(market.yesTokenAddress as `0x${string}`, blockNumber);
  }
  if (market.noTokenAddress) {
    await getTransfers(market.noTokenAddress as `0x${string}`, blockNumber);
  }
}

async function processLiquidityEvents(market: {
  id: string;
  poolAddress?: string;
  yesTokenAddress?: string | null;
  noTokenAddress?: string | null;
}, blockNumber: bigint) {
  const marketForLiquidity = {
    id: market.id,
    poolAddress: market.poolAddress || "",
    yesTokenAddress: market.yesTokenAddress || null,
    noTokenAddress: market.noTokenAddress || null,
  };
  const liquidityEvents = await getLiquidityEvents(blockNumber, marketForLiquidity);
  if (liquidityEvents.length > 0) {
    await saveLiquidityEvents(liquidityEvents);
    console.log(`[${INDEXER_INSTANCE_ID}] Processed ${liquidityEvents.length} liquidity events for market ${market.id}`);
  }
}

export async function startWebsocketIndexer() {
  console.log(`[${INDEXER_INSTANCE_ID}] Starting websocket market indexer...`);
  
  const markets = await loadMarkets();
  const validMarkets = markets.filter(market => 
    market.poolAddress && market.poolAddress !== "" && market.poolAddress.length === 66
  );
  
  console.log(`[${INDEXER_INSTANCE_ID}] Monitoring ${validMarkets.length} markets with valid pool addresses`);
  
  const marketsByPoolAddress = new Map();
  const poolIds: `0x${string}`[] = [];
  
  for (const market of validMarkets) {
    const poolAddress = market.poolAddress as `0x${string}`;
    marketsByPoolAddress.set(poolAddress, market);
    poolIds.push(poolAddress);
  }
  
  const unwatch = wsClient.watchContractEvent({
    address: POOL_MANAGER_ADDRESS,
    abi: SWAP_EVENT,
    eventName: 'Swap',
    args: {
      id: poolIds,
    },
    onLogs: async (logs) => {
      for (const log of logs) {
        try {
          const poolId = log.args.id;
          const market = marketsByPoolAddress.get(poolId);
          
          if (market) {
            await processSwapEvent(log as {
              transactionHash: string;
              blockHash: string;
              blockNumber: bigint;
              address: string;
              transactionIndex: number;
              logIndex: number;
              eventName?: string;
              args: {
                id: string;
                sender: string;
                liquidity: bigint;
                fee: number;
                tick: number;
                amount0: bigint;
                amount1: bigint;
                sqrtPriceX96: bigint;
              };
            }, market.id);
            await processTokenTransfers(market, log.blockNumber);
            await processLiquidityEvents(market, log.blockNumber);
            await updateLastProcessedBlock(log.blockNumber);
          }
        } catch (error) {
          console.error(`[${INDEXER_INSTANCE_ID}] Error processing swap event:`, error);
        }
      }
    },
    onError: (error) => {
      console.error(`[${INDEXER_INSTANCE_ID}] Websocket error:`, error);
    },
  });
  
  process.on('SIGINT', () => {
    console.log(`[${INDEXER_INSTANCE_ID}] Shutting down websocket indexer...`);
    unwatch();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log(`[${INDEXER_INSTANCE_ID}] Shutting down websocket indexer...`);
    unwatch();
    process.exit(0);
  });
  
  console.log(`[${INDEXER_INSTANCE_ID}] Websocket indexer started successfully`);
  
  return new Promise(() => {});
}

if (require.main === module) {
  startWebsocketIndexer().catch(console.error);
}
