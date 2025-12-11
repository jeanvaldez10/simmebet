/**
 * Centralized Game Constants
 * All card spacing, animation, positioning, canvas, and layout constants in one place
 */

import { GameState } from '@/types/games/blackjack/game';

// ============================================================================
// CANVAS CONSTANTS
// ============================================================================

// Screen size breakpoints
export const SCREEN_BREAKPOINTS = {
  SMALL: 1024,
  MEDIUM: 1280,
} as const;

// Background color (felt table green)
export const CANVAS_BACKGROUND_COLOR = 0x478269;

// Loading screen background color (matching felt)
export const LOADING_BACKGROUND_COLOR = '#478269';

// Loading text
export const LOADING_TEXT = 'Loading Game...';

// Canvas configuration
export const CANVAS_CONFIG = {
  backgroundAlpha: 0,
  antialias: false,
  autoDensity: true,
  maxResolution: 2, // Cap devicePixelRatio for performance
  powerPreference: 'high-performance' as const,
  hello: false,
} as const;

// Particle effects thresholds
export const CONFETTI_PROFIT_THRESHOLD = 100; // Show confetti if profit > this amount

// Background image paths
export const BACKGROUND_IMAGE =
  '/games/blackjack/assets/images/backgrounds/bg-image.jpeg';
export const BEVEL_IMAGE =
  '/games/blackjack/assets/images/backgrounds/bevel.png';

/**
 * Calculate canvas resolution based on device pixel ratio
 * Caps resolution at maxResolution for performance
 */
export function calculateCanvasResolution(): number {
  if (typeof window === 'undefined') {
    return 1;
  }
  return Math.min(window.devicePixelRatio || 1, CANVAS_CONFIG.maxResolution);
}

// ============================================================================
// GAME CONSTANTS
// ============================================================================

export interface GameConstants {
  cardSpacing: number;
  cardScale: number;
  cardDimensions: {
    width: number;
    height: number;
  };
  deckDimensions: {
    width: number;
    height: number;
  };
  deckGap: {
    right: number;
    top: number;
  };
  animation: {
    speed: number;
    flipSpeed: number;
    duration: number;
  };
  spacing: {
    basePlayer: number;
    baseDealer: number;
    handSpacing: number;
  };
  buttonXOffset: {
    default: number;
    hasPreviousBet: number;
    stand: number;
  };
  rulesButtonGap: {
    left: number;
    top: number;
  };
  rulesButtonSize: {
    width: number;
    height: number;
  };
  errorContainer: {
    y: number;
  };
  betInfoDisplay: {
    height: number;
    padding: {
      bottom: number;
      left: number;
    };
  };
}

/**
 * Get game constants based on device type
 */
export function getGameConstants(isMobile: boolean): GameConstants {
  return {
    cardSpacing: isMobile ? 70 : 86,
    cardScale: isMobile ? 0.9 : 1.1,
    cardDimensions: {
      width: 73,
      height: 100,
    },
    deckDimensions: {
      width: 73,
      height: 100,
    },
    deckGap: {
      right: isMobile ? 32 : 40,
      top: isMobile ? 32 : 40,
    },
    animation: {
      speed: 0.033,
      flipSpeed: 0.08,
      duration: 1500,
    },
    spacing: {
      basePlayer: isMobile ? 80 : 90,
      baseDealer: isMobile ? 80 : 90,
      handSpacing: isMobile ? 80 : 220,
    },
    buttonXOffset: isMobile
      ? {
          default: 60,
          hasPreviousBet: 120,
          stand: 110,
        }
      : {
          default: 70,
          hasPreviousBet: 140,
          stand: 120,
        },
    rulesButtonGap: {
      left: isMobile ? 20 : 40,
      top: isMobile ? 32 : 40,
    },
    rulesButtonSize: {
      width: isMobile ? 70 : 90,
      height: isMobile ? 32 : 36,
    },
    errorContainer: {
      y: isMobile ? 32 : 20,
    },
    betInfoDisplay: {
      height: 50,
      padding: {
        bottom: isMobile ? 124 : 0,
        left: isMobile ? 16 : 0,
      },
    },
  };
}

