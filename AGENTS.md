<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Brick Shooter

Faithful web recreation of the shooting games from "Brick Game 9999 in 1" LCD
handhelds. It must feel like the original plastic device, **not** a modern remake.
Full plan and per-version specs live in [`docs/ROADMAP.md`](docs/ROADMAP.md) — read
it before starting a build phase.

## Core principle

When choices conflict, prefer in this order: **nostalgia > realism**,
**simplicity > visual effects**, **authentic LCD limits > modern graphics**,
**responsiveness > complexity**. The boring, more authentic option usually wins.

## Authenticity rules (non-negotiable)

- **Only these 4 colors inside the LCD screen** — no others, ever:
  `--lcd-background: #9ead86` · `--lcd-light: #b8c6a5` · `--lcd-dark: #3f4f3a` ·
  `--lcd-outline: #2d3528`.
- **Everything is whole 16×16px cells.** Movement is cell-to-cell in discrete
  ticks. Never pixel-based movement, never sub-cell positions.
- **No** anti-aliasing, gradients, transparency, shadows inside the screen, smooth
  transitions, easing, interpolation, or particle effects.
- **Never add** features absent from the original device: power-ups not on the
  hardware, online multiplayer, skins/cosmetics, dynamic lighting, smooth camera.
- Retro/segmented fonts only (Press Start 2P, VT323) — no modern typography.
- The plastic shell *around* the LCD may use normal styling; the LCD *window* obeys
  the rules above absolutely.

## Tech & conventions

- Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
  HTML5 Canvas + `requestAnimationFrame` · Zustand · `localStorage`.**
- **Game logic operates on grid coordinates (`{x, y}` cells), never pixels.** Only
  the renderer multiplies by the 16px cell size.
- The engine in `lib/engine/` (`gameLoop`, `grid`, `collision`, `input`) is
  **game-agnostic** — it must not import from any specific game in `games/`.
- Fixed-timestep loop at **10–15 FPS**; logic steps are decoupled from the 60Hz
  rAF and never interpolated between ticks.
- Shared state (score, hi-score, level, lives, mode, status, mute) lives in the
  Zustand store; high scores and settings persist to `localStorage`.
- Keep the target file structure in `docs/ROADMAP.md`: `/app/<game>` routes,
  `/components` shell UI, `/lib/engine`, `/games/<game>` logic, `/assets`.

## Workflow

- Build in versioned phases (v0.1 → v1.0). Each version has a doc in `docs/` with
  its scope and acceptance criteria — follow it and check the boxes.
- Before writing framework code, read the relevant `node_modules/next/dist/docs/`
  guide (see the Next.js block above).
- A phase isn't done until `npm run build` passes, no authenticity rule is
  violated, and the change is manually verified in the browser — not just compiled.
