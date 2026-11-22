import { describe, it, expect, beforeEach } from 'vitest';
import {
  GameStorage,
  THEMES,
  SKINS,
  TRAILS,
  TILE_SKINS,
  ACHIEVEMENT_REWARD_COINS,
  formatElapsedTime,
  getPlayerRank,
} from '../src/storage/gameStorage';
import { getDailyChallenge, formatDailyShareText } from '../src/levels/dailyChallenge';
import { generateEndlessStage } from '../src/levels/endlessMode';
import {
  MASTER_GAUNTLETS,
  getGauntletStages,
  getGauntletParTotals,
  evaluateGauntletMedal,
} from '../src/levels/gauntlets';
import {
  STUDIO_BLUEPRINTS,
  generateStudioRandomLevel,
} from '../src/levels/studioBlueprints';
import { encodeLevelCode, decodeLevelCode } from '../src/utils/levelShare';
import { solveLevel } from '../src/engine/solver';
import { LevelDefinition } from '../src/engine/types';

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

describe('Game Systems QA Test Suite', () => {
  let storage: GameStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = GameStorage.getInstance();
    storage.resetProgress();
  });

  it('initializes default progress and settings correctly', () => {
    const data = storage.getData();
    expect(data.currentLevel).toBe(1);
    expect(data.highestUnlockedLevel).toBe(1);
    expect(data.totalStars).toBe(0);
    expect(data.coins).toBe(0);
    expect(data.selectedTheme).toBe('floating-sky');
    expect(data.selectedSkin).toBe('puff-yellow');
    expect(data.settings.musicEnabled).toBe(true);
    expect(data.settings.sfxEnabled).toBe(true);
    expect(data.settings.hapticsEnabled).toBe(true);
  });

  it('awards honest coins on first clear & star upgrades without replay coin farming', () => {
    // First clear of Level 1 with 2 stars: 5 first-clear + 2*5 stars + 15 achievement ('first_steps') = 30
    const first = storage.recordLevelVictory(1, 5, 2, { usedUndo: true });
    expect(first.newStars).toBe(2);
    expect(first.unlockedNext).toBe(true);
    expect(first.newlyUnlockedAchievements.map((a) => a.id)).toContain('first_steps');
    expect(first.coinsAwarded).toBe(5 + 10 + ACHIEVEMENT_REWARD_COINS);

    // Replaying Level 1 with same 2 stars awards 0 coins (no farming exploit!)
    const replaySame = storage.recordLevelVictory(1, 5, 2, { usedUndo: true });
    expect(replaySame.newStars).toBe(0);
    expect(replaySame.coinsAwarded).toBe(0);

    // Upgrading Level 1 from 2 -> 3 stars awards only the 1-star delta (+5 coins)
    const upgrade = storage.recordLevelVictory(1, 4, 3, { usedUndo: false });
    expect(upgrade.newStars).toBe(1);
    expect(upgrade.coinsAwarded).toBe(5);
    expect(storage.getData().totalStars).toBe(3);
  });

  it('tracks incremental achievement progress and unlocks Decisive Mind (no_undo)', () => {
    for (let id = 1; id <= 10; id++) {
      storage.recordLevelVictory(id, 4, 3, { usedUndo: false });
    }
    const data = storage.getData();
    expect(data.achievements['world1_cleared'].progress).toBe(10);
    expect(data.achievements['world1_cleared'].unlocked).toBe(false);
    expect(data.achievements['star_collector_50'].progress).toBe(30);
    expect(data.achievements['no_undo'].progress).toBe(10);
    expect(data.achievements['no_undo'].unlocked).toBe(true);
  });

  it('handles theme and skin purchases with coins', () => {
    storage.getData().coins = 50;
    storage.save();

    const candyTheme = THEMES.find((t) => t.id === 'candy-world')!;
    const bought = storage.unlockTheme(candyTheme.id, candyTheme.price);
    expect(bought).toBe(true);

    const data = storage.getData();
    expect(data.unlockedThemes).toContain('candy-world');
    expect(data.selectedTheme).toBe('candy-world');
    expect(data.coins).toBe(50 - candyTheme.price);
  });

  it('generates fresh, deterministic, solver-verified procedural daily challenges & local streaks', () => {
    const date1 = '2026-11-04';
    const date2 = '2026-11-05';
    const challenge1a = getDailyChallenge(date1);
    const challenge1b = getDailyChallenge(date1);
    const challenge2 = getDailyChallenge(date2);

    // Deterministic for same date
    expect(challenge1a.name).toBe(challenge1b.name);
    expect(challenge1a.parMoves).toBe(challenge1b.parMoves);
    expect(challenge1a.fixed).toEqual(challenge1b.fixed);

    // Different dates produce distinct puzzles and both are solvable
    expect(challenge1a.parMoves).toBeGreaterThanOrEqual(8);
    expect(solveLevel(challenge1a, 35).solvable).toBe(true);
    expect(solveLevel(challenge2, 35).solvable).toBe(true);

    // Consecutive day streak increments properly
    const day1 = storage.recordDailyCompletion(date1);
    expect(day1.completedNow).toBe(true);
    expect(day1.coinsAwarded).toBe(25);
    expect(storage.getData().dailyStreak).toBe(1);

    // Duplicate same-day does not double reward
    const dup = storage.recordDailyCompletion(date1);
    expect(dup.completedNow).toBe(false);
    expect(dup.coinsAwarded).toBe(0);

    // Next calendar day extends streak to 2
    const day2 = storage.recordDailyCompletion(date2);
    expect(day2.completedNow).toBe(true);
    expect(storage.getData().dailyStreak).toBe(2);

    // Share text formatting
    const share = formatDailyShareText(date2, 11, 11, 3, 2);
    expect(share).toContain('⭐⭐⭐');
    expect(share).toContain('11/11 moves');
    expect(share).toContain('2-day streak');
  });

  it('generates solvable Endless Void Rush stages and tracks best streak + achievement', () => {
    const stage1 = generateEndlessStage(1, 4242);
    const stage5 = generateEndlessStage(5, 4242);
    expect(solveLevel(stage1, 35).solvable).toBe(true);
    expect(solveLevel(stage5, 35).solvable).toBe(true);

    for (let s = 1; s <= 5; s++) {
      storage.recordEndlessClear(s);
    }
    const data = storage.getData();
    expect(data.bestEndlessStreak).toBe(5);
    expect(data.achievements['endless_5'].unlocked).toBe(true);
  });

  it('encodes and decodes Builder Studio custom puzzles with offline STF1 share codes', () => {
    const custom: LevelDefinition = {
      id: 30001,
      world: 0,
      name: 'Studio Gem Run',
      cols: 6,
      rows: 7,
      maxTiles: 2,
      start: { x: 1, y: 1 },
      exit: { x: 4, y: 5 },
      fixed: [{ x: 2, y: 3 }],
      ice: [{ x: 3, y: 3 }],
      stars: [{ x: 2, y: 3 }],
      switches: [{ id: 'g1', switchPos: { x: 2, y: 1 }, doorPos: { x: 4, y: 4 }, timedDuration: 5 }],
      parMoves: 7,
    };

    const code = encodeLevelCode(custom);
    expect(code.startsWith('STF1:')).toBe(true);

    const decoded = decodeLevelCode(code);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.level.name).toBe('Studio Gem Run');
      expect(decoded.level.ice).toEqual([{ x: 3, y: 3 }]);
      expect(decoded.level.switches?.[0]?.timedDuration).toBe(5);
      expect(decoded.parMoves).toBeGreaterThan(0);
    }

    const bad = decodeLevelCode('INVALID_CODE');
    expect(bad.ok).toBe(false);
  });

  it('supports purchasing and equipping Trails cosmetics', () => {
    storage.getData().coins = 100;
    storage.save();

    const frostTrail = TRAILS.find((t) => t.id === 'trail-frost')!;
    expect(storage.unlockTrail(frostTrail.id, frostTrail.price)).toBe(true);
    expect(storage.getData().selectedTrail).toBe('trail-frost');
    expect(storage.getData().coins).toBe(100 - frostTrail.price);
  });

  it('tracks Daily Archive completions and Monthly Medal tiers (Bronze/Silver/Gold)', () => {
    // Complete today first (builds streak = 1, +25 coins)
    const todayRes = storage.recordDailyCompletion('2026-11-21', false);
    expect(todayRes.completedNow).toBe(true);
    expect(todayRes.coinsAwarded).toBe(25);
    expect(storage.getData().dailyStreak).toBe(1);

    // Complete 4 archive days (+10 each, does NOT break today's streak) -> total 5 -> Bronze
    for (let d = 1; d <= 4; d++) {
      const ds = `2026-11-${String(d).padStart(2, '0')}`;
      const r = storage.recordDailyCompletion(ds, true);
      expect(r.completedNow).toBe(true);
      expect(r.coinsAwarded).toBeGreaterThanOrEqual(10);
    }
    expect(storage.getData().dailyStreak).toBe(1);
    expect(storage.getMonthlyDailyStats(2026, 11).count).toBe(5);
    expect(storage.getMonthlyDailyStats(2026, 11).medal).toBe('bronze');

    // Duplicate archive completion awards 0
    expect(storage.recordDailyCompletion('2026-11-01', true).completedNow).toBe(false);

    // Reach 12 days -> Silver
    for (let d = 5; d <= 11; d++) {
      storage.recordDailyCompletion(`2026-11-${String(d).padStart(2, '0')}`, true);
    }
    expect(storage.getMonthlyDailyStats(2026, 11).count).toBe(12);
    expect(storage.getMonthlyDailyStats(2026, 11).medal).toBe('silver');

    // Reach 20 days -> Gold
    for (let d = 12; d <= 19; d++) {
      storage.recordDailyCompletion(`2026-11-${String(d).padStart(2, '0')}`, true);
    }
    expect(storage.getMonthlyDailyStats(2026, 11).count).toBe(20);
    expect(storage.getMonthlyDailyStats(2026, 11).medal).toBe('gold');
  });

  it('tracks World 7 Clockwork Forge achievement progress', () => {
    for (let id = 121; id <= 140; id++) {
      storage.recordLevelVictory(id, 12, 3, { usedUndo: false });
    }
    const data = storage.getData();
    expect(data.achievements['world7_cleared'].progress).toBe(20);
    expect(data.achievements['world7_cleared'].unlocked).toBe(true);
  });

  it('exports and restores offline STFSAVE backup codes cleanly', () => {
    storage.recordLevelVictory(1, 4, 3, { usedUndo: false });
    storage.recordDailyCompletion('2026-11-21', false);
    const coinsBefore = storage.getData().coins;
    const backup = storage.exportSaveCode();
    expect(backup.startsWith('STFSAVE:')).toBe(true);

    // Wipe local data and restore from backup code
    storage.resetProgress();
    expect(storage.getData().coins).toBe(0);
    expect(storage.getData().totalStars).toBe(0);

    const restored = storage.importSaveCode(backup);
    expect(restored.ok).toBe(true);
    expect(storage.getData().coins).toBe(coinsBefore);
    expect(storage.getData().totalStars).toBe(3);
    expect(storage.getData().completedDailyDates).toContain('2026-11-21');

    // Rejects malformed codes
    expect(storage.importSaveCode('BAD_CODE').ok).toBe(false);
  });

  it('tracks World 8 Obsidian Sanctum achievement and STF1 crate/holdSwitch share codes', () => {
    for (let id = 141; id <= 160; id++) {
      storage.recordLevelVictory(id, 14, 3, { usedUndo: false });
    }
    expect(storage.getData().achievements['world8_cleared'].unlocked).toBe(true);

    const crateLevel: LevelDefinition = {
      id: 30002,
      world: 0,
      name: 'Crate Share Test',
      cols: 5,
      rows: 3,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 1, y: 2 },
      fixed: [{ x: 1, y: 0 }, { x: 2, y: 0 }],
      crates: [{ x: 1, y: 0 }],
      rocks: [{ x: 0, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }],
      switches: [{ id: 'g1', switchPos: { x: 2, y: 0 }, doorPos: { x: 1, y: 1 }, holdSwitch: true }],
      parMoves: 3,
    };
    const code = encodeLevelCode(crateLevel);
    const dec = decodeLevelCode(code);
    expect(dec.ok).toBe(true);
    if (dec.ok) {
      expect(dec.level.crates).toEqual([{ x: 1, y: 0 }]);
      expect(dec.level.switches?.[0]?.holdSwitch).toBe(true);
    }
  });

  it('formats speedrun times cleanly and tracks personal best clear times', () => {
    expect(formatElapsedTime(0)).toBe('0.0s');
    expect(formatElapsedTime(12450)).toBe('12.4s');
    expect(formatElapsedTime(65300)).toBe('1:05.3');

    // First clear sets bestTimeMs and flags isNewBestTime
    const first = storage.recordLevelVictory(1, 5, 2, { elapsedMs: 14200 });
    expect(first.isNewBestTime).toBe(true);
    expect(storage.getData().levelProgress[1].bestTimeMs).toBe(14200);

    // Slower replay keeps faster record and does not flag new best
    const slower = storage.recordLevelVictory(1, 5, 2, { elapsedMs: 18500 });
    expect(slower.isNewBestTime).toBe(false);
    expect(storage.getData().levelProgress[1].bestTimeMs).toBe(14200);

    // Faster replay updates bestTimeMs and flags isNewBestTime
    const faster = storage.recordLevelVictory(1, 4, 3, { elapsedMs: 9300 });
    expect(faster.isNewBestTime).toBe(true);
    expect(storage.getData().levelProgress[1].bestTimeMs).toBe(9300);
  });

  it('persists speedrunTimer, reducedMotion, and highContrast settings across backup codes', () => {
    const data = storage.getData();
    expect(data.settings.speedrunTimer).toBe(false);
    expect(data.settings.reducedMotion).toBe(false);
    expect(data.settings.highContrast).toBe(false);

    data.settings.speedrunTimer = true;
    data.settings.reducedMotion = true;
    data.settings.highContrast = true;
    storage.save();

    const backup = storage.exportSaveCode();
    storage.resetProgress();
    expect(storage.getData().settings.speedrunTimer).toBe(false);
    expect(storage.getData().settings.reducedMotion).toBe(false);
    expect(storage.getData().settings.highContrast).toBe(false);

    const restored = storage.importSaveCode(backup);
    expect(restored.ok).toBe(true);
    expect(storage.getData().settings.speedrunTimer).toBe(true);
    expect(storage.getData().settings.reducedMotion).toBe(true);
    expect(storage.getData().settings.highContrast).toBe(true);
  });

  it('tracks World 9 Skyward Spire achievement and STF1 Springboard share codes', () => {
    for (let id = 161; id <= 180; id++) {
      storage.recordLevelVictory(id, 10, 3, { usedUndo: false });
    }
    expect(storage.getData().achievements['world9_cleared'].unlocked).toBe(true);

    const springLevel: LevelDefinition = {
      id: 30003,
      world: 0,
      name: 'Spring Share Test',
      cols: 5,
      rows: 3,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      springs: [{ x: 1, y: 0 }],
      rocks: [{ x: 2, y: 0 }],
      parMoves: 2,
    };
    const code = encodeLevelCode(springLevel);
    const dec = decodeLevelCode(code);
    expect(dec.ok).toBe(true);
    if (dec.ok) {
      expect(dec.level.springs).toEqual([{ x: 1, y: 0 }]);
      expect(dec.parMoves).toBe(2);
    }
  });

  it('tracks World 10 Celestial Crown achievement and STF1 Key/Vault Lock share codes', () => {
    for (let id = 181; id <= 200; id++) {
      storage.recordLevelVictory(id, 15, 3, { usedUndo: false });
    }
    expect(storage.getData().achievements['world10_cleared'].unlocked).toBe(true);

    const vaultLevel: LevelDefinition = {
      id: 30004,
      world: 0,
      name: 'Vault Share Test',
      cols: 5,
      rows: 3,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      fixed: [{ x: 1, y: 0 }, { x: 3, y: 0 }],
      keys: [{ x: 1, y: 0 }],
      locks: [{ x: 2, y: 0 }],
      rocks: [{ x: 2, y: 1 }, { x: 2, y: 2 }],
      parMoves: 4,
    };
    const code = encodeLevelCode(vaultLevel);
    const dec = decodeLevelCode(code);
    expect(dec.ok).toBe(true);
    if (dec.ok) {
      expect(dec.level.keys).toEqual([{ x: 1, y: 0 }]);
      expect(dec.level.locks).toEqual([{ x: 2, y: 0 }]);
      expect(dec.parMoves).toBe(4);
    }
  });

  it('validates all 7 Master Gauntlets, medal thresholds, anti-farming coin deltas, Trial Champion badge, and backup persistence', () => {
    expect(MASTER_GAUNTLETS).toHaveLength(7);

    for (const gauntlet of MASTER_GAUNTLETS) {
      const stages = getGauntletStages(gauntlet.id);
      expect(stages).toHaveLength(4);
      const { totalPar, silverMaxMoves } = getGauntletParTotals(gauntlet.id);
      expect(totalPar).toBeGreaterThan(0);
      expect(silverMaxMoves).toBeGreaterThan(totalPar);

      expect(evaluateGauntletMedal(totalPar, totalPar, silverMaxMoves)).toBe('gold');
      expect(evaluateGauntletMedal(totalPar + 1, totalPar, silverMaxMoves)).toBe('silver');
      expect(evaluateGauntletMedal(silverMaxMoves, totalPar, silverMaxMoves)).toBe('silver');
      expect(evaluateGauntletMedal(silverMaxMoves + 1, totalPar, silverMaxMoves)).toBe('bronze');
    }

    // Anti-farming medal progression on first gauntlet: Bronze (+20) -> Silver (+20) -> Gold (+35) -> Gold replay (+0)
    const firstId = MASTER_GAUNTLETS[0].id;
    const { totalPar, silverMaxMoves } = getGauntletParTotals(firstId);

    const bronze = storage.recordGauntletCompletion(firstId, silverMaxMoves + 5, 45000, 'bronze');
    expect(bronze.coinsAwarded).toBe(20);
    expect(bronze.upgradedMedal).toBe(true);
    expect(bronze.isNewBestTime).toBe(true);

    const silver = storage.recordGauntletCompletion(firstId, silverMaxMoves, 38000, 'silver');
    expect(silver.coinsAwarded).toBe(20);
    expect(silver.upgradedMedal).toBe(true);
    expect(silver.isNewBestTime).toBe(true);

    const gold = storage.recordGauntletCompletion(firstId, totalPar, 32000, 'gold');
    expect(gold.coinsAwarded).toBe(35);
    expect(gold.upgradedMedal).toBe(true);
    expect(gold.isNewBestTime).toBe(true);

    const goldReplay = storage.recordGauntletCompletion(firstId, totalPar, 35000, 'gold');
    expect(goldReplay.coinsAwarded).toBe(0);
    expect(goldReplay.upgradedMedal).toBe(false);
    expect(goldReplay.isNewBestTime).toBe(false);
    expect(storage.getData().gauntletProgress[firstId].bestTimeMs).toBe(32000);
    expect(storage.getData().gauntletProgress[firstId].bestMoves).toBe(totalPar);

    // Complete 4 more gauntlets (5 total) to unlock Trial Champion (gauntlet_champion)
    for (let i = 1; i < 5; i++) {
      const gId = MASTER_GAUNTLETS[i].id;
      const res = storage.recordGauntletCompletion(gId, 40, 30000, 'bronze');
      if (i === 4) {
        expect(res.newlyUnlockedAchievements.map((a) => a.id)).toContain('gauntlet_champion');
      }
    }
    expect(storage.getData().achievements['gauntlet_champion'].unlocked).toBe(true);

    // Verify gauntletProgress survives STFSAVE backup export/import
    const backup = storage.exportSaveCode();
    storage.resetProgress();
    expect(Object.keys(storage.getData().gauntletProgress)).toHaveLength(0);

    const restored = storage.importSaveCode(backup);
    expect(restored.ok).toBe(true);
    expect(storage.getData().gauntletProgress[firstId].medal).toBe('gold');
    expect(storage.getData().gauntletProgress[firstId].bestTimeMs).toBe(32000);
    expect(storage.getData().achievements['gauntlet_champion'].unlocked).toBe(true);
  });

  it('validates Bridge Tile Skins purchase/equip, Style Icon badge, backup persistence, and Player Mastery Ranks', () => {
    expect(TILE_SKINS).toHaveLength(8);
    expect(getPlayerRank(storage.getData()).title).toBe('Novice Bridger');

    storage.getData().coins = 1000;
    storage.save();

    // Purchase 2 themes, 1 skin, 1 trail, and 2 tile skins = 6 total cosmetics -> unlocks Style Icon!
    expect(storage.unlockTheme(THEMES[1].id, THEMES[1].price)).toBe(true);
    expect(storage.unlockTheme(THEMES[2].id, THEMES[2].price)).toBe(true);
    expect(storage.unlockSkin(SKINS[1].id, SKINS[1].price)).toBe(true);
    expect(storage.unlockTrail(TRAILS[1].id, TRAILS[1].price)).toBe(true);
    expect(storage.unlockTileSkin('tile-bamboo', 30)).toBe(true);
    expect(storage.getData().achievements['cosmetic_collector'].unlocked).toBe(false);

    expect(storage.unlockTileSkin('tile-celestial', 145)).toBe(true);
    expect(storage.getData().selectedTileSkin).toBe('tile-celestial');
    expect(storage.getData().achievements['cosmetic_collector'].unlocked).toBe(true);

    // Backup/restore preserves selectedTileSkin and unlockedTileSkins
    const backup = storage.exportSaveCode();
    storage.resetProgress();
    expect(storage.getData().selectedTileSkin).toBe('tile-classic');
    expect(storage.importSaveCode(backup).ok).toBe(true);
    expect(storage.getData().selectedTileSkin).toBe('tile-celestial');
    expect(storage.getData().unlockedTileSkins).toContain('tile-bamboo');

    // Mastery rank scales cleanly with stars & gauntlets
    storage.getData().totalStars = 60;
    expect(getPlayerRank(storage.getData()).title).toBe('Island Hopper');
    storage.getData().totalStars = 600;
    for (const g of MASTER_GAUNTLETS) {
      storage.recordGauntletCompletion(g.id, 30, 20000, 'gold');
    }
    expect(getPlayerRank(storage.getData()).title).toBe('Celestial Sovereign');
    expect(getPlayerRank(storage.getData()).nextTitle).toBeNull();
  });

  it('verifies all 4 Builder Studio Starter Blueprints and random generator produce solvable 6x7 puzzles', () => {
    expect(STUDIO_BLUEPRINTS).toHaveLength(4);
    for (const bp of STUDIO_BLUEPRINTS) {
      expect(bp.level.cols).toBe(6);
      expect(bp.level.rows).toBe(7);
      const sol = solveLevel(bp.level, 35);
      expect(sol.solvable, `Blueprint "${bp.level.name}" should be solvable`).toBe(true);
      expect(sol.minMoves).toBeGreaterThan(2);
    }

    const randomPuzzle = generateStudioRandomLevel(123456);
    expect(randomPuzzle.cols).toBe(6);
    expect(randomPuzzle.rows).toBe(7);
    expect(solveLevel(randomPuzzle, 35).solvable).toBe(true);
  });

  it('tracks World 11 Chrono Master achievement, STF1 Phase-Shift share codes, and Speedrun Ghost bestRun persistence', () => {
    for (let id = 201; id <= 220; id++) {
      storage.recordLevelVictory(id, 12, 3, { usedUndo: false });
    }
    expect(storage.getData().achievements['world11_cleared'].unlocked).toBe(true);

    // Speedrun Ghost bestRun updates only when beating bestTimeMs and survives backup/restore
    const fastFrames: [number, number, number][] = [
      [1, 0, 400],
      [2, 0, 900],
      [3, 0, 1400],
    ];
    const slowFrames: [number, number, number][] = [
      [1, 0, 900],
      [2, 0, 1800],
      [3, 0, 2600],
    ];
    storage.recordLevelVictory(1, 3, 3, { elapsedMs: 1400, runFrames: fastFrames });
    expect(storage.getData().levelProgress[1].bestRun).toEqual(fastFrames);

    // Slower run does not overwrite faster ghost
    storage.recordLevelVictory(1, 3, 3, { elapsedMs: 2600, runFrames: slowFrames });
    expect(storage.getData().levelProgress[1].bestRun).toEqual(fastFrames);

    const backup = storage.exportSaveCode();
    storage.resetProgress();
    expect(storage.importSaveCode(backup).ok).toBe(true);
    expect(storage.getData().levelProgress[1].bestRun).toEqual(fastFrames);

    // STF1 share code preserves phaseTiles
    const phaseLevel: LevelDefinition = {
      id: 30005,
      world: 0,
      name: 'Phase Share Test',
      cols: 6,
      rows: 3,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 5, y: 0 },
      phaseTiles: [
        { x: 2, y: 0, polarity: 'odd' },
        { x: 3, y: 0, polarity: 'even' },
      ],
      parMoves: 5,
    };
    const code = encodeLevelCode(phaseLevel);
    const dec = decodeLevelCode(code);
    expect(dec.ok).toBe(true);
    if (dec.ok) {
      expect(dec.level.phaseTiles).toEqual(phaseLevel.phaseTiles);
      expect(dec.parMoves).toBe(5);
    }
  });

  it('tracks World 12 Current Navigator achievement, Aether Currents cosmetics, and STF1 Conveyor share codes', () => {
    for (let id = 221; id <= 240; id++) {
      storage.recordLevelVictory(id, 10, 3, { usedUndo: false });
    }
    expect(storage.getData().achievements['world12_cleared'].unlocked).toBe(true);

    expect(THEMES.some((t) => t.id === 'aether-currents')).toBe(true);
    expect(SKINS.some((s) => s.id === 'puff-aether')).toBe(true);
    expect(TRAILS.some((tr) => tr.id === 'trail-aether')).toBe(true);
    expect(TILE_SKINS.some((ts) => ts.id === 'tile-aether')).toBe(true);

    const conveyorLevel: LevelDefinition = {
      id: 30006,
      world: 0,
      name: 'Conveyor Share Test',
      cols: 6,
      rows: 3,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      conveyors: [
        { x: 1, y: 0, direction: 'right' },
        { x: 2, y: 0, direction: 'right' },
        { x: 3, y: 0, direction: 'right' },
      ],
      parMoves: 1,
    };
    const code = encodeLevelCode(conveyorLevel);
    const dec = decodeLevelCode(code);
    expect(dec.ok).toBe(true);
    if (dec.ok) {
      expect(dec.level.conveyors).toEqual(conveyorLevel.conveyors);
      expect(dec.parMoves).toBe(1);
    }
  });
});
