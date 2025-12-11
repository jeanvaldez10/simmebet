import {
  getIconTexture,
  getCardTexture,
  getCardBackTexture,
} from '@/utils/games/blackjack/client/pixiAssets';
import { Graphics } from 'pixi.js';
import { useCallback } from 'react';
import { Card, Hand, ShuffleVerification } from '@/types/games/blackjack/game';
import { Text } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import { UI_STYLES } from '../styles';
import { STANDARD_SUITS, STANDARD_RANKS } from '@/lib/games/blackjack/gameStateService';

type ShuffleModalProps = {
  isOpen: boolean;
  centerX: number;
  centerY: number;
  onClose: () => void;
  lastPlayerCards: Hand[];
  lastDealerCards: Card[];
  isMobile: boolean;
  shuffleVerification: ShuffleVerification | Record<string, never>;
};

const fullDeck: Card[] = [];

STANDARD_SUITS.forEach((suit) => {
  STANDARD_RANKS.forEach((rank) => {
    fullDeck.push({ rank, suit } as Card);
  });
});

function ShuffleModal({
  shuffleVerification,
  centerX,
  centerY,
  isOpen,
  onClose,
  lastPlayerCards,
  lastDealerCards,
  isMobile,
}: ShuffleModalProps) {
  const windowWidth = window.innerWidth;
  const modalWidth = isMobile ? windowWidth - 80 : 680;

  // Define constants
  const leftPadding = isMobile ? 12 : 48;
  const topPadding = isMobile ? 20 : 28;
  const shuffleCardSpacing = isMobile ? 2 : 3;
  
  // Mobile: 10 cards per row (10×5 = 50, + 2 remaining = 52 cards)
  // Desktop: 13 cards per row (13×4 = 52 cards)
  const cardsPerRow = isMobile ? 10 : 13;
  
  // Calculate available width and card size to fit exactly cardsPerRow
  const availableWidth = modalWidth - leftPadding * 2;
  const shuffleCardWidth = isMobile 
    ? Math.floor((availableWidth - (cardsPerRow - 1) * shuffleCardSpacing) / cardsPerRow)
    : 42;
  const shuffleCardHeight = isMobile 
    ? Math.floor(shuffleCardWidth * 1.38) // Card aspect ratio ~1.38
    : 58;
  // Always use 52 cards for row calculation since displayDeck is limited to 52
  const totalRows = Math.ceil(52 / cardsPerRow);
  
  // Calculate actual card grid width (used for aligning SHUFFLE and IS THIS FAIR?)
  const cardGridWidth = cardsPerRow * shuffleCardWidth + (cardsPerRow - 1) * shuffleCardSpacing;

  // Calculate content positions - start from topPadding with extra space for close button
  const topTitleY = isMobile ? topPadding + 8 : topPadding + 12;
  const baseY = isMobile ? topTitleY + 20 : topTitleY + 28;
  const shuffleSectionStartY = isMobile ? baseY + 50 : baseY + 90;
  const shuffleCardsStartY = shuffleSectionStartY + (isMobile ? 20 : 40);
  const shuffleCardsHeight =
    totalRows * (shuffleCardHeight + shuffleCardSpacing) - shuffleCardSpacing;

  // Calculate where content ends
  const contentEndY = shuffleCardsStartY + shuffleCardsHeight;

  // Calculate modal height to ensure equal top and bottom padding
  // Use topTitleY as the effective top padding for content centering
  const effectiveTopPadding = topTitleY;
  const calculatedHeight = contentEndY + effectiveTopPadding;
  const modalHeight = isMobile ? Math.max(300, calculatedHeight) : 480;

  // Adjust content if needed to center it (only on mobile when height was adjusted)
  const actualBottomPadding = modalHeight - contentEndY;
  const contentOffsetY =
    isMobile && actualBottomPadding !== effectiveTopPadding
      ? (actualBottomPadding - effectiveTopPadding) / 2
      : 0;

  const modalX = centerX - modalWidth / 2;
  const modalY = centerY - modalHeight / 2;

  const lastPlayerCardsList = lastPlayerCards.flatMap(
    (hand) => hand.cards || []
  );
  const lastDealerCardsList = lastDealerCards || [];

  const TitleStyle = UI_STYLES.ModalTitle.clone();
  TitleStyle.fontSize = isMobile ? 11 : 20;

  const smallTitleStyle = UI_STYLES.ModalTitle.clone();
  smallTitleStyle.fontSize = isMobile ? 7 : 12;

  const shuffledDeck =
    'shuffledDeck' in shuffleVerification
      ? shuffleVerification.shuffledDeck
      : [];

  // Build display deck: show dealt cards first, then remaining cards from shuffled deck
  // Use index tracking to handle duplicate cards properly (e.g., after splits with same card values)
  const displayDeck = (() => {
    // Collect all dealt cards (player + dealer)
    const dealtCards = [
      ...lastPlayerCardsList,
      ...lastDealerCardsList,
    ];

    // If no shuffled deck available, just show dealt cards
    if (!shuffledDeck || shuffledDeck.length === 0) {
      return dealtCards.slice(0, 52);
    }

    // Track which cards from shuffledDeck have been "used" by dealt cards
    // Use a count map to handle potential duplicates correctly
    const usedCardCounts = new Map<string, number>();
    dealtCards.forEach((card) => {
      const key = `${card.suit}-${card.rank}`;
      usedCardCounts.set(key, (usedCardCounts.get(key) || 0) + 1);
    });

    // Filter remaining cards from shuffled deck, respecting the count of used cards
    const remainingFromShuffle: Card[] = [];
    const remainingUsedCounts = new Map<string, number>();
    
    shuffledDeck.forEach((card) => {
      const key = `${card.suit}-${card.rank}`;
      const usedCount = usedCardCounts.get(key) || 0;
      const alreadySkipped = remainingUsedCounts.get(key) || 0;
      
      if (alreadySkipped < usedCount) {
        // Skip this card (it was dealt)
        remainingUsedCounts.set(key, alreadySkipped + 1);
      } else {
        // Include this card (not dealt or already skipped enough)
        remainingFromShuffle.push(card);
      }
    });

    // Combine: dealt cards first, then remaining deck
    return [...dealtCards, ...remainingFromShuffle].slice(0, 52);
  })();
  // Scale factor for mobile corner shapes
  const cornerScale = isMobile ? 0.5 : 1;
  const s = (value: number) => value * cornerScale; // Scale helper

  const drawBackground = useCallback(
    (g: Graphics) => {
      g.clear();
      // Main modal body (excluding corners)
      g.roundRect(s(24), 0, modalWidth - s(48), modalHeight, 0);
      g.fill({ color: 0x182325, alpha: 1 });

      // ---------- Top-left edge ----------
      g.roundRect(s(6), s(6), s(18), s(6), 0);
      g.fill({ color: 0x182325, alpha: 1 });
      g.roundRect(0, s(12), s(24), s(12), 0);
      g.fill({ color: 0x182325, alpha: 1 });
      g.roundRect(s(-12), s(18), s(36), s(36), 0);
      g.fill({ color: 0x182325, alpha: 1 });
      g.roundRect(s(-18), s(36), s(60), s(50), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      // ---------- Top-right edge (mirrored horizontally) ----------
      g.roundRect(modalWidth - s(24), s(6), s(18), s(12), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      g.roundRect(modalWidth - s(24), s(12), s(24), s(12), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      g.roundRect(modalWidth - s(36), s(18), s(48), s(36), 0);
      g.fill({ color: 0x182325, alpha: 1 });
      g.roundRect(modalWidth - s(42), s(36), s(60), s(36), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      // ---------- Bottom-left edge (mirrored vertically) ----------
      g.roundRect(s(6), modalHeight - s(18), s(18), s(12), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      g.roundRect(0, modalHeight - s(24), s(24), s(12), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      g.roundRect(s(-12), modalHeight - s(48), s(48), s(30), 0);
      g.fill({ color: 0x182325, alpha: 1 });
      g.roundRect(s(-18), modalHeight - s(74), s(60), s(36), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      // ---------- Bottom-right edge (mirrored horizontally and vertically) ----------
      g.roundRect(modalWidth - s(24), modalHeight - s(18), s(18), s(12), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      g.roundRect(modalWidth - s(24), modalHeight - s(24), s(24), s(12), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      g.roundRect(modalWidth - s(36), modalHeight - s(48), s(48), s(30), 0);
      g.fill({ color: 0x182325, alpha: 1 });
      g.roundRect(modalWidth - s(42), modalHeight - s(74), s(60), s(36), 0);
      g.fill({ color: 0x182325, alpha: 1 });

      g.roundRect(s(-18), s(48), modalWidth + s(36), modalHeight - s(48) * 2, 0);
      g.fill({ color: 0x182325, alpha: 1 });
    },
    [modalWidth, modalHeight, cornerScale]
  );

  const sectionGap = 20;
  const targetWidth = isMobile ? 25 : 42;
  const targetHeight = isMobile ? 34 : 58;

  // Compute widths dynamically (approximate based on total player cards across all hands)
  const totalPlayerWidth = lastPlayerCardsList.length * (targetWidth + 3);
  const dealerSectionX = Math.max(totalPlayerWidth, 0) + sectionGap;

  if (!isOpen) return null;

  return (
    <pixiContainer x={modalX} y={modalY} sortableChildren={true} zIndex={99999}>
      {/* Background */}
      <pixiGraphics
        draw={drawBackground}
        filters={[
          new DropShadowFilter({
            color: 0x000000,
            alpha: 0.7,
            blur: 0.25,
            offset: { x: 10, y: 10 },
          }),
        ]}
      />

      {/* Title and Close Button Container - Inline, same width as card grid */}
      {(() => {
        // Calculate text height for vertical centering
        const tempTitleText = new Text('LAST HAND', TitleStyle);
        const titleHeight = tempTitleText.height;
        const titleCenterY = titleHeight / 2;

        return (
          <pixiContainer x={0} y={topTitleY + contentOffsetY}>
            {/* Title */}
            <pixiText
              text="LAST HAND"
              x={leftPadding}
              y={titleCenterY}
              anchor={{ x: 0, y: 0.5 }}
              style={TitleStyle}
              resolution={2}
            />

            {/* Close Button - aligned to right edge of card grid width */}
            <pixiSprite
              texture={getIconTexture('xButton')}
              x={leftPadding + cardGridWidth}
              y={titleCenterY}
              anchor={0.5}
              scale={0.8}
              eventMode="static"
              cursor="pointer"
              onPointerDown={onClose}
              onTap={onClose}
              zIndex={99999}
            />
          </pixiContainer>
        );
      })()}

      {/* Horizontal row: Dealer + Player */}
      <pixiContainer x={leftPadding} y={baseY + contentOffsetY}>
        {/* Player Section - Show all hands */}
        <pixiContainer x={0} y={0}>
          {lastPlayerCards.map((hand, handIndex) => {
            // Calculate starting X position for this hand
            const prevHandsCards = lastPlayerCards
              .slice(0, handIndex)
              .reduce((sum, h) => sum + (h.cards?.length || 0), 0);
            const handStartX = prevHandsCards * (targetWidth + 3);

            // Determine label based on split or not
            const isSplit = lastPlayerCards.length > 1;
            const handLabel = isSplit ? `HAND ${handIndex + 1}` : 'YOU';

            return (
              <pixiContainer key={`hand-${handIndex}`} x={0} y={0}>
                {/* Label for each hand */}
                <pixiText
                  text={handLabel}
                  x={handStartX}
                  y={0}
                  anchor={0} // left align
                  style={smallTitleStyle}
                />
                {/* Cards for this hand */}
                <pixiContainer x={0} y={isMobile ? 14 : 20}>
                  {hand.cards?.map((card, cardIndex) => {
                    // Handle hidden cards
                    const texture =
                      card.suit === 'hidden'
                        ? getCardBackTexture()
                        : getCardTexture(card.rank, card.suit);
                    const spriteWidth = texture.width;
                    const spriteHeight = texture.height;

                    // Calculate scale to match target size
                    const scaleX = targetWidth / spriteWidth;
                    const scaleY = targetHeight / spriteHeight;

                    return (
                      <pixiSprite
                        key={`player-hand${handIndex}-card${cardIndex}`}
                        texture={texture}
                        x={handStartX + cardIndex * (targetWidth + 3)}
                        y={0}
                        anchor={0}
                        scale={{ x: scaleX, y: scaleY }}
                        filters={[
                          new DropShadowFilter({
                            color: 0xffffff,
                            alpha: 1,
                            blur: 2,
                            offset: { x: 0, y: 0 },
                          }),
                        ]}
                      />
                    );
                  })}
                </pixiContainer>
              </pixiContainer>
            );
          })}
        </pixiContainer>
        {/* Dealer Section */}
        <pixiContainer x={dealerSectionX} y={0}>
          {(() => {
            const tempText = new Text('YOU', smallTitleStyle);
            const textWidth = tempText.width;
            const dealerWidth =
              lastDealerCards.length > 0 ? 0 : textWidth + sectionGap;
            return (
              <>
                <pixiText
                  text="DEALER"
                  x={dealerWidth}
                  y={0}
                  anchor={0} // left align
                  style={smallTitleStyle}
                />
              </>
            );
          })()}

          <pixiContainer x={0} y={isMobile ? 14 : 20}>
            {lastDealerCards.map((card, index) => {
              // Handle hidden cards
              const texture =
                card.suit === 'hidden'
                  ? getCardBackTexture()
                  : getCardTexture(card.rank, card.suit);
              const spriteWidth = texture.width;
              const spriteHeight = texture.height;

              // Calculate scale to match target size
              const scaleX = targetWidth / spriteWidth;
              const scaleY = targetHeight / spriteHeight;

              return (
                <pixiSprite
                  key={`dealer-${index}`}
                  texture={texture}
                  x={index * (targetWidth + 3)}
                  y={0}
                  anchor={0}
                  scale={{ x: scaleX, y: scaleY }}
                  filters={[
                    new DropShadowFilter({
                      color: 0xfe4c40,
                      alpha: 1,
                      blur: 2,
                      offset: { x: 0, y: 0 },
                    }),
                  ]}
                />
              );
            })}
          </pixiContainer>
        </pixiContainer>
      </pixiContainer>
      <pixiContainer
        x={leftPadding}
        y={(isMobile ? baseY + 50 : baseY + 90) + contentOffsetY}
      >
        {/* Shuffle title and IS THIS FAIR section - aligned to card grid width */}
        {(() => {
          const shuffleTitleSpacing = isMobile ? 12 : 16;

          return (
            <>
              <pixiContainer x={0} y={shuffleTitleSpacing}>
                <pixiText
                  text="SHUFFLE"
                  x={0}
                  y={0}
                  anchor={0}
                  style={TitleStyle}
                />
              </pixiContainer>
              <pixiContainer
                x={cardGridWidth}
                y={shuffleTitleSpacing + 8}
                anchor={{ x: 1, y: 0.5 }}
              >
                {(() => {
                  const tempText = new Text('IS THIS FAIR?', smallTitleStyle);
                  const textWidth = tempText.width;
                  const iconWidth = isMobile ? 8 : 16;

                  return (
                    <>
                      <pixiText
                        text="IS THIS FAIR?"
                        x={-textWidth - iconWidth - 8}
                        y={0}
                        anchor={{ x: 0, y: 0.5 }}
                        style={smallTitleStyle}
                        resolution={2}
                      />
                      <pixiSprite
                        texture={getIconTexture('tooltip')}
                        x={-iconWidth}
                        y={-3}
                        anchor={{ x: 0, y: 0.5 }}
                        scale={isMobile ? 0.5 : 1}
                      />
                    </>
                  );
                })()}
              </pixiContainer>
            </>
          );
        })()}
        {lastPlayerCards &&
          lastDealerCards &&
          lastPlayerCards.length > 0 &&
          lastDealerCards.length > 0 && (
            <pixiContainer x={0} y={isMobile ? 30 : 50}>
              {displayDeck.map((card, index) => {
                // Handle hidden cards
                const texture =
                  card.suit === 'hidden'
                    ? getCardBackTexture()
                    : getCardTexture(card.rank, card.suit);

                const scaleX = shuffleCardWidth / texture.width;
                const scaleY = shuffleCardHeight / texture.height;

                const colIndex = index % cardsPerRow;
                const rowIndex = Math.floor(index / cardsPerRow);
                // Detect which group the card belongs to
                const isPlayerCard = lastPlayerCardsList.some(
                  (lp) => lp.rank === card.rank && lp.suit === card.suit
                );
                const isDealerCard = lastDealerCardsList.some(
                  (ld) => ld.rank === card.rank && ld.suit === card.suit
                );
                // Assign filter conditionally
                let filters: DropShadowFilter[] = [];
                if (isPlayerCard) {
                  filters = [
                    new DropShadowFilter({
                      color: 0xffffff,
                      alpha: 1,
                      blur: 3,
                      offset: { x: 0, y: 0 },
                    }),
                  ];
                } else if (isDealerCard) {
                  filters = [
                    new DropShadowFilter({
                      color: 0xfe4c40,
                      alpha: 1,
                      blur: 3,
                      offset: { x: 0, y: 0 },
                    }),
                  ];
                }
                return (
                  <pixiSprite
                    key={`${card.suit}-${card.rank}-${index}`}
                    texture={texture}
                    x={colIndex * (shuffleCardWidth + shuffleCardSpacing)}
                    y={rowIndex * (shuffleCardHeight + shuffleCardSpacing)}
                    anchor={0}
                    scale={{ x: scaleX, y: scaleY }}
                    filters={filters}
                  />
                );
              })}
            </pixiContainer>
          )}
      </pixiContainer>
    </pixiContainer>
  );
}

export default ShuffleModal;
