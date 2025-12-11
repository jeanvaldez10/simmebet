'use client';

import Image from 'next/image';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export type LobbyStatus = 'waiting' | 'live' | 'full';
export type LobbyAccess = 'public' | 'private';

export interface LobbyData {
  id: string;
  gameType: string;
  gameName: string;
  gameImage: string;
  currentPlayers: number;
  maxPlayers: number;
  status: LobbyStatus;
  admin: {
    name: string;
    avatar?: string;
  };
  access: LobbyAccess;
  entryFee: number;
}

interface LobbyCardProps {
  lobby: LobbyData;
  onJoin?: (lobbyId: string) => void;
  onSpectate?: (lobbyId: string) => void;
  onEnterCode?: (lobbyId: string) => void;
}

export function LobbyCard({ lobby, onJoin, onSpectate, onEnterCode }: LobbyCardProps) {
  const router = useRouter();
  const progressPercentage = (lobby.currentPlayers / lobby.maxPlayers) * 100;
  const canJoin = lobby.status !== 'full' && lobby.currentPlayers < lobby.maxPlayers;
  const isPrivate = lobby.access === 'private';

  const handleCardClick = () => {
    router.push(`/games/lobby/${lobby.id}`);
  };

  const getStatusDisplay = () => {
    switch (lobby.status) {
      case 'live':
        return (
          <span className="flex items-center gap-1.5 text-[#46FD84] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#46FD84] animate-pulse" />
            Live
          </span>
        );
      case 'full':
        return (
          <span className="text-[#FFFFFF52] text-xs">Full</span>
        );
      case 'waiting':
      default:
        return (
          <span className="flex items-center gap-1.5 text-[#FFFFFF52] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#FFFFFF52]" />
            Waiting for players...
          </span>
        );
    }
  };

  const getActionButtons = () => {
    if (isPrivate) {
      return (
        <button
          onClick={() => onEnterCode?.(lobby.id)}
          className="w-full py-2.5 rounded-full bg-[#46FD84] text-black font-semibold text-sm hover:bg-[#33E06E] transition-colors"
        >
          Enter Code
        </button>
      );
    }

    // Show both Spectate and Join side by side for public lobbies
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSpectate?.(lobby.id)}
          className="py-2.5 rounded-full bg-transparent border text-white font-semibold text-sm hover:bg-white/5 transition-colors"
          style={{ borderColor: 'rgba(255, 255, 255, 0.16)' }}
        >
          Spectate
        </button>
        <button
          onClick={() => onJoin?.(lobby.id)}
          disabled={!canJoin}
          className={`py-2.5 rounded-full font-semibold text-sm transition-colors ${
            canJoin 
              ? 'bg-[#46FD84] text-black hover:bg-[#33E06E]' 
              : 'bg-[#46FD84]/50 text-black/50 cursor-not-allowed'
          }`}
        >
          Join
        </button>
      </div>
    );
  };

  return (
    <div 
      className="bg-[#16171E] rounded-2xl overflow-hidden w-full flex flex-col border border-[#FFFFFF16] cursor-pointer hover:border-[#FFFFFF29] transition-colors"
      onClick={handleCardClick}
    >
      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Game Image - styled like market cards */}
        <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden">
          <Image
            src={lobby.gameImage}
            alt={lobby.gameName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        {/* Players Progress */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[#FFFFFF52] text-xs">Players</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">
                <span className="text-[#46FD84]">{lobby.currentPlayers}</span>
                <span className="text-[#FFFFFF52]"> of {lobby.maxPlayers}</span>
              </span>
            </div>
          </div>
          {getStatusDisplay()}
        </div>

        {/* Segmented Progress Bar */}
        <div className="bg-[#2E3144] border border-[#4F5262] rounded-full p-1 flex gap-1 items-center">
          {Array.from({ length: lobby.maxPlayers }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'flex-1 h-0.5 rounded-full transition-all duration-300',
                index < lobby.currentPlayers ? 'bg-[#46FD84]' : 'bg-[#4F5262]'
              )}
            />
          ))}
        </div>

        {/* Lobby Info Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {/* Admin */}
          <div className="flex flex-col gap-1">
            <span className="text-[#FFFFFF52] text-xs">Admin</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#2E3144] overflow-hidden flex items-center justify-center">
                {lobby.admin.avatar ? (
                  <Image
                    src={lobby.admin.avatar}
                    alt={lobby.admin.name}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs">
                    {lobby.admin.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-white text-sm truncate">{lobby.admin.name}</span>
            </div>
          </div>

          {/* Access */}
          <div className="flex flex-col gap-1">
            <span className="text-[#FFFFFF52] text-xs">Access</span>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm capitalize">{lobby.access}</span>
              {isPrivate && <Lock className="w-3 h-3 text-[#FFFFFF52]" />}
            </div>
          </div>

          {/* Entry Fee */}
          <div className="flex flex-col gap-1">
            <span className="text-[#FFFFFF52] text-xs">Entry</span>
            <span className="text-[#46FD84] text-sm font-semibold">
              ${lobby.entryFee}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2" onClick={(e) => e.stopPropagation()}>
          {getActionButtons()}
        </div>
      </div>
    </div>
  );
}

