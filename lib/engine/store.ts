// Shared HUD + persistence state. Game positions live in refs (canvas), NOT here.
// Only score / hi-score / level / lives / status / mode + persisted settings
// (difficulty, mute, LCD effects, last mode) live in the store.

import { create } from "zustand";
import type { GameDefinition, GameId, GameStatus } from "./types";

const HISCORE_KEY = "brick-shooter:hiscores";
const MUTE_KEY = "brick-shooter:muted";
const DIFFICULTY_KEY = "brick-shooter:difficulty";
const EFFECTS_KEY = "brick-shooter:effects";
const LASTMODE_KEY = "brick-shooter:lastmode";

export type Difficulty = "easy" | "normal" | "hard";

/** Speed/spawn scalar applied to every game's tick rate. */
export const DIFFICULTY_FACTOR: Record<Difficulty, number> = {
  easy: 0.8,
  normal: 1.0,
  hard: 1.3,
};

type HiScores = Partial<Record<GameId, number>>;

interface GameStore {
  status: GameStatus;
  mode: GameId | null;
  score: number;
  level: number;
  lives: number;
  hiScores: HiScores;
  // persisted settings
  muted: boolean;
  difficulty: Difficulty;
  lcdEffects: boolean;
  lastMode: GameId | null;

  hydrate(): void;
  startMode(def: GameDefinition): void;
  setStatus(status: GameStatus): void;
  addScore(points: number): void;
  setLevel(level: number): void;
  setLives(lives: number): void;
  setMuted(muted: boolean): void;
  setDifficulty(difficulty: Difficulty): void;
  setLcdEffects(on: boolean): void;
}

function loadHiScores(): HiScores {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(HISCORE_KEY) ?? "{}") as HiScores;
  } catch {
    return {};
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Server-safe defaults so SSR and first client render match. Persisted values
  // are loaded in hydrate() from a client effect.
  status: "idle",
  mode: null,
  score: 0,
  level: 1,
  lives: 0,
  hiScores: {},
  muted: false,
  difficulty: "normal",
  lcdEffects: true,
  lastMode: null,

  hydrate() {
    if (typeof window === "undefined") return;
    const difficultyRaw = localStorage.getItem(DIFFICULTY_KEY);
    const difficulty: Difficulty =
      difficultyRaw === "easy" || difficultyRaw === "hard"
        ? difficultyRaw
        : "normal";
    set({
      hiScores: loadHiScores(),
      muted: localStorage.getItem(MUTE_KEY) === "1",
      difficulty,
      lcdEffects: localStorage.getItem(EFFECTS_KEY) !== "0",
      lastMode: (localStorage.getItem(LASTMODE_KEY) as GameId | null) ?? null,
    });
  },

  startMode(def) {
    if (typeof window !== "undefined") {
      localStorage.setItem(LASTMODE_KEY, def.id);
    }
    set({
      mode: def.id,
      lastMode: def.id,
      status: "playing",
      score: 0,
      level: 1,
      lives: def.initialLives,
    });
  },

  setStatus(status) {
    set({ status });
  },

  addScore(points) {
    const { score, mode, hiScores } = get();
    const next = score + points;
    const patch: Partial<GameStore> = { score: next };
    if (mode && next > (hiScores[mode] ?? 0)) {
      const updated = { ...hiScores, [mode]: next };
      patch.hiScores = updated;
      if (typeof window !== "undefined") {
        localStorage.setItem(HISCORE_KEY, JSON.stringify(updated));
      }
    }
    set(patch);
  },

  setLevel(level) {
    set({ level });
  },

  setLives(lives) {
    set({ lives });
  },

  setMuted(muted) {
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    }
    set({ muted });
  },

  setDifficulty(difficulty) {
    if (typeof window !== "undefined") {
      localStorage.setItem(DIFFICULTY_KEY, difficulty);
    }
    set({ difficulty });
  },

  setLcdEffects(on) {
    if (typeof window !== "undefined") {
      localStorage.setItem(EFFECTS_KEY, on ? "1" : "0");
    }
    set({ lcdEffects: on });
  },
}));
