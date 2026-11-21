import React, { useState } from 'react';
import { ArrowLeft, Star, Lock, Timer } from 'lucide-react';
import { WORLDS, ALL_LEVELS } from '../levels/levelsData';
import { storage, MAX_CAMPAIGN_STARS, formatElapsedTime } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

type LevelFilter = 'all' | 'unsolved' | 'needs3';

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
  const [filter, setFilter] = useState<LevelFilter>('all');

  const playerData = storage.getData();
  const world = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];
  const levelsInWorld = ALL_LEVELS.filter((l) => l.world === selectedWorldId);

  const unsolvedCount = levelsInWorld.filter(
    (l) => !playerData.levelProgress[l.id]?.completed
  ).length;
  const needs3Count = levelsInWorld.filter((l) => {
    const p = playerData.levelProgress[l.id];
    return p?.completed && p.stars < 3;
  }).length;

  const filteredLevels = levelsInWorld.filter((l) => {
    const p = playerData.levelProgress[l.id];
    if (filter === 'unsolved') return !p?.completed;
    if (filter === 'needs3') return Boolean(p?.completed && p.stars < 3);
    return true;
  });

  // Compute World Speedrun Total when all 20 levels in this world have a recorded bestTimeMs
  const worldBestTimes = levelsInWorld
    .map((l) => playerData.levelProgress[l.id]?.bestTimeMs)
    .filter((t): t is number => typeof t === 'number' && t > 0);
  const worldSpeedrunTotalMs =
    worldBestTimes.length === levelsInWorld.length
      ? worldBestTimes.reduce((sum, t) => sum + t, 0)
      : null;

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
          const worldMastered = completedCount === worldLevels.length;

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
              <div className="text-[10px] font-bold uppercase opacity-80 flex items-center justify-between gap-1">
                <span>World {w.id}</span>
                {worldMastered && <span title="World Mastered">👑</span>}
              </div>
              <div className="text-xs font-black truncate max-w-[115px]">{w.name}</div>
              <div className="text-[9px] font-mono mt-0.5 opacity-90">
                {completedCount}/{worldLevels.length} Cleared
              </div>
            </button>
          );
        })}
      </div>

      {/* World Description Banner + Speedrun Total */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs font-bold text-sky-400">{world.name}</span>
          <p className="text-[11px] text-slate-400 truncate">{world.description}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-none">
          {worldSpeedrunTotalMs !== null && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-[11px] font-mono font-bold text-indigo-300"
              title="World speedrun total across all 20 levels"
            >
              <Timer size={11} className="text-indigo-400" />
              <span>{formatElapsedTime(worldSpeedrunTotalMs)}</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-amber-300">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>
              {levelsInWorld.reduce(
                (sum, l) => sum + (playerData.levelProgress[l.id]?.stars || 0),
                0
              )}
              /{levelsInWorld.length * 3}
            </span>
          </div>
        </div>
      </div>

      {/* Perfectionist Filter Pills */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/60 flex items-center gap-1.5">
        {(
          [
            { id: 'all', label: `All (${levelsInWorld.length})` },
            { id: 'unsolved', label: `Unsolved (${unsolvedCount})` },
            { id: 'needs3', label: `Needs 3★ (${needs3Count})` },
          ] as Array<{ id: LevelFilter; label: string }>
        ).map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                setFilter(tab.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                active
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Levels Grid */}
      {filteredLevels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-sm font-bold text-white">
            {filter === 'needs3'
              ? 'Every cleared level in this world is 3★!'
              : 'All 20 levels in this world are cleared!'}
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-sky-300"
          >
            Show All Levels
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 sm:grid-cols-5 gap-3 content-start safe-bottom">
          {filteredLevels.map((lvl) => {
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
                className={`aspect-square rounded-2xl border flex flex-col items-center justify-between p-1.5 transition-all relative ${
                  isCurrent
                    ? 'ring-2 ring-sky-400 bg-sky-950/60 border-sky-500'
                    : isUnlocked
                    ? 'bg-slate-900/90 border-slate-700/80 active:scale-95 hover:border-slate-500'
                    : 'bg-slate-950/50 border-slate-800/50 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Level Number */}
                <span className="text-sm font-black font-mono mt-0.5 text-slate-200">
                  {lvl.id}
                </span>

                {/* Best Time (when recorded) */}
                {progress?.bestTimeMs ? (
                  <span className="text-[9px] font-mono font-bold text-indigo-300/90 leading-none">
                    {formatElapsedTime(progress.bestTimeMs)}
                  </span>
                ) : (
                  <span className="h-2" />
                )}

                {/* Status: Lock or Stars */}
                {!isUnlocked ? (
                  <Lock size={14} className="text-slate-600 mb-0.5" />
                ) : (
                  <div className="flex items-center gap-0.5 mb-0.5">
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
      )}
    </div>
  );
};
