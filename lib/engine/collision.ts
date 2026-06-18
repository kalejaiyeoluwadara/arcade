// Pure grid-cell collision helpers. No pixels involved.

import type { Position } from "./types";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function samePos(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/** Is point (px, py) inside rect r? */
export function pointInRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}

/** Do two axis-aligned cell rectangles overlap? */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/** All cells occupied by a rectangle (useful for wall lookups). */
export function rectCells(r: Rect): Position[] {
  const cells: Position[] = [];
  for (let dy = 0; dy < r.h; dy++) {
    for (let dx = 0; dx < r.w; dx++) {
      cells.push({ x: r.x + dx, y: r.y + dy });
    }
  }
  return cells;
}
