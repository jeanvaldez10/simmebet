export const getConnectorIcon = (id: string) => {
  switch (id) {
    case "injected":
      return "/images/simul.png";
    case "metaMaskSDK":
      return "/images/metamask.png";
    case "coinbaseWalletSDK":
      return "/images/coinbase.png";
    case "walletConnect":
      return "/images/torus.png";
    default:
      return "/images/simul.png";
  }
};

export const getConnectorIconByName = (name: string) => {
  switch (name) {
    case "Bluff Wallet":
      return "/images/simul.png";
    case "MetaMask":
      return "/images/metamask.png";
    case "Coinbase Wallet":
      return "/images/coinbase.png";
    case "WalletConnect":
      return "/images/torus.png";
    default:
      return "/images/simul.png";
  }
};

export const getConnectorName = (id: string) => {
  switch (id) {
    case "injected":
      return "Bluff Wallet";
    case "metaMaskSDK":
      return "Metamask";
    case "coinbaseWalletSDK":
      return "Coinbase Wallet";
    case "walletConnect":
      return "WalletConnect";
    default:
      return "Browser Wallet";
  }
};

export const getOdds = (price: number): { yes: number; no: number } => {
  const yes = price; // Convert price to implied probability
  const no = 1 - price; // Calculate no probability directly from price

  return {
    yes: +(yes * 100).toFixed(2),
    no: +(no * 100).toFixed(2),
  };
};

export const getPriceFromSqrtPriceX96 = (sqrtPriceX96: bigint): number => {
  const Q96 = BigInt(2) ** BigInt(96);
  const ratio = Number(sqrtPriceX96) / Number(Q96);
  return ratio * ratio;
};

export const calculateTokenEV = (tokenAmount: number, probability: number): number => {
  return tokenAmount * probability * 2;
};

export const calculateMarketPositionEV = (
  yesTokens: number, 
  noTokens: number, 
  yesPrice: number,
  noPrice?: number
): { totalEV: number; yesEV: number; noEV: number; dominantSide: string; dominantEV: number } => {
  // If noPrice is provided, use current market prices for accurate valuation
  if (noPrice !== undefined) {
    // Simple calculation: current market value = tokens × current market price
    const yesEV = yesTokens * yesPrice;
    const noEV = noTokens * noPrice;
    const totalValue = yesEV + noEV;

    // Calculate net position value (positive if YES-heavy, negative if NO-heavy)
    const netEV = yesEV - noEV;
    
    const dominantSide = netEV >= 0 ? "Yes" : "No";
    const dominantEV = Math.abs(netEV);
    
    return { totalEV: totalValue, yesEV, noEV, dominantSide, dominantEV };
  }
  
  // Fallback to probability-based calculation for backward compatibility
  const { yes: yesProbability, no: noProbability } = getOdds(yesPrice);
  
  const yesProb = yesProbability / 100;
  const noProb = noProbability / 100;
  
  const netEV = (yesTokens - noTokens) * (yesProb - noProb);
  
  const yesEV = calculateTokenEV(yesTokens, yesProb);
  const noEV = calculateTokenEV(noTokens, noProb);
  const totalEV = Math.abs(netEV); // Use absolute value for display

  const dominantSide = netEV >= 0 ? "Yes" : "No";
  const dominantEV = Math.abs(netEV);
  
  return { totalEV, yesEV, noEV, dominantSide, dominantEV };
};

export const getCurrentMarketOdds = (
  marketId: string, 
  swaps: Array<{ marketId: string; price: number }> = []
): { yes: number; no: number; price: number } => {
  const latestSwap = swaps.find(swap => swap.marketId === marketId);
  const currentPrice = latestSwap?.price || 0.5;
  
  return { ...getOdds(currentPrice), price: currentPrice };
};

// Re-export validation utilities
export { validateUsername, validateUsernameOrThrow, isValidUsernameCharacters } from "./validation";
export type { UsernameValidationResult } from "./validation";
