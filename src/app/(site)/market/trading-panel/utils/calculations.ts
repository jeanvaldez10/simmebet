export const calculateEstimatedWinnings = (
  amount: string,
  belief: number,
  marketProbability?: { yes: number; no: number } | null
): number => {
  const betAmount = parseFloat(amount) || 0;
  
  if (!marketProbability || belief === 0) {
    return betAmount * 100;
  }
  
  if (belief === 100) {
    return betAmount;
  }
  
  const decimalOdds = belief > 0 ? 1 / (belief / 100) : 0;
  return betAmount * decimalOdds;
};

export const calculateRecommendedMaxBet = (
  selectedOption: string,
  marketProbability?: { yes: number; no: number } | null,
  formattedTokenABalance?: string,
  formattedTokenBBalance?: string
): string => {
  if (!marketProbability || !formattedTokenABalance || !formattedTokenBBalance) {
    return "0.00";
  }

  const relevantBalance =
    selectedOption === "yes"
      ? parseFloat(formattedTokenABalance)
      : parseFloat(formattedTokenBBalance);

  const probability =
    selectedOption === "yes" ? marketProbability.yes : marketProbability.no;

  const odds = 1 / probability;
  const kellyFraction = (probability * odds - 1) / (odds - 1);
  const conservativeMultiplier = 0.25;
  const maxBet = relevantBalance * kellyFraction * conservativeMultiplier;
  const maxAllowedBet = Math.min(maxBet, relevantBalance * 0.1);

  return maxAllowedBet.toFixed(2);
};
