import { LevelDefinition, Coordinate } from '../engine/types';
import { solveLevel } from '../engine/solver';
import { ALL_LEVELS } from './levelsData';

// Mulberry32 32-bit PRNG
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
  return Math.abs(hash);
}

export function getDailyChallenge(dateStr?: string): LevelDefinition {
  const date = dateStr || new Date().toISOString().split('T')[0];
  const seed = stringToSeed(date);
  const prng = mulberry32(seed);

  // Pick a base template from levels 20-80
  const templateIdx = Math.floor(prng() * 60) + 20;
  const baseLevel = ALL_LEVELS[templateIdx] || ALL_LEVELS[0];

  // Clone and adapt with daily flavor
  const dailyLevel: LevelDefinition = {
    ...JSON.parse(JSON.stringify(baseLevel)),
    id: 9999,
    world: 0,
    name: `Daily Expedition: ${date}`,
    hint: 'A special daily challenge puzzle. Think ahead and plan your tile economy!',
  };

  // Check solvability
  const solution = solveLevel(dailyLevel);
  if (solution.solvable) {
    dailyLevel.parMoves = solution.minMoves;
    dailyLevel.star2Moves = solution.minMoves + 2;
  } else {
    // Fallback to verified base level
    dailyLevel.parMoves = baseLevel.parMoves;
    dailyLevel.star2Moves = baseLevel.star2Moves;
  }

  return dailyLevel;
}
