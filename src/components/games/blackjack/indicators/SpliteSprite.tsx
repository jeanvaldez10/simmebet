import { ActionPromptSprite } from './ActionPromptSprite';

type SpliteSpriteProps = {
  isMobile: boolean;
  onSplit?: () => void;
  onClose?: () => void;
  fontSize: number;
  disabled?: boolean;
};

function SpliteSprite({
  isMobile,
  onSplit,
  onClose,
  fontSize,
  disabled,
}: SpliteSpriteProps) {
  const SPLIT_BUTTONS = [
    { text: 'NO', color: 'red' as const, onClick: onClose },
    { text: 'YES', color: 'blue' as const, onClick: onSplit },
  ];

  return (
    <ActionPromptSprite
      title="SPLIT"
      buttons={SPLIT_BUTTONS}
      isMobile={isMobile}
      fontSize={fontSize}
      disabled={disabled}
      iconTexture="insurance"
    />
  );
}

export default SpliteSprite;
