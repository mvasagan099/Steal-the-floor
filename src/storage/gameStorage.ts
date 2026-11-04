// Versioned offline save and progress manager

export interface LevelProgress {
  completed: boolean;
  stars: number; // 0, 1, 2, or 3
  bestMoves: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  icon: string;
}

export interface PlayerData {
  version: number;
  currentLevel: number;
  highestUnlockedLevel: number;
  levelProgress: Record<number, LevelProgress>;
  selectedTheme: string;
  unlockedThemes: string[];
  selectedSkin: string;
  unlockedSkins: string[];
  coins: number;
  totalStars: number;
  dailyStreak: number;
  lastDailyCompletedDate: string; // YYYY-MM-DD
  settings: {
    musicVolume: number;
    sfxVolume: number;
    hapticsEnabled: boolean;
  };
  achievements: Record<string, Achievement>;
  stats: {
    totalTilesPlaced: number;
    totalLevelsWon: number;
    totalUndos: number;
    totalStarsCollected: number;
  };
}

const STORAGE_KEY = 'steal_the_floor_save_v1';
const CURRENT_VERSION = 1;

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_steps', title: 'First Steps', description: 'Complete level 1', unlocked: false, progress: 0, maxProgress: 1, icon: '👟' },
  { id: 'world1_cleared', title: 'Island Hopper', description: 'Complete all 20 levels in World 1', unlocked: false, progress: 0, maxProgress: 20, icon: '🏝️' },
  { id: 'world2_cleared', title: 'Mountain Climber', description: 'Complete all 20 levels in World 2', unlocked: false, progress: 0, maxProgress: 20, icon: '⛰️' },
  { id: 'world3_cleared', title: 'Hazard Master', description: 'Complete all 20 levels in World 3', unlocked: false, progress: 0, maxProgress: 20, icon: '⚡' },
  { id: 'world4_cleared', title: 'Portal Wanderer', description: 'Complete all 20 levels in World 4', unlocked: false, progress: 0, maxProgress: 20, icon: '🌀' },
  { id: 'grand_master', title: 'Master Builder', description: 'Complete all 100 levels!', unlocked: false, progress: 0, maxProgress: 100, icon: '👑' },
  { id: 'star_collector_50', title: 'Stargazer', description: 'Collect 50 stars total', unlocked: false, progress: 0, maxProgress: 50, icon: '⭐' },
  { id: 'star_collector_150', title: 'Constellation', description: 'Collect 150 stars total', unlocked: false, progress: 0, maxProgress: 150, icon: '🌟' },
  { id: 'star_collector_300', title: 'Galactic Brilliance', description: 'Earn 300 stars across all levels!', unlocked: false, progress: 0, maxProgress: 300, icon: '✨' },
  { id: 'daily_challenger', title: 'Daily Devotee', description: 'Complete 3 daily challenges', unlocked: false, progress: 0, maxProgress: 3, icon: '📅' },
  { id: 'no_undo', title: 'Decisive Mind', description: 'Complete 10 levels without using Undo', unlocked: false, progress: 0, maxProgress: 10, icon: '🧠' },
];

export const THEMES = [
  { id: 'floating-sky', name: 'Floating Sky', price: 0, bg: 'linear-gradient(to bottom, #1e3a8a, #0f172a)', tileColor: '#38bdf8', previewColor: '#38bdf8', unlockedByDefault: true },
  { id: 'candy-world', name: 'Candy World', price: 20, bg: 'linear-gradient(to bottom, #ec4899, #4c0519)', tileColor: '#f472b6', previewColor: '#f472b6', unlockedByDefault: false },
  { id: 'ocean-islands', name: 'Ocean Islands', price: 40, bg: 'linear-gradient(to bottom, #0d9488, #042f2e)', tileColor: '#2dd4bf', previewColor: '#2dd4bf', unlockedByDefault: false },
  { id: 'neon-space', name: 'Neon Space', price: 60, bg: 'linear-gradient(to bottom, #7e22ce, #180828)', tileColor: '#a855f7', previewColor: '#a855f7', unlockedByDefault: false },
  { id: 'forest-adventure', name: 'Forest Adventure', price: 80, bg: 'linear-gradient(to bottom, #15803d, #052e16)', tileColor: '#4ade80', previewColor: '#4ade80', unlockedByDefault: false },
];

