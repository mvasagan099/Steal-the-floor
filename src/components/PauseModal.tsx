import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Film, BookOpen } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface PauseModalProps {
  levelId: number;
  levelName: string;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onWatchSolution?: () => void;
  onOpenCodex?: () => void;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelId,
  levelName,
  onResume,
  onRestart,
  onHome,
  onWatchSolution,
  onOpenCodex,
  musicEnabled,
  sfxEnabled,
  onToggleMusic,
  onToggleSfx,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Game Paused</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Level {levelId} · {levelName}
          </p>
        </div>

        {/* Audio Quick Toggles */}
        <div className="flex items-center justify-center gap-3 w-full bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              sound.playTap();
              onToggleMusic();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              musicEnabled
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            {musicEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>Music</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onToggleSfx();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              sfxEnabled
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            {sfxEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>SFX</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <button
            onClick={() => {
              sound.playTap();
              onResume();
            }}
            className="w-full py-3 bg-sky-500 active:scale-95 transition-all text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Play size={17} className="fill-white" />
            <span>Resume</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onRestart();
            }}
            className="w-full py-2.5 bg-slate-800 active:scale-95 transition-all border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700"
          >
            <RotateCcw size={15} />
            <span>Restart Level</span>
          </button>

          {onWatchSolution && (
            <button
              onClick={() => {
                sound.playTap();
                onWatchSolution();
              }}
              className="w-full py-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 active:scale-95 transition-all border border-indigo-400/40 text-indigo-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Film size={15} />
              <span>Watch Optimal Par</span>
            </button>
          )}

          {onOpenCodex && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenCodex();
              }}
              className="w-full py-2.5 bg-slate-800 active:scale-95 transition-all border border-slate-700 text-sky-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700"
            >
              <BookOpen size={15} />
              <span>Mechanic Field Guide</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playTap();
              onHome();
            }}
            className="w-full py-2.5 bg-slate-800 active:scale-95 transition-all border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700"
          >
            <Home size={15} />
            <span>Level Select</span>
          </button>
        </div>
      </div>
    </div>
  );
};
