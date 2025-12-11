import { ReactNode, useCallback } from "react";
import { Graphics } from "pixi.js";
import { DropShadowFilter } from "pixi-filters";

interface ModalGraphicContainerProps {
  modalX: number;
  modalY: number;
  children: ReactNode;
  modalWidth: number;
  modalHeight: number;
}

export function ModalGraphicContainer({
  modalX,
  modalY,
  children,
  modalWidth,
  modalHeight,
}: ModalGraphicContainerProps) {
  const drawBackground = useCallback(
    (g: Graphics) => {
      g.clear();
      const offset = 4;
      // Modal background - #182325 with 100% opacity
      g.roundRect(0, 0, modalWidth, modalHeight, 0);
      g.fill({ color: 0x182325, alpha: 1 });
      // Top right
      g.roundRect(modalWidth, offset, offset, offset * 2, 0);
      g.fill({ color: "0x182325", alpha: 1 });
      g.roundRect(modalWidth, offset * 3, offset * 2, offset, 0);
      g.fill({ color: "0x182325", alpha: 1 });

      // Top left
      g.roundRect(-offset, offset, offset, offset * 2, 0);
      g.fill({ color: "0x182325", alpha: 1 });
      g.roundRect(-offset * 2, offset * 3, offset * 2, offset, 0);
      g.fill({ color: "0x182325", alpha: 1 });

      // Bottom right
      g.roundRect(modalWidth, modalHeight - offset * 3, offset, offset * 2, 0);
      g.fill({ color: "0x182325", alpha: 1 });
      g.roundRect(
        modalWidth,
        modalHeight - offset * 5,
        offset * 2,
        offset * 2,
        0
      );
      g.fill({ color: "0x182325", alpha: 1 });

      // Bottom left
      g.roundRect(-offset, modalHeight - offset * 3, offset, offset * 2, 0);
      g.fill({ color: "0x182325", alpha: 1 });
      g.roundRect(
        -offset * 2,
        modalHeight - offset * 5,
        offset * 2,
        offset * 2,
        0
      );
      g.fill({ color: "0x182325", alpha: 1 });

      // rest
      g.roundRect(
        -offset * 2,
        offset * 4,
        offset * 2,
        modalHeight - offset * 8,
        0
      );
      g.fill({ color: "0x182325", alpha: 1 });
      g.roundRect(
        modalWidth,
        offset * 4,
        offset * 2,
        modalHeight - offset * 8,
        0
      );
      g.fill({ color: "0x182325", alpha: 1 });
    },
    [modalWidth, modalHeight]
  );
  return (
    <pixiContainer x={modalX} y={modalY} sortableChildren={true} zIndex={1}>
      {/* Modal Background */}
      <pixiGraphics
        draw={drawBackground}
        filters={
          new DropShadowFilter({
            color: "0x000000",
            alpha: 0.6,
            blur: 0.25,
            offset: { x: 8, y: 8 },
          })
        }
      />
      {children}
    </pixiContainer>
  );
}

