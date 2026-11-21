import React from 'react';
import { ArrowLeft, Calendar, Flame, Play, CheckCircle2, Trophy, Lock } from 'lucide-react';
import { storage, getLocalDateString } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface DailyChallengeModalProps {
  onBack: () => void;
  onStartDaily: (dateStr?: string) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  onBack,
  onStartDaily,
}) => {
  const data = storage.getData();
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth(); // 0-11
  const todayDay = now.getDate();
  const todayStr = getLocalDateString(now);

  const isCompletedToday = data.completedDailyDates.includes(todayStr);
  const monthlyStats = storage.getMonthlyDailyStats(year, monthIndex + 1);
  const completedSet = new Set(monthlyStats.completedDays);

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const medalBadge =
    monthlyStats.medal === 'gold'
      ? { label: 'Gold Medal', icon: '🥇', color: 'text-amber-300 bg-amber-500/20 border-amber-400/40' }
      : monthlyStats.medal === 'silver'
      ? { label: 'Silver Medal', icon: '🥈', color: 'text-slate-200 bg-slate-400/20 border-slate-300/40' }
      : monthlyStats.medal === 'bronze'
      ? { label: 'Bronze Medal', icon: '🥉', color: 'text-orange-300 bg-orange-500/20 border-orange-400/40' }
      : { label: 'No Medal Yet', icon: '🏅', color: 'text-slate-400 bg-slate-800 border-slate-700' };

  const formatDayStr = (day: number) =>
    `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

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
        <h2 className="text-base font-extrabold tracking-tight">Daily & Archive</h2>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 max-w-md w-full mx-auto space-y-4 safe-bottom">
        {/* Streak & Today Summary */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <Calendar size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Today&apos;s Expedition</h3>
                <p className="text-[11px] text-slate-400">
                  {MONTH_NAMES[monthIndex]} {todayDay}, {year} · 100% Offline
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30">
              <Flame size={15} className="text-orange-400 fill-orange-400" />
              <span className="text-xs font-extrabold text-orange-300">
                {data.dailyStreak}d
              </span>
            </div>
          </div>

          {isCompletedToday ? (
            <div className="w-full py-3 bg-emerald-500/15 border border-emerald-500/35 rounded-xl text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>Today&apos;s Puzzle Completed!</span>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playTap();
                onStartDaily(todayStr);
              }}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 active:scale-95 transition-all text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              <Play size={15} className="fill-white" />
              <span>Play Today (+25 🪙)</span>
            </button>
          )}
        </div>

        {/* Monthly Medal Progress */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <span className="text-xs font-extrabold text-white">
                {MONTH_NAMES[monthIndex]} Trophy
              </span>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${medalBadge.color}`}>
              {medalBadge.icon} {medalBadge.label}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 via-slate-200 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (monthlyStats.count / 20) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span className={monthlyStats.count >= 5 ? 'text-orange-300' : ''}>🥉 5 Bronze</span>
            <span className={monthlyStats.count >= 12 ? 'text-slate-200' : ''}>🥈 12 Silver</span>
            <span className={monthlyStats.count >= 20 ? 'text-amber-300' : ''}>🥇 20 Gold</span>
            <span className="text-sky-400">{monthlyStats.count}/20</span>
          </div>
        </div>

        {/* Interactive Monthly Archive Calendar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-white">
              {MONTH_NAMES[monthIndex]} {year} Archive
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              Tap past days to replay (+10 🪙)
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-[10px] font-bold text-slate-500 uppercase">
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstWeekday }).map((_, idx) => (
              <div key={`blank-${idx}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isFuture = day > todayDay;
              const isToday = day === todayDay;
              const isDone = completedSet.has(day);
              const dateStr = formatDayStr(day);

              return (
                <button
                  key={day}
                  disabled={isFuture}
                  onClick={() => {
                    sound.playTap();
                    onStartDaily(dateStr);
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-extrabold transition-all border ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 active:scale-95'
                      : isToday
                      ? 'bg-sky-500/25 border-sky-400 text-white shadow-sm shadow-sky-500/30 active:scale-95'
                      : isFuture
                      ? 'bg-slate-950/60 border-slate-800/50 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-sky-400/50 active:scale-95'
                  }`}
                >
                  <span>{day}</span>
                  {isDone ? (
                    <span className="text-[9px] leading-none text-emerald-400">✓</span>
                  ) : isFuture ? (
                    <Lock size={8} className="opacity-40 mt-0.5" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
