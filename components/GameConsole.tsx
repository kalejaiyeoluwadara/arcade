"use client";

import { useEffect, useRef } from "react";
import { DIFFICULTY_FACTOR, useGameStore } from "@/lib/engine/store";
import { useGameLoop } from "@/lib/engine/gameLoop";
import { InputManager } from "@/lib/engine/input";
import { clearFrame, createFrame, renderFrame } from "@/lib/engine/grid";
import { playSound, unlockAudio } from "@/lib/engine/sound";
import { vibrate } from "@/lib/engine/haptics";
import type {
  FrameBuffer,
  GameDefinition,
  GameEvents,
  InputAction,
} from "@/lib/engine/types";
import HandheldShell from "./HandheldShell";
import LCDScreen from "./LCDScreen";
import ScorePanel from "./ScorePanel";
import DPad from "./DPad";
import ActionButtons from "./ActionButtons";

export default function GameConsole<S>({ def }: { def: GameDefinition<S> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<InputManager | null>(null);
  const stateRef = useRef<S>(def.createState());
  const fbRef = useRef<FrameBuffer>(createFrame(def.grid));

  const status = useGameStore((s) => s.status);
  const muted = useGameStore((s) => s.muted);

  // --- helpers (read live store state via getState to avoid stale closures) ---
  const beep = (name: Parameters<GameEvents["sound"]>[0]) => {
    if (!useGameStore.getState().muted) playSound(name);
  };
  // Sound (respects mute) + haptic buzz (always, where supported).
  const feedback = (name: Parameters<GameEvents["sound"]>[0]) => {
    beep(name);
    vibrate(name);
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    clearFrame(fbRef.current);
    def.draw(stateRef.current, fbRef.current);
    renderFrame(ctx, fbRef.current, def.grid, {
      effects: useGameStore.getState().lcdEffects,
    });
  };

  const startGame = () => {
    stateRef.current = def.createState();
    inputRef.current?.reset();
    useGameStore.getState().startMode(def);
  };

  // --- mount: input, hydration, idle frame, audio unlock ---
  useEffect(() => {
    const store = useGameStore.getState();
    store.hydrate();

    const input = new InputManager();
    inputRef.current = input;
    input.onControl = (action) => {
      const s = useGameStore.getState();
      if (action === "mute") {
        s.setMuted(!s.muted);
        return;
      }
      if (action === "pause") {
        if (s.status === "playing") {
          s.setStatus("paused");
          feedback("pause");
        } else if (s.status === "paused") {
          s.setStatus("playing");
        }
        return;
      }
      // start
      if (s.status === "playing") {
        s.setStatus("paused");
        feedback("pause");
      } else if (s.status === "paused") {
        s.setStatus("playing");
      } else {
        startGame();
      }
    };
    input.attach();

    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    draw(); // render the idle (starting) frame

    return () => {
      input.detach();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- fixed-timestep loop ---
  useGameLoop({
    running: status === "playing",
    getStepMs: () => {
      const s = useGameStore.getState();
      return 1000 / (def.fps(s.level) * DIFFICULTY_FACTOR[s.difficulty]);
    },
    onStep: () => {
      const store = useGameStore.getState();
      if (store.status !== "playing") return;

      // Event handlers read fresh store state so multiple events in one tick
      // (e.g. two enemies landing) don't clobber each other.
      const events: GameEvents = {
        addScore: (n) => useGameStore.getState().addScore(n),
        setLevel: (lvl) => {
          const cur = useGameStore.getState();
          if (lvl !== cur.level) {
            cur.setLevel(lvl);
            feedback("levelup");
          }
        },
        loseLife: () => {
          const cur = useGameStore.getState();
          const remaining = cur.lives - 1;
          cur.setLives(remaining);
          if (remaining <= 0) {
            cur.setStatus("gameover");
            feedback("gameover");
          } else {
            feedback("hit");
          }
        },
        gameOver: () => {
          useGameStore.getState().setStatus("gameover");
          feedback("gameover");
        },
        sound: feedback,
      };

      def.tick(stateRef.current, {
        input: inputRef.current!,
        events,
        level: store.level,
        difficulty: DIFFICULTY_FACTOR[store.difficulty],
      });
      draw();
    },
  });

  const press = (action: InputAction) => {
    unlockAudio();
    inputRef.current?.press(action);
  };
  const release = (action: InputAction) => inputRef.current?.release(action);

  const overlay = renderOverlay(status, def.instructions);
  const startLabel =
    status === "playing" ? "PAUSE" : status === "paused" ? "RESUME" : "START";

  return (
    <HandheldShell title="BRICK SHOOTER">
      <LCDScreen grid={def.grid} canvasRef={canvasRef} overlay={overlay}>
        <ScorePanel label={def.label} />
      </LCDScreen>

      <div className="controls">
        <DPad press={press} release={release} />

        <div className="controls__mid">
          <button
            type="button"
            className="btn-pill"
            onPointerDown={(e) => {
              e.preventDefault();
              press("start");
            }}
          >
            {startLabel}
          </button>
          <button
            type="button"
            className="btn-pill"
            onPointerDown={(e) => {
              e.preventDefault();
              press("mute");
            }}
          >
            {muted ? "SOUND ✕" : "SOUND ♪"}
          </button>
        </div>

        <ActionButtons press={press} release={release} />
      </div>
    </HandheldShell>
  );
}

function renderOverlay(status: string, instructions: string) {
  if (status === "playing") return null;
  if (status === "paused") {
    return <strong>PAUSE</strong>;
  }
  if (status === "gameover") {
    return (
      <>
        <strong>GAME OVER</strong>
        <span>PRESS START</span>
      </>
    );
  }
  // idle
  return (
    <>
      <strong>PRESS START</strong>
      <small
        style={{
          fontSize: 6,
          lineHeight: 1.7,
          whiteSpace: "pre-line",
          marginTop: 4,
        }}
      >
        {instructions}
      </small>
    </>
  );
}
