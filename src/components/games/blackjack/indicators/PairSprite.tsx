import { TextStyle } from "pixi.js";
import { PixiSquareContainer } from "../containers";
type PairSpriteProps = {
  x: number;
  y: number;
  text: string;
  position?: "left" | "right";
};
function PairSprite({ x, y, text, position }: PairSpriteProps) {
  const scoreStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 16,
    fill: "#ffffff",
    align: "center",
    fontWeight: "500",
    dropShadow: {
      color: "#00000080",
      distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
      angle: Math.atan2(1.5, 1.5),
      blur: 0,
    },
  });
  const widthHeight = position === "left" ? 86 : 72;

  return (
    <PixiSquareContainer
      width={widthHeight}
      height={widthHeight}
      position={position}
      x={x}
      y={y}
    >
      <pixiText
        text={text}
        anchor={{ x: -0.5, y: 0.5 }}
        x={0}
        y={0}
        style={scoreStyle}
      />
    </PixiSquareContainer>
  );
}

export default PairSprite;
