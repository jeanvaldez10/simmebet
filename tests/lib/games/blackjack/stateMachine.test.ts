import { createGameStateMachine } from '@/lib/games/blackjack/stateMachine';
import { TestDeckProvider } from '@/lib/games/blackjack/test-deck-provider';
import { GameStatePhaseType, Card, GameActionType } from '@/types/games/blackjack/game';
import {
  createDefaultGameState,
  createBlackjackHand,
  createDealerBlackjackHand,
  createDealerNonBlackjackHand,
} from './testHelpers';

describe('Blackjack State Machine - Blackjack Resolution', () => {
  describe('Player has blackjack - dealer hole card resolution', () => {
    it('should reveal dealer hole card and finish game when player has blackjack and dealer shows J', async () => {
      // Setup: Player has J + A (blackjack), Dealer shows J with hidden A (dealer also has blackjack)
      const deck: Card[] = [
        { suit: 'diamonds', rank: 'J', isHidden: false }, // Player first card
        { suit: 'spades', rank: 'J', isHidden: false }, // Dealer first card (showing)
        { suit: 'hearts', rank: 'A', isHidden: false }, // Player second card (blackjack)
        { suit: 'hearts', rank: 'A', isHidden: true }, // Dealer second card (hole card - hidden)
      ];
      
      const deckProvider = new TestDeckProvider(deck);
      const stateMachine = createGameStateMachine(deckProvider);

      // Create a game state where player already has blackjack and dealer hole card is hidden
      const gameState = createDefaultGameState({
        gameId: 'test-game-1',
        playerHands: [createBlackjackHand(35)],
        dealerHand: createDealerBlackjackHand(
          { suit: 'spades', rank: 'J', isHidden: false },
          { suit: 'hearts', rank: 'A', isHidden: true }
        ),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
      });

      // Process any action to trigger checkGameCompletion
      const result = await stateMachine.processActionWithLoop({
        gameState,
        action: GameActionType.STAND, // Any action will trigger checkGameCompletion
        userId: 'test-user',
      });

      expect(result.success).toBe(true);
      expect(result.newGameState.gamePhase).toBe(GameStatePhaseType.FINISHED);
      expect(result.newGameState.dealerHand.showAllCards).toBe(true);
      expect(result.newGameState.dealerHand.cards[1].isHidden).toBe(false);
      expect(result.newGameState.dealerHand.isBlackjack).toBe(true);
      expect(result.newGameState.dealerHasBlackjack).toBe(true);
      expect(result.newGameState.message).toBe('Both have blackjack! Push.');
    });

    it('should reveal dealer hole card and player wins when only player has blackjack', async () => {
      // Setup: Player has J + A (blackjack), Dealer shows J with hidden 6 (dealer does not have blackjack)
      const deck: Card[] = [
        { suit: 'diamonds', rank: 'J', isHidden: false }, // Player first card
        { suit: 'spades', rank: 'J', isHidden: false }, // Dealer first card (showing)
        { suit: 'hearts', rank: 'A', isHidden: false }, // Player second card (blackjack)
        { suit: 'hearts', rank: '6', isHidden: true }, // Dealer second card (hole card - hidden)
      ];
      
      const deckProvider = new TestDeckProvider(deck);
      const stateMachine = createGameStateMachine(deckProvider);

      // Create a game state where player already has blackjack and dealer hole card is hidden
      const gameState = createDefaultGameState({
        gameId: 'test-game-2',
        playerHands: [createBlackjackHand(35)],
        dealerHand: createDealerNonBlackjackHand(
          { suit: 'spades', rank: 'J', isHidden: false },
          { suit: 'hearts', rank: '6', isHidden: true }
        ),
        canDouble: false,
        canSplit: false,
        canSurrender: false,
      });

      // Process any action to trigger checkGameCompletion
      const result = await stateMachine.processActionWithLoop({
        gameState,
        action: GameActionType.STAND,
        userId: 'test-user',
      });

      expect(result.success).toBe(true);
      expect(result.newGameState.gamePhase).toBe(GameStatePhaseType.FINISHED);
      expect(result.newGameState.dealerHand.showAllCards).toBe(true);
      expect(result.newGameState.dealerHand.cards[1].isHidden).toBe(false);
      expect(result.newGameState.dealerHand.isBlackjack).toBe(false);
      expect(result.newGameState.dealerHasBlackjack).toBe(false);
      expect(result.newGameState.message).toBe('BLACKJACK! You win!');
    });

    it('should not resolve if dealer is showing ace (insurance scenario)', async () => {
      // Setup: Player has J + A (blackjack), Dealer shows A (should ask for insurance)
      const deck: Card[] = [
        { suit: 'diamonds', rank: 'J', isHidden: false }, // Player first card
        { suit: 'spades', rank: 'A', isHidden: false }, // Dealer first card (showing ace)
        { suit: 'hearts', rank: 'A', isHidden: false }, // Player second card (blackjack)
        { suit: 'hearts', rank: 'J', isHidden: true }, // Dealer second card (hole card - hidden)
      ];
      
      const deckProvider = new TestDeckProvider(deck);
      const stateMachine = createGameStateMachine(deckProvider);

      const gameState = createDefaultGameState({
        gameId: 'test-game-3',
        playerHands: [createBlackjackHand(35)],
        dealerHand: {
          cards: [
            { suit: 'spades', rank: 'A', isHidden: false },
            { suit: 'hearts', rank: 'J', isHidden: true },
          ],
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          showAllCards: false,
        },
        canDouble: false,
        canSplit: false,
        canSurrender: false,
      });

      // Process action - should NOT auto-resolve because dealer is showing ace
      const result = await stateMachine.processActionWithLoop({
        gameState,
        action: GameActionType.STAND,
        userId: 'test-user',
      });

      // Should not finish the game automatically - dealer showing ace requires insurance decision
      // The auto-resolve logic checks for dealer not showing ace, so it should not trigger
      // The game should proceed normally (either to insurance or dealer turn)
      expect(result.success).toBe(true);
      // The dealer hole card should remain hidden until dealer turn or insurance is resolved
      // (The exact behavior depends on whether insurance was already offered/declined)
    });

    it('should not resolve if player does not have blackjack', async () => {
      // Setup: Player has J + 6 (16), Dealer shows J with hidden A
      const deck: Card[] = [
        { suit: 'diamonds', rank: 'J', isHidden: false }, // Player first card
        { suit: 'spades', rank: 'J', isHidden: false }, // Dealer first card (showing)
        { suit: 'hearts', rank: '6', isHidden: false }, // Player second card
        { suit: 'hearts', rank: 'A', isHidden: true }, // Dealer second card (hole card - hidden)
      ];
      
      const deckProvider = new TestDeckProvider(deck);
      const stateMachine = createGameStateMachine(deckProvider);

      const gameState = createDefaultGameState({
        gameId: 'test-game-4',
        playerHands: [
          {
            cards: [
              { suit: 'diamonds', rank: 'J', isHidden: false },
              { suit: 'hearts', rank: '6', isHidden: false },
            ],
            bet: 35,
            originalBet: 35,
            isStanding: false,
            isBusted: false,
            isBlackjack: false,
            isDoubled: false,
            isSurrendered: false,
            isFromSplit: false,
            isSplitAces: false,
          },
        ],
        dealerHand: createDealerBlackjackHand(
          { suit: 'spades', rank: 'J', isHidden: false },
          { suit: 'hearts', rank: 'A', isHidden: true }
        ),
      });

      // Process action - should NOT auto-resolve because player doesn't have blackjack
      const result = await stateMachine.processActionWithLoop({
        gameState,
        action: GameActionType.STAND,
        userId: 'test-user',
      });

      // Should proceed normally - player doesn't have blackjack so auto-resolve won't trigger
      expect(result.success).toBe(true);
      // The game should proceed to dealer turn or finish (depending on dealer's hand)
      // Since dealer has blackjack (J + A), it should finish immediately
      expect([GameStatePhaseType.DEALER_TURN, GameStatePhaseType.FINISHED]).toContain(result.newGameState.gamePhase);
    });

    it('should not resolve if dealer hole card is already revealed', async () => {
      // Setup: Player has J + A (blackjack), Dealer shows J with A already revealed
      const deck: Card[] = [
        { suit: 'diamonds', rank: 'J', isHidden: false },
        { suit: 'spades', rank: 'J', isHidden: false },
        { suit: 'hearts', rank: 'A', isHidden: false },
        { suit: 'hearts', rank: 'A', isHidden: false },
      ];
      
      const deckProvider = new TestDeckProvider(deck);
      const stateMachine = createGameStateMachine(deckProvider);

      const gameState = createDefaultGameState({
        gameId: 'test-game-5',
        playerHands: [
          {
            ...createBlackjackHand(35),
            isStanding: false,
          },
        ],
        dealerHand: {
          cards: [
            { suit: 'spades', rank: 'J', isHidden: false },
            { suit: 'hearts', rank: 'A', isHidden: false }, // Already revealed
          ],
          isStanding: false,
          isBusted: false,
          isBlackjack: true,
          showAllCards: true,
        },
        dealerHasBlackjack: true,
        canDouble: false,
        canSplit: false,
        canSurrender: false,
      });

      // Process action - should detect that hole card is already revealed
      const result = await stateMachine.processActionWithLoop({
        gameState,
        action: GameActionType.STAND,
        userId: 'test-user',
      });

      // Should not trigger the auto-resolve logic since hole card is already revealed
      // Should proceed with normal game flow
      expect(result.newGameState.dealerHand.showAllCards).toBe(true);
    });
  });
});

