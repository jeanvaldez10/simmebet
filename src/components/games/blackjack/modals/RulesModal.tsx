/**
 * Rules Modal Component (PixiJS with Layout)
 *
 * Displays game rules including side bet payouts and surrender rules
 */

'use client';

import { useMemo, useEffect } from 'react';
import { TextStyleOptions } from 'pixi.js';
import { LayoutStyles } from '@pixi/layout';
import {
  RULES_DATA,
  type PayoutCardData,
  type RuleCardData,
} from '@/utils/games/blackjack/rulesData';
import {
  getTitleStyle,
  getSubtitleStyle,
  getSectionTitleStyle,
  getDescriptionStyle,
  getHandNameStyle,
  getPayoutStyle,
  getDetailStyle,
  getRuleCardTitleStyle,
} from '@/utils/games/blackjack/rulesModalStyles';
import { ModalLayoutContainer } from '../containers';
import { ButtonSprite } from '../buttons/ButtonSprite';
import { getIconTexture } from '@/utils/games/blackjack/client/pixiAssets';
import { UpdatableLayoutText } from '../extras/UpdatableLayoutText';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerX: number;
  centerY: number;
  isMobile?: boolean;
}

export function RulesModal({
  isOpen,
  onClose,
  centerX,
  centerY,
  isMobile = false,
}: RulesModalProps) {
  // Modal dimensions
  const modalWidth = isMobile ? 320 : 500;
  const modalHeight = isMobile ? 400 : 500;
  const modalX = centerX - modalWidth / 2;
  const modalY = centerY - modalHeight / 2;

  // Styles - memoized to avoid recreating on every render
  const titleStyle = useMemo(() => getTitleStyle(isMobile), [isMobile]);
  const subtitleStyle = useMemo(() => getSubtitleStyle(isMobile), [isMobile]);
  const sectionTitleStyle = useMemo(
    () => getSectionTitleStyle(isMobile),
    [isMobile]
  );
  const descriptionStyle = useMemo(
    () => getDescriptionStyle(isMobile),
    [isMobile]
  );
  const handNameStyle = useMemo(() => getHandNameStyle(isMobile), [isMobile]);
  const payoutStyle = useMemo(() => getPayoutStyle(isMobile), [isMobile]);
  const detailStyle = useMemo(() => getDetailStyle(isMobile), [isMobile]);

  const closeButtonWidth = isMobile ? 120 : 150;
  const closeButtonHeight = isMobile ? 35 : 40;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalLayoutContainer
      modalWidth={modalWidth}
      modalHeight={modalHeight}
      modalX={modalX}
      modalY={modalY}
    >
      {/* Main Content Container */}
      <layoutContainer layout={styles.mainContainer}>
        {/* Header Section */}
        <layoutContainer layout={styles.headerContainer}>
          {/* Title */}
          <UpdatableLayoutText
            text="Game Rules"
            layout={styles.title}
            style={titleStyle}
          />
          {/* Close Button */}
          <layoutContainer layout={styles.closeButtonContainer}>
            <pixiSprite
              texture={getIconTexture('xButton')}
              anchor={0.5}
              scale={0.8}
              eventMode="static"
              cursor="pointer"
              onPointerDown={onClose}
              onTap={onClose}
            />
          </layoutContainer>
          {/* Subtitle */}
          <UpdatableLayoutText
            text="Side Bet Payouts, Surrenders, Split & Insurance Rules"
            layout={styles.subtitle}
            style={subtitleStyle}
            alpha={0.8}
          />
        </layoutContainer>

        {/* Scrollable Content Area */}
        <layoutContainer layout={styles.scrollContainer}>
          <layoutContainer layout={styles.contentInner}>
            {/* Map through all rule sections */}
            {RULES_DATA.map((section, sectionIndex) => (
              <layoutContainer
                key={`section-${sectionIndex}`}
                layout={styles.sectionContainer}
              >
                {/* Section Title */}
                <UpdatableLayoutText
                  text={section.title}
                  layout={styles.sectionTitle}
                  style={sectionTitleStyle}
                />

                {/* Section Description */}
                <UpdatableLayoutText
                  text={section.description}
                  layout={styles.sectionDescription}
                  style={descriptionStyle}
                  alpha={0.9}
                />

                {/* Render cards based on section type */}
                {section.type === 'payout'
                  ? // Payout Cards
                    (section.items as PayoutCardData[]).map(
                      (item, itemIndex) => (
                        <PayoutCard
                          key={`payout-${sectionIndex}-${itemIndex}`}
                          handName={item.handName}
                          payout={item.payout}
                          description={item.description}
                          handNameStyle={handNameStyle}
                          payoutStyle={payoutStyle}
                          detailStyle={detailStyle}
                          isMobile={isMobile}
                        />
                      )
                    )
                  : // Rule Cards
                    (section.items as RuleCardData[]).map((item, itemIndex) => (
                      <RuleCard
                        key={`rule-${sectionIndex}-${itemIndex}`}
                        title={item.title}
                        description={item.description}
                        detailStyle={descriptionStyle}
                        isMobile={isMobile}
                      />
                    ))}
              </layoutContainer>
            ))}
          </layoutContainer>
        </layoutContainer>

        {/* Footer with Close Button */}
        <layoutContainer layout={styles.footerContainer}>
          <layoutContainer
            layout={{ width: closeButtonWidth, height: closeButtonHeight }}
          >
            <ButtonSprite
              text="CLOSE"
              x={closeButtonWidth / 2}
              y={closeButtonHeight / 2}
              width={closeButtonWidth}
              height={closeButtonHeight}
              color="orange"
              onClick={onClose}
              fontSize={isMobile ? 14 : 18}
            />
          </layoutContainer>
        </layoutContainer>
      </layoutContainer>
    </ModalLayoutContainer>
  );
}

