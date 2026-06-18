# Brick Shooter — Roadmap

Retro LCD handheld shooting games for the web. The goal is to make the user feel
like they're holding the original "Brick Game 9999 in 1" plastic handheld — not a
modern remake.

> **Read this before any build phase:** `AGENTS.md` warns that this is **not** the
> Next.js in your training data. The installed version is **Next.js 16.2.9** with
> **React 19.2.4** and **Tailwind v4**. Open the relevant guide in
> `node_modules/next/dist/docs/` before writing framework code, and heed deprecation
> notices.

---

## Core principle

Every decision prioritizes, in order:

1. **Nostalgia over realism**
2. **Simplicity over visual effects**
3. **Authentic LCD limitations over modern graphics**
4. **Responsiveness over complexity**

When in doubt, pick the more boring, more authentic option.

---

## Tech stack (as installed)

| Concern        | Choice                                  | Status            |
| -------------- | --------------------------------------- | ----------------- |
| Framework      | Next.js 16.2.9 (App Router)             | ✅ installed       |
| Language       | TypeScript 5                            | ✅ installed       |
| UI runtime     | React 19.2.4                            | ✅ installed       |
| Styling        | Tailwind v4 + CSS variables             | ✅ installed       |
| Rendering      | HTML5 Canvas + `requestAnimationFrame`  | to build          |
| State          | Zustand                                 | ⬜ **not yet added** |
| Persistence    | `localStorage` (high scores, settings)  | to build          |

---

## Authenticity rules (never violate)

**Never add:** particle effects · smooth/easing transitions · interpolation ·
gradients · shadows inside the screen · transparency · anti-aliasing · dynamic
lighting · modern UI animations · power-ups not on the original device · online
multiplayer · skins or cosmetics.

**LCD palette — only these 4 colors:**

```css
--lcd-background: #9ead86;
--lcd-light:      #b8c6a5;
--lcd-dark:       #3f4f3a;
--lcd-outline:    #2d3528;
```

**Grid law:** everything is whole 16×16px cells. Movement is cell-to-cell, in
discrete ticks. Never pixel-based movement, never sub-cell positions.

---

## Version plan

Each version is one self-contained, shippable increment with its own doc. Build in
order; later versions depend on earlier ones. Game order is deliberate: **Space
Shooting first** because it's the simplest game and best stress-tests the engine
before we add walls (Tank) and area-fill logic (Fill Shot).

| Version | Title                       | Doc                                              | Theme                                   |
| ------- | --------------------------- | ------------------------------------------------ | --------------------------------------- |
| v0.1    | Foundation & LCD theme      | [v0.1-foundation.md](./v0.1-foundation.md)       | Scaffolding, palette, fonts, structure  |
| v0.2    | Grid engine                 | [v0.2-grid-engine.md](./v0.2-grid-engine.md)     | Fixed-timestep loop, grid, collision, input |
| v0.3    | Handheld shell UI           | [v0.3-handheld-shell.md](./v0.3-handheld-shell.md) | Plastic body, LCD screen, D-pad, panel  |
| v0.4    | Game 1 — Space Shooting     | [v0.4-space-shooting.md](./v0.4-space-shooting.md) | First playable; validates the engine    |
| v0.5    | Game 2 — Tank Battle        | [v0.5-tank-battle.md](./v0.5-tank-battle.md)     | Walls, top-down, multiple enemies       |
| v0.6    | Game 3 — Fill Shot          | [v0.6-fill-shot.md](./v0.6-fill-shot.md)         | Area-fill mechanic, target %            |
| v0.7    | Audio                       | [v0.7-audio.md](./v0.7-audio.md)                 | Piezo beeps, single channel, mute       |
| v1.0    | Polish, mobile & persistence| [v1.0-polish-mobile.md](./v1.0-polish-mobile.md) | Touch controls, haptics, scores, flicker |

---

## Target file structure (end state)

```
/app
  /tank          → Tank Battle route
  /shooting      → Space Shooting route
  /fill-shot     → Fill Shot route
/components
  HandheldShell.tsx
  LCDScreen.tsx
  DPad.tsx
  ActionButtons.tsx
  ScorePanel.tsx
/lib
  engine/
    gameLoop.ts
    grid.ts
    collision.ts
    input.ts
/games
  tank/
  shooting/
  fillShot/
/assets
  sounds/
  fonts/
```

---

## Global definition of done (every version)

- [ ] `npm run build` passes; no type errors; lint clean.
- [ ] No authenticity rule violated (palette, grid, no smooth motion).
- [ ] Works with keyboard on desktop (mobile lands in v1.0).
- [ ] New behavior is manually verified in the browser, not just compiled.
- [ ] The doc's acceptance criteria are all checked.
