/**
 * Utility functions for odds calculations and conversions
 * Based on Uniswap pool price ratios and standard betting formats
 */

/**
 * Convert Uniswap v2 pool reserves to price ratio R (price of YES in units of NO)
 * @param yesReserves - YES token reserves
 * @param noReserves - NO token reserves
 * @returns Price ratio R = noReserves / yesReserves
 */
export const getV2PriceRatio = (yesReserves: number, noReserves: number): number => {
  if (yesReserves === 0) return 0;
  return noReserves / yesReserves;
};

/**
 * Convert Uniswap v3 sqrtPriceX96 to price ratio R
 * @param sqrtPriceX96 - Current sqrt price in X96 format
 * @param token0IsYes - Whether token0 is YES (true) or NO (false)
 * @returns Price ratio R = price(YES in NO)
 */
export const getV3PriceRatio = (sqrtPriceX96: bigint, token0IsYes: boolean = true): number => {
  const sqrt = Number(sqrtPriceX96) / 2 ** 96;
  const price = sqrt * sqrt;
  
  if (token0IsYes) {
    // token0 = YES, token1 = NO, so price is YES in NO units
    return price;
  } else {
    // token0 = NO, token1 = YES, so price is NO in YES units, invert for YES in NO
    return 1 / price;
  }
};

/**
 * Convert price ratio R to probabilities using the standard mapping
 * @param priceRatio - Price ratio R = price(YES in NO)
 * @returns Object with YES and NO probabilities (0-1)
 */
export const priceRatioToProbabilities = (priceRatio: number): { yes: number; no: number } => {
  if (priceRatio <= 0) {
    return { yes: 0, no: 1 };
  }
  
  const yesProb = priceRatio / (1 + priceRatio);
  const noProb = 1 / (1 + priceRatio);
  
  return { yes: yesProb, no: noProb };
};

/**
 * Convert probability (0-1) to American odds
 * @param probability - Probability as decimal (0-1)
 * @returns American odds as string (e.g., "+150", "-200")
 */
export const probabilityToAmericanOdds = (probability: number): string => {
  if (probability <= 0 || probability >= 1) {
    return "N/A";
  }

  if (probability === 0.5) {
    return "+100";
  }

  if (probability > 0.5) {
    // Favorite (negative odds)
    const odds = Math.round((probability / (1 - probability)) * -100);
    return odds.toString();
  } else {
    // Underdog (positive odds)
    const odds = Math.round(((1 - probability) / probability) * 100);
    return `+${odds}`;
  }
};

/**
 * Convert probability (0-1) to decimal odds
 * @param probability - Probability as decimal (0-1)
 * @returns Decimal odds (e.g., 2.5)
 */
export const probabilityToDecimalOdds = (probability: number): number => {
  if (probability <= 0 || probability >= 1) {
    return 0;
  }
  return 1 / probability;
};

/**
 * Convert probability (0-1) to fractional odds
 * @param probability - Probability as decimal (0-1)
 * @returns Fractional odds as string (e.g., "2/3", "3/2")
 */
export const probabilityToFractionalOdds = (probability: number): string => {
  if (probability <= 0 || probability >= 1) {
    return "N/A";
  }
  
  const numerator = 1 - probability;
  const denominator = probability;
  
  // Simplify the fraction
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  
  const simplifiedNum = numerator / divisor;
  const simplifiedDen = denominator / divisor;
  
  return `${simplifiedNum}/${simplifiedDen}`;
};

/**
 * Convert probability (0-1) to log-odds (logit)
 * @param probability - Probability as decimal (0-1)
 * @returns Log-odds value
 */
export const probabilityToLogOdds = (probability: number): number => {
  if (probability <= 0 || probability >= 1) {
    return 0;
  }
  return Math.log(probability / (1 - probability));
};

/**
 * Comprehensive odds calculation from price ratio
 * @param priceRatio - Price ratio R = price(YES in NO)
 * @returns Complete odds information for both YES and NO sides
 */
export const calculateComprehensiveOdds = (priceRatio: number) => {
  const { yes: yesProb, no: noProb } = priceRatioToProbabilities(priceRatio);
  
  return {
    probabilities: {
      yes: yesProb,
      no: noProb,
      yesPercentage: Math.round(yesProb * 100),
      noPercentage: Math.round(noProb * 100),
    },
    decimalOdds: {
      yes: probabilityToDecimalOdds(yesProb),
      no: probabilityToDecimalOdds(noProb),
    },
    fractionalOdds: {
      yes: probabilityToFractionalOdds(yesProb),
      no: probabilityToFractionalOdds(noProb),
    },
    americanOdds: {
      yes: probabilityToAmericanOdds(yesProb),
      no: probabilityToAmericanOdds(noProb),
    },
    logOdds: {
      yes: probabilityToLogOdds(yesProb),
      no: probabilityToLogOdds(noProb),
    },
    priceRatio,
  };
};

/**
 * Calculate payout for a $100 bet given American odds
 * @param americanOdds - American odds as string (e.g., "+150", "-200")
 * @returns Payout amount for $100 bet
 */
export const calculatePayoutFor100 = (americanOdds: string): number => {
  if (americanOdds === "N/A") return 0;
  
  const odds = parseInt(americanOdds);
  
  if (odds > 0) {
    // Positive odds: +150 means $100 bet wins $150
    return odds;
  } else {
    // Negative odds: -200 means $200 bet wins $100
    return (100 / Math.abs(odds)) * 100;
  }
};

/**
 * Calculate potential payout for any bet amount
 * @param betAmount - Amount bet in USD
 * @param americanOdds - American odds as string
 * @returns Total payout (bet amount + winnings)
 */
export const calculateTotalPayout = (betAmount: number, americanOdds: string): number => {
  if (americanOdds === "N/A") return betAmount;
  
  const payoutFor100 = calculatePayoutFor100(americanOdds);
  return betAmount + (payoutFor100 / 100) * betAmount;
};

/**
 * Convert market prices to American odds
 * @param yesPrice - YES token price (0-100)
 * @param noPrice - NO token price (0-100)
 * @returns Object with American odds for both sides
 */
export const marketPricesToAmericanOdds = (yesPrice: number, noPrice: number) => {
  const yesProbability = yesPrice / 100;
  const noProbability = noPrice / 100;
  
  return {
    yes: probabilityToAmericanOdds(yesProbability),
    no: probabilityToAmericanOdds(noProbability),
    yesDecimal: probabilityToDecimalOdds(yesProbability),
    noDecimal: probabilityToDecimalOdds(noProbability),
  };
}; 
