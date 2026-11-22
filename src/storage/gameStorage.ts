// Versioned offline save and progress manager
import { LevelDefinition } from '../engine/types';

export type GhostFrame = [number, number, number]; // [x, y, elapsedMs]

export interface LevelProgress {
  completed: boolean;
  stars: number; // 0, 1, 2, or 3
  bestMoves: number;
  bestTimeMs?: number;
  bestRun?: GhostFrame[];
}

export interface GauntletRecord {
  completed: boolean;
  medal: MonthlyMedal;
  bestMoves: number;
  bestTimeMs: number;
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
  gauntletProgress: Record<string, GauntletRecord>;
  noUndoLevelIds: number[];
  selectedTheme: string;
  unlockedThemes: string[];
  selectedSkin: string;
  unlockedSkins: string[];
  selectedTrail: string;
  unlockedTrails: string[];
  selectedTileSkin: string;
  unlockedTileSkins: string[];
  coins: number;
  totalStars: number;
  dailyStreak: number;
  lastDailyCompletedDate: string; // Local YYYY-MM-DD
  completedDailyDates: string[]; // All completed daily/archive YYYY-MM-DD dates
  bestEndlessStreak: number;
  customLevels: LevelDefinition[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
    musicEnabled: boolean;
    sfxEnabled: boolean;
    hapticsEnabled: boolean;
    speedrunTimer: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  achievements: Record<string, Achievement>;
  stats: {
    totalTilesPlaced: number;
    totalLevelsWon: number;
    totalUndos: number;
    totalStarsCollected: number;
  };
}

export interface PlayerRankInfo {
  title: string;
  icon: string;
  accent: string;
  points: number;
  nextTitle: string | null;
  nextThreshold: number | null;
  progressPercent: number;
}

const RANK_TIERS = [
  { threshold: 0, title: 'Novice Bridger', icon: '🧱', accent: 'text-slate-200 border-slate-600/60 bg-slate-800/70' },
  { threshold: 50, title: 'Island Hopper', icon: '🏝️', accent: 'text-sky-200 border-sky-400/50 bg-sky-500/15' },
  { threshold: 150, title: 'Hazard Tamer', icon: '⚡', accent: 'text-purple-200 border-purple-400/50 bg-purple-500/15' },
  { threshold: 300, title: 'Void Architect', icon: '🌀', accent: 'text-cyan-200 border-cyan-400/50 bg-cyan-500/15' },
  { threshold: 475, title: 'Grand Strategist', icon: '⚔️', accent: 'text-amber-200 border-amber-400/50 bg-amber-500/15' },
  { threshold: 620, title: 'Celestial Sovereign', icon: '👑', accent: 'text-yellow-200 border-yellow-300/60 bg-yellow-500/20' },
];

export function getPlayerRank(data: PlayerData): PlayerRankInfo {
  const gauntletPoints = Object.values(data.gauntletProgress || {}).reduce((sum, g) => {
    if (!g.completed) return sum;
    return sum + (g.medal === 'gold' ? 20 : g.medal === 'silver' ? 14 : 10);
  }, 0);
  const badgePoints = Object.values(data.achievements || {}).filter((a) => a.unlocked).length * 5;
  const endlessPoints = Math.min(40, (data.bestEndlessStreak || 0) * 4);
  const points = (data.totalStars || 0) + gauntletPoints + badgePoints + endlessPoints;

  let tierIdx = 0;
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (points >= RANK_TIERS[i].threshold) tierIdx = i;
  }

  const current = RANK_TIERS[tierIdx];
  const next = tierIdx + 1 < RANK_TIERS.length ? RANK_TIERS[tierIdx + 1] : null;
  const progressPercent = next
    ? Math.min(
        100,
        Math.round(((points - current.threshold) / (next.threshold - current.threshold)) * 100)
      )
    : 100;

