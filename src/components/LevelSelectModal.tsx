import React, { useState } from 'react';
import { ArrowLeft, Star, Lock } from 'lucide-react';
import { WORLDS, ALL_LEVELS } from '../levels/levelsData';
import { storage, MAX_CAMPAIGN_STARS } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface LevelSelectModalProps {
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  onSelectLevel,
  onBack,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<number>(() => {
    const current = ALL_LEVELS.find((l) => l.id === currentLevelId);
    return current ? current.world : 1;
  });

  const playerData = storage.getData();
  const world = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];
  const levelsInWorld = ALL_LEVELS.filter((l) => l.world === selectedWorldId);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md safe-top">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="p-2 bg-slate-800 border border-slate-700 rounded-xl active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-extrabold tracking-tight">Select Level</h2>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-bold text-xs">
          <Star size={13} className="fill-amber-400" />
          <span>
            {playerData.totalStars}/{MAX_CAMPAIGN_STARS}
          </span>
        </div>
      </div>

      {/* World Tabs Navigation */}
      <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-slate-800/80 bg-slate-900/40">
        {WORLDS.map((w) => {
          const isSelected = w.id === selectedWorldId;
          const worldLevels = ALL_LEVELS.filter((l) => l.world === w.id);
          const completedCount = worldLevels.filter(
            (l) => playerData.levelProgress[l.id]?.completed
          ).length;

          return (
            <button
              key={w.id}
              onClick={() => {
                sound.playTap();
                setSelectedWorldId(w.id);
              }}
              className={`flex-none px-3 py-2 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <div className="text-[10px] font-bold uppercase opacity-80">World {w.id}</div>
              <div className="text-xs font-black truncate max-w-[110px]">{w.name}</div>
              <div className="text-[9px] font-mono mt-0.5 opacity-90">
                {completedCount}/20 Cleared
              </div>
            </button>
          );
        })}
      </div>

      {/* World Description Banner */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-sky-400">{world.name}</span>
          <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
            {world.description}
          </p>
        </div>
      </div>

      {/* 20 Levels Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-5 gap-3 safe-bottom">
        {levelsInWorld.map((lvl) => {
          const isUnlocked = lvl.id <= playerData.highestUnlockedLevel;
          const progress = playerData.levelProgress[lvl.id];
          const isCurrent = lvl.id === currentLevelId;

          return (
            <button
              key={lvl.id}
              disabled={!isUnlocked}
              onClick={() => {
                sound.playTap();
                onSelectLevel(lvl.id);
              }}
              className={`aspect-square rounded-2xl border flex flex-col items-center justify-between p-2 transition-all relative ${
                isCurrent
                  ? 'ring-2 ring-sky-400 bg-sky-950/60 border-sky-500'
                  : isUnlocked
                  ? 'bg-slate-900/90 border-slate-700/80 active:scale-95 hover:border-slate-500'
                  : 'bg-slate-950/50 border-slate-800/50 opacity-40 cursor-not-allowed'
              }`}
            >
              {/* Level Number */}
              <span className="text-sm font-black font-mono mt-1 text-slate-200">
                {lvl.id}
              </span>

              {/* Status: Lock or Stars */}
              {!isUnlocked ? (
                <Lock size={16} className="text-slate-600 mb-1" />
              ) : (
                <div className="flex items-center gap-0.5 mb-1">
                  {[1, 2, 3].map((starIdx) => {
                    const earned = progress && progress.stars >= starIdx;
                    return (
                      <Star
                        key={starIdx}
                        size={10}
                        className={
                          earned
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
