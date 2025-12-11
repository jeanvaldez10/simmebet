import React from 'react';
import { ButtonSprite } from './ButtonSprite';
import {
  GameState,
  GameActionType,
  GamePhaseType,
} from '@/types/games/blackjack/game';
import {
  getButtonHeight,
  getButtonFontSize,
} from '@/utils/games/blackjack/client/uiConfig';
import PixiFlagContainer from '../containers/PixiFlagContainer';

interface ActionButtonsProps {
  availableActions: {
    action: GameActionType;
    description: string;
  }[];
  gameState: GameState;
  width: number;
  isMobile: boolean;
  isActionInProgress: boolean;
  yPosition: number;
  onAction?: (action: GameActionType, amount?: number) => void;
}

export function ActionButtons({
  availableActions,
  gameState,
  width,
  isMobile,
  isActionInProgress,
  yPosition,
  onAction,
}: ActionButtonsProps) {
  // Helper: Calculate dynamic button width based on text length
  const getTextBasedWidth = (text: string, isMobile: boolean): number => {
    const baseWidth = isMobile ? 100 : 122;
    const fontSize = getButtonFontSize(isMobile);
    // Approximate width: ~0.55 * fontSize per character for Minecraft font + padding
    const textWidth = text.length * fontSize * 0.55;
    const padding = isMobile ? 28 : 32;
    const calculatedWidth = textWidth + padding;
    // Use at least the base width, but allow expansion
    return Math.max(baseWidth, calculatedWidth);
  };

  // Helper: map action to button label
  const getActionLabel = (action: GameActionType) => {
    switch (action) {
      case GameActionType.DOUBLE:
        return 'x2';
      case GameActionType.RESET_GAME:
        return 'RESET';
      case GameActionType.SURRENDER:
        return 'FOREFIT';
      default:
        return action;
    }
  };

  // Helper: map action to button color
  const getActionColor = (action: GameActionType) => {
    switch (action) {
      case GameActionType.HIT:
        return 'red';
      case GameActionType.STAND:
        return 'blue';
      case GameActionType.DOUBLE:
        return 'orange';
      case GameActionType.SURRENDER:
        return 'white';
      default:
        return 'blue';
    }
  };

  // BETTING PHASE BUTTONS
  if (gameState.gamePhase === GamePhaseType.BETTING) {
    const gap = isMobile ? 10 : 25;
    const leftText = 'CLEAR';
    const rightText = isActionInProgress ? 'DEALING...' : 'PLACE BET';

    const leftWidth = getTextBasedWidth(leftText, isMobile);
    const rightWidth = getTextBasedWidth(rightText, isMobile);

    // Calculate positions for centered layout
    const totalWidth = leftWidth + gap + rightWidth;
    const startX = width / 2 - totalWidth / 2;
    const leftButtonX = startX + leftWidth / 2;
    const rightButtonX = startX + leftWidth + gap + rightWidth / 2;

    return (
      <>
        <ButtonSprite
          text={leftText}
          x={leftButtonX}
          y={yPosition}
          width={leftWidth}
          height={getButtonHeight(isMobile)}
          color="orange"
          disabled={
            (gameState.pendingBet === 0 &&
              gameState.pairBet === 0 &&
              gameState.twentyOnePlusThreeBet === 0) ||
            isActionInProgress
          }
          onClick={() => onAction?.(GameActionType.CLEAR_BET)}
          fontSize={getButtonFontSize(isMobile)}
        />
        <ButtonSprite
          text={rightText}
          x={rightButtonX}
          y={yPosition}
          width={rightWidth}
          height={getButtonHeight(isMobile)}
          color="red"
          disabled={gameState.pendingBet === 0 || isActionInProgress}
          onClick={() =>
            onAction?.(GameActionType.START_ROUND, gameState.pendingBet)
          }
          fontSize={getButtonFontSize(isMobile)}
        />
      </>
    );
  }

  // FINISHED PHASE BUTTONS
  if (gameState.gamePhase === GamePhaseType.FINISHED && gameState.result) {
    const gap = isMobile ? 10 : 25;
    const leftText = 'NEW GAME';
    const rightText = 'BET AGAIN';

    const leftWidth = getTextBasedWidth(leftText, isMobile);
    const rightWidth = getTextBasedWidth(rightText, isMobile);

    // Calculate positions for centered layout
    const totalWidth = leftWidth + gap + rightWidth;
    const startX = width / 2 - totalWidth / 2;
    const leftButtonX = startX + leftWidth / 2;
    const rightButtonX = startX + leftWidth + gap + rightWidth / 2;

    return (
      <>
        <ButtonSprite
          text={leftText}
          x={leftButtonX}
          y={yPosition}
          width={leftWidth}
          height={getButtonHeight(isMobile)}
          color="red"
          disabled={isActionInProgress}
          onClick={() => onAction?.(GameActionType.RESET_GAME)}
          fontSize={getButtonFontSize(isMobile)}
        />
        <ButtonSprite
          text={rightText}
          x={rightButtonX}
          y={yPosition}
          width={rightWidth}
          height={getButtonHeight(isMobile)}
          color="blue"
          disabled={isActionInProgress}
          onClick={() => onAction?.(GameActionType.BET_AGAIN)}
          fontSize={getButtonFontSize(isMobile)}
        />
      </>
    );
  }

  // PLAYING PHASE BUTTONS (from availableActions)
  if (!availableActions || availableActions.length === 0) {
    return null;
  }

  const supported: GameActionType[] = [
    GameActionType.DOUBLE,
    GameActionType.STAND,
    GameActionType.HIT,
    GameActionType.SURRENDER,
    GameActionType.RESET_GAME,
  ];

  // Filter & sort
  const visible = availableActions
    .filter((a) => supported.includes(a.action))
    .sort((a, b) => supported.indexOf(a.action) - supported.indexOf(b.action));

  if (visible.length === 0) return null;

  const gap = isMobile ? 10 : 25;
  const buttonHeight = getButtonHeight(isMobile);

  // On mobile, separate SURRENDER from the row
  const visibleInRow = isMobile
    ? visible.filter((btn) => btn.action !== GameActionType.SURRENDER)
    : visible;
  const surrenderButton = isMobile
    ? visible.find((btn) => btn.action === GameActionType.SURRENDER)
    : null;

  const rowCount = visibleInRow.length;

  // Calculate widths per button in row based on text content
  const buttonWidths = visibleInRow.map((btn) =>
    getTextBasedWidth(getActionLabel(btn.action), isMobile)
  );

  // Total width including gaps
  const totalWidth =
    buttonWidths.reduce((sum, w) => sum + w, 0) + gap * (rowCount - 1);

  // Start X for perfect centering
  const startX = width / 2 - totalWidth / 2;

  // Find HIT button position for SURRENDER alignment (mobile only)
  let hitButtonX: number | null = null;
  let hitButtonWidth: number | null = null;
  if (isMobile && surrenderButton) {
    const hitIndex = visibleInRow.findIndex((btn) => btn.action === 'HIT');
    if (hitIndex !== -1) {
      hitButtonWidth = buttonWidths[hitIndex];
      hitButtonX =
        startX +
        buttonWidths.slice(0, hitIndex).reduce((sum, w) => sum + w + gap, 0) +
        hitButtonWidth / 2;
    }
  }

  return (
    <>
      {/* Render buttons in row */}
      {visibleInRow.map((btn, i) => {
        const btnWidth = buttonWidths[i];
        const x =
          startX +
          buttonWidths.slice(0, i).reduce((sum, w) => sum + w + gap, 0) +
          btnWidth / 2;

        return (
          <ButtonSprite
            key={`action-btn-${btn.action}-${i}`}
            text={getActionLabel(btn.action)}
            x={x}
            y={yPosition}
            width={btnWidth}
            height={buttonHeight}
            color={getActionColor(btn.action)}
            disabled={isActionInProgress}
            onClick={() => onAction?.(btn.action)}
            fontSize={getButtonFontSize(isMobile)}
            isMobile={isMobile}
          />
        );
      })}

      {/* Render SURRENDER button above HIT on mobile */}
      {isMobile &&
        surrenderButton &&
        hitButtonX !== null &&
        hitButtonWidth !== null && (
          <PixiFlagContainer
            onClick={() =>
              onAction?.(surrenderButton.action as unknown as GameActionType)
            }
            hitButtonX={hitButtonX}
            buttonWidth={hitButtonWidth}
            yPosition={yPosition}
            buttonHeight={buttonHeight}
            gap={gap}
            squreWidth={31}
            squreHeight={32}
          />
        )}
    </>
  );
}
