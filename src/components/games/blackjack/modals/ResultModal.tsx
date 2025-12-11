/**
 * PixiJS Result Modal Component
 * Displays game result (WIN, LOSE, PUSH, BUST) with PixiJS
 * Supports both blackjack (chips) and coinflip (coin) games
 */

import { useState, useEffect } from 'react';
import { useTick } from '@pixi/react';
import { playSound } from '@/utils/games/blackjack/client/sounds';
import { getIconTexture } from '@/utils/games/blackjack/client/pixiAssets';
import { WinModalGraphicContainer } from '../containers';
import { UI_STYLES } from '../styles';
import { GameResult } from '@/types/games/blackjack/game';
import { LayoutStyles } from '@pixi/layout';

interface ResultModalProps {
  isOpen: boolean;
  result: GameResult;
  totalWon: number;
  profit: number;
  chips?: number[];
  centerX: number;
  centerY: number;
  isMobile: boolean;
  coinSide?: 'coinFront' | 'coinBack';
  isActionInProgress?: boolean;
  status?: string;
  isSurrendered?: boolean;
  surrenderChips?: number[];
  onClose?: () => void;
}

const RESULT_CONFIG = {
  WIN: {
    title: 'win',
    color: 0x428166,
    sound: 'game-win-3' as const,
  },
  LOSE: {
    title: 'lost',
    color: 0xf87171,
    sound: 'game-lose-1' as const,
  },
  PUSH: {
    title: 'push',
    color: 0x0092ff,
    sound: 'game-push-1' as const,
  },
  BUST: {
    title: 'busted',
    color: 0xf87171,
    sound: 'game-lose-1' as const,
  },
  BLACKJACK: {
    title: 'blackjack',
    color: 0x428166,
    sound: 'game-win-3',
  },
  SURRENDER: {
    title: 'surrender',
    color: 0xffffff,
    sound: 'chips-collect' as const,
  },
} as const;
const COLOR_YELLOW = 0xffe721;
const COLOR_ORANGE_YELLOW = 0xffbe0c;
const MODAL_CONFIG = {
  WIDTH: 255,
  HEIGHT: 226,
} as const;

const ICON_CONFIG = {
  WIDTH: 150,
  HEIGHT: 124,
} as const;

const POSITIONS = {
  TITLE_Y: 100,
  COIN_TITLE_Y: 150,
  PROFIT_Y: 172,
  PARTICLE_TOP_Y: 8,
  PARTICLE_BOTTOM_Y: 95,
} as const;

const ANIMATION_CONFIG = {
  INITIAL_OFFSET: 150,
  TARGET_OFFSET: 0,
  SLIDE_SPEED: 0.3,
  THRESHOLD: 0.5,
} as const;

