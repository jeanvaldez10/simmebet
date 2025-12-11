 
// TODO: Remove unused variable ignores when implementing full game logic
import {
  Card,
  Hand,
  GameState,
  /* HandResult, */ GameStatePhaseType,
} from '@/types/games/blackjack/game'; // TODO: HandResult may be used later
import { DeckProvider } from '@/lib/games/blackjack/gameStateService';
import { GAME_MECHANICS } from '@/utils/games/blackjack/gameConstants';

import { getCardValue } from './cardValue';
import {
  getCurrentHandIndex,
  getCurrentHand,
  areAllHandsComplete,
} from './currentHandIndex';

export class GameStateActions {
  constructor(private deckProvider: DeckProvider) {}

  // Helper method to deal a card using the configured deck provider
  private dealCard(
    shuffleId: string,
    dealtCardCount: number,
    shuffleSalt?: string
  ): { card: Card; newDealtCardCount: number } {
    // Ensure dealtCardCount is a valid non-negative number
    const safeDealtCardCount = Math.max(0, Math.floor(dealtCardCount || 0));

    // For StandardDeckProvider, we pass an empty array to let it create a new deck
    // The dealtCardCount is not used by StandardDeckProvider
    const { card } = this.deckProvider.dealCard([], shuffleId, shuffleSalt);
    // newDeck is not used in this implementation

    // Ensure we never return a null card
    if (!card) {
      throw new Error('Deck provider returned null card');
    }

    return { card, newDealtCardCount: safeDealtCardCount + 1 };
  }

  // Calculate hand value (handles Aces properly)
  calculateHandValue(cards: Card[]): number {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
      // Skip null/undefined cards and cards that are completely hidden (suit === 'hidden')
      // Don't skip cards that are just marked as isHidden (hole cards)
      if (!card || card.suit === 'hidden') {
        continue;
      }

      if (card.rank === 'A') {
        aces++;
        total += 11;
      } else {
        total += getCardValue(card);
      }
    }

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  // Create initial hand
  createHand(
    bet: number = 0,
    isFromSplit: boolean = false,
    isSplitAces: boolean = false
  ): Hand {
    return {
      cards: [],
      bet,
      originalBet: bet,
      isStanding: false,
      isBusted: false,
      isBlackjack: false,
      isDoubled: false,
      isSurrendered: false,
      isFromSplit,
      isSplitAces,
    };
  }

  // Check if hand is blackjack
  isBlackjack(cards: Card[]): boolean {
    return cards.length === 2 && this.calculateHandValue(cards) === 21;
  }

  // Check if hand is busted
  isBusted(cards: Card[]): boolean {
    return this.calculateHandValue(cards) > 21;
  }

  // Check if cards can be split
  // Cards can be split if they have the same value
  // This allows same rank splits (e.g., 7+7, A+A) and 10-value combinations (e.g., 10+J, Q+K)
  canSplitCards(cards: Card[]): boolean {
    if (cards.length !== 2) {
      return false;
    }
    const card1Value = getCardValue(cards[0]);
    const card2Value = getCardValue(cards[1]);
    return card1Value === card2Value;
  }

  // Determine what actions are allowed for a hand
  getHandActions(
    hand: Hand,
    state: GameState
  ): { canDouble: boolean; canSplit: boolean; canSurrender: boolean } {
    if (!hand) {
      return { canDouble: false, canSplit: false, canSurrender: false };
    }

    // Cannot perform actions on completed hands (standing, busted, or surrendered)
    if (
      hand.isStanding ||
      hand.isBusted ||
      hand.isSurrendered ||
      hand.isBlackjack ||
      state.gamePhase === GameStatePhaseType.FINISHED
    ) {
      return { canDouble: false, canSplit: false, canSurrender: false };
    }

    // Check if we can split: cards must be same rank AND total hands must be less than max
    const canSplit =
      this.canSplitCards(hand.cards) &&
      state.playerHands.length < GAME_MECHANICS.MAX_SPLIT_HANDS;

    if (hand.isFromSplit) {
      return {
        canDouble: !hand.isSplitAces,
        canSplit: canSplit,
        canSurrender: false,
      };
    }

    return {
      canDouble: hand.cards.length === 2,
      canSplit: canSplit,
      canSurrender: hand.cards.length === 2,
    };
  }

