import { prisma } from '@/lib/prisma';
import { SIMPLE_ROUTER_ADDRESS, ARBITRUM_USDC_CONTRACT_ADDRESS } from '@/constants';

export interface ApprovalData {
  userId: string;
  contractAddress: string;
  spenderAddress: string;
  tokenAddress: string;
  amount?: string;
  approvalHash?: string;
}

export class ApprovalService {
  /**
   * Check if a user has approval for a specific contract to spend tokens
   */
  static async checkApproval(
    userId: string,
    contractAddress: string,
    spenderAddress: string,
    tokenAddress?: string
  ) {
    try {
      const approval = await prisma.userApproval.findFirst({
        where: {
          userId,
          contractAddress,
          spenderAddress,
          tokenAddress,
        },
      });

      return {
        hasApproval: approval?.isApproved || false,
        approvalHash: approval?.approvalHash,
        lastChecked: approval?.updatedAt,
        amount: approval?.amount,
      };
    } catch (error) {
      console.error('Error checking approval:', error);
      throw new Error('Failed to check approval status');
    }
  }

  /**
   * Update or create an approval record
   */
  static async updateApproval(approvalData: ApprovalData) {
    try {
      const approval = await prisma.userApproval.upsert({
        where: {
          userId_contractAddress_spenderAddress_tokenAddress: {
            userId: approvalData.userId,
            contractAddress: approvalData.contractAddress,
            spenderAddress: approvalData.spenderAddress,
            tokenAddress: approvalData.tokenAddress,
          },
        },
        update: {
          amount: approvalData.amount,
          isApproved: true,
          approvalHash: approvalData.approvalHash,
          updatedAt: new Date(),
        },
        create: {
          userId: approvalData.userId,
          contractAddress: approvalData.contractAddress,
          spenderAddress: approvalData.spenderAddress,
          tokenAddress: approvalData.tokenAddress,
          amount: approvalData.amount,
          isApproved: true,
          approvalHash: approvalData.approvalHash,
        },
      });

      return {
        success: true,
        approval: {
          id: approval.id,
          isApproved: approval.isApproved,
          approvalHash: approval.approvalHash,
        },
      };
    } catch (error) {
      console.error('Error updating approval:', error);
      throw new Error('Failed to update approval status');
    }
  }

  /**
   * Check if user has approval for the Universal Router to spend USDC
   */
  static async checkUniversalRouterApproval(userId: string, spenderAddress: string) {
    return this.checkApproval(
      userId,
      SIMPLE_ROUTER_ADDRESS,
      spenderAddress,
      ARBITRUM_USDC_CONTRACT_ADDRESS
    );
  }
} 
