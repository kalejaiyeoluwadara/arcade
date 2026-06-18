// Tank Battle — top-down single-screen arena. Player 2×2 tank moves AND aims with
// the D-pad, fires one bullet at a time. Destructible (brick) and indestructible
// (steel) walls. Enemy tanks descend from the top and shoot back.

import { setCell, setRect } from "@/lib/engine/grid";
import { pointInRect, rectsOverlap, type Rect } from "@/lib/engine/collision";
import type {
  Direction,
  FrameBuffer,
  GameDefinition,
  TickContext,
} from "@/lib/engine/types";

const COLS = 12;
const ROWS = 20;
const CELL = 16;
const TANK = 2; // 2×2

const EMPTY = 0;
const BRICK = 1; // destructible
const STEEL = 2; // indestructible
type WallCell = 0 | 1 | 2;
type WallGrid = WallCell[][];

const START = { x: 5, y: 16 } as const;
const KILLS_PER_LEVEL = 8;

const DELTA: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const DIRS: Direction[] = ["up", "down", "left", "right"];

// Sparse, navigable arena: isolated 2×2 blocks so a 2×2 tank always has room.
const BLOCKS: [number, number, WallCell][] = [
  [2, 4, BRICK],
  [8, 4, BRICK],
  [5, 7, STEEL],
  [0, 10, BRICK],
  [10, 10, BRICK],
  [5, 12, STEEL],
  [2, 14, BRICK],
  [8, 14, BRICK],
];

interface Bullet {
  x: number;
  y: number;
  dir: Direction;
}

interface Enemy {
  x: number;
  y: number;
  dir: Direction;
  bullet: Bullet | null;
  moveTimer: number;
  fireTimer: number;
}

interface TankState {
  walls: WallGrid;
  px: number;
  py: number;
  pdir: Direction;
  playerBullet: Bullet | null;
  enemies: Enemy[];
  spawnTimer: number;
  kills: number;
}

function buildWalls(): WallGrid {
  const w: WallGrid = Array.from({ length: ROWS }, () =>
    new Array<WallCell>(COLS).fill(EMPTY),
  );
  for (const [bx, by, type] of BLOCKS) {
    for (let dy = 0; dy < TANK; dy++) {
      for (let dx = 0; dx < TANK; dx++) w[by + dy][bx + dx] = type;
    }
  }
  return w;
}

function tankRect(x: number, y: number): Rect {
  return { x, y, w: TANK, h: TANK };
}

/** A 2×2 area is on-grid and clear of walls. */
function areaFree(walls: WallGrid, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x + TANK > COLS || y + TANK > ROWS) return false;
  for (let dy = 0; dy < TANK; dy++) {
    for (let dx = 0; dx < TANK; dx++) {
      if (walls[y + dy][x + dx] !== EMPTY) return false;
    }
  }
  return true;
}

function muzzle(x: number, y: number, dir: Direction): { x: number; y: number } {
  switch (dir) {
    case "up":
      return { x, y: y - 1 };
    case "down":
      return { x, y: y + TANK };
    case "left":
      return { x: x - 1, y };
    case "right":
      return { x: x + TANK, y };
  }
}

function levelFor(kills: number): number {
  return Math.floor(kills / KILLS_PER_LEVEL) + 1;
}

function enemyStep(level: number): number {
  return Math.max(1, 4 - Math.floor((level - 1) / 2));
}
function fireStep(level: number): number {
  return Math.max(4, 11 - level);
}
function spawnStep(level: number): number {
  return Math.max(8, 24 - level * 2);
}
function maxEnemies(level: number): number {
  return Math.min(2 + Math.floor(level / 2), 5);
}

