import { parseAbi } from "viem";
import { client, prisma } from "./client";

const POOL_MANAGER_ADDRESS = "0x360e68faccca8ca495c1b759fd9eee466db9fb32";
const MODIFY_LIQUIDITY_EVENT = parseAbi([
  "event ModifyLiquidity(bytes32 indexed id,address indexed sender,int24 tickLower,int24 tickUpper,int256 liquidityDelta,bytes32 salt)",
]);

type LiquidityEntity = {
  txHash: `0x${string}`;
  blockHash: `0x${string}`;
  blockNumber: bigint;
  poolManagerAddress: `0x${string}`;
  txIndex: number;
  logIndex: number;
  eventName: string;
  marketId?: string;
  poolKey: `0x${string}`;
  sender: `0x${string}`;
  tickLower: number;
  tickUpper: number;
  liquidityDelta: string;
  salt: `0x${string}`;
};

export async function getLiquidityEvents(fromBlock: bigint, market: {
  id: string;
  poolAddress: string;
  yesTokenAddress: string | null;
  noTokenAddress: string | null;
} | undefined = undefined): Promise<LiquidityEntity[]> {
  const args = market?.poolAddress ? { id: market.poolAddress as `0x${string}` } : {};
  const logs = await client.getLogs({
    address: POOL_MANAGER_ADDRESS,
    event: MODIFY_LIQUIDITY_EVENT[0],
    fromBlock,
    toBlock: "latest",
    args,
  });

  return logs.map((log): LiquidityEntity => {
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
      id,
      sender,
      tickLower,
      tickUpper,
      liquidityDelta,
      salt,
    } = args;

    return {
      poolManagerAddress: address,
      txHash: transactionHash,
      blockHash,
      blockNumber,
      txIndex: transactionIndex,
      logIndex,
      eventName,
      marketId: market?.id,
      poolKey: id as `0x${string}`,
      sender: sender as `0x${string}`,
      tickLower: tickLower as number,
      tickUpper: tickUpper as number,
      liquidityDelta: liquidityDelta!.toString(),
      salt: salt as `0x${string}`,
    };
  });
}

export async function saveLiquidityEvents(liquidityEvents: LiquidityEntity[]) {
  await prisma.liquidityEvent.createMany({
    data: liquidityEvents,
  });
}
