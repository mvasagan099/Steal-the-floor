import React from 'react';
import { ChevronLeft, Swords, Play, Timer, Award, Layers } from 'lucide-react';
import {
  MASTER_GAUNTLETS,
  getGauntletParTotals,
  getGauntletStages,
} from '../levels/gauntlets';
import { storage, formatElapsedTime, MonthlyMedal } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface GauntletsModalProps {
  onBack: () => void;
  onStartGauntlet: (gauntletId: string) => void;
}

const MEDAL_BADGES: Record<
  MonthlyMedal,
  { label: string; badgeClass: string; icon: string }
> = {
  gold: {
    label: 'Gold Par',
    badgeClass: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
    icon: '🥇',
  },
  silver: {
    label: 'Silver',
    badgeClass: 'bg-slate-400/20 border-slate-300/40 text-slate-200',
    icon: '🥈',
  },
  bronze: {
    label: 'Bronze',
    badgeClass: 'bg-orange-500/20 border-orange-400/40 text-orange-300',
    icon: '🥉',
  },
  none: {
    label: 'Unclaimed',
    badgeClass: 'bg-slate-900/80 border-slate-700/80 text-slate-400',
    icon: '○',
  },
};

export const GauntletsModal: React.FC<GauntletsModalProps> = ({
  onBack,
  onStartGauntlet,
}) => {
  const data = storage.getData();
  const clearedCount = MASTER_GAUNTLETS.filter(
    (g) => data.gauntletProgress[g.id]?.completed
  ).length;
  const goldCount = MASTER_GAUNTLETS.filter(
    (g) => data.gauntletProgress[g.id]?.medal === 'gold'
  ).length;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col text-white animate-in slide-in-from-right duration-200 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shadow-md">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="flex items-center gap-1 text-slate-300 hover:text-white font-semibold text-sm active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <h2 className="text-base font-black tracking-tight flex items-center gap-1.5">
          <Swords size={18} className="text-amber-400" />
          <span>Master Trials</span>
        </h2>

        <div className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
          {clearedCount}/{MASTER_GAUNTLETS.length} Cleared
        </div>
      </div>

      {/* Medal Reward Legend */}
      <div className="px-4 py-2.5 bg-slate-900/70 border-b border-slate-800/80 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-300">
        <span>🥉 Clear (+20 🪙)</span>
        <span className="text-slate-600">·</span>
        <span>🥈 Silver Par (+40 🪙)</span>
        <span className="text-slate-600">·</span>
        <span>🥇 All-Par Gold (+75 🪙)</span>
      </div>

      {/* Gauntlet List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {goldCount === MASTER_GAUNTLETS.length && (
          <div className="max-w-md mx-auto bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-400/50 rounded-2xl p-3 text-center text-xs font-extrabold text-amber-200 flex items-center justify-center gap-2 shadow-lg">
            <Award size={16} className="text-amber-300" />
            <span>Grand Trial Master — All 5 Master Trials Cleared with Gold!</span>
          </div>
        )}

        <div className="max-w-md mx-auto space-y-3.5 pb-6">
          {MASTER_GAUNTLETS.map((gauntlet) => {
            const record = data.gauntletProgress[gauntlet.id];
            const medal: MonthlyMedal = record?.medal || 'none';
            const medalInfo = MEDAL_BADGES[medal];
            const { totalPar, silverMaxMoves } = getGauntletParTotals(gauntlet.id);
            const stages = getGauntletStages(gauntlet.id);

            const buttonLabel = !record?.completed
              ? 'Start Trial'
              : medal !== 'gold'
              ? 'Replay for Gold'
              : 'Beat Record';

            return (
              <div
                key={gauntlet.id}
                className={`rounded-3xl border bg-gradient-to-br p-4 shadow-xl transition-all ${gauntlet.accent}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-center text-2xl flex-none shadow-inner">
                      {gauntlet.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80 truncate">
                        {gauntlet.subtitle}
                      </div>
                      <h3 className="text-base font-black text-white leading-tight truncate">
                        {gauntlet.name}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide flex items-center gap-1 flex-none ${medalInfo.badgeClass}`}
                  >
                    <span>{medalInfo.icon}</span>
                    <span>{medalInfo.label}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-200/85 mt-3 leading-relaxed">
                  {gauntlet.description}
                </p>

                {/* Stage metadata pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-slate-200 flex items-center gap-1">
                    <Layers size={12} className="text-sky-400" />
                    <span>{stages.length} Stages</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-amber-300">
                    🥇 Gold ≤ {totalPar}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-slate-300">
                    🥈 Silver ≤ {silverMaxMoves}
                  </span>
                </div>

                {/* Best record bar if cleared */}
                {record?.completed && (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-slate-950/65 border border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-200">
                    <span className="text-slate-400">Personal Best</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-white font-bold">
                        {record.bestMoves} moves
                      </span>
                      {record.bestTimeMs > 0 && (
                        <span className="text-indigo-300 font-bold flex items-center gap-1">
                          <Timer size={12} />
                          {formatElapsedTime(record.bestTimeMs)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    sound.playTap();
                    onStartGauntlet(gauntlet.id);
                  }}
                  className="mt-3.5 w-full py-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 active:scale-[0.98] transition-all border border-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Play size={14} className="fill-white" />
                  <span>{buttonLabel} →</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
