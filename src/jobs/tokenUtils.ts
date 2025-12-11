import { arbitrum } from "viem/chains";
import { client, prisma } from "./client";

const getTokenLogs = async (token: `0x${string}`, fromBlock: bigint) =>
  client.getContractEvents({
    address: token,
    eventName: "Transfer",
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "from",
            type: "address",
            internalType: "address",
          },
          {
            indexed: true,
            name: "to",
            type: "address",
            internalType: "address",
          },
          {
            indexed: false,
            name: "value",
            type: "uint256",
            internalType: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
    ],
    fromBlock,
    toBlock: "latest",
  });


export async function getTransfers(tokenAddress: `0x${string}`, startBlock: bigint) {
  const logs = await getTokenLogs(tokenAddress, startBlock);
  console.log("logs", logs.length);


  const rows = []
  for (const log of logs) {
    const from = (log.args.from as string).toLowerCase();
    const to = (log.args.to as string).toLowerCase();
    const amount = log.args.value!;
    const transactionHash = log.transactionHash;
    const blockNumber = log.blockNumber;
    const blockHash = log.blockHash;
    const logIndex = log.logIndex;


    rows.push({
        chainId: arbitrum.id,
        tokenAddress,
        fromAddress: from,
        toAddress: to,
        amount: amount.toString(),
        transactionHash,
        blockNumber,
        blockHash,
        logIndex,
    });
  }
  await prisma.tokenTransfers.createMany({
    data: rows,
    skipDuplicates: true,
  });
};
