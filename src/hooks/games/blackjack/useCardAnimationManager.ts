import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CardAnimationManager,
  type CardPosition,
  type TrackedCard,
} from '@/utils/games/blackjack/client/cardAnimationManager';
import { Card, GameState } from '@/types/games/blackjack/game';

/**
 * React hook for managing card animations using the CardAnimationManager
 */
export function useCardAnimationManager() {
  const [manager] = useState(() => new CardAnimationManager());
  const managerRef = useRef(manager);
  // Version counter to trigger re-renders when animation state changes
  const [, setVersion] = useState(0);
  const forceUpdate = useCallback(() => setVersion((v) => v + 1), []);

  // Keep ref in sync
  useEffect(() => {
    managerRef.current = manager;
  }, [manager]);

  /**
   * Initialize from game state (marks all existing cards as animated)
   */
  const initialize = useCallback(
    (gameState: GameState) => {
      manager.initializeFromGameState(gameState);
      forceUpdate();
    },
    [manager, forceUpdate]
  );

  /**
   * Handle split action
   */
  const handleSplit = useCallback(
    (splitHandIndex: number) => {
      console.log('🎴 Handling split animation:', {
        splitHandIndex,
        before: manager.getDebugState(),
      });

      manager.handleSplit(splitHandIndex);

      console.log('🎴 After split animation:', {
        after: manager.getDebugState(),
      });

      forceUpdate();
    },
    [manager, forceUpdate]
  );

  /**
   * Mark a card as animating
   */
  const markAsAnimating = useCallback(
    (cardId: string) => {
      manager.markAsAnimating(cardId);
      forceUpdate();
    },
    [manager, forceUpdate]
  );

  /**
   * Mark a card as animated (completed)
   */
  const markAsAnimated = useCallback(
    (cardId: string) => {
      manager.markAsAnimated(cardId);
      forceUpdate();
    },
    [manager, forceUpdate]
  );

  /**
   * Check if a card should animate
   */
  const shouldAnimate = useCallback(
    (cardId: string): boolean => {
      return manager.shouldAnimate(cardId);
    },
    [manager]
  );

  /**
   * Check if a card is animating
   */
  const isAnimating = useCallback(
    (cardId: string): boolean => {
      return manager.isAnimating(cardId);
    },
    [manager]
  );

  /**
   * Check if a card has been animated
   */
  const hasBeenAnimated = useCallback(
    (cardId: string): boolean => {
      return manager.hasBeenAnimated(cardId);
    },
    [manager]
  );

  /**
   * Get all cards that need animation
   */
  const getCardsToAnimate = useCallback((): string[] => {
    return manager.getCardsToAnimate();
  }, [manager]);

  /**
   * Get all currently animating cards
   */
  const getAnimatingCards = useCallback((): string[] => {
    return manager.getAnimatingCards();
  }, [manager]);

  /**
   * Get all animated cards
   */
  const getAnimatedCards = useCallback((): string[] => {
    return manager.getAnimatedCards();
  }, [manager]);

  /**
   * Clear all animation state (for new games)
   */
  const clear = useCallback(() => {
    manager.clear();
    forceUpdate();
  }, [manager, forceUpdate]);

  /**
   * Mark dealer hole card flip as complete
   */
  const markDealerHoleFlipComplete = useCallback(() => {
    manager.markDealerHoleFlipComplete();
    forceUpdate();
  }, [manager, forceUpdate]);

  /**
   * Check if dealer hole card flip is complete
   */
  const isDealerHoleCardFlipComplete = useCallback((): boolean => {
    return manager.isDealerHoleCardFlipComplete();
  }, [manager]);

  /**
   * Get legacy Sets for compatibility
   */
  const getLegacySets = useCallback(() => {
    return manager.exportAsLegacySets();
  }, [manager]);

  /**
   * Get debug state
   */
  const getDebugState = useCallback(() => {
    return manager.getDebugState();
  }, [manager]);

  /**
   * Register a card at a position
   * Note: Does not trigger re-render - registration is just data setup
   */
  const registerCard = useCallback(
    (position: CardPosition, card: Card): string => {
      const id = manager.registerCard(position, card);
      // No forceUpdate() - registration is just data setup and shouldn't trigger re-renders
      // Re-renders will happen when cards are actually marked as animated/animating

      return id;
    },
    [manager]
  );

  /**
   * Get tracked card by ID
   */
  const getCard = useCallback(
    (id: string): TrackedCard | undefined => {
      return manager.getCard(id);
    },
    [manager]
  );

  /**
   * Get next card that should start animating
   */
  const getNextCardToAnimate = useCallback((): string | null => {
    return manager.getNextCardToAnimate();
  }, [manager]);

  return {
    manager,
    managerRef,
    initialize,
    handleSplit,
    markAsAnimating,
    markAsAnimated,
    shouldAnimate,
    isAnimating,
    hasBeenAnimated,
    getCardsToAnimate,
    getAnimatingCards,
    getAnimatedCards,
    clear,
    markDealerHoleFlipComplete,
    isDealerHoleCardFlipComplete,
    getLegacySets,
    getDebugState,
    registerCard,
    getCard,
    getNextCardToAnimate,
  };
}
