/**
 * PixiJS Blackjack Game Canvas
 * Main canvas component that renders the entire blackjack game
 */

'use client';

import { Application, extend, type ApplicationRef } from '@pixi/react';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import {
  LayoutContainer,
  LayoutSprite,
  LayoutText,
} from '@pixi/layout/components';
import '@pixi/layout/react';
import '@pixi/layout';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionButtons } from '../buttons/ActionButtons';
import { ChipSelection } from '../chips/ChipSelection';
import { ChipAnimationManager } from '../chips/ChipAnimationManager';
import { ChipSplash, Confetti } from '../extras/ParticleEffects';
import { SideBet } from '../extras/SideBet';
import { HandSprite } from '../hands/HandSprite';
import { PlayerHandSprite } from '../hands/PlayerHandSprite';
import { MobilePlayerHandsContainer } from '../hands/MobilePlayerHandsContainer';
import {
  GameModeBanner,
  BetInfoDisplay,
  SideBetNotification,
  ErrorContainer,
} from '../info';
import { buildCardQueue } from '@/utils/games/blackjack/client/cardQueueBuilder';
import DealingAnimationSprite from './DealingAnimationSprite';
import { MarblingBackgroundSprite } from './MarblingBackgroundSprite';
// import { GameModals } from "../modals/GameModals";
import { useBlackjackGame } from '@/contexts/BlackjackGameContext';
import { useAssetLoading } from '@/hooks/games/blackjack/pixi/useAssetLoading';
import { useCanvasReady } from '@/hooks/games/blackjack/pixi/useCanvasReady';
import { useParticleEffects } from '@/hooks/games/blackjack/pixi/useParticleEffects';
import {
  GameActionType,
  GameMode,
  GamePhaseType,
} from '@/types/games/blackjack/game';
import {
  getBackgroundTexture,
  getUITexture,
} from '@/utils/games/blackjack/client/pixiAssets';
import { TEXT_STYLES } from '@/utils/games/blackjack/client/textStyles';
import {
  calculateCanvasPositions,
  calculateCanvasResolution,
  calculatePlayerHandPositions,
  CANVAS_BACKGROUND_COLOR,
  CANVAS_CONFIG,
  getDeckHeight,
  getDeckWidth,
  getGameConstants,
} from '@/utils/games/blackjack/client/uiConfig';
import { GameModals } from '../modals/GameModals';
import { RulesModal } from '../modals/RulesModal';
import { ButtonSprite } from '../buttons/ButtonSprite';
import { PixiDrawContainer, PixiSquareContainer } from '../containers';
import { UI_STYLES } from '../styles';
import { VolumeButtonWithSlider } from './VolumeButtonWithSlider';
import { playSound } from '@/utils/games/blackjack/client/sounds';
import { formatBalance } from '@/utils/format';
import { BackButton } from '../../common/BackButton';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';

// Extend PixiJS components for use in JSX
extend({
  Container,
  Sprite,
  Text,
  Graphics,
  LayoutContainer,
  LayoutText,
  LayoutSprite,
});

const ENABLE_MARBLING_DEBUG = false;

