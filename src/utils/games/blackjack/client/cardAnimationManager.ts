import { Card, GameState } from '@/types/games/blackjack/game';

/**
 * Represents the position of a card in the game
 */
export interface CardPosition {
  type: 'dealer' | 'player';
  handIndex: number;
  cardIndex: number;
}

/**
 * Animation state for a card
 */
export enum CardAnimationState {
  NOT_ANIMATED = 'not_animated', // Card hasn't been animated yet
  ANIMATING = 'animating', // Card is currently animating
  ANIMATED = 'animated', // Card has been animated
}

/**
 * Represents a card with its position, metadata, and animation state
 */
export interface TrackedCard {
  position: CardPosition;
  card: Card;
  id: string;
  state: CardAnimationState;
  isDealerHole?: boolean; // Is this the dealer's hole card (second card)?
  holeFlipComplete?: boolean; // Has the hole card flip animation completed?
  registrationOrder?: number; // Order in which this card was registered
}

/**
 * Sophisticated card animation manager that tracks card positions and animation states
 * in a single unified data structure
 */
export class CardAnimationManager {
  private cards: Map<string, TrackedCard> = new Map();
  private registrationCounter: number = 0;
  // Track if dealer hole card flip is complete

  constructor() {
    this.cards = new Map();
    this.registrationCounter = 0;
  }

  /**
   * Generate a unique ID for a card at a position
   */
  private static getCardId(position: CardPosition): string {
    if (position.type === 'dealer') {
      return `dealer-${position.cardIndex}`;
    }
    return `player-${position.handIndex}-${position.cardIndex}`;
  }

  /**
   * Parse a card ID back to a position
   */
  private static parseCardId(id: string): CardPosition | null {
    const dealerMatch = id.match(/^dealer-(\d+)$/);
    if (dealerMatch) {
      return {
        type: 'dealer',
        handIndex: 0,
        cardIndex: parseInt(dealerMatch[1]),
      };
    }

    const playerMatch = id.match(/^player-(\d+)-(\d+)$/);
    if (playerMatch) {
      return {
        type: 'player',
        handIndex: parseInt(playerMatch[1]),
        cardIndex: parseInt(playerMatch[2]),
      };
    }

    return null;
  }

  /**
   * Register a card at a position
   */
  registerCard(position: CardPosition, card: Card): string {
    const id = CardAnimationManager.getCardId(position);
    const isDealerHole = position.type === 'dealer' && position.cardIndex === 1;

    // Only create new entry if it doesn't exist, otherwise preserve state
    if (!this.cards.has(id)) {
      this.cards.set(id, {
        position,
        card,
        id,
        state: CardAnimationState.NOT_ANIMATED,
        isDealerHole,
      });
    } else {
      // Update position and card data but preserve state and flip status
      const existing = this.cards.get(id)!;
      this.cards.set(id, {
        ...existing,
        position,
        card,
        isDealerHole,
      });
    }

    return id;
  }

  /**
   * Get card state
   */
  getCardState(id: string): CardAnimationState {
    return this.cards.get(id)?.state || CardAnimationState.NOT_ANIMATED;
  }

  /**
   * Set card state
   */
  setCardState(id: string, state: CardAnimationState): void {
    const card = this.cards.get(id);
    if (card) {
      this.cards.set(id, { ...card, state });
    }
  }

  /**
   * Get tracked card by ID
   */
  getCard(id: string): TrackedCard | undefined {
    return this.cards.get(id);
  }

  /**
   * Get all tracked cards
   */
  getAllCards(): TrackedCard[] {
    return Array.from(this.cards.values());
  }

  /**
   * Check if a card should animate
   */
  shouldAnimate(id: string): boolean {
    const state = this.getCardState(id);
    return state === CardAnimationState.NOT_ANIMATED;
  }

  /**
   * Check if a card is currently animating
   */
  isAnimating(id: string): boolean {
    return this.getCardState(id) === CardAnimationState.ANIMATING;
  }

  /**
   * Check if a card has been animated
   */
  hasBeenAnimated(id: string): boolean {
    return this.getCardState(id) === CardAnimationState.ANIMATED;
  }

  /**
   * Mark a card as animating
   */
  markAsAnimating(id: string): void {
    this.setCardState(id, CardAnimationState.ANIMATING);
  }

  /**
   * Mark a card as animated (completed)
   */
  markAsAnimated(id: string): void {
    this.setCardState(id, CardAnimationState.ANIMATED);
  }

