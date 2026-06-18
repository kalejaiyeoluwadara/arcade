"use client";

import { useGameStore } from "@/lib/engine/store";

function Runner() {
  return (
    <svg className="panel__runner" viewBox="0 0 16 16" width="13" height="13" aria-hidden>
      <circle cx="10" cy="3.2" r="2" fill="#3f4f3a" />
      <path
        d="M10 5.2 L8.4 9 M8.4 9 L5 11 M8.4 9 L11.5 11.4 M9.2 6.4 L12.4 5.4 M9.2 6.4 L6 7.6"
        stroke="#3f4f3a"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
        <span className="panel__label">SPEED LEVEL</span>
        <span className="panel__speed">
          <span className="panel__value">{level}</span>
          <Runner />
        </span>
      </div>
      <div className="panel__row">
        <span className="panel__label">LIVES</span>
        <span className="panel__value panel__lives">{"♥".repeat(Math.max(0, lives))}</span>
      </div>
      <div className="panel__row">
        <span className="panel__label">MODE</span>
        <span className="panel__value panel__mode">{label}</span>
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
