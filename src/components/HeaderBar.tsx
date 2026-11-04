import React from 'react';
import { Pause, Star, RotateCcw } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface HeaderBarProps {
  levelTitle: string;
  worldName?: string;
  moves: number;
  parMoves: number;
  starsCollected: number;
  totalStars: number;
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
  onPause,
  onRestart,
}) => {
  return (
    <header className="flex items-center justify-between px-3 py-2 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white z-20">
      {/* Left: Pause & Restart */}
      <div className="flex items-center gap-1.5">
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
      <div className="text-center px-2">
        <h1 className="text-sm font-extrabold tracking-tight truncate max-w-[170px] text-sky-400">
          {levelTitle}
        </h1>
        {worldName && (
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {worldName}
          </p>
        )}
      </div>

      {/* Right: Stars & Moves vs Par */}
      <div className="flex items-center gap-2">
        {totalStars > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-950/60 border border-amber-600/40 rounded-lg text-amber-300 text-xs font-bold">
            <Star size={13} className="fill-amber-400 text-amber-400" />
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