export const SKINS = [
  { id: 'puff-yellow', name: 'Sunny Puff', color: '#f59e0b', price: 0, unlockedByDefault: true },
  { id: 'puff-pink', name: 'Berry Puff', color: '#ec4899', price: 15, unlockedByDefault: false },
  { id: 'puff-cyan', name: 'Aqua Puff', color: '#06b6d4', price: 30, unlockedByDefault: false },
  { id: 'puff-emerald', name: 'Moss Puff', color: '#10b981', price: 45, unlockedByDefault: false },
  { id: 'puff-gold', name: 'Royal Gold', color: '#fbbf24', price: 100, unlockedByDefault: false },
];

export class GameStorage {
  private static instance: GameStorage;
  private data: PlayerData;

  private constructor() {
    this.data = this.loadData();
  }

  public static getInstance(): GameStorage {
    if (!GameStorage.instance) {
      GameStorage.instance = new GameStorage();
    }
    return GameStorage.instance;
  }

  private getDefaultData(): PlayerData {
    const achMap: Record<string, Achievement> = {};
    DEFAULT_ACHIEVEMENTS.forEach((a) => {
      achMap[a.id] = { ...a };
    });

    return {
      version: CURRENT_VERSION,
      currentLevel: 1,
      highestUnlockedLevel: 1,
      levelProgress: {},
      selectedTheme: 'floating-sky',
      unlockedThemes: ['floating-sky'],
      selectedSkin: 'puff-yellow',
      unlockedSkins: ['puff-yellow'],
      coins: 0,
      totalStars: 0,
      dailyStreak: 0,
      lastDailyCompletedDate: '',
      settings: {
        musicVolume: 0.4,
        sfxVolume: 0.7,
        hapticsEnabled: true,
      },
      achievements: achMap,
      stats: {
        totalTilesPlaced: 0,
        totalLevelsWon: 0,
        totalUndos: 0,
        totalStarsCollected: 0,
      },
    };
  }

