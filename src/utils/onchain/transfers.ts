import { createPublicClient, http, parseAbi, decodeEventLog, type Address, type Hash, type Log } from 'viem';
import { arbitrum } from 'viem/chains';
import { prisma } from '../../prisma';
import { getMarketTokenPrice, calculateUSDValue, getMarketTokenData } from './token-pricing';
import { ARBITRUM_USDC_CONTRACT_ADDRESS } from '@/constants';

// ERC20 Transfer event ABI
const ERC20_TRANSFER_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]);

// ERC721 Transfer event ABI (for NFT transfers)
const ERC721_TRANSFER_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
]);

// ERC1155 TransferSingle event ABI
const ERC1155_TRANSFER_SINGLE_ABI = parseAbi([
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)'
]);

// ERC1155 TransferBatch event ABI
const ERC1155_TRANSFER_BATCH_ABI = parseAbi([
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)'
]);

export interface TransferEvent {
  type: 'ERC20' | 'ERC721' | 'ERC1155_SINGLE' | 'ERC1155_BATCH';
  from: Address;
  to: Address;
  value?: bigint;
  tokenId?: bigint;
  tokenAddress: Address;
  transactionHash: Hash;
  blockNumber: bigint;
  logIndex: number;
  // For ERC1155 batch transfers
  ids?: readonly bigint[];
  values?: readonly bigint[];
  // For ERC1155
  operator?: Address;
}

export interface GetTransfersParams {
  txHash: Hash;
  walletAddress: Address;
  rpcUrl?: string;
  chainId?: number;
}

/**
 * Get all transfer events (ERC20, ERC721, ERC1155) to and from a wallet address in a specific transaction
 * @param params - Parameters including transaction hash, wallet address, and optional RPC URL
 * @returns Promise<TransferEvent[]> - Array of transfer events
 */
