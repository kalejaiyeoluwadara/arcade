// Keyboard + on-screen input. Directions are held (polled each tick); fire is
// edge-buffered; start/pause/mute fire immediately via onControl so they work
// even when the game loop is stopped.

import { CONTROL_ACTIONS, type InputAction, type InputReader } from "./types";

const KEY_MAP: Record<string, InputAction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  Space: "fire",
  Enter: "start",
  KeyP: "pause",
  KeyM: "mute",
};

export class InputManager implements InputReader {
  private held = new Set<InputAction>();
  private queue: InputAction[] = [];

  /** Called immediately for start/pause/mute (edge-triggered). */
  onControl?: (action: InputAction) => void;

  isHeld(action: InputAction): boolean {
    return this.held.has(action);
  }

  consume(): InputAction[] {
    const q = this.queue;
    this.queue = [];
    return q;
  }

  press(action: InputAction): void {
    if (CONTROL_ACTIONS.includes(action)) {
      this.onControl?.(action);
      return;
    }
    if (action === "fire" && !this.held.has(action)) {
      this.queue.push(action);
    }
    this.held.add(action);
  }

  release(action: InputAction): void {
    this.held.delete(action);
  }

  reset(): void {
    this.held.clear();
    this.queue = [];
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    e.preventDefault();
    if (e.repeat && action !== "fire") return;
    this.press(action);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    this.release(action);
  };

  attach(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.reset();
  }
}
