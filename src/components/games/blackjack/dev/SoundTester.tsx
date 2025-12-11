"use client";

import React, { useState } from "react";
import { playSound } from "@/utils/games/blackjack/client/sounds";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function SoundTester() {
  console.log("🔊 SoundTester rendering");
  const [isOpen, setIsOpen] = useState(false);

  const handleTestCardDeal = () => {
    playSound("card-deal", 0.3, 0.8);
  };

  const handleTestChipsPlaceBet = () => {
    playSound("chips-place-bet", 0.5);
  };

  const handleTestButtonPress = () => {
    playSound("button-press", 0.3, 0.5);
  };

  const handleTestChipsJourney = () => {
    playSound("chips-collect", 0.5);
  };

  const handleTestWin = () => {
    playSound("game-win-3", 0.5);
  };

  const handleTestLose = () => {
    playSound("game-lose-1", 0.5);
  };

  const sounds = [
    { id: "card", label: "🃏 Card Deal", handler: handleTestCardDeal, variant: "default" as const },
    { id: "chips", label: "🪙 Chips Place", handler: handleTestChipsPlaceBet, variant: "default" as const },
    { id: "button", label: "🔘 Button Press", handler: handleTestButtonPress, variant: "secondary" as const },
    { id: "collect", label: "💰 Chips Collect", handler: handleTestChipsJourney, variant: "default" as const },
    { id: "win", label: "🎉 Win Sound", handler: handleTestWin, variant: "default" as const },
    { id: "lose", label: "😢 Lose Sound", handler: handleTestLose, variant: "destructive" as const },
  ];

  // Note: Parent component already checks ENABLE_BLACKJACK_DEV_TOOLS
  return (
    <Card 
      className="fixed z-[100000] w-[320px] shadow-2xl"
      style={{
        top: "390px",
        left: "20px",
        pointerEvents: "auto",
      }}
    >
      <CardHeader className="pb-3">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <CardTitle className="text-sm flex items-center gap-2">
            🔊 Sound Tester
            <Badge variant="outline" className="text-xs">
              {sounds.length} sounds
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isOpen ? "▼" : "▶"}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-2">
          <Separator className="mb-2" />
          {sounds.map((sound) => (
            <Button
              key={sound.id}
              onClick={sound.handler}
              variant={sound.variant}
              size="sm"
              className="w-full justify-start text-xs"
            >
              {sound.label}
            </Button>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
