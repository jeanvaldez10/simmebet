# 🃏 Blackjack Rules & Side Bet Specification

### For API Implementation

This document defines the **complete rule set** your API must follow to implement Blackjack, including **21+3** and **Perfect Pairs** side bets.  
Everything here is deterministic, unambiguous, and designed for engine-level logic.

---

# 1. Overview

Blackjack is a player-vs-dealer card game where the objective is to achieve a hand total **closer to 21** than the dealer without busting. This spec describes all rules required for a server-authoritative Blackjack engine.

---

# 2. Card Model

## 2.1 Card Values

- 2–10 = face value
- J, Q, K = 10
- Ace (A) = **1 or 11**, whichever maximizes the hand without busting

## 2.2 Deck Structure

- Standard 52-card decks
- Typical shoes: **4–8 decks**
- Suits matter only for **side bets**, not hand totals

---

# 3. Game Flow

1. Player places **main bet** and any **side bets**
2. Deal initial cards:
   - Player: 2 face-up cards
   - Dealer: 1 face-up card + 1 face-down card
3. Evaluate **side bets** immediately
4. Player acts (hit, stand, double, split)
5. Dealer reveals hole card
6. Dealer draws according to house rules
7. Resolve all outcomes and payouts

---

# 4. Blackjack Rules

## 4.1 Natural Blackjack

A “Blackjack” is when the player’s **initial two cards** total **21** (Ace + 10-value card).

### Payouts:

- Player Blackjack vs dealer non-Blackjack → **3:2** (configurable)
- Player Blackjack vs dealer Blackjack → **Push**
- Dealer Blackjack vs player non-Blackjack → **Dealer wins**

## 4.2 Soft vs Hard Hands

- **Soft hand** contains an Ace counted as 11
- **Hard hand** contains an Ace counted as 1 or no Ace at all

The engine must dynamically re-score hands as new cards are drawn.

---

# 5. Player Actions

## 5.1 Hit

Take another card.

## 5.2 Stand

Take no more cards.

## 5.3 Double Down

- Player doubles the initial bet
- Receives **exactly one** additional card
- Hand automatically stands

## 5.4 Split

Allowed if the two initial cards have the **same rank**.

Rules:

- Creates **two separate hands**
- Each hand receives an additional card
- Player plays out each hand independently
- **Split Aces**:
  - Each Ace receives **one card only**
  - No additional hits allowed (most common rule)

## 5.5 Resplitting

Many casinos allow **up to 3 or 4 total hands**.  
This should be configurable.

## 5.6 Double After Split (DAS)

Configurable rule:

- If enabled, player may double on split hands (except usually on split Aces)

## 5.7 Surrender (optional)

- Player forfeits **half** the main bet
- Valid only as **first action**
- Ends the round immediately
- Should be a configurable rule

---

# 6. Dealer Rules

- Dealer must **Hit** until total is **17 or higher**
- House rules decide whether dealer:
  - Hits soft 17 (**H17**)
  - Stands on soft 17 (**S17**)

This must be configurable.

---

# 7. Round Resolution (Main Bet)

Once both sides finish:

1. Player busts → **Dealer wins**
2. Dealer busts → **Player wins**
3. Higher total → wins
4. Equal total → **Push**
5. Natural Blackjack beats all non-Blackjacks
6. Standard win payout = **1:1**

---

# 8. Side Bets

Side bets are evaluated **immediately after the initial deal**, before any player actions.

---

# 8.1 21+3 Side Bet

### Inputs For 21+3:

- Player’s **first two cards**
- Dealer's **upcard**

These 3 cards form a mini poker hand.

### Winning Hands (Ranked Highest → Lowest):

1. **Straight Flush**

   - Three consecutive ranks
   - All same suit

2. **Three of a Kind**

   - All three cards same rank

3. **Straight**

   - Three consecutive ranks, mixed suits
   - Ace can be **high** (Q-K-A) or **low** (A-2-3)
   - No wraparound straights (K-A-2 invalid)

4. **Flush**
   - All three cards same suit

Anything else → loss

### Example Payouts (Configurable)

- Straight Flush → **40:1**
- Three of a Kind → **30:1**
- Straight → **10:1**
- Flush → **5:1**

---

# 8.2 Perfect Pairs Side Bet

### Inputs:

- Player’s **first two cards only**

### Winning Outcomes:

1. **Perfect Pair**

   - Same rank
   - Same suit

2. **Colored Pair**

   - Same rank
   - Same color (red/red or black/black)
   - Different suits

3. **Mixed Pair**
   - Same rank
   - Different colors

If ranks differ → loss.

### Example Payouts (Configurable)

- Perfect Pair → **25:1**
- Colored Pair → **12:1**
- Mixed Pair → **6:1**

---

# 9. Side Bet Payout Calculation

Each side bet result must expose:

- `hit: boolean`
- `type: string | null`
- `multiplier: number` (0 means no win)
- `profit = betAmount * multiplier`
- `totalReturn = betAmount + profit`

Side bets are **independent** of:

- Player busting
- Dealer busting
- Dealer Blackjack (except initial check)

---

# 10. Multi-Hand Logic (Splits)

After split:

- Each hand is resolved **separately** against the dealer
- Only the _original_ hand can trigger side bets
- Split-created hands do **not** have 21+3 or Perfect Pair bets

Each hand must:

- Keep its own bet amount
- Keep its own state (standing, busted, doubled, etc.)
- Follow all main-hand rules

---

# 11. Configurable Options

The engine must support:

### Table Rules

- Dealer hits soft 17 (H17) or stands (S17)
- Blackjack payout (3:2, 6:5, etc.)
- Double allowed on any two cards (yes/no)
- Double after split (yes/no)
- Number of resplits allowed
- Split Aces hit allowed or not
- Surrender enabled (early or late)
- Number of decks in the shoe

### Side Bet Rules

- 21+3 payout table
- Perfect Pairs payout table

---

# 12. Required API Outputs per Round

Each round must return:

### Hand Data

- Player cards for each hand
- Dealer cards (including hole card & all draws)
- Total values (soft/hard)
- Bust flags
- Blackjack detection

### Outcomes

- Win / Lose / Push per hand
- Payouts for main bet
- Payouts for side bets
- Final balance adjustment

---

# 13. Edge Cases Engine Must Handle

- Ace recalculation dynamically
- Blackjack vs 21 (not the same)
- Player Blackjack vs Dealer Blackjack (push)
- Split Aces restricted hits
- Double after split rules
- Surrender timing rules
- Dealer peeks for Blackjack if showing Ace or 10-value
- Resplit limitations
- Multi-hand ordering (left-to-right)
- Correct straight logic for A-2-3 and Q-K-A only
- Flush depends solely on suit
- Push with equal totals except Blackjack rules

---

# 14. Summary Checklist

The API must be able to:

- [ ] Score hands with Ace logic
- [ ] Handle hit / stand / double / split / surrender
- [ ] Enforce split and resplit rules
- [ ] Apply dealer drawing rules (H17/S17)
- [ ] Resolve winnings for each hand
- [ ] Evaluate 21+3 side bets
- [ ] Evaluate Perfect Pairs side bets
- [ ] Handle multiple split hands
- [ ] Output correct payouts for all bets
- [ ] Support full configurability of table and payout rules

---

This file defines everything required for a complete, deterministic, casino-accurate Blackjack engine with side bets.
