'use client';

interface LobbyGameAreaProps {
  gameType: string | null;
  onChooseGame: () => void;
}

export function LobbyGameArea({ gameType, onChooseGame }: LobbyGameAreaProps) {
  return (
    <div className="bg-[#16171E52] rounded-2xl border border-[#FFFFFF29] backdrop-blur-sm flex-1 min-h-[400px] flex flex-col">
      {gameType ? (
        // Game is selected - render game component
        <div className="flex-1 flex items-center justify-center">
          <span className="text-white">Game: {gameType}</span>
        </div>
      ) : (
        // No game selected
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <h2 className="text-white text-2xl font-semibold">No Game</h2>
          <button
            onClick={onChooseGame}
            className="px-8 py-3 rounded-full font-semibold text-sm bg-transparent border border-[#FFFFFF16] text-white hover:bg-white/5 transition-colors"
          >
            Choose Game
          </button>
        </div>
      )}
    </div>
  );
}

