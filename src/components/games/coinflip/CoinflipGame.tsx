'use client';
import { useState } from 'react';
import { CoinflipCanvas } from './canvas/CoinflipCanvas';
import { CoinflipGameProvider } from '@/contexts/CoinflipGameContext';
import { useGameState } from '@/hooks/games/coinflip/useGameState';
import { GameShell } from '../common/GameShell';
import { GameModeModal } from './modals/GameModeModal';
import { GameMode } from '@/types/games/coinflip/game';
import { useAuthContext } from '@/context/AuthProvider';
import useHeaderModal from '@/hooks/use-header-modal';

function CoinflipGameWithMode({
  gameMode,
  setMode,
}: {
  gameMode: GameMode;
  setMode: () => void;
}) {
  const gameState = useGameState(gameMode);

  return (
    <CoinflipGameProvider value={gameState}>
      <GameShell
        CanvasComponent={CoinflipCanvas}
        balance={gameState.gameState.balance}
        onSwitchMode={setMode}
      />
    </CoinflipGameProvider>
  );
}

export default function CoinflipGame() {
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
        <CoinflipGameWithMode gameMode={gameMode} setMode={handleSwitchMode} />
      )}
    </>
  );
}
