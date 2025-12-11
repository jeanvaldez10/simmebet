/**
 * Side Bet Rules Modal Component (PixiJS)
 * 
 * Displays payout rules for 21+3 and Perfect Pairs side bets with ScrollBox
 */

"use client";

import { useMemo, useEffect, useRef } from "react";
import { TextStyle, Container, Graphics, Text } from "pixi.js";
import { ScrollBox } from "@pixi/ui";
import { SIDEBET_PAYOUTS } from "@/utils/games/blackjack/sideBetEvaluation";
import { ModalGraphicContainer } from "../containers";
import { ButtonSprite } from "../buttons/ButtonSprite";
import { getIconTexture } from "@/utils/games/blackjack/client/pixiAssets";

interface SideBetRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerX: number;
  centerY: number;
  isMobile?: boolean;
}

export function SideBetRulesModal({
  isOpen,
  onClose,
  centerX,
  centerY,
  isMobile = false,
}: SideBetRulesModalProps) {
  const scrollBoxRef = useRef<ScrollBox | null>(null);
  const containerRef = useRef<Container | null>(null);

  // Modal dimensions
  const modalWidth = isMobile ? 320 : 500;
  const modalHeight = isMobile ? 400 : 500;
  const modalX = centerX - modalWidth / 2;
  const modalY = centerY - modalHeight / 2;

  // Calculate content positions
  const padding = isMobile ? 20 : 30;
  const headerY = 40;
  const contentStartY = headerY + 50;
  const contentAreaHeight = modalHeight - contentStartY - (isMobile ? 60 : 70); // Leave space for close button
  const contentAreaWidth = modalWidth - padding * 2;
  const sectionSpacing = isMobile ? 180 : 220;
  const cardPadding = isMobile ? 8 : 10;
  const cardHeight = isMobile ? 50 : 55; // Increased height to prevent text overlap

  // Styles
  const titleStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: isMobile ? 20 : 24,
    fill: 0xfbbf24, // yellow-400
    fontWeight: "bold",
    align: "center",
    dropShadow: {
      color: 0x000000,
      distance: 2,
      angle: Math.PI / 4,
      blur: 1,
    },
  });

  const subtitleStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: isMobile ? 10 : 12,
    fill: 0xffffff,
    align: "center",
  });

  const sectionTitleStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: isMobile ? 14 : 16,
    fill: 0xfbbf24, // yellow-300
    fontWeight: "bold",
    align: "left",
  });

  const descriptionStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: isMobile ? 10 : 11,
    fill: 0xffffff,
    align: "left",
  });

  const handNameStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: isMobile ? 11 : 12,
    fill: 0xffffff,
    fontWeight: "bold",
    align: "left",
  });

  const payoutStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: isMobile ? 12 : 14,
    fill: 0x4ade80, // green-300
    fontWeight: "bold",
    align: "right",
  });

  const detailStyle = new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: isMobile ? 9 : 10,
    fill: 0xffffff,
    align: "left",
  });

  // Create scrollable content items
  const scrollItems = useMemo(() => {
    const items: Container[] = [];

    // Helper to create a payout card
    const createPayoutCard = (
      handName: string,
      payout: number,
      description: string,
      y: number
    ): Container => {
      const card = new Container();
      card.y = y;

      // Background
      const bg = new Graphics();
      bg.lineStyle(2, 0xfbbf24, 0.3);
      bg.beginFill(0x000000, 0.4);
      bg.roundRect(0, 0, contentAreaWidth, cardHeight, 8);
      bg.endFill();
      card.addChild(bg);

      // Hand name - positioned at top left
      const nameText = new Text({
        text: handName,
        style: handNameStyle,
      });
      nameText.x = cardPadding;
      nameText.y = cardPadding;
      card.addChild(nameText);

      // Payout - positioned at top right, with more space from edge
      const payoutText = new Text({
        text: `${payout}:1`,
        style: payoutStyle,
      });
      payoutText.x = contentAreaWidth - cardPadding - 5; // Extra spacing from edge
      payoutText.y = cardPadding;
      payoutText.anchor = { x: 1, y: 0 };
      card.addChild(payoutText);

      // Description - positioned at bottom, with word wrap to prevent overflow
      const descText = new Text({
        text: description,
        style: {
          ...detailStyle,
          wordWrap: true,
          wordWrapWidth: contentAreaWidth - cardPadding * 2 - 10, // Leave space for payout
        },
      });
      descText.alpha = 0.7;
      descText.x = cardPadding;
      descText.y = cardPadding + (isMobile ? 16 : 18); // Position below name/payout
      card.addChild(descText);

      return card;
    };

    // 21+3 Section
    const section21Plus3 = new Container();
    
    // Section title
    const title21Plus3 = new Text({
      text: "21+3 Side Bet",
      style: sectionTitleStyle,
    });
    title21Plus3.y = 0;
    section21Plus3.addChild(title21Plus3);

    // Section description
    const desc21Plus3 = new Text({
      text: "Uses your first two cards + dealer's upcard to form a 3-card poker hand",
      style: descriptionStyle,
    });
    desc21Plus3.alpha = 0.9;
    desc21Plus3.y = 20;
    section21Plus3.addChild(desc21Plus3);

    // Payout cards
    const cardsContainer = new Container();
    cardsContainer.y = 40;
    
    // Calculate spacing: card height + 10px gap between cards
    const cardSpacing = cardHeight + 10;
    
    cardsContainer.addChild(
      createPayoutCard(
        "Straight Flush",
        SIDEBET_PAYOUTS["21+3"].STRAIGHT_FLUSH,
        "Three consecutive ranks, all same suit",
        0
      )
    );
    cardsContainer.addChild(
      createPayoutCard(
        "Three of a Kind",
        SIDEBET_PAYOUTS["21+3"].THREE_OF_A_KIND,
        "All three cards same rank",
        cardSpacing
      )
    );
    cardsContainer.addChild(
      createPayoutCard(
        "Straight",
        SIDEBET_PAYOUTS["21+3"].STRAIGHT,
        "Three consecutive ranks, mixed suits (Ace can be high or low)",
        cardSpacing * 2
      )
    );
    cardsContainer.addChild(
      createPayoutCard(
        "Flush",
        SIDEBET_PAYOUTS["21+3"].FLUSH,
        "All three cards same suit",
        cardSpacing * 3
      )
    );

    section21Plus3.addChild(cardsContainer);
    items.push(section21Plus3);

    // Perfect Pairs Section
    const sectionPairs = new Container();
    sectionPairs.y = sectionSpacing;

    // Section title
    const titlePairs = new Text({
      text: "Perfect Pairs Side Bet",
      style: sectionTitleStyle,
    });
    sectionPairs.addChild(titlePairs);

    // Section description
    const descPairs = new Text({
      text: "Uses only your first two cards",
      style: descriptionStyle,
    });
    descPairs.alpha = 0.9;
    descPairs.y = 20;
    sectionPairs.addChild(descPairs);

    // Payout cards
    const pairsCardsContainer = new Container();
    pairsCardsContainer.y = 40;

    // Calculate spacing: card height + 10px gap between cards
    const pairsCardSpacing = cardHeight + 10;

    pairsCardsContainer.addChild(
      createPayoutCard(
        "Perfect Pair",
        SIDEBET_PAYOUTS.PAIR.PERFECT_PAIR,
        "Same rank, same suit",
        0
      )
    );
    pairsCardsContainer.addChild(
      createPayoutCard(
        "Colored Pair",
        SIDEBET_PAYOUTS.PAIR.COLORED_PAIR,
        "Same rank, same color (red/red or black/black), different suits",
        pairsCardSpacing
      )
    );
    pairsCardsContainer.addChild(
      createPayoutCard(
        "Mixed Pair",
        SIDEBET_PAYOUTS.PAIR.MIXED_PAIR,
        "Same rank, different colors",
        pairsCardSpacing * 2
      )
    );

    sectionPairs.addChild(pairsCardsContainer);
    items.push(sectionPairs);

    return items;
  }, [sectionTitleStyle, descriptionStyle, sectionSpacing, contentAreaWidth, cardHeight, handNameStyle, cardPadding, payoutStyle, detailStyle, isMobile]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current overflow style
      const originalOverflow = document.body.style.overflow;
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      
      return () => {
        // Restore original overflow style
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Initialize ScrollBox when container is ready
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Use setTimeout to ensure container ref is set
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      // Clean up existing ScrollBox if any
      if (scrollBoxRef.current) {
        if (containerRef.current.children.includes(scrollBoxRef.current)) {
          containerRef.current.removeChild(scrollBoxRef.current);
        }
        scrollBoxRef.current.destroy();
        scrollBoxRef.current = null;
      }

      const scrollBox = new ScrollBox({
        width: contentAreaWidth,
        height: contentAreaHeight,
        background: 0x00000000, // Transparent
        elementsMargin: 10,
        vertPadding: 5,
        horPadding: 0,
        globalScroll: false, // Prevent body scroll when scrolling in modal
        items: scrollItems,
      });

      scrollBox.x = 0;
      scrollBox.y = 0;
      scrollBoxRef.current = scrollBox;
      containerRef.current.addChild(scrollBox);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (scrollBoxRef.current && containerRef.current) {
        if (containerRef.current.children.includes(scrollBoxRef.current)) {
          containerRef.current.removeChild(scrollBoxRef.current);
        }
        scrollBoxRef.current.destroy();
        scrollBoxRef.current = null;
      }
    };
  }, [isOpen, contentAreaWidth, contentAreaHeight, scrollItems]);

  if (!isOpen) return null;

  return (
    <ModalGraphicContainer
      modalWidth={modalWidth}
      modalHeight={modalHeight}
      modalX={modalX}
      modalY={modalY}
    >
      {/* Close Button */}
      <pixiSprite
        texture={getIconTexture("xButton")}
        x={modalWidth - 30}
        y={30}
        anchor={0.5}
        scale={0.8}
        eventMode="static"
        cursor="pointer"
        onPointerDown={onClose}
        onTap={onClose}
      />

      {/* Header */}
      <pixiText
        text="Side Bet Rules"
        x={modalWidth / 2}
        y={headerY}
        anchor={0.5}
        style={titleStyle}
      />
      <pixiText
        text="Payouts are based on your initial two cards and dealer's upcard"
        x={modalWidth / 2}
        y={headerY + 25}
        anchor={0.5}
        style={subtitleStyle}
        alpha={0.8}
      />

      {/* ScrollBox Container */}
      <pixiContainer
        x={padding}
        y={contentStartY}
        ref={(container) => {
          if (container) {
            containerRef.current = container;
          }
        }}
      />

      {/* Close Button */}
      <ButtonSprite
        text="CLOSE"
        x={modalWidth / 2}
        y={modalHeight - 40}
        width={isMobile ? 120 : 150}
        height={isMobile ? 35 : 40}
        color="orange"
        onClick={onClose}
        fontSize={isMobile ? 14 : 18}
      />
    </ModalGraphicContainer>
  );
}
