/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Implement balance service methods and remove eslint-disable
export interface BalanceUpdateResult {
  success: boolean;
  newBalance: string;
  error?: string;
}

export interface UserBalance {
  balanceUsdc: string;
  balanceUsdcFloat: number;
  balanceEth: number;
  balanceWei: string;
}

export class BalanceService {
  // TODO: Implement balance checking logic
  async hasSufficientBalance(
    _userId: string,
    _amount: string
  ): Promise<boolean> {
    return true;
  }

  // TODO: Implement balance update after game round
  async updateBalanceAfterRound(
    _userId: string,
    _gameOutcome: string,
    _winnings: string,
    _totalWagered: string
  ): Promise<BalanceUpdateResult> {
    return { success: true, newBalance: "0" };
  }

  // TODO: Implement balance change effect handling
  async handleBalanceChangeEffect(
    _userId: string,
    _effect: {
      amount: number;
      operation: "INCREASE" | "DECREASE";
      reason: string;
    }
  ): Promise<BalanceUpdateResult> {
    return { success: true, newBalance: "0" };
  }

  // TODO: Implement get user balance from database
  async getUserBalance(_userId: string): Promise<number> {
    return 100.0;
  }

  //   /**
  //    * Decreases a user's USDC balance by the specified amount
  //    * @param userId - The user's ID
  //    * @param amount - Amount to decrease (in USDC, as string to maintain precision)
  //    * @returns Promise<BalanceUpdateResult>
  //    */
  //   async decreaseUserBalance(userId: string, amount: string): Promise<BalanceUpdateResult> {
  //     try {
  //       const amountFloat = parseFloat(amount)
  //       if (isNaN(amountFloat) || amountFloat <= 0) {
  //         return {
  //           success: false,
  //           newBalance: '0',
  //           error: 'Invalid amount provided'
  //         }
  //       }

  //       // // Use a transaction to ensure atomicity
  //       // const result = await prisma.$transaction(async (tx) => {
  //       //   // Get current balance

  //       //   const user = await prisma.user.findUnique({
  //       //     where: { id: userId },
  //       //     select: { walletAddress: true }
  //       //   })

  //       //   const currentBalance = parseFloat(user?.walletAddress || '0')
  //       //   const newBalance = currentBalance - amountFloat

  //       //   if (newBalance < 0) {
  //       //     throw new Error('Insufficient balance')
  //       //   }

  //       //   // // Update balance
  //       //   // const updatedWallet = await tx.wallet.update({
  //       //   //   where: { userId },
  //       //   //   data: {
  //       //   //     balanceUsdc: newBalance.toString(),
  //       //   //     balanceUsdcFloat: newBalance
  //       //   //   }
  //       //   // })

  //       //   // // Log the transaction
  //       //   // await tx.transaction.create({
  //       //   //   data: {
  //       //   //     userId,
  //       //   //     type: 'BALANCE_DECREASE',
  //       //   //     amountWei: '0',
  //       //   //     amountEth: 0,
  //       //   //     amountUsdc: amount,
  //       //   //     amountUsdcFloat: amountFloat,
  //       //   //     status: 'CONFIRMED'
  //       //   //   }
  //       //   // })

  //       //   // Log balance update event
  //       //   console.log('💰 BALANCE UPDATE EVENT:', {
  //       //     userId,
  //       //     operation: 'DECREASE',
  //       //     amount: amountFloat,
  //       //     previousBalance: currentBalance,
  //       //     newBalance: newBalance,
  //       //     transactionType: 'BALANCE_DECREASE',
  //       //     timestamp: new Date().toISOString()
  //       //   });

  //       //   // return updatedWallet
  //       // })

  //       return {
  //         success: true,
  //         newBalance: "0.00"
  //       }
  //     } catch (error) {
  //       return {
  //         success: false,
  //         newBalance: '0',
  //         error: error instanceof Error ? error.message : 'Unknown error occurred'
  //       }
  //     }
  //   }

  //   /**
  //    * Increases a user's USDC balance by the specified amount
  //    * @param userId - The user's ID
  //    * @param amount - Amount to increase (in USDC, as string to maintain precision)
  //    * @returns Promise<BalanceUpdateResult>
  //    */
  //   async increaseUserBalance(userId: string, amount: string): Promise<BalanceUpdateResult> {
  //     try {
  //       const amountFloat = parseFloat(amount)
  //       if (isNaN(amountFloat) || amountFloat <= 0) {
  //         return {
  //           success: false,
  //           newBalance: '0',
  //           error: 'Invalid amount provided'
  //         }
  //       }

  //       // Use a transaction to ensure atomicity
  //       // const result = await prisma.$transaction(async (tx) => {
  //         // // Get current balance
  //         // const wallet = await tx.wallet.findUnique({
  //         //   where: { userId },
  //         //   select: { balanceUsdc: true, balanceUsdcFloat: true }
  //         // })

