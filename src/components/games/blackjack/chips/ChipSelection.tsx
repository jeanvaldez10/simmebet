import { PixiDrawContainer } from "../containers";
import { ChipButton } from "./ChipButton";

interface GenericChipSelectionProps {
  balance: number;
  position: { x: number; y: number };
  canSelectChips: boolean;
  isActionInProgress?: boolean;
  onSelectChip: (value: number) => void;
}

export function ChipSelection({
  balance,
  position,
  canSelectChips,
  isActionInProgress = false,
  onSelectChip,
}: GenericChipSelectionProps) {
  let visibleChips: number[] = [];
  if (balance < 1000) visibleChips = [1, 5, 10, 25, 50];
  else if (balance < 5000) visibleChips = [5, 10, 25, 50, 100];
  else visibleChips = [50, 100, 500, 1000, 10000];

  return (
    <PixiDrawContainer x={position.x} y={position.y} width={246} height={50}>
      {visibleChips.map((value, index) => {
        const spacing = 44;
        const totalWidth = (visibleChips.length - 1) * spacing;
        const xOffset = -totalWidth / 2 + index * spacing;

        const disabled =
          isActionInProgress || !canSelectChips || value > balance;

        return (
          <ChipButton
            key={value}
            value={value}
            x={xOffset}
            y={0}
            disabled={disabled}
            onClick={() => onSelectChip(value)}
          />
        );
      })}
    </PixiDrawContainer>
  );
}
