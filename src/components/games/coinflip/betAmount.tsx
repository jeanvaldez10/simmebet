import { PixiDrawContainer } from "../blackjack/containers";
import { UI_STYLES } from "../blackjack/styles";
import { useCoinflipGame } from "@/contexts/CoinflipGameContext";
import { useMemo } from "react";
import { CoinSide } from "@/types/games/coinflip/game";
import { getCoinflipGameConstants } from "@/utils/games/coinflip/client/uiConfig";

interface BetAmountType {
  xPosition: number;
  yPosition: number;
  isMobile?: boolean;
}

export function BetAmount({ xPosition, yPosition, isMobile = false }: BetAmountType) {
  const { gameState } = useCoinflipGame();
  const constants = getCoinflipGameConstants(isMobile);

  const displayText = useMemo(() => {
    // Get amount
    let amount = "$0.00";
    if (gameState.amount) {
      amount = `$${gameState.amount.toFixed(2)}`;
    }

    // Get selected side
    const selectedSide =
      gameState.side || gameState.winningSide;
    if (selectedSide) {
      const sideText = selectedSide === CoinSide.HEADS ? "HEADS" : "TAILS";
      return `${amount} - ${sideText}`;
    }

    return amount;
  }, [
    gameState.amount,
    gameState.side,
    gameState.winningSide,
  ]);

  return (
    <>
      <pixiText
        text={"BET AMOUNT"}
        anchor={0.5}
        x={xPosition}
        y={yPosition - 30}
        style={UI_STYLES.xsLabel}
      />
      <PixiDrawContainer
        width={isMobile ? constants.betAmountContainer.width.mobile : constants.betAmountContainer.width.desktop}
        height={constants.betAmountContainer.height}
        x={xPosition}
        y={yPosition - 5}
      >
        <pixiText
          text={displayText}
          anchor={0.5}
          x={0}
          y={0}
          style={UI_STYLES.baseLabel}
        />
      </PixiDrawContainer>
    </>
  );
}