  /**
   * Get all cards that need animation
   */
  getCardsToAnimate(): string[] {
    return Array.from(this.cards.values())
      .filter((card) => card.state === CardAnimationState.NOT_ANIMATED)
      .map((card) => card.id);
  }

  /**
   * Get all currently animating cards
   */
  getAnimatingCards(): string[] {
    return Array.from(this.cards.values())
      .filter((card) => card.state === CardAnimationState.ANIMATING)
      .map((card) => card.id);
  }

  /**
   * Get all animated cards
   */
  getAnimatedCards(): string[] {
    return Array.from(this.cards.values())
      .filter((card) => card.state === CardAnimationState.ANIMATED)
      .map((card) => card.id);
  }

  /**
   * Initialize from game state - mark all existing cards as animated
   */
  initializeFromGameState(gameState: GameState): void {
    this.clear();

    // Register dealer cards
    if (gameState.dealerHand?.cards) {
      gameState.dealerHand.cards.forEach((card, cardIndex) => {
        const id = this.registerCard(
          { type: 'dealer', handIndex: 0, cardIndex },
          card
        );
        this.markAsAnimated(id);
      });
    }

    // Register player cards
    if (gameState.playerHands) {
      gameState.playerHands.forEach((hand, handIndex) => {
        if (hand.cards) {
          hand.cards.forEach((card, cardIndex) => {
            const id = this.registerCard(
              { type: 'player', handIndex, cardIndex },
              card
            );
            this.markAsAnimated(id);
          });
        }
      });
    }
  }

  /**
   * Handle split action - remap cards intelligently
   * When a hand splits at index N:
   * 1. Hand N card[0] stays at player-N-0 (already animated)
   * 2. Hand N card[1] moves to player-(N+1)-0 (mark as animated since it already existed)
   * 3. All hands after N shift up by 1 (N+1 becomes N+2, etc.)
   * 4. Delete the old player-N-1 card (it moved to player-(N+1)-0)
   * 5. New second cards at player-N-1 and player-(N+1)-1 will need animation (registered later)
   */
  handleSplit(splitHandIndex: number, newHandIndex?: number): void {
    // Default to splitHandIndex + 1 if not specified
    const actualNewHandIndex = newHandIndex ?? splitHandIndex + 1;
    
    const originalFirstCard = `player-${splitHandIndex}-0`;
    const originalSecondCard = `player-${splitHandIndex}-1`;

    // Get the cards before remapping
    const firstCard = this.cards.get(originalFirstCard);
    const secondCard = this.cards.get(originalSecondCard);

    console.log('🎴 handleSplit:', {
      splitHandIndex,
      actualNewHandIndex,
      originalFirstCard,
      originalSecondCard,
      firstCardState: firstCard?.state,
      secondCardState: secondCard?.state,
    });

    // If both original cards exist and were animated, handle the remapping
    if (firstCard && secondCard) {
      // Step 1: Shift all hands after the split hand up by 1
      // We need to do this in reverse order to avoid overwriting
      const handsToShift: Array<{ oldId: string; newId: string; card: TrackedCard }> = [];
      
      this.cards.forEach((trackedCard, id) => {
        if (trackedCard.position.type === 'player') {
          const handIndex = trackedCard.position.handIndex;
          // If this hand index is after the split point, it needs to shift
          if (handIndex > splitHandIndex) {
            const newHandIdx = handIndex + 1;
            const newId = CardAnimationManager.getCardId({
              type: 'player',
              handIndex: newHandIdx,
              cardIndex: trackedCard.position.cardIndex,
            });
            handsToShift.push({ oldId: id, newId, card: trackedCard });
          }
        }
      });

      // Apply shifts in reverse order (highest indices first)
      handsToShift
        .sort((a, b) => b.card.position.handIndex - a.card.position.handIndex)
        .forEach(({ oldId, newId, card }) => {
          this.cards.delete(oldId);
          this.cards.set(newId, {
            ...card,
            id: newId,
            position: {
              ...card.position,
              handIndex: card.position.handIndex + 1,
            },
          });
        });

      // Step 2: Move the second card to become the first card of the new hand
      // Mark it as ANIMATED since it already existed on screen
      const newHandFirstCard = `player-${actualNewHandIndex}-0`;
      this.cards.set(newHandFirstCard, {
        ...secondCard,
        id: newHandFirstCard,
        position: {
          type: 'player',
          handIndex: actualNewHandIndex,
          cardIndex: 0,
        },
        state: CardAnimationState.ANIMATED, // Already animated (was visible)
      });

      // Step 3: Delete the old second card entry (it moved)
      this.cards.delete(originalSecondCard);

      // Step 4: The new second cards will be registered when game state syncs
      // They default to NOT_ANIMATED and will animate in

      console.log('🎴 handleSplit complete:', {
        remainingCards: Array.from(this.cards.keys()),
      });
    }
  }

