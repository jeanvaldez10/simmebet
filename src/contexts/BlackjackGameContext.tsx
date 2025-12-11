"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useGameState } from "@/hooks/games/blackjack/useGameState";

type BlackjackGameContextType = ReturnType<typeof useGameState>;

const BlackjackGameContext = createContext<BlackjackGameContextType | null>(null);

export function BlackjackGameProvider({ 
  children,
  value,
}: { 
  children: ReactNode;
  value: BlackjackGameContextType;
}) {
  return (
    <BlackjackGameContext.Provider value={value}>
      {children}
    </BlackjackGameContext.Provider>
  );
}

export function useBlackjackGame() {
  const context = useContext(BlackjackGameContext);
  
  if (!context) {
    throw new Error(
      "useBlackjackGame must be used within BlackjackGameProvider"
    );
  }
  
  return context;
}

