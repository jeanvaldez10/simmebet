import { useAuth } from "./useAuth";
import {
  getPlatformFee,
  isBalanceSufficient,
  type PlatformFeeAction,
} from "@/constants/fees";

interface BalanceCheckResult {
  canProceed: boolean;
  balance: number;
  requiredFee: number;
  shortfall: number;
}

interface UseBalanceCheckReturn {
  hasMinimumBalance: (minRequired: number) => boolean;
  checkBalanceForAction: (
    actionType: PlatformFeeAction,
    additionalAmount?: number
  ) => BalanceCheckResult;
  userBalance: number;
  balanceNumber: number;
}

/**
 * Hook to check if user has sufficient balance for platform fees
 *
 * Platform fees are charged to the user's USDC wallet, NOT their positions.
 * A user may have a $10 position but $0 wallet balance and cannot transact.
 */
export const useBalanceCheck = (): UseBalanceCheckReturn => {
  const { userBalance } = useAuth();

  const balanceNumber = userBalance || 0;

  const hasMinimumBalance = (minRequired: number): boolean => {
    return balanceNumber >= minRequired;
  };

  const checkBalanceForAction = (
    actionType: PlatformFeeAction,
    additionalAmount: number = 0
  ): BalanceCheckResult => {
    const requiredFee = getPlatformFee(actionType);
    const totalRequired = requiredFee + additionalAmount;
    const canProceed = isBalanceSufficient(
      balanceNumber,
      actionType,
      additionalAmount
    );
    const shortfall = canProceed ? 0 : totalRequired - balanceNumber;

    return {
      canProceed,
      balance: balanceNumber,
      requiredFee,
      shortfall,
    };
  };

  return {
    hasMinimumBalance,
    checkBalanceForAction,
    userBalance: balanceNumber,
    balanceNumber,
  };
};
