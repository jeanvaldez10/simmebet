/**
 * Centralized Coinflip Game Constants
 * All coin spacing, animation, positioning, canvas, and layout constants in one place
 */

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

// Background image paths
export const BACKGROUND_IMAGE =
  '/games/coinflip/assets/images/backgrounds/bg-image.jpeg';

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

export interface CoinflipGameConstants {
  coinDimensions: {
    width: number;
    height: number;
  };
  coinYOffset: number;
  bettingSquareSize: number;
  gap: {
    mobile: number;
    desktop: number;
  };
  leftPositionOffset: number;
  mobileYOffset: number;
  mobileLabelFontSize: number;
  buttonSpacing: {
    mobile: number;
    desktop: number;
  };
  buttonDimensions: {
    width: {
      mobile: number;
      desktop: number;
    };
    height: {
      mobile: number;
      desktop: number;
    };
  };
  buttonFontSize: {
    mobile: number;
    desktop: number;
  };
  betAmountContainer: {
    width: {
      mobile: number;
      desktop: number;
    };
    height: number;
  };
  layoutContainer: {
    width: number;
    height: number;
  };
  balanceContainer: {
    width: number;
    height: number;
  };
  chipSelectionContainer: {
    width: number;
    height: number;
  };
  rulesButtonGap: {
    left: number;
    top: number;
  };
  rulesButtonSize: {
    width: number;
    height: number;
  };
  switchModeButtonSize: {
    width: number;
    height: number;
  };
  errorContainer: { y: number };
}

/**
 * Get game constants based on device type
 */
export function getCoinflipGameConstants(
  isMobile: boolean
): CoinflipGameConstants {
  return {
    coinDimensions: {
      width: 192,
      height: 198,
    },
    coinYOffset: 0,
    bettingSquareSize: isMobile ? 75 : 100,
    gap: {
      mobile: 5,
      desktop: 30,
    },
    leftPositionOffset: 62, // PixiSquareContainer subtracts this when position="left"
    mobileYOffset: 25,
    mobileLabelFontSize: 18,
    buttonSpacing: {
      mobile: 16,
      desktop: 25,
    },
    buttonDimensions: {
      width: {
        mobile: 107,
        desktop: 122,
      },
      height: {
        mobile: 38,
        desktop: 46,
      },
    },
    buttonFontSize: {
      mobile: 14,
      desktop: 20,
    },
    betAmountContainer: {
      width: {
        mobile: 156,
        desktop: 190,
      },
      height: 29,
    },
    layoutContainer: {
      width: 353,
      height: 50,
    },
    balanceContainer: {
      width: 97,
      height: 50,
    },
    chipSelectionContainer: {
      width: 246,
      height: 50,
    },
    rulesButtonGap: {
      left: isMobile ? 20 : 40,
      top: isMobile ? 32 : 40,
    },
    rulesButtonSize: {
      width: isMobile ? 70 : 90,
      height: isMobile ? 32 : 36,
    },
    switchModeButtonSize: {
      width: isMobile ? 80 : 100,
      height: isMobile ? 32 : 42,
    },
    errorContainer: {
      y: isMobile ? 32 : 40,
    },
  };
}

/**
 * Get coin dimensions
 */
export function getCoinDimensions(isMobile: boolean): {
  width: number;
  height: number;
} {
  return getCoinflipGameConstants(isMobile).coinDimensions;
}

/**
 * Get betting square size
 */
export function getBettingSquareSize(isMobile: boolean): number {
  return getCoinflipGameConstants(isMobile).bettingSquareSize;
}

/**
 * Get gap between coin and betting squares
 */
export function getBettingGap(isMobile: boolean): number {
  const constants = getCoinflipGameConstants(isMobile);
  return isMobile ? constants.gap.mobile : constants.gap.desktop;
}

/**
 * Get button height
 */
export function getButtonHeight(isMobile: boolean): number {
  const constants = getCoinflipGameConstants(isMobile);
  return isMobile
    ? constants.buttonDimensions.height.mobile
    : constants.buttonDimensions.height.desktop;
}

/**
 * Get button font size
 */
export function getButtonFontSize(isMobile: boolean): number {
  const constants = getCoinflipGameConstants(isMobile);
  return isMobile
    ? constants.buttonFontSize.mobile
    : constants.buttonFontSize.desktop;
}

/**
 * Get button width
 */
export function getButtonWidth(isMobile: boolean): number {
  const constants = getCoinflipGameConstants(isMobile);
  return isMobile
    ? constants.buttonDimensions.width.mobile
    : constants.buttonDimensions.width.desktop;
}

/**
 * Get button spacing
 */
export function getButtonSpacing(isMobile: boolean): number {
  const constants = getCoinflipGameConstants(isMobile);
  return isMobile
    ? constants.buttonSpacing.mobile
    : constants.buttonSpacing.desktop;
}

// ============================================================================
// CANVAS LAYOUT
// ============================================================================

