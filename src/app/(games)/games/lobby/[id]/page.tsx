'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ENABLE_GAMES, ENABLE_LOBBIES } from '@/constants';
import { useLayoutHeights } from '@/hooks/use-layout-heights';
import { LobbyHeader } from '@/components/games/lobby/LobbyHeader';
import { LobbyGameArea } from '@/components/games/lobby/LobbyGameArea';
import { LobbySidebar } from '@/components/games/lobby/LobbySidebar';
import { LobbyHistory } from '@/components/games/lobby/LobbyHistory';

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  isReady: boolean;
}

export interface LobbyDetails {
  id: string;
  name: string;
  gameType: string | null;
  players: LobbyPlayer[];
  spectators: number;
  maxPlayers: number;
  entryFee: number;
  isPrivate: boolean;
  password?: string;
  status: 'waiting' | 'ready' | 'playing';
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { totalHeight } = useLayoutHeights();
  const [isReady, setIsReady] = useState(false);

  // Sample lobby data (will be replaced with real data from API)
  const [lobby, setLobby] = useState<LobbyDetails>({
    id: params.id as string,
    name: 'Game Lobby',
    gameType: null,
    players: [
      { id: '1', name: 'Grandpa', isAdmin: true, isReady: true },
    ],
    spectators: 0,
    maxPlayers: 4,
    entryFee: 0,
    isPrivate: true,
    password: 'AG23JX',
    status: 'waiting',
  });

  useEffect(() => {
    if (!ENABLE_GAMES || !ENABLE_LOBBIES) {
      router.push('/');
    }
  }, [router]);

  if (!ENABLE_GAMES || !ENABLE_LOBBIES) {
    return null;
  }

  const handleReady = () => {
    setIsReady(!isReady);
  };

  const handleExitLobby = () => {
    router.push('/games');
  };

  const handleChooseGame = () => {
    // TODO: Open game selection modal
    console.log('Choose game');
  };

  const handleCloseLobby = () => {
    // TODO: Close lobby logic
    console.log('Close lobby');
    router.push('/games');
  };

  const handleCopyPassword = () => {
    if (lobby.password) {
      navigator.clipboard.writeText(lobby.password);
    }
  };

  const handleShare = () => {
    // TODO: Share lobby
    console.log('Share lobby');
  };

  const currentUserId = '1'; // TODO: Get from auth context
  const isAdmin = lobby.players.find(p => p.id === currentUserId)?.isAdmin ?? false;

  return (
    <div className="flex flex-col flex-1">
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Left/Center Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Back Button */}
          <button
            onClick={() => router.push('/games')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-md font-medium">Back to Games</span>
          </button>

          {/* Lobby Header */}
          <LobbyHeader
            title={lobby.name}
            players={lobby.players.length}
            maxPlayers={lobby.maxPlayers}
            spectators={lobby.spectators}
            entryFee={lobby.entryFee}
            isReady={isReady}
            onReady={handleReady}
            onExit={handleExitLobby}
            onShare={handleShare}
          />

          {/* Game Area */}
          <LobbyGameArea
            gameType={lobby.gameType}
            onChooseGame={handleChooseGame}
          />

          {/* History Section */}
          <LobbyHistory />
        </div>

        {/* Right Sidebar */}
        <LobbySidebar
          players={lobby.players}
          maxPlayers={lobby.maxPlayers}
          spectators={lobby.spectators}
          entryFee={lobby.entryFee}
          isPrivate={lobby.isPrivate}
          password={lobby.password}
          isAdmin={isAdmin}
          onCopyPassword={handleCopyPassword}
          onCloseLobby={handleCloseLobby}
        />
      </div>
    </div>
  );
}

