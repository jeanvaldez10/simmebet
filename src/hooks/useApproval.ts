import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { SIMPLE_ROUTER_ADDRESS, ARBITRUM_USDC_CONTRACT_ADDRESS } from '@/constants';
import { erc20Abi, parseUnits } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback, useRef, useState } from 'react';
import { 
  isMarketApprovedInCache, 
  cacheMarketApproval,
  clearExpiredCacheEntries
} from '@/utils/approvalCache';

export function useApproval() {
  const { walletAddress } = useAuth();
  const queryClient = useQueryClient();
  
  // Track pending approval requests to prevent duplicates
  const pendingApprovals = useRef<Set<string>>(new Set());
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);


  // Check approval status from database
  const { data: approvalStatus, isLoading: isCheckingApproval } = useQuery({
    queryKey: ['approval-status', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      
      // Clear expired cache entries before checking
      clearExpiredCacheEntries();
      
      const response = await fetch('/api/approve');
      if (!response.ok) {
        throw new Error('Failed to check approval status');
      }
      return response.json();
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Check current allowance on-chain
  const { data: currentAllowance, isLoading: isCheckingAllowance } = useReadContract({
    address: ARBITRUM_USDC_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: walletAddress ? [walletAddress, SIMPLE_ROUTER_ADDRESS] : undefined,
  });

  // Write approval transaction
  const { data: approvalHash, isPending: isApproving } = useWriteContract();

  // Wait for approval transaction
  const { isLoading: isWaitingForApproval, isSuccess: isApprovalSuccessful } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  // Update approval status in database
  const updateApprovalMutation = useMutation({
    mutationFn: async (approvalData: {
      contractAddress: string;
      spenderAddress: string;
      tokenAddress?: string;
      amount?: string;
      approvalHash: string;
    }) => {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch approval status
      queryClient.invalidateQueries({ queryKey: ['approval-status', walletAddress] });
    },
  });

  // Check if approval is needed
  const needsApproval = (amount: string) => {
    if (!currentAllowance || !amount) return false;
    
    try {
      const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals
      return currentAllowance < amountInWei;
    } catch {
      return false;
    }
  };

  // Check market-specific approval status (synchronous - only checks cache)
  const checkMarketApproval = (marketAddress: string) => {
    if (!walletAddress) {
      return false;
    }

    // Check market-specific cache - if we have a cached approval for this market, return it immediately
    const cachedApproval = isMarketApprovedInCache(marketAddress, walletAddress);
    if (cachedApproval) {
      console.log(`[ApprovalCache] Using cached approval for market ${marketAddress}`);
      return true;
    }

    // If we don't have a cached approval for this market, user needs to approve
    console.log(`[ApprovalCache] No cached approval found for market ${marketAddress} - user needs to approve`);
    return false;
  };

  // Debounced approval request to prevent multiple simultaneous requests
  const requestApproval = useCallback(async (marketAddress: string) => {
    if (typeof window === 'undefined') {
      return { success: false, error: 'No window' };
    }

    if (!walletAddress) {
      return { success: false, error: 'No wallet address' };
    }

    console.log('🚀 requestApproval called', { marketAddress, walletAddress, timestamp: new Date().toISOString() });

    // Check if we already have a pending request for this market
    if (pendingApprovals.current.has(marketAddress)) {
      console.log(`[ApprovalCache] Request already pending for market ${marketAddress}, skipping`);
      return { success: false, error: 'Request already pending' };
    }

    // Check if we're already requesting any approval
    if (isRequestingApproval) {
      console.log(`[ApprovalCache] Another approval request in progress, skipping`);
      return { success: false, error: 'Another request in progress' };
    }

    // Check market-specific cache first - if already approved for this market, skip
    const cachedApproval = isMarketApprovedInCache(marketAddress, walletAddress);
    if (cachedApproval) {
      console.log(`[ApprovalCache] Already approved for market ${marketAddress}, skipping request`);
      return { success: true, alreadyApproved: true };
    }

    // Mark this market as having a pending request
    pendingApprovals.current.add(marketAddress);
    setIsRequestingApproval(true);

    try {
      console.log(`[ApprovalCache] Requesting approval for market ${marketAddress}`);
      // Set approval requested before making the API call to prevent duplicate requests
      cacheMarketApproval(marketAddress, walletAddress, true);

      console.log('is approved?', isMarketApprovedInCache(marketAddress, walletAddress));

      const response = await fetch(`/api/bets/approve/${marketAddress}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      // If approval was successful, cache it for this market
      if (result.success && result.txHash) {
        cacheMarketApproval(marketAddress, walletAddress, true, result.txHash);
        console.log(`[ApprovalCache] Successfully approved and cached for market ${marketAddress}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error requesting approval:', error);
      throw error;
    } finally {
      // Always clean up the pending request
      pendingApprovals.current.delete(marketAddress);
      setIsRequestingApproval(false);
    }
  }, [walletAddress, isRequestingApproval]);

  // Update approval status when transaction is successful
  const updateApprovalStatus = async () => {
    if (isApprovalSuccessful && approvalHash) {
      try {
        await updateApprovalMutation.mutateAsync({
          contractAddress: SIMPLE_ROUTER_ADDRESS,
          spenderAddress: walletAddress!,
          tokenAddress: ARBITRUM_USDC_CONTRACT_ADDRESS,
          amount: '0', // Unlimited approval
          approvalHash,
        });
      } catch (error) {
        console.error('Error updating approval status:', error);
      }
    }
  };

  // Auto-update approval status when transaction succeeds
  if (isApprovalSuccessful && approvalHash) {
    updateApprovalStatus();
  }

  return {
    // Status
    hasApproval: approvalStatus?.hasApproval || false,
    currentAllowance,
    needsApproval,
    
    // Loading states
    isCheckingApproval,
    isCheckingAllowance,
    isApproving,
    isWaitingForApproval,
    isRequestingApproval,
    
    // Actions
    requestApproval,
    checkMarketApproval,
    
    // Transaction data
    approvalHash,
    isApprovalSuccessful,
  };
} 
