import React from 'react';
import { Play, Grid, Calendar, Palette, Trophy, Settings, Star } from 'lucide-react';
import { storage, THEMES, SKINS } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface HomeScreenProps {
  onPlay: (levelId: number) => void;
  onOpenLevels: () => void;
  onOpenDaily: () => void;
  onOpenThemes: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlay,
  onOpenLevels,
  onOpenDaily,
  onOpenThemes,
  onOpenAchievements,
  onOpenSettings,
}) => {
  const data = storage.getData();
  const nextLevelId = data.currentLevel || 1;
  const activeTheme = THEMES.find((t) => t.id === data.selectedTheme) || THEMES[0];
  const activeSkin = SKINS.find((s) => s.id === data.selectedSkin) || SKINS[0];

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
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-sm">
        {/* Floating Mascot Avatar styled with active skin */}
        <div className="relative mb-4">
          <div
            className="w-28 h-28 rounded-full border-4 border-white/30 shadow-2xl flex items-center justify-center animate-bounce duration-1000"
            style={{
              background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${activeSkin.color} 35%, ${activeSkin.color} 100%)`,
              boxShadow: `0 20px 45px ${activeSkin.color}55`,
            }}
          >
            {/* Mascot Face */}
            <div className="relative flex flex-col items-center">
              <div className="flex items-center gap-6 mb-2">
                <div className="w-3.5 h-3.5 bg-slate-950 rounded-full" />
                <div className="w-3.5 h-3.5 bg-slate-950 rounded-full" />
              </div>
              <div className="w-6 h-3 border-b-4 border-slate-950 rounded-b-full" />
            </div>
          </div>
          {/* Shadow underneath */}
          <div className="w-20 h-4 bg-black/40 rounded-full mx-auto blur-sm -mt-1" />
        </div>

        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-sky-300 mb-1">
          Casual Puzzle Strategy
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
          STEAL THE FLOOR
        </h1>
        <p className="text-xs text-slate-200/80 mt-2 max-w-xs leading-relaxed">
          Bridge the void with limited tiles. Reach solid islands to pull your floor back. Claim every gem and hit the flag!
        </p>
      </div>

      {/* Main Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-2.5 z-10 mb-2">
        {/* Continue / Play Primary Button */}
        <button
          onClick={() => {
            sound.playTap();
            onPlay(nextLevelId);
          }}
          className="w-full py-4 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 active:scale-95 transition-all text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-sky-500/30 flex items-center justify-center gap-2.5"
        >
          <Play size={20} className="fill-slate-950" />
          <span>Continue Level {nextLevelId}</span>
        </button>

        {/* Secondary Navigation Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onOpenLevels();
            }}
            className="py-3 bg-slate-900/90 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 shadow"
          >
            <Grid size={16} className="text-sky-400" />
            <span>100 Levels</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenDaily();
            }}
            className="py-3 bg-slate-900/90 active:scale-95 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 shadow"
          >
            <Calendar size={16} className="text-orange-400" />
            <span>Daily Challenge</span>
          </button>
        </div>

        {/* Utilities Row: Themes, Achievements, Settings */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              sound.playTap();
              onOpenThemes();
            }}
            className="py-2.5 bg-slate-900/70 active:scale-95 border border-slate-800/80 rounded-xl text-[11px] font-bold text-slate-300 flex flex-col items-center justify-center gap-1"
          >
            <Palette size={15} className="text-pink-400" />
            <span>Themes</span>
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
