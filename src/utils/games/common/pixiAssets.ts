/**
 * Shared PixiJS Asset Management Utilities
 * Following official PixiJS v8 documentation: https://pixijs.com/8.x/guides/components/assets
 *
 * This is a centralized asset manager for ALL games to prevent duplicate loading
 */

import { Assets, Texture } from 'pixi.js';

// Card suits and ranks
export const SUITS = ['C', 'D', 'H', 'S'] as const;
export const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

// Chip denominations (shared across games)
const CHIP_VALUES = [1, 5, 10, 25, 50, 100, 500, 1000, 10000] as const;

/**
 * Build the complete list of assets to preload
 * This includes all game assets: backgrounds, UI elements, cards, chips, etc.
 */
function buildAssetList(): Array<{ alias: string; src: string }> {
  const assets: Array<{ alias: string; src: string }> = [];

  // ===== BLACKJACK ASSETS =====

  // Backgrounds
  assets.push(
    {
      alias: 'mainBackground',
      src: '/games/blackjack/assets/images/backgrounds/main-background.png',
    },
    {
      alias: 'mobileBackground',
      src: '/games/blackjack/assets/images/backgrounds/blackjack-mobile.png',
    },
    {
      alias: 'bevel',
      src: '/games/blackjack/assets/images/backgrounds/bevel.png',
    }
  );

  // Blackjack UI assets
  assets.push(
    { alias: 'deck', src: '/games/blackjack/assets/images/ui/deck.png' },
    {
      alias: 'logo',
      src: '/games/blackjack/assets/images/logos/bluff-b.png',
    },
    {
      alias: 'xButton',
      src: '/games/blackjack/assets/icons/actions/x-button.svg',
    },
    {
      alias: 'tooltip',
      src: '/games/blackjack/assets/icons/actions/tooltip.svg',
    },
    {
      alias: 'split',
      src: '/games/blackjack/assets/icons/actions/split.svg',
    },
    { alias: 'draw', src: '/games/blackjack/assets/icons/actions/draw.svg' },
    {
      alias: 'sidebet',
      src: '/games/blackjack/assets/images/ui/sidebet.png',
    },
    { alias: 'chips', src: '/games/blackjack/assets/images/ui/chip.svg' },
    {
      alias: 'insurance',
      src: '/games/blackjack/assets/icons/actions/insurance.svg',
    },
    {
      alias: 'chipsHighlight',
      src: '/games/blackjack/assets/images/ui/chip-highlight.svg',
    },
    {
      alias: 'sidebetHighlight',
      src: '/games/blackjack/assets/images/ui/sidebet-highlight.svg',
    },
    {
      alias: 'pixelatedOverlay',
      src: '/games/blackjack/assets/images/ui/pixelated-overlay.png',
    },
    {
      alias: 'flag',
      src: '/games/flag.png',
    },
    {
      alias: 'infoLeft',
      src: '/games/blackjack/assets/images/ui/info-left.png',
    },
    {
      alias: 'infoRight',
      src: '/games/blackjack/assets/images/ui/info-right.png',
    },
    {
      alias: 'win',
      src: '/games/blackjack/assets/icons/game/win.png',
    },
    {
      alias: 'lost',
      src: '/games/blackjack/assets/icons/game/lost.png',
    },
    {
      alias: 'busted',
      src: '/games/blackjack/assets/icons/game/busted.png',
    },
    {
      alias: 'blackjack',
      src: '/games/blackjack/assets/icons/game/blackjack.png',
    },
    {
      alias: 'surrender',
      src: '/games/blackjack/assets/icons/game/surrender.png',
    },
    {
      alias: 'push',
      src: '/games/blackjack/assets/icons/game/push.png',
    },
    {
      alias: 'winParticleTop',
      src: '/games/blackjack/assets/icons/game/particle-top.png',
    },
    {
      alias: 'winParticleBottom',
      src: '/games/blackjack/assets/icons/game/particle-bottom.png',
    },
    {
      alias: 'volumeOn',
      src: '/games/blackjack/assets/icons/game/volume.svg',
    },
    {
      alias: 'volumeOff',
      src: '/games/blackjack/assets/icons/game/volume-off.svg',
    },
    {
      alias: 'music',
      src: '/games/blackjack/assets/icons/game/music.png',
    },
    {
      alias: 'switch',
      src: '/games/blackjack/assets/icons/game/switch-bg.png',
    },
  );

  // Chip textures (shared across games)
  CHIP_VALUES.forEach((value) => {
    assets.push({
      alias: `chip${value}`,
      src: `/games/blackjack/assets/images/ui/chip-${value}.png`,
    });
  });

  // Card back (shared across card games)
  assets.push({
    alias: 'BACK',
    src: '/games/blackjack/assets/images/cards/BACK.png',
  });

  // All 52 playing cards (shared across card games)
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      assets.push({
        alias: `${rank}${suit}`,
        src: `/games/blackjack/assets/images/cards/${rank}${suit}.png`,
      });
    });
  });

  // ===== COINFLIP ASSETS =====
  assets.push(
    {
      alias: 'coinFront',
      src: '/games/coinflip/assets/images/ui/heads.svg',
    },
    {
      alias: 'coinBack',
      src: '/games/coinflip/assets/images/ui/tails.svg',
    }
  );

  return assets;
}

