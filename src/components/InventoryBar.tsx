import React from 'react';
import { Undo2, Sparkles } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface InventoryBarProps {
  available: number;
  maxTiles: number;
  trappedCount: number;
  canUndo: boolean;
  notice: string;
  onUndo: () => void;
  onHint: () => void;
}

export const InventoryBar: React.FC<InventoryBarProps> = ({
  available,
  maxTiles,
  trappedCount,
  canUndo,
  notice,
  onUndo,
  onHint,
}) => {
  return (
    <footer className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 text-white z-20 flex flex-col gap-2 safe-bottom">
      {/* Notice Message */}
      <div className="text-center min-h-[24px] flex items-center justify-center">
        <p className="text-xs font-medium text-slate-300 transition-all truncate px-2">
          {notice}
        </p>
      </div>

      {/* Main Bar: Undo, Tile Stock Visuals, Hint */}
      <div className="flex items-center justify-between gap-3">
        {/* Undo Button */}
        <button
          onClick={() => {
            if (canUndo) {
              sound.playTap();
              onUndo();
            }
          }}
          disabled={!canUndo}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs border transition-all ${
            canUndo
              ? 'bg-slate-800 border-slate-700 active:scale-95 text-slate-200 hover:bg-slate-700'
              : 'bg-slate-900/50 border-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
          aria-label="Undo move"
        >
          <Undo2 size={16} />
          <span>Undo</span>
        </button>

        {/* Visual Tile Stock Display */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
            Tiles
          </span>
          {Array.from({ length: maxTiles }).map((_, i) => {
            const isTrapped = i < trappedCount;
            const isAvailable = i < trappedCount + available;

            let tileStyle = 'bg-sky-500 shadow-sky-500/50 border-sky-300';
            if (isTrapped) {
              tileStyle = 'bg-purple-600 border-purple-400 opacity-60';
            } else if (!isAvailable) {
              tileStyle = 'bg-slate-700 border-slate-600 opacity-30';
            }

            return (
              <div
                key={i}
                className={`w-5 h-6 rounded-md border transition-all duration-300 shadow-sm ${tileStyle} flex items-center justify-center`}
              >
                {isTrapped && <span className="text-[9px]">🔒</span>}
              </div>
            );
          })}
          <span className="ml-1 text-xs font-mono font-bold text-sky-400">
            {available}
          </span>
        </div>

        {/* Hint Button */}
        <button
          onClick={() => {
            sound.playTap();
            onHint();
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-500/20 active:scale-95 transition-all border border-amber-500/40 rounded-xl text-amber-300 hover:bg-amber-500/30 text-xs font-bold"
          aria-label="Show hint"
        >
          <Sparkles size={16} className="text-amber-400" />
          <span>Hint</span>
        </button>
      </div>
    </footer>
  );
};
