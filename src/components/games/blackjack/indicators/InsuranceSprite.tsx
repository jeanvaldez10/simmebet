import { GameActionType } from '@/types/games/blackjack/game';
import { ActionPromptSprite } from './ActionPromptSprite';

type InsuranceSpriteProps = {
  isMobile: boolean;
  onAction?: (action: GameActionType, amount?: number) => void;
  fontSize: number;
  disabled?: boolean;
};

const INSURANCE_BUTTONS = [
  { text: 'NO', action: GameActionType.DECLINE_INSURANCE, color: 'red' as const },
  { text: 'YES', action: GameActionType.INSURANCE, color: 'blue' as const },
];

function InsuranceSprite({
  isMobile,
  onAction,
  fontSize,
  disabled,
}: InsuranceSpriteProps) {
  return (
    <ActionPromptSprite
      title="INSURANCE"
      buttons={INSURANCE_BUTTONS}
      isMobile={isMobile}
      onAction={onAction}
      fontSize={fontSize}
      disabled={disabled}
      iconTexture="insurance"
    />
  );
}

export default InsuranceSprite;
