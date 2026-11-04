import { describe, it, expect } from 'vitest';
import { ALL_LEVELS, WORLDS } from '../src/levels/levelsData';
import { solveLevel } from '../src/engine/solver';

describe('100 Levels Solvability & Balance QA Test Suite', () => {
  it('contains exactly 100 levels across 5 worlds', () => {
    expect(ALL_LEVELS.length).toBe(100);
    expect(WORLDS.length).toBe(5);

    // Check each world has 20 levels
    for (let w = 1; w <= 5; w++) {
      const worldLevels = ALL_LEVELS.filter((l) => l.world === w);
      expect(worldLevels.length).toBe(20);
    }
  });

  it('validates each of the 100 levels is solvable with realistic par moves', () => {
    for (const level of ALL_LEVELS) {
      expect(level.id).toBeGreaterThanOrEqual(1);
      expect(level.id).toBeLessThanOrEqual(100);
      expect(level.parMoves).toBeGreaterThan(0);
      expect(level.star2Moves).toBeGreaterThan(level.parMoves);

      // Verify that solveLevel produces solvable result matching parMoves
      const result = solveLevel(level);
      expect(result.solvable).toBe(true);
      expect(result.minMoves).toBe(level.parMoves);
    }
  });
});
