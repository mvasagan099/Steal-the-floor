import React from 'react';
import { ArrowLeft, Check, Trophy } from 'lucide-react';
import { storage } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface AchievementsModalProps {
  onBack: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onBack }) => {
  const data = storage.getData();
  const achievements = Object.values(data.achievements);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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
        <h2 className="text-base font-extrabold tracking-tight">Achievements</h2>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-bold text-xs">
          <Trophy size={13} />
          <span>
            {unlockedCount}/{achievements.length}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 safe-bottom">
        {achievements.map((ach) => {
          const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl flex-none shadow">
                  {ach.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-white truncate">{ach.title}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{ach.description}</p>

                  {/* Progress bar */}
                  {!ach.unlocked && (
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {ach.unlocked ? (
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-none">
                  <Check size={14} />
                </div>
              ) : (
                <span className="text-[10px] font-mono text-slate-500 font-bold flex-none">
                  {ach.progress}/{ach.maxProgress}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
