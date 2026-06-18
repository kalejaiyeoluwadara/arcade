// Single-channel piezo-style beeps via the Web Audio API. One oscillator at a
// time — a new beep cuts off the previous one, like a cheap handheld speaker.
// (Groundwork for v0.7; expanded there.)

import type { SoundName } from "./types";

interface Beep {
  freq: number;
  ms: number;
  type?: OscillatorType;
  /** Optional second tone for a tiny two-note effect. */
  then?: { freq: number; ms: number };
}

const BEEPS: Record<SoundName, Beep> = {
  shoot: { freq: 880, ms: 40, type: "square" },
  hit: { freq: 160, ms: 90, type: "square" },
  levelup: { freq: 660, ms: 70, type: "square", then: { freq: 990, ms: 90 } },
  pause: { freq: 440, ms: 70, type: "triangle" },
  gameover: { freq: 300, ms: 160, type: "sawtooth", then: { freq: 120, ms: 260 } },
};

let ctx: AudioContext | null = null;
let current: OscillatorNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/** Resume the AudioContext after a user gesture (browser autoplay policy). */
export function unlockAudio(): void {
  const ac = audio();
  if (ac && ac.state === "suspended") void ac.resume();
}

function tone(ac: AudioContext, freq: number, type: OscillatorType, at: number, ms: number): number {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  // Abrupt on/off envelope = low-fi piezo character.
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.18, at + 0.005);
  gain.gain.setValueAtTime(0.18, at + ms / 1000 - 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + ms / 1000);
  osc.connect(gain).connect(ac.destination);
  osc.start(at);
  osc.stop(at + ms / 1000);
  current = osc;
  return at + ms / 1000;
}

export function playSound(name: SoundName): void {
  const ac = audio();
  if (!ac || ac.state === "suspended") return;

  // Single channel: stop whatever is playing.
  if (current) {
    try {
      current.stop();
    } catch {
      /* already stopped */
    }
    current = null;
  }

  const beep = BEEPS[name];
  let t = ac.currentTime;
  t = tone(ac, beep.freq, beep.type ?? "square", t, beep.ms);
  if (beep.then) {
    tone(ac, beep.then.freq, beep.type ?? "square", t, beep.then.ms);
  }
}
