import { ApprovalService } from '@/services/approvalService';
import { prisma } from '@/lib/prisma';
import { SIMPLE_ROUTER_ADDRESS, ARBITRUM_USDC_CONTRACT_ADDRESS } from '@/constants';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    userApproval: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('ApprovalService', () => {
  const mockUserId = 'test-user-id';
  const mockSpenderAddress = '0x1234567890123456789012345678901234567890';
  const mockApprovalHash = '0xabcdef1234567890abcdef1234567890abcdef12';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkApproval', () => {
    it('should return approval status when approval exists', async () => {
      const mockApproval = {
        isApproved: true,
        approvalHash: mockApprovalHash,
        updatedAt: new Date(),
        amount: '1000000',
      };

      (prisma.userApproval.findFirst as jest.Mock).mockResolvedValue(mockApproval);

      const result = await ApprovalService.checkApproval(
        mockUserId,
        SIMPLE_ROUTER_ADDRESS,
        mockSpenderAddress,
        ARBITRUM_USDC_CONTRACT_ADDRESS
      );

      expect(result.hasApproval).toBe(true);
      expect(result.approvalHash).toBe(mockApprovalHash);
      expect(prisma.userApproval.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          contractAddress: SIMPLE_ROUTER_ADDRESS,
          spenderAddress: mockSpenderAddress,
          tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS,
        },
      });
    });

    it('should return false when no approval exists', async () => {
      (prisma.userApproval.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await ApprovalService.checkApproval(
        mockUserId,
        SIMPLE_ROUTER_ADDRESS,
        mockSpenderAddress,
        ARBITRUM_USDC_CONTRACT_ADDRESS
      );

      expect(result.hasApproval).toBe(false);
      expect(result.approvalHash).toBeUndefined();
    });
  });

  describe('updateApproval', () => {
    it('should create new approval when none exists', async () => {
      const mockCreatedApproval = {
        id: 'approval-id',
        isApproved: true,
        approvalHash: mockApprovalHash,
      };

      (prisma.userApproval.upsert as jest.Mock).mockResolvedValue(mockCreatedApproval);

      const result = await ApprovalService.updateApproval({
        userId: mockUserId,
        contractAddress: SIMPLE_ROUTER_ADDRESS,
        spenderAddress: mockSpenderAddress,
        tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS,
        amount: '1000000',
        approvalHash: mockApprovalHash,
      });

      expect(result.success).toBe(true);
      expect(result.approval.id).toBe('approval-id');
      expect(prisma.userApproval.upsert).toHaveBeenCalledWith({
        where: {
          userId_contractAddress_spenderAddress_tokenAddress: {
            userId: mockUserId,
            contractAddress: SIMPLE_ROUTER_ADDRESS,
            spenderAddress: mockSpenderAddress,
            tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS,
          },
        },
        update: {
          amount: '1000000',
          isApproved: true,
          approvalHash: mockApprovalHash,
          updatedAt: expect.any(Date),
        },
        create: {
          userId: mockUserId,
          contractAddress: SIMPLE_ROUTER_ADDRESS,
          spenderAddress: mockSpenderAddress,
          tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS,
          amount: '1000000',
          isApproved: true,
          approvalHash: mockApprovalHash,
        },
      });
    });
  });

  describe('checkUniversalRouterApproval', () => {
    it('should call checkApproval with correct parameters', async () => {
      const mockApproval = {
        hasApproval: true,
        approvalHash: mockApprovalHash,
        lastChecked: new Date(),
        amount: '1000000',
      };

      jest.spyOn(ApprovalService, 'checkApproval').mockResolvedValue(mockApproval);

      const result = await ApprovalService.checkUniversalRouterApproval(
        mockUserId,
        mockSpenderAddress
      );

      expect(ApprovalService.checkApproval).toHaveBeenCalledWith(
        mockUserId,
        SIMPLE_ROUTER_ADDRESS,
        mockSpenderAddress,
        ARBITRUM_USDC_CONTRACT_ADDRESS
      );
      expect(result).toEqual(mockApproval);
    });
  });

  describe('updateUniversalRouterApproval', () => {
    it('should call updateApproval with correct parameters', async () => {
      const mockResult = {
        success: true,
        approval: {
          id: 'approval-id',
          isApproved: true,
          approvalHash: mockApprovalHash,
        },
      };

      jest.spyOn(ApprovalService, 'updateApproval').mockResolvedValue(mockResult);

      const result = await ApprovalService.updateUniversalRouterApproval(
        mockUserId,
        mockSpenderAddress,
        mockApprovalHash,
        '1000000'
      );

      expect(ApprovalService.updateApproval).toHaveBeenCalledWith({
        userId: mockUserId,
        contractAddress: SIMPLE_ROUTER_ADDRESS,
        spenderAddress: mockSpenderAddress,
        tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS,
        amount: '1000000',
        approvalHash: mockApprovalHash,
      });
      expect(result).toEqual(mockResult);
    });

    it('should use unlimited amount when amount is not provided', async () => {
      const mockResult = {
        success: true,
        approval: {
          id: 'approval-id',
          isApproved: true,
          approvalHash: mockApprovalHash,
        },
      };

      jest.spyOn(ApprovalService, 'updateApproval').mockResolvedValue(mockResult);

      await ApprovalService.updateUniversalRouterApproval(
        mockUserId,
        mockSpenderAddress,
        mockApprovalHash
      );

      expect(ApprovalService.updateApproval).toHaveBeenCalledWith({
        userId: mockUserId,
        contractAddress: SIMPLE_ROUTER_ADDRESS,
        spenderAddress: mockSpenderAddress,
        tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS,
        amount: '0', // Unlimited
        approvalHash: mockApprovalHash,
      });
    });
  });
}); 
