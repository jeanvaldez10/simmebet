export const validateBetAmount = (amount: string): string | null => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return "Please enter a valid number";
  }
  
  if (numAmount <= 0) {
    return "Amount must be greater than 0";
  }
  
  if (numAmount > 1000000) {
    return "Amount is too large";
  }
  
  return null;
};

export const validateBelief = (belief: number): string | null => {
  if (belief < 0 || belief > 100) {
    return "Belief must be between 0 and 100";
  }
  
  return null;
};

export const validateSlippage = (slippage: number): string | null => {
  if (slippage < 0 || slippage > 100) {
    return "Slippage must be between 0 and 100";
  }
  
  return null;
};
