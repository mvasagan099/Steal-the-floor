import { LevelDefinition, Coordinate } from '../engine/types';
import { solveLevel } from '../engine/solver';
import { ALL_LEVELS } from './levelsData';
import { getLocalDateString } from '../storage/gameStorage';

// Mulberry32 deterministic 32-bit PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) + 1337;
}

const coordKey = (c: Coordinate) => `${c.x},${c.y}`;

/**
 * Generates a fresh, solver-verified procedural puzzle seeded by calendar date.
 * Guarantees non-trivial parMoves (>= 9) under Solid-Ground Reclamation.
 */
export function getDailyChallenge(dateStr?: string): LevelDefinition {
  const date = dateStr || getLocalDateString();
  const baseSeed = stringToSeed(`steal-the-floor-daily-${date}`);
  const cols = 6;
  const rows = 7;

  for (let attempt = 0; attempt < 40; attempt++) {
    const prng = mulberry32(baseSeed + attempt * 7919);
    const randInt = (min: number, max: number) => Math.floor(prng() * (max - min + 1)) + min;

    const maxTiles = prng() < 0.7 ? 2 : 3;
    const start: Coordinate = { x: randInt(0, 1), y: randInt(0, 1) };
    const exit: Coordinate = { x: randInt(cols - 2, cols - 1), y: randInt(rows - 2, rows - 1) };

    const occupied = new Set<string>([coordKey(start), coordKey(exit)]);
    const fixed: Coordinate[] = [];
    const rocks: Coordinate[] = [];
    const crumbling: Coordinate[] = [];
    const ice: Coordinate[] = [];
    const springs: Coordinate[] = [];
    const sticky: Coordinate[] = [];
    const stars: Coordinate[] = [];

    // Lay a backbone chain of 4-5 reachable islands so the board is rich with routes
    let cursor: Coordinate = { ...start };
    const backboneCount = randInt(4, 5);
    for (let i = 0; i < backboneCount; i++) {
      const targetRow = Math.min(rows - 1, Math.max(0, Math.round(((i + 1) / (backboneCount + 1)) * (rows - 1))));
      const candidates: Coordinate[] = [];
      for (let x = 0; x < cols; x++) {
        for (let y = Math.max(0, targetRow - 1); y <= Math.min(rows - 1, targetRow + 1); y++) {
          const dist = Math.abs(x - cursor.x) + Math.abs(y - cursor.y);
          const key = `${x},${y}`;
          if (dist >= 2 && dist <= maxTiles + 1 && !occupied.has(key)) {
            candidates.push({ x, y });
          }
        }
      }
      if (candidates.length === 0) break;
      const pick = candidates[Math.floor(prng() * candidates.length)];
      occupied.add(coordKey(pick));

      // Mix in crumbling, ice, and occasional springboards for rich daily variety
      const roll = prng();
      if (i > 0 && roll < 0.25) {
        crumbling.push(pick);
      } else if (i > 0 && roll < 0.42) {
        ice.push(pick);
      } else if (i > 0 && roll < 0.54 && springs.length < 1) {
        springs.push(pick);
      } else {
        fixed.push(pick);
      }
      cursor = pick;
    }

    // Add 1-2 side branch islands for gem detours
    const sideCount = randInt(1, 2);
    for (let s = 0; s < sideCount; s++) {
      const anchor = fixed[Math.floor(prng() * Math.max(1, fixed.length))] || start;
      const candidates: Coordinate[] = [];
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const dist = Math.abs(x - anchor.x) + Math.abs(y - anchor.y);
          const key = `${x},${y}`;
          if (dist >= 2 && dist <= maxTiles + 1 && !occupied.has(key)) {
            candidates.push({ x, y });
          }
        }
      }
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(prng() * candidates.length)];
        occupied.add(coordKey(pick));
        fixed.push(pick);
        stars.push(pick);
      }
    }

    // Place 4-7 rocks in empty spaces to carve corridors
    const rockTarget = randInt(4, 7);
    for (let r = 0; r < rockTarget * 3 && rocks.length < rockTarget; r++) {
      const rx = randInt(0, cols - 1);
      const ry = randInt(0, rows - 1);
      const key = `${rx},${ry}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        rocks.push({ x: rx, y: ry });
      }
    }

    // Optional sticky hazard on maxTiles === 3 boards
    if (maxTiles === 3) {
      for (let h = 0; h < 6 && sticky.length < 1; h++) {
        const hx = randInt(1, cols - 2);
        const hy = randInt(1, rows - 2);
        const key = `${hx},${hy}`;
        if (!occupied.has(key)) {
          occupied.add(key);
          sticky.push({ x: hx, y: hy });
        }
      }
    }

    const candidate: LevelDefinition = {
      id: 9999,
      world: 0,
      name: `Daily Expedition: ${date}`,
      cols,
      rows,
      maxTiles,
      start,
      exit,
      fixed: fixed.length ? fixed : undefined,
      rocks: rocks.length ? rocks : undefined,
      crumbling: crumbling.length ? crumbling : undefined,
      ice: ice.length ? ice : undefined,
      springs: springs.length ? springs : undefined,
      sticky: sticky.length ? sticky : undefined,
      stars: stars.length ? stars : undefined,
      parMoves: 0,
      hint: 'A fresh procedural puzzle crafted for today. Plan your island hops carefully!',
    };

    const solution = solveLevel(candidate, 32);
    const manhattan = Math.abs(start.x - exit.x) + Math.abs(start.y - exit.y);
    if (solution.solvable && solution.minMoves >= Math.max(9, manhattan + 2) && solution.minMoves <= 28) {
      candidate.parMoves = solution.minMoves;
      candidate.star2Moves = solution.minMoves + Math.max(2, Math.ceil(solution.minMoves * 0.25));
      return candidate;
    }
  }

  // Deterministic fallback to a curated level if all attempts miss tight bounds
  const fallbackPrng = mulberry32(baseSeed);
  const templateIdx = Math.floor(fallbackPrng() * 60) + 20;
  const baseLevel = ALL_LEVELS[templateIdx] || ALL_LEVELS[0];
  return {
    ...JSON.parse(JSON.stringify(baseLevel)),
    id: 9999,
    world: 0,
    name: `Daily Expedition: ${date}`,
    hint: 'A special daily challenge puzzle. Plan your tile economy carefully!',
  };
}

export function formatDailyShareText(
  dateStr: string,
  moves: number,
  parMoves: number,
  stars: number,
  streak: number
): string {
  const starEmojis = '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
  return [
    `🧩 Steal the Floor — Daily ${dateStr}`,
    `${starEmojis}  ${moves}/${parMoves} moves`,
    `🔥 ${streak}-day streak`,
  ].join('\n');
}