  // Check if dealer should hit (stand on 17 or higher)
  dealerShouldHit(cards: Card[]): boolean {
    const value = this.calculateHandValue(cards);
    return value < 17;
  }

  // Process DEAL_CARD action
  async processStartRound(state: GameState): Promise<GameState> {
    if (state.dealingStep <= state.lastProcessedStep) {
      return state;
    }

    // Don't modify hands - they're already dealt by effects
    const playerHand = state.playerHands[0];
    const dealerHand = state.dealerHand;

    const playerBlackjack = this.isBlackjack(playerHand.cards);
    const dealerBlackjack = this.isBlackjack(dealerHand.cards);

    let gamePhase: GameStatePhaseType;
    if (dealerHand.cards[0]?.rank === 'A') {
      gamePhase = GameStatePhaseType.ASK_INSURANCE;
    } else if (dealerBlackjack || playerBlackjack) {
      gamePhase = GameStatePhaseType.FINISHED;
    } else {
      gamePhase = GameStatePhaseType.PLAYING;
    }

    const handActions = this.getHandActions(playerHand, state);

    return {
      ...state,
      gamePhase,
      message: 'Cards dealt. Your turn.',
      canDouble: !playerBlackjack && handActions.canDouble,
      canSplit: !playerBlackjack && handActions.canSplit,
      canSurrender: !playerBlackjack && handActions.canSurrender,
      insuranceOffered: dealerHand.cards[0]?.rank === 'A',
      insuranceWasOffered: false,
      dealerHasBlackjack: dealerBlackjack,
      dealingStep: state.dealingStep + 1,
      isDealing: false,
      lastProcessedStep: state.dealingStep,
    };
  }

