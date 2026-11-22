import React from 'react';
import {
  Play,
  Grid,
  Calendar,
  Palette,
  Trophy,
  Settings,
  Star,
  Infinity as InfinityIcon,
  Hammer,
  BookOpen,
  Swords,
} from 'lucide-react';
import {
  storage,
  THEMES,
  SKINS,
  TOTAL_CAMPAIGN_LEVELS,
  MAX_CAMPAIGN_STARS,
  getPlayerRank,
} from '../storage/gameStorage';
import { ALL_LEVELS, WORLDS } from '../levels/levelsData';
import { MASTER_GAUNTLETS } from '../levels/gauntlets';
import { sound } from '../audio/soundManager';

interface HomeScreenProps {
  onPlay: (levelId: number) => void;
  onOpenLevels: () => void;
  onOpenDaily: () => void;
  onOpenGauntlets: () => void;
  onStartEndless: () => void;
  onOpenEditor: () => void;
  onOpenThemes: () => void;
  onOpenAchievements: () => void;
  onOpenCodex: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlay,
  onOpenLevels,
  onOpenDaily,
  onOpenGauntlets,
  onStartEndless,
  onOpenEditor,
  onOpenThemes,
  onOpenAchievements,
  onOpenCodex,
  onOpenSettings,
}) => {
  const data = storage.getData();
  const nextLevelId = data.currentLevel || 1;
  const activeTheme = THEMES.find((t) => t.id === data.selectedTheme) || THEMES[0];
  const activeSkin = SKINS.find((s) => s.id === data.selectedSkin) || SKINS[0];
  const rank = getPlayerRank(data);

  const masteredWorlds = WORLDS.filter((world) => {
    const worldLevels = ALL_LEVELS.filter((l) => l.world === world.id);
    return (
      worldLevels.length > 0 &&
      worldLevels.every((l) => data.levelProgress[l.id]?.completed)
    );
  }).length;

  const clearedGauntlets = MASTER_GAUNTLETS.filter(
    (g) => data.gauntletProgress[g.id]?.completed
  ).length;

  const starPercent = Math.min(
    100,
    Math.round((data.totalStars / MAX_CAMPAIGN_STARS) * 100)
  );

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between items-center p-6 text-white overflow-hidden safe-top safe-bottom"
      style={{ background: activeTheme.bg }}
    >
      {/* Top Bar: Coins & Stars */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/50 backdrop-blur-sm border border-amber-500/30 rounded-2xl text-amber-400 font-bold text-xs shadow">
          <Star size={14} className="fill-amber-400" />
          <span>{data.totalStars} Stars</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/50 backdrop-blur-sm border border-amber-500/30 rounded-2xl text-amber-400 font-bold text-xs shadow">
          <span>{data.coins}</span>
          <span>🪙</span>
        </div>
      </div>

      {/* Hero Mascot & Title */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-sm w-full">
        <div className="relative mb-3">
          <div
            className={`w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl flex items-center justify-center ${
              data.settings.reducedMotion ? '' : 'animate-bounce duration-1000'
            }`}
            style={{
              background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${activeSkin.color} 35%, ${activeSkin.color} 100%)`,
              boxShadow: `0 20px 45px ${activeSkin.color}55`,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className="flex items-center gap-5 mb-2">
                <div className="w-3 h-3 bg-slate-950 rounded-full" />
                <div className="w-3 h-3 bg-slate-950 rounded-full" />
              </div>
              <div className="w-5 h-2.5 border-b-4 border-slate-950 rounded-b-full" />
            </div>
          </div>
          <div className="w-16 h-3.5 bg-black/40 rounded-full mx-auto blur-sm -mt-1" />
        </div>

        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-sky-300 mb-1">
          Casual Puzzle Strategy
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
          STEAL THE FLOOR
        </h1>
        <p className="text-xs text-slate-200/80 mt-1.5 max-w-xs leading-relaxed">
          Bridge the void with limited tiles. Reach solid islands to pull your floor back. Claim every gem and hit the flag!
        </p>

        {/* Campaign Mastery Progress Strip */}
        <button
          onClick={() => {
            sound.playTap();
            onOpenAchievements();
          }}
          className="w-full max-w-xs mt-3.5 px-3.5 py-2.5 bg-slate-950/55 hover:bg-slate-950/70 active:scale-[0.98] transition-all backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg text-left"
        >
          <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 gap-2">
            <span className="text-white flex items-center gap-1 truncate">
              <span>{rank.icon}</span>
              <span className="truncate">{rank.title}</span>
            </span>
            <span className="text-amber-300 flex-none">
              {data.totalStars}/{MAX_CAMPAIGN_STARS} ★ · {masteredWorlds}/{WORLDS.length} 👑
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-yellow-300 transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.55)]"
              style={{ width: `${Math.max(starPercent, data.totalStars > 0 ? 2 : 0)}%` }}
            />
          </div>
        </button>
      </div>

      {/* Main Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-2.5 z-10 mb-2">
        <button
          onClick={() => {
            sound.playTap();
            onPlay(nextLevelId);
          }}
          className="w-full py-3.5 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 active:scale-95 transition-all text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-sky-500/30 flex items-center justify-center gap-2.5"
        >
          <Play size={20} className="fill-slate-950" />
          <span>Continue Level {nextLevelId}</span>
        </button>

        {/* Primary Modes Grid (2x3) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onOpenLevels();
            }}
            className="py-2.5 bg-slate-900/90 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 shadow"
          >
            <Grid size={15} className="text-sky-400" />
            <span>{TOTAL_CAMPAIGN_LEVELS} Levels</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenDaily();
            }}
            className="py-2.5 bg-slate-900/90 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 shadow"
          >
            <Calendar size={15} className="text-orange-400" />
            <span>Daily Puzzle</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenGauntlets();
            }}
            className="py-2.5 bg-slate-900/90 active:scale-95 border border-amber-500/30 hover:border-amber-400/50 rounded-2xl text-xs font-bold text-amber-100 flex items-center justify-center gap-2 shadow"
          >
            <Swords size={15} className="text-amber-400" />
            <span>
              Master Trials{clearedGauntlets > 0 ? ` (${clearedGauntlets}/${MASTER_GAUNTLETS.length})` : ''}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onStartEndless();
            }}
            className="py-2.5 bg-slate-900/90 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 shadow"
          >
            <InfinityIcon size={15} className="text-emerald-400" />
            <span>
              Void Rush{data.bestEndlessStreak > 0 ? ` (${data.bestEndlessStreak})` : ''}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenEditor();
            }}
            className="py-2.5 bg-slate-900/90 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 shadow"
          >
            <Hammer size={15} className="text-violet-400" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenCodex();
            }}
            className="py-2.5 bg-slate-900/90 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 shadow"
          >
            <BookOpen size={15} className="text-sky-400" />
            <span>Field Guide</span>
          </button>
        </div>

        {/* Utilities Row (3-column) */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onOpenThemes();
            }}
            className="py-2.5 bg-slate-900/70 active:scale-95 border border-slate-800/80 rounded-xl text-[11px] font-bold text-slate-300 flex flex-col items-center justify-center gap-1"
          >
            <Palette size={15} className="text-pink-400" />
            <span>Shop</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenAchievements();
            }}
            className="py-2.5 bg-slate-900/70 active:scale-95 border border-slate-800/80 rounded-xl text-[11px] font-bold text-slate-300 flex flex-col items-center justify-center gap-1"
          >
            <Trophy size={15} className="text-amber-400" />
            <span>Badges</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className="py-2.5 bg-slate-900/70 active:scale-95 border border-slate-800/80 rounded-xl text-[11px] font-bold text-slate-300 flex flex-col items-center justify-center gap-1"
          >
            <Settings size={15} className="text-slate-400" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
