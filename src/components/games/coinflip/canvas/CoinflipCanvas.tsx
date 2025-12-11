/**
 * PixiJS Coinflip Game Canvas
 * Main canvas component that renders the entire Coinflip game
 */

'use client';

import { Application, extend, type ApplicationRef } from '@pixi/react';
import React, { useMemo, useRef } from 'react';
import { Container, Sprite, Text, Graphics } from 'pixi.js';
import { useCanvasReady } from '@/hooks/games/coinflip/pixi/useCanvasReady';
import { useAssetLoading } from '@/hooks/games/coinflip/pixi/useAssetLoading';
import { getBackgroundTexture } from '@/utils/games/coinflip/client/pixiAssets';
import { CANVAS_BACKGROUND_COLOR } from '@/utils/games/common/canvasConstants';
import { ActionButtons } from '../buttons/actionButtons';
import { useCoinflipGame } from '@/contexts/CoinflipGameContext';
import {
  CoinflipGameActionType,
  CoinflipStatus,
  CoinSide,
  GameMode,
} from '@/types/games/coinflip/game';
import { BetAmount } from '../betAmount';
import { CoinSides } from '../extras/CoinSides';
import { ErrorContainer, GameModeBanner } from '../../blackjack/info';
import { UI_STYLES } from '../../blackjack/styles';
import {
  calculateCanvasPositions,
  calculateCanvasResolution,
  CANVAS_CONFIG,
  getCoinflipGameConstants,
} from '@/utils/games/coinflip/client/uiConfig';
import { useState, useEffect } from 'react';
import { ChipSelection } from '../../blackjack/chips/ChipSelection';
import { BackButton } from '../../common/BackButton';
import { LayoutContainer, LayoutSprite } from '@pixi/layout/components';
import '@pixi/layout/react';
import '@pixi/layout';
import { formatBalance } from '@/utils/format';
import { ResultModal } from '../../blackjack/modals/ResultModal';
import { ButtonSprite } from '../../blackjack/buttons/ButtonSprite';
import { MarblingBackgroundSprite } from '../../blackjack/canvas/MarblingBackgroundSprite';
import { VolumeButtonWithSlider } from '../../blackjack/canvas/VolumeButtonWithSlider';
import { TEXT_STYLES } from '@/utils/games/blackjack/client/textStyles';
import { PixiSquareContainer } from '../../blackjack/containers';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';

// Extend PixiJS components for use in JSX
extend({ Container, Sprite, Text, Graphics, LayoutContainer, LayoutSprite });

const ENABLE_MARBLING_DEBUG = false;