/**
 * Get card spacing for current device
 */
export function getCardSpacing(isMobile: boolean): number {
  return getGameConstants(isMobile).cardSpacing;
}

/**
 * Get card scale for current device
 */
export function getCardScale(isMobile: boolean): number {
  return getGameConstants(isMobile).cardScale;
}

/**
 * Get base spacing for initial deal slots
 */
export function getBaseSpacing(isMobile: boolean): {
  player: number;
  dealer: number;
} {
  const spacing = isMobile ? 52 : 90;
  return {
    player: spacing,
    dealer: spacing,
  };
}

/**
 * Get actual card width based on scale
 */
export function getActualCardWidth(isMobile: boolean): number {
  const constants = getGameConstants(isMobile);
  const scale = getCardScale(isMobile);
  return constants.cardDimensions.width * scale;
}

/**
 * Get actual card height based on scale
 */
export function getActualCardHeight(isMobile: boolean): number {
  const constants = getGameConstants(isMobile);
  const scale = getCardScale(isMobile);
  return constants.cardDimensions.height * scale;
}

/**
 * Get horizontal position
 */
export function getButtonXPositions(
  width: number,
  isMobile: boolean,
  hasPreviousBet: boolean,
  stand?: boolean
) {
  const constants = getGameConstants(isMobile);
  const offset = isMobile
    ? hasPreviousBet
      ? constants.buttonXOffset.hasPreviousBet
      : stand
      ? constants.buttonXOffset.stand
      : constants.buttonXOffset.default
    : hasPreviousBet
    ? constants.buttonXOffset.hasPreviousBet
    : stand
    ? constants.buttonXOffset.stand
    : constants.buttonXOffset.default;

  return {
    leftButtonX: width / 2 - offset,
    rightButtonX: width / 2 + offset,
  };
}
/**
 * Get height all button
 */
export function getButtonHeight(isMobile: boolean): number {
  return isMobile ? 48 : 46;
}

/**
 * Get fontSize of all button
 */
export function getButtonFontSize(isMobile: boolean): number {
  return isMobile ? 24 : 20;
}

/**
 * Get buttonWidth of all action button
 */
export function getButtonWidth(isMobile: boolean): number {
  return isMobile ? 100 : 122;
}

/**
 * Get size (width & height) of side bet squares
 */
export function getSideBetSize(isMobile: boolean): number {
  return isMobile ? 75 : 100;
}

/**
 * Get actual deck width in pixels (no scale, direct pixel size)
 */
export function getDeckWidth(isMobile: boolean): number {
  return getGameConstants(isMobile).deckDimensions.width * 1.2;
}

/**
 * Get actual deck height in pixels (no scale, direct pixel size)
 */
export function getDeckHeight(isMobile: boolean): number {
  return getGameConstants(isMobile).deckDimensions.height * 1.2;
}

// ============================================================================
// CANVAS LAYOUT
// ============================================================================

export interface CanvasPositions {
  dealer: { x: number; y: number };
  player: { x: number; y: number };
  chips: { x: number; y: number };
  deck: { x: number; y: number };
  buttons: { y: number };
  buttonSpacing: number;
  chipButtons: { x: number; y: number };
  wallet: { right: number; y: number };
  trollbox: { x: number; y: number };
  sidebet: { x: number; y: number };
  betAmount: { x: number; y: number };
  rulesButton: { x: number; y: number };
  errorContainer: { x: number; y: number };
  insuranceChip: { x: number; y: number };
}

/**
 * Calculate all canvas element positions based on viewport size
 */
