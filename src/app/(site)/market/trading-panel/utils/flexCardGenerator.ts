/**
 * Utility for generating flex cards from trading panel actions
 */

import { createFlexSnapshot, BetData } from "@/utils/flexSnapshot";
import { IMarketData } from "@/interfaces/market";

/**
 * Gets accurate position value from contract for ongoing positions
 * Uses the same calculation as Position Summary
 */
export async function getAccuratePositionValue(
  marketAddress: string,
  noTokenBalance: number,
  yesTokenBalance: number
): Promise<number> {
  try {
    const { readContract } = await import("viem/actions");
    const { createPublicClient, http, parseAbiItem } = await import("viem");
    const { arbitrum } = await import("viem/chains");

    const publicClient = createPublicClient({
      chain: arbitrum,
      transport: http(),
    });

    const CASHOUT_HELPER_ADDRESS =
      "0x69fb579f0eE8d3C88E7a8061cAe7fBc26ef6b955" as `0x${string}`;
    const result = await readContract(publicClient, {
      address: CASHOUT_HELPER_ADDRESS,
      abi: [
        parseAbiItem(
          "function estimateRedeemableAmount(address market, uint256 token0Amount, uint256 token1Amount) returns (uint256,uint256,uint256,uint256)"
        ),
      ],
      functionName: "estimateRedeemableAmount",
      args: [
        marketAddress as `0x${string}`,
        BigInt(noTokenBalance * 1e18),
        BigInt(yesTokenBalance * 1e18),
      ],
    });

    // Return the accurate estimated cashout value (same as Position Summary)
    return (result?.[0] ? Number(result[0]) / 1e18 : 0) * 2;
  } catch (error) {
    console.error(
      "Error getting accurate position value from contract:",
      error
    );
    // Fallback: use simple token balance calculation
    return Math.max(noTokenBalance, yesTokenBalance) * 2;
  }
}

interface FlexCardParams {
  type: "place_bet" | "update_bet" | "close_bet";
  state: {
    selectedOption: string;
    belief: number;
    amount: string;
  };
  market: IMarketData;
  dbUser: {
    id: string;
    username?: string | null;
  };
  // Amounts and balances
  totalUsdcInvestment: number;
  preCashoutBetAmount: number | null;
  cashoutAmount: number | null;
  burnAmount: number;
  // Token estimates
  requestResponse: { yes?: string; no?: string } | null;
  currency0Balance: string | number | undefined | null;
  currency1Balance: string | number | undefined | null;
}

