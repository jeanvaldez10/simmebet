import { arbitrum } from "viem/chains";
import { client, prisma } from "./client";

const blockTimestampCache = new Map<bigint, string>();

export async function getLatestBlock() {
  const block = await prisma.blockData.findFirst({
    orderBy: {
      blockNumber: 'desc',
    },
  });
  return block?.blockNumber;
}

export async function getBlockTimestamp(blockNumber: bigint): Promise<string> {
  if (blockTimestampCache.has(blockNumber)) {
    return blockTimestampCache.get(blockNumber)!;
  }

  const block = await prisma.blockData.findFirst({
    where: {
      chainId: arbitrum.id,
      blockNumber,
    },
  });

  if (!block) {
    const blockData = await client.getBlock({ blockNumber });
    console.log("blockData", blockData.timestamp)
    const timestamp = new Date(Number(blockData.timestamp) * 1000).toISOString();
    await prisma.blockData.create({
      data: {
        chainId: arbitrum.id,
        blockHash: blockData.hash,
        blockNumber,
        timestamp,
      },
    });
    blockTimestampCache.set(blockNumber, timestamp);
  } else {
    blockTimestampCache.set(blockNumber, block.timestamp.toISOString());
  }

  return blockTimestampCache.get(blockNumber)!;
}
