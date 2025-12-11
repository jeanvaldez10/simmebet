"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface GameActiveContextType {
  isGameActive: boolean;
  setGameActive: (active: boolean) => void;
}

const GameActiveContext = createContext<GameActiveContextType | undefined>(
  undefined
);

export function GameActiveProvider({ children }: { children: ReactNode }) {
  const [isGameActive, setGameActive] = useState(false);

  return (
    <GameActiveContext.Provider value={{ isGameActive, setGameActive }}>
      {children}
    </GameActiveContext.Provider>
  );
}

export function useGameActive() {
  const context = useContext(GameActiveContext);
  if (context === undefined) {
    throw new Error("useGameActive must be used within a GameActiveProvider");
  }
  return context;
}

