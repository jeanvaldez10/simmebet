import { useDropShadowFilter } from "@/hooks/games/blackjack/useDropShadowFilter";
import { getIconTexture } from "@/utils/games/blackjack/client/pixiAssets";

interface PixiDrawContainerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  children?: React.ReactNode;
  interactive?: boolean;
  onPointer?: () => void;
}

export function PixiDrawContainer({
  width,
  height,
  x = 0,
  y = 0,
  children,
  onPointer,
  interactive
}: PixiDrawContainerProps) {
  const dropShadowFilter = useDropShadowFilter();

  return (
    <pixiContainer
      x={x}
      y={y}
      interactive={interactive}
      eventMode={"static"}
      cursor={interactive ? "pointer" : "not-allowed"}
      onPointerDown={onPointer}>
      <pixiSprite
        texture={getIconTexture("draw")}
        x={0}
        y={0}
        width={width}
        height={height}
        anchor={{ x: 0.5, y: 0.5 }}
        filters={dropShadowFilter}
      />
      {children}
    </pixiContainer>
  );
}

