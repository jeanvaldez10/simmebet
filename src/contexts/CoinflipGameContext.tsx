"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useGameState } from "@/hooks/games/coinflip/useGameState";

type CoinflipGameContextType = ReturnType<typeof useGameState>;

const CoinflipGameContext = createContext<CoinflipGameContextType | null>(null);

export function CoinflipGameProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: CoinflipGameContextType;
}) {
  return (
    <CoinflipGameContext.Provider value={value}>
      {children}
    </CoinflipGameContext.Provider>
  );
}

export function useCoinflipGame() {
  const context = useContext(CoinflipGameContext);

  if (!context) {
    throw new Error(
      "useCoinflipGame must be used within CoinflipGameProvider"
    );
  }

  return context;
}

