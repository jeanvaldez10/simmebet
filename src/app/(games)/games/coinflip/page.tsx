"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ENABLE_GAMES } from "@/constants";
import CoinflipGame from "@/components/games/coinflip/CoinflipGame";

export default function BlackjackPage() {
  const router = useRouter();

  useEffect(() => {
    if (!ENABLE_GAMES) {
      router.push("/");
    }
  }, [router]);

  if (!ENABLE_GAMES) {
    return null;
  }

  return <CoinflipGame />;
}