interface BlackjackCanvasProps {
  width: number;
  height: number;
  isMobile?: boolean;
  onReady?: (isReady: boolean) => void;
  onSwitchMode: () => void;
}
export function BlackjackCanvas({
  width,
  height,
  isMobile = false,
  onReady,
  onSwitchMode,
}: BlackjackCanvasProps) {
  // Get game state from context
  const {
    gameState,
    initialLoading,
    actionLoading: loading,
    error,
    animationManager,
    sendAction: onAction,
    availableActions,
    shuffleVerification,
    clearError,
  } = useBlackjackGame();

  const dropShadowFilter = useDropShadowFilter();

  // Memoize dealer hole flip complete handler
  const handleDealerHoleFlipComplete = useCallback(() => {
    animationManager.markDealerHoleFlipComplete();
  }, [animationManager]);

  // Container ref must be declared before any early return so hook order stays consistent
  const appContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<ApplicationRef>(null);

  // Track selected side bet section for chip routing
  const [selectedSideBetSection, setSelectedSideBetSection] = useState<
    'main' | 'pair' | '21plus3'
  >('main');

  // Track if we should hide bet chips during loss animation
  const [hideMainBetChipsForLoss, setHideMainBetChipsForLoss] = useState(false);

  // Reset hide flag when new betting phase starts
  useEffect(() => {
    if (gameState.gamePhase === GamePhaseType.BETTING) {
      setHideMainBetChipsForLoss(false);
    }
  }, [gameState.gamePhase]);
  const [shuffleModalOpen, setShuffleModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [shuffleButtonDelayPassed, setShuffleButtonDelayPassed] =
    useState(false);

  // Get animated/animating cards from animation manager
  const animatedCardIds = useMemo(
    () => new Set(animationManager.getAnimatedCards()),
    [animationManager]
  );

  const animatingCardIds = useMemo(
    () => new Set(animationManager.getAnimatingCards()),
    [animationManager]
  );

  const cardsToAnimate = useMemo(
    () => new Set(animationManager.getCardsToAnimate()),
    [animationManager]
  );

  const onCloseRulesModal = useCallback(() => {
    playSound('button-press', 0.3, 0.5);
    setRulesModalOpen(false);
  }, []);

  const onOpenRulesModal = useCallback(() => {
    playSound('button-press', 0.3, 0.5);
    setRulesModalOpen(true);
  }, []);

  // Wrapper function to route chip placement based on selected section
  const handleChipSelect = useCallback(
    (amount: number) => {
      // Route chip placement based on selected section
      if (selectedSideBetSection === 'pair') {
        onAction(GameActionType.PLACE_PAIR_BET, amount);
      } else if (selectedSideBetSection === '21plus3') {
        onAction(GameActionType.PLACE_21PLUS3_BET, amount);
      } else {
        // Main bet section
        onAction(GameActionType.PLACE_BET, amount);
      }
    },
    [selectedSideBetSection, onAction]
  );

  const isDealing = useMemo(
    () =>
      (cardsToAnimate.size !== animatedCardIds.size &&
        cardsToAnimate.size > 0) ||
      animatingCardIds.size > 0,
    [animatedCardIds, cardsToAnimate, animatingCardIds]
  );

  // Combined loading state: true when cards are animating OR action is loading
  const isActionInProgress = isDealing || loading;

  // Custom hooks for asset loading, particle effects, and canvas ready notification
  const { assetsLoaded } = useAssetLoading();
  const { showWinParticles, showConfetti } = useParticleEffects(gameState);
  const { canvasReady } = useCanvasReady({
    assetsLoaded,
    initialLoading,
    appRef,
    onReady,
  });

  const shouldShowDealerHand = useMemo(() => {
    return (
      gameState.gamePhase !== GamePhaseType.BETTING &&
      gameState.dealerHand.cards.length > 1
    );
  }, [gameState.gamePhase, gameState.dealerHand.cards.length]);

  // Calculate positions based on canvas size
  const positions = useMemo(
    () => calculateCanvasPositions(width, height, isMobile),
    [width, height, isMobile]
  );

  const gameConstants = useMemo(() => getGameConstants(isMobile), [isMobile]);

  const playerHandPositions = useMemo(
    () => calculatePlayerHandPositions(gameState, positions.player, isMobile),
    [gameState, positions.player, isMobile]
  );

  // Memoize playerHands and dealerCards to prevent creating new arrays on every render
  const playerHands = useMemo(
    () => gameState.playerHands.map((hand) => hand.cards),
    [gameState.playerHands]
  );

  const dealerCards = useMemo(
    () => gameState.dealerHand.cards ?? [],
    [gameState.dealerHand.cards]
  );

  // Register and immediately mark cards as animated when dealing animation is disabled
  useEffect(() => {
    if (isMobile && gameState.playerHands.length > 2) {
      const queue = buildCardQueue(playerHands, dealerCards);
      queue.forEach(({ position, card }) => {
        const cardId = animationManager.registerCard(position, card);
        // Only mark as animated if not already animated to avoid unnecessary updates
        if (!animationManager.hasBeenAnimated(cardId)) {
          animationManager.markAsAnimated(cardId);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // animationManager methods (registerCard, markAsAnimated, hasBeenAnimated) are stable callbacks
    // and don't need to be in deps - using managerRef would cause stale closures
    // Excluding animationManager object prevents infinite loops since it's recreated on each render
  }, [
    isMobile,
    gameState.playerHands.length,
    playerHands,
    dealerCards,
    // Note: animationManager methods are stable, but the object itself changes on each render
    // We exclude it to prevent infinite loops - the methods are wrapped in useCallback
  ]);

  const dealerHandShowAllCards = useMemo(
    () => gameState.dealerHand.showAllCards,
    [gameState.dealerHand.showAllCards]
  );

  const activeHandIndex = gameState.currentHandIndex ?? 0;

  const actionSource = useMemo(
    () =>
      availableActions && availableActions.length > 0 ? availableActions : [],
    [availableActions]
  );

  const shouldShowPlayerHands = useMemo(() => {
    return (
      gameState.gamePhase !== GamePhaseType.BETTING &&
      gameState.playerHands.length > 0
    );
  }, [gameState.gamePhase, gameState.playerHands]);

  const backgroundTexture = useMemo(() => {
    if (!assetsLoaded) {
      return null;
    }
    return getBackgroundTexture(isMobile);
  }, [isMobile, assetsLoaded]);

  const deckTexture = useMemo(() => {
    if (!assetsLoaded) {
      return null;
    }
    return getUITexture('deck');
  }, [assetsLoaded]);

  // Check if conditions are met for showing shuffle button (before delay)
  const canShowShuffleModal = useMemo(() => {
    // Only show View Shuffle when the resolution modal is displayed
    // This matches the conditions for ResultModal display
    return (
      gameState?.gamePhase === GamePhaseType.FINISHED &&
      gameState?.result &&
      !isActionInProgress &&
      shuffleVerification?.isSaltRevealed &&
      shuffleVerification?.salt !== undefined &&
      shuffleVerification?.shuffledDeck !== undefined
    );
  }, [
    gameState?.gamePhase,
    gameState?.result,
    isActionInProgress,
    shuffleVerification?.isSaltRevealed,
    shuffleVerification?.salt,
    shuffleVerification?.shuffledDeck,
  ]);

  // Add 1 second delay before showing View Shuffle button
  useEffect(() => {
    if (canShowShuffleModal) {
      setShuffleButtonDelayPassed(false);
      const timer = setTimeout(() => {
        setShuffleButtonDelayPassed(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShuffleButtonDelayPassed(false);
    }
  }, [canShowShuffleModal]);

  const shouldShowShuffleModal =
    canShowShuffleModal && shuffleButtonDelayPassed;

  const mainBet = useMemo(() => {
    return gameState.gamePhase === GamePhaseType.BETTING
      ? gameState.pendingBet
      : gameState.totalWagered;
  }, [gameState.gamePhase, gameState.pendingBet, gameState.totalWagered]);

  const gameMode = useMemo(() => {
    return gameState.gameMode;
  }, [gameState.gameMode]);

  const gameModeText = useMemo(() => {
    return gameMode === GameMode.FREE_PLAY ? 'FREE PLAY' : 'REAL MONEY';
  }, [gameMode]);

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }}>
      {/* Always render Application to prevent crashes on state changes */}
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
            {/* Background - Full screen sprite with marbling effect - RENDER FIRST */}
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

            {/* Deck */}
            {(() => {
              const deckWidth = getDeckWidth(false);
              const deckHeight = getDeckHeight(false);
              const deckX = isMobile
                ? width + 20 - deckWidth / 2
                : positions.deck.x;
              const deckY = isMobile ? deckHeight / 2 - 50 : positions.deck.y;

              return (
                <>
                  {deckTexture && (
                    <pixiSprite
                      texture={deckTexture}
                      x={deckX}
                      y={deckY}
                      anchor={0.5}
                      width={deckWidth}
                      height={deckHeight}
                      filters={dropShadowFilter}
                    />
                  )}
                  {/* View shuffle */}
                  {shouldShowShuffleModal && (
                    <PixiDrawContainer
                      width={isMobile ? 62 : 150}
                      height={isMobile ? 30 : 29}
                      x={isMobile ? positions.deck.x + 35 : positions.deck.x}
                      y={deckY + (isMobile ? 80 : 75)}
                      interactive={true}
                      onPointer={() => setShuffleModalOpen(!shuffleModalOpen)}
                    >
                      <pixiText
                        text={'VIEW SHUFFLE'}
                        anchor={0.5}
                        x={0}
                        y={0}
                        style={
                          isMobile ? UI_STYLES.xxsLabel : UI_STYLES.baseLabel
                        }
                      />
                    </PixiDrawContainer>
                  )}
                </>
              );
            })()}

            {/* Dealer's Hand - Hide during initial deal until dealer cards are placed */}
            {shouldShowDealerHand && (
              <HandSprite
                cards={gameState.dealerHand.cards}
                x={positions.dealer.x}
                y={positions.dealer.y}
                label="DEALER"
                animateIn={false}
                isMobile={isMobile}
                animatedCardIds={animatedCardIds}
                isDealer={true}
                isActionInProgress={isActionInProgress}
                isDealing={isDealing}
                gamePhase={gameState.gamePhase}
                allPlayerCards={playerHands.flat().length}
                availableActions={availableActions}
                onAction={onAction}
                onDealerHoleFlipComplete={handleDealerHoleFlipComplete}
              />
            )}

            {/* SideBet */}
            <SideBet
              gameState={gameState}
              position={positions.sidebet}
              width={width}
              height={height}
              isMobile={isMobile}
              onAction={onAction}
              onSelectedSectionChange={setSelectedSideBetSection}
              onSwitchMode={onSwitchMode}
              hideMainBetChips={hideMainBetChipsForLoss}
            />
            {/* Player Hands - Hide during initial dealing, but show during hit animations */}
            {shouldShowPlayerHands &&
              (isMobile && gameState.playerHands.length > 2 ? (
                <MobilePlayerHandsContainer
                  gameState={gameState}
                  basePosition={positions.player}
                  isActionInProgress={isActionInProgress}
                  isDealing={isDealing}
                  onAction={onAction}
                  animatedCardIds={animatedCardIds}
                  isMobile={isMobile}
                  balancePosition={positions.insuranceChip}
                />
              ) : (
                gameState.playerHands.map((hand, index) => (
                  <PlayerHandSprite
                    key={`player-hand-${index}`}
                    hand={hand}
                    handIndex={index}
                    gameState={gameState}
                    position={playerHandPositions[index] ?? positions.player}
                    isMobile={isMobile}
                    onAction={onAction}
                    animatedCardIds={animatedCardIds}
                    isActionInProgress={isActionInProgress}
                    isDealing={isDealing}
                    balancePosition={positions.insuranceChip}
                  />
                ))
              ))}
            {/* Dealing Animation - Renders on top of deck */}

            <DealingAnimationSprite
              deckX={
                isMobile
                  ? width + 35 - getDeckWidth(false) / 2
                  : positions.deck.x
              }
              deckY={
                isMobile ? getDeckHeight(false) / 2 - 50 : positions.deck.y
              }
              dealerY={positions.dealer.y}
              playerY={positions.player.y}
              centerX={width / 2}
              isMobile={isMobile}
              dealerCards={dealerCards}
              playerHandPositions={playerHandPositions}
              activeHandIndex={activeHandIndex}
              playerHands={playerHands}
              dealerHandShowAllCards={dealerHandShowAllCards}
              animationManager={animationManager}
            />

            {/* Particle Effects */}
            {showWinParticles && (
              <ChipSplash
                x={positions.chips.x}
                y={positions.chips.y}
                active={showWinParticles}
              />
            )}

            {showConfetti && (
              <Confetti active={showConfetti} canvasWidth={width} />
            )}

            {/* Chip Animations for Wins and Losses */}
            <ChipAnimationManager
              gameState={gameState}
              positions={{
                dealer: positions.dealer,
                bet: positions.sidebet,
                balance: {
                  x: width / 2 - 353 / 2 + 97 / 2, // Balance is on left side: center - half container width + half balance width
                  y: positions.chipButtons.y,
                },
              }}
              isDealing={isDealing}
              onLossAnimationStart={() => setHideMainBetChipsForLoss(true)}
            />

            {/* Bet Info Display */}
            <BetInfoDisplay
              mainBet={mainBet}
              pairBet={gameState.pairBet}
              twentyOnePlusThreeBet={gameState.twentyOnePlusThreeBet}
              sidebetResults={gameState.sidebetResults}
              totalWon={gameState.totalWon}
              result={gameState.result}
              right={positions.wallet.right}
              y={positions.wallet.y}
              width={width}
              height={height}
              isMobile={isMobile}
            />

            {/* Action buttons driven by availableActions */}
            <ActionButtons
              availableActions={actionSource}
              gameState={gameState}
              width={width}
              isMobile={isMobile}
              isActionInProgress={isActionInProgress}
              yPosition={positions.buttons.y}
              onAction={onAction}
            />
            {/* Balance and chip selection */}
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
                  canSelectChips={gameState.gamePhase === GamePhaseType.BETTING}
                  isActionInProgress={isActionInProgress}
                  onSelectChip={handleChipSelect}
                />
              </layoutContainer>
            </layoutContainer>

            {/* Game Mode Banner */}
            <GameModeBanner
              x={positions.errorContainer.x}
              y={positions.errorContainer.y}
              text={gameModeText}
              style={TEXT_STYLES.message}
              width={width}
              isMobile={isMobile}
            />

            {/* Side Bet Win Notification */}
            <SideBetNotification
              sidebetResults={gameState.sidebetResults || []}
              width={width}
              isActionInProgress={isActionInProgress}
            />

            {/* Error Message */}
            <ErrorContainer
              x={positions.errorContainer.x}
              y={positions.errorContainer.y}
              error={error}
              style={TEXT_STYLES.message}
              width={width}
              isActionInProgress={isActionInProgress}
              onClearError={clearError}
            />

            {/* PixiJS Modals - Must be inside Application for PixiJS context */}
            <GameModals
              gameState={gameState}
              width={width}
              height={height}
              isMobile={isMobile}
              availableActions={actionSource}
              shuffleVerification={shuffleVerification ?? {}}
              isActionInProgress={isActionInProgress}
              isDealing={isDealing}
              shuffleModalOpen={shuffleModalOpen}
              setShuffleModalOpen={setShuffleModalOpen}
            />
            {/* Back Button - Top Left */}
            {isMobile && (
              <BackButton
                x={positions.rulesButton.x - 10}
                y={positions.rulesButton.y - 25}
              />
            )}

            <pixiContainer
              x={positions.rulesButton.x}
              y={positions.rulesButton.y}
              zIndex={1}
            >
              {/* Rules Button - Top Left */}
              <ButtonSprite
                text="RULES"
                x={0}
                y={0}
                width={gameConstants.rulesButtonSize.width}
                height={gameConstants.rulesButtonSize.height}
                color="white"
                onClick={onOpenRulesModal}
                fontSize={isMobile ? 14 : 16}
                zIndex={1}
              />
              {/* Volume Button */}
              <VolumeButtonWithSlider
                x={isMobile ? -16 : -23}
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

            {/* Rules Modal - PixiJS version */}
            <RulesModal
              isOpen={rulesModalOpen}
              onClose={onCloseRulesModal}
              centerX={width / 2}
              centerY={height / 2}
              isMobile={isMobile}
            />
          </>
        ) : null}
      </Application>
    </div>
  );
}
