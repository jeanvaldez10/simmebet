import { useState, useEffect, useRef } from "react";
import { useTick } from "@pixi/react";
import { getIconTexture } from "@/utils/games/coinflip/client/pixiAssets";
import {
  CoinflipGameState,
  CoinSide,
  CoinflipStatus,
} from "@/types/games/coinflip/game";

interface PixiCoinContainerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  text: "coinFront" | "coinBack";
  gameState?: CoinflipGameState;
}

const ANIMATION_DURATION = 300; // milliseconds
const MIN_ROTATIONS = 5.5;
const MAX_ROTATIONS = 6;
const MIN_SCALE = 0.01;
const EDGE_ON_THRESHOLD = 0.5;

function getCoinSideFromGameState(
  gameState?: CoinflipGameState,
  defaultSide: "coinFront" | "coinBack" = "coinFront"
): "coinFront" | "coinBack" {
  if (gameState?.status === CoinflipStatus.FINISHED && gameState.winningSide) {
    return gameState.winningSide === CoinSide.HEADS
      ? "coinFront"
      : "coinBack";
  }
  if (gameState?.side) {
    return gameState.side === CoinSide.HEADS ? "coinFront" : "coinBack";
  }
  return defaultSide;
}

export function PixiCoinContainer({
  width,
  height,
  x,
  y,
  text,
  gameState,
}: PixiCoinContainerProps) {
  const [flipScaleY, setFlipScaleY] = useState(1);
  const [displaySide, setDisplaySide] = useState<"coinFront" | "coinBack">(
    text
  );
  const animationProgress = useRef(0);
  const isAnimating = useRef(false);
  const totalRotations = useRef(MIN_ROTATIONS);

  // Initialize animation when flipping starts
  useEffect(() => {
    if (gameState?.status === CoinflipStatus.FLIPPING && !isAnimating.current) {
      isAnimating.current = true;
      animationProgress.current = 0;
      setFlipScaleY(1);
      totalRotations.current =
        Math.random() > 0.5 ? MIN_ROTATIONS : MAX_ROTATIONS;
      setDisplaySide(getCoinSideFromGameState(gameState, text));
    } else if (gameState?.status !== CoinflipStatus.FLIPPING) {
      isAnimating.current = false;
      animationProgress.current = 0;
      setFlipScaleY(1);
    }
  }, [gameState, text]);

  // Update display side when animation stops
  useEffect(() => {
    if (!isAnimating.current) {
      setDisplaySide(getCoinSideFromGameState(gameState, text));
    }
  }, [gameState, text]);

  // Animation loop - simulates rotateX by scaling height
  useTick({
    callback: (ticker) => {
      if (
        !isAnimating.current ||
        gameState?.status !== CoinflipStatus.FLIPPING
      ) {
        return;
      }

      animationProgress.current += ticker.deltaTime;
      const progress = Math.min(
        animationProgress.current / ANIMATION_DURATION,
        1
      );
      const rotationAngle = progress * totalRotations.current * Math.PI * 2;
      const scaleY = Math.max(MIN_SCALE, Math.abs(Math.cos(rotationAngle)));

      setFlipScaleY(scaleY);

      // Swap side every half rotation when edge-on
      const halfRotations = Math.floor((rotationAngle * 180) / Math.PI / 180);
      const targetSide = halfRotations % 2 === 0 ? "coinFront" : "coinBack";

      if (displaySide !== targetSide && scaleY < EDGE_ON_THRESHOLD) {
        setDisplaySide(targetSide);
      }

      // Complete animation
      if (progress >= 1) {
        isAnimating.current = false;
        setFlipScaleY(1);
        setDisplaySide(getCoinSideFromGameState(gameState, text));
      }
    },
    isEnabled:
      isAnimating.current && gameState?.status === CoinflipStatus.FLIPPING,
  });

  const coinSide = isAnimating.current
    ? displaySide
    : getCoinSideFromGameState(gameState, text);
  const coinTexture = getIconTexture(coinSide);

  return (
    <pixiContainer x={x} y={y}>
      <pixiSprite
        texture={coinTexture}
        x={0}
        y={0}
        width={width}
        height={height * flipScaleY}
        anchor={{ x: 0.5, y: 0.5 }}
      />
    </pixiContainer>
  );
}
