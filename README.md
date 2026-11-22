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

## 🌟 Highlights (v3.2.0)

- **200 Solver-Validated Campaign Levels across 10 Worlds (600 Stars):**
  - **World 1 — First Steps (1–20):** Bridge reach, island reclamation, and gem detours.
  - **World 2 — Think Ahead (21–40):** Granite rock formations, tight corridors, and strict tile budgets.
  - **World 3 — Tricky Tiles (41–60):** Sticky honey traps, crumbling stones, and one-way arrows.
  - **World 4 — Open the Way (61–80):** Color-coded switches/laser gates (`A`/`B`) and warp portals (`I`/`II`).
  - **World 5 — Master Builder (81–100):** Multi-stage spatial trials combining Worlds 1–4.
  - **World 6 — Frost & Spark (101–120):** Continuous **Ice Sliding (`I`)** and permanent **+1 Bonus Tile Pickups (`+`)**.
  - **World 7 — Clockwork Forge (121–140):** **Timed Switches & Countdown Gates** where every move counts down before the gate seals shut.
  - **World 8 — Obsidian Sanctum (141–160):** **Pushable Crates (`M`) & Weighted Pressure Plates** — shove crates across solid ground or ice to hold sanctum gates open.
  - **World 9 — Skyward Spire (161–180):** **Golden Springboards (`J`)** — vault 2 tiles forward over rocks, honey, and void, chaining consecutive leaps or launching straight onto Ice and Portals.
  - **World 10 — Celestial Crown (181–200):** **Golden Keys (`K`) & Vault Locks (`L`)** — collect keys to permanently unlock sealed vaults into solid ground (reclaiming tiles and letting crates pass!), culminating in **Level 200 — Celestial Crown**.
- **Master Trials (5 Curated 4-Stage Boss Gauntlets):**
  - Back-to-back 4-stage gauntlets spanning all 10 worlds (*Island Sprint*, *Hazard Crucible*, *Clockwork Frost*, *Sanctum Acrobat*, and *Celestial Grand Trial*) with cumulative move/time scoring, **Bronze (`+20 🪙`) / Silver (`+40 🪙`) / All-Par Gold (`+75 🪙`)** medals, personal-best records, and the **Trial Champion** (`⚔️`) badge.
- **Automated Mathematical Quality Gates (BFS Solver):**
  - Every campaign level is proven solvable, par-calibrated, and verified so no switch, portal, crumbling stone, one-way arrow, ice runway, `+1` bonus tile, sticky trap, timed gate, pushable crate, springboard, or vault lock can be trivially bypassed.
  - Powers real-time **State-Aware Hints** (`H`), **Live Deadlock Detection** (pulsing Undo warning when no winning path remains), and **Solution Theater ("Watch Optimal Par")** — an animated non-scoring replay of the optimal par route from Pause or after clearing over par.
- **Player Mastery Ranks, Speedrun Trials, Mechanic Field Guide & Accessibility Suite:**
  - Dynamic **Player Mastery Rank** progression (*Novice Bridger* → *Island Hopper* → *Hazard Tamer* → *Void Architect* → *Grand Strategist* → *Celestial Sovereign*) displayed on the tappable Home Screen Mastery Strip and **Mastery & Badges** profile screen alongside Worlds, Trials, and Speedrun stats.
  - Optional live **Speedrun Timer** in the HUD with per-level **Personal Best (`⚡ NEW BEST!`)** clear times, **World Speedrun Totals**, and **All / Unsolved / Needs 3★** Level Select filters.
  - Interactive **Mechanic Field Guide** (`Field Guide` on Home & Pause) documenting all 14 puzzle mechanics with rules and tactical tips.
  - **High-Contrast Patterns** (crisper tile outlines, corner rivets, and void grid clarity) and **Reduced Motion** (disables camera shake, confetti, ambient particles, and idle bobbing), all persisted in local storage and `STFSAVE:` backups.
- **Endless Mode — Void Rush:**
  - Infinite stream of solver-verified procedural stages with escalating mechanics (including Crumbling, Ice, `+1` Bonus Tiles, Sticky Honey, and Springboards), personal-best streaks, and rewards.
- **Daily Challenge Archive & Monthly Medals:**
  - Deterministic offline daily puzzles seeded by local calendar date (with Crumbling, Ice, and Springboards variety), interactive **Monthly Archive Calendar** for replaying past days, **Bronze (5) / Silver (12) / Gold (20)** monthly trophies, and spoiler-free emoji share cards.
- **Builder Studio (In-Game Level Editor + Starter Blueprints + Offline Share Codes):**
  - Tap-to-paint `6×7` puzzle creator supporting islands, rocks, gems, sticky honey, crumbling stone, ice, springboards, golden keys, locked vaults, pushable crates, `+1` bonus tiles, portals, and Toggle / Weighted Hold / Timed gates.
  - Includes **4 Solver-Verified Starter Blueprints** (*Spring Vault*, *Crate Hold*, *Vault Heist*, *Frozen Spark*), a one-tap **🎲 Random Puzzle** generator, live BFS solver verification, and zero-server `STF1:` Base64URL share & import codes.
- **World-Themed Atmosphere, Custom Bridge Tiles, Cosmetics & Procedural Web Audio:**
  - **10 Visual Themes** (*Floating Sky* through *Celestial Crown*) each with distinct living background particles and custom 4-bar adaptive musical progressions.
  - **6 Custom Procedural Bridge Tile Skins** (*Classic Glass*, *Bamboo Plank*, *Neon Circuit*, *Prism Crystal*, *Molten Rune*, *Starlight Tile*), **10 Puff Skins**, **8 Jump Particle Trails**, and **19 Achievements** (including **Style Icon** `🎨`) with live unlock toasts.
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

# Run full unit & 200-level BFS Quality Gate test suite
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
