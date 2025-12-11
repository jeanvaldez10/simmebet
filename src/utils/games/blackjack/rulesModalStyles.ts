/**
 * Text Styles for Rules Modal Component
 *
 * Contains helper functions that generate TextStyleOptions for the RulesModal.
 * These styles are responsive and adjust based on mobile/desktop view.
 */

import { TextStyleOptions } from 'pixi.js';

export const getTitleStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 20 : 24,
    fill: 0xfbbf24,
    fontWeight: 'bold',
    align: 'center',
    dropShadow: {
      color: 0x000000,
      distance: 2,
      angle: Math.PI / 4,
      blur: 1,
    },
  };
};

export const getSubtitleStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 10 : 12,
    fill: 0xffffff,
    align: 'center',
    wordWrap: true,
  };
};

export const getSectionTitleStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 14 : 16,
    fill: 0xfbbf24,
    fontWeight: 'bold',
    align: 'left',
    wordWrap: true,
  };
};

export const getDescriptionStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 10 : 11,
    fill: 0xffffff,
    align: 'left',
    wordWrap: true,
  };
};

export const getHandNameStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 11 : 12,
    fill: 0xffffff,
    fontWeight: 'bold',
    align: 'left',
  };
};

export const getPayoutStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 12 : 14,
    fill: 0x4ade80,
    fontWeight: 'bold',
    align: 'right',
  };
};

export const getDetailStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 9 : 10,
    fill: 0xffffff,
    align: 'left',
    wordWrap: true,
  };
};

export const getRuleCardTitleStyle = (isMobile: boolean): TextStyleOptions => {
  return {
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 12 : 14,
    fill: 0xfbbf24,
    fontWeight: 'bold',
    align: 'left',
  };
};