  /**
   * Clear all tracked cards and states (for new games)
   */
  clear(): void {
    this.cards.clear();
  }

  /**
   * Mark dealer hole card flip as complete
   */
  markDealerHoleFlipComplete(): void {
    // Find dealer hole card and mark flip complete
    const dealerHoleId = 'dealer-1'; // Dealer's second card
    const card = this.cards.get(dealerHoleId);
    if (card) {
      this.cards.set(dealerHoleId, {
        ...card,
        holeFlipComplete: true,
      });
    }
  }

  /**
   * Check if dealer hole card flip is complete
   */
  isDealerHoleCardFlipComplete(): boolean {
    const dealerHoleId = 'dealer-1';
    const card = this.cards.get(dealerHoleId);
    return card?.holeFlipComplete || false;
  }

  /**
   * Debug: Get current state as an object
   */
  getDebugState() {
    return {
      cards: Array.from(this.cards.values()),
      toAnimate: this.getCardsToAnimate(),
      animating: this.getAnimatingCards(),
      animated: this.getAnimatedCards(),
    };
  }

  /**
   * Export state for compatibility with old system
   */
  exportAsLegacySets(): {
    animatedCardIds: Set<string>;
    animatingCardIds: Set<string>;
  } {
    return {
      animatedCardIds: new Set(this.getAnimatedCards()),
      animatingCardIds: new Set(this.getAnimatingCards()),
    };
  }

  /**
   * Import from legacy sets
   */
  importFromLegacySets(
    animatedCardIds: Set<string>,
    animatingCardIds: Set<string>
  ): void {
    animatedCardIds.forEach((id) => {
      this.setCardState(id, CardAnimationState.ANIMATED);
    });
    animatingCardIds.forEach((id) => {
      this.setCardState(id, CardAnimationState.ANIMATING);
    });
  }

  /**
   * Clone this manager
   */
  clone(): CardAnimationManager {
    const newManager = new CardAnimationManager();
    newManager.cards = new Map(this.cards);
    return newManager;
  }

  /**
   * Get all cards that need to be processed in queue order
   * Returns cards in priority order: NOT_ANIMATED first, then ANIMATING
   */
  getQueue(): string[] {
    const notAnimated = this.getCardsToAnimate();
    const animating = this.getAnimatingCards();

    return [...notAnimated, ...animating];
  }

  /**
   * Get the next card that should start animating
   * Returns null if a card is currently animating or no cards are queued
   */
  getNextCardToAnimate(): string | null {
    // If any card is animating, don't start another
    const animating = this.getAnimatingCards();
    if (animating.length > 0) {
      return null;
    }

    // Get first card that needs animation
    const toAnimate = this.getCardsToAnimate();
    if (toAnimate.length === 0) {
      return null;
    }

    const nextCardId = toAnimate[0];
    const nextCard = this.getCard(nextCardId);

    if (!nextCard) {
      return null;
    }

    if (nextCard.position.type === 'player') {
      return nextCardId;
    }

    const dealerCards = this.getAllCards().filter(
      (card) => card.position.type === 'dealer'
    );
    if (dealerCards.length >= 3 && !this.isDealerHoleCardFlipComplete()) {
      return null;
    }

    return nextCardId;
  }

  /**
   * Check if a card can be added (not already tracked)
   */
  canAddCard(id: string): boolean {
    return !this.cards.has(id);
  }

  /**
   * Get all card IDs currently tracked
   */
  getAllTrackedCardIds(): Set<string> {
    return new Set(this.cards.keys());
  }
}

/**
 * Create a singleton instance for the game
 */
let globalAnimationManager: CardAnimationManager | null = null;

export function getGlobalAnimationManager(): CardAnimationManager {
  if (!globalAnimationManager) {
    globalAnimationManager = new CardAnimationManager();
  }
  return globalAnimationManager;
}

export function resetGlobalAnimationManager(): void {
  globalAnimationManager = new CardAnimationManager();
}
