import { useDropShadowFilter } from "@/hooks/games/blackjack/useDropShadowFilter";
import { getIconTexture } from "@/utils/games/blackjack/client/pixiAssets";

interface PixiSideBetContainerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  children?: React.ReactNode;
  rotation?: number;
  text?: string;
  interactive?: boolean;
  pointerdown?: () => void;
  pointer_down_available?: boolean;
  highlighted?: boolean;
  zIndex?: number;
}

export function PixiSideBetContainer({
  width,
  height,
  x = 0,
  y = 0,
  children,
  rotation = 0,
  text = "sidebet",
  interactive = false,
  pointerdown,
  pointer_down_available = false,
  highlighted = false,
  zIndex
}: PixiSideBetContainerProps) {
  const handlePointerDown = () => {
    if (pointer_down_available && pointerdown) pointerdown();
  };
  const highlightTexture = (text === "chips" && highlighted) ? "chipsHighlight" :
    (text === "sidebet" && highlighted) ?
      "sidebetHighlight" : text;
  const dropShadowFilter = useDropShadowFilter();
  return (
    <pixiContainer
      x={x}
      y={y}
      rotation={rotation}
      interactive={interactive}
      eventMode={interactive ? "static" : "none"}
      onPointerDown={handlePointerDown}
      zIndex={zIndex}
    >
      <pixiSprite
        texture={getIconTexture(highlightTexture)}
        x={0}
        y={0}
        width={width}
        height={height}
        anchor={{ x: 0.5, y: 0.5 }}
        interactive={interactive}
        eventMode={interactive ? "static" : "none"}
        onPointerDown={handlePointerDown}
        filters={dropShadowFilter}
      />
      {children}
    </pixiContainer>
  );
}

