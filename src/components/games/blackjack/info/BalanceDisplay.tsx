import { useCallback } from "react";
import { Graphics } from "pixi.js";
import { PixiDrawContainer } from "../containers/PixiDrawContainer";
import { UI_STYLES } from "../styles";

interface BalanceDisplayProps {
  balance: number;
  x: number;
  y: number;
}

export function BalanceDisplay({ balance, x, y }: BalanceDisplayProps) {
  const text = `$${balance.toLocaleString()}`;
  const width = Math.max(text.length * 9 + 50, 110);
  const height = 32;

  const drawPlusBackground = useCallback((g: Graphics) => {
    g.clear();

    const cornerSize = 4;
    const bgWidth = 24;
    const bgHeight = 24;

    // Main background body
    g.rect(
      -bgWidth / 2 + cornerSize,
      -bgHeight / 2,
      bgWidth - cornerSize * 2,
      bgHeight
    );
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Top edge extensions (horizontal) - pixelated corners
    g.rect(
      -bgWidth / 2 + cornerSize / 2,
      -bgHeight / 2,
      cornerSize / 2,
      cornerSize
    );
    g.fill({ color: 0x000000, alpha: 0.5 });

    g.rect(bgWidth / 2 - cornerSize, -bgHeight / 2, cornerSize / 2, cornerSize);
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Bottom edge extensions (horizontal)
    g.rect(
      -bgWidth / 2 + cornerSize / 2,
      bgHeight / 2 - cornerSize,
      cornerSize / 2,
      cornerSize
    );
    g.fill({ color: 0x000000, alpha: 0.5 });

    g.rect(
      bgWidth / 2 - cornerSize,
      bgHeight / 2 - cornerSize,
      cornerSize / 2,
      cornerSize
    );
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Left edge extensions (vertical)
    g.rect(
      -bgWidth / 2,
      -bgHeight / 2 + cornerSize,
      cornerSize,
      bgHeight - cornerSize * 2
    );
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Right edge extensions (vertical)
    g.rect(
      bgWidth / 2 - cornerSize,
      -bgHeight / 2 + cornerSize,
      cornerSize,
      bgHeight - cornerSize * 2
    );
    g.fill({ color: 0x000000, alpha: 0.5 });
  }, []);

  const drawPlusShadow = useCallback((g: Graphics) => {
    g.clear();

    // Drop shadow offset
    const shadowOffset = 2;

    // Vertical bar of plus (shadow) - centered on x=0
    g.rect(-1 + shadowOffset, -6 + shadowOffset, 2, 12);
    g.fill({ color: 0x000000, alpha: 0.3 });

    // Horizontal bar of plus (shadow) - centered on y=0
    g.rect(-6 + shadowOffset, -1 + shadowOffset, 12, 2);
    g.fill({ color: 0x000000, alpha: 0.3 });
  }, []);

  const drawPlus = useCallback((g: Graphics) => {
    g.clear();

    // Vertical bar of plus - centered on x=0
    g.rect(-1, -6, 2, 12);
    g.fill({ color: 0xffffff });

    // Horizontal bar of plus - centered on y=0
    g.rect(-6, -1, 12, 2);
    g.fill({ color: 0xffffff });
  }, []);

  return (
    <PixiDrawContainer width={width} height={height} x={x} y={y}>
      <pixiText
        text={text}
        anchor={0.5}
        x={-8}
        y={0}
        style={UI_STYLES.balance}
      />

      {/* Plus icon with background on the right */}
      <pixiContainer x={width / 2 - 18} y={0}>
        {/* Plus background */}
        <pixiGraphics draw={drawPlusBackground} />

        {/* Plus shadow */}
        <pixiGraphics draw={drawPlusShadow} />

        {/* Plus icon */}
        <pixiGraphics draw={drawPlus} />
      </pixiContainer>
    </PixiDrawContainer>
  );
}

