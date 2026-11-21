import React from 'react';
import { Pause, Gem, RotateCcw, Timer } from 'lucide-react';
import { sound } from '../audio/soundManager';
import { formatElapsedTime } from '../storage/gameStorage';

interface HeaderBarProps {
  levelTitle: string;
  worldName?: string;
  moves: number;
  parMoves: number;
  starsCollected: number;
  totalStars: number;
  elapsedMs?: number;
  showTimer?: boolean;
  onPause: () => void;
  onRestart: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  levelTitle,
  worldName,
  moves,
  parMoves,
  starsCollected,
  totalStars,
  elapsedMs = 0,
  showTimer = false,
  onPause,
  onRestart,
}) => {
  return (
    <header className="flex items-center justify-between px-3 py-2 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white z-20 gap-2">
      {/* Left: Pause & Restart */}
      <div className="flex items-center gap-1.5 flex-none">
        <button
          onClick={() => {
            sound.playTap();
            onPause();
          }}
          className="p-2 rounded-xl bg-slate-800/90 active:scale-95 transition-transform border border-slate-700 hover:bg-slate-700/80 text-slate-200"
          aria-label="Pause"
        >
          <Pause size={18} />
        </button>
        <button
          onClick={() => {
            sound.playTap();
            onRestart();
          }}
          className="p-2 rounded-xl bg-slate-800/90 active:scale-95 transition-transform border border-slate-700 hover:bg-slate-700/80 text-slate-200"
          aria-label="Restart"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Middle: Title & World */}
      <div className="text-center px-1 min-w-0 flex-1">
        <h1 className="text-sm font-extrabold tracking-tight truncate text-sky-400">
          {levelTitle}
        </h1>
        {worldName && (
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
            {worldName}
          </p>
        )}
      </div>

      {/* Right: Speedrun Timer, Gems & Moves vs Par */}
      <div className="flex items-center gap-1.5 flex-none">
        {showTimer && (
          <div
            className="flex items-center gap-1 px-1.5 py-1 bg-indigo-950/80 border border-indigo-500/40 rounded-lg text-indigo-300 text-[11px] font-mono font-bold"
            title="Speedrun timer"
          >
            <Timer size={12} className="text-indigo-400" />
            <span>{formatElapsedTime(elapsedMs)}</span>
          </div>
        )}
        {totalStars > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-1 bg-sky-950/70 border border-sky-500/40 rounded-lg text-sky-300 text-xs font-bold"
            title="Gems collected"
          >
            <Gem size={13} className="text-sky-400" />
            <span>
              {starsCollected}/{totalStars}
            </span>
          </div>
        )}
        <div className="px-2 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-300">
          <span className={moves <= parMoves ? 'text-emerald-400' : 'text-amber-400'}>
            {moves}
          </span>
          <span className="text-slate-500">/{parMoves}</span>
        </div>
      </div>
    </header>
  );
};
