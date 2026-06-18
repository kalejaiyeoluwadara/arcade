"use client";

import GameConsole from "@/components/GameConsole";
import { shootingGame } from "@/games/shooting";

export default function ShootingPage() {
  return (
    <main className="page">
      <GameConsole def={shootingGame} />
    </main>
  );
}
