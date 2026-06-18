"use client";

import GameConsole from "@/components/GameConsole";
import { fillShotGame } from "@/games/fillShot";

export default function FillShotPage() {
  return (
    <main className="page">
      <GameConsole def={fillShotGame} />
    </main>
  );
}
