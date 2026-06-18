# Brick Shooter

Brick Shooter is a web recreation of the classic shooting and block games found on the original "Brick Game 9999 in 1" LCD handheld consoles. This project is designed to replicate the exact limitations and look of the retro plastic device, prioritizing nostalgia, authentic LCD constraints, and cell-based grid movement over modern graphics and animations.

## Technical Stack

This project is built using modern front-end technologies configured to mimic vintage hardware limitations:

*   **Framework:** Next.js 16 (App Router)
*   **Library:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 and Custom CSS Variables
*   **State Management:** Zustand
*   **Persistence:** LocalStorage (for scores, mute states, and settings)
*   **Rendering:** HTML5 Canvas API with custom pixel-art scaling
*   **Audio:** Custom single-channel oscillator synthesis replicating piezo-beeper hardware

## Development Principles and Authenticity Rules

To maintain the retro look and feel of the original physical device, developers must strictly adhere to the following rules:

### 1. LCD Palette Limitations
Only these four colors are permitted inside the LCD screen area. No gradients, transparency, or color mixing are allowed.
*   Background: `--lcd-background` (#9ead86)
*   Inactive segment light: `--lcd-light` (#b8c6a5)
*   Active segment dark: `--lcd-dark` (#3f4f3a)
*   Screen Outline: `--lcd-outline` (#2d3528)

The plastic shell around the LCD may use modern CSS gradients and shadows to represent the physical device, but the LCD window itself must remain strictly limited to the four-color palette.

### 2. Grid Coordinates Law
All game logic must operate strictly on integer grid cell coordinates `{x, y}`, not pixel values. Movement must be discrete (cell-to-cell) on ticks. Sub-cell positions or floating point interpolation are prohibited. The canvas renderer is responsible for multiplying the grid cells by the cell size (16px) for drawing.

### 3. Rendering Limitations
Inside the screen area, developers must not use:
*   Anti-aliasing
*   Gradients or box-shadows
*   Opacity or transparency adjustments
*   Smooth animations, easing transitions, or interpolation
*   Particle effects or modern screen shakes

### 4. Typography
Only retro, monospaced pixel fonts are allowed. The project integrates Google Fonts for:
*   Press Start 2P (`--font-press-start`)
*   VT323 (`--font-vt323`)

## Directory Structure

```
├── app/                  # Next.js App Router entry points and routes
│   ├── favicon.ico       # Legacy browser favicon
│   ├── icon.svg          # Main vector favicon representation of the console
│   ├── globals.css       # Global styles, Tailwind directives, and CSS variables
│   ├── layout.tsx        # Base HTML layout and font loading
│   ├── page.tsx          # Main menu and settings screen
│   └── [game]/           # Route directory for each individual game (e.g. shooting, tank)
├── components/           # Reusable React components for console hardware shell and buttons
│   ├── ActionButtons.tsx # Primary and secondary action buttons
│   ├── DPad.tsx          # Directional control D-pad
│   ├── GameConsole.tsx   # Core component linking the loop, input, canvas, and layout
│   ├── HandheldShell.tsx # Outer plastic casing housing the system layout
│   ├── LCDScreen.tsx     # Containment for the playfield canvas and screen overlay text
│   └── ScorePanel.tsx    # HUD displaying scores, lives, speed, and status flags
├── docs/                 # Version-by-version specifications and roadmap documentation
├── games/                # Folder containing game logic definitions
│   └── [game]/           # Self-contained game state, tick logic, and drawing code
└── lib/                  # Shared utility code
    └── engine/           # Game-agnostic engine logic (loop, input, grid drawing, state, sounds)
```

## Getting Started

### Installation
Install dependencies using npm:
```bash
npm install
```

### Development Server
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to test.

### Production Build
To build the application for production and verify there are no compilation, linting, or type errors:
```bash
npm run build
```

### Code Quality and Linting
To check and enforce style guidelines and find potential bugs:
```bash
npm run lint
```

## Adding a New Game

The game engine is designed to be game-agnostic. The core engine files under `lib/engine/` must not import code from specific games under `games/`. Follow these steps to implement and register a new game:

### Step 1: Define Game State and Configuration
Create a directory under `games/[your-game-name]/` and add an `index.ts` file. Define your game state interface and configure the grid size.

```typescript
import type { GameDefinition } from "@/lib/engine/types";

interface CustomGameState {
  playerX: number;
  playerY: number;
  // Add other properties representing your game logic here
}
```

### Step 2: Implement the Game Definition
Export a configuration object implementing the `GameDefinition<S>` interface:

```typescript
export const customGame: GameDefinition<CustomGameState> = {
  id: "customGame", // Must match the GameId type in types.ts
  label: "CUSTOM",   // 6-character uppercase identifier shown on the HUD
  grid: {
    cols: 12,        // Playfield columns
    rows: 20,        // Playfield rows
    cell: 16,        // Size of each grid cell in pixels
  },
  initialLives: 3,
  instructions: "◄ ► MOVE\nA ACTION",

  createState() {
    return {
      playerX: 5,
      playerY: 18,
    };
  },

  fps(level) {
    // Return game loop speed (Hz / Ticks per second) scaling with game level
    return Math.min(6 + level, 14);
  },

  tick(state, context) {
    const { input, events, level, difficulty } = context;
    // Process input, update state, and trigger game events (scores, lives, sounds)
    if (input.isHeld("left")) {
      state.playerX = Math.max(0, state.playerX - 1);
    }
    // Access event emitters like events.addScore(points) and events.sound("hit")
  },

  draw(state, frameBuffer) {
    // Write state elements into the frame buffer grid using setRect or custom loops
    // frameBuffer is a boolean[rows][cols] grid where true represents a lit cell
  },
};
```

### Step 3: Register the Game Types
Add your game identifier to the `GameId` type inside `lib/engine/types.ts`:
```diff
- export type GameId = "shooting" | "tank" | "fillShot";
+ export type GameId = "shooting" | "tank" | "fillShot" | "customGame";
```

### Step 4: Create the Route
Create a new Next.js route file under `app/[your-game-name]/page.tsx` and render the `GameConsole` component populated with your game definition:

```tsx
"use client";

import GameConsole from "@/components/GameConsole";
import { customGame } from "@/games/customGame";

export default function CustomGamePage() {
  return (
    <main className="page">
      <GameConsole def={customGame} />
    </main>
  );
}
```

### Step 5: Add to navigation list
Open `app/page.tsx` and register your game in the `GAMES` list to display it on the main menu:

```typescript
const GAMES = [
  // ... existing games
  { href: "/custom-game", id: "customGame", name: "CUSTOM", icon: "★" },
];
```
