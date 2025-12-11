'use client';
import { useRouter } from 'next/navigation';
import { UI_STYLES } from '../blackjack/styles';
import { useCallback } from 'react';

interface BackButtonProps {
  x: number;
  y: number;
  text?: string;
}

export function BackButton({ x, y, text = '<  BACK' }: BackButtonProps) {
  const router = useRouter();
  const handleBack = useCallback(() => {
    router.push('/games');
  }, [router]);
  return (
    <pixiContainer
      x={x}
      y={y}
      eventMode="static"
      cursor="pointer"
      interactive={true}
      onPointerDown={handleBack}
      onPointerUp={handleBack}
    >
      <pixiText text={text} style={UI_STYLES.xsLabel} anchor={0.5} />
    </pixiContainer>
  );
}
