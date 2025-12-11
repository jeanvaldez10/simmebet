import {
  CoinflipGameActionType,
  CoinflipGameState,
  CoinflipStatus,
} from "@/types/games/coinflip/game";
import React, { useCallback } from "react";
import { ButtonSprite } from "../../blackjack/buttons/ButtonSprite";
import {
  getButtonFontSize,
  getButtonHeight,
  getButtonWidth,
  getButtonSpacing,
} from "@/utils/games/coinflip/client/uiConfig";

interface ActionButtonsProps {
  width: number;
  isMobile: boolean;
  loading: boolean;
  yPosition: number;
  gameState: CoinflipGameState;
  availableActions: {
    action: CoinflipGameActionType;
    description: string;
  }[];
  onAction?: (
    action: CoinflipGameActionType,
    amount?: number,
    side?: "heads" | "tails"
  ) => void;
}

export function ActionButtons({
  availableActions,
  width,
  isMobile,
  loading,
  yPosition,
  gameState,
  onAction,
}: ActionButtonsProps) {
  // Create button click handler factory - must be before early returns
  const createButtonHandler = useCallback(
    (action: CoinflipGameActionType, isDisabled: boolean) => {
      return function handleClick() {
        if (onAction && !isDisabled) {
          onAction(action, undefined, undefined);
        }
      };
    },
    [onAction]
  );

  if (!availableActions || availableActions.length === 0) {
    return null;
  }

  const actions = availableActions.map((a) => ({
    action: String(a.action),
    description: a.description,
  }));

  const supported = ["CLEAR", "FLIP", "DOUBLE"];

  // Check game phase
  const isBettingPhase = gameState.status === CoinflipStatus.BETTING;

  const visible = actions.sort((a, b) => supported.indexOf(a.action) - supported.indexOf(b.action));

  const count = visible.length;
  if (count === 0) return null;

  const gap = getButtonSpacing(isMobile);

  // Helper function to get button width (must match the width used in rendering)
  const getButtonWidthForAction = (action: string): number => {
    if (action === "SURRENDER") {
      return isMobile ? 120 : 140;
    }
    return getButtonWidth(isMobile);
  };

  // Calculate total width using actual button widths
  const totalWidth = visible.reduce((sum, btn) => {
    return sum + getButtonWidthForAction(btn.action);
  }, 0);

  // Add gaps between buttons
  const totalWidthWithGaps = totalWidth + gap * (count - 1);

  // Start X position to center the whole group
  const startX = width / 2 - totalWidthWithGaps / 2;

  // Calculate bet validation values once
  const betAmount = gameState.amount || 0;
  const balance = gameState.balance || 0;
  const noBetPlaced = !gameState.amount || betAmount === 0;
  const isBetAmountInvalid = betAmount <= 0 || betAmount > balance;
  const doubleAmount = betAmount * 2;
  const canDouble = doubleAmount <= balance;

  // Pre-compute button configurations with handlers
  const buttonConfigs = visible.map((btn, i) => {
    const buttonWidth = getButtonWidthForAction(btn.action);
    
    const text =
      btn.action === "DOUBLE"
        ? "x2"
        : btn.action === "RESET_GAME"
          ? "Reset"
          : btn.action === "CLEAR"
            ? "CLEAR"
            : btn.action === "PLAY_AGAIN"
              ? "NEXT"
              : btn.action;

    const color: "red" | "orange" | "blue" =
      btn.action === "DOUBLE"
        ? "red"
        : btn.action === "CLEAR"
          ? "orange"
          : "blue";

    const isDisabled =
      loading ||
      !isBettingPhase ||
      (btn.action === "CLEAR" && noBetPlaced) ||
      (btn.action === "DOUBLE" && (noBetPlaced || isBetAmountInvalid || !canDouble)) ||
      (btn.action === "FLIP" && (noBetPlaced || isBetAmountInvalid));

    const action = btn.action as CoinflipGameActionType;
    const onClick = createButtonHandler(action, isDisabled);

    return {
      key: `action-btn-${btn.action}-${i}`,
      text,
      color,
      width: buttonWidth,
      isDisabled,
      onClick,
      action,
    };
  });

  // Calculate positions
  let currentX = startX;
  const positionedButtons = buttonConfigs.map((config) => {
    const x = currentX + config.width / 2;
    currentX += config.width + gap;
    return { ...config, x };
  });

  return (
    <React.Fragment>
      {positionedButtons.map((button) => (
        <ButtonSprite
          key={button.key}
          text={button.text}
          x={button.x}
          y={yPosition}
          width={button.width}
          height={getButtonHeight(isMobile)}
          color={button.color}
          disabled={button.isDisabled}
          onClick={button.onClick}
          fontSize={getButtonFontSize(isMobile)}
        />
      ))}
    </React.Fragment>
  );
}
