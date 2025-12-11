import { useMemo } from 'react';
import { TextStyleOptions } from 'pixi.js';
import { LayoutStyles } from '@pixi/layout';
import {
  Sidebet,
  SidebetType,
  SidebetResultType,
  GameResult,
} from '@/types/games/blackjack/game';
import { UpdatableLayoutText } from '../extras/UpdatableLayoutText';
import { getGameConstants } from '@/utils/games/blackjack/client/uiConfig';

interface BetInfoDisplayProps {
  mainBet: number;
  pairBet: number;
  twentyOnePlusThreeBet: number;
  sidebetResults?: Sidebet[];
  totalWon: number;
  result?: GameResult;
  right: number;
  y: number;
  width: number;
  height: number;
  isMobile?: boolean;
}

export function BetInfoDisplay({
  mainBet,
  pairBet,
  twentyOnePlusThreeBet,
  sidebetResults = [],
  result,
  right,
  y,
  isMobile = false,
  width,
  height,
}: BetInfoDisplayProps) {
  const gameConstants = useMemo(() => getGameConstants(isMobile), [isMobile]);

  const getSidebetResult = (type: SidebetType) => {
    const result = sidebetResults.find((r) => r.type === type);
    if (!result) return null;
    if (result.result === SidebetResultType.WIN) {
      return {
        profit: result.profit || 0,
        amount: result.amount || 0,
        isWin: true,
      };
    }
    return {
      profit: -(result.amount || 0),
      amount: result.amount || 0,
      isWin: false,
    };
  };

  const infoHeight = gameConstants.betInfoDisplay.height;
  const pairResult = getSidebetResult(SidebetType.PAIR);
  const plus3Result = getSidebetResult(SidebetType.TWENTY_ONE_PLUS_THREE);

  type BetSection = {
    label: string;
    value: number;
    color: string;
    prefix: string;
  };

  const labelStyle = useMemo<TextStyleOptions>(
    () => ({
      fontFamily: 'Minecraft, monospace',
      fontSize: 12,
      fill: '#ffffff',
      letterSpacing: 1.5,
      align: 'left',
      dropShadow: {
        color: '#000000',
        distance: 2,
        angle: Math.PI / 4,
        blur: 1,
      },
    }),
    []
  );

  const betSections = useMemo(() => {
    const sections: BetSection[] = [];

    if (pairResult) {
      sections.push({
        label: 'PAIR',
        value: pairResult.profit,
        color: pairResult.isWin ? '#00ff00' : '#ff0000',
        prefix: pairResult.isWin ? '+' : '',
      });
    } else if (pairBet > 0) {
      sections.push({
        label: 'PAIR',
        value: pairBet,
        color: '#00ff00',
        prefix: '',
      });
    }

    if (plus3Result) {
      sections.push({
        label: '21+3',
        value: plus3Result.profit,
        color: plus3Result.isWin ? '#00ff00' : '#ff0000',
        prefix: plus3Result.isWin ? '+' : '',
      });
    } else if (twentyOnePlusThreeBet > 0) {
      sections.push({
        label: '21+3',
        value: twentyOnePlusThreeBet,
        color: '#00ff00',
        prefix: '',
      });
    }

    const mainBetValue =
      mainBet - (pairResult?.amount || 0) - (plus3Result?.amount || 0);
    if (mainBetValue > 0) {
      sections.push({
        label: 'MAIN',
        value: mainBetValue,
        color: '#00ff00',
        prefix: result === 'WIN' ? '+' : '',
      });
    }
    return sections;
  }, [
    pairResult,
    pairBet,
    plus3Result,
    twentyOnePlusThreeBet,
    result,
    mainBet,
  ]);

  const valueStyleBase = useMemo<TextStyleOptions>(
    () => ({
      fontFamily: 'Minecraft, monospace',
      fontSize: isMobile ? 12 : 14,
      letterSpacing: 1.5,
      align: 'left',
      fontWeight: 'bold',
      dropShadow: {
        color: '#000000',
        distance: 2,
        angle: Math.PI / 4,
        blur: 1,
      },
    }),
    [isMobile]
  );

  const containerLayout: LayoutStyles = useMemo(
    () => ({
      position: 'absolute',
      right: 0,
      left: 0,
      top: isMobile ? 0 : y,
      paddingBottom: gameConstants.betInfoDisplay.padding.bottom,
      paddingLeft: gameConstants.betInfoDisplay.padding.left,
      width: isMobile ? 'auto' : width,
      height: isMobile ? height : infoHeight,
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'flex-end',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 12,
      paddingRight: isMobile ? 0 : right,
    }),
    [
      width,
      isMobile,
      right,
      height,
      y,
      infoHeight,
      gameConstants.betInfoDisplay,
    ]
  );

  return (
    <layoutContainer
      key={isMobile ? 'mobile' : 'desktop'}
      layout={containerLayout}
      x={0}
      y={0}
    >
      {betSections.map((section) => {
        const valueStyle: TextStyleOptions = {
          ...valueStyleBase,
          fill: section.color,
        };

        return (
          <layoutContainer
            key={section.label}
            layout={{
              ...layoutStyles.sectionLayout,
              alignItems: isMobile ? 'center' : 'flex-end',
              transformOrigin: 'top',
            }}
          >
            <UpdatableLayoutText
              text={section.label}
              layout={{
                width: 'intrinsic',
                height: 'intrinsic',
                objectFit: 'none',
              }}
              style={labelStyle}
            />
            <UpdatableLayoutText
              text={`${section.prefix}$${Math.abs(section.value)}`}
              layout={{
                width: 'intrinsic',
                height: 'intrinsic',
                marginTop: 4,
                objectFit: 'none',
              }}
              style={valueStyle}
            />
          </layoutContainer>
        );
      })}
    </layoutContainer>
  );
}

const layoutStyles: Record<string, LayoutStyles> = {
  label: {
    width: 'intrinsic',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0,
  },
  sectionLayout: {
    width: 'intrinsic',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 0,
  },
};
