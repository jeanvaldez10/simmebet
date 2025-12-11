import { useState } from "react";
import { getChipTexture } from "@/utils/games/blackjack/client/pixiAssets";

interface ChipButtonProps {
  value: number;
  x: number;
  y: number;
  disabled?: boolean;
  onClick?: () => void;
}

export function ChipButton({
  value,
  x,
  y,
  disabled = false,
  onClick,
}: ChipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  let texture;
  try {
    texture = getChipTexture(value);
  } catch (error) {
    console.error(`Failed to load chip texture for button ${value}:`, error);
    return null;
  }

  const chipScale = isHovered && !disabled ? 0.27 : 0.25;
  const chipAlpha = disabled ? 0.5 : 1;

  return (
    <pixiContainer x={x} y={y}>
      <pixiSprite
        texture={texture}
        anchor={0.5}
        scale={chipScale}
        alpha={chipAlpha}
        eventMode={disabled ? "none" : "static"}
        cursor={disabled ? "not-allowed" : "pointer"}
        onPointerEnter={() => !disabled && setIsHovered(true)}
        onPointerLeave={() => !disabled && setIsHovered(false)}
        onPointerDown={() => !disabled && onClick?.()}
        onTap={() => !disabled && onClick?.()}
      />
    </pixiContainer>
  );
}

