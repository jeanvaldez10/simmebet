import { useEffect, useState, useRef, useMemo } from 'react';
import { ResultModal } from './ResultModal';
import ShuffleModal from './ShuffleModal';
import { SideBetWinModal } from './SideBetWinModal';
import {
  GameState,
  GamePhaseType,
  GameActionType,
  GameResult,
  ShuffleVerification,
} from '@/types/games/blackjack/game';
import { optimizeChips } from '@/utils/games/blackjack/client/stateUtils';

interface GameModalsProps {
  gameState: GameState;
  width: number;
  height: number;
  isMobile: boolean;
  availableActions: {
    action: GameActionType;
    description: string;
  }[];
  shuffleVerification: ShuffleVerification | Record<string, never>;
  isActionInProgress?: boolean;
  isDealing?: boolean;
  shuffleModalOpen: boolean;
  setShuffleModalOpen: (open: boolean) => void;
}

export function GameModals({
  gameState,
  width,
  height,
  isMobile,
  shuffleModalOpen,
  setShuffleModalOpen,
  isActionInProgress = false,
  isDealing = false,
  shuffleVerification,
}: GameModalsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const currentResultRef = useRef<string | undefined>(undefined);

  const placedChips = useMemo(() => {
    const betAmount = gameState.pendingBet || gameState.initialBet;
    return betAmount > 0 ? optimizeChips(betAmount) : [];
  }, [gameState.pendingBet, gameState.initialBet]);

  // Open modal with delay when game finishes
  useEffect(() => {
    const isGameFinished = gameState.gamePhase === GamePhaseType.FINISHED;
    const hasResult = Boolean(gameState.result);
    const resultChanged = currentResultRef.current !== gameState.result;

    // When game finishes with a new result and dealing is complete
    if (
      isGameFinished &&
      hasResult &&
      resultChanged &&
      !isDealing &&
      !isActionInProgress
    ) {
      currentResultRef.current = gameState.result;

      // Delay opening modal to let user see the result
      const timer = setTimeout(() => {
        setModalOpen(true);
      }, 50);

      return () => clearTimeout(timer);
    }

    // Close modal when entering betting phase (new game)
    if (gameState.gamePhase === GamePhaseType.BETTING) {
      currentResultRef.current = undefined;
      setModalOpen(false);
    }
  }, [gameState.gamePhase, gameState.result, isDealing, isActionInProgress]);
  const status: 'BLACKJACK' | 'BUSTED' | undefined = useMemo(() => {
    const hasBJ = gameState.playerHands.some(
      (hand) => hand.isBlackjack && hand.cards.length === 2
    );
    const hasBusted = gameState.playerHands.some((hand) => hand.isBusted);

    return hasBJ ? 'BLACKJACK' : hasBusted ? 'BUSTED' : undefined;
  }, [gameState.playerHands]);

  // Check if any hand was surrendered
  const hasSurrendered = useMemo(() => {
    return gameState.playerHands.some((hand) => hand.isSurrendered);
  }, [gameState.playerHands]);

  // Calculate surrender refund chips (half of bet)
  const surrenderChips = useMemo(() => {
    if (!hasSurrendered) return undefined;
    const surrenderedHand = gameState.playerHands.find(
      (hand) => hand.isSurrendered
    );
    if (!surrenderedHand) return undefined;
    const surrenderRefund = surrenderedHand.bet / 2;
    return surrenderRefund > 0 ? optimizeChips(surrenderRefund) : undefined;
  }, [hasSurrendered, gameState.playerHands]);

  return (
    <>
      {/* Result Modal - Rendered immediately when game finishes */}
      {modalOpen && currentResultRef.current && (
        <ResultModal
          key={`result-${currentResultRef.current}`}
          isOpen={modalOpen}
          result={currentResultRef.current as GameResult}
          profit={gameState.gameProfit}
          totalWon={gameState.totalWon}
          chips={placedChips}
          centerX={width / 2}
          centerY={height / 2}
          isMobile={isMobile}
          isActionInProgress={isActionInProgress}
          status={status}
          isSurrendered={hasSurrendered}
          surrenderChips={surrenderChips}
          onClose={() => setModalOpen(false)}
        />
      )}
      {/* Shuffle Modal */}
      {shuffleModalOpen && (
        <ShuffleModal
          isOpen={shuffleModalOpen}
          centerX={width / 2}
          centerY={height / 2}
          onClose={() => setShuffleModalOpen(false)}
          lastDealerCards={gameState.dealerHand.cards}
          lastPlayerCards={gameState.playerHands && gameState.playerHands}
          isMobile={isMobile}
          shuffleVerification={shuffleVerification}
        />
      )}
    </>
  );
}

// Side Bet Win Modal - Must be rendered outside PixiJS Application since it uses HTML/React elements
export function SideBetWinModalWrapper({
  gameState,
  isDealing = false,
}: {
  gameState: GameState;
  isActionInProgress?: boolean;
  isDealing?: boolean;
}) {
  const [sidebetWinModalOpen, setSidebetWinModalOpen] = useState(false);
  const [delayPassed, setDelayPassed] = useState(false);
  const previousSidebetResultsRef = useRef<typeof gameState.sidebetResults>([]);

  // Show side bet win modal when side bet results appear (after initial deal)
  useEffect(() => {
    const hasNewSidebetResults =
      gameState.sidebetResults &&
      gameState.sidebetResults.length > 0 &&
      JSON.stringify(gameState.sidebetResults) !==
        JSON.stringify(previousSidebetResultsRef.current);

    // Only show if we're in PLAYING or ASK_INSURANCE phase (after initial deal)
    const isAfterInitialDeal =
      gameState.gamePhase === GamePhaseType.PLAYING ||
      gameState.gamePhase === GamePhaseType.ASK_INSURANCE;

    if (hasNewSidebetResults && isAfterInitialDeal) {
      previousSidebetResultsRef.current = gameState.sidebetResults;
      // Reset delay when new results appear
      setDelayPassed(false);
      setSidebetWinModalOpen(false);
    }
  }, [gameState.sidebetResults, gameState.gamePhase]);

  // Handle delay after dealing finishes
  useEffect(() => {
    const hasSidebetResults =
      gameState.sidebetResults && gameState.sidebetResults.length > 0;

    const isAfterInitialDeal =
      gameState.gamePhase === GamePhaseType.PLAYING ||
      gameState.gamePhase === GamePhaseType.ASK_INSURANCE;

    if (!isDealing && hasSidebetResults && isAfterInitialDeal && !delayPassed) {
      const timer = setTimeout(() => {
        setDelayPassed(true);
        setSidebetWinModalOpen(true);
      }, 2000); // 2 second delay
      return () => clearTimeout(timer);
    }
  }, [isDealing, gameState.sidebetResults, gameState.gamePhase, delayPassed]);

  if (
    !sidebetWinModalOpen ||
    !gameState.sidebetResults ||
    gameState.sidebetResults.length === 0
  ) {
    return null;
  }

  return (
    <SideBetWinModal
      sidebetResults={gameState.sidebetResults}
      onClose={() => setSidebetWinModalOpen(false)}
    />
  );
}
