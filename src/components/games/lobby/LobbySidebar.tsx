'use client';

import Image from 'next/image';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface LobbyPlayer {
  id: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  isReady: boolean;
}

interface LobbySidebarProps {
  players: LobbyPlayer[];
  maxPlayers: number;
  spectators: number;
  entryFee: number;
  isPrivate: boolean;
  password?: string;
  isAdmin: boolean;
  onCopyPassword: () => void;
  onCloseLobby: () => void;
}

export function LobbySidebar({
  players,
  maxPlayers,
  spectators,
  entryFee,
  isPrivate,
  password,
  isAdmin,
  onCopyPassword,
  onCloseLobby,
}: LobbySidebarProps) {
  const [isPrivateEnabled, setIsPrivateEnabled] = useState(isPrivate);
  const emptySlots = maxPlayers - players.length;

  return (
    <div className="w-full lg:w-[320px] bg-[#16171E52] rounded-2xl border border-[#FFFFFF29] backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#FFFFFF29]">
        <h2 className="text-white text-lg font-semibold mb-4">Game Lobby</h2>
        
        {/* Stats Row */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[#FFFFFF52] text-xs">Players</span>
            <span className="text-white font-semibold">
              {players.length}<span className="text-[#FFFFFF52]">/{maxPlayers}</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#FFFFFF52] text-xs">Spectators</span>
            <span className="text-white font-semibold">{spectators}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#FFFFFF52] text-xs">Entry</span>
            <span className="text-white font-semibold">${entryFee.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-semibold text-lg">Players</span>
          <div className="flex items-center gap-3">
            <span className="text-[#FFFFFF52] text-sm">Private</span>
            <button
              onClick={() => setIsPrivateEnabled(!isPrivateEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                isPrivateEnabled ? 'bg-[#46FD84]' : 'bg-[#2E3144]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-200 ${
                  isPrivateEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Password Field */}
        {isPrivateEnabled && password && (
          <div className="flex items-center justify-between bg-[#2E3144] rounded-lg p-3 mb-4">
            <div className="flex flex-col">
              <span className="text-[#FFFFFF52] text-xs">Password</span>
              <span className="text-white font-mono">{password}</span>
            </div>
            <button
              onClick={onCopyPassword}
              className="text-[#FFFFFF52] hover:text-white transition-colors p-2"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Player List */}
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-[#2E3144] rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3C4055] overflow-hidden flex items-center justify-center">
                  {player.avatar ? (
                    <Image
                      src={player.avatar}
                      alt={player.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">{player.name}</span>
                  <span className="text-[#FFFFFF52] text-xs">
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {player.isAdmin && (
                  <span className="text-[#FFFFFF52] text-xs">Admin</span>
                )}
                {player.isReady && (
                  <div className="w-5 h-5 rounded-full bg-[#46FD84] flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty Slot - Show only one */}
          {emptySlots > 0 && (
            <div 
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: 'rgba(255, 255, 255, 0.16)' }}
            >
              <div className="w-10 h-10 rounded-full bg-[#2E3144] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="#FFFFFF52" strokeWidth="2"/>
                  <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="#FFFFFF52" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[#FFFFFF52] text-sm">Waiting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex flex-col gap-3">
        <button
          className="w-full py-3 rounded-full font-semibold text-sm bg-transparent border border-[#FFFFFF16] text-white hover:bg-white/5 transition-colors"
        >
          Waiting For Players
        </button>
        {isAdmin && (
          <button
            onClick={onCloseLobby}
            className="w-full py-3 rounded-full font-semibold text-sm bg-transparent border border-[#FFFFFF16] text-white hover:bg-white/5 transition-colors"
          >
            Close Lobby
          </button>
        )}
      </div>
    </div>
  );
}

