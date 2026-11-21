import { describe, it, expect } from 'vitest';
import { ALL_LEVELS, WORLDS } from '../src/levels/levelsData';
import { PuzzleGame } from '../src/engine/logic';
import { solveLevel } from '../src/engine/solver';
import { LevelDefinition } from '../src/engine/types';

describe('100 Levels Solvability & Mechanic Quality Gate Suite', () => {
  it('contains exactly 100 levels across 5 worlds', () => {
    expect(ALL_LEVELS.length).toBe(100);
    expect(WORLDS.length).toBe(5);

    for (let w = 1; w <= 5; w++) {
      const worldLevels = ALL_LEVELS.filter((l) => l.world === w);
      expect(worldLevels.length).toBe(20);
    }
  });

  it('validates all 100 levels are solvable with accurate par and active mechanics', () => {
    for (const level of ALL_LEVELS) {
      expect(level.id).toBeGreaterThanOrEqual(1);
      expect(level.id).toBeLessThanOrEqual(100);
      expect(level.parMoves).toBeGreaterThan(0);
      expect(level.star2Moves).toBeGreaterThan(level.parMoves);

      const result = solveLevel(level, 45);
      expect(result.solvable, `Level ${level.id} (${level.name}) must be solvable`).toBe(true);
      expect(result.minMoves, `Level ${level.id} parMoves mismatch`).toBe(level.parMoves);

      // Replay optimal solution to verify every featured mechanic is genuinely engaged
      const game = new PuzzleGame(level);
      let usedSwitch = false;
      let usedTeleport = false;
      let hitSticky = false;
      let usedCrumble = false;
      let usedOneWay = false;

      const oneWayKeys = new Set((level.oneWay || []).map((o) => `${o.x},${o.y}`));
      const crumblingKeys = new Set((level.crumbling || []).map((c) => `${c.x},${c.y}`));

      for (let i = 1; i < result.solutionPath.length; i++) {
        const step = result.solutionPath[i];
        const r = game.move(step);
        if (r.doorToggled) usedSwitch = true;
        if (r.teleportedTo) usedTeleport = true;
        if (r.trappedTile) hitSticky = true;
        if (r.crumbledTile || crumblingKeys.has(`${step.x},${step.y}`)) usedCrumble = true;
        if (oneWayKeys.has(`${step.x},${step.y}`)) usedOneWay = true;
      }

      // Closed doors must be mandatory (cannot be bypassed without switch)
      if (level.switches?.some((s) => !s.doorInitiallyOpen)) {
        expect(usedSwitch, `Level ${level.id}: switch must be used`).toBe(true);
        const lockedOnly: LevelDefinition = {
          ...level,
          switches: undefined,
          rocks: [
            ...(level.rocks || []),
            ...level.switches.filter((s) => !s.doorInitiallyOpen).map((s) => s.doorPos),
          ],
        };
        expect(
          solveLevel(lockedOnly, 45).solvable,
          `Level ${level.id}: closed door must not be bypassable`
        ).toBe(false);
      }

      if (level.teleporters?.length) {
        expect(usedTeleport, `Level ${level.id}: teleporter must be used`).toBe(true);
      }

      if (level.crumbling?.length) {
        expect(usedCrumble, `Level ${level.id}: crumbling stone must be used`).toBe(true);
      }

      if (level.oneWay?.length) {
        expect(usedOneWay, `Level ${level.id}: one-way arrow must be used`).toBe(true);
      }

      if (level.sticky?.length && !hitSticky) {
        const noStickySol = solveLevel({ ...level, sticky: undefined }, 45);
        expect(
          noStickySol.solvable && noStickySol.minMoves < result.minMoves,
          `Level ${level.id}: sticky tile must force a detour or sacrifice`
        ).toBe(true);
      }
    }
  });
});
