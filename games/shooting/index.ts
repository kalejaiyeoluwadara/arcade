// Space Shooting — player ship slides along the bottom, single projectile,
// enemies descend in simple zig-zag patterns. Everything on the grid.

import { setRect } from "@/lib/engine/grid";
import { pointInRect } from "@/lib/engine/collision";
import type { FrameBuffer, GameDefinition, TickContext } from "@/lib/engine/types";

const COLS = 12;
const ROWS = 20;
const CELL = 16;

const SHIP_W = 3;
const SHIP_H = 2;
const ENEMY = 2; // 2×2
const MAX_ENEMIES = 6;
const KILLS_PER_LEVEL = 10;

interface Enemy {
  x: number;
  y: number;
  vx: -1 | 0 | 1;
}

interface ShootingState {
  px: number; // ship left column
  bullet: { x: number; y: number } | null;
  enemies: Enemy[];
  spawnTimer: number;
  enemyTimer: number;
  kills: number;
}

const shipY = ROWS - SHIP_H; // top row of the ship

function enemyStep(level: number): number {
  return Math.max(1, 4 - Math.floor((level - 1) / 2));
}

function spawnStep(level: number): number {
  return Math.max(6, 16 - level);
}

function levelFor(kills: number): number {
  return Math.floor(kills / KILLS_PER_LEVEL) + 1;
}

function hitsShip(e: Enemy, px: number): boolean {
  // Enemy reached the ship's rows and overlaps it horizontally.
  return e.y + ENEMY > shipY && e.x < px + SHIP_W && e.x + ENEMY > px;
}

export const shootingGame: GameDefinition<ShootingState> = {
  id: "shooting",
  label: "SPACE",
  grid: { cols: COLS, rows: ROWS, cell: CELL },
  initialLives: 3,
  instructions: "◄ ► MOVE\nA FIRE",

  createState() {
    return {
      px: Math.floor((COLS - SHIP_W) / 2),
      bullet: null,
      enemies: [],
      spawnTimer: 0,
      enemyTimer: 0,
      kills: 0,
    };
  },

  fps(level) {
    return Math.min(6 + level, 14);
  },

  tick(s, ctx: TickContext) {
    const { input, events, level } = ctx;

    // 1. Move the ship (one cell per tick while held).
    const left = input.isHeld("left");
    const right = input.isHeld("right");
    if (left && !right) s.px = Math.max(0, s.px - 1);
    else if (right && !left) s.px = Math.min(COLS - SHIP_W, s.px + 1);

    // 2. Fire — single projectile on screen at a time.
    if (input.consume().includes("fire") && !s.bullet) {
      s.bullet = { x: s.px + 1, y: shipY - 1 };
      events.sound("shoot");
    }

    // 3. Advance the bullet and test it against enemies.
    if (s.bullet) {
      s.bullet.y -= 1;
      if (s.bullet.y < 0) {
        s.bullet = null;
      } else {
        const b = s.bullet;
        const idx = s.enemies.findIndex((e) =>
          pointInRect(b.x, b.y, { x: e.x, y: e.y, w: ENEMY, h: ENEMY }),
        );
        if (idx !== -1) {
          s.enemies.splice(idx, 1);
          s.bullet = null;
          s.kills += 1;
          events.addScore(1);
          events.sound("hit");
          events.setLevel(levelFor(s.kills));
        }
      }
    }

    // 4. Step enemies down/sideways on their own (level-scaled) cadence.
    if (++s.enemyTimer >= enemyStep(level)) {
      s.enemyTimer = 0;
      for (const e of s.enemies) {
        e.y += 1;
        e.x += e.vx;
        if (e.x < 0) {
          e.x = 0;
          e.vx = 1;
        } else if (e.x > COLS - ENEMY) {
          e.x = COLS - ENEMY;
          e.vx = -1;
        }
      }
      // Any enemy that reached the ship row costs a life and is removed.
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        if (hitsShip(s.enemies[i], s.px)) {
          s.enemies.splice(i, 1);
          events.loseLife();
        }
      }
    }

    // 5. Spawn new enemies from the top.
    if (++s.spawnTimer >= spawnStep(level)) {
      s.spawnTimer = 0;
      if (s.enemies.length < MAX_ENEMIES) {
        s.enemies.push({
          x: Math.floor(Math.random() * (COLS - ENEMY + 1)),
          y: 0,
          vx: (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1,
        });
      }
    }
  },

  draw(s, fb: FrameBuffer) {
    // Ship (3×2)
    setRect(fb, s.px, shipY, SHIP_W, SHIP_H);
    // Bullet (1×1)
    if (s.bullet) setRect(fb, s.bullet.x, s.bullet.y, 1, 1);
    // Enemies (2×2)
    for (const e of s.enemies) setRect(fb, e.x, e.y, ENEMY, ENEMY);
  },
};