export async function getTransfersInTransaction({
  txHash,
  walletAddress,
  rpcUrl,
  chainId = arbitrum.id
}: GetTransfersParams): Promise<TransferEvent[]> {
  // Create viem client
  const client = createPublicClient({
    chain: { ...arbitrum, id: chainId },
    transport: http(rpcUrl || arbitrum.rpcUrls.default.http[0]),
  });

  try {
    // Get transaction receipt to access logs
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    
    if (!receipt) {
      throw new Error(`Transaction not found: ${txHash}`);
    }

    const transferEvents: TransferEvent[] = [];
    const walletAddressLower = walletAddress.toLowerCase();

    // Process each log in the transaction
    for (const log of receipt.logs) {
      // Cast log to proper type with topics
      const logWithTopics = log as Log & { topics: readonly `0x${string}`[] };
      
      try {
        // Try to decode as ERC20 Transfer event
        const erc20Decoded = decodeEventLog({
          abi: ERC20_TRANSFER_ABI,
          data: logWithTopics.data,
          topics: logWithTopics.topics,
        });

        if (erc20Decoded.eventName === 'Transfer' && erc20Decoded.args) {
          const args = erc20Decoded.args as { from: Address; to: Address; value: bigint };
          const from = args.from.toLowerCase();
          const to = args.to.toLowerCase();
          
          // Check if wallet is involved in this transfer
          if (from === walletAddressLower || to === walletAddressLower) {
            transferEvents.push({
              type: 'ERC20',
              from: args.from,
              to: args.to,
              value: args.value,
              tokenAddress: logWithTopics.address,
              transactionHash: txHash,
              blockNumber: receipt.blockNumber,
              logIndex: logWithTopics.logIndex ?? 0,
            });
          }
        }
      } catch {
        // Not an ERC20 transfer, try other types
      }

      try {
        // Try to decode as ERC721 Transfer event
        const erc721Decoded = decodeEventLog({
          abi: ERC721_TRANSFER_ABI,
          data: logWithTopics.data,
          topics: logWithTopics.topics,
        });

        if (erc721Decoded.eventName === 'Transfer' && erc721Decoded.args) {
          const args = erc721Decoded.args as { from: Address; to: Address; tokenId: bigint };
          const from = args.from.toLowerCase();
          const to = args.to.toLowerCase();
          
          // Check if wallet is involved in this transfer
          if (from === walletAddressLower || to === walletAddressLower) {
            transferEvents.push({
              type: 'ERC721',
              from: args.from,
              to: args.to,
              tokenId: args.tokenId,
              tokenAddress: logWithTopics.address,
              transactionHash: txHash,
              blockNumber: receipt.blockNumber,
              logIndex: logWithTopics.logIndex ?? 0,
            });
          }
        }
      } catch {
        // Not an ERC721 transfer, try ERC1155
      }

      try {
        // Try to decode as ERC1155 TransferSingle event
        const erc1155SingleDecoded = decodeEventLog({
          abi: ERC1155_TRANSFER_SINGLE_ABI,
          data: logWithTopics.data,
          topics: logWithTopics.topics,
        });

        if (erc1155SingleDecoded.eventName === 'TransferSingle' && erc1155SingleDecoded.args) {
          const args = erc1155SingleDecoded.args as { 
            operator: Address; 
            from: Address; 
            to: Address; 
            id: bigint; 
            value: bigint 
          };
          const from = args.from.toLowerCase();
          const to = args.to.toLowerCase();
          
          // Check if wallet is involved in this transfer
          if (from === walletAddressLower || to === walletAddressLower) {
            transferEvents.push({
              type: 'ERC1155_SINGLE',
              from: args.from,
              to: args.to,
              value: args.value,
              tokenId: args.id,
              operator: args.operator,
              tokenAddress: logWithTopics.address,
              transactionHash: txHash,
              blockNumber: receipt.blockNumber,
              logIndex: logWithTopics.logIndex ?? 0,
            });
          }
        }
      } catch {
        // Not an ERC1155 single transfer, try batch
      }

      try {
        // Try to decode as ERC1155 TransferBatch event
        const erc1155BatchDecoded = decodeEventLog({
          abi: ERC1155_TRANSFER_BATCH_ABI,
          data: logWithTopics.data,
          topics: logWithTopics.topics,
        });

        if (erc1155BatchDecoded.eventName === 'TransferBatch' && erc1155BatchDecoded.args) {
          const args = erc1155BatchDecoded.args as { 
            operator: Address; 
            from: Address; 
            to: Address; 
            ids: readonly bigint[]; 
            values: readonly bigint[] 
          };
          const from = args.from.toLowerCase();
          const to = args.to.toLowerCase();
          
          // Check if wallet is involved in this transfer
          if (from === walletAddressLower || to === walletAddressLower) {
            transferEvents.push({
              type: 'ERC1155_BATCH',
              from: args.from,
              to: args.to,
              ids: args.ids,
              values: args.values,
              operator: args.operator,
              tokenAddress: logWithTopics.address,
              transactionHash: txHash,
              blockNumber: receipt.blockNumber,
              logIndex: logWithTopics.logIndex ?? 0,
            });
          }
        }
      } catch {
        // Not an ERC1155 batch transfer, continue to next log
      }
    }

    // Sort by log index to maintain order
    return transferEvents.sort((a, b) => a.logIndex - b.logIndex);

  } catch (error) {
    console.error('Error fetching transfer events:', error);
    throw new Error(`Failed to fetch transfer events for transaction ${txHash}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get only ERC20 transfer events for a specific transaction and wallet
 * @param params - Parameters including transaction hash, wallet address, and optional RPC URL
 * @returns Promise<TransferEvent[]> - Array of ERC20 transfer events
 */
export async function getERC20TransfersInTransaction({
  txHash,
  walletAddress,
  rpcUrl,
  chainId = arbitrum.id
}: GetTransfersParams): Promise<TransferEvent[]> {
  const allTransfers = await getTransfersInTransaction({
    txHash,
    walletAddress,
    rpcUrl,
    chainId
  });
  
  return allTransfers.filter(transfer => transfer.type === 'ERC20');
}

/**
 * Get only NFT transfer events (ERC721) for a specific transaction and wallet
 * @param params - Parameters including transaction hash, wallet address, and optional RPC URL
 * @returns Promise<TransferEvent[]> - Array of ERC721 transfer events
 */
export async function getNFTTransfersInTransaction({
  txHash,
  walletAddress,
  rpcUrl,
  chainId = arbitrum.id
}: GetTransfersParams): Promise<TransferEvent[]> {
  const allTransfers = await getTransfersInTransaction({
    txHash,
    walletAddress,
    rpcUrl,
    chainId
  });
  
  return allTransfers.filter(transfer => transfer.type === 'ERC721');
}

/**
 * Get only ERC1155 transfer events for a specific transaction and wallet
 * @param params - Parameters including transaction hash, wallet address, and optional RPC URL
 * @returns Promise<TransferEvent[]> - Array of ERC1155 transfer events
 */
export async function getERC1155TransfersInTransaction({
  txHash,
  walletAddress,
  rpcUrl,
  chainId = arbitrum.id
}: GetTransfersParams): Promise<TransferEvent[]> {
  const allTransfers = await getTransfersInTransaction({
    txHash,
    walletAddress,
    rpcUrl,
    chainId
  });
  
  return allTransfers.filter(transfer => 
    transfer.type === 'ERC1155_SINGLE' || transfer.type === 'ERC1155_BATCH'
  );
}

export interface WriteBalanceChangesParams {
  transfers: TransferEvent[];
  userId: string;
  walletAddress: Address;
  marketId?: string;
  chainId?: number;
  rpcUrl?: string;
}

/**
 * Write balance changes to the database for each transfer event
 * @param params - Parameters including transfers, userId, walletAddress, marketId, chainId, and rpcUrl
 * @returns Promise<number> - Number of balance changes created
 */
export async function writeBalanceChanges({
  transfers,
  userId,
  walletAddress,
  marketId,
  chainId = arbitrum.id,
  rpcUrl
}: WriteBalanceChangesParams): Promise<number> {
  if (transfers.length === 0) {
    return 0;
  }

  try {
    const walletAddressLower = walletAddress.toLowerCase();
    
    // Get market data if marketId is provided
    let marketData: { yesTokenAddress?: Address; noTokenAddress?: Address; poolAddress?: Address } | null = null;
    const actualMarketId: string | null = marketId || null; // marketId is already the database ID
    if (marketId) {
      try {
        marketData = await getMarketTokenData(marketId);
      } catch (error) {
        console.warn(`Failed to get market data for marketId ${marketId}:`, error);
      }
    }
    
    // Prepare balance change records with price fetching
    const balanceChanges = await Promise.all(transfers.map(async (transfer) => {
      // Determine the amount based on transfer type
      let amount: bigint;
      
      if (transfer.type === 'ERC20') {
        amount = transfer.value || BigInt(0);
      } else if (transfer.type === 'ERC721') {
        // For NFTs, we use 1 as the amount (representing 1 token)
        amount = BigInt(1);
      } else if (transfer.type === 'ERC1155_SINGLE') {
        amount = transfer.value || BigInt(0);
      } else if (transfer.type === 'ERC1155_BATCH') {
        // For batch transfers, sum all values
        amount = transfer.values?.reduce((sum, val) => sum + val, BigInt(0)) || BigInt(0);
      } else {
        amount = BigInt(0);
      }

      // Determine if this is an incoming or outgoing transfer
      const isIncoming = transfer.to.toLowerCase() === walletAddressLower;
      const isOutgoing = transfer.from.toLowerCase() === walletAddressLower;
      
      // Apply sign based on direction:
      // - Incoming transfers (to wallet) are positive
      // - Outgoing transfers (from wallet) are negative
      let signedAmount: bigint;
      if (isIncoming && !isOutgoing) {
        // Pure incoming transfer
        signedAmount = amount;
      } else if (isOutgoing && !isIncoming) {
        // Pure outgoing transfer
        signedAmount = -amount;
      } else {
        // This shouldn't happen in normal cases, but handle it gracefully
        // (wallet is both sender and receiver - treat as net zero)
        signedAmount = BigInt(0);
      }

      // Calculate USD value
      let usdValue: number | undefined = undefined;

      // Check if this is USDC - use $1 per token
      if (transfer.tokenAddress.toLowerCase() === ARBITRUM_USDC_CONTRACT_ADDRESS.toLowerCase()) {
        const usdcAmount = Number(signedAmount) / 1e6; // USDC has 6 decimals
        usdValue = Math.abs(usdcAmount); // Use absolute value for volume
      } else if (marketData && marketData.poolAddress) {
        try {
          // Check if this is a market token (yes or no token)
          const isMarketToken = 
            transfer.tokenAddress.toLowerCase() === marketData.yesTokenAddress?.toLowerCase() ||
            transfer.tokenAddress.toLowerCase() === marketData.noTokenAddress?.toLowerCase();
          
          if (isMarketToken) {
            const priceInfo = await getMarketTokenPrice({
              tokenAddress: transfer.tokenAddress,
              marketId,
              poolAddress: marketData.poolAddress,
              rpcUrl,
              chainId
            });
            
            usdValue = calculateUSDValue(signedAmount, priceInfo);
          }
        } catch (error) {
          console.warn(`Failed to get price for token ${transfer.tokenAddress}:`, error);
        }
      }

      return {
        userId,
        marketId: actualMarketId || null,
        tokenAddress: transfer.tokenAddress,
        amount: signedAmount.toString(), // Convert BigInt to string for Prisma
        usdValue: usdValue ? usdValue.toString() : null, // Convert to string for Prisma
        txHash: transfer.transactionHash,
        chainId,
      };
    }));

    // Create balance changes in the database
    const result = await prisma.balanceChange.createMany({
      data: balanceChanges,
      skipDuplicates: true, // Skip if duplicate records exist
    });

    return result.count;
  } catch (error) {
    console.error('Error writing balance changes:', error);
    throw new Error(`Failed to write balance changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get transfers and write them as balance changes in one operation
 * @param params - Parameters for getting transfers and writing balance changes
 * @returns Promise<{ transfers: TransferEvent[], balanceChangesCount: number }>
 */
export async function getTransfersAndWriteBalanceChanges({
  txHash,
  walletAddress,
  userId,
  marketId,
  rpcUrl,
  chainId = arbitrum.id
}: GetTransfersParams & { userId: string; marketId?: string }): Promise<{
  transfers: TransferEvent[];
  balanceChangesCount: number;
}> {
  // Get all transfers for the transaction
  const transfers = await getTransfersInTransaction({
    txHash,
    walletAddress,
    rpcUrl,
    chainId
  });

  // Write balance changes to database
  const balanceChangesCount = await writeBalanceChanges({
    transfers,
    userId,
    walletAddress,
    marketId,
    chainId,
    rpcUrl
  });

  return {
    transfers,
    balanceChangesCount
  };
}