export function calculateCanvasPositions(
  width: number,
  height: number,
  isMobile: boolean
): CanvasPositions {
  const centerX = width / 2;
  const centerY = height / 2;
  const isSmall = width < SCREEN_BREAKPOINTS.SMALL;
  const isMedium =
    width >= SCREEN_BREAKPOINTS.SMALL && width < SCREEN_BREAKPOINTS.MEDIUM;

  // Base scale factor that changes with screen size
  const scale = isMobile ? 1 : isSmall ? 0.8 : isMedium ? 0.9 : 1;

  // Get deck dimensions and gaps for accurate positioning (anchor 0.5 means center point)
  const constants = getGameConstants(isMobile);
  const deckWidth = getDeckWidth(isMobile);
  const deckHeight = getDeckHeight(isMobile);
  const deckGapRight = constants.deckGap.right;
  const deckGapTop = constants.deckGap.top;

  if (isMobile) {
    return {
      dealer: {
        x: centerX,
        y: deckHeight / 2 + 104,
      },
      player: { x: centerX, y: height - 336 }, // JUST above circulr bet modal
      chips: { x: centerX, y: (centerY + 100) * scale },
      deck: {
        x: width - deckWidth / 2 - deckGapRight * scale,
        y: deckHeight / 2 + deckGapTop * scale,
      },
      buttons: { y: height - 100 },
      buttonSpacing: 200 * scale,
      chipButtons: { x: centerX, y: height - 42 },
      wallet: { right: 0, y: 0 },
      trollbox: { x: centerX, y: 20 },
      sidebet: { x: centerX, y: height - 204 },
      betAmount: { x: centerX, y: height - 170 * scale },
      rulesButton: {
        x:
          constants.rulesButtonGap.left +
          (scale * constants.rulesButtonSize.width) / 2,
        y:
          constants.rulesButtonGap.top +
          (scale * constants.rulesButtonSize.height) / 2,
      },
      errorContainer: {
        x: centerX,
        y: constants.errorContainer.y,
      },
      insuranceChip: { x: 0, y: 0 },
    };
  }

  // Desktop positions with dynamic scaling
  const basePositions: CanvasPositions = {
    dealer: { x: centerX, y: deckHeight / 2 + (deckGapTop + 24) * scale },
    player: {
      x: centerX,
      y: height - 396,
    },
    chips: {
      x: centerX,
      y: Math.min((centerY + 135) * scale, height - 140),
    },
    deck: {
      x: width - deckWidth / 2 - deckGapRight * scale,
      y: deckHeight / 2 + deckGapTop * scale,
    },
    buttons: {
      y: height - 100,
    },
    buttonSpacing: Math.max(200 * scale, 160),
    chipButtons: {
      x: centerX,
      y: height - 45,
    },
    wallet: {
      right: deckGapRight * scale,
      y: height - 45 - constants.betInfoDisplay.height / 2,
    },
    trollbox: {
      x: Math.max(100 * scale, 80),
      y: height - Math.max(30 * scale, 25),
    },
    sidebet: {
      x: centerX,
      y: height - 240,
    },
    betAmount: {
      x: centerX,
      y: Math.min(height - 150 * scale, height - 150),
    },
    rulesButton: {
      x:
        constants.rulesButtonGap.left +
        (scale * constants.rulesButtonSize.width) / 2,
      y:
        constants.rulesButtonGap.top +
        (scale * constants.rulesButtonSize.height) / 2,
    },
    errorContainer: {
      x: centerX,
      y: constants.errorContainer.y,
    },
    insuranceChip: { x: 0, y: 0 },
  };

  // Apply additional adjustments for medium screens
  if (isMedium) {
    //basePositions.player.y = centerY - 20;
    basePositions.chips.y = height - 120;
    //basePositions.buttons.y = height - 100;
    // basePositions.chipButtons.y = height - 45;
    // chipButtons.x remains centerX
    // basePositions.sidebet.y = height - 220;
  }

  return basePositions;
}

/**
 * Calculate player hand positions for split scenarios
 */