interface CoinflipCanvasProps {
  width: number;
  height: number;
  isMobile?: boolean;
  onReady?: (isReady: boolean) => void;
  onSwitchMode: () => void;
}
export function CoinflipCanvas({
  width,
  height,
  isMobile = false,
  onReady,
  onSwitchMode,
}: CoinflipCanvasProps) {
  // Get game state from context
  const {
    gameState,
    initialLoading,
    actionLoading: loading,
    error,
    clearError,
    sendAction: onAction,
    result,
    profit,
  } = useCoinflipGame();

  const [modalOpen, setModalOpen] = useState(false);

  // Reset modal open state when game finishes
  useEffect(() => {
    if (gameState.status === CoinflipStatus.FINISHED && result && !loading) {
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  }, [gameState.status, result, loading]);

  // Container ref must be declared before any early return so hook order stays consistent
  const appContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<ApplicationRef | null>(null);

  // Custom hooks for asset loading, particle effects, and canvas ready notification
  const { assetsLoaded } = useAssetLoading();
  const { canvasReady } = useCanvasReady({
    assetsLoaded,
    initialLoading: initialLoading,
    appRef,
    onReady,
  });

  // Calculate positions based on canvas size
  const positions = useMemo(
    () => calculateCanvasPositions(width, height, isMobile),
    [width, height, isMobile]
  );

  const backgroundTexture = useMemo(() => {
    if (!assetsLoaded) {
      return null;
    }
    return getBackgroundTexture(isMobile);
  }, [isMobile, assetsLoaded]);
  const coinSide = useMemo(() => {
    if (gameState.status === CoinflipStatus.FINISHED && gameState.winningSide) {
      return gameState.winningSide === CoinSide.HEADS
        ? 'coinFront'
        : 'coinBack';
    }
    return gameState.side === CoinSide.HEADS ? 'coinFront' : 'coinBack';
  }, [gameState.status, gameState.winningSide, gameState.side]);

  const gameConstants = useMemo(
    () => getCoinflipGameConstants(isMobile),
    [isMobile]
  );

  const gameMode = useMemo(() => {
    return gameState.gameMode;
  }, [gameState.gameMode]);

  const gameModeText = useMemo(() => {
    return gameMode === GameMode.FREE_PLAY ? 'FREE PLAY' : 'REAL MONEY';
  }, [gameMode]);

  const availableActions = [
    {
      action: CoinflipGameActionType.CLEAR,
      description: 'Clear all bets',
    },
    {
      action: CoinflipGameActionType.FLIP,
      description: 'Start the coin flip',
    },
    {
      action: CoinflipGameActionType.DOUBLE,
      description: 'Double your current bet and flip again',
    },
  ];
  const dropShadowFilter = useDropShadowFilter();
  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }}>
      <Application
        ref={appRef}
        width={width}
        height={height}
        backgroundAlpha={CANVAS_CONFIG.backgroundAlpha}
        backgroundColor={CANVAS_BACKGROUND_COLOR}
        antialias={CANVAS_CONFIG.antialias}
        autoDensity={CANVAS_CONFIG.autoDensity}
        resolution={calculateCanvasResolution()}
        powerPreference={CANVAS_CONFIG.powerPreference}
        hello={CANVAS_CONFIG.hello}
        resizeTo={window}
        textureGCActive={true}
      >
        {/* Only render game content when assets are loaded & canvas is ready */}
        {assetsLoaded && canvasReady ? (
          <>
            {/* Background - Full screen sprite with marbling effect */}
            {backgroundTexture && (
              <MarblingBackgroundSprite
                backgroundTexture={backgroundTexture}
                width={width}
                height={height}
                x={0}
                y={0}
                displacementScale={40}
                animationSpeed={0.4}
                debug={ENABLE_MARBLING_DEBUG}
              />
            )}
            {/* Balance and chip selection on bottom */}
            <layoutContainer
              x={width / 2}
              y={positions.chipButtons.y}
              layout={{
                width: 353,
                height: 50,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 10,
                right: 353 / 2,
              }}
            >
              {/* Left: Balance display */}
              <layoutContainer
                layout={{
                  width: 97,
                  height: 50,
                }}
              >
                <PixiSquareContainer
                  width={97}
                  height={50}
                  x={110.5}
                  y={0}
                  highlighted
                  color={0x0e392a}
                  alpha={1}
                  filters={dropShadowFilter}
                >
                  <pixiText
                    text={'BALANCE'}
                    anchor={0.5}
                    x={0}
                    y={-8}
                    style={UI_STYLES.xxsLabel}
                    resolution={2}
                  />
                  <pixiText
                    text={formatBalance(gameState.balance)}
                    anchor={0.5}
                    x={0}
                    y={10}
                    style={UI_STYLES.smLabel}
                    resolution={2}
                  />
                </PixiSquareContainer>
              </layoutContainer>

              {/* Right: Chip selection */}
              <layoutContainer
                layout={{
                  width: 246,
                  height: 50,
                }}
              >
                <ChipSelection
                  position={{
                    x: 123,
                    y: 0,
                  }}
                  balance={gameState.balance}
                  canSelectChips={
                    gameState.status === CoinflipStatus.BETTING &&
                    gameState.side !== undefined
                  }
                  isActionInProgress={
                    gameState.status !== CoinflipStatus.BETTING
                  }
                  onSelectChip={(amount) =>
                    onAction(CoinflipGameActionType.PLACE_BET, amount)
                  }
                />
              </layoutContainer>
            </layoutContainer>
            {/* Coin Sides - HEADS and TAILS betting areas */}
            <CoinSides positions={positions} isMobile={isMobile} />
            {/* Bet Amount */}
            <BetAmount
              xPosition={positions.betAmount.x}
              yPosition={positions.betAmount.y}
              isMobile={isMobile}
            />
            {/* Action Buttons */}
            <ActionButtons
              width={width}
              isMobile={isMobile}
              loading={loading}
              yPosition={positions.buttons.y}
              gameState={gameState}
              availableActions={availableActions}
              onAction={onAction}
            />
            {/* Result Modal - Rendered on top of everything */}
            {modalOpen && result && (
              <ResultModal
                isOpen={modalOpen}
                result={result}
                profit={profit}
                totalWon={gameState.payout || 0}
                centerX={width / 2}
                centerY={height / 2}
                isMobile={isMobile}
                coinSide={coinSide}
                onClose={() => setModalOpen(false)}
                isActionInProgress={loading}
              />
            )}
            {/* Back Button - Top Left */}
            {isMobile && (
              <BackButton
                x={positions.backButton.x}
                y={positions.backButton.y}
              />
            )}
            <pixiContainer
              x={positions.rulesButton.x}
              y={positions.rulesButton.y}
            >
              {/* Rules Button - Top Left */}
              <ButtonSprite
                text="RULES"
                x={0}
                y={0}
                width={gameConstants.rulesButtonSize.width}
                height={gameConstants.rulesButtonSize.height}
                color="white"
                onClick={() => {}}
                fontSize={isMobile ? 14 : 16}
              />
              <VolumeButtonWithSlider
                x={isMobile ? -12 : -22}
                y={gameConstants.rulesButtonSize.height + (isMobile ? 6 : 12)}
                baseWidth={isMobile ? 30 : 44}
                height={isMobile ? 32 : 46}
                isMobile={isMobile}
                onVolumeChange={(value) => {
                  // Volume control logic here
                  console.log('Volume:', value);
                }}
              />
            </pixiContainer>

            {/* Game Mode Banner */}
            <GameModeBanner
              x={positions.errorContainer.x}
              y={positions.errorContainer.y}
              text={gameModeText}
              style={UI_STYLES.baseLabel}
              width={width}
              isMobile={isMobile}
            />
            {/* Error Message */}
            <ErrorContainer
              x={positions.errorContainer.x}
              y={positions.errorContainer.y}
              error={error}
              style={TEXT_STYLES.message}
              width={width}
              isActionInProgress={false}
              onClearError={clearError}
            />
            {/* Rules Button - Top Left */}
            <ButtonSprite
              text="SWITCH TO"
              subtitle={
                gameMode === GameMode.FREE_PLAY ? 'REAL MONEY' : 'FREE PLAY'
              }
              x={positions.switchModeButton.x}
              y={positions.switchModeButton.y}
              width={gameConstants.switchModeButtonSize.width}
              height={gameConstants.switchModeButtonSize.height}
              color="white"
              onClick={onSwitchMode}
              fontSize={isMobile ? 8 : 12}
            />
          </>
        ) : null}
      </Application>
    </div>
  );
}