  // Process HIT action (legacy method that deals cards directly)
  processHit(state: GameState): GameState {
    const currentHand = getCurrentHand(state);
    if (!currentHand) {
      return { ...state, message: 'No active hand found' };
    }

    if (currentHand.isStanding || currentHand.isBusted) {
      return state;
    }

    if (currentHand.isSplitAces) {
      return { ...state, message: 'Cannot hit on split aces' };
    }

    const { card } = this.dealCard(
      state.shuffleId,
      state.dealtCardCount,
      state.shuffleSalt
    );
    const updatedHand = {
      ...currentHand,
      cards: [...currentHand.cards, card],
    };

    if (this.isBusted(updatedHand.cards)) {
      updatedHand.isBusted = true;
      updatedHand.isStanding = true;
    } else if (this.calculateHandValue(updatedHand.cards) === 21) {
      updatedHand.isStanding = true;
    }

    const updatedHands = [...state.playerHands];
    let currentHandIndex = getCurrentHandIndex(state);
    updatedHands[currentHandIndex] = updatedHand;

    let gamePhase = state.gamePhase;
    let message = state.message;

    if (updatedHand.isBusted) {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;
        message = `Hand ${previousHandIndex + 1} busted. Playing hand ${
          nextActiveHandIndex + 1
        }.`;

        // If the next hand is a split hand that needs its second card, mark it as needing a card
        const nextHand = updatedHands[currentHandIndex];
        if (nextHand.isFromSplit && nextHand.cards.length === 1) {
          updatedHands[currentHandIndex] = nextHand;
        }
      } else {
        message = 'Bust!';
      }
    } else if (
      updatedHand.isStanding &&
      this.calculateHandValue(updatedHand.cards) === 21
    ) {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;
        message = `Hand ${previousHandIndex + 1} stands on 21. Playing hand ${
          nextActiveHandIndex + 1
        }.`;

        // If the next hand is a split hand that needs its second card, mark it as needing a card
        const nextHand = updatedHands[currentHandIndex];
        if (nextHand.isFromSplit && nextHand.cards.length === 1) {
          updatedHands[currentHandIndex] = nextHand;
        }
      } else {
        message = '21! Standing automatically.';
      }
    }

    const allHandsDone = areAllHandsComplete({
      ...state,
      playerHands: updatedHands,
    });
    if (allHandsDone) {
      gamePhase = GameStatePhaseType.PLAYING;
      if (
        !(
          updatedHand.isStanding &&
          this.calculateHandValue(updatedHand.cards) === 21
        )
      ) {
        message = "All hands complete. Dealer's turn starting...";
      }
    }

    const currentHandActions = this.getHandActions(
      updatedHands[currentHandIndex] || updatedHands[0],
      state
    );

    return {
      ...state,
      playerHands: updatedHands,
      currentHandIndex,
      gamePhase,
      message,
      canDouble: currentHandActions.canDouble,
      canSplit: currentHandActions.canSplit,
      canSurrender: currentHandActions.canSurrender,
    };
  }

  // Process DOUBLE action logic (without dealing cards - for use with effect system)
  processDoubleLogic(state: GameState, newCard: Card): GameState {
    const currentHand = getCurrentHand(state);
    if (!currentHand) {
      return { ...state, message: 'No active hand found' };
    }

    if (currentHand.isStanding || currentHand.isBusted) {
      return state;
    }

    if (currentHand.isSplitAces) {
      return { ...state, message: 'Cannot double on split aces' };
    }

    const updatedHand = {
      ...currentHand,
      cards: [...currentHand.cards, newCard],
      bet: currentHand.bet * 2,
      isDoubled: true,
      isStanding: true,
    };

    if (this.isBusted(updatedHand.cards)) {
      updatedHand.isBusted = true;
    }

    const updatedHands = [...state.playerHands];
    let currentHandIndex = getCurrentHandIndex(state);
    updatedHands[currentHandIndex] = updatedHand;

    let gamePhase = state.gamePhase;
    let message = state.message;

    if (updatedHand.isBusted) {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;
        message = `Hand ${previousHandIndex + 1} busted. Playing hand ${
          nextActiveHandIndex + 1
        }.`;
      } else {
        message = 'Bust!';
      }
    } else {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;
        message = `Hand ${previousHandIndex + 1} doubled. Playing hand ${
          nextActiveHandIndex + 1
        }.`;

        // If the next hand is a split hand that needs its second card, mark it as needing a card
        const nextHand = updatedHands[currentHandIndex];
        if (nextHand.isFromSplit && nextHand.cards.length === 1) {
          updatedHands[currentHandIndex] = nextHand;
        }
      } else {
        message = 'Hand doubled.';
      }
    }

    const allHandsDone = areAllHandsComplete({
      ...state,
      playerHands: updatedHands,
    });
    if (allHandsDone) {
      gamePhase = GameStatePhaseType.PLAYING;
      if (
        !(
          updatedHand.isStanding &&
          this.calculateHandValue(updatedHand.cards) === 21
        )
      ) {
        message = "All hands complete. Dealer's turn starting...";
      }
    }

    const currentHandActions = this.getHandActions(
      updatedHands[currentHandIndex] || updatedHands[0],
      state
    );

    // Calculate the additional bet amount for doubling
    const additionalBet = currentHand.bet; // The original bet amount (before doubling)

    return {
      ...state,
      playerHands: updatedHands,
      currentHandIndex,
      initialBet: state.initialBet * 2, // Update initialBet to reflect doubled amount for UI display
      gamePhase,
      message,
      canDouble: currentHandActions.canDouble,
      canSplit: currentHandActions.canSplit,
      canSurrender: currentHandActions.canSurrender,
      totalWagered: state.totalWagered + additionalBet,
    };
  }

  // Process HIT action logic (without dealing cards - for use with effect system)
  processHitLogic(state: GameState, newCard: Card): GameState {
    // Safety check for playerHands array
    if (!state.playerHands || state.playerHands.length === 0) {
      return {
        ...state,
        message: 'No player hands available',
        playerHands: state.playerHands || [], // Preserve the original playerHands array
      };
    }

    const currentHand = getCurrentHand(state);
    if (!currentHand) {
      return { ...state, message: 'No active hand found' };
    }

    if (currentHand.isStanding || currentHand.isBusted) {
      return state;
    }

    if (currentHand.isSplitAces) {
      return { ...state, message: 'Cannot hit on split aces' };
    }

    const updatedHand = {
      ...currentHand,
      cards: [...currentHand.cards, newCard],
    };

    if (this.isBusted(updatedHand.cards)) {
      updatedHand.isBusted = true;
      updatedHand.isStanding = true;
    } else if (this.calculateHandValue(updatedHand.cards) === 21) {
      updatedHand.isStanding = true;
    }

    const updatedHands = [...state.playerHands];
    let currentHandIndex = getCurrentHandIndex(state);
    updatedHands[currentHandIndex] = updatedHand;

    let gamePhase = state.gamePhase;
    let message = state.message;

    if (updatedHand.isBusted) {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;

        message = `Hand ${previousHandIndex + 1} busted. Playing hand ${
          nextActiveHandIndex + 1
        }.`;
      } else {
        message = 'Bust!';
      }
    } else if (
      updatedHand.isStanding &&
      this.calculateHandValue(updatedHand.cards) === 21
    ) {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;

        message = `Hand ${previousHandIndex + 1} stands on 21. Playing hand ${
          nextActiveHandIndex + 1
        }.`;
      } else {
        message = '21! Standing automatically.';
      }
    }

    const allHandsDone = areAllHandsComplete({
      ...state,
      playerHands: updatedHands,
    });
    if (allHandsDone) {
      gamePhase = GameStatePhaseType.PLAYING;
      if (
        !(
          updatedHand.isStanding &&
          this.calculateHandValue(updatedHand.cards) === 21
        )
      ) {
        message = "All hands complete. Dealer's turn starting...";
      }
    }

    const currentHandActions = this.getHandActions(
      updatedHands[currentHandIndex] || updatedHands[0],
      state
    );

    return {
      ...state,
      playerHands: updatedHands,
      currentHandIndex,
      gamePhase,
      message,
      canDouble: currentHandActions.canDouble,
      canSplit: currentHandActions.canSplit,
      canSurrender: currentHandActions.canSurrender,
    };
  }

  // Process STAND action
  processStand(state: GameState): GameState {
    const currentHand = getCurrentHand(state);
    if (!currentHand) {
      return { ...state, message: 'No active hand found' };
    }

    const updatedHands = [...state.playerHands];
    let currentHandIndex = getCurrentHandIndex(state);
    updatedHands[currentHandIndex].isStanding = true;

    const allHandsDone = areAllHandsComplete({
      ...state,
      playerHands: updatedHands,
    });

    let gamePhase = state.gamePhase;
    let message = state.message;

    if (allHandsDone) {
      gamePhase = GameStatePhaseType.PLAYING;
      message = "All hands complete. Dealer's turn starting...";
    } else {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;

        message = `Hand ${previousHandIndex + 1} standing. Playing hand ${
          nextActiveHandIndex + 1
        }.`;

        // If the next hand is a split hand with only 1 card, trigger CHECK_SPLIT_STATE
        const nextHand = updatedHands[nextActiveHandIndex];
        if (nextHand.isFromSplit && nextHand.cards.length === 1) {
          // This will be handled by the state machine's effect system
        }
      }
    }

    const currentHandActions = this.getHandActions(
      updatedHands[currentHandIndex] || updatedHands[0],
      state
    );

    return {
      ...state,
      playerHands: updatedHands,
      currentHandIndex,
      gamePhase,
      message,
      canDouble: currentHandActions.canDouble,
      canSplit: currentHandActions.canSplit,
      canSurrender: currentHandActions.canSurrender,
    };
  }

  // Process DOUBLE action
  processDouble(state: GameState): GameState {
    const currentHand = getCurrentHand(state);
    if (!currentHand) {
      return { ...state, message: 'No active hand found' };
    }

    if (!state.canDouble || currentHand.cards.length !== 2) {
      return state;
    }

    if (currentHand.isSplitAces) {
      return { ...state, message: 'Cannot double on split aces' };
    }

    // Check balance - need enough for the additional main bet (not including side bets)
    const additionalMainBet = currentHand.bet; // This is the original main bet amount
    if (state.balance < additionalMainBet) {
      return { ...state, message: 'Insufficient balance to double' };
    }

    const additionalBet = additionalMainBet;
    const updatedHand = {
      ...currentHand,
      bet: currentHand.bet * 2,
      isDoubled: true,
      isStanding: true,
    };

    if (this.isBusted(updatedHand.cards)) {
      updatedHand.isBusted = true;
    }

    const updatedHands = [...state.playerHands];
    let currentHandIndex = getCurrentHandIndex(state);
    updatedHands[currentHandIndex] = updatedHand;

    const allHandsDone = areAllHandsComplete({
      ...state,
      playerHands: updatedHands,
    });

    let gamePhase = state.gamePhase;
    let message = state.message;

    if (allHandsDone) {
      gamePhase = GameStatePhaseType.PLAYING;
      if (updatedHand.isBusted) {
        message = "Bust! All hands complete. Dealer's turn starting...";
      } else {
        message = "Double down complete. Dealer's turn starting...";
      }
    } else if (updatedHand.isBusted) {
      message = 'Bust!';
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;
        message = `Hand ${previousHandIndex + 1} busted. Playing hand ${
          nextActiveHandIndex + 1
        }.`;
      }
    } else {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        const previousHandIndex = currentHandIndex;
        currentHandIndex = nextActiveHandIndex;
        message = `Hand ${previousHandIndex + 1} doubled. Playing hand ${
          nextActiveHandIndex + 1
        }.`;

        // If the next hand is a split hand that needs its second card, mark it as needing a card
        const nextHand = updatedHands[currentHandIndex];
        if (nextHand.isFromSplit && nextHand.cards.length === 1) {
          updatedHands[currentHandIndex] = nextHand;
        }
      }
    }

    const currentHandActions = this.getHandActions(
      updatedHands[currentHandIndex] || updatedHands[0],
      state
    );

    return {
      ...state,
      playerHands: updatedHands,
      currentHandIndex,
      gamePhase,
      message,
      canDouble: currentHandActions.canDouble,
      canSplit: currentHandActions.canSplit,
      canSurrender: currentHandActions.canSurrender,
      totalWagered: state.totalWagered + additionalBet,
    };
  }

  // Process SPLIT action
  processSplit(state: GameState): GameState {
    const currentHand = getCurrentHand(state);

    if (!currentHand) {
      return { ...state, message: 'No active hand found' };
    }

    // Require exactly two cards on the active hand
    if (currentHand.cards.length !== 2) {
      return state;
    }

    // Enforce core split rules directly here to avoid relying on potentially stale state.canSplit.
    // 1) Respect maximum number of split hands
    if (state.playerHands.length >= GAME_MECHANICS.MAX_SPLIT_HANDS) {
      return {
        ...state,
        message: `Maximum of ${GAME_MECHANICS.MAX_SPLIT_HANDS} hands allowed`,
      };
    }

    // 2) Cards must be splittable by value (e.g. 7+7, A+A, 10+J, Q+K)
    if (!this.canSplitCards(currentHand.cards)) {
      return {
        ...state,
        message: 'Cannot split this hand',
      };
    }

    if (state.balance < currentHand.bet) {
      return { ...state, message: 'Insufficient balance to split' };
    }

    const isSplittingAces =
      currentHand.cards[0].rank === 'A' && currentHand.cards[1].rank === 'A';

    const hand1 = this.createHand(currentHand.bet, true, isSplittingAces);
    const hand2 = this.createHand(currentHand.bet, true, isSplittingAces);

    hand1.originalBet = currentHand.originalBet;
    hand2.originalBet = currentHand.originalBet;

    hand1.cards = [currentHand.cards[0]];
    hand2.cards = [currentHand.cards[1]];

    // For ace splits, both hands get their second cards immediately
    // For regular splits, only the first hand gets its second card initially

    const updatedHands = [...state.playerHands];
    updatedHands[state.currentHandIndex] = hand1;
    updatedHands.splice(state.currentHandIndex + 1, 0, hand2);

    const additionalBet = currentHand.bet;

    const canDoubleAfterSplit = !isSplittingAces;
    // Allow splitting again if total hands will be less than max (after this split, we'll have updatedHands.length hands)
    const canSplitAfterSplit =
      updatedHands.length < GAME_MECHANICS.MAX_SPLIT_HANDS;
    const canSurrenderAfterSplit = false;

    // Determine which hand to play next
    const currentHandIndex = getCurrentHandIndex(state);
    let message = 'Hand split. Playing first hand.';

    // The effect system will handle dealing cards to hands that need them

    // Check if all hands are complete after split
    const allHandsDone = areAllHandsComplete({
      ...state,
      playerHands: updatedHands,
    });
    if (allHandsDone) {
      message = "All hands complete. Dealer's turn starting...";
    }

    if (isSplittingAces) {
      return {
        ...state,
        playerHands: updatedHands,
        currentHandIndex: state.currentHandIndex, // Stay on first hand for aces
        message: 'Aces split. Both hands get one card and stand automatically.',
        isDealerDealing: allHandsDone,
        canDouble: false,
        canSplit: canSplitAfterSplit,
        canSurrender: canSurrenderAfterSplit,
        totalWagered: state.totalWagered + additionalBet,
      };
    }

    return {
      ...state,
      playerHands: updatedHands,
      currentHandIndex,
      message,
      isDealerDealing: allHandsDone,
      canDouble: canDoubleAfterSplit,
      canSplit: canSplitAfterSplit,
      canSurrender: canSurrenderAfterSplit,
      totalWagered: state.totalWagered + additionalBet,
    };
  }

  // Process SURRENDER action
  processSurrender(state: GameState): GameState {
    const currentHand = getCurrentHand(state);
    if (!currentHand) {
      return { ...state, message: 'No active hand found' };
    }

    if (!state.canSurrender || currentHand.cards.length !== 2) {
      return state;
    }

    if (currentHand.isFromSplit) {
      return { ...state, message: 'Cannot surrender after splitting' };
    }

    const updatedHand = {
      ...currentHand,
      isSurrendered: true,
      isStanding: true,
    };

    const updatedHands = [...state.playerHands];
    let currentHandIndex = getCurrentHandIndex(state);
    updatedHands[currentHandIndex] = updatedHand;

    // Surrender means player loses half their bet (gets 50% back)
    const surrenderRefund = currentHand.bet / 2;

    const allHandsDone = areAllHandsComplete({
      ...state,
      playerHands: updatedHands,
    });

    let gamePhase = state.gamePhase;
    let message = 'Hand surrendered';

    if (allHandsDone) {
      // For surrender, immediately finish the hand and reveal dealer's hole card
      gamePhase = GameStatePhaseType.FINISHED;
      message = 'Hand surrendered - Dealer reveals hole card';

      // Reveal dealer's hole card
      const revealedDealerHand = {
        ...state.dealerHand,
        cards: state.dealerHand.cards.map((card, index) =>
          index === 1 ? { ...card, isHidden: false } : card
        ),
      };

      // Calculate final results for surrendered hand
      const surrenderedHand = updatedHands[state.currentHandIndex];
      const finalHand = {
        ...surrenderedHand,
        result: 'SURRENDER',
        payout: surrenderRefund, // You get half your bet back
      };

      updatedHands[state.currentHandIndex] = finalHand;

      return {
        ...state,
        playerHands: updatedHands,
        dealerHand: revealedDealerHand,
        gamePhase,
        message,
        currentHandIndex,
        totalWon: state.totalWon, // No change to totalWon for surrender
        canDouble: false,
        canSplit: false,
        canSurrender: false,
      };
    } else {
      const nextActiveHandIndex = updatedHands.findIndex(
        (hand, index) =>
          index > currentHandIndex && !hand.isStanding && !hand.isBusted
      );
      if (
        nextActiveHandIndex !== -1 &&
        nextActiveHandIndex < updatedHands.length
      ) {
        currentHandIndex = nextActiveHandIndex;
        message = `Hand ${
          state.currentHandIndex + 1
        } surrendered. Playing hand ${currentHandIndex + 1}.`;
      }
    }

    const currentHandActions = this.getHandActions(
      updatedHands[currentHandIndex] || updatedHands[0],
      state
    );

    return {
      ...state,
      playerHands: updatedHands,
      currentHandIndex,
      gamePhase,
      message,
      canDouble: currentHandActions.canDouble,
      canSplit: currentHandActions.canSplit,
      canSurrender: currentHandActions.canSurrender,
    };
  }
}
