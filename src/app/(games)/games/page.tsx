'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ENABLE_GAMES, ENABLE_LOBBIES } from '@/constants';
import { GameCard } from '../../../components/games/common/GameCard';
import { useLayoutHeights } from '@/hooks/use-layout-heights';
import { SearchInput } from '@/app/(site)/options/common/search-input';
import { SortOption } from '@/components/shared/FilterDropdown';
import { LobbyCard, CreateLobbyCard, LobbyData } from '@/components/games/lobby';

export default function GamesPage() {
  const router = useRouter();
  const { totalHeight } = useLayoutHeights();
  const [activeTab, setActiveTab] = useState("Games");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  useEffect(() => {
    if (!ENABLE_GAMES) {
      router.push('/');
    }
  }, [router]);

  if (!ENABLE_GAMES) {
    return null;
  }

  // Define available games
  const allGames = [
    {
      id: 'blackjack',
      name: 'Blackjack',
      href: '/games/blackjack',
      imageSrc: '/games/blackjackcover.png',
      alt: 'Blackjack',
    },
    {
      id: 'coinflip',
      name: 'Coinflip',
      href: '/games/coinflip',
      imageSrc: '/games/coinflipcover.png',
      alt: 'Coinflip',
    },
  ];

  // Sample lobby data (will be replaced with real data from API)
  const sampleLobbies: LobbyData[] = [
    {
      id: '1',
      gameType: 'blackjack',
      gameName: 'Blackjack',
      gameImage: '/games/blackjackcover.png',
      currentPlayers: 1,
      maxPlayers: 4,
      status: 'waiting',
      admin: { name: 'Grandpa' },
      access: 'public',
      entryFee: 25,
    },
    {
      id: '2',
      gameType: 'blackjack',
      gameName: 'Blackjack',
      gameImage: '/games/blackjackcover.png',
      currentPlayers: 4,
      maxPlayers: 4,
      status: 'live',
      admin: { name: 'Grandpa' },
      access: 'public',
      entryFee: 25,
    },
    {
      id: '3',
      gameType: 'blackjack',
      gameName: 'Blackjack',
      gameImage: '/games/blackjackcover.png',
      currentPlayers: 1,
      maxPlayers: 4,
      status: 'waiting',
      admin: { name: 'Grandpa' },
      access: 'private',
      entryFee: 25,
    },
  ];

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    let games = allGames;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      games = games.filter((game) =>
        game.name.toLowerCase().includes(query)
      );
    }

    return games;
  }, [searchQuery]);

  // Filter lobbies based on search query
  const filteredLobbies = useMemo(() => {
    let lobbies = sampleLobbies;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      lobbies = lobbies.filter((lobby) =>
        lobby.gameName.toLowerCase().includes(query) ||
        lobby.admin.name.toLowerCase().includes(query)
      );
    }

    return lobbies;
  }, [searchQuery]);

  const handleCreateLobby = () => {
    // TODO: Open create lobby modal
    console.log('Create lobby');
  };

  const handleJoinLobby = (lobbyId: string) => {
    // TODO: Join lobby logic
    console.log('Join lobby:', lobbyId);
  };

  const handleSpectateLobby = (lobbyId: string) => {
    // TODO: Spectate lobby logic
    console.log('Spectate lobby:', lobbyId);
  };

  const handleEnterCode = (lobbyId: string) => {
    // TODO: Open enter code modal
    console.log('Enter code for lobby:', lobbyId);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col pb-12">
      <div className="max-w-7xl mx-auto px-[9px] w-full">
        {/* Tab Bar with Search */}
        <div 
          className="border sticky z-50 border-[#FFFFFF29] flex items-center justify-between gap-6 bg-[rgba(3,3,3,0.9)] py-2 px-4 backdrop-blur-sm rounded-[16px] mb-2"
          style={{ top: `${totalHeight + 21}px` }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("Games")}
              className={`font-semibold text-xl transition-colors cursor-pointer ${
                activeTab === "Games"
                  ? "text-white !underline-offset-[18px] md:underline"
                  : "text-[#FFFFFF52]"
              }`}
            >
              Games
            </button>
            {ENABLE_LOBBIES && (
              <button
                onClick={() => setActiveTab("Lobbies")}
                className={`font-semibold text-xl transition-colors cursor-pointer ${
                  activeTab === "Lobbies"
                    ? "text-white !underline-offset-[18px] md:underline"
                    : "text-[#FFFFFF52]"
                }`}
              >
                Lobbies
              </button>
            )}
          </div>

          <SearchInput 
            search={searchQuery} 
            setSearch={setSearchQuery}
            placeHolder={activeTab === "Games" ? "Search games" : "Search lobbies"}
            showSort={true}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Games Grid */}
        {activeTab === "Games" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 pt-6">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  href={game.href}
                  imageSrc={game.imageSrc}
                  alt={game.alt}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-[#FFFFFF52] text-lg">No games found</p>
              </div>
            )}
          </div>
        )}

        {/* Lobbies Grid */}
        {activeTab === "Lobbies" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
            {/* Create Lobby Card - Always first */}
            <CreateLobbyCard onCreate={handleCreateLobby} />
            
            {/* Lobby Cards */}
            {filteredLobbies.map((lobby) => (
              <LobbyCard
                key={lobby.id}
                lobby={lobby}
                onJoin={handleJoinLobby}
                onSpectate={handleSpectateLobby}
                onEnterCode={handleEnterCode}
              />
            ))}

            {filteredLobbies.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-[#FFFFFF52] text-lg">No lobbies found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

