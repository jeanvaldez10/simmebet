/**
 * Volume Button with Slider Component
 * Shows slider on hover and expands button width
 */

import { useState, useMemo, useEffect } from 'react';
import { PixiSlider } from '../extras/PixiSlider';
import { getUITexture } from '@/utils/games/blackjack/client/pixiAssets';
import {
  getVolumeButtonDimensions,
  getVolumeButtonPositions,
  getVolumeSliderConfig,
  VOLUME_BUTTON_PROPS,
} from '@/utils/games/blackjack/client/uiConfig';
import { PixiSwitch } from '../extras/PixiSwitch';
import { usePixiVolume } from '@/hooks/games/blackjack/usePixiVolume';
import { usePixiVolumeButton } from '@/hooks/games/blackjack/usePixiVolumeButton';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';
import { useBackgroundMusic } from '@/hooks/games/blackjack/useBackgroundMusic';
import { MusicTrack, setMasterVolume, getMasterVolume } from '@/utils/games/blackjack/client/sounds';

interface VolumeButtonWithSliderProps {
  x: number;
  y: number;
  baseWidth: number;
  height: number;
  isMobile: boolean;
  onVolumeChange?: (value: number) => void;
  track?: MusicTrack;
}

export function VolumeButtonWithSlider({
  x,
  y,
  baseWidth,
  height,
  isMobile,
  onVolumeChange,
  track = 'blackjack',
}: VolumeButtonWithSliderProps) {
  const [isHovered, setIsHovered] = useState(false);
  // Initialize from master volume
  const [volumeValue, setVolumeValue] = useState(getMasterVolume());
  const [isMuted, setIsMuted] = useState(getMasterVolume() === 0);
  // Store the volume level before muting so we can restore it
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(50);

  const dropShadowFilter = useDropShadowFilter();
  
  // Load saved volume on mount
  useEffect(() => {
    const savedVolume = getMasterVolume();
    setVolumeValue(savedVolume);
    setIsMuted(savedVolume === 0);
    if (savedVolume > 0) {
      setVolumeBeforeMute(savedVolume);
    }
  }, []);
  // Control background music
  useBackgroundMusic({
    track: track,
    enabled: !isMuted,
    volume: volumeValue,
    loop: true,
  });
  const dimensions = useMemo(
    () => getVolumeButtonDimensions(isMobile),
    [isMobile]
  );
  const positions = useMemo(
    () => getVolumeButtonPositions(isMobile),
    [isMobile]
  );
  const sliderConfig = useMemo(
    () => getVolumeSliderConfig(isMobile),
    [isMobile]
  );

  const buttonWidth = isHovered ? dimensions.expandedWidth : baseWidth;
  const buttonGraphicsX = buttonWidth / 2;

  const iconX = positions.iconOffsetX;
  const sliderX = dimensions.iconWidth + positions.sliderOffsetX;
  const switchX = dimensions.iconWidth + dimensions.sliderWidth + 2;
  const musicIconX = switchX + positions.musicIconOffsetX;

  const drawVolume = usePixiVolume({
    width: dimensions.expandedWidth,
    height,
    ...VOLUME_BUTTON_PROPS,
  });

  const drawVolumeButton = usePixiVolumeButton({
    width: baseWidth,
    height,
    ...VOLUME_BUTTON_PROPS,
  });

  const handleVolumeChange = (value: number) => {
    setVolumeValue(value);
    setMasterVolume(value); // Update master volume for all sounds
    // Store non-zero values as the "before mute" volume
    if (value > 0) {
      setVolumeBeforeMute(value);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
    onVolumeChange?.(value);
  };

  const handleMuteToggle = (checked: boolean) => {
    const newMuted = !checked;
    setIsMuted(newMuted);
    // When muting, set master volume to 0, when unmuting restore the slider value
    if (newMuted) {
      setMasterVolume(0);
    } else {
      setMasterVolume(volumeValue);
    }
  };

  // Simple toggle function for icon click on desktop
  const handleIconClick = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      const restoreVolume = volumeBeforeMute > 0 ? volumeBeforeMute : 50;
      setVolumeValue(restoreVolume);
      setMasterVolume(restoreVolume);
      setIsMuted(false);
    } else {
      // Mute: set to 0
      setVolumeValue(0);
      setMasterVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <pixiContainer
      x={x}
      y={y}
      zIndex={1}
      eventMode="static"
      onPointerEnter={
        !isMobile
          ? () => {
            setIsHovered(true);
          }
          : undefined
      }
      onPointerLeave={
        !isMobile
          ? () => {
            setIsHovered(false);
          }
          : undefined
      }
    >
      <pixiGraphics
        x={buttonGraphicsX + positions.buttonGraphicsOffsetX}
        y={0}
        draw={isHovered ? drawVolume : drawVolumeButton}
        eventMode="static"
        cursor="pointer"
        filters={dropShadowFilter}
      />
      <pixiSprite
        texture={getUITexture(isMuted || volumeValue === 0 ? 'volumeOff' : 'volumeOn')}
        anchor={0.5}
        x={iconX}
        y={0}
        width={dimensions.iconWidth}
        height={dimensions.iconHeight}
        eventMode="static"
        cursor="pointer"
        onPointerDown={
          isMobile
            ? (event: PointerEvent) => {
              // Mobile: Toggle slider panel open/closed
              event.stopPropagation();
              setIsHovered((prev) => !prev);
            }
            : (event: PointerEvent) => {
              // Desktop: Toggle mute/unmute (hover already opens slider)
              event.stopPropagation();
              handleIconClick();
            }
        }
      />
      {isHovered && (
        <>
          <PixiSlider
            x={sliderX}
            y={0 - sliderConfig.trackHeight / 2}
            width={dimensions.sliderWidth}
            min={0}
            max={100}
            value={volumeValue}
            onChange={handleVolumeChange}
            trackHeight={sliderConfig.trackHeight}
            thumbWidth={sliderConfig.thumbWidth}
            thumbHeight={sliderConfig.thumbHeight}
            zIndex={2}
          />
          <PixiSwitch
            x={switchX + positions.switchOffsetX}
            y={0}
            width={dimensions.switchWidth}
            height={dimensions.switchHeight}
            checked={!isMuted}
            onChange={handleMuteToggle}
            zIndex={2}
          />
          <pixiSprite
            texture={getUITexture('music')}
            anchor={0.5}
            x={musicIconX}
            y={0}
            width={dimensions.musicIconWidth}
            height={dimensions.musicIconHeight}
          />
        </>
      )}
    </pixiContainer>
  );
}
