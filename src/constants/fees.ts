/**
 * Platform Fee Constants
 *
 * NOTE: All fees are currently set to $0.02 as a placeholder.
 * These values should be updated based on actual gas costs and platform requirements.
 *
 * Search for "PLATFORM_FEE_TODO" to find all places where these fees are used.
 */

// PLATFORM_FEE_TODO: Update these values based on actual gas costs
export const PLATFORM_FEES = {
  PLACE_BET: 0.02, // $0.02 - Fee for placing a bet
  UPDATE_POSITION: 0.02, // $0.02 - Fee for updating a position
  CASHOUT: 0.02, // $0.02 - Fee for cashing out
  CLAIM_FEES: 0.02, // $0.02 - Fee for claiming liquidity fees
  REMOVE_LIQUIDITY: 0.02, // $0.02 - Fee for removing liquidity
  ADD_LIQUIDITY: 0.02, // $0.02 - Fee for adding liquidity
  CLAIM_WINNINGS: 0.02, // $0.02 - Fee for claiming winnings
} as const;

export const MIN_BALANCE_REQUIRED = 0.02; // Minimum balance to perform any action

export type PlatformFeeAction = keyof typeof PLATFORM_FEES;

/**
 * Get the platform fee for a specific action
 */
export const getPlatformFee = (action: PlatformFeeAction): number => {
  return PLATFORM_FEES[action];
};

/**
 * Check if a balance is sufficient for a given action
 */
export const isBalanceSufficient = (
  balance: number,
  action: PlatformFeeAction,
  additionalAmount: number = 0
): boolean => {
  const requiredFee = getPlatformFee(action);
  return balance >= requiredFee + additionalAmount;
};
