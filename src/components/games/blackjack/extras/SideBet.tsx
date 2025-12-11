import { useRef, useState, useEffect, useMemo } from 'react';
import { Container, TextStyle } from 'pixi.js';
import { ChipStack } from '../chips/ChipSprite';
import { PixiDrawContainer, PixiSideBetContainer } from '../containers';
import {
  GameState,
  GamePhaseType,
  GameActionType,
  SidebetType,
  SidebetResultType,
  GameMode,
} from '@/types/games/blackjack/game';
import { optimizeChips } from '@/utils/games/blackjack/client/stateUtils';
import { playSound } from '@/utils/games/blackjack/client/sounds';
import { SwitchHandler } from './SiwtchHandler';

interface SideBetProps {
  gameState: GameState;
  position: { x: number; y: number };
  width: number;
  height: number;
  isMobile: boolean;
  onAction?: (action: GameActionType, amount?: number) => void;
  onSelectedSectionChange?: (section: 'main' | 'pair' | '21plus3') => void;
  onSwitchMode?: () => void;
  hideMainBetChips?: boolean;
}

export function SideBet({
  gameState,
  position,
  onSelectedSectionChange,
  onSwitchMode,
  hideMainBetChips = false,
  isMobile,
}: SideBetProps) {
  const chipRef = useRef<Container>(null);
  const [selectedSection, setSelectedSection] = useState<
    'main' | 'pair' | '21plus3'
  >('main');
  const previousGamePhaseRef = useRef<GamePhaseType>(gameState.gamePhase);

  // Track which side bets have lost and should animate out
  const [pairBetAnimateOut, setPairBetAnimateOut] = useState(false);
  const [twentyOnePlus3AnimateOut, setTwentyOnePlus3AnimateOut] =
    useState(false);
  const [shouldShowPairChips, setShouldShowPairChips] = useState(true);
  const [shouldShow21Plus3Chips, setShouldShow21Plus3Chips] = useState(true);

  // Track winning side bets and their winnings for animation
  const [pairWinningChips, setPairWinningChips] = useState<number[]>([]);
  const [twentyOnePlus3WinningChips, setTwentyOnePlus3WinningChips] = useState<
    number[]
  >([]);
  const [showPairWinnings, setShowPairWinnings] = useState(false);
  const [show21Plus3Winnings, setShow21Plus3Winnings] = useState(false);

  const previousSidebetResultsRef = useRef<typeof gameState.sidebetResults>([]);

  // Check if sidebet is enabled (only during betting phase)
  const isEnabled = gameState.gamePhase === GamePhaseType.BETTING;

  const pairBetChips = useMemo(() => {
    return optimizeChips(gameState.pairBet ?? 0);
  }, [gameState.pairBet]);

  const twentyOnePlusThreeBetChips = useMemo(() => {
    return optimizeChips(gameState.twentyOnePlusThreeBet ?? 0);
  }, [gameState.twentyOnePlusThreeBet]);

  const switchToText = useMemo(() => {
    return gameState.gameMode === GameMode.FREE_PLAY
      ? 'REAL MONEY'
      : 'FREE PLAY';
  }, [gameState.gameMode]);

  const handlePairClick = () => {
    if (!isEnabled) return;
    setSelectedSection('pair');
    onSelectedSectionChange?.('pair');
  };

  const handle21Plus3Click = () => {
    if (!isEnabled) return;
    setSelectedSection('21plus3');
    onSelectedSectionChange?.('21plus3');
  };

  const handleMainClick = () => {
    if (!isEnabled) return;
    setSelectedSection('main');
    onSelectedSectionChange?.('main');
  };

  // Reset to main when a new game starts (gameId changes or gamePhase resets to BETTING)
  useEffect(() => {
    const isNewGamePhase = previousGamePhaseRef.current !== gameState.gamePhase;
    const isBettingPhase = gameState.gamePhase === GamePhaseType.BETTING;

    if (isNewGamePhase && isBettingPhase) {
      setSelectedSection('main');
      onSelectedSectionChange?.('main');
      // Reset animation states for new game
      setPairBetAnimateOut(false);
      setTwentyOnePlus3AnimateOut(false);
      setShouldShowPairChips(true);
      setShouldShow21Plus3Chips(true);
      // Reset winning states
      setPairWinningChips([]);
      setTwentyOnePlus3WinningChips([]);
      setShowPairWinnings(false);
      setShow21Plus3Winnings(false);
      previousSidebetResultsRef.current = [];
    }
    previousGamePhaseRef.current = gameState.gamePhase;
  }, [gameState.gamePhase, onSelectedSectionChange]);

  // Convert payout amount to chip array (for visual representation)
  const payoutToChips = (payout: number): number[] => {
    const chips: number[] = [];
    let remaining = Math.floor(payout);

    // Break down into chip denominations
    const denominations = [100, 50, 25, 10, 5, 1];
    for (const denom of denominations) {
      while (remaining >= denom && chips.length < 10) {
        // Max 10 chips for display
        chips.push(denom);
        remaining -= denom;
      }
    }

    return chips;
  };

  // Detect when side bets win or lose and trigger animations
  useEffect(() => {
    const hasNewSidebetResults =
      gameState.sidebetResults &&
      gameState.sidebetResults.length > 0 &&
      JSON.stringify(gameState.sidebetResults) !==
        JSON.stringify(previousSidebetResultsRef.current);

    if (hasNewSidebetResults) {
      previousSidebetResultsRef.current = gameState.sidebetResults;

      // Add delay before revealing sidebet results to wait for card dealing animation
      const delay = 2000;
      const timer = setTimeout(() => {
        // Check each side bet result
        gameState.sidebetResults.forEach((result) => {
          if (result.result === SidebetResultType.LOSE) {
            // Trigger fade-out animation for losing bets
            if (result.type === SidebetType.PAIR) {
              setPairBetAnimateOut(true);
              // Hide chips after animation completes (500ms fade + 100ms buffer)
              setTimeout(() => {
                setShouldShowPairChips(false);
              }, 600);
            } else if (result.type === SidebetType.TWENTY_ONE_PLUS_THREE) {
              setTwentyOnePlus3AnimateOut(true);
              // Hide chips after animation completes (500ms fade + 100ms buffer)
              setTimeout(() => {
                setShouldShow21Plus3Chips(false);
              }, 600);
            }
          } else if (
            result.result === SidebetResultType.WIN &&
            result.profit &&
            result.profit > 0
          ) {
            // Show winning chips animating in for winning bets
            const winningChips = payoutToChips(result.payout || 0);

            if (result.type === SidebetType.PAIR) {
              setPairWinningChips(winningChips);
              setShowPairWinnings(true);
            } else if (result.type === SidebetType.TWENTY_ONE_PLUS_THREE) {
              setTwentyOnePlus3WinningChips(winningChips);
              setShow21Plus3Winnings(true);
            }
            playSound('game-win-3', 0.5);
          }
        });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [gameState.sidebetResults]);

  // Notify parent of initial selection
  useEffect(() => {
    onSelectedSectionChange?.(selectedSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - we want to notify of initial 'main' selection

  // Calculate bet amounts for each section using same logic as BetInfoDisplay
  const betAmounts = useMemo(() => {
    // Calculate main bet using same logic as BetInfoDisplay

    // Get pair bet amount from sidebetResults if available, otherwise use gameState.pairBet
    const pairResult = gameState.sidebetResults?.find(
      (r) => r.type === SidebetType.PAIR
    );
    const pairBetAmount = pairResult?.amount ?? gameState.pairBet ?? 0;

    // Get 21+3 bet amount from sidebetResults if available, otherwise use gameState.twentyOnePlusThreeBet
    const twentyOnePlusThreeResult = gameState.sidebetResults?.find(
      (r) => r.type === SidebetType.TWENTY_ONE_PLUS_THREE
    );
    const twentyOnePlusThreeBetAmount =
      twentyOnePlusThreeResult?.amount ?? gameState.twentyOnePlusThreeBet ?? 0;

    const baseMainBet =
      gameState.gamePhase === GamePhaseType.BETTING
        ? gameState.pendingBet
        : gameState.totalWagered - pairBetAmount - twentyOnePlusThreeBetAmount;

    return {
      main: baseMainBet,
      pair: pairBetAmount,
      '21plus3': twentyOnePlusThreeBetAmount,
    };
  }, [
    gameState.gamePhase,
    gameState.pendingBet,
    gameState.totalWagered,
    gameState.sidebetResults,
    gameState.pairBet,
    gameState.twentyOnePlusThreeBet,
  ]);

  // Calculate chips on the fly from bet amounts
  const placedChips = useMemo(() => {
    return optimizeChips(betAmounts.main);
  }, [betAmounts.main]);

  const selectedBetAmount = betAmounts[selectedSection];

  // Calculate scale factor for mobile
  const scaleFactor = isMobile ? 140 / 200 : 1;

  // Scale dimensions but not text
  const dimensions = {
    sideBetWidth: 120 * scaleFactor,
    sideBetHeight: 52.5 * scaleFactor,
    sideBetOffsetX: 63 * scaleFactor,
    sideBetOffsetY: 12 * scaleFactor,
    topOffsetY: -52.5 * scaleFactor,
    switchWidth: 116 * scaleFactor,
    switchHeight: 58 * scaleFactor,
    switchY: 78 * scaleFactor,
    centerWidth: 75 * scaleFactor,
    centerHeight: 75 * scaleFactor,
    centerY: 10 * scaleFactor,
    chipScale: 0.08 * scaleFactor,
    centerChipScale: 0.1 * scaleFactor,
    chipOffsetY: -4 * scaleFactor,
  };

  return (
    <pixiContainer
      width={200 * scaleFactor}
      height={200 * scaleFactor}
      x={position.x}
      y={position.y}
    >
      {/* Betting Display - Shows bet amount for selected section */}
      <PixiSideBetContainer
        width={dimensions.sideBetWidth}
        height={dimensions.sideBetHeight}
        x={0}
        y={dimensions.topOffsetY}
        zIndex={1000}
      >
        <PixiDrawContainer
          width={62 * scaleFactor}
          height={24 * scaleFactor}
          x={0}
          y={0}
        >
          <pixiText
            text={`$${selectedBetAmount}`}
            anchor={0.5}
            x={0}
            y={1.5 * scaleFactor}
            style={STYLES.bet}
            resolution={2}
          />
        </PixiDrawContainer>
      </PixiSideBetContainer>
      {/* 21+3 Display - clickable during betting */}
      <PixiSideBetContainer
        width={dimensions.sideBetWidth}
        height={dimensions.sideBetHeight}
        rotation={89.54621439448148}
        x={dimensions.sideBetOffsetX}
        y={dimensions.sideBetOffsetY}
        interactive={isEnabled}
        pointerdown={handle21Plus3Click}
        pointer_down_available={isEnabled}
        highlighted={isEnabled && selectedSection === '21plus3'}
        zIndex={1001}
      >
        {/* Show chips if bet is placed and they should be visible */}
        {gameState.twentyOnePlusThreeBet > 0 && shouldShow21Plus3Chips ? (
          <ChipStack
            chips={twentyOnePlusThreeBetChips}
            x={0}
            y={dimensions.chipOffsetY}
            scale={dimensions.chipScale}
            animateIn={false}
            animateOut={twentyOnePlus3AnimateOut}
            ref={chipRef}
          />
        ) : (
          // Always show text label when chips aren't visible
          <pixiText
            text={'21+3'}
            anchor={0.5}
            x={0}
            y={0}
            rotation={91.13446401379633}
            style={STYLES.betText}
            resolution={2}
          />
        )}

        {/* Show winning chips animating in when side bet wins - stacked on top */}
        {show21Plus3Winnings && twentyOnePlus3WinningChips.length > 0 && (
          <ChipStack
            chips={twentyOnePlus3WinningChips}
            x={0}
            y={dimensions.chipOffsetY}
            scale={dimensions.chipScale}
            animateIn={true}
            animateOut={false}
            ref={chipRef}
          />
        )}
      </PixiSideBetContainer>
      {/* BET BEHIND */}
      <SwitchHandler
        width={dimensions.switchWidth}
        height={dimensions.switchHeight}
        x={0}
        y={dimensions.switchY}
        interactive={true}
        rotation={Math.PI * 2}
        onClick={onSwitchMode}
      >
        <pixiText
          text={'SWITCH TO'}
          anchor={0.5}
          x={0}
          y={-8 * scaleFactor}
          style={STYLES.switchText}
          resolution={10}
        />
        <pixiText
          text={switchToText}
          anchor={0.5}
          x={0}
          y={4 * scaleFactor}
          style={STYLES.switchText}
          resolution={10}
        />
      </SwitchHandler>

      {/* Pair Display - clickable during betting */}
      <PixiSideBetContainer
        width={dimensions.sideBetWidth}
        height={dimensions.sideBetHeight}
        rotation={-89.54621439448148}
        x={-dimensions.sideBetOffsetX}
        y={dimensions.sideBetOffsetY}
        interactive={isEnabled}
        pointerdown={handlePairClick}
        pointer_down_available={isEnabled}
        highlighted={isEnabled && selectedSection === 'pair'}
        zIndex={1001}
      >
        {/* Show chips if bet is placed and they should be visible */}
        {gameState.pairBet > 0 && shouldShowPairChips ? (
          <ChipStack
            chips={pairBetChips}
            x={0}
            y={dimensions.chipOffsetY}
            scale={dimensions.chipScale}
            animateIn={false}
            animateOut={pairBetAnimateOut}
            ref={chipRef}
          />
        ) : (
          // Always show text label when chips aren't visible
          <pixiText
            text={'PAIR'}
            anchor={0.5}
            x={0}
            y={0}
            rotation={91.13446401379633}
            style={STYLES.betText}
            resolution={2}
          />
        )}

        {/* Show winning chips animating in when side bet wins - stacked on top */}
        {showPairWinnings && pairWinningChips.length > 0 && (
          <ChipStack
            chips={pairWinningChips}
            x={0}
            y={dimensions.chipOffsetY}
            scale={dimensions.chipScale}
            animateIn={true}
            animateOut={false}
            ref={chipRef}
          />
        )}
      </PixiSideBetContainer>
      {/* Chip Display Always visible in center like original */}
      <PixiSideBetContainer
        width={dimensions.centerWidth}
        height={dimensions.centerHeight}
        x={0}
        y={dimensions.centerY}
        text="chips"
        pointerdown={handleMainClick}
        interactive={isEnabled}
        pointer_down_available={isEnabled}
        highlighted={isEnabled && selectedSection === 'main'}
        zIndex={1001}
      >
        {placedChips.length > 0 && !hideMainBetChips ? (
          <ChipStack
            chips={placedChips}
            x={0}
            y={0}
            scale={dimensions.centerChipScale}
            animateIn={false}
            ref={chipRef}
          />
        ) : (
          <pixiText
            text={'+'}
            anchor={0.5}
            x={0}
            y={3 * scaleFactor}
            style={STYLES.betAvailable}
          />
        )}
      </PixiSideBetContainer>
    </pixiContainer>
  );
}

// Create TextStyles for sidebet
const STYLES = {
  bet: new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: 14,
    fill: '#ffffff',
    align: 'center',
    letterSpacing: 1,
    dropShadow: {
      color: '#00000080',
      distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
      angle: Math.atan2(1.5, 1.5),
      blur: 0,
    },
  }),
  betText: new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: 10,
    fill: '#ffffff',
    align: 'center',
    letterSpacing: 1,
    fontWeight: '500',
    dropShadow: {
      color: '#00000080',
      distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
      angle: Math.atan2(1.5, 1.5),
      blur: 0,
    },
  }),
  switchText: new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: 8,
    fill: '#000000',
    align: 'center',
    letterSpacing: 1,
    fontWeight: '500',
    wordWrap: true,
  }),
  betAvailable: new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: 32,
    lineHeight: 32,
    fill: '#ffffff',
    align: 'center',
    letterSpacing: 1,
    fontWeight: '500',
    dropShadow: {
      color: '#00000080',
      distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
      angle: Math.atan2(1.5, 1.5),
      blur: 0,
    },
  }),
};
