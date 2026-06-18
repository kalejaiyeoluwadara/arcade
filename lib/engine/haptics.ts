// Haptic feedback via the Vibration API. No-ops gracefully where unsupported
// (desktop, iOS Safari). Patterns are short — handheld button "clicks".

import type { SoundName } from "./types";

const PATTERNS: Record<SoundName, number | number[]> = {
  shoot: 8,
  hit: 25,
  levelup: [15, 30, 15],
  pause: 12,
  gameover: [60, 50, 90],
};

export function vibrate(name: SoundName): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[name]);
  } catch {
    /* ignore */
  }
}
