import { getIconTexture } from '@/utils/games/common/pixiAssets';
import { PixiSquareContainer } from './PixiSquareContainer';

interface PixiFlagContainerProps {
  hitButtonX: number;
  buttonWidth: number;
  yPosition: number;
  buttonHeight: number;
  gap: number;
  onClick?: () => void;
  squreWidth: number;
  squreHeight: number;
}
function PixiFlagContainer({
  hitButtonX,
  buttonWidth,
  yPosition,
  buttonHeight,
  onClick,
  squreHeight,
  squreWidth,
}: PixiFlagContainerProps) {
  return (
    <PixiSquareContainer
      width={squreWidth}
      height={squreHeight}
      color={0xfe4c40}
      x={hitButtonX + buttonWidth}
      y={yPosition - buttonHeight}
      alpha={1}
      pointerdown={onClick}
      interactive={true}
    >
      <pixiSprite
        texture={getIconTexture('flag')}
        x={0}
        y={0}
        width={16}
        height={16}
        anchor={{ x: 0.5, y: 0.5 }}
      />
    </PixiSquareContainer>
  );
}

export default PixiFlagContainer;
