import { useMemo, useRef } from 'react';
import { Container } from 'pixi.js';
import { PixiSquareContainer } from '../../blackjack/containers/PixiSquareContainer';
import { UI_STYLES } from '../../blackjack/styles';
import { PixiCoinContainer } from '../container/pixiCoinContainer';
import {
  CoinflipCanvasPositions,
  getBettingSquareSize,
  getCoinflipGameConstants,
  getBettingGap,
} from '@/utils/games/coinflip/client/uiConfig';
import { useCoinflipGame } from '@/contexts/CoinflipGameContext';
import { ChipStack } from '../../blackjack/chips/ChipSprite';
import {
  CoinflipGameActionType,
  CoinSide,
  CoinflipStatus,
} from '@/types/games/coinflip/game';
import { optimizeChips } from '@/utils/games/blackjack/client/stateUtils';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';

interface CoinSidesProps {
  positions: CoinflipCanvasPositions;
  isMobile: boolean;
}

export function CoinSides({ positions, isMobile }: CoinSidesProps) {
  const { gameState, sendAction } = useCoinflipGame();
  const chipRef = useRef<Container>(null);

  // Determine which side to highlight based on result (after flip) or selection
  const winningSide =
    gameState.status === CoinflipStatus.FINISHED && gameState.winningSide
      ? gameState.winningSide
      : null;

  // Determine coin side: show result if finished, otherwise show selected side
  const coinSide =
    gameState.status === CoinflipStatus.FINISHED && gameState.winningSide
      ? gameState.winningSide === CoinSide.HEADS
        ? 'coinFront'
        : 'coinBack'
      : gameState.side === CoinSide.HEADS
      ? 'coinFront'
      : 'coinBack';

  // Calculate bet amounts and chips for each side from player/opponent
  const headsBet = useMemo(() => {
    return gameState.side === CoinSide.HEADS ? gameState.amount || 0 : 0;
  }, [gameState.side, gameState.amount]);

  const tailsBet = useMemo(() => {
    return gameState.side === CoinSide.TAILS ? gameState.amount || 0 : 0;
  }, [gameState.side, gameState.amount]);

  const headsBetChips = useMemo(() => optimizeChips(headsBet), [headsBet]);
  const tailsBetChips = useMemo(() => optimizeChips(tailsBet), [tailsBet]);

  const constants = getCoinflipGameConstants(isMobile);
  const squareSize = getBettingSquareSize(isMobile);
  const gap = getBettingGap(isMobile);
  const coinHalf = constants.coinDimensions.width / 2;

  const centerX = positions.sidebet.x;
  const centerY = positions.sidebet.y - constants.coinYOffset;

  // Calculate square positions: gap from coin edge to square edge
  const leftX =
    centerX - coinHalf - gap - squareSize / 2 + constants.leftPositionOffset;
  const rightX = centerX + coinHalf + gap + squareSize / 2;
  const yPos = isMobile
    ? positions.betAmount.y - constants.mobileYOffset
    : centerY;

  const labelStyle = useMemo(() => {
    if (isMobile) {
      const style = UI_STYLES.xLLabel.clone();
      style.fontSize = constants.mobileLabelFontSize;
      return style;
    }
    return UI_STYLES.xLLabel;
  }, [isMobile, constants.mobileLabelFontSize]);

  const SelectTextStyle = useMemo(() => {
    if (isMobile) {
      const style = UI_STYLES.xLLabel.clone();
      style.fontSize = constants.mobileLabelFontSize;
      return style;
    } else {
      const style = UI_STYLES.xLLabel.clone();
      style.fontSize = 36;
      return style;
    }
  }, [isMobile, constants.mobileLabelFontSize]);

  // Handle clicking on HEADS or TAILS betting areas
  const handleHeadsClick = () => {
    if (gameState.status === CoinflipStatus.BETTING) {
      sendAction(CoinflipGameActionType.SELECT_SIDE, { side: CoinSide.HEADS });
    }
  };

  const handleTailsClick = () => {
    if (gameState.status === CoinflipStatus.BETTING) {
      sendAction(CoinflipGameActionType.SELECT_SIDE, { side: CoinSide.TAILS });
    }
  };

  const showBettingAreas = gameState.status === CoinflipStatus.BETTING;
  const dropShadowFilter = useDropShadowFilter({
    alpha:0.2,
    blur:0
  });
  return (
    <>
      <pixiContainer
        x={centerX}
        y={centerY - constants.coinDimensions.height / 2 - 54}
      >
        <pixiText
          text="SELECT HEADS OR TAILS"
          x={0}
          y={0}
          anchor={0.5}
          style={SelectTextStyle}
          filters={dropShadowFilter}
        />
      </pixiContainer>
      {showBettingAreas && (
        <PixiSquareContainer
          width={squareSize}
          height={squareSize}
          x={leftX}
          y={yPos}
          position="left"
          interactive={true}
          highlighted={
            winningSide === CoinSide.HEADS || gameState.side === CoinSide.HEADS
          }
          pointerdown={handleHeadsClick}
          color={0x092c21}
          alpha={1}
          filters={dropShadowFilter}
        >
          {headsBet > 0 ? (
            <ChipStack
              chips={headsBetChips}
              x={0}
              y={0}
              scale={0.1}
              animateIn={false}
              ref={chipRef}
            />
          ) : (
            <pixiText
              text="HEADS"
              anchor={0.5}
              x={0}
              y={0}
              style={labelStyle}
            />
          )}
        </PixiSquareContainer>
      )}

      {/* Coin in the center */}
      <PixiCoinContainer
        width={constants.coinDimensions.width}
        height={constants.coinDimensions.height}
        x={centerX}
        y={centerY}
        text={coinSide}
        gameState={gameState}
      />

      {showBettingAreas && (
        <PixiSquareContainer
          width={squareSize}
          height={squareSize}
          x={rightX}
          y={yPos}
          position="right"
          interactive={true}
          highlighted={
            winningSide === CoinSide.TAILS || gameState.side === CoinSide.TAILS
          }
          pointerdown={handleTailsClick}
          color={0x114030}
          alpha={1}
          filters={dropShadowFilter}
        >
          {tailsBet > 0 ? (
            <ChipStack
              chips={tailsBetChips}
              x={0}
              y={0}
              scale={0.1}
              animateIn={false}
              ref={chipRef}
            />
          ) : (
            <pixiText
              text="TAILS"
              anchor={0.5}
              x={0}
              y={0}
              style={labelStyle}
            />
          )}
        </PixiSquareContainer>
      )}
    </>
  );
}
