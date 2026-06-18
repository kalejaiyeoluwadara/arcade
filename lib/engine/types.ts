// Shared engine types. All game logic operates on grid CELLS, never pixels.

export type Position = { x: number; y: number };

export type Direction = "up" | "down" | "left" | "right";

export const ACTIONS = [
  "up",
  "down",
  "left",
  "right",
  "fire",
  "start",
  "pause",
  "mute",
] as const;

export type InputAction = (typeof ACTIONS)[number];

/** Actions handled continuously while held (polled each tick). */
export const HELD_ACTIONS: InputAction[] = ["up", "down", "left", "right"];

/** Control actions that fire once on press, even while the loop is stopped. */
export const CONTROL_ACTIONS: InputAction[] = ["start", "pause", "mute"];

export type GameId = "shooting" | "tank" | "fillShot";

export type GameStatus = "idle" | "playing" | "paused" | "gameover";

export type SoundName =
  | "shoot"
  | "hit"
  | "levelup"
  | "pause"
  | "gameover";

export interface GridConfig {
  cols: number;
  rows: number;
  cell: number;
}

/** A frame buffer: fb[row][col] === true means that cell is lit (dark segment). */
export type FrameBuffer = boolean[][];

/** What a game reads from the input layer each tick. */
export interface InputReader {
  isHeld(action: InputAction): boolean;
  /** Edge-triggered actions (e.g. fire) buffered since the last tick. */
  consume(): InputAction[];
}

/** What a game emits back to the console (HUD + audio). */
export interface GameEvents {
  addScore(points: number): void;
  setLevel(level: number): void;
  loseLife(): void;
  gameOver(): void;
  sound(name: SoundName): void;
}

export interface TickContext {
  input: InputReader;
  events: GameEvents;
  level: number;
}

/**
 * A self-contained game. The console (GameConsole) owns the loop, input,
 * rendering and store; a game only supplies grid config, state, per-tick
 * logic and how to draw itself into the frame buffer.
 */
export interface GameDefinition<S = unknown> {
  id: GameId;
  label: string;
  grid: GridConfig;
  initialLives: number;
  instructions: string;
  /** Fresh state for a new game (also used to render the idle screen). */
  createState(): S;
  /** Ticks per second at the given level — difficulty scales the refresh rate. */
  fps(level: number): number;
  /** Advance the state by one fixed tick. */
  tick(state: S, ctx: TickContext): void;
  /** Render the current state into the frame buffer. */
  draw(state: S, fb: FrameBuffer): void;
}
