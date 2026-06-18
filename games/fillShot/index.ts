// Fill Shot — slide a cannon along the bottom and fire upward to "paint" empty
// cells. Each shot fills the vertical trail it travels until it's blocked. Reach
// a target % of the screen while dodging roaming enemies that block shots and
// can knock out the cannon.

import { setCell, setRect } from "@/lib/engine/grid";
import type {
  Direction,
  FrameBuffer,
  GameDefinition,
  TickContext,
} from "@/lib/engine/types";

const COLS = 12;
const ROWS = 20;
const CELL = 16;

// Cannon: 1 wide × 2 tall in a reserved bottom lane (rows 18-19). Being 1-wide it
// can line up with every column, so 100% fill is always reachable.
const CANNON_TOP = ROWS - 2; // 18
const SHOT_START = ROWS - 3; // 17 — highest fillable row / first shot cell
const FILLABLE_TOTAL = (ROWS - 2) * COLS; // rows 0..17

const DELTA: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
const DIRS: Direction[] = ["up", "down", "left", "right"];

const OBSTACLES: [number, number][] = [
  [2, 5],
  [3, 5],
  [8, 6],
  [9, 6],
  [5, 9],
  [6, 9],
  [1, 12],
  [10, 12],
  [4, 14],
  [7, 14],
];

interface FillEnemy {
  x: number;
  y: number;
  dir: Direction;
  moveTimer: number;
}

interface FillState {
  filled: boolean[][];
  px: number; // cannon column
  shot: { x: number; y: number; startY: number } | null;
  enemies: FillEnemy[];
  fillCount: number;
}

function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

function buildFilled(): { grid: boolean[][]; count: number } {
  const grid = Array.from({ length: ROWS }, () =>
    new Array<boolean>(COLS).fill(false),
  );
  let count = 0;
  for (const [x, y] of OBSTACLES) {
    if (!grid[y][x]) {
      grid[y][x] = true;
      count++;
    }
  }
  return { grid, count };
}

function enemyStep(level: number): number {
  return Math.max(1, 3 - Math.floor(level / 3));
}
function enemyCount(level: number): number {
  return Math.min(2 + Math.floor(level / 2), 4);
}
function targetPct(level: number, difficulty: number): number {
  const bonus = Math.round((difficulty - 1) * 25);
  return Math.max(40, Math.min(45 + level * 6 + bonus, 88));
}

function spawnEnemies(s: FillState, count: number): void {
  s.enemies = [];
  let guard = 0;
  while (s.enemies.length < count && guard++ < 200) {
    const x = randInt(COLS);
    const y = randInt(6); // top band
    if (!s.filled[y][x] && !s.enemies.some((e) => e.x === x && e.y === y)) {
      s.enemies.push({ x, y, dir: "down", moveTimer: 0 });
    }
  }
}

function validEnemyCell(s: FillState, self: FillEnemy, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= COLS || y > SHOT_START) return false;
  if (s.filled[y][x]) return false;
  return !s.enemies.some((e) => e !== self && e.x === x && e.y === y);
}

function resetField(s: FillState, newLevel: number): void {
  const { grid, count } = buildFilled();
  s.filled = grid;
  s.fillCount = count;
  s.shot = null;
  spawnEnemies(s, enemyCount(newLevel));
}

export const fillShotGame: GameDefinition<FillState> = {
  id: "fillShot",
  label: "FILL",
  grid: { cols: COLS, rows: ROWS, cell: CELL },
  initialLives: 3,
  instructions: "◄ ► MOVE\nA FILL",

  createState() {
    const { grid, count } = buildFilled();
    const s: FillState = {
      filled: grid,
      px: Math.floor(COLS / 2),
      shot: null,
      enemies: [],
      fillCount: count,
    };
    spawnEnemies(s, enemyCount(1));
    return s;
  },

  fps(level) {
    return Math.min(6 + level, 13);
  },

  tick(s, ctx: TickContext) {
    const { input, events, level, difficulty } = ctx;

    // 1. Move the cannon.
    const left = input.isHeld("left");
    const right = input.isHeld("right");
    if (left && !right) s.px = Math.max(0, s.px - 1);
    else if (right && !left) s.px = Math.min(COLS - 1, s.px + 1);

    // 2. Fire (single projectile).
    if (input.consume().includes("fire") && !s.shot) {
      s.shot = { x: s.px, y: SHOT_START, startY: SHOT_START };
      events.sound("shoot");
    }

    // 3. Shot rises and fills its trail when blocked.
    if (s.shot) {
      const sh = s.shot;
      const ny = sh.y - 1;
      const enemyHere = s.enemies.some((e) => e.x === sh.x && e.y === ny);
      const blocked = ny < 0 || s.filled[ny][sh.x] || enemyHere;
      if (blocked) {
        let added = 0;
        for (let yy = sh.y; yy <= sh.startY; yy++) {
          if (!s.filled[yy][sh.x]) {
            s.filled[yy][sh.x] = true;
            added++;
          }
        }
        s.fillCount += added;
        if (added > 0) events.addScore(added);
        s.shot = null;

        const pct = (s.fillCount / FILLABLE_TOTAL) * 100;
        if (pct >= targetPct(level, difficulty)) {
          events.addScore(10);
          resetField(s, level + 1);
          events.setLevel(level + 1);
        }
      } else {
        sh.y = ny;
      }
    }

    // 4. Enemies roam (biased downward to threaten the cannon).
    let playerHit = false;
    for (const e of s.enemies) {
      if (++e.moveTimer >= enemyStep(level)) {
        e.moveTimer = 0;
        let dir = e.dir;
        if (Math.random() < 0.3) {
          dir = Math.random() < 0.5 ? "down" : DIRS[randInt(4)];
        }
        const [dx, dy] = DELTA[dir];
        if (validEnemyCell(s, e, e.x + dx, e.y + dy)) {
          e.x += dx;
          e.y += dy;
          e.dir = dir;
        } else {
          e.dir = DIRS[randInt(4)];
        }
      }
      // Reached the cannon's column at the bottom fillable row → a hit.
      if (e.y === SHOT_START && e.x === s.px) playerHit = true;
    }

    if (playerHit) {
      events.loseLife();
      s.shot = null; // interrupt the in-progress fill
      for (const e of s.enemies) e.y = Math.min(e.y, 2); // push enemies back up
    }
  },

  draw(s, fb: FrameBuffer) {
    for (let r = 0; r <= SHOT_START; r++) {
      for (let c = 0; c < COLS; c++) {
        if (s.filled[r][c]) setCell(fb, c, r);
      }
    }
    setRect(fb, s.px, CANNON_TOP, 1, 2); // cannon
    if (s.shot) setCell(fb, s.shot.x, s.shot.y);
    for (const e of s.enemies) setCell(fb, e.x, e.y);
  },
};
