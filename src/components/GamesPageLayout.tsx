'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Ticker from './Ticker';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLayoutHeights } from '@/hooks/use-layout-heights';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatSidebar } from './games/ChatSidebar';
import MessageIcon from './icons/MessageIcon';
import { ENABLE_LOBBIES } from '@/constants';

type GamesPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

const GamesPageLayout = ({
  children,
  className = '',
}: GamesPageLayoutProps) => {
  const pathname = usePathname();
  const { totalHeight } = useLayoutHeights();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isGamePage = useMemo(
    () =>
      pathname?.startsWith('/games/blackjack') ||
      pathname?.startsWith('/games/coinflip') ||
      pathname?.startsWith('/blackjack') ||
      pathname?.startsWith('/coinflip'),
    [pathname]
  );

  const isGamesIndexPage = pathname === '/games';
  const isMobileGameView = isGamePage && isMobile && isMounted;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isGamePage) {
      const img = new Image();
      img.src = '/bg-image.jpeg';
    }
  }, [isGamePage]);

  return (
    <main
      className={cn(
        'relative min-h-screen w-full text-white overflow-x-hidden flex flex-col',
        'bg-cover bg-center bg-no-repeat bg-fixed'
      )}
      style={{
        backgroundImage: 'url(/bg-image.jpeg)',
        minHeight: '100dvh',
      }}
    >
      {/* Chat Sidebar - Only show when lobbies are enabled */}
      {ENABLE_LOBBIES && (
        <ChatSidebar 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          topOffset={totalHeight}
        />
      )}

      {/* Chat Toggle Button - Only show when lobbies are enabled */}
      {ENABLE_LOBBIES && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed left-0 z-[60] text-white p-2.5 transition-all duration-300 hover:opacity-80 border border-l-0 border-[#FFFFFF29]"
          style={{ 
            top: `${totalHeight + 16}px`,
            background: 'rgba(22, 23, 30, 0.32)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '0px 8px 8px 0px',
          }}
          aria-label="Open chat"
        >
          <MessageIcon width={20} height={20} />
        </button>
      )}

      <Header />
      {isMounted && !isMobileGameView && <Ticker />}
      
      {/* Content with transition */}
      <div
        className={cn(
          'flex flex-col flex-1 transition-all duration-300 w-full',
          isGamesIndexPage && 'sm:px-6 lg:px-8',
          isMobileGameView && 'z-[1000]',
          className
        )}
        style={{
          paddingTop: isMobileGameView ? 0 : `${totalHeight}px`,
          // Only shift content on desktop when chat is open (check isMounted to ensure isMobile is accurate)
          marginLeft: isChatOpen && isMounted && !isMobile ? '320px' : '0',
          width: isChatOpen && isMounted && !isMobile ? 'calc(100% - 320px)' : '100%',
        }}
      >
        {children}
      </div>
    </main>
  );
};

export default GamesPageLayout;
