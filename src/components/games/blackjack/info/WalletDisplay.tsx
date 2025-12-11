import { TextStyle } from "pixi.js";
import { PixelatedContainer } from "../containers/PixelatedContainer";

interface WalletDisplayProps {
  address: string;
  x: number;
  y: number;
  anchor?: { x: number; y: number };
  isMobile?: boolean;
}

export function WalletDisplay({
  address,
  x,
  y,
  anchor = { x: 1, y: 0 },
  isMobile = false,
}: WalletDisplayProps) {
  const height = 64;
  const width = 240;
  // Mobile: stacked with small text and green address
  if (isMobile) {
    const labelStyle = new TextStyle({
      fontFamily: "Minecraft, monospace",
      fontSize: 10,
      fill: "#ffffff",
      letterSpacing: 1,
      align: anchor.x === 0 ? "left" : "right",
    });

    const addressStyle = new TextStyle({
      fontFamily: "Minecraft, monospace",
      fontSize: 10,
      fill: "#00ff00", // Green
      letterSpacing: 1,
      align: anchor.x === 0 ? "left" : "right",
    });

    return (
      <pixiContainer x={x} y={y}>
        {/* CONNECTED label */}
        <pixiText
          text="CONNECTED:"
          x={0}
          y={0}
          anchor={anchor}
          style={labelStyle}
        />
        {/* Wallet address on second line */}
        <pixiText
          text={address}
          x={0}
          y={12}
          anchor={anchor}
          style={addressStyle}
        />
      </pixiContainer>
    );
  }

  // Desktop: single line, normal size
  const style = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    fill: "#ffffff",
    letterSpacing: 2,
    align: anchor.x === 0 ? "left" : "right",
    dropShadow: {
      color: "#00000080",
      distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
      angle: Math.atan2(1.5, 1.5),
      blur: 0,
    },
  });

  return (
    <PixelatedContainer width={width} height={height} x={x} y={y + 24}>
      <pixiText
        text={`CONNECTED: ${address}`}
        x={anchor.x === 0 ? -width / 2 + 8 : width / 2 - 10}
        y={-16}
        anchor={anchor}
        style={style}
      />
    </PixelatedContainer>
  );
}

