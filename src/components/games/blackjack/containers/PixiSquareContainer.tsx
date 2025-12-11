import { usePixiSquare } from "@/hooks/games/blackjack/usePixiSquare";
import { Filter } from "pixi.js";

interface PixiSquareContainerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  children?: React.ReactNode;
  position?: "left" | "right";
  interactive?: boolean;
  pointerdown?: () => void;
  highlighted?: boolean;
  color?: number;
  alpha?: number;
  filters?: Filter | readonly Filter[] | undefined;
  eventMode?: "none" | "static" | "dynamic" | "auto" | "passive";
}

export function PixiSquareContainer({
  width,
  height,
  x = 0,
  y = 0,
  children,
  position,
  interactive,
  pointerdown,
  highlighted = false,
  color,
  alpha,
  filters,
  eventMode,
}: PixiSquareContainerProps) {
  const horizontalX = position === "right" ? x : x - 62;
  
  // Determine the effective event mode
  // If eventMode is explicitly set, use it
  // Otherwise fall back to interactive prop
  const effectiveEventMode = eventMode !== undefined 
    ? eventMode 
    : (interactive ? "static" : "none");
  
  // Graphics should inherit the same event mode
  const graphicsEventMode = effectiveEventMode === "none" ? "none" : "static";
  const graphicsCursor = effectiveEventMode === "none" ? undefined : "pointer";

  return (
    <pixiContainer
      x={horizontalX}
      y={y}
      interactive={interactive}
      eventMode={effectiveEventMode}
      onPointerDown={pointerdown}>
      <pixiGraphics
        draw={usePixiSquare({ width, height, color, alpha, highlighted })}
        eventMode={graphicsEventMode}
        cursor={graphicsCursor}
        filters={filters}
      />
      {children}
    </pixiContainer>
  );
}