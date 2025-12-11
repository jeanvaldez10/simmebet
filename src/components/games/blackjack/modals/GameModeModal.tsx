'use client';

import { GameMode } from '@/types/games/blackjack/game';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { useAuthContext } from '@/context/AuthProvider';
import useHeaderModal from '@/hooks/use-header-modal';

interface GameModeModalProps {
  onSelect: (mode: GameMode) => void;
}

export function GameModeModal({ onSelect }: GameModeModalProps) {
  const { isAuthenticated, sessionStatus } = useAuthContext();
  const { setAuthModal } = useHeaderModal();
  const isAuthReady = sessionStatus !== 'loading';

  const handleFreePlayClick = () => {
    onSelect(GameMode.FREE_PLAY);
  };

  const handleRealMoneyClick = () => {
    if (!isAuthenticated) {
      setAuthModal('login');
      return;
    }
    onSelect(GameMode.REAL_MONEY);
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}} // No close button - user must select a mode
      width="max-w-xl"
      contentClassName="relative shadow-lg p-0 bg-transparent"
      className="rounded-3xl"
      showCloseButton={false}
      zIndex={50}
    >
      <div className="bg-[#16171E] rounded-3xl p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2
            id="game-mode-title"
            className="text-[32px] leading-tight font-semibold text-white mb-2"
          >
            Choose Game Mode
          </h2>
          <p className="text-[#FFFFFFA3] text-base">
            Select how you want to play
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="primary"
            onClick={handleFreePlayClick}
            fullWidth
            disabled={!isAuthReady}
            className="py-4"
          >
            Free Play
          </Button>

          <Button
            variant="secondary"
            onClick={handleRealMoneyClick}
            fullWidth
            disabled
            className="py-4"
          >
            Real Money
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-[#FFFFFF29]">
          <p className="text-xs text-[#FFFFFFA3] text-center">
            {isAuthenticated
              ? 'Free Play starts with $1,000 • Balances persist during your session'
              : 'Sign in to access Free Play • Your balance persists during this session'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
