import { describe, it, expect } from 'vitest';
import { ALL_LEVELS, WORLDS } from '../src/levels/levelsData';
import { PuzzleGame } from '../src/engine/logic';
import { solveLevel } from '../src/engine/solver';
import { LevelDefinition } from '../src/engine/types';

describe('240 Levels Solvability & Mechanic Quality Gate Suite', () => {
  it('contains exactly 240 levels across 12 worlds', () => {
    expect(ALL_LEVELS.length).toBe(240);
    expect(WORLDS.length).toBe(12);

    for (let w = 1; w <= 12; w++) {
      const worldLevels = ALL_LEVELS.filter((l) => l.world === w);
      expect(worldLevels.length).toBe(20);
    }
  });

  it('validates all 240 levels are solvable with accurate par and active mechanics', () => {
    for (const level of ALL_LEVELS) {
      expect(level.id).toBeGreaterThanOrEqual(1);
      expect(level.id).toBeLessThanOrEqual(240);
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
      let usedKey = false;
      let usedLock = false;
      let usedBonusTile = false;
      let usedCrate = false;
      let usedConveyor = false;

      const oneWayKeys = new Set((level.oneWay || []).map((o) => `${o.x},${o.y}`));
      const crumblingKeys = new Set((level.crumbling || []).map((c) => `${c.x},${c.y}`));
      const iceKeys = new Set((level.ice || []).map((c) => `${c.x},${c.y}`));
      const conveyorKeys = new Set((level.conveyors || []).map((c) => `${c.x},${c.y}`));

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
          if (r.cratePath?.some((c) => conveyorKeys.has(`${c.x},${c.y}`))) {
            usedConveyor = true;
          }
          if (r.cratePath?.some((c) => iceKeys.has(`${c.x},${c.y}`))) {
            usedIce = true;
          }
          const dist =
            Math.abs(r.pushedCrate.to.x - r.pushedCrate.from.x) +
            Math.abs(r.pushedCrate.to.y - r.pushedCrate.from.y);
          if (dist > 1 && level.ice?.length && !level.conveyors?.length) usedIce = true;
        }
        if (r.springPath && r.springPath.length > 0) usedSpring = true;
        if (r.conveyorPath && r.conveyorPath.length > 0) usedConveyor = true;
        if (r.keyCollected) usedKey = true;
        if (r.lockOpened) usedLock = true;
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

      if (level.locks?.length) {
        expect(usedKey && usedLock, `Level ${level.id}: key and locked vault must be used`).toBe(
          true
        );
        const sealedVaults: LevelDefinition = {
          ...level,
          locks: undefined,
          rocks: [...(level.rocks || []), ...level.locks],
        };
        expect(
          solveLevel(sealedVaults, 45).solvable,
          `Level ${level.id}: locked vault must not be bypassable`
        ).toBe(false);
      }

      if (level.phaseTiles?.length) {
        const noPhaseSol = solveLevel({ ...level, phaseTiles: undefined }, 45);
        expect(
          !noPhaseSol.solvable || noPhaseSol.minMoves > result.minMoves,
          `Level ${level.id}: phase-shift tiles must be necessary or improve par`
        ).toBe(true);
      }

      if (level.conveyors?.length) {
        expect(usedConveyor, `Level ${level.id}: conveyor belt must be used`).toBe(true);
        const asFixedSol = solveLevel(
          {
            ...level,
            conveyors: undefined,
            fixed: [...(level.fixed || []), ...level.conveyors.map((c) => ({ x: c.x, y: c.y }))],
          },
          45
        );
        expect(
          !asFixedSol.solvable || asFixedSol.minMoves !== result.minMoves,
          `Level ${level.id}: conveyor propulsion must impact solvability or par vs plain islands`
        ).toBe(true);
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
