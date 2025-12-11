import {
  GameActionType,
  GamePhaseType,
  GameState,
  Hand,
  HandResultType,
} from "@/types/games/blackjack/game";
import { HandSprite } from "./HandSprite";
import { InsuranceChipDisplay } from "../chips/InsuranceChipDisplay";
import { getCardValue } from "@/utils/games/blackjack/cardValue";

interface PlayerHandSpriteProps {
  hand: Hand;
  handIndex: number;
  gameState: GameState;
  position: { x: number; y: number };
  isMobile: boolean;
  onAction?: (action: GameActionType, amount?: number) => void;
  animatedCardIds: Set<string>;
  isActionInProgress: boolean;
  isDealing: boolean;
  balancePosition?: { x: number; y: number };
}

export function PlayerHandSprite({
  hand,
  handIndex,
  isActionInProgress,
  gameState,
  position,
  isMobile,
  onAction,
  animatedCardIds,
  isDealing,
  balancePosition,
}: PlayerHandSpriteProps) {
  const activeHandIndex = gameState.currentHandIndex ?? 0;

  // Calculate label
  const label =
    gameState.playerHands.length > 1 ? `HAND${handIndex + 1}` : "YOU";

  // Calculate if hand is active
  const isActive =
    gameState.gamePhase === GamePhaseType.PLAYING &&
    handIndex === activeHandIndex &&
    !hand.isBusted &&
    !hand.isSurrendered;

  // Calculate status
  let status: string | undefined;
  if (hand.isBusted) {
    status = "BUST";
  } else if (hand.isSurrendered) {
    status = "SURRENDER";
  } else if (hand.isBlackjack && hand.cards.length === 2) {
    status = "BLACKJACK";
  } else if (
    hand.isStanding &&
    (gameState.gamePhase !== GamePhaseType.PLAYING ||
      handIndex !== activeHandIndex)
  ) {
    status = "STAND";
  }

  // Update status from hand results if game is finished AND not dealing cards
  if (
    gameState.gamePhase === GamePhaseType.FINISHED &&
    !isDealing
  ) {
    const result = gameState.handResults.find(
      (entry) => entry.handIndex === handIndex
    );
    if (result && (!status || status === "STAND")) {
      if (result.result === HandResultType.WIN) {
        status = `WIN +$${result.profit}`;
      } else if (result.result === HandResultType.LOSE) {
        status = "LOSE";
      } else if (result.result === HandResultType.PUSH) {
        status = "PUSH";
      } else if (result.result === HandResultType.BLACKJACK) {
        status = "BLACKJACK";
      } else if (result.result === HandResultType.SURRENDER) {
        status = "SURRENDER";
      }
    }
  }

  // Determine if THIS hand can be split (per-hand, independent of global canSplit)
  const canSplitThisHand = (() => {
    // Must be the active hand in PLAYING phase with exactly 2 cards
    if (
      gameState.gamePhase !== GamePhaseType.PLAYING ||
      handIndex !== activeHandIndex ||
      hand.isBusted ||
      hand.isSurrendered ||
      hand.cards.length !== 2
    ) {
      return false;
    }

    // Respect max split hands (frontend mirrors HandSprite logic of max 4)
    const MAX_HANDS = 4;
    if (gameState.playerHands.length >= MAX_HANDS) {
      return false;
    }

    // Same-value rule: allow same rank and 10-value combos (10/J/Q/K)
    const [card1, card2] = hand.cards;
    return getCardValue(card1) === getCardValue(card2);
  })();

  return (
    <>
      <HandSprite
        cards={hand.cards}
        x={position.x}
        y={position.y}
        label={label}
        animateIn={false}
        isMobile={isMobile}
        isActive={isActive}
        status={status}
        gamePhase={gameState.gamePhase}
        canSplit={canSplitThisHand}
        onSplit={() => onAction?.(GameActionType.SPLIT, handIndex)}
        suppressOverlayUntilAnimationDone={
          isActionInProgress && handIndex === activeHandIndex
        }
        animatedCardIds={animatedCardIds}
        handIndex={handIndex}
        isActionInProgress={isActionInProgress}
        totalPlayerHands={gameState.playerHands.length}
      />
      {/* Insurance chips - only show on hand 0 (first hand) since insurance can only be taken before any actions */}
      {handIndex === 0 && balancePosition && (
        <InsuranceChipDisplay
          gameState={gameState}
          handIndex={handIndex}
          handPosition={position}
          isMobile={isMobile}
          balancePosition={balancePosition}
        />
      )}
    </>
  );
}
