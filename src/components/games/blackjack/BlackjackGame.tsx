'use client';

import { ENABLE_BLACKJACK_DEV_TOOLS } from '@/constants';
import {
  BlackjackGameProvider,
  useBlackjackGame,
} from '@/contexts/BlackjackGameContext';
import { useGameState } from '@/hooks/games/blackjack/useGameState';
import { GameMode } from '@/types/games/blackjack/game';
import { useState } from 'react';
import { GameShell } from '../common/GameShell';
import { BlackjackCanvas } from './canvas/BlackjackCanvas';
import { GameStateSelector } from './dev/GameStateSelector';
import { SoundTester } from './dev/SoundTester';
import { GameModeModal } from './modals/GameModeModal';
import { useAuthContext } from '@/context/AuthProvider';
import useHeaderModal from '@/hooks/use-header-modal';

function BlackjackGameInner({ onSwitchMode }: { onSwitchMode: () => void }) {
  const { setGameStateDirectly, gameState } = useBlackjackGame();

  return (
    <GameShell
      CanvasComponent={BlackjackCanvas}
      onSwitchMode={onSwitchMode}
      balance={gameState.balance}
      devToolsContent={
        ENABLE_BLACKJACK_DEV_TOOLS ? (
          <>
            <GameStateSelector onSelectState={setGameStateDirectly} />
            <SoundTester />
          </>
        ) : null
      }
    />
  );
}

function BlackjackGameWithMode({
  gameMode,
  setMode,
}: {
  gameMode: GameMode;
  setMode: () => void;
}) {
  const gameState = useGameState(gameMode);

  return (
    <BlackjackGameProvider value={gameState}>
      <BlackjackGameInner onSwitchMode={setMode} />
    </BlackjackGameProvider>
  );
}

export default function BlackjackGame() {
  const [modeSelected, setModeSelected] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const { isAuthenticated } = useAuthContext();
  const { setAuthModal } = useHeaderModal();

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    setModeSelected(true);
  };

  const handleSwitchMode = () => {
    if (!isAuthenticated) {
      setAuthModal('login');
      return;
    }
    setGameMode(
      gameMode === GameMode.FREE_PLAY ? GameMode.REAL_MONEY : GameMode.FREE_PLAY
    );
  };

  // Hide header/ticker when game mode is selected
  // useEffect(() => {
  //   if (modeSelected) {
  //     setGameActive(true);
  //   } else {
  //     setGameActive(false);
  //   }

  //   // Cleanup: show header/ticker when component unmounts
  //   return () => {
  //     setGameActive(false);
  //   };
  // }, [modeSelected, setGameActive]);

  return (
    <>
      {/* Mode selection modal - always shows on mount */}
      {!modeSelected && <GameModeModal onSelect={handleModeSelect} />}

      {/* Game only renders after mode selection */}
      {modeSelected && gameMode && (
        <BlackjackGameWithMode gameMode={gameMode} setMode={handleSwitchMode} />
      )}
    </>
  );
}
