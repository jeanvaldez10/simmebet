import { marketService } from '@/services/marketService';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    market: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('marketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMarket', () => {
    it('should successfully create a market with all required fields', async () => {
      const mockMarketData = {
        contractAddress: '0x1234567890123456789012345678901234567890',
        poolAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        name: 'Test Market',
        question: 'Will this test pass?',
        type: 'binary' as const,
        date: new Date('2024-12-31'),
        image: '/uploads/test-image.jpg',
        volume: 0,
        createdBy: 'user-123',
        rules: ['https://example.com/rules'],
        isResolved: false,
        yesPrice: 65,
        noPrice: 35,
        totalLiquidity: 1500,
        status: 'ACTIVE' as const
      };

      const expectedCreatedMarket = {
        id: 'generated-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...mockMarketData
      };

      mockPrisma.market.create.mockResolvedValue(expectedCreatedMarket);

      const result = await marketService.createMarket(mockMarketData);

      expect(mockPrisma.market.create).toHaveBeenCalledWith({
        data: {
          contractAddress: mockMarketData.contractAddress,
          poolAddress: mockMarketData.poolAddress,
          blockchain: "ETH",
          status: mockMarketData.status,
          name: mockMarketData.question,
          question: mockMarketData.question,
          type: mockMarketData.type,
          date: mockMarketData.date,
          image: mockMarketData.image,
          volume: mockMarketData.volume,
          createdBy: mockMarketData.createdBy,
          rules: mockMarketData.rules,
          isResolved: mockMarketData.isResolved,
          resolvedOption: null,
          yesPrice: mockMarketData.yesPrice,
          noPrice: mockMarketData.noPrice,
          totalLiquidity: mockMarketData.totalLiquidity,
          yesTokenAddress: null,
          noTokenAddress: null,
        }
      });

      expect(result.market).toEqual(expectedCreatedMarket);
    });

    it('should handle missing optional fields with defaults', async () => {
      const minimalMarketData = {
        contractAddress: '0x1234567890123456789012345678901234567890',
        name: 'Minimal Test Market',
        question: 'Minimal test?',
        type: 'binary' as const,
        date: new Date('2024-12-31'),
        image: '/uploads/test.jpg',
        createdBy: 'user-123',
        rules: [],
        status: 'ACTIVE' as const
      };

      const expectedCreatedMarket = {
        id: 'generated-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...minimalMarketData,
        poolAddress: '',
        volume: 0,
        isResolved: false,
        yesPrice: 50,
        noPrice: 50,
        totalLiquidity: 0,
        yesTokenAddress: null,
        noTokenAddress: null
      };

      mockPrisma.market.create.mockResolvedValue(expectedCreatedMarket);

      const result = await marketService.createMarket(minimalMarketData);

      expect(mockPrisma.market.create).toHaveBeenCalledWith({
        data: {
          contractAddress: minimalMarketData.contractAddress,
          poolAddress: '',
          blockchain: "ETH",
          status: minimalMarketData.status,
          name: minimalMarketData.question,
          question: minimalMarketData.question,
          type: minimalMarketData.type,
          date: minimalMarketData.date,
          image: minimalMarketData.image,
          volume: 0,
          createdBy: minimalMarketData.createdBy,
          rules: minimalMarketData.rules,
          isResolved: false,
          resolvedOption: null,
          yesPrice: 50,
          noPrice: 50,
          totalLiquidity: 0,
          yesTokenAddress: null,
          noTokenAddress: null,
        }
      });

      expect(result.market).toEqual(expectedCreatedMarket);
    });

    it('should handle database errors gracefully', async () => {
      const marketData = {
        contractAddress: '0x1234567890123456789012345678901234567890',
        name: 'Test Market',
        question: 'Test?',
        type: 'binary' as const,
        date: new Date('2024-12-31'),
        image: '/uploads/test.jpg',
        createdBy: 'user-123',
        rules: [],
        status: 'ACTIVE' as const
      };

      mockPrisma.market.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(marketService.createMarket(marketData)).rejects.toThrow('Failed to create market');
    });
  });
});
