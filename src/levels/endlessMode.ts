import { LevelDefinition, Coordinate } from '../engine/types';
import { solveLevel } from '../engine/solver';
import { ALL_LEVELS } from './levelsData';

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const coordKey = (c: Coordinate) => `${c.x},${c.y}`;

/**
 * Generates an escalating, solver-verified procedural puzzle for Endless "Void Rush" mode.
 * Stage 1-2: islands + rocks + 1 gem
 * Stage 3-4: adds crumbling stones & ice tiles
 * Stage 5+: adds sticky hazards, +1 bonus tiles, and 2 gems
 */
export function generateEndlessStage(stageNumber: number, runSeed: number): LevelDefinition {
  const cols = 6;
  const rows = 7;
  const baseSeed = Math.abs((runSeed * 31337 + stageNumber * 9973) | 0) + 17;

  for (let attempt = 0; attempt < 45; attempt++) {
    const prng = mulberry32(baseSeed + attempt * 6151);
    const randInt = (min: number, max: number) => Math.floor(prng() * (max - min + 1)) + min;

    const useBonus = stageNumber >= 4 && prng() < 0.45;
    const maxTiles = useBonus ? 1 : stageNumber >= 3 && prng() < 0.35 ? 3 : 2;
    const effectiveReach = useBonus ? 2 : maxTiles;

    const flipSides = prng() < 0.5;
    const start: Coordinate = flipSides
      ? { x: randInt(cols - 2, cols - 1), y: randInt(0, 1) }
      : { x: randInt(0, 1), y: randInt(0, 1) };
    const exit: Coordinate = flipSides
      ? { x: randInt(0, 1), y: randInt(rows - 2, rows - 1) }
      : { x: randInt(cols - 2, cols - 1), y: randInt(rows - 2, rows - 1) };

    const occupied = new Set<string>([coordKey(start), coordKey(exit)]);
    const fixed: Coordinate[] = [];
    const rocks: Coordinate[] = [];
    const crumbling: Coordinate[] = [];
    const ice: Coordinate[] = [];
    const sticky: Coordinate[] = [];
    const bonusTiles: Coordinate[] = [];
    const stars: Coordinate[] = [];

    let cursor: Coordinate = { ...start };
    const backboneCount = randInt(4, Math.min(6, 4 + Math.floor(stageNumber / 3)));

    for (let i = 0; i < backboneCount; i++) {
      const stepReach = i === 0 && useBonus ? 1 : effectiveReach;
      const targetRow = Math.min(
        rows - 1,
        Math.max(0, Math.round(((i + 1) / (backboneCount + 1)) * (rows - 1)))
      );
      const candidates: Coordinate[] = [];
      for (let x = 0; x < cols; x++) {
        for (let y = Math.max(0, targetRow - 1); y <= Math.min(rows - 1, targetRow + 1); y++) {
          const dist = Math.abs(x - cursor.x) + Math.abs(y - cursor.y);
          const key = `${x},${y}`;
          if (dist >= 2 && dist <= stepReach + 1 && !occupied.has(key)) {
            candidates.push({ x, y });
          }
        }
      }
      if (candidates.length === 0) break;
      const pick = candidates[Math.floor(prng() * candidates.length)];
      occupied.add(coordKey(pick));

      if (i === 0 && useBonus) {
        fixed.push(pick);
        bonusTiles.push(pick);
      } else if (stageNumber >= 3 && i > 0 && prng() < 0.3) {
        crumbling.push(pick);
      } else if (stageNumber >= 3 && prng() < 0.25) {
        ice.push(pick);
      } else {
        fixed.push(pick);
      }
      cursor = pick;
    }

    // Gem detour islands
    const gemCount = stageNumber >= 5 ? 2 : 1;
    for (let g = 0; g < gemCount; g++) {
      const anchor = fixed[Math.floor(prng() * Math.max(1, fixed.length))] || start;
      const candidates: Coordinate[] = [];
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const dist = Math.abs(x - anchor.x) + Math.abs(y - anchor.y);
          const key = `${x},${y}`;
          if (dist >= 2 && dist <= effectiveReach + 1 && !occupied.has(key)) {
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

    // Rock barriers
    const rockTarget = randInt(4, Math.min(9, 5 + Math.floor(stageNumber / 2)));
    for (let r = 0; r < rockTarget * 3 && rocks.length < rockTarget; r++) {
      const rx = randInt(0, cols - 1);
      const ry = randInt(0, rows - 1);
      const key = `${rx},${ry}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        rocks.push({ x: rx, y: ry });
      }
    }

    // Sticky hazard on stage 4+ with maxTiles >= 3
    if (stageNumber >= 4 && maxTiles >= 3) {
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
      id: 20000 + stageNumber,
      world: 0,
      name: `Void Rush · Stage ${stageNumber}`,
      cols,
      rows,
      maxTiles,
      start,
      exit,
      fixed: fixed.length ? fixed : undefined,
      rocks: rocks.length ? rocks : undefined,
      crumbling: crumbling.length ? crumbling : undefined,
      ice: ice.length ? ice : undefined,
      sticky: sticky.length ? sticky : undefined,
      bonusTiles: bonusTiles.length ? bonusTiles : undefined,
      stars: stars.length ? stars : undefined,
      parMoves: 0,
      hint: `Endless Stage ${stageNumber}: keep your streak alive!`,
    };

    const solution = solveLevel(candidate, 34);
    const minPar = Math.min(14, 7 + Math.floor(stageNumber / 2));
    if (solution.solvable && solution.minMoves >= minPar && solution.minMoves <= 28) {
      candidate.parMoves = solution.minMoves;
      candidate.star2Moves = solution.minMoves + Math.max(2, Math.ceil(solution.minMoves * 0.25));
      return candidate;
    }
  }

  // Deterministic fallback from verified campaign pool
  const fallbackIdx = Math.abs(baseSeed) % ALL_LEVELS.length;
  const fallback = ALL_LEVELS[fallbackIdx];
  return {
    ...JSON.parse(JSON.stringify(fallback)),
    id: 20000 + stageNumber,
    world: 0,
    name: `Void Rush · Stage ${stageNumber}`,
    hint: `Endless Stage ${stageNumber}: keep your streak alive!`,
  };
}
