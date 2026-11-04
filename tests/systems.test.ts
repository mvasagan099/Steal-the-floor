import { describe, it, expect, beforeEach } from 'vitest';
import { GameStorage, THEMES, SKINS } from '../src/storage/gameStorage';
import { getDailyChallenge } from '../src/levels/dailyChallenge';
import { AdMobService } from '../src/utils/admobService';

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  // @ts-expect-error polyfill for Node test environment
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
}

describe('Game Systems QA Test Suite', () => {
  let storage: GameStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = GameStorage.getInstance();
    storage.resetProgress();
  });

  it('initializes default progress correctly', () => {
    const data = storage.getData();
    expect(data.currentLevel).toBe(1);
    expect(data.highestUnlockedLevel).toBe(1);
    expect(data.totalStars).toBe(0);
    expect(data.coins).toBe(0);
    expect(data.selectedTheme).toBe('floating-sky');
    expect(data.selectedSkin).toBe('puff-yellow');
    expect(data.unlockedThemes).toContain('floating-sky');
    expect(data.unlockedSkins).toContain('puff-yellow');
  });

  it('records level victory, unlocks next level, and awards stars & coins', () => {
    const { newStars, unlockedNext } = storage.recordLevelVictory(1, 4, 3);
    expect(newStars).toBe(3);
    expect(unlockedNext).toBe(true);

    const data = storage.getData();
    expect(data.highestUnlockedLevel).toBe(2);
    expect(data.currentLevel).toBe(2);
    expect(data.totalStars).toBe(3);
    expect(data.coins).toBe(15); // 3 stars * 5 coins

    const lvl1Progress = storage.getLevelProgress(1);
    expect(lvl1Progress.completed).toBe(true);
    expect(lvl1Progress.stars).toBe(3);
    expect(lvl1Progress.bestMoves).toBe(4);
  });

  it('unlocks achievements upon meeting conditions', () => {
    storage.recordLevelVictory(1, 4, 3);
    const data = storage.getData();
    const firstSteps = data.achievements['first_steps'];
    expect(firstSteps.unlocked).toBe(true);
  });

  it('handles theme and skin purchases with coins', () => {
    // Award 50 coins
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

  it('generates deterministic daily challenges for given dates', () => {
    const date1 = '2026-11-04';
    const challenge1 = getDailyChallenge(date1);
    const challenge2 = getDailyChallenge(date1);

    expect(challenge1.name).toBe(challenge2.name);
    expect(challenge1.parMoves).toBe(challenge2.parMoves);
    expect(challenge1.parMoves).toBeGreaterThan(0);

    // Recording completion increases streak
    const recorded = storage.recordDailyCompletion(date1);
    expect(recorded).toBe(true);
    expect(storage.getData().dailyStreak).toBe(1);

    // Same day duplicate does not double reward
    const duplicate = storage.recordDailyCompletion(date1);
    expect(duplicate).toBe(false);
  });

  it('enforces conservative ad frequency capping', () => {
    const ads = AdMobService.getInstance();
    // Tutorial levels (levels <= 5) never show interstitial
    expect(ads.canShowInterstitial(1)).toBe(false);
    expect(ads.canShowInterstitial(5)).toBe(false);

    // Levels > 5 can show if time elapsed
    expect(ads.canShowInterstitial(6)).toBe(true);
  });
});
