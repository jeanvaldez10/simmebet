"use client";

import React from "react";
import { GameState, GamePhaseType, HandResultType, Card, SidebetType, SidebetResultType } from "@/types/games/blackjack/game";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameStateSelectorProps {
  onSelectState: (state: Partial<GameState>) => void;
}

// Predefined game states for testing
const gameStates = {
  betting: {
    name: "Betting Phase",
    category: "basic",
    state: {
      gamePhase: GamePhaseType.BETTING,
      playerHands: [],
      dealerHand: {
        cards: [],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      pendingBet: 0,
      message: "Place your bet",
    },
  },
  playerHas20: {
    name: "Player Has 20",
    category: "basic",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "Q", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Hit or Stand?",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  playerBlackjack: {
    name: "Player Blackjack",
    category: "basic",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "A", suit: "spades" } as Card,
            { rank: "K", suit: "hearts" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: true,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Blackjack!",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  playerBusted: {
    name: "Player Busted",
    category: "basic",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "Q", suit: "diamonds" } as Card,
            { rank: "5", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: true,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Bust! You lose $100",
      result: "LOSE" as const,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.LOSE,
          payout: 0,
          profit: -100,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  dealerBusted: {
    name: "Dealer Busted (Win)",
    category: "basic",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "9", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "10", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
          { rank: "5", suit: "hearts" } as Card,
        ],
        isStanding: false,
        isBusted: true,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Dealer busts! You win $200",
      result: "WIN" as const,
      balance: 27518,
      totalWon: 200,
      gameProfit: 100,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.WIN,
          payout: 200,
          profit: 100,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  push: {
    name: "Push (Tie)",
    category: "basic",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "9", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "Q", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: true,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Push! Your bet of $100 is returned",
      result: "PUSH" as const,
      balance: 27318,
      totalWon: 100,
      gameProfit: 0,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.PUSH,
          payout: 100,
          profit: 0,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  canSplit: {
    name: "Can Split (Pair of 8s)",
    category: "advanced",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "8", suit: "hearts" } as Card,
            { rank: "8", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "You can split your pair!",
      canDouble: true,
      canSplit: true,
      canSurrender: true,
    },
  },
  splitHands: {
    name: "Split Hands (2 Hands)",
    category: "advanced",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      currentHandIndex: 0,
      playerHands: [
        {
          cards: [
            { rank: "8", suit: "hearts" } as Card,
            { rank: "3", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
        {
          cards: [
            { rank: "8", suit: "diamonds" } as Card,
            { rank: "9", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Playing hand 1 of 2",
      canDouble: true,
      canSplit: false,
      canSurrender: false,
    },
  },
  splitAces: {
    name: "Split Aces",
    category: "advanced",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      currentHandIndex: 0,
      playerHands: [
        {
          cards: [
            { rank: "A", suit: "hearts" } as Card,
            { rank: "K", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: true,
        },
        {
          cards: [
            { rank: "A", suit: "spades" } as Card,
            { rank: "9", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: true,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Split aces complete - one card each",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  splitWin: {
    name: "Split Win (Both Hands Win)",
    category: "advanced",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      playerHands: [
        {
          cards: [
            { rank: "8", suit: "hearts" } as Card,
            { rank: "K", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
        {
          cards: [
            { rank: "8", suit: "diamonds" } as Card,
            { rank: "Q", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: true,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "9", suit: "spades" } as Card,
        ],
        isStanding: true,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Both hands win! You win $400",
      result: "WIN" as const,
      balance: 27518,
      totalWon: 400,
      gameProfit: 200,
      handResults: [
        {
          handIndex: 0,
          bet: 100,
          result: HandResultType.WIN,
          payout: 200,
          profit: 100,
          timestamp: new Date().toISOString(),
        },
        {
          handIndex: 1,
          bet: 100,
          result: HandResultType.WIN,
          payout: 200,
          profit: 100,
          timestamp: new Date().toISOString(),
        },
      ],
    },
  },
  canDouble: {
    name: "Can Double Down",
    category: "advanced",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "5", suit: "hearts" } as Card,
            { rank: "6", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "6", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Good spot to double down!",
      canDouble: true,
      canSplit: false,
      canSurrender: true,
    },
  },
  doubled: {
    name: "Doubled Down Hand",
    category: "advanced",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      playerHands: [
        {
          cards: [
            { rank: "5", suit: "hearts" } as Card,
            { rank: "6", suit: "diamonds" } as Card,
            { rank: "9", suit: "clubs" } as Card,
          ],
          bet: 200,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: true,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "6", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "You doubled down - total 20",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  insuranceOffered: {
    name: "Insurance Offered",
    category: "advanced",
    state: {
      gamePhase: GamePhaseType.ASK_INSURANCE,
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "9", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "A", suit: "clubs" } as Card,
          { rank: "?", suit: "hidden" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Dealer shows Ace. Insurance?",
      insuranceOffered: true,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  shuffle: {
    name: "SHUFFLE",
    category: "basic",
    state: {
      gamePhase: GamePhaseType.SHUFFLE,
      playerHands: [
        {
          cards: [
            { rank: "4", suit: "diamonds" } as Card,
            { rank: "5", suit: "diamonds" } as Card,
            { rank: "8", suit: "clubs" } as Card,
            { rank: "2", suit: "hearts" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "J", suit: "clubs" } as Card,
          { rank: "9", suit: "clubs" } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Dealer shows Ace. Insurance?",
      insuranceOffered: true,
      canDouble: false,
      canSplit: false,
      canSurrender: false,
    },
  },
  // Side Bet Test States
  sideBetPairWin: {
    name: "🎰 Side Bet: Perfect Pair Win",
    category: "sidebets",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      pairBet: 10,
      twentyOnePlusThreeBet: 0,
      sidebetResults: [
        {
          type: SidebetType.PAIR,
          amount: 10,
          result: SidebetResultType.WIN,
          payout: 250,
          profit: 240,
        },
      ],
      playerHands: [
        {
          cards: [
            { rank: "K", suit: "hearts" } as Card,
            { rank: "K", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "7", suit: "clubs" } as Card,
          { rank: "10", suit: "spades" } as Card,
        ],
        isStanding: true,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Perfect Pair! Side bet wins!",
    },
  },
  sideBet21Plus3Win: {
    name: "🎰 Side Bet: 21+3 Flush Win",
    category: "sidebets",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      pairBet: 0,
      twentyOnePlusThreeBet: 10,
      sidebetResults: [
        {
          type: SidebetType.TWENTY_ONE_PLUS_THREE,
          amount: 10,
          result: SidebetResultType.WIN,
          payout: 50,
          profit: 40,
        },
      ],
      playerHands: [
        {
          cards: [
            { rank: "7", suit: "hearts" } as Card,
            { rank: "9", suit: "hearts" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "5", suit: "hearts" } as Card,
          { rank: "10", suit: "spades" } as Card,
        ],
        isStanding: true,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "21+3 Flush! Side bet wins!",
    },
  },
  sideBetBothWin: {
    name: "🎰 Side Bet: Both Win!",
    category: "sidebets",
    state: {
      gamePhase: GamePhaseType.FINISHED,
      pairBet: 10,
      twentyOnePlusThreeBet: 10,
      sidebetResults: [
        {
          type: SidebetType.PAIR,
          amount: 10,
          result: SidebetResultType.WIN,
          payout: 60,
          profit: 50,
        },
        {
          type: SidebetType.TWENTY_ONE_PLUS_THREE,
          amount: 10,
          result: SidebetResultType.WIN,
          payout: 50,
          profit: 40,
        },
      ],
      playerHands: [
        {
          cards: [
            { rank: "Q", suit: "hearts" } as Card,
            { rank: "Q", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: true,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "K", suit: "hearts" } as Card,
          { rank: "7", suit: "spades" } as Card,
        ],
        isStanding: true,
        isBusted: false,
        isBlackjack: false,
        showAllCards: true,
      },
      message: "Both side bets win!",
    },
  },
  sideBetBothLose: {
    name: "🎰 Side Bet: Both Lose",
    category: "sidebets",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      pairBet: 0,
      twentyOnePlusThreeBet: 0,
      originalPairBet: 10,
      originalTwentyOnePlusThreeBet: 10,
      sidebetResults: [
        {
          type: SidebetType.PAIR,
          amount: 10,
          result: SidebetResultType.LOSE,
          payout: 0,
          profit: -10,
        },
        {
          type: SidebetType.TWENTY_ONE_PLUS_THREE,
          amount: 10,
          result: SidebetResultType.LOSE,
          payout: 0,
          profit: -10,
        },
      ],
      playerHands: [
        {
          cards: [
            { rank: "7", suit: "hearts" } as Card,
            { rank: "10", suit: "diamonds" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "K", suit: "clubs" } as Card,
          { rank: "5", suit: "spades", isHidden: true } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Side bets lost. Your turn.",
    },
  },
  sideBetMixed: {
    name: "🎰 Side Bet: Mixed Results",
    category: "sidebets",
    state: {
      gamePhase: GamePhaseType.PLAYING,
      pairBet: 10,
      twentyOnePlusThreeBet: 0,
      originalPairBet: 10,
      originalTwentyOnePlusThreeBet: 10,
      sidebetResults: [
        {
          type: SidebetType.PAIR,
          amount: 10,
          result: SidebetResultType.WIN,
          payout: 60,
          profit: 50,
        },
        {
          type: SidebetType.TWENTY_ONE_PLUS_THREE,
          amount: 10,
          result: SidebetResultType.LOSE,
          payout: 0,
          profit: -10,
        },
      ],
      playerHands: [
        {
          cards: [
            { rank: "J", suit: "spades" } as Card,
            { rank: "J", suit: "clubs" } as Card,
          ],
          bet: 100,
          originalBet: 100,
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          isDoubled: false,
          isSurrendered: false,
          isFromSplit: false,
          isSplitAces: false,
        },
      ],
      dealerHand: {
        cards: [
          { rank: "2", suit: "hearts" } as Card,
          { rank: "9", suit: "diamonds", isHidden: true } as Card,
        ],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      },
      message: "Pair wins! Your turn.",
    },
  },
};

export function GameStateSelector({ onSelectState }: GameStateSelectorProps) {
  console.log("🛠 GameStateSelector rendering");
  
  const handleChange = (value: string) => {
    if (value && gameStates[value as keyof typeof gameStates]) {
      onSelectState(gameStates[value as keyof typeof gameStates].state);
    }
  };

  // Group states by category
  const groupedStates = Object.entries(gameStates).reduce((acc, [key, config]) => {
    const category = config.category || "basic";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, ...config });
    return acc;
  }, {} as Record<string, Array<{ key: string; name: string; category?: string }>>);

  // Note: Parent component already checks ENABLE_BLACKJACK_DEV_TOOLS
  return (
    <UICard 
      className="fixed z-[100000] w-[320px] shadow-2xl"
      style={{
        top: "210px",
        left: "20px",
        pointerEvents: "auto",
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          🎮 Dev: Game States
          <Badge variant="outline" className="text-xs">
            {Object.keys(gameStates).length} states
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select test state..." />
          </SelectTrigger>
          <SelectContent className="z-[100001]">
            {Object.entries(groupedStates).map(([category, states]) => (
              <SelectGroup key={category}>
                <SelectLabel className="text-xs font-semibold uppercase text-muted-foreground">
                  {category === "basic" ? "🎲 Basic States" : category === "sidebets" ? "🎰 Side Bets" : category === "advanced" ? "⚡ Advanced" : category}
                </SelectLabel>
                {states.map(({ key, name }) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </UICard>
  );
}

