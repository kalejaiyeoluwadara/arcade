"use client";

import GameConsole from "@/components/GameConsole";
import { tankGame } from "@/games/tank";

export default function TankPage() {
  return (
    <main className="page">
      <GameConsole def={tankGame} />
    </main>
  );
}