  private loadData(): PlayerData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return this.migrate(parsed);
      }
    } catch {
      // Storage corrupted or disabled
    }
    return this.getDefaultData();
  }

  private migrate(parsed: PlayerData): PlayerData {
    const base = this.getDefaultData();
    // Merge base defaults for any new properties
    const merged: PlayerData = {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      achievements: { ...base.achievements, ...(parsed.achievements || {}) },
    };
    return merged;
  }

  public save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage quota exceeded
    }
  }

  public getData(): PlayerData {
    return this.data;
  }

  public getLevelProgress(levelId: number): LevelProgress {
    return this.data.levelProgress[levelId] || { completed: false, stars: 0, bestMoves: 0 };
  }

  public recordLevelVictory(levelId: number, moves: number, starsEarned: number): { newStars: number; unlockedNext: boolean } {
    const current = this.getLevelProgress(levelId);
    const starDelta = Math.max(0, starsEarned - current.stars);

    const updated: LevelProgress = {
      completed: true,
      stars: Math.max(current.stars, starsEarned),
      bestMoves: current.bestMoves === 0 ? moves : Math.min(current.bestMoves, moves),
    };

    this.data.levelProgress[levelId] = updated;
    this.data.totalStars += starDelta;
    this.data.coins += starsEarned * 5; // 5 coins per star
    this.data.stats.totalLevelsWon++;

    let unlockedNext = false;
    if (levelId === this.data.highestUnlockedLevel && levelId < 100) {
      this.data.highestUnlockedLevel = levelId + 1;
      this.data.currentLevel = levelId + 1;
      unlockedNext = true;
    }

    // Update achievements
    this.checkAchievements();
    this.save();

    return { newStars: starDelta, unlockedNext };
  }

  public setCurrentLevel(id: number): void {
    if (id <= this.data.highestUnlockedLevel && id >= 1 && id <= 100) {
      this.data.currentLevel = id;
      this.save();
    }
  }

  public unlockTheme(themeId: string, cost: number): boolean {
    if (this.data.coins >= cost && !this.data.unlockedThemes.includes(themeId)) {
      this.data.coins -= cost;
      this.data.unlockedThemes.push(themeId);
      this.data.selectedTheme = themeId;
      this.save();
      return true;
    }
    return false;
  }

  public selectTheme(themeId: string): void {
    if (this.data.unlockedThemes.includes(themeId)) {
      this.data.selectedTheme = themeId;
      this.save();
    }
  }

  public unlockSkin(skinId: string, cost: number): boolean {
    if (this.data.coins >= cost && !this.data.unlockedSkins.includes(skinId)) {
      this.data.coins -= cost;
      this.data.unlockedSkins.push(skinId);
      this.data.selectedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  public selectSkin(skinId: string): void {
    if (this.data.unlockedSkins.includes(skinId)) {
      this.data.selectedSkin = skinId;
      this.save();
    }
  }

  public recordDailyCompletion(todayStr: string): boolean {
    if (this.data.lastDailyCompletedDate === todayStr) {
      return false; // Already completed today
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.data.lastDailyCompletedDate === yesterday) {
      this.data.dailyStreak++;
    } else {
      this.data.dailyStreak = 1;
    }

    this.data.lastDailyCompletedDate = todayStr;
    this.data.coins += 25; // Bonus coins for daily

    const ach = this.data.achievements['daily_challenger'];
    if (ach && !ach.unlocked) {
      ach.progress++;
      if (ach.progress >= ach.maxProgress) ach.unlocked = true;
    }

    this.save();
    return true;
  }

  private checkAchievements(): void {
    const wonCount = Object.values(this.data.levelProgress).filter((p) => p.completed).length;

    // Check level achievements
    if (this.data.levelProgress[1]?.completed) {
      this.unlockAchievement('first_steps');
    }

    // World milestones
    const w1Cleared = Array.from({ length: 20 }, (_, i) => i + 1).every((id) => this.data.levelProgress[id]?.completed);
    if (w1Cleared) this.unlockAchievement('world1_cleared');

    const w2Cleared = Array.from({ length: 20 }, (_, i) => i + 21).every((id) => this.data.levelProgress[id]?.completed);
    if (w2Cleared) this.unlockAchievement('world2_cleared');

    const w3Cleared = Array.from({ length: 20 }, (_, i) => i + 41).every((id) => this.data.levelProgress[id]?.completed);
    if (w3Cleared) this.unlockAchievement('world3_cleared');

    const w4Cleared = Array.from({ length: 20 }, (_, i) => i + 61).every((id) => this.data.levelProgress[id]?.completed);
    if (w4Cleared) this.unlockAchievement('world4_cleared');

    if (wonCount >= 100) {
      this.unlockAchievement('grand_master');
    }

    // Stars achievements
    let totalStarsEarned = 0;
    Object.values(this.data.levelProgress).forEach((p) => {
      totalStarsEarned += p.stars;
    });

    if (totalStarsEarned >= 50) this.unlockAchievement('star_collector_50');
    if (totalStarsEarned >= 150) this.unlockAchievement('star_collector_150');
    if (totalStarsEarned >= 300) this.unlockAchievement('star_collector_300');
  }

  private unlockAchievement(id: string): void {
    const ach = this.data.achievements[id];
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      ach.progress = ach.maxProgress;
    }
  }

  public resetProgress(): void {
    this.data = this.getDefaultData();
    this.save();
  }
}

export const storage = GameStorage.getInstance();
