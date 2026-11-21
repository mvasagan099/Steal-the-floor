# Steal the Floor

> **A 100% offline, ad-free spatial puzzle & strategy game built with React 19, TypeScript, Phaser 3, Tailwind CSS v4, and Capacitor 7 for Android & PWA.**

<p align="center">
  <img src="public/icon-192.png" alt="Steal the Floor Icon" width="128" />
</p>

---

## 🎮 Core Mechanic: Solid-Ground Reclamation

In **Steal the Floor**, you guide **Puff** across floating islands suspended over open void using a limited hand of reusable bridge tiles:

- **Bridge the Void:** Tap, swipe, or use `WASD`/Arrow keys to drop bridge tiles into empty void up to your tile budget (`maxTiles`).
- **Reclaim on Solid Ground:** Step onto any solid platform (Start, Exit, Fixed Islands, Switches, One-Way Pads, Portals, Ice, Open Gates, or intact Crumbling Stones) and all un-trapped bridge tiles fly back into your hand!
- **Master Every Twist:** Collect all glowing **Gems** before reaching the exit flag, manage **Sticky Honey** sacrifices, race **Timed Countdown Gates**, glide across **Frozen Ice Rinks**, and collect **+1 Bonus Tiles** to expand your reach.

---

## 🌟 Highlights (v2.1.0)

- **160 Solver-Validated Campaign Levels across 8 Worlds (480 Stars):**
  - **World 1 — First Steps (1–20):** Bridge reach, island reclamation, and gem detours.
  - **World 2 — Think Ahead (21–40):** Granite rock formations, tight corridors, and strict tile budgets.
  - **World 3 — Tricky Tiles (41–60):** Sticky honey traps, crumbling stones, and one-way arrows.
  - **World 4 — Open the Way (61–80):** Color-coded switches/laser gates (`A`/`B`) and warp portals (`I`/`II`).
  - **World 5 — Master Builder (81–100):** Multi-stage spatial trials combining Worlds 1–4.
  - **World 6 — Frost & Spark (101–120):** Continuous **Ice Sliding (`I`)** and permanent **+1 Bonus Tile Pickups (`+`)**.
  - **World 7 — Clockwork Forge (121–140):** **Timed Switches & Countdown Gates** where every move counts down before the gate seals shut.
  - **World 8 — Obsidian Sanctum (141–160):** **Pushable Crates (`M`) & Weighted Pressure Plates** — shove crates across solid ground or ice to hold sanctum gates open.
- **Automated Mathematical Quality Gates (BFS Solver):**
  - Every campaign level is proven solvable, par-calibrated, and verified so no switch, portal, crumbling stone, one-way arrow, ice runway, `+1` bonus tile, sticky trap, timed gate, or pushable crate can be trivially bypassed.
  - Powers real-time **State-Aware Hints** (`H`), **Live Deadlock Detection** (pulsing Undo warning when no winning path remains), and **Solution Theater ("Watch Optimal Par")** — an animated non-scoring replay of the optimal par route from Pause or after clearing over par.
- **Speedrun Trials & Accessibility Suite:**
  - Optional live **Speedrun Timer** in the HUD with per-level **Personal Best (`⚡ NEW BEST!`)** clear times and **Perfect 3★ / Fastest Clear** stats on the Achievements screen.
  - **High-Contrast Patterns** (crisper tile outlines, corner rivets, and void grid clarity) and **Reduced Motion** (disables camera shake, confetti, ambient particles, and idle bobbing), all persisted in local storage and `STFSAVE:` backups.
- **Endless Mode — Void Rush:**
  - Infinite stream of solver-verified procedural stages with escalating mechanics, personal-best streaks, and rewards.
- **Daily Challenge Archive & Monthly Medals:**
  - Deterministic offline daily puzzles seeded by local calendar date, interactive **Monthly Archive Calendar** for replaying past days, **Bronze (5) / Silver (12) / Gold (20)** monthly trophies, and spoiler-free emoji share cards.
- **Builder Studio (In-Game Level Editor + Offline Share Codes):**
  - Tap-to-paint `6×7` puzzle creator supporting islands, rocks, gems, sticky honey, crumbling stone, ice, pushable crates, `+1` bonus tiles, portals, and Toggle / Weighted Hold / Timed gates.
  - Built-in BFS solver verification + zero-server `STF1:` Base64URL share & import codes.
- **World-Themed Atmosphere, Cosmetics & Procedural Web Audio:**
  - **8 Visual Themes** (*Floating Sky*, *Candy World*, *Ocean Islands*, *Neon Space*, *Forest Adventure*, *Arctic Frost*, *Clockwork Forge*, *Obsidian Sanctum*) each with distinct living background particles and custom 4-bar adaptive musical progressions.
  - **8 Puff Skins**, **6 Jump Particle Trails**, and **15 Achievements** with live unlock toasts and Player Stats.
- **100% Offline, Ad-Free & Private:**
  - Zero ads, zero analytics, zero remote servers, and no `INTERNET` permission in `AndroidManifest.xml`.
  - Offline-first PWA (`public/manifest.json` + `public/sw.js`) and portable `STFSAVE:` backup codes in Settings to transfer saves across devices.

---

## 🛠️ Tech Stack

- **Game Engine:** Phaser 3 (`phaser@3.90.0`)
- **UI & Framework:** React 19, TypeScript 5.8, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Build Tool:** Vite 6 (with Rollup vendor chunk splitting)
- **Mobile Runtime:** Capacitor 7 (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`, `@capacitor/haptics`)
- **Testing & CI:** Vitest (`tests/logic.test.ts`, `tests/levels.test.ts`, `tests/systems.test.ts`) + GitHub Actions (`.github/workflows/ci.yml`)

---

## 🚀 Development & Verification

```bash
# Install dependencies
npm install

# Run development server (http://localhost:5173)
npm run dev

# Run full unit & 160-level BFS Quality Gate test suite
npm test

# Re-validate and regenerate src/levels/levelsData.ts from ASCII grids
npx tsx scripts/buildLevels.ts

# Type-check and build production bundle (dist/)
npm run build
```

---

## 📱 Android Build & Release Packaging

```bash
# Build web assets & sync Capacitor plugins/assets into android/
npm run build
npx cap sync android

# Build debug APK
cd android && ./gradlew assembleDebug

# Build signed Play Store App Bundle (.aab) via environment variables
export STEAL_FLOOR_KEYSTORE_PATH="/path/to/upload-keystore.jks"
export STEAL_FLOOR_KEYSTORE_PASSWORD="your-store-password"
export STEAL_FLOOR_KEY_ALIAS="your-key-alias"
export STEAL_FLOOR_KEY_PASSWORD="your-key-password"
cd android && ./gradlew bundleRelease
```

---

## ⌨️ Controls

| Input | Action |
| :--- | :--- |
| **Tap adjacent cell / Swipe** | Move Puff / drop bridge tile |
| **`WASD` / Arrow Keys** | Move Puff |
| **`Z` / `Backspace`** | Undo move |
| **`R`** | Restart level |
| **`H`** | Show live-state optimal hint |
| **`Esc` / Android Back** | Close modal or toggle Pause menu |
