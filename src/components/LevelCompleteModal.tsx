import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Play, RotateCcw, Home, Trophy, Share2, Check } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface LevelCompleteModalProps {
  levelId: number;
  levelName: string;
  isDaily?: boolean;
  shareText?: string;
  moves: number;
  parMoves: number;
  starsEarned: number;
  coinsEarned: number;
  hasNextLevel: boolean;
  onNext: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  levelName,
  isDaily = false,
  shareText,
  moves,
  parMoves,
  starsEarned,
  coinsEarned,
  hasNextLevel,
  onNext,
  onReplay,
  onHome,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#f472b6', '#4ade80'],
      });
    } catch {
      // Fallback if canvas confetti fails
    }
  }, []);

  const handleShare = async () => {
    if (!shareText) return;
    sound.playTap();
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User canceled share or clipboard unavailable
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <Trophy size={36} />
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {isDaily ? 'Daily Challenge Complete!' : `Level ${levelId} Complete!`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{levelName}</p>
        </div>

        <div className="flex items-center justify-center gap-2 my-1">
          {[1, 2, 3].map((starIndex) => {
            const hasStar = starIndex <= starsEarned;
            return (
              <div
                key={starIndex}
                className={`transition-all transform duration-500 ${
                  hasStar ? 'scale-110' : 'scale-90 opacity-30'
                }`}
              >
                <Star
                  size={40}
                  className={
                    hasStar
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                      : 'text-slate-600'
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="w-full grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs font-semibold">
          <div className="flex flex-col items-center">
            <span className="text-slate-400">Moves Used</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5">
              {moves}{' '}
              <span className="text-xs text-slate-500 font-normal">(Par: {parMoves})</span>
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400">Reward</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5">
              {coinsEarned > 0 ? `+${coinsEarned} 🪙` : 'Cleared ✓'}
            </span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5 mt-2">
          {isDaily && shareText && (
            <button
              onClick={handleShare}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 active:scale-95 transition-all text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {copied ? <Check size={17} /> : <Share2 size={17} />}
              <span>{copied ? 'Result Copied!' : 'Share Daily Result'}</span>
            </button>
          )}

          {hasNextLevel && (
            <button
              onClick={() => {
                sound.playTap();
                onNext();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 active:scale-95 transition-all text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              <Play size={18} className="fill-white" />
              <span>Next Level</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                sound.playTap();
                onReplay();
              }}
              className="py-2.5 bg-slate-800 active:scale-95 transition-all border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-700"
            >
              <RotateCcw size={15} />
              <span>Replay</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onHome();
              }}
              className="py-2.5 bg-slate-800 active:scale-95 transition-all border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-700"
            >
              <Home size={15} />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