  return {
    title: current.title,
    icon: current.icon,
    accent: current.accent,
    points,
    nextTitle: next ? next.title : null,
    nextThreshold: next ? next.threshold : null,
    progressPercent,
  };
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatElapsedTime(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalTenths = Math.floor(safeMs / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`;
  }
  return `${seconds}.${tenths}s`;
}

export type MonthlyMedal = 'none' | 'bronze' | 'silver' | 'gold';

export const TOTAL_CAMPAIGN_LEVELS = 240;
export const MAX_CAMPAIGN_STARS = TOTAL_CAMPAIGN_LEVELS * 3;
const STORAGE_KEY = 'steal_the_floor_save_v1';
const CURRENT_VERSION = 12;
export const ACHIEVEMENT_REWARD_COINS = 15;

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_steps', title: 'First Steps', description: 'Complete level 1', unlocked: false, progress: 0, maxProgress: 1, icon: '👟' },
  { id: 'world1_cleared', title: 'Island Hopper', description: 'Complete all 20 levels in World 1', unlocked: false, progress: 0, maxProgress: 20, icon: '🏝️' },
  { id: 'world2_cleared', title: 'Mountain Climber', description: 'Complete all 20 levels in World 2', unlocked: false, progress: 0, maxProgress: 20, icon: '⛰️' },
  { id: 'world3_cleared', title: 'Hazard Master', description: 'Complete all 20 levels in World 3', unlocked: false, progress: 0, maxProgress: 20, icon: '⚡' },
  { id: 'world4_cleared', title: 'Portal Wanderer', description: 'Complete all 20 levels in World 4', unlocked: false, progress: 0, maxProgress: 20, icon: '🌀' },
  { id: 'world6_cleared', title: 'Frost Master', description: 'Complete all 20 levels in World 6', unlocked: false, progress: 0, maxProgress: 20, icon: '❄️' },
  { id: 'world7_cleared', title: 'Clockwork Savant', description: 'Complete all 20 levels in World 7', unlocked: false, progress: 0, maxProgress: 20, icon: '⚙️' },
  { id: 'world8_cleared', title: 'Sanctum Architect', description: 'Complete all 20 levels in World 8', unlocked: false, progress: 0, maxProgress: 20, icon: '📦' },
  { id: 'world9_cleared', title: 'Spire Acrobat', description: 'Complete all 20 levels in World 9', unlocked: false, progress: 0, maxProgress: 20, icon: '🦘' },
  { id: 'world10_cleared', title: 'Crown Sovereign', description: 'Complete all 20 levels in World 10', unlocked: false, progress: 0, maxProgress: 20, icon: '🔑' },
  { id: 'world11_cleared', title: 'Chrono Master', description: 'Complete all 20 levels in World 11', unlocked: false, progress: 0, maxProgress: 20, icon: '⏳' },
  { id: 'world12_cleared', title: 'Current Navigator', description: 'Complete all 20 levels in World 12', unlocked: false, progress: 0, maxProgress: 20, icon: '🌊' },
  { id: 'grand_master', title: 'Master Builder', description: 'Complete all 240 campaign levels!', unlocked: false, progress: 0, maxProgress: 240, icon: '👑' },
  { id: 'star_collector_50', title: 'Stargazer', description: 'Earn 50 par stars total', unlocked: false, progress: 0, maxProgress: 50, icon: '⭐' },
  { id: 'star_collector_150', title: 'Constellation', description: 'Earn 150 par stars total', unlocked: false, progress: 0, maxProgress: 150, icon: '🌟' },
  { id: 'star_collector_300', title: 'Galactic Brilliance', description: 'Earn 300 par stars across all levels!', unlocked: false, progress: 0, maxProgress: 300, icon: '✨' },
  { id: 'daily_challenger', title: 'Daily Devotee', description: 'Complete 3 daily challenges', unlocked: false, progress: 0, maxProgress: 3, icon: '📅' },
  { id: 'no_undo', title: 'Decisive Mind', description: 'Complete 10 unique levels without Undo', unlocked: false, progress: 0, maxProgress: 10, icon: '🧠' },
  { id: 'endless_5', title: 'Void Runner', description: 'Reach a 5-stage streak in Endless Void Rush', unlocked: false, progress: 0, maxProgress: 5, icon: '♾️' },
  { id: 'gauntlet_champion', title: 'Trial Champion', description: 'Complete 5 Master Gauntlets', unlocked: false, progress: 0, maxProgress: 5, icon: '⚔️' },
  { id: 'cosmetic_collector', title: 'Style Icon', description: 'Unlock 6 cosmetics in the Shop', unlocked: false, progress: 0, maxProgress: 6, icon: '🎨' },
];

export const THEMES = [
  { id: 'floating-sky', name: 'Floating Sky', price: 0, bg: 'linear-gradient(to bottom, #1e3a8a, #0f172a)', tileColor: '#38bdf8', previewColor: '#38bdf8', unlockedByDefault: true },
  { id: 'candy-world', name: 'Candy World', price: 20, bg: 'linear-gradient(to bottom, #ec4899, #4c0519)', tileColor: '#f472b6', previewColor: '#f472b6', unlockedByDefault: false },
  { id: 'ocean-islands', name: 'Ocean Islands', price: 40, bg: 'linear-gradient(to bottom, #0d9488, #042f2e)', tileColor: '#2dd4bf', previewColor: '#2dd4bf', unlockedByDefault: false },
  { id: 'neon-space', name: 'Neon Space', price: 60, bg: 'linear-gradient(to bottom, #7e22ce, #180828)', tileColor: '#a855f7', previewColor: '#a855f7', unlockedByDefault: false },
  { id: 'forest-adventure', name: 'Forest Adventure', price: 80, bg: 'linear-gradient(to bottom, #15803d, #052e16)', tileColor: '#4ade80', previewColor: '#4ade80', unlockedByDefault: false },
  { id: 'arctic-frost', name: 'Arctic Frost', price: 100, bg: 'linear-gradient(to bottom, #0c4a6e, #082f49)', tileColor: '#67e8f9', previewColor: '#67e8f9', unlockedByDefault: false },
  { id: 'clockwork-forge', name: 'Clockwork Forge', price: 120, bg: 'linear-gradient(to bottom, #7c2d12, #1c0a00)', tileColor: '#fb923c', previewColor: '#fb923c', unlockedByDefault: false },
  { id: 'crate-sanctum', name: 'Obsidian Sanctum', price: 140, bg: 'linear-gradient(to bottom, #1e1b4b, #09090b)', tileColor: '#eab308', previewColor: '#34d399', unlockedByDefault: false },
  { id: 'skyward-spire', name: 'Skyward Spire', price: 160, bg: 'linear-gradient(to bottom, #0284c7, #0f172a)', tileColor: '#38bdf8', previewColor: '#fcd34d', unlockedByDefault: false },
  { id: 'celestial-crown', name: 'Celestial Crown', price: 180, bg: 'linear-gradient(to bottom, #312e81, #030712)', tileColor: '#818cf8', previewColor: '#fde047', unlockedByDefault: false },
  { id: 'chrono-prism', name: 'Chrono Prism', price: 200, bg: 'linear-gradient(to bottom, #164e63, #3b0764)', tileColor: '#22d3ee', previewColor: '#e879f9', unlockedByDefault: false },
  { id: 'aether-currents', name: 'Aether Currents', price: 220, bg: 'linear-gradient(to bottom, #064e3b, #041f2c)', tileColor: '#2dd4bf', previewColor: '#34d399', unlockedByDefault: false },
];

export const SKINS = [
  { id: 'puff-yellow', name: 'Sunny Puff', color: '#f59e0b', price: 0, unlockedByDefault: true },
  { id: 'puff-pink', name: 'Berry Puff', color: '#ec4899', price: 15, unlockedByDefault: false },
  { id: 'puff-cyan', name: 'Aqua Puff', color: '#06b6d4', price: 30, unlockedByDefault: false },
  { id: 'puff-emerald', name: 'Moss Puff', color: '#10b981', price: 45, unlockedByDefault: false },
  { id: 'puff-frost', name: 'Frost Puff', color: '#7dd3fc', price: 70, unlockedByDefault: false },
  { id: 'puff-ember', name: 'Ember Puff', color: '#f97316', price: 90, unlockedByDefault: false },
  { id: 'puff-jade', name: 'Jade Puff', color: '#34d399', price: 110, unlockedByDefault: false },
  { id: 'puff-cloud', name: 'Cloud Puff', color: '#e2e8f0', price: 125, unlockedByDefault: false },
  { id: 'puff-celestial', name: 'Starlight Puff', color: '#a5b4fc', price: 140, unlockedByDefault: false },
  { id: 'puff-prism', name: 'Prism Puff', color: '#22d3ee', price: 155, unlockedByDefault: false },
  { id: 'puff-aether', name: 'Aether Puff', color: '#5eead4', price: 170, unlockedByDefault: false },
  { id: 'puff-gold', name: 'Royal Gold', color: '#fbbf24', price: 100, unlockedByDefault: false },
];

export const TRAILS = [
  { id: 'trail-none', name: 'Classic Step', preview: 'linear-gradient(135deg, #334155, #1e293b)', price: 0, unlockedByDefault: true },
  { id: 'trail-sparkle', name: 'Starlight Dust', preview: 'linear-gradient(135deg, #fef08a, #f59e0b)', price: 35, unlockedByDefault: false },
  { id: 'trail-frost', name: 'Frost Shards', preview: 'linear-gradient(135deg, #e0f2fe, #38bdf8)', price: 50, unlockedByDefault: false },
  { id: 'trail-neon', name: 'Cyber Pulse', preview: 'linear-gradient(135deg, #f472b6, #a855f7)', price: 75, unlockedByDefault: false },
  { id: 'trail-ember', name: 'Forge Embers', preview: 'linear-gradient(135deg, #fb923c, #f43f5e)', price: 90, unlockedByDefault: false },
  { id: 'trail-gold', name: 'Golden Comet', preview: 'linear-gradient(135deg, #fef08a, #f59e0b, #ffffff)', price: 110, unlockedByDefault: false },
  { id: 'trail-celestial', name: 'Celestial Nova', preview: 'linear-gradient(135deg, #fde047, #818cf8, #f472b6)', price: 135, unlockedByDefault: false },
  { id: 'trail-chrono', name: 'Chrono Pulse', preview: 'linear-gradient(135deg, #22d3ee, #e879f9, #ffffff)', price: 150, unlockedByDefault: false },
  { id: 'trail-aether', name: 'Aether Draft', preview: 'linear-gradient(135deg, #34d399, #5eead4, #ffffff)', price: 165, unlockedByDefault: false },
  { id: 'trail-rainbow', name: 'Prism Glow', preview: 'linear-gradient(135deg, #f43f5e, #fbbf24, #4ade80, #38bdf8)', price: 120, unlockedByDefault: false },
];

export const TILE_SKINS = [
  { id: 'tile-classic', name: 'Classic Glass', desc: 'Adapts cleanly to your active world theme', preview: 'linear-gradient(135deg, #67e8f9, #3b82f6)', badge: '💠', price: 0, unlockedByDefault: true },
  { id: 'tile-bamboo', name: 'Bamboo Plank', desc: 'Warm timber bridge slats with brass rivets', preview: 'linear-gradient(135deg, #fbbf24, #b45309)', badge: '🪵', price: 30, unlockedByDefault: false },
  { id: 'tile-circuit', name: 'Neon Circuit', desc: 'Obsidian wafer etched with glowing cyan traces', preview: 'linear-gradient(135deg, #0f172a, #06b6d4)', badge: '⚡', price: 55, unlockedByDefault: false },
  { id: 'tile-crystal', name: 'Prism Crystal', desc: 'Faceted diamond glass with pastel refraction', preview: 'linear-gradient(135deg, #f0abfc, #67e8f9, #fef08a)', badge: '💎', price: 85, unlockedByDefault: false },
  { id: 'tile-obsidian', name: 'Molten Rune', desc: 'Volcanic stone pulsing with gilded forge runes', preview: 'linear-gradient(135deg, #27272a, #f97316)', badge: '🔥', price: 110, unlockedByDefault: false },
  { id: 'tile-celestial', name: 'Starlight Tile', desc: 'Deep cosmic indigo inlaid with gold constellations', preview: 'linear-gradient(135deg, #312e81, #fde047)', badge: '✨', price: 145, unlockedByDefault: false },
  { id: 'tile-prism', name: 'Phase Glass', desc: 'Holographic cyan & magenta chrono lattice', preview: 'linear-gradient(135deg, #22d3ee, #d946ef)', badge: '⏳', price: 160, unlockedByDefault: false },
  { id: 'tile-aether', name: 'Aether Conduit', desc: 'Slate-teal turbine plate with luminous mint chevrons', preview: 'linear-gradient(135deg, #0f766e, #34d399)', badge: '🌊', price: 175, unlockedByDefault: false },
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
      gauntletProgress: {},
      noUndoLevelIds: [],
      selectedTheme: 'floating-sky',
      unlockedThemes: ['floating-sky'],
      selectedSkin: 'puff-yellow',
      unlockedSkins: ['puff-yellow'],
      selectedTrail: 'trail-none',
      unlockedTrails: ['trail-none'],
      selectedTileSkin: 'tile-classic',
      unlockedTileSkins: ['tile-classic'],
      coins: 0,
      totalStars: 0,
      dailyStreak: 0,
      lastDailyCompletedDate: '',
      completedDailyDates: [],
      bestEndlessStreak: 0,
      customLevels: [],
      settings: {
        musicVolume: 0.4,
        sfxVolume: 0.7,
        musicEnabled: true,
        sfxEnabled: true,
        hapticsEnabled: true,
        speedrunTimer: false,
        reducedMotion: false,
        highContrast: false,
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

  private migrate(parsed: Partial<PlayerData>): PlayerData {
    const base = this.getDefaultData();
    const mergedAchievements: Record<string, Achievement> = { ...base.achievements };
    if (parsed.achievements) {
      for (const [key, val] of Object.entries(parsed.achievements)) {
        if (mergedAchievements[key]) {
          mergedAchievements[key] = {
            ...mergedAchievements[key],
            ...val,
            maxProgress: mergedAchievements[key].maxProgress,
          };
        }
      }
    }

    const migratedDailyDates = Array.isArray(parsed.completedDailyDates)
      ? Array.from(new Set(parsed.completedDailyDates))
      : parsed.lastDailyCompletedDate
      ? [parsed.lastDailyCompletedDate]
      : [];

    return {
      ...base,
      ...parsed,
      version: CURRENT_VERSION,
      gauntletProgress:
        parsed.gauntletProgress && typeof parsed.gauntletProgress === 'object'
          ? parsed.gauntletProgress
          : {},
      noUndoLevelIds: Array.isArray(parsed.noUndoLevelIds) ? parsed.noUndoLevelIds : [],
      unlockedTrails: Array.isArray(parsed.unlockedTrails) ? parsed.unlockedTrails : ['trail-none'],
      selectedTileSkin:
        typeof parsed.selectedTileSkin === 'string' ? parsed.selectedTileSkin : 'tile-classic',
      unlockedTileSkins: Array.isArray(parsed.unlockedTileSkins)
        ? parsed.unlockedTileSkins
        : ['tile-classic'],
      completedDailyDates: migratedDailyDates,
      customLevels: Array.isArray(parsed.customLevels) ? parsed.customLevels : [],
      settings: { ...base.settings, ...(parsed.settings || {}) },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      achievements: mergedAchievements,
    };
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

  public recordTilePlaced(): void {
    this.data.stats.totalTilesPlaced++;
    this.save();
  }

  public recordUndo(): void {
    this.data.stats.totalUndos++;
    this.save();
  }

  public recordLevelVictory(
    levelId: number,
    moves: number,
    starsEarned: number,
    options?: {
      usedUndo?: boolean;
      gemsCollected?: number;
      elapsedMs?: number;
      runFrames?: GhostFrame[];
    }
  ): {
    newStars: number;
    unlockedNext: boolean;
    coinsAwarded: number;
    isNewBestTime: boolean;
    newlyUnlockedAchievements: Achievement[];
  } {
    const current = this.getLevelProgress(levelId);
    const isFirstClear = !current.completed;
    const starDelta = Math.max(0, starsEarned - current.stars);

    const elapsedMs =
      typeof options?.elapsedMs === 'number' && options.elapsedMs > 0
        ? Math.round(options.elapsedMs)
        : undefined;
    const prevBestTime = current.bestTimeMs;
    const isNewBestTime =
      elapsedMs !== undefined && (prevBestTime === undefined || elapsedMs < prevBestTime);
    const bestTimeMs =
      elapsedMs !== undefined
        ? prevBestTime !== undefined
          ? Math.min(prevBestTime, elapsedMs)
          : elapsedMs
        : prevBestTime;

    const validFrames =
      Array.isArray(options?.runFrames) && options.runFrames.length > 0
        ? options.runFrames.slice(0, 80)
        : undefined;
    const bestRun =
      validFrames && (isNewBestTime || !current.bestRun)
        ? validFrames
        : current.bestRun;

    const updated: LevelProgress = {
      completed: true,
      stars: Math.max(current.stars, starsEarned),
      bestMoves: current.bestMoves === 0 ? moves : Math.min(current.bestMoves, moves),
      ...(bestTimeMs !== undefined ? { bestTimeMs } : {}),
      ...(bestRun ? { bestRun } : {}),
    };

    this.data.levelProgress[levelId] = updated;
    this.data.totalStars += starDelta;
    this.data.stats.totalLevelsWon++;
    if (options?.gemsCollected) {
      this.data.stats.totalStarsCollected += options.gemsCollected;
    }

    if (!options?.usedUndo && !this.data.noUndoLevelIds.includes(levelId)) {
      this.data.noUndoLevelIds.push(levelId);
    }

    let coinsAwarded = starDelta * 5 + (isFirstClear ? 5 : 0);
    this.data.coins += coinsAwarded;

    let unlockedNext = false;
    if (levelId === this.data.highestUnlockedLevel && levelId < TOTAL_CAMPAIGN_LEVELS) {
      this.data.highestUnlockedLevel = levelId + 1;
      this.data.currentLevel = levelId + 1;
      unlockedNext = true;
    }

    const newlyUnlockedAchievements = this.checkAchievements();
    if (newlyUnlockedAchievements.length > 0) {
      const achBonus = newlyUnlockedAchievements.length * ACHIEVEMENT_REWARD_COINS;
      this.data.coins += achBonus;
      coinsAwarded += achBonus;
    }

    this.save();

    return {
      newStars: starDelta,
      unlockedNext,
      coinsAwarded,
      isNewBestTime,
      newlyUnlockedAchievements,
    };
  }

  public recordEndlessClear(streak: number): {
    coinsAwarded: number;
    isNewRecord: boolean;
    newlyUnlockedAchievements: Achievement[];
  } {
    const isNewRecord = streak > this.data.bestEndlessStreak;
    if (isNewRecord) {
      this.data.bestEndlessStreak = streak;
    }
    let coinsAwarded = 10 + (streak % 5 === 0 ? 15 : 0);
    this.data.coins += coinsAwarded;
    this.data.stats.totalLevelsWon++;

    const newlyUnlockedAchievements = this.checkAchievements();
    if (newlyUnlockedAchievements.length > 0) {
      const achBonus = newlyUnlockedAchievements.length * ACHIEVEMENT_REWARD_COINS;
      this.data.coins += achBonus;
      coinsAwarded += achBonus;
    }

    this.save();
    return { coinsAwarded, isNewRecord, newlyUnlockedAchievements };
  }

  public saveCustomLevel(level: LevelDefinition): void {
    const existingIdx = this.data.customLevels.findIndex((l) => l.name === level.name);
    if (existingIdx >= 0) {
      this.data.customLevels[existingIdx] = level;
    } else {
      this.data.customLevels = [level, ...this.data.customLevels].slice(0, 12);
    }
    this.save();
  }

  public deleteCustomLevel(id: number): void {
    this.data.customLevels = this.data.customLevels.filter((l) => l.id !== id);
    this.save();
  }

  public setCurrentLevel(id: number): void {
    if (id <= this.data.highestUnlockedLevel && id >= 1 && id <= TOTAL_CAMPAIGN_LEVELS) {
      this.data.currentLevel = id;
      this.save();
    }
  }

  private applyCosmeticAchievementCheck(): void {
    const unlocked = this.checkAchievements();
    if (unlocked.length > 0) {
      this.data.coins += unlocked.length * ACHIEVEMENT_REWARD_COINS;
    }
  }

  public unlockTheme(themeId: string, cost: number): boolean {
    if (this.data.coins >= cost && !this.data.unlockedThemes.includes(themeId)) {
      this.data.coins -= cost;
      this.data.unlockedThemes.push(themeId);
      this.data.selectedTheme = themeId;
      this.applyCosmeticAchievementCheck();
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
      this.applyCosmeticAchievementCheck();
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

  public unlockTrail(trailId: string, cost: number): boolean {
    if (this.data.coins >= cost && !this.data.unlockedTrails.includes(trailId)) {
      this.data.coins -= cost;
      this.data.unlockedTrails.push(trailId);
      this.data.selectedTrail = trailId;
      this.applyCosmeticAchievementCheck();
      this.save();
      return true;
    }
    return false;
  }

  public selectTrail(trailId: string): void {
    if (this.data.unlockedTrails.includes(trailId)) {
      this.data.selectedTrail = trailId;
      this.save();
    }
  }

  public unlockTileSkin(tileSkinId: string, cost: number): boolean {
    if (this.data.coins >= cost && !this.data.unlockedTileSkins.includes(tileSkinId)) {
      this.data.coins -= cost;
      this.data.unlockedTileSkins.push(tileSkinId);
      this.data.selectedTileSkin = tileSkinId;
      this.applyCosmeticAchievementCheck();
      this.save();
      return true;
    }
    return false;
  }

  public selectTileSkin(tileSkinId: string): void {
    if (this.data.unlockedTileSkins.includes(tileSkinId)) {
      this.data.selectedTileSkin = tileSkinId;
      this.save();
    }
  }

  public recordDailyCompletion(
    dateStr = getLocalDateString(),
    isArchive = false
  ): {
    completedNow: boolean;
    coinsAwarded: number;
    newlyUnlockedAchievements: Achievement[];
  } {
    if (this.data.completedDailyDates.includes(dateStr)) {
      return { completedNow: false, coinsAwarded: 0, newlyUnlockedAchievements: [] };
    }

    this.data.completedDailyDates.push(dateStr);

    let coinsAwarded = isArchive ? 10 : 25;

    if (!isArchive) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const yesterdayDate = new Date(y, m - 1, d - 1);
      const yesterdayStr = getLocalDateString(yesterdayDate);

      if (this.data.lastDailyCompletedDate === yesterdayStr) {
        this.data.dailyStreak++;
      } else {
        this.data.dailyStreak = 1;
      }
      this.data.lastDailyCompletedDate = dateStr;
    }

    this.data.coins += coinsAwarded;

    const newlyUnlockedAchievements: Achievement[] = [];
    const ach = this.data.achievements['daily_challenger'];
    if (ach) {
      ach.progress = Math.min(ach.maxProgress, Math.max(ach.progress + 1, this.data.completedDailyDates.length));
      if (!ach.unlocked && ach.progress >= ach.maxProgress) {
        ach.unlocked = true;
        ach.progress = ach.maxProgress;
        this.data.coins += ACHIEVEMENT_REWARD_COINS;
        coinsAwarded += ACHIEVEMENT_REWARD_COINS;
        newlyUnlockedAchievements.push({ ...ach });
      }
    }

    this.save();
    return { completedNow: true, coinsAwarded, newlyUnlockedAchievements };
  }

  public getMonthlyDailyStats(
    year: number,
    month: number // 1-12
  ): {
    completedDays: number[];
    count: number;
    medal: MonthlyMedal;
  } {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const completedDays = this.data.completedDailyDates
      .filter((d) => d.startsWith(prefix))
      .map((d) => Number(d.slice(8, 10)))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 31)
      .sort((a, b) => a - b);

    const count = completedDays.length;
    let medal: MonthlyMedal = 'none';
    if (count >= 20) medal = 'gold';
    else if (count >= 12) medal = 'silver';
    else if (count >= 5) medal = 'bronze';

    return { completedDays, count, medal };
  }

  public recordGauntletCompletion(
    gauntletId: string,
    totalMoves: number,
    totalTimeMs: number,
    medal: 'bronze' | 'silver' | 'gold'
  ): {
    coinsAwarded: number;
    upgradedMedal: boolean;
    isNewBestTime: boolean;
    newlyUnlockedAchievements: Achievement[];
  } {
    const MEDAL_REWARDS: Record<MonthlyMedal, number> = {
      none: 0,
      bronze: 20,
      silver: 40,
      gold: 75,
    };

    const existing = this.data.gauntletProgress[gauntletId];
    const prevMedal: MonthlyMedal = existing?.medal || 'none';
    const medalDelta = Math.max(0, MEDAL_REWARDS[medal] - MEDAL_REWARDS[prevMedal]);
    const upgradedMedal = medalDelta > 0;

    const cleanTime = Math.max(0, Math.round(totalTimeMs));
    const isNewBestTime =
      cleanTime > 0 && (!existing?.bestTimeMs || cleanTime < existing.bestTimeMs);

    this.data.gauntletProgress[gauntletId] = {
      completed: true,
      medal: upgradedMedal ? medal : prevMedal,
      bestMoves:
        existing && existing.bestMoves > 0
          ? Math.min(existing.bestMoves, totalMoves)
          : totalMoves,
      bestTimeMs: isNewBestTime ? cleanTime : existing?.bestTimeMs || cleanTime,
    };

    let coinsAwarded = medalDelta;
    this.data.coins += medalDelta;

    const newlyUnlockedAchievements = this.checkAchievements();
    if (newlyUnlockedAchievements.length > 0) {
      const achBonus = newlyUnlockedAchievements.length * ACHIEVEMENT_REWARD_COINS;
      this.data.coins += achBonus;
      coinsAwarded += achBonus;
    }

    this.save();
    return { coinsAwarded, upgradedMedal, isNewBestTime, newlyUnlockedAchievements };
  }

  private checkAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    const updateProgress = (id: string, progress: number) => {
      const ach = this.data.achievements[id];
      if (!ach) return;
      ach.progress = Math.min(ach.maxProgress, Math.max(ach.progress, progress));
      if (!ach.unlocked && ach.progress >= ach.maxProgress) {
        ach.unlocked = true;
        ach.progress = ach.maxProgress;
        newlyUnlocked.push({ ...ach });
      }
    };

    const wonCount = Object.values(this.data.levelProgress).filter((p) => p.completed).length;

    updateProgress('first_steps', this.data.levelProgress[1]?.completed ? 1 : 0);

    const countRange = (start: number, end: number) => {
      let c = 0;
      for (let id = start; id <= end; id++) {
        if (this.data.levelProgress[id]?.completed) c++;
      }
      return c;
    };

    updateProgress('world1_cleared', countRange(1, 20));
    updateProgress('world2_cleared', countRange(21, 40));
    updateProgress('world3_cleared', countRange(41, 60));
    updateProgress('world4_cleared', countRange(61, 80));
    updateProgress('world6_cleared', countRange(101, 120));
    updateProgress('world7_cleared', countRange(121, 140));
    updateProgress('world8_cleared', countRange(141, 160));
    updateProgress('world9_cleared', countRange(161, 180));
    updateProgress('world10_cleared', countRange(181, 200));
    updateProgress('world11_cleared', countRange(201, 220));
    updateProgress('world12_cleared', countRange(221, 240));
    updateProgress('grand_master', wonCount);

    let totalStarsEarned = 0;
    Object.values(this.data.levelProgress).forEach((p) => {
      totalStarsEarned += p.stars;
    });

    updateProgress('star_collector_50', totalStarsEarned);
    updateProgress('star_collector_150', totalStarsEarned);
    updateProgress('star_collector_300', totalStarsEarned);
    updateProgress('no_undo', this.data.noUndoLevelIds.length);
    updateProgress('endless_5', this.data.bestEndlessStreak);

    const clearedGauntlets = Object.values(this.data.gauntletProgress || {}).filter(
      (g) => g.completed
    ).length;
    updateProgress('gauntlet_champion', clearedGauntlets);

    const purchasedCosmetics =
      Math.max(0, (this.data.unlockedThemes?.length || 1) - 1) +
      Math.max(0, (this.data.unlockedSkins?.length || 1) - 1) +
      Math.max(0, (this.data.unlockedTrails?.length || 1) - 1) +
      Math.max(0, (this.data.unlockedTileSkins?.length || 1) - 1);
    updateProgress('cosmetic_collector', purchasedCosmetics);

    return newlyUnlocked;
  }

  public exportSaveCode(): string {
    const json = JSON.stringify(this.data);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    const b64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return `STFSAVE:${b64}`;
  }

  public importSaveCode(rawCode: string): { ok: true } | { ok: false; error: string } {
    const trimmed = rawCode.trim();
    if (!trimmed.startsWith('STFSAVE:')) {
      return { ok: false, error: 'Backup code must start with "STFSAVE:"' };
    }
    try {
      let padded = trimmed.slice('STFSAVE:'.length).replace(/-/g, '+').replace(/_/g, '/');
      while (padded.length % 4 !== 0) padded += '=';
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<PlayerData>;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        typeof parsed.highestUnlockedLevel !== 'number' ||
        typeof parsed.coins !== 'number'
      ) {
        return { ok: false, error: 'Backup data is invalid or incomplete.' };
      }

      this.data = this.migrate(parsed);
      this.save();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not decode save backup code.' };
    }
  }

  public resetProgress(): void {
    this.data = this.getDefaultData();
    this.save();
  }
}

export const storage = GameStorage.getInstance();