  //       //   if (!wallet) {
  //       //     throw new Error('User wallet not found')
  //       //   }

  //       //   const currentBalance = parseFloat(wallet.balanceUsdc)
  //       //   const newBalance = currentBalance + amountFloat

  //       //   // Update balance
  //       //   const updatedWallet = await tx.wallet.update({
  //       //     where: { userId },
  //       //     data: {
  //       //       balanceUsdc: newBalance.toString(),
  //       //       balanceUsdcFloat: newBalance
  //       //     }
  //       //   })

  //       //   // Log the transaction
  //       //   await tx.transaction.create({
  //       //     data: {
  //       //       userId,
  //       //       type: 'BALANCE_INCREASE',
  //       //       amountWei: '0',
  //       //       amountEth: 0,
  //       //       amountUsdc: amount,
  //       //       amountUsdcFloat: amountFloat,
  //       //       status: 'CONFIRMED'
  //       //     }
  //       //   })

  //       //   // Log balance update event
  //       //   console.log('💰 BALANCE UPDATE EVENT:', {
  //       //     userId,
  //       //     operation: 'INCREASE',
  //       //     amount: amountFloat,
  //       //     previousBalance: currentBalance,
  //       //     newBalance: newBalance,
  //       //     transactionType: 'BALANCE_INCREASE',
  //       //     timestamp: new Date().toISOString()
  //       //   });

  //       //   return updatedWallet
  //       // })

  //       return {
  //         success: true,
  //         newBalance: "0.00"
  //       }
  //     } catch (error) {
  //       return {
  //         success: false,
  //         newBalance: '0',
  //         error: error instanceof Error ? error.message : 'Unknown error occurred'
  //       }
  //     }
  //   }

  //   /**
  //    * Gets a user's current balance
  //    * @param userId - The user's ID
  //    * @returns Promise<UserBalance | null>
  //    */
  //   async getUserBalance(userId: string): Promise<UserBalance | null> {
  //     try {
  //       // const wallet = await prisma.wallet.findUnique({
  //       //   where: { userId },
  //       //   select: {
  //       //     balanceUsdc: true,
  //       //     balanceUsdcFloat: true,
  //       //     balanceEth: true,
  //       //     balanceWei: true
  //       //   }
  //       // })

  //       // if (!wallet) {
  //       //   return null
  //       // }

  //       return {
  //         balanceUsdc: "0.00",
  //         balanceUsdcFloat: 0,
  //         balanceEth: 0,
  //         balanceWei: "0"
  //       }
  //     } catch (error) {
  //       console.error('Error getting user balance:', error)
  //       return null
  //     }
  //   }

  //   /**
  //    * Safely updates a user's balance based on game action
  //    * This method handles specific game actions that require balance updates
  //    * @param userId - The user's ID
  //    * @param gameAction - The type of game action being performed (must be one of: START_ROUND, DOUBLE, SPLIT, SURRENDER, START_NEW_GAME)
  //    * @param amount - Amount involved in the action (in USDC)
  //    * @param currentBet - Current bet amount for validation
  //    * @returns Promise<BalanceUpdateResult>
  //    */
  //   async safeUpdateBalance(
  //     userId: string,
  //     gameAction: string,
  //     amount: string,
  //     currentBet: string
  //   ): Promise<BalanceUpdateResult> {
  //     try {
  //       const amountFloat = parseFloat(amount)
  //       const currentBetFloat = parseFloat(currentBet)

  //       if (isNaN(amountFloat) || amountFloat < 0) {
  //         return {
  //           success: false,
  //           newBalance: '0',
  //           error: 'Invalid amount provided'
  //         }
  //       }

  //       // Only allow specific game actions that require balance updates
  //       const allowedActions = ['START_ROUND', 'DOUBLE', 'SPLIT', 'SURRENDER', 'START_NEW_GAME']
  //       if (!allowedActions.includes(gameAction)) {
  //         return {
  //           success: false,
  //           newBalance: '0',
  //           error: `Game action '${gameAction}' does not require balance update. Allowed actions: ${allowedActions.join(', ')}`
  //         }
  //       }

  //       // Use a transaction to ensure atomicity
  //       const result = await prisma.$transaction(async (tx) => {
  //         // Get current balance and game state
  //         // const wallet = await tx.wallet.findUnique({
  //         //   where: { userId },
  //         //   select: { balanceUsdc: true, balanceUsdcFloat: true }
  //         // })

  //         // if (!wallet) {
  //         //   throw new Error('User wallet not found')
  //         // }

  //         // const currentBalance = parseFloat(wallet.balanceUsdc)
  //         // let newBalance = currentBalance
  //         let transactionType = ''

