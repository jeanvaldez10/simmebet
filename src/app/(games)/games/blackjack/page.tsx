"use client";

import BlackjackGame from "@/components/games/blackjack/BlackjackGame";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ENABLE_GAMES } from "@/constants";

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

  return <BlackjackGame />;
}