export interface CoinflipCanvasPositions {
  coin: { x: number; y: number };
  sidebet: { x: number; y: number }; // Center point for coin (for compatibility)
  headsBetting: { x: number; y: number };
  tailsBetting: { x: number; y: number };
  betAmount: { x: number; y: number };
  buttons: { y: number };
  chipButtons: { x: number; y: number };
  balance: { x: number; y: number };
  rulesButton: { x: number; y: number };
  switchModeButton: { x: number; y: number };
  backButton: { x: number; y: number };
  errorContainer: { x: number; y: number };
}

/**
 * Calculate all canvas element positions based on viewport size
 */
export function calculateCanvasPositions(
  width: number,
  height: number,
  isMobile: boolean
): CoinflipCanvasPositions {
  const centerX = width / 2;
  const centerY = height / 2;
  const isSmall = width < SCREEN_BREAKPOINTS.SMALL;
  const isMedium =
    width >= SCREEN_BREAKPOINTS.SMALL && width < SCREEN_BREAKPOINTS.MEDIUM;

  // Base scale factor that changes with screen size
  const scale = isMobile ? 1 : isSmall ? 0.8 : isMedium ? 0.9 : 1;

  const constants = getCoinflipGameConstants(isMobile);
  const coinYOffset = constants.coinYOffset;

  if (isMobile) {
    const coinY = centerY - coinYOffset;
    return {
      coin: {
        x: centerX,
        y: coinY,
      },
      sidebet: {
        x: centerX,
        y: centerY, // Original sidebet position (before offset)
      },
      headsBetting: {
        x:
          centerX -
          constants.coinDimensions.width / 2 -
          constants.gap.mobile -
          constants.bettingSquareSize / 2 +
          constants.leftPositionOffset,
        y: coinY,
      },
      tailsBetting: {
        x:
          centerX +
          constants.coinDimensions.width / 2 +
          constants.gap.mobile +
          constants.bettingSquareSize / 2,
        y: coinY,
      },
      betAmount: {
        x: centerX,
        y: height - 170 * scale,
      },
      buttons: {
        y: height - 130 * scale,
      },
      chipButtons: {
        x: centerX,
        y: height - 70 * scale,
      },
      balance: {
        x: centerX,
        y: height - 70 * scale,
      },
      rulesButton: {
        x:
          constants.rulesButtonGap.left +
          (scale * constants.rulesButtonSize.width) / 2,
        y:
          constants.rulesButtonGap.top +
          (scale * constants.rulesButtonSize.height) / 2,
      },
      switchModeButton: {
        x:
          width -
          constants.rulesButtonGap.left -
          (scale * constants.switchModeButtonSize.width) / 2,
        y:
          constants.rulesButtonGap.top +
          (scale * constants.switchModeButtonSize.height) / 2,
      },
      backButton: {
        x: 40,
        y: 20,
      },
      errorContainer: {
        x: centerX,
        y: constants.errorContainer.y,
      },
    };
  }

  // Desktop positions with dynamic scaling
  const coinY = centerY - coinYOffset;
  const basePositions: CoinflipCanvasPositions = {
    coin: {
      x: centerX,
      y: coinY,
    },
    sidebet: {
      x: centerX,
      y: centerY, // Original sidebet position (before offset)
    },
    headsBetting: {
      x:
        centerX -
        constants.coinDimensions.width / 2 -
        constants.gap.desktop -
        constants.bettingSquareSize / 2 +
        constants.leftPositionOffset,
      y: coinY,
    },
    tailsBetting: {
      x:
        centerX +
        constants.coinDimensions.width / 2 +
        constants.gap.desktop +
        constants.bettingSquareSize / 2,
      y: coinY,
    },
    betAmount: {
      x: centerX,
      y: Math.min(height - 150 * scale, height - 150),
    },
    buttons: {
      y: Math.min(height - 110 * scale, height - 90),
    },
    chipButtons: {
      x: centerX,
      y: Math.min(height - 50 * scale, height - 40),
    },
    balance: {
      x: centerX,
      y: Math.min(height - 50 * scale, height - 40),
    },
    rulesButton: {
      x:
        constants.rulesButtonGap.left +
        (scale * constants.rulesButtonSize.width) / 2,
      y:
        constants.rulesButtonGap.top +
        (scale * constants.rulesButtonSize.height) / 2,
    },
    switchModeButton: {
      x:
        width -
        constants.rulesButtonGap.left -
        (scale * constants.switchModeButtonSize.width) / 2,
      y:
        constants.rulesButtonGap.top +
        (scale * constants.switchModeButtonSize.height) / 2,
    },
    backButton: {
      x: 20,
      y: 20,
    },
    errorContainer: {
      x: centerX,
      y: constants.errorContainer.y,
    },
  };

  // Apply additional adjustments for medium screens
  if (isMedium) {
    basePositions.buttons.y = height - 100;
    basePositions.chipButtons.y = height - 45;
    basePositions.balance.y = height - 45;
  }

  return basePositions;
}
