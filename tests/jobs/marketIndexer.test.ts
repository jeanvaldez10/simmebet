import { loadMarkets, formatSwaps, getPriceFromSqrtPriceX96, calculateRedemptionPrices } from '@/jobs/marketIndexer';

const mockFindMany = jest.fn();
const mockUpdate = jest.fn();
const mockCreateMany = jest.fn();
const mockFindFirst = jest.fn();

jest.mock('@/jobs/client', () => ({
  prisma: {
    market: {
      findMany: jest.fn(),
      update: jest.fn()
    },
    liquidityEvent: {
      createMany: jest.fn()
    },
    formattedSwap: {
      findMany: jest.fn(),
      createMany: jest.fn()
    },
    marketSwap: {
      findFirst: jest.fn()
    },
    indexerState: {
      findUnique: jest.fn()
    }
  },
  client: {}
}));

const { prisma } = require('@/jobs/client');
const mockedPrisma = prisma as any;

jest.mock('@/jobs/blockUtils', () => ({
  getBlockTimestamp: jest.fn().mockResolvedValue('2024-01-01T00:00:00.000Z'),
  getLatestBlock: jest.fn().mockResolvedValue(BigInt('12345'))
}));

describe('marketIndexer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.market.findMany.mockResolvedValue([]);
    mockedPrisma.formattedSwap.findMany.mockResolvedValue([]);
    mockedPrisma.indexerState.findUnique.mockResolvedValue({ lastBlockNumber: BigInt('0') });
  });

  describe('loadMarkets', () => {
    it('should load markets with pool addresses', async () => {
      const mockMarkets = [
        {
          id: 'market-1',
          contractAddress: '0x1234567890123456789012345678901234567890',
          poolAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          yesTokenAddress: '0xyes123',
          noTokenAddress: '0xno123'
        },
        {
          id: 'market-2',
          contractAddress: '0x2345678901234567890123456789012345678901',
          poolAddress: '0xbcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcde',
          yesTokenAddress: '0xyes456',
          noTokenAddress: '0xno456'
        }
      ];

      mockedPrisma.market.findMany.mockResolvedValue(mockMarkets);

      const result = await loadMarkets();

      expect(mockedPrisma.market.findMany).toHaveBeenCalledWith({
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

      expect(result).toEqual(mockMarkets);
    });

    it('should load markets without pool addresses (newly created)', async () => {
      const mockMarkets = [
        {
          id: 'market-3',
          contractAddress: '0x3456789012345678901234567890123456789012',
          poolAddress: '',
          yesTokenAddress: null,
          noTokenAddress: null
        }
      ];

      mockedPrisma.market.findMany.mockResolvedValue(mockMarkets);

      const result = await loadMarkets();

      expect(result).toEqual(mockMarkets);
    });
  });

  describe('formatSwaps', () => {
    it('should format swap data correctly', async () => {
      const mockSwaps = [
        {
          txHash: '0xtx123' as `0x${string}`,
          blockHash: '0xblock123' as `0x${string}`,
          blockNumber: BigInt('12345'),
          poolManagerAddress: '0xpool123' as `0x${string}`,
          txIndex: 0,
          logIndex: 0,
          eventName: 'Swap',
          marketId: 'market-1',
          swapId: '0xswap123' as `0x${string}`,
          sender: '0xuser123' as `0x${string}`,
          liquidity: BigInt('1000000000'),
          fee: 3000,
          tick: 0,
          amount0: BigInt('1000000'),
          amount1: BigInt('-500000'),
          sqrtPriceX96: BigInt('79228162514264337593543950336')
        }
      ];

      const result = await formatSwaps(mockSwaps);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        marketId: 'market-1',
        txHash: '0xtx123',
        timestamp: '2024-01-01T00:00:00.000Z',
        rawPrice: expect.any(Number),
        price: expect.any(Number),
        volume: expect.any(Number),
        amount0: expect.any(Number),
        amount1: expect.any(Number)
      });
    });
  });

  describe('getPriceFromSqrtPriceX96', () => {
    it('should calculate price correctly from sqrtPriceX96', () => {
      const sqrtPriceX96 = BigInt('79228162514264337593543950336'); // sqrt(1) * 2^96
      const result = getPriceFromSqrtPriceX96(sqrtPriceX96);
      
      expect(result).toBeCloseTo(1, 5); // Price should be close to 1
    });

    it('should handle different price values', () => {
      const sqrtPriceX96 = BigInt('111922659141529244174174408192'); // sqrt(2) * 2^96
      const result = getPriceFromSqrtPriceX96(sqrtPriceX96);
      
      expect(result).toBeCloseTo(2, 1); // Price should be close to 2
    });
  });

  describe('calculateRedemptionPrices', () => {
    it('should calculate correct $2 redemption prices for equal odds', () => {
      const sqrtPriceX96 = BigInt('79228162514264337593543950336'); // sqrt(1) * 2^96
      const result = calculateRedemptionPrices(sqrtPriceX96);
      
      expect(result.yesPrice).toBeCloseTo(1, 2);
      expect(result.noPrice).toBeCloseTo(1, 2);
      expect(result.yesPrice + result.noPrice).toBeCloseTo(2, 2);
    });

    it('should calculate correct prices when yes is 4x more likely than no', () => {
      const sqrtPriceX96 = BigInt('158456325028528675187087900672'); // sqrt(4) * 2^96
      const result = calculateRedemptionPrices(sqrtPriceX96);
      
      expect(result.yesPrice).toBeCloseTo(1.6, 1);
      expect(result.noPrice).toBeCloseTo(0.4, 1);
      expect(result.yesPrice + result.noPrice).toBeCloseTo(2, 2);
    });
  });
});
