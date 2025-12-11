// import { TextStyle } from "pixi.js";
import { useState, useEffect, useRef, useCallback } from 'react';
import { ButtonSprite } from '../buttons/ButtonSprite';
import { Sidebet, SidebetType } from '@/types/games/blackjack/game';

interface SideBetNotificationProps {
  sidebetResults: Sidebet[];
  width: number; // canvas width
  isActionInProgress?: boolean;
}

export const SideBetNotification = ({
  sidebetResults,
  width,
  isActionInProgress = false,
}: SideBetNotificationProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const previousSidebetResultsRef = useRef<Sidebet[]>([]);

  // Filter only winning side bets
  const winningBets = sidebetResults.filter(
    (result) => result.profit && result.profit > 0
  );

  useEffect(() => {
    const hasNewResults =
      JSON.stringify(sidebetResults) !==
      JSON.stringify(previousSidebetResultsRef.current);

    if (hasNewResults && winningBets.length > 0) {
      // Add delay before showing notification to wait for card dealing animation
      const delay = 2000;
      const timer = setTimeout(() => {
        setIsDismissed(false);
        previousSidebetResultsRef.current = sidebetResults;
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [sidebetResults, winningBets.length]);

  const handleClick = useCallback(() => {
    setIsDismissed(true);
  }, []);

  if (winningBets.length === 0 || isDismissed || isActionInProgress) {
    return null;
  }

  const getSideBetName = (type: SidebetType): string => {
    switch (type) {
      case SidebetType.PAIR:
        return 'Perfect Pairs';
      case SidebetType.TWENTY_ONE_PLUS_THREE:
        return '21+3';
      default:
        return 'Side Bet';
    }
  };

  // Calculate NET profit/loss accounting for ALL side bets
  const netProfit = sidebetResults.reduce((sum, result) => {
    if (result.profit && result.profit > 0) {
      // Win: add profit
      return sum + result.profit;
    } else {
      // Loss: subtract the bet amount
      return sum - (result.amount || 0);
    }
  }, 0);

  // Create message
  const betNames = winningBets
    .map((bet) => getSideBetName(bet.type))
    .join(' & ');
  const message = `${betNames} WIN! +$${netProfit.toFixed(0)}`;

  const fontSize = 12;
  const padding = 16;
  const approxCharWidth = fontSize * 0.6;
  const minWidth = 200;
  const canvasMargin = 40;
  const maxAllowedWidth = Math.max(200, width - canvasMargin);
  const maxWidth = Math.min(maxAllowedWidth, 800);

  let desiredWidth = Math.ceil(message.length * approxCharWidth) + padding * 2;
  desiredWidth = Math.max(minWidth, Math.min(maxWidth, desiredWidth));

  return (
    <pixiContainer x={width / 2} y={30}>
      <ButtonSprite
        text={message}
        x={0}
        y={0}
        width={desiredWidth}
        height={34}
        color={'green'}
        fontSize={12}
        zIndex={1003}
        radius={12}
        onClick={handleClick}
      />
    </pixiContainer>
  );
};
