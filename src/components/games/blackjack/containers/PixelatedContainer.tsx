import { useCallback } from "react";
import { Graphics } from "pixi.js";

interface PixelatedContainerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  children?: React.ReactNode;
  drawBackgroundColor?: string;
  drawBackgroundOpacity?: string;
  position?: "left" | "right";
  rotation?: number;
  text?: string;
  interactive?: boolean;
  pointerdown?: () => void;
}

export function PixelatedContainer({
  width,
  height,
  x = 0,
  y = 0,
  children,
  drawBackgroundColor,
  drawBackgroundOpacity,
}: PixelatedContainerProps) {
  const color = drawBackgroundColor
    ? parseInt(`0x${drawBackgroundColor}`, 16)
    : 0x000000;
  const alpha =
    typeof drawBackgroundOpacity === "string"
      ? parseFloat(drawBackgroundOpacity)
      : (drawBackgroundOpacity ?? 0.3);

  const drawBackground = useCallback(
    (g: Graphics) => {
      g.clear();

      const cornerSize = 8;

      // Main background body
      g.rect(
        -width / 2 + cornerSize,
        -height / 2,
        width - cornerSize * 2,
        height
      );
      g.fill({ color, alpha });

      // Top edge extensions (horizontal) - pixelated corners
      g.rect(
        -width / 2 + cornerSize / 2,
        -height / 2,
        cornerSize / 2,
        cornerSize
      );
      g.fill({ color, alpha });

      g.rect(width / 2 - cornerSize, -height / 2, cornerSize / 2, cornerSize);
      g.fill({ color, alpha });

      // Bottom edge extensions (horizontal)
      g.rect(
        -width / 2 + cornerSize / 2,
        height / 2 - cornerSize,
        cornerSize / 2,
        cornerSize
      );
      g.fill({ color, alpha });

      g.rect(
        width / 2 - cornerSize,
        height / 2 - cornerSize,
        cornerSize / 2,
        cornerSize
      );
      g.fill({ color, alpha });

      // Left edge extensions (vertical)
      g.rect(
        -width / 2,
        -height / 2 + cornerSize,
        cornerSize,
        height - cornerSize * 2
      );
      g.fill({ color, alpha });

      // Right edge extensions (vertical)
      g.rect(
        width / 2 - cornerSize,
        -height / 2 + cornerSize,
        cornerSize,
        height - cornerSize * 2
      );
      g.fill({ color, alpha });
    },
    [width, height, color, alpha]
  );

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics
        draw={drawBackground}
        onPointerEnter={() => console.log("test")}
      />
      {children}
    </pixiContainer>
  );
}

