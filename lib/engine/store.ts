// Shared HUD + persistence state. Game positions live in refs (canvas), NOT here.
// Only score / hi-score / level / lives / status / mode / muted live in the store.

import { create } from "zustand";
import type { GameDefinition, GameId, GameStatus } from "./types";

const HISCORE_KEY = "brick-shooter:hiscores";
const MUTE_KEY = "brick-shooter:muted";

type HiScores = Partial<Record<GameId, number>>;

interface GameStore {
  status: GameStatus;
  mode: GameId | null;
  score: number;
  level: number;
  lives: number;
  hiScores: HiScores;
  muted: boolean;

  hydrate(): void;
  startMode(def: GameDefinition): void;
  setStatus(status: GameStatus): void;
  addScore(points: number): void;
  setLevel(level: number): void;
  setLives(lives: number): void;
  setMuted(muted: boolean): void;
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
  // Server-safe defaults so SSR and first client render match. Real persisted
  // values are loaded in hydrate() from a client effect.
  status: "idle",
  mode: null,
  score: 0,
  level: 1,
  lives: 0,
  hiScores: {},
  muted: false,

  hydrate() {
    if (typeof window === "undefined") return;
    const muted = localStorage.getItem(MUTE_KEY) === "1";
    set({ hiScores: loadHiScores(), muted });
  },

  startMode(def) {
    set({
      mode: def.id,
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
}));
