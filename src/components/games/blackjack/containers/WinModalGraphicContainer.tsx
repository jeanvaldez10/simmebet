import { ReactNode } from "react";
import { DropShadowFilter } from "pixi-filters";
import { usePixiPixelatedBorder } from "@/hooks/games/blackjack/usePixiBorder";

interface ModalGraphicContainerProps {
  modalX: number;
  modalY: number;
  children: ReactNode;
  width: number;
  height: number;
  borderColor: number,
  highlightColor?: number;
  highlightColor2?: number;
  busted?: boolean;
  alpha?: number;
}

export function WinModalGraphicContainer({
  modalX,
  modalY,
  children,
  width,
  height,
  borderColor,
  highlightColor,
  highlightColor2,
  busted = false,
  alpha = 1,
}: ModalGraphicContainerProps) {

  return (
    <pixiContainer x={modalX} y={modalY} sortableChildren={true} zIndex={1} alpha={alpha}>
      {/* Modal Background */}
      <pixiGraphics
        draw={usePixiPixelatedBorder({
          width,
          height,
          borderColor,
          highlightColor,
          highlightColor2,
          busted
        })}
        filters={
          new DropShadowFilter({
            color: "0x000000",
            alpha: 0.25,
            blur: 0.25,
            offset: { x: 4, y: 16 },
          })
        }
      />
      {children}
    </pixiContainer>
  );
}