interface PayoutCardProps {
  handName: string;
  payout: number;
  description: string;
  handNameStyle: TextStyleOptions;
  payoutStyle: TextStyleOptions;
  detailStyle: TextStyleOptions;
  isMobile: boolean;
}

function PayoutCard({
  handName,
  payout,
  description,
  handNameStyle,
  payoutStyle,
  detailStyle,
  isMobile,
}: PayoutCardProps) {
  return (
    <layoutContainer layout={getCardStyles(isMobile, 'payout')}>
      {/* Top row: Hand name and payout */}
      <layoutContainer layout={styles.payoutCardTopRow}>
        <UpdatableLayoutText
          text={handName}
          layout={styles.cardText}
          style={handNameStyle}
        />
        <UpdatableLayoutText
          text={`${payout}:1`}
          layout={styles.cardText}
          style={payoutStyle}
        />
      </layoutContainer>

      {/* Bottom: Description */}
      <UpdatableLayoutText
        text={description}
        layout={styles.cardDescription}
        style={detailStyle}
        alpha={0.7}
      />
    </layoutContainer>
  );
}

interface RuleCardProps {
  title: string;
  description: string;
  detailStyle: TextStyleOptions;
  isMobile: boolean;
}

function RuleCard({
  title,
  description,
  detailStyle,
  isMobile,
}: RuleCardProps) {
  const titleStyle = useMemo(() => getRuleCardTitleStyle(isMobile), [isMobile]);

  return (
    <layoutContainer layout={getCardStyles(isMobile, 'rule')}>
      {/* Title */}
      <UpdatableLayoutText
        text={title}
        layout={styles.cardText}
        style={titleStyle}
      />

      {/* Description */}
      <UpdatableLayoutText
        text={description}
        layout={styles.cardDescription}
        style={detailStyle}
        alpha={0.8}
      />
    </layoutContainer>
  );
}

const styles: Record<string, LayoutStyles> = {
  mainContainer: {
    width: '100%',
    height: '100%',
    flexShrink: 0,
    flexDirection: 'column',
    padding: 16,
    gap: 16,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    gap: 12,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 8,
    right: 0,
  },
  title: {
    height: 'intrinsic',
    width: '100%',
    objectFit: 'none',
  },
  subtitle: {
    objectFit: 'none',
    height: 'intrinsic',
  },
  scrollContainer: {
    width: '100%',
    flexDirection: 'column',
    flex: 1,
  },
  contentInner: {
    width: '100%',
    flexDirection: 'column',
    gap: 20,
    paddingBottom: 16,
    overflow: 'scroll',
  },
  sectionContainer: {
    width: '100%',
    flexDirection: 'column',
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 4,
  },
  sectionTitle: {
    objectFit: 'none',
    height: 'intrinsic',
    objectPosition: 'left',
  },
  sectionDescription: {
    objectFit: 'none',
    height: 'intrinsic',
    objectPosition: 'left',
  },
  footerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  closeButtonWrapper: {},
  cardText: {
    objectFit: 'none',
    width: 'intrinsic',
    height: 'intrinsic',
  },
  cardDescription: {
    height: 'intrinsic',
    width: '100%',
    objectFit: 'none',
    objectPosition: 'left',
  },
  payoutCard: {
    width: '100%',
    backgroundColor: '#00000066',
    borderColor: '#fbbf2440',
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'space-between',
  },
  payoutCardTopRow: {
    width: '100%',
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ruleCard: {
    width: '100%',
    backgroundColor: '#00000066',
    borderColor: '#fbbf2440',
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'column',
    gap: 8,
  },
};

// Helper function to get card styles with dynamic padding
const getCardStyles = (
  isMobile: boolean,
  type: 'payout' | 'rule'
): LayoutStyles => {
  const padding = isMobile ? 8 : 10;
  const baseStyle = type === 'payout' ? styles.payoutCard : styles.ruleCard;
  return {
    ...baseStyle,
    padding,
  };
};
