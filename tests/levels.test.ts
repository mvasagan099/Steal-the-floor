import { describe, it, expect } from 'vitest';
import { ALL_LEVELS, WORLDS } from '../src/levels/levelsData';
import { PuzzleGame } from '../src/engine/logic';
import { solveLevel } from '../src/engine/solver';
import { LevelDefinition } from '../src/engine/types';

describe('180 Levels Solvability & Mechanic Quality Gate Suite', () => {
  it('contains exactly 180 levels across 9 worlds', () => {
    expect(ALL_LEVELS.length).toBe(180);
    expect(WORLDS.length).toBe(9);

    for (let w = 1; w <= 9; w++) {
      const worldLevels = ALL_LEVELS.filter((l) => l.world === w);
      expect(worldLevels.length).toBe(20);
    }
  });

  it('validates all 180 levels are solvable with accurate par and active mechanics', () => {
    for (const level of ALL_LEVELS) {
      expect(level.id).toBeGreaterThanOrEqual(1);
      expect(level.id).toBeLessThanOrEqual(180);
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
      let usedIce = false;
      let usedSpring = false;
      let usedBonusTile = false;
      let usedCrate = false;

      const oneWayKeys = new Set((level.oneWay || []).map((o) => `${o.x},${o.y}`));
      const crumblingKeys = new Set((level.crumbling || []).map((c) => `${c.x},${c.y}`));
      const iceKeys = new Set((level.ice || []).map((c) => `${c.x},${c.y}`));

      for (let i = 1; i < result.solutionPath.length; i++) {
        const step = result.solutionPath[i];
        const r = game.move(step);
        if (r.doorToggled) usedSwitch = true;
        if (r.teleportedTo) usedTeleport = true;
        if (r.trappedTile) hitSticky = true;
        if (r.crumbledTile || crumblingKeys.has(`${step.x},${step.y}`)) usedCrumble = true;
        if (oneWayKeys.has(`${step.x},${step.y}`)) usedOneWay = true;
        if (r.pushedCrate) {
          usedCrate = true;
          const dist =
            Math.abs(r.pushedCrate.to.x - r.pushedCrate.from.x) +
            Math.abs(r.pushedCrate.to.y - r.pushedCrate.from.y);
          if (dist > 1) usedIce = true;
        }
        if (r.springPath && r.springPath.length > 0) usedSpring = true;
        if ((r.slidePath && r.slidePath.length > 0) || iceKeys.has(`${step.x},${step.y}`)) usedIce = true;
        if (r.bonusTileCollected) usedBonusTile = true;
      }

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

      if (level.switches?.some((s) => s.timedDuration && s.timedDuration > 0)) {
        const timedSwitches = level.switches.filter((s) => s.timedDuration && s.timedDuration > 0);
        for (const ts of timedSwitches) {
          const tighterLevel: LevelDefinition = {
            ...level,
            switches: level.switches.map((s) =>
              s.id === ts.id ? { ...s, timedDuration: Math.max(1, (s.timedDuration || 2) - 2) } : s
            ),
          };
          const tighterSol = solveLevel(tighterLevel, 45);
          expect(
            !tighterSol.solvable || tighterSol.minMoves > result.minMoves,
            `Level ${level.id}: timed gate '${ts.id}' countdown must have real tension`
          ).toBe(true);
        }
      }

      if (level.crates?.length) {
        expect(usedCrate, `Level ${level.id}: pushable crate must be used`).toBe(true);
      }

      if (level.springs?.length) {
        expect(usedSpring, `Level ${level.id}: springboard must be used`).toBe(true);
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

      if (level.ice?.length) {
        expect(usedIce, `Level ${level.id}: ice tile must be used`).toBe(true);
      }

      if (level.bonusTiles?.length) {
        expect(usedBonusTile, `Level ${level.id}: +1 bonus tile must be collected`).toBe(true);
        const noBonusSol = solveLevel({ ...level, bonusTiles: undefined }, 45);
        expect(
          !noBonusSol.solvable || noBonusSol.minMoves > result.minMoves,
          `Level ${level.id}: +1 bonus tile must be necessary or improve par`
        ).toBe(true);
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
