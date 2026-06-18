// Fixed-timestep game loop hook. Decoupled from the 60Hz rAF: logic steps run at
// the rate returned by getStepMs (10-15 FPS range). No interpolation — every step
// snaps the grid, imitating an LCD refresh.

import { useEffect, useRef } from "react";

interface GameLoopOptions {
  running: boolean;
  /** Milliseconds between logic steps (may change with level). */
  getStepMs: () => number;
  /** One fixed logic step. */
  onStep: () => void;
}

export function useGameLoop({ running, getStepMs, onStep }: GameLoopOptions): void {
  const stepRef = useRef(onStep);
  const intervalRef = useRef(getStepMs);

  // Keep the latest callbacks without restarting the loop (refs updated in an
  // effect, never during render).
  useEffect(() => {
    stepRef.current = onStep;
    intervalRef.current = getStepMs;
  });

  useEffect(() => {
    if (!running) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const frame = (now: number): void => {
      raf = requestAnimationFrame(frame);
      acc += now - last;
      last = now;

      const step = intervalRef.current();
      // Prevent a spiral of death after a tab regains focus.
      if (acc > step * 5) acc = step;

      while (acc >= step) {
        acc -= step;
        stepRef.current();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