export const tankGame: GameDefinition<TankState> = {
  id: "tank",
  label: "TANK",
  grid: { cols: COLS, rows: ROWS, cell: CELL },
  initialLives: 3,
  instructions: "MOVE = AIM\nA = FIRE",

  createState() {
    return {
      walls: buildWalls(),
      px: START.x,
      py: START.y,
      pdir: "up",
      playerBullet: null,
      enemies: [],
      spawnTimer: 0,
      kills: 0,
    };
  },

  fps(level) {
    return Math.min(6 + level, 14);
  },

  tick(s, ctx: TickContext) {
    const { input, events, level, difficulty } = ctx;
    let playerHit = false;

    // --- 1. Player: move + aim ---
    let dir: Direction | null = null;
    if (input.isHeld("up")) dir = "up";
    else if (input.isHeld("down")) dir = "down";
    else if (input.isHeld("left")) dir = "left";
    else if (input.isHeld("right")) dir = "right";
    if (dir) {
      s.pdir = dir;
      const [dx, dy] = DELTA[dir];
      const nx = s.px + dx;
      const ny = s.py + dy;
      const blockedByEnemy = s.enemies.some((e) =>
        rectsOverlap(tankRect(nx, ny), tankRect(e.x, e.y)),
      );
      if (areaFree(s.walls, nx, ny) && !blockedByEnemy) {
        s.px = nx;
        s.py = ny;
      }
    }

    // --- 2. Fire (single projectile) ---
    if (input.consume().includes("fire") && !s.playerBullet) {
      const m = muzzle(s.px, s.py, s.pdir);
      s.playerBullet = { x: m.x, y: m.y, dir: s.pdir };
      events.sound("shoot");
    }

    // Advance a bullet one cell; resolve walls/tanks. Returns true if still alive.
    const stepBullet = (b: Bullet, fromPlayer: boolean): boolean => {
      const [dx, dy] = DELTA[b.dir];
      const nx = b.x + dx;
      const ny = b.y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return false;

      const cell = s.walls[ny][nx];
      if (cell === BRICK) {
        s.walls[ny][nx] = EMPTY; // destructible breaks
        events.sound("hit");
        return false;
      }
      if (cell === STEEL) return false; // blocked, no damage

      if (fromPlayer) {
        const idx = s.enemies.findIndex((e) =>
          pointInRect(nx, ny, tankRect(e.x, e.y)),
        );
        if (idx !== -1) {
          s.enemies.splice(idx, 1);
          s.kills += 1;
          events.addScore(1);
          events.sound("hit");
          events.setLevel(levelFor(s.kills));
          return false;
        }
      } else if (pointInRect(nx, ny, tankRect(s.px, s.py))) {
        playerHit = true;
        events.loseLife();
        return false;
      }

      b.x = nx;
      b.y = ny;
      return true;
    };

    // --- 3. Player bullet ---
    if (s.playerBullet && !stepBullet(s.playerBullet, true)) {
      s.playerBullet = null;
    }

    // --- 4. Enemy AI: move, ram, fire ---
    if (++s.spawnTimer >= Math.max(6, Math.round(spawnStep(level) / difficulty))) {
      s.spawnTimer = 0;
      spawnEnemy(s, level);
    }

    for (const e of s.enemies) {
      if (++e.moveTimer >= enemyStep(level)) {
        e.moveTimer = 0;
        if (Math.random() < 0.35) e.dir = aimAt(e, s);
        const [dx, dy] = DELTA[e.dir];
        const nx = e.x + dx;
        const ny = e.y + dy;
        const result = enemyStepResult(s, e, nx, ny);
        if (result === "move") {
          e.x = nx;
          e.y = ny;
        } else if (result === "ram") {
          if (!playerHit) {
            playerHit = true;
            events.loseLife();
          }
        } else {
          e.dir = DIRS[Math.floor(Math.random() * DIRS.length)];
        }
      }
      if (++e.fireTimer >= fireStep(level) && !e.bullet) {
        e.fireTimer = 0;
        const m = muzzle(e.x, e.y, e.dir);
        e.bullet = { x: m.x, y: m.y, dir: e.dir };
      }
    }

    // --- 5. Enemy bullets ---
    for (const e of s.enemies) {
      if (e.bullet && !stepBullet(e.bullet, false)) e.bullet = null;
    }

    // --- 6. Respawn the player after a hit ---
    if (playerHit) {
      s.px = START.x;
      s.py = START.y;
      s.pdir = "up";
      s.playerBullet = null;
      for (const e of s.enemies) e.bullet = null;
    }
  },

  draw(s, fb: FrameBuffer) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (s.walls[r][c] !== EMPTY) setCell(fb, c, r);
      }
    }
    drawTank(fb, s.px, s.py, s.pdir);
    for (const e of s.enemies) drawTank(fb, e.x, e.y, e.dir);
    if (s.playerBullet) setCell(fb, s.playerBullet.x, s.playerBullet.y);
    for (const e of s.enemies) {
      if (e.bullet) setCell(fb, e.bullet.x, e.bullet.y);
    }
  },
};

function drawTank(fb: FrameBuffer, x: number, y: number, dir: Direction): void {
  setRect(fb, x, y, TANK, TANK);
  const m = muzzle(x, y, dir); // decorative barrel (out-of-bounds is ignored)
  setCell(fb, m.x, m.y);
}

function aimAt(e: Enemy, s: TankState): Direction {
  const ddx = s.px - e.x;
  const ddy = s.py - e.y;
  if (Math.abs(ddx) > Math.abs(ddy)) return ddx > 0 ? "right" : "left";
  return ddy > 0 ? "down" : "up";
}

function enemyStepResult(
  s: TankState,
  self: Enemy,
  nx: number,
  ny: number,
): "move" | "ram" | "block" {
  if (!areaFree(s.walls, nx, ny)) return "block";
  for (const other of s.enemies) {
    if (other !== self && rectsOverlap(tankRect(nx, ny), tankRect(other.x, other.y))) {
      return "block";
    }
  }
  if (rectsOverlap(tankRect(nx, ny), tankRect(s.px, s.py))) return "ram";
  return "move";
}

function spawnEnemy(s: TankState, level: number): void {
  if (s.enemies.length >= maxEnemies(level)) return;
  for (let tries = 0; tries < 6; tries++) {
    const x = Math.floor(Math.random() * (COLS - TANK + 1));
    if (
      areaFree(s.walls, x, 0) &&
      !s.enemies.some((e) => rectsOverlap(tankRect(x, 0), tankRect(e.x, e.y))) &&
      !rectsOverlap(tankRect(x, 0), tankRect(s.px, s.py))
    ) {
      s.enemies.push({
        x,
        y: 0,
        dir: "down",
        bullet: null,
        moveTimer: 0,
        fireTimer: Math.floor(Math.random() * fireStep(level)),
      });
      return;
    }
  }
}