  //         // Handle different game actions
  //         switch (gameAction) {
  //           case 'START_ROUND':
  //             // Place initial bet - validate that user has enough balance for the bet
  //             if (amountFloat > currentBalance) {
  //               throw new Error('Insufficient balance for bet')
  //             }
  //             newBalance = currentBalance - amountFloat
  //             transactionType = 'BET_PLACED'
  //             break

  //           case 'DOUBLE':
  //             // Double down - validate user has enough balance for the additional bet
  //             if (amountFloat > currentBalance) {
  //               throw new Error('Insufficient balance to double down')
  //             }
  //             newBalance = currentBalance - amountFloat
  //             transactionType = 'DOUBLE_DOWN'
  //             break

  //           case 'SPLIT':
  //             // Split hand - place additional bet equal to original bet
  //             if (amountFloat > currentBalance) {
  //               throw new Error('Insufficient balance to split')
  //             }
  //             newBalance = currentBalance - amountFloat
  //             transactionType = 'SPLIT_HAND'
  //             break

  //           case 'SURRENDER':
  //             // Surrender - return half the bet (amount should be half the original bet)
  //             newBalance = currentBalance + amountFloat
  //             transactionType = 'SURRENDER'
  //             break

  //           case 'START_NEW_GAME':
  //             // Start new game - no balance change, just reset game state
  //             newBalance = currentBalance
  //             transactionType = 'NEW_GAME_STARTED'
  //             break

  //           default:
  //             throw new Error(`Unexpected game action: ${gameAction}`)
  //         }

  //         // Update balance
  //         const updatedWallet = await tx.wallet.update({
  //           where: { userId },
  //           data: {
  //             balanceUsdc: newBalance.toString(),
  //             balanceUsdcFloat: newBalance
  //           }
  //         })

  //         // Log the transaction
  //         await tx.transaction.create({
  //           data: {
  //             userId,
  //             type: transactionType,
  //             amountWei: '0',
  //             amountEth: 0,
  //             amountUsdc: amount,
  //             amountUsdcFloat: amountFloat,
  //             status: 'CONFIRMED'
  //           }
  //         })

  //         // Log balance update event
  //         console.log('💰 BALANCE UPDATE EVENT:', {
  //           userId,
  //           gameAction,
  //           operation: gameAction === 'SURRENDER' ? 'INCREASE' : 'DECREASE',
  //           amount: amountFloat,
  //           previousBalance: currentBalance,
  //           newBalance: newBalance,
  //           transactionType,
  //           timestamp: new Date().toISOString()
  //         });

  //         return updatedWallet
  //       })

  //       return {
  //         success: true,
  //         newBalance: result.balanceUsdc
  //       }
  //     } catch (error) {
  //       return {
  //         success: false,
  //         newBalance: '0',
  //         error: error instanceof Error ? error.message : 'Unknown error occurred'
  //       }
  //     }
  //   }

  //   /**
  //    * Updates user balance at the end of a game round
  //    * This method handles the final balance update based on game outcome
  //    * @param userId - The user's ID
  //    * @param gameOutcome - The outcome of the game ('WIN', 'LOSE', 'PUSH', 'BLACKJACK')
  //    * @param winnings - Amount won (0 if lost, positive if won)
  //    * @param totalWagered - Total amount wagered in the game
  //    * @returns Promise<BalanceUpdateResult>
  //    */
  //   async updateBalanceAfterRound(
  //     userId: string,
  //     gameOutcome: string,
  //     winnings: string,
  //     totalWagered: string
  //   ): Promise<BalanceUpdateResult> {
  //     try {
  //       const winningsFloat = parseFloat(winnings)
  //       const totalWageredFloat = parseFloat(totalWagered)

  //       if (isNaN(winningsFloat) || winningsFloat < 0) {
  //         return {
  //           success: false,
  //           newBalance: '0',
  //           error: 'Invalid winnings amount provided'
  //         }
  //       }

  //       if (isNaN(totalWageredFloat) || totalWageredFloat < 0) {
  //         return {
  //           success: false,
  //           newBalance: '0',
  //           error: 'Invalid total wagered amount provided'
  //         }
  //       }

  //       // Use a transaction to ensure atomicity
  //       const result = await prisma.$transaction(async (tx) => {
  //         // Get current balance
  //         const wallet = await tx.wallet.findUnique({
  //           where: { userId },
  //           select: { balanceUsdc: true, balanceUsdcFloat: true }
  //         })

  //         if (!wallet) {
  //           throw new Error('User wallet not found')
  //         }

  //         const currentBalance = parseFloat(wallet.balanceUsdc)
  //         let newBalance = currentBalance
  //         let transactionType = ''

