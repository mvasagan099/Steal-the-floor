import React from 'react';
import { ArrowLeft, Calendar, Flame, Play, CheckCircle2 } from 'lucide-react';
import { storage } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface DailyChallengeModalProps {
  onBack: () => void;
  onStartDaily: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  onBack,
  onStartDaily,
}) => {
  const data = storage.getData();
  const todayStr = new Date().toISOString().split('T')[0];
  const isCompletedToday = data.lastDailyCompletedDate === todayStr;

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
        <h2 className="text-base font-extrabold tracking-tight">Daily Challenge</h2>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto safe-bottom">
        {/* Calendar Badge */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 mb-4">
          <Calendar size={40} />
        </div>

        <h3 className="text-xl font-black text-white">Daily Puzzle</h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          A fresh procedural challenge every day. Completely offline, seeded by the calendar date!
        </p>

        {/* Streak counter card */}
        <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-around mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame size={24} className="fill-orange-400" />
            </div>
            <div className="text-left">
              <div className="text-xs text-slate-400 font-semibold">Daily Streak</div>
              <div className="text-xl font-extrabold text-white">
                {data.dailyStreak} {data.dailyStreak === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold">Reward</span>
            <div className="text-lg font-bold text-amber-400">+25 🪙</div>
          </div>
        </div>

        {/* Start or Completed Button */}
        {isCompletedToday ? (
          <div className="w-full py-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 font-extrabold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 size={20} />
            <span>Completed for Today!</span>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playTap();
              onStartDaily();
            }}
            className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 active:scale-95 transition-all text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
          >
            <Play size={18} className="fill-white" />
            <span>Play Daily Challenge</span>
          </button>
        )}
      </div>
    </div>
  );
};
