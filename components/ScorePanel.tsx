"use client";

import { useGameStore } from "@/lib/engine/store";

export default function ScorePanel({ label }: { label: string }) {
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const lives = useGameStore((s) => s.lives);
  const mode = useGameStore((s) => s.mode);
  const hiScores = useGameStore((s) => s.hiScores);
  const status = useGameStore((s) => s.status);

  const hi = mode ? hiScores[mode] ?? 0 : 0;

  return (
    <div className="panel">
      <div className="panel__row">
        <span className="panel__label">HI-SCORE</span>
        <span className="panel__value">{pad(hi)}</span>
      </div>
      <div className="panel__row">
        <span className="panel__label">SCORE</span>
        <span className="panel__value">{pad(score)}</span>
      </div>
      <div className="panel__row">
        <span className="panel__label">LEVEL</span>
        <span className="panel__value">{level}</span>
      </div>
      <div className="panel__row">
        <span className="panel__label">LIVES</span>
        <span className="panel__value panel__lives">{"♥".repeat(Math.max(0, lives))}</span>
      </div>
      <div className="panel__row">
        <span className="panel__label">MODE</span>
        <span className="panel__value" style={{ fontSize: 13 }}>
          {label}
        </span>
      </div>
      <div className={`panel__flag${status === "paused" ? " panel__flag--on" : ""}`}>
        {status === "paused" ? "PAUSE" : ""}
      </div>
    </div>
  );
}

function pad(n: number): string {
  return n.toString().padStart(4, "0");
}