export function calculatePlayerHandPositions(
  gameState: GameState,
  basePosition: { x: number; y: number },
  isMobile: boolean
): { x: number; y: number }[] {
  const count = gameState.playerHands.length;
  if (count === 0) {
    return [];
  }

  const baseX = basePosition.x;
  const baseY = basePosition.y;

  if (count === 1) {
    return [{ x: baseX, y: baseY }];
  }

  // For split hands: Calculate proper positioning to ensure cards are centered and don't overflow
  const cardSpacing = getCardSpacing(isMobile);
  const cardWidth = getActualCardWidth(isMobile);

  // Calculate hand widths based on actual card count
  const handWidths = gameState.playerHands.map((hand) => {
    const cardCount = hand.cards.length;
    if (cardCount <= 1) {
      return cardWidth; // Minimum width is one card
    }
    // Total width = card spacing * (number of cards - 1) + card width
    return cardSpacing * (cardCount - 1) + cardWidth;
  });

  // Adaptive spacing: reduce spacing as number of hands increases
  // Base spacing: mobile 40px, desktop 100px
  // Reduced spacing for 3+ hands: mobile 25px, desktop 60px
  const baseHandSpacing = isMobile ? 40 : 100;
  const reducedHandSpacing = isMobile ? 25 : 60;
  let handSpacing = count >= 3 ? reducedHandSpacing : baseHandSpacing;

  // Calculate total width needed: sum of all hand widths + spacing between them
  const totalHandWidth = handWidths.reduce((sum, width) => sum + width, 0);
  let totalNeededWidth = totalHandWidth + handSpacing * (count - 1);

  // Estimate available width and adjust if needed to prevent overflow
  // Mobile: ~375px, Tablet: ~768px
  const estimatedScreenWidth = isMobile ? 375 : 768;
  const maxAvailableWidth = isMobile
    ? estimatedScreenWidth * 0.85 // 85% of screen width for mobile/tablet
    : totalNeededWidth; // Desktop can use full width

  // If total width exceeds available space, reduce spacing
  if (totalNeededWidth > maxAvailableWidth && count > 1) {
    const excessWidth = totalNeededWidth - maxAvailableWidth;
    const spacingReduction = excessWidth / (count - 1);
    handSpacing = Math.max(15, handSpacing - spacingReduction); // Minimum 15px spacing
    totalNeededWidth = totalHandWidth + handSpacing * (count - 1);
  }

  // Calculate positions from right to left (reverse order: index 0 right, index 1 left)
  // Start from the rightmost edge (baseX + half total width)
  let rightmostEdge = baseX + totalNeededWidth / 2;

  const handPositions = gameState.playerHands.map((hand, index) => {
    const handWidth = handWidths[index];
    // Position hand center at rightmostEdge - half its width
    const positionX = rightmostEdge - handWidth / 2;

    // Move left for next hand (going backwards through the array)
    rightmostEdge -= handWidth + (index < count - 1 ? handSpacing : 0);

    return positionX;
  });

  return gameState.playerHands.map((_, index) => ({
    x: handPositions[index],
    y: baseY,
  }));
}

/**
 * Calculate deal slots for initial card dealing
 */
export function calculateDealSlots(
  position: { x: number; y: number },
  baseSpacing: number
): { x: number; y: number }[] {
  return [
    {
      x: position.x - baseSpacing / 2,
      y: position.y,
    },
    {
      x: position.x + baseSpacing / 2,
      y: position.y,
    },
  ];
}
/**
 * Semantic button color palette.
 */
export const BUTTON_COLORS: Record<
  'orange' | 'blue' | 'red' | 'green' | 'white' | 'overlay' | 'black',
  { normal: number; hover: number; disabled: number; shadow: number }
> = {
  orange: {
    normal: 0xff9700,
    hover: 0xffad33,
    disabled: 0x8c5500,
    shadow: 0xc27300,
  },
  blue: {
    normal: 0x0092ff,
    hover: 0x33aaff,
    disabled: 0x005580,
    shadow: 0x005aad,
  },
  red: {
    normal: 0xfe4c40,
    hover: 0xff6e65,
    disabled: 0x992d26,
    shadow: 0xa82d1e,
  },
  green: {
    normal: 0x27ae60,
    hover: 0x2ecc71,
    disabled: 0x186839,
    shadow: 0x1a7a43,
  },
  white: {
    normal: 0xffffff,
    hover: 0xf0f0f0,
    disabled: 0xcccccc,
    shadow: 0x9698a3,
  },
  overlay: {
    normal: 0xe9e9ec,
    hover: 0xe9e9ec,
    disabled: 0xe9e9ec,
    shadow: 0x000000,
  },
  black: {
    normal: 0x092c20,
    hover: 0x092c20,
    disabled: 0x092c20,
    shadow: 0x092c20,
  },
};