export async function generateFlexCard(params: FlexCardParams): Promise<{
  snapshotId: string;
  shareUrl: string;
  imageUrl: string;
  flexType: "flex10" | "flex12" | "flex15";
}> {
  const {
    type,
    state,
    market,
    dbUser,
    totalUsdcInvestment,
    preCashoutBetAmount,
    cashoutAmount,
    burnAmount,
    requestResponse,
    currency0Balance,
    currency1Balance,
  } = params;

  // Initialize variables
  let betAmount = 0;
  let side = state.selectedOption || "YES";
  let belief: number | null = null;
  let amountWon = 0;
  let potentialWinAmount = 0;
  let potentialLossAmount = 0;

  // Calculate belief based on action type
  if (type === "place_bet") {
    belief = state.belief;
  } else if (type === "update_bet" || type === "close_bet") {
    belief = null; // Hide for updates and cashouts
  }

  // Calculate bet amount
  if (type === "place_bet") {
    betAmount = parseFloat(state.amount || "0");
  } else if (type === "update_bet") {
    // For update_bet, totalUsdcInvestment already includes the new amount after the update
    // Don't add state.amount again - that would be double counting
    betAmount = totalUsdcInvestment;
  } else if (type === "close_bet") {
    if (preCashoutBetAmount !== null && preCashoutBetAmount > 0) {
      betAmount = preCashoutBetAmount;
    } else if (totalUsdcInvestment > 0) {
      betAmount = totalUsdcInvestment;
    } else {
      betAmount = burnAmount * 2;
    }
  } else {
    betAmount = totalUsdcInvestment;
  }

  // Determine side from token response
  if (requestResponse) {
    const yesTokens = parseFloat(requestResponse.yes || "0");
    const noTokens = parseFloat(requestResponse.no || "0");
    if (yesTokens > 0 && noTokens === 0) {
      side = "YES";
    } else if (noTokens > 0 && yesTokens === 0) {
      side = "NO";
    }
  }

  // Calculate amount won
  if ((type === "close_bet" || type === "update_bet") && cashoutAmount) {
    // For cashouts (Flex 10) and updates (Flex 15), show total payout
    // This uses the accurate contract estimate, not just token balance * 2
    amountWon = cashoutAmount / 1e6; // Show total cashout amount
  } else {
    // For "What If" cards (Flex 12), show total payout (not net profit)
    const noValue = (Number(currency0Balance) || 0) * 2;
    const yesValue = (Number(currency1Balance) || 0) * 2;
    const totalPayout = side.toUpperCase() === "YES" ? yesValue : noValue;
    amountWon = totalPayout; // Show total payout, not profit
  }

  // Calculate potential amounts (for flex12)
  if (requestResponse && belief !== null) {
    const multiplier = 100 / belief;
    const potentialReturn = betAmount * multiplier;
    const potentialProfit = potentialReturn - betAmount;

    potentialWinAmount = potentialProfit;
    potentialLossAmount = -betAmount;
  } else {
    const initialValue = betAmount;
    const noValue = currency0Balance ? Number(currency0Balance) * 2 : 0;
    const yesValue = currency1Balance ? Number(currency1Balance) * 2 : 0;
    const noNetChange = noValue - initialValue;
    const yesNetChange = yesValue - initialValue;

    potentialWinAmount =
      side.toLowerCase() === "yes" ? yesNetChange : noNetChange;
    potentialLossAmount =
      side.toLowerCase() === "yes"
        ? -Math.abs(noNetChange)
        : -Math.abs(yesNetChange);
  }

  // Determine flex type
  let flexType: "flex10" | "flex12" | "flex15";
  if (type === "close_bet" && cashoutAmount !== null) {
    flexType = "flex10"; // Completed bet (cashout)
  } else if (type === "update_bet") {
    flexType = "flex15"; // Ongoing position update
  } else {
    flexType = "flex12"; // New bet "What If"
  }

  const isBetCompleted = flexType === "flex10";

  // Extract category name from market
  const categoryName =
    market.categories && market.categories.length > 0
      ? market.categories[0].name
      : "General";

  // Use square image first, fallback to regular image
  const marketImage = market.imageSquare || market.image || "";

  // Create bet data
  const betData: BetData = {
    question: String(market.question || ""),
    amountWon: `${amountWon >= 0 ? "+" : ""}$${amountWon.toFixed(2)}`,
    betAmount: `$${betAmount.toFixed(2)}`,
    side: String(side),
    ...(belief !== null &&
      !isNaN(belief) && { belief: `${Math.round(belief)}%` }),
    user: {
      name: String(dbUser.username || "Anonymous"),
      level: "88",
    },
    timestamp: "Bet Placed 11:22:00 UTC via @Simmi on X",
    marketId: String(market.id || ""),
    status: isBetCompleted ? "Closed" : "Ongoing",
    marketImage: String(marketImage),
    marketCategory: categoryName,
    ...(flexType === "flex12" && {
      potentialWinAmount: `${potentialWinAmount >= 0 ? "+" : ""}$${Math.abs(
        potentialWinAmount
      ).toFixed(2)}`,
      potentialLossAmount: `${potentialLossAmount >= 0 ? "+$" : "-$"}${Math.abs(
        potentialLossAmount
      ).toFixed(2)}`,
    }),
  };

  // Generate snapshot
  const result = await createFlexSnapshot(flexType, betData);

  return {
    ...result,
    imageUrl: `/api/og/flex?snapshotId=${result.snapshotId}`,
    flexType,
  };
}
