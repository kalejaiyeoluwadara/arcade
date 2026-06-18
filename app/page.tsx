"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useGameStore, type Difficulty } from "@/lib/engine/store";
import type { GameId } from "@/lib/engine/types";

const GAMES: { href: string; id: GameId; name: string; icon: string }[] = [
  { href: "/shooting", id: "shooting", name: "SPACE", icon: "↑" },
  { href: "/tank", id: "tank", name: "TANK", icon: "▲" },
  { href: "/fill-shot", id: "fillShot", name: "FILL", icon: "▣" },
];

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

function pad(n: number): string {
  return n.toString().padStart(4, "0");
}

export default function Home() {
  const hydrate = useGameStore((s) => s.hydrate);
  const hiScores = useGameStore((s) => s.hiScores);
  const lastMode = useGameStore((s) => s.lastMode);
  const difficulty = useGameStore((s) => s.difficulty);
  const muted = useGameStore((s) => s.muted);
  const lcdEffects = useGameStore((s) => s.lcdEffects);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const setMuted = useGameStore((s) => s.setMuted);
  const setLcdEffects = useGameStore((s) => s.setLcdEffects);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <main className="page">
      <div className="shell menu">
        <div className="shell__brand">
          <span>BRICK SHOOTER</span>
          <small>9999 in 1</small>
        </div>

        <nav className="menu__list">
          {GAMES.map((game) => (
            <Link key={game.href} href={game.href} className="menu__item">
              <span className="menu__name">
                {game.name}
                {lastMode === game.id ? " ◄" : ""}
              </span>
              <span className="menu__meta">
                <span className="menu__hi">{pad(hiScores[game.id] ?? 0)}</span>
                <span className="menu__icon" aria-hidden>
                  {game.icon}
                </span>
              </span>
            </Link>
          ))}
        </nav>

        <div className="home-settings">
          <div className="setting">
            <span className="setting__label">DIFFICULTY</span>
            <span className="setting__opts">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`btn-pill${difficulty === d ? " btn-pill--active" : ""}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d.toUpperCase()}
                </button>
              ))}
            </span>
          </div>

          <div className="setting">
            <span className="setting__label">SOUND</span>
            <span className="setting__opts">
              <button
                type="button"
                className={`btn-pill${!muted ? " btn-pill--active" : ""}`}
                onClick={() => setMuted(false)}
              >
                ON
              </button>
              <button
                type="button"
                className={`btn-pill${muted ? " btn-pill--active" : ""}`}
                onClick={() => setMuted(true)}
              >
                OFF
              </button>
            </span>
          </div>

          <div className="setting">
            <span className="setting__label">LCD FX</span>
            <span className="setting__opts">
              <button
                type="button"
                className={`btn-pill${lcdEffects ? " btn-pill--active" : ""}`}
                onClick={() => setLcdEffects(true)}
              >
                ON
              </button>
              <button
                type="button"
                className={`btn-pill${!lcdEffects ? " btn-pill--active" : ""}`}
                onClick={() => setLcdEffects(false)}
              >
                OFF
              </button>
            </span>
          </div>
        </div>

        <p className="menu__hint">
          ◄ ► MOVE · SPACE FIRE · ENTER START · P PAUSE · M MUTE
        </p>
      </div>
    </main>
  );
}
