'use client';

import { useState } from 'react';
import Image from 'next/image';

type HistoryTab = 'Game History' | 'Leaderboard' | 'Player Stats';

interface GameHistoryEntry {
  round: number;
  game: string;
  winner: {
    name: string;
    avatar?: string;
  };
  totalWon: number;
  players: number;
  playTime: string;
}

const TABS: HistoryTab[] = ['Game History', 'Leaderboard', 'Player Stats'];

// Sample data
const sampleHistory: GameHistoryEntry[] = [
  {
    round: 5,
    game: 'BLACKJACK',
    winner: { name: 'Grandpa' },
    totalWon: 1139,
    players: 4,
    playTime: '10m 34s',
  },
];

export function LobbyHistory() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('Game History');

  return (
    <div className="bg-[#16171E52] rounded-2xl border border-[#FFFFFF29] backdrop-blur-sm overflow-hidden">
      {/* Tabs - styled like profile page */}
      <div className="flex items-center gap-6 px-6 py-4 border-b border-[#FFFFFF29]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'text-white underline underline-offset-[19px]'
                : 'text-[#FFFFFF52] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Header - styled like profile */}
      {activeTab === 'Game History' && (
        <div className="bg-black backdrop-blur-sm grid grid-cols-6 p-4 text-xs font-normal text-[#FFFFFFA3] capitalize tracking-wider border-b border-[#FFFFFF29]">
          <div className="col-span-1">Round</div>
          <div className="col-span-1">Game</div>
          <div className="col-span-1">Winner</div>
          <div className="col-span-1">Total Amount Won</div>
          <div className="col-span-1">Players</div>
          <div className="col-span-1 text-right">Play Time</div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {activeTab === 'Game History' && (
          <div className="flex flex-col gap-2">
            {sampleHistory.map((entry, index) => (
              <div
                key={index}
                className="text-[#FFFFFFA3] p-4 transition-colors border border-[#FFFFFF29] backdrop-blur-sm rounded-[16px] bg-[#16171E52] grid grid-cols-6 items-center"
              >
                <div className="col-span-1 text-[#FFFFFF52] text-sm">#{entry.round}</div>
                <div className="col-span-1">
                  <span className="text-white font-semibold text-sm italic">
                    {entry.game}
                  </span>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2E3144] overflow-hidden flex items-center justify-center">
                      {entry.winner.avatar ? (
                        <Image
                          src={entry.winner.avatar}
                          alt={entry.winner.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs">
                          {entry.winner.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-white text-sm">{entry.winner.name}</span>
                  </div>
                </div>
                <div className="col-span-1 text-[#46FD84] text-sm font-semibold">
                  +${entry.totalWon.toLocaleString()}
                </div>
                <div className="col-span-1 text-white text-sm">{entry.players}</div>
                <div className="col-span-1 text-[#FFFFFF52] text-sm text-right">{entry.playTime}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Leaderboard' && (
          <div className="text-center py-8">
            <p className="text-[#FFFFFF52]">Leaderboard coming soon...</p>
          </div>
        )}

        {activeTab === 'Player Stats' && (
          <div className="text-center py-8">
            <p className="text-[#FFFFFF52]">Player stats coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

