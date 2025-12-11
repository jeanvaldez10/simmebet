'use client';

import { Share2 } from 'lucide-react';

interface LobbyHeaderProps {
  title: string;
  players: number;
  maxPlayers: number;
  spectators: number;
  entryFee: number;
  isReady: boolean;
  onReady: () => void;
  onExit: () => void;
  onShare: () => void;
}

export function LobbyHeader({
  title,
  players,
  maxPlayers,
  spectators,
  entryFee,
  isReady,
  onReady,
  onExit,
  onShare,
}: LobbyHeaderProps) {
  return (
    <div className="bg-[#16171E52] rounded-2xl border border-[#FFFFFF29] backdrop-blur-sm p-6">
      {/* Title Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-2xl font-semibold">{title}</h1>
          <button
            onClick={onShare}
            className="text-[#FFFFFF52] hover:text-white transition-colors p-2"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats and Actions Row */}
      <div className="flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[#FFFFFF52] text-sm">Players</span>
            <span className="text-white text-2xl font-semibold">
              {players}<span className="text-[#FFFFFF52]">/{maxPlayers}</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#FFFFFF52] text-sm">Spectators</span>
            <span className="text-white text-2xl font-semibold">{spectators}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#FFFFFF52] text-sm">Entry</span>
            <span className="text-white text-2xl font-semibold">
              ${entryFee.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReady}
            className={`px-8 py-3 rounded-full font-semibold text-sm transition-colors ${
              isReady
                ? 'bg-[#46FD84] text-black hover:bg-[#33E06E]'
                : 'bg-[#46FD84] text-black hover:bg-[#33E06E]'
            }`}
          >
            <div className="flex flex-col items-center">
              <span>Click When Ready!</span>
              <span className="text-xs opacity-70">Waiting for players...</span>
            </div>
          </button>
          <button
            onClick={onExit}
            className="px-8 py-3 rounded-full font-semibold text-sm bg-transparent border border-[#FFFFFF16] text-white hover:bg-white/5 transition-colors"
          >
            Exit Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

