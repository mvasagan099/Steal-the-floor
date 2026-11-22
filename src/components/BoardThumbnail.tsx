import React from 'react';
import { LevelDefinition } from '../engine/types';

interface BoardThumbnailProps {
  level: LevelDefinition;
  className?: string;
}

/**
 * Lightweight, zero-overhead SVG miniature board preview for Master Trials & Builder Studio.
 */
export const BoardThumbnail: React.FC<BoardThumbnailProps> = ({ level, className = '' }) => {
  const cell = 10;
  const gap = 1.5;
  const pad = 2;
  const width = level.cols * cell + (level.cols - 1) * gap + pad * 2;
  const height = level.rows * cell + (level.rows - 1) * gap + pad * 2;

  const colorMap = new Map<string, string>();
  const setColor = (x: number, y: number, color: string) => {
    colorMap.set(`${x},${y}`, color);
  };

  level.fixed?.forEach((c) => setColor(c.x, c.y, '#38bdf8'));
  level.rocks?.forEach((c) => setColor(c.x, c.y, '#475569'));
  level.sticky?.forEach((c) => setColor(c.x, c.y, '#a855f7'));
  level.crumbling?.forEach((c) => setColor(c.x, c.y, '#a8a29e'));
  level.ice?.forEach((c) => setColor(c.x, c.y, '#a5f3fc'));
  level.springs?.forEach((c) => setColor(c.x, c.y, '#14b8a6'));
  level.locks?.forEach((c) => setColor(c.x, c.y, '#b45309'));
  level.phaseTiles?.forEach((pt) =>
    setColor(pt.x, pt.y, pt.polarity === 'even' ? '#22d3ee' : '#e879f9')
  );
  level.conveyors?.forEach((cv) => setColor(cv.x, cv.y, '#10b981'));
  level.oneWay?.forEach((ow) => setColor(ow.x, ow.y, '#818cf8'));
  level.switches?.forEach((sw) => {
    setColor(sw.switchPos.x, sw.switchPos.y, '#3b82f6');
    setColor(sw.doorPos.x, sw.doorPos.y, '#f43f5e');
  });
  level.teleporters?.forEach((tp) => {
    setColor(tp.posA.x, tp.posA.y, '#d946ef');
    setColor(tp.posB.x, tp.posB.y, '#d946ef');
  });
  level.crates?.forEach((c) => setColor(c.x, c.y, '#f59e0b'));
  level.keys?.forEach((c) => setColor(c.x, c.y, '#fde047'));
  setColor(level.start.x, level.start.y, '#22c55e');
  setColor(level.exit.x, level.exit.y, '#facc15');

  const gemSet = new Set((level.stars || []).map((c) => `${c.x},${c.y}`));

  const rects: React.ReactNode[] = [];
  for (let y = 0; y < level.rows; y++) {
    for (let x = 0; x < level.cols; x++) {
      const key = `${x},${y}`;
      const fill = colorMap.get(key) || '#1e293b';
      const rx = pad + x * (cell + gap);
      const ry = pad + y * (cell + gap);
      rects.push(
        <rect
          key={key}
          x={rx}
          y={ry}
          width={cell}
          height={cell}
          rx={2.2}
          fill={fill}
          opacity={colorMap.has(key) ? 0.95 : 0.45}
        />
      );
      if (gemSet.has(key)) {
        rects.push(
          <circle
            key={`g-${key}`}
            cx={rx + cell / 2}
            cy={ry + cell / 2}
            r={2.5}
            fill="#ffffff"
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`rounded-lg bg-slate-950/85 border border-white/10 ${className}`}
      aria-label={`Preview of ${level.name}`}
    >
      {rects}
    </svg>
  );
};
