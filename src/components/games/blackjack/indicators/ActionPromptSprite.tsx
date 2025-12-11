import { GameActionType } from '@/types/games/blackjack/game';
import { getIconTexture } from '@/utils/games/blackjack/client/pixiAssets';
import { TextStyle } from 'pixi.js';
import { ButtonSprite } from '../buttons/ButtonSprite';

type ButtonConfig = {
  text: string;
  color: 'red' | 'blue';
  action?: GameActionType; // For InsuranceSprite style
  onClick?: () => void; // For SpliteSprite style
};

type ActionPromptSpriteProps = {
  title: string;
  buttons: ButtonConfig[];
  isMobile: boolean;
  onAction?: (action: GameActionType, amount?: number) => void; // For InsuranceSprite style
  fontSize: number;
  disabled?: boolean;
  iconTexture?: string; // Defaults to 'insurance'
};

const BUTTON_GAP = 15;
const BUTTON_WIDTH = 72;

export function ActionPromptSprite({
  title,
  buttons,
  isMobile,
  onAction,
  fontSize,
  disabled,
  iconTexture = 'insurance',
}: ActionPromptSpriteProps) {
  const buttonHeight = isMobile ? 32 : 36;
  const spriteHeight = isMobile ? 85 : 92;
  const buttonY = 12;

  const totalWidth = buttons.length * BUTTON_WIDTH;
  const totalWidthWithGaps = totalWidth + BUTTON_GAP * (buttons.length - 1);
  const startX = -totalWidthWithGaps / 2;

  const textOverlayStyle = new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize,
    fill: disabled ? '#666666' : '#000000',
    align: 'center',
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 1,
  });

  const handleButtonClick = (button: ButtonConfig) => () => {
    if (disabled) return;

    // Priority: onClick callback > onAction with action type
    if (button.onClick) {
      button.onClick();
    } else if (button.action && onAction) {
      onAction(button.action);
    }
  };

  return (
    <pixiContainer x={0} y={0} zIndex={1000} eventMode="passive">
      <pixiSprite
        texture={getIconTexture(iconTexture)}
        x={0}
        y={0}
        width={isMobile ? 185 : 190}
        height={spriteHeight}
        zIndex={2000}
        anchor={{ x: 0.5, y: 0.5 }}
        eventMode="passive"
      />
      <pixiText
        text={title}
        x={0}
        y={-20}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={2001}
        style={textOverlayStyle}
      />
      {buttons.map((button, index) => {
        const x =
          startX + BUTTON_WIDTH / 2 + index * (BUTTON_WIDTH + BUTTON_GAP);
        return (
          <ButtonSprite
            key={index}
            text={button.text}
            x={x}
            y={buttonY}
            width={BUTTON_WIDTH}
            height={buttonHeight}
            color={button.color}
            onClick={handleButtonClick(button)}
            fontSize={12}
            zIndex={2002}
            radius={12}
            disabled={disabled}
            showShadow={false}
          />
        );
      })}
    </pixiContainer>
  );
}
