// Grid model + LCD canvas renderer. The renderer is the ONLY place that
// converts grid cells into pixels.

import type { FrameBuffer, GridConfig, Position } from "./types";

export const LCD = {
  background: "#9ead86",
  light: "#b8c6a5",
  dark: "#3f4f3a",
  outline: "#2d3528",
} as const;

export function createFrame({ cols, rows }: GridConfig): FrameBuffer {
  return Array.from({ length: rows }, () => new Array<boolean>(cols).fill(false));
}

export function clearFrame(fb: FrameBuffer): void {
  for (const row of fb) row.fill(false);
}

export function inBounds(grid: GridConfig, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < grid.cols && y < grid.rows;
}

/** Light a single cell (no-op if out of bounds). */
export function setCell(fb: FrameBuffer, x: number, y: number): void {
  if (y >= 0 && y < fb.length && x >= 0 && x < fb[0].length) {
    fb[y][x] = true;
  }
}

/** Light a w×h rectangle of cells anchored at its top-left (x, y). */
export function setRect(
  fb: FrameBuffer,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setCell(fb, x + dx, y + dy);
    }
  }
}

export function setCells(fb: FrameBuffer, cells: Position[]): void {
  for (const c of cells) setCell(fb, c.x, c.y);
}

/**
 * Draw the frame buffer to the canvas as classic Brick-Game blocks:
 * an outlined dark square with a small filled dot in the centre.
 * No anti-aliasing, gradients, shadows, or transparency.
 */
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  fb: FrameBuffer,
  grid: GridConfig,
): void {
  const { cell } = grid;
  const w = grid.cols * cell;
  const h = grid.rows * cell;

  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = LCD.background;
  ctx.fillRect(0, 0, w, h);

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (!fb[r][c]) continue;
      drawBlock(ctx, c * cell, r * cell, cell);
    }
  }
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
): void {
  // Outer dark square
  ctx.fillStyle = LCD.dark;
  ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
  // Hollow out the centre
  ctx.fillStyle = LCD.background;
  ctx.fillRect(x + 3, y + 3, cell - 6, cell - 6);
  // Centre dot
  ctx.fillStyle = LCD.dark;
  ctx.fillRect(x + 5, y + 5, cell - 10, cell - 10);
}