// ============================================================================
// VOLUME BUTTON CONSTANTS
// ============================================================================

export interface VolumeButtonDimensions {
  sliderWidth: number;
  iconWidth: number;
  iconHeight: number;
  expandedWidth: number;
  switchWidth: number;
  switchHeight: number;
  musicIconWidth: number;
  musicIconHeight: number;
}

export interface VolumeButtonPositions {
  iconOffsetX: number;
  sliderOffsetX: number;
  switchOffsetX: number;
  musicIconOffsetX: number;
  buttonGraphicsOffsetX: number;
}

export interface VolumeSliderConfig {
  trackHeight: number;
  thumbWidth: number;
  thumbHeight: number;
}

export const VOLUME_BUTTON_DIMENSIONS: {
  mobile: VolumeButtonDimensions;
  desktop: VolumeButtonDimensions;
} = {
  mobile: {
    sliderWidth: 114,
    iconWidth: 20.87,
    iconHeight: 16.7,
    expandedWidth: 198,
    switchWidth: 18,
    switchHeight: 10,
    musicIconWidth: 15.03,
    musicIconHeight: 16.7,
  },
  desktop: {
    sliderWidth: 174,
    iconWidth: 32,
    iconHeight: 25,
    expandedWidth: 304,
    switchWidth: 28,
    switchHeight: 15,
    musicIconWidth: 23,
    musicIconHeight: 26,
  },
} as const;

export const VOLUME_BUTTON_POSITIONS: {
  mobile: VolumeButtonPositions;
  desktop: VolumeButtonPositions;
} = {
  mobile: {
    iconOffsetX: -7,
    sliderOffsetX: -13,
    switchOffsetX: 0,
    musicIconOffsetX: 22,
    buttonGraphicsOffsetX: -22,
  },
  desktop: {
    iconOffsetX: 0,
    sliderOffsetX: -7,
    switchOffsetX: 12,
    musicIconOffsetX: 45,
    buttonGraphicsOffsetX: -22,
  },
} as const;

export const VOLUME_SLIDER_CONFIG: {
  mobile: VolumeSliderConfig;
  desktop: VolumeSliderConfig;
} = {
  mobile: {
    trackHeight: 12,
    thumbWidth: 15,
    thumbHeight: 16,
  },
  desktop: {
    trackHeight: 17,
    thumbWidth: 23,
    thumbHeight: 25,
  },
} as const;

export const VOLUME_BUTTON_PROPS = {
  colors: BUTTON_COLORS.white,
  shadowColor: 0x9698a3,
  disabled: false,
  currentColor: 0xffffff,
  opacity: 1,
} as const;

/**
 * Get volume button dimensions based on device type
 */
export function getVolumeButtonDimensions(
  isMobile: boolean
): VolumeButtonDimensions {
  return isMobile
    ? VOLUME_BUTTON_DIMENSIONS.mobile
    : VOLUME_BUTTON_DIMENSIONS.desktop;
}

/**
 * Get volume button positions based on device type
 */
export function getVolumeButtonPositions(
  isMobile: boolean
): VolumeButtonPositions {
  return isMobile
    ? VOLUME_BUTTON_POSITIONS.mobile
    : VOLUME_BUTTON_POSITIONS.desktop;
}

/**
 * Get volume slider config based on device type
 */
export function getVolumeSliderConfig(isMobile: boolean): VolumeSliderConfig {
  return isMobile ? VOLUME_SLIDER_CONFIG.mobile : VOLUME_SLIDER_CONFIG.desktop;
}
