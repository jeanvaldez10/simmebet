import { LayoutStyles } from '@pixi/layout';

interface PixiTransparentContanerProps {
  x?: number;
  y?: number;
  children?: React.ReactNode;
  interactive?: boolean;
  pointerdown?: () => void;
  layout?: LayoutStyles;
}

export function PixiTransparentContaner({
  children,
  interactive,
  pointerdown,
  layout,
}: PixiTransparentContanerProps) {
  layout = {
    backgroundColor: '#00000040',
    borderRadius: 6,
    padding: 4,
    ...layout,
  };

  return (
    <layoutContainer
      interactive={interactive}
      eventMode={interactive ? 'static' : 'none'}
      onPointerDown={pointerdown}
      layout={layout}
    >
      <layoutContainer layout={{ width: 'intrinsic', height: 'intrinsic' }}>
        {children}
      </layoutContainer>
    </layoutContainer>
  );
}
