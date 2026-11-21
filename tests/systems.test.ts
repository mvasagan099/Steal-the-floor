import { describe, it, expect, beforeEach } from 'vitest';
import {
  GameStorage,
  THEMES,
  TRAILS,
  ACHIEVEMENT_REWARD_COINS,
} from '../src/storage/gameStorage';
import { getDailyChallenge, formatDailyShareText } from '../src/levels/dailyChallenge';
import { generateEndlessStage } from '../src/levels/endlessMode';
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
      parMoves: 7,
    };

    const code = encodeLevelCode(custom);
    expect(code.startsWith('STF1:')).toBe(true);

    const decoded = decodeLevelCode(code);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.level.name).toBe('Studio Gem Run');
      expect(decoded.level.ice).toEqual([{ x: 3, y: 3 }]);
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
});