  //         // Handle different game outcomes
  //         switch (gameOutcome) {
  //           case 'WIN':
  //             // Player won - add winnings to balance
  //             newBalance = currentBalance + winningsFloat
  //             transactionType = 'GAME_WIN'
  //             break

  //           case 'LOSE':
  //             // Player lost - no change to balance (bet was already deducted during betting phase)
  //             newBalance = currentBalance
  //             transactionType = 'GAME_LOSS'
  //             break

  //           case 'PUSH':
  //             // Push - return the total wagered amount
  //             newBalance = currentBalance + totalWageredFloat
  //             transactionType = 'GAME_PUSH'
  //             break

  //           case 'BLACKJACK':
  //             // Blackjack win - add winnings to balance
  //             newBalance = currentBalance + winningsFloat
  //             transactionType = 'BLACKJACK_WIN'
  //             break

  //           default:
  //             throw new Error(`Unknown game outcome: ${gameOutcome}`)
  //         }

  //         // Update balance
  //         const updatedWallet = await tx.wallet.update({
  //           where: { userId },
  //           data: {
  //             balanceUsdc: newBalance.toString(),
  //             balanceUsdcFloat: newBalance
  //           }
  //         })

  //         // Log the transaction
  //         await tx.transaction.create({
  //           data: {
  //             userId,
  //             type: transactionType,
  //             amountWei: '0',
  //             amountEth: 0,
  //             amountUsdc: winnings,
  //             amountUsdcFloat: winningsFloat,
  //             status: 'CONFIRMED'
  //           }
  //         })

  //         // Log balance update event
  //         console.log('💰 BALANCE UPDATE EVENT:', {
  //           userId,
  //           gameOutcome,
  //           operation: gameOutcome === 'LOSE' ? 'NO_CHANGE' : 'INCREASE',
  //           winnings: winningsFloat,
  //           totalWagered: totalWageredFloat,
  //           previousBalance: currentBalance,
  //           newBalance: newBalance,
  //           transactionType,
  //           timestamp: new Date().toISOString()
  //         });

  //         return updatedWallet
  //       })

  //       return {
  //         success: true,
  //         newBalance: result.balanceUsdc
  //       }
  //     } catch (error) {
  //       return {
  //         success: false,
  //         newBalance: '0',
  //         error: error instanceof Error ? error.message : 'Unknown error occurred'
  //       }
  //     }
  //   }

  //   /**
  //    * Creates a wallet for a user if it doesn't exist
  //    * @param userId - The user's ID
  //    * @param walletAddress - The wallet address
  //    * @returns Promise<boolean>
  //    */
  //   async createWalletIfNotExists(userId: string, walletAddress: string): Promise<boolean> {
  //     try {
  //       const existingWallet = await prisma.wallet.findUnique({
  //         where: { userId }
  //       })

  //       if (existingWallet) {
  //         return true
  //       }

  //       await prisma.wallet.create({
  //         data: {
  //           userId,
  //           address: walletAddress,
  //           balanceUsdc: '0',
  //           balanceUsdcFloat: 0,
  //           balanceEth: 0,
  //           balanceWei: '0'
  //         }
  //       })

  //       return true
  //     } catch (error) {
  //       console.error('Error creating wallet:', error)
  //       return false
  //     }
  //   }

  //   /**
  //    * Validates that a user has sufficient balance for an operation
  //    * @param userId - The user's ID
  //    * @param requiredAmount - Amount required (in USDC)
  //    * @returns Promise<boolean>
  //    */
  //   async hasSufficientBalance(userId: string, requiredAmount: string): Promise<boolean> {
  //     try {
  //       const balance = await this.getUserBalance(userId)
  //       if (!balance) {
  //         return false
  //       }

  //       const currentBalance = parseFloat(balance.balanceUsdc)
  //       const required = parseFloat(requiredAmount)

  //       return currentBalance >= required
  //     } catch (error) {
  //       console.error('Error checking balance:', error)
  //       return false
  //     }
  //   }

  //   /**
  //    * Handles balance change effects from the state machine
  //    * @param userId - The user's ID
  //    * @param effect - The balance change effect
  //    * @returns Promise<BalanceUpdateResult>
  //    */
  //   async handleBalanceChangeEffect(
  //     userId: string,
  //     effect: { amount: number; operation: 'INCREASE' | 'DECREASE'; reason: string }
  //   ): Promise<BalanceUpdateResult> {
  //     const amount = effect.amount.toString();

  //     if (effect.operation === 'INCREASE') {
  //       return this.increaseUserBalance(userId, amount);
  //     } else if (effect.operation === 'DECREASE') {
  //       return this.decreaseUserBalance(userId, amount);
  //     }

  //     return {
  //       success: false,
  //       newBalance: '0',
  //       error: 'Invalid operation type'
  //     };
  //   }
}

// Export a singleton instance
export const balanceService = new BalanceService();