// Precomputed asset list for preloading
const ASSETS_TO_PRELOAD = buildAssetList();

// Track if Assets have been loaded (GLOBAL FLAG)
let assetsLoaded = false;

/**
 * Preload all game assets using the basic PixiJS Assets.load() pattern
 * This is called once globally and shared by all games
 */
export async function preloadGameAssets() {
  if (assetsLoaded) {
    console.log('Assets already loaded, skipping...');
    return true;
  }

  try {
    // Load all assets at once
    console.log(`Loading ${ASSETS_TO_PRELOAD.length} game assets...`);
    await Assets.load(ASSETS_TO_PRELOAD);

    assetsLoaded = true;
    console.log('✅ All game assets loaded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error loading assets:', error);
    throw error;
  }
}

/**
 * Convert full suit name to abbreviation
 */
function getSuitAbbreviation(suit: string): string {
  const suitMap: { [key: string]: string } = {
    hearts: 'H',
    diamonds: 'D',
    clubs: 'C',
    spades: 'S',
    // Also support abbreviations directly
    H: 'H',
    D: 'D',
    C: 'C',
    S: 'S',
  };
  return suitMap[suit.toLowerCase()] || suit;
}

/**
 * Get a card texture by rank and suit
 */
export function getCardTexture(rank: string, suit: string): Texture {
  const suitAbbrev = getSuitAbbreviation(suit);
  const cardName = `${rank}${suitAbbrev}`;
  const texture = Assets.get(cardName);
  if (!texture) {
    throw new Error(
      `Card texture not found: ${cardName} (original suit: ${suit})`
    );
  }
  return texture;
}

/**
 * Get the card back texture
 */
export function getCardBackTexture(): Texture {
  const texture = Assets.get('BACK');
  if (!texture) {
    throw new Error('Card back texture not found: BACK');
  }
  return texture;
}

/**
 * Get a chip texture by value
 */
export function getChipTexture(value: number): Texture {
  const chipKey = `chip${value}`;
  const texture = Assets.get(chipKey);
  if (!texture) {
    throw new Error(`Chip texture not found: ${chipKey}`);
  }
  return texture;
}

/**
 * Get UI texture by name
 */
export function getUITexture(name: string): Texture {
  const texture = Assets.get(name);
  if (!texture) {
    throw new Error(`UI texture not found: ${name}`);
  }
  return texture;
}

/**
 * Get icon texture by name
 */
export function getIconTexture(name: string): Texture {
  const texture = Assets.get(name);
  if (!texture) {
    throw new Error(`Icon texture not found: ${name}`);
  }
  return texture;
}

/**
 * Get background texture (desktop)
 * Throws if texture is not loaded or invalid
 */
export function getBackgroundTexture(isMobile = false): Texture {
  const texture = isMobile
    ? Assets.get('mobileBackground')
    : Assets.get('mainBackground');
  if (
    !texture ||
    !texture.baseTexture ||
    (texture.width === 0 && texture.height === 0)
  ) {
    const textureName = isMobile ? 'mobileBackground' : 'mainBackground';
    throw new Error(
      `Background texture '${textureName}' not found or invalid. Ensure assets are preloaded.`
    );
  }
  return texture;
}

/**
 * Check if all assets are loaded
 */
export function areAssetsLoaded(): boolean {
  return assetsLoaded;
}