export function ResultModal({
  isOpen,
  result,
  totalWon,
  profit,
  chips,
  centerX,
  centerY,
  coinSide,
  status,
  isSurrendered = false,
  onClose,
}: ResultModalProps) {
  const [offsetY, setOffsetY] = useState<number>(
    ANIMATION_CONFIG.INITIAL_OFFSET
  );
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  // Use SURRENDER config if surrendered, otherwise use status or result
  const config = isSurrendered
    ? RESULT_CONFIG.SURRENDER
    : RESULT_CONFIG[
    status === 'BLACKJACK'
      ? 'BLACKJACK'
      : status === 'BUSTED'
        ? 'BUST'
        : result
    ];
  const isCoinflip = Boolean(coinSide && !chips);

  // Reset animation and sound state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOffsetY(ANIMATION_CONFIG.INITIAL_OFFSET);
      setSoundPlayed(false);
      setShouldShow(false);
    }
  }, [isOpen]);

  // Play sound effect immediately when modal opens
  useEffect(() => {
    if (isOpen && config.sound && !soundPlayed) {
      playSound(config.sound, 0.5, 3);
      setSoundPlayed(true);
    }
  }, [isOpen, config.sound, soundPlayed]);

  // Delay visual display - show after 1 second
  useEffect(() => {
    if (isOpen) {
      const delayTimer = setTimeout(() => {
        setShouldShow(true);
      }, 1000);
      return () => clearTimeout(delayTimer);
    }
  }, [isOpen]);

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen && onClose) {
      const closeTimer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(closeTimer);
    }
  }, [isOpen, onClose]);

  // Slide up animation
  useTick({
    callback: (ticker) => {
      if (shouldShow) {
        const slideSpeed = ANIMATION_CONFIG.SLIDE_SPEED * ticker.deltaTime;
        setOffsetY((prev) => {
          const diff = ANIMATION_CONFIG.TARGET_OFFSET - prev;
          if (Math.abs(diff) < ANIMATION_CONFIG.THRESHOLD) {
            return ANIMATION_CONFIG.TARGET_OFFSET;
          }
          return prev + diff * slideSpeed;
        });
      }
    },
    isEnabled: isOpen && shouldShow,
  });

  if (!isOpen || !shouldShow) return null;

  const modalX = centerX - MODAL_CONFIG.WIDTH / 2;
  const modalY = centerY - MODAL_CONFIG.HEIGHT / 2;
  const profitStyle = UI_STYLES.baseLabel.clone();
  profitStyle.fontSize = 24;
  profitStyle.stroke = {
    color: '#000000',
    width: 6,
  };
  const coinStyle = UI_STYLES.baseLabel.clone();
  coinStyle.fontSize = 16;
  coinStyle.stroke = {
    color: '#000000',
    width: 6,
  };
  const coinTitle = coinSide === 'coinFront' ? 'HEADS' : 'TAILS';

  return (
    <WinModalGraphicContainer
      width={MODAL_CONFIG.WIDTH}
      height={MODAL_CONFIG.HEIGHT}
      modalX={modalX}
      modalY={modalY + offsetY}
      borderColor={config.color}
      busted={status === 'BUSTED'}
      highlightColor={
        config.title === 'win' || config.title === 'blackjack'
          ? COLOR_YELLOW
          : undefined
      }
      highlightColor2={
        config.title === 'win' || config.title === 'blackjack'
          ? COLOR_ORANGE_YELLOW
          : undefined
      }
    >
      {/* Result Title */}
      {/* <pixiSprite
        texture={getIconTexture(config.title)}
        x={MODAL_CONFIG.WIDTH / 2}
        y={isCoinflip ? POSITIONS.TITLE_Y - 10 : POSITIONS.TITLE_Y}
        anchor={0.5}
        scale={isCoinflip ? 0.85 / 4 : 0.25}
      /> */}
      <layoutContainer
        key={config.title}
        x={0}
        y={32}
        layout={{
          ...layouts.iconContainer,
          height: isCoinflip ? ICON_CONFIG.HEIGHT - 20 : ICON_CONFIG.HEIGHT,
        }}
      >
        <layoutSprite
          texture={getIconTexture(config.title)}
          layout={layouts.icon}
        />
      </layoutContainer>

      {/* Coinflip result */}
      {isCoinflip && (
        <pixiText
          text={coinTitle}
          x={MODAL_CONFIG.WIDTH / 2}
          y={POSITIONS.COIN_TITLE_Y}
          anchor={0.5}
          style={coinStyle}
        />
      )}
      {/* Profit/Loss Display */}
      <pixiText
        text={(totalWon > 0 && config.title !== 'push') ? `+$${totalWon}` : config.title === 'push' ? `+$${Math.abs(profit)}` : `-$${Math.abs(profit)}`}
        x={MODAL_CONFIG.WIDTH / 2}
        y={POSITIONS.PROFIT_Y}
        anchor={0.5}
        style={profitStyle}
        resolution={2}
      />
      {/* Particle Display */}
      {(config.title === 'win' || config.title === 'blackjack') && (
        <pixiSprite
          texture={getIconTexture('winParticleTop')}
          x={MODAL_CONFIG.WIDTH / 2}
          y={-POSITIONS.PARTICLE_TOP_Y}
          anchor={0.5}
          scale={0.25}
        />
      )}
      {(config.title === 'win' || config.title === 'blackjack') && (
        <pixiSprite
          texture={getIconTexture('winParticleBottom')}
          x={MODAL_CONFIG.WIDTH / 2}
          y={MODAL_CONFIG.HEIGHT / 2 + POSITIONS.PARTICLE_BOTTOM_Y}
          anchor={0.5}
          scale={0.25}
        />
      )}
      {/* Flag Display */}
      {config.title === 'surrender' && (
        <pixiSprite
          texture={getIconTexture('flag')}
          x={MODAL_CONFIG.WIDTH / 2}
          y={POSITIONS.PARTICLE_TOP_Y - 33}
          anchor={0.5}
          width={77}
          height={77}
          zIndex={2}
        />
      )}
    </WinModalGraphicContainer>
  );
}

const layouts: Record<string, LayoutStyles> = {
  iconContainer: {
    width: MODAL_CONFIG.WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: ICON_CONFIG.WIDTH,
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    transformOrigin: 'center',
  },
};
