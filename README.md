# Steal the Floor

> **A polished, offline-first mobile casual puzzle and strategy game built with React, TypeScript, Phaser 3, Tailwind CSS, and Capacitor for Android.**

![Steal the Floor Icon](public/icon.svg)

---

## 🎮 Overview

In **Steal the Floor**, the player controls a cute mascot ("Puff") stranded on floating islands separated by open void. To reach the exit flag, the player must strategically place and reclaim a limited inventory of reusable floor tiles.

Every time the character advances off a standard bridge tile, that tile returns to their inventory. However, tricky hazards like **sticky honey** (trapping tiles permanently), **crumbling stone** (breaking on departure), **one-way arrows**, **switches & locking gates**, and **teleportation portals** create deep, rewarding spatial puzzles.

---

## 🌟 Key Features

- **100 Solver-Validated Handcrafted Levels** across 5 distinct worlds:
  - **World 1: First Steps (Levels 1–20)** — Movement, tile placement, tile recovery, and star collection.
  - **World 2: Think Ahead (Levels 21–40)** — Rock formations, winding paths, and tight inventory allocations.
  - **World 3: Tricky Tiles (Levels 41–60)** — Sticky honey floors, crumbling platforms, and one-way arrows.
  - **World 4: Open the Way (Levels 61–80)** — Pressure switches, laser gates, and dimensional teleporters.
  - **World 5: Master Builder (Levels 81–100)** — Elaborate multi-stage spatial puzzles combining all mechanics.
- **Mathematical BFS Solver**:
  - Every single level is proven mathematically solvable before publishing.
  - Generates optimal minimal moves (par) for 3-star ratings.
  - Powers an in-game **Hint System** that calculates the next best move in real-time.
- **5 Unlockable Visual Themes**:
  - ☁️ *Floating Sky* (serene azure skies & floating islands)
  - 🍬 *Candy World* (pastel pink sweets & wafer tiles)
  - 🏝️ *Ocean Islands* (tropical teal lagoons & sand bars)
  - 🚀 *Neon Space* (cyber synthwave nebula & laser grid)
  - 🌲 *Forest Adventure* (lush mossy stones & canopy glow)
- **Mascot Customization**:
  - Unlockable skins: *Sunny Puff*, *Berry Puff*, *Aqua Puff*, *Moss Puff*, and *Royal Gold*.
- **Daily Challenge**:
  - Deterministic procedural daily puzzle seeded by calendar date.
  - Rewards bonus coins and tracks daily completion streaks.
- **Achievements & Replayability**:
  - 11 tracking badges for milestone completions, star collections, and perfect runs.
- **Procedural Web Audio Engine**:
  - 100% offline, synthesized sound effects for footsteps, tile placement, recovery whooshes, star chimes, and victory fanfares.
  - Ambient relaxing puzzle background music with volume and mute controls.
  - Native haptic vibration feedback on mobile.
- **100% Offline & Private**:
  - Zero external servers or tracking.
  - Versioned local storage save system with migration support.
- **Android Ready (Capacitor)**:
  - Portrait orientation locked.
  - Safe-area inset support for modern edge-to-edge screens.
  - Ultra-lightweight APK: **4.4 MB** (well under the 50 MB mobile target).

---

## 🛠️ Technology Stack

- **Game Engine:** Phaser 3 (`phaser@3.90.0`)
- **Frontend / UI:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Build Tool:** Vite 6
- **Mobile Runtime:** Capacitor 7 (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`)
- **Testing:** Vitest (`vitest run` running unit tests and level solvability tests)
- **Audio:** Web Audio API (procedural synthesis)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested with Node 22)
- npm 9+
- Java 17+ & Android SDK (for native Android builds)

### Installation

```bash
git clone https://github.com/mvasagan099/Steal-the-floor.git
cd Steal-the-floor
npm install
```

### Development Server

Start Vite local dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Automated Test Suite

Run the full Vitest suite covering mechanics, engine logic, systems, storage, and 100/100 level solvability:

```bash
npm test
```

### Production Web Build

```bash
npm run build
```

This compiles TypeScript and builds optimized static assets to `dist/`.

---

## 📱 Android Build & Packaging

Sync the web build to the Android Capacitor project:

```bash
npx cap sync android
```

Build the native debug APK:

```bash
cd android
./gradlew assembleDebug
```

The compiled APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
(A pre-built copy is also available in `build-artifacts/steal-the-floor-debug.apk`).

---

## 🧩 Mechanics Reference

| Element | Icon / Texture | Behavior |
| :--- | :---: | :--- |
| **Start Tile** | Lush Island with S | Fixed spawn point for the player mascot. |
| **Exit Tile** | Gold Island with Flag | Goal destination; stepping here with all stars collected completes the level. |
| **Bridge Tile** | Cyan Planks | Placed when stepping into empty space. Recycled back to inventory upon stepping off. |
| **Sticky Floor** | Purple Honey | Traps placed bridge tiles permanently when stepped off, reducing inventory. |
| **Crumbling Tile** | Cracked Slate | Breaks into void after being stepped off; cannot be walked on again. |
| **One-Way Arrow** | Directional Chevron | Can only be exited in the direction the chevron points. |
| **Switch & Door** | Pressure Pad / Laser Gate | Stepping on the switch toggles the door open or closed. |
| **Teleporter** | Swirling Rune Vortex | Instantly warps the character between linked portal pads. |
| **Collectible Star** | Gleaming 5-Point Star | Optional or required collectible; needed for 3-star rating. |

---

## 📄 License

MIT License. Designed and developed for the Steal the Floor casual puzzle mobile experience.
