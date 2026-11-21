import { describe, it, expect } from 'vitest';
import { PuzzleGame } from '../src/engine/logic';
import { solveLevel, solveFromState } from '../src/engine/solver';
import { LevelDefinition } from '../src/engine/types';

describe('PuzzleGame Engine Mechanics', () => {
  it('handles basic movement, tile placement, and solid-ground tile reclamation', () => {
    const level: LevelDefinition = {
      id: 1,
      world: 1,
      name: 'Test Straight Path',
      cols: 4,
      rows: 1,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 3, y: 0 },
      parMoves: 3,
    };

    const game = new PuzzleGame(level);
    expect(game.inventory).toBe(2);

    // Step 1: move from (0,0) to void (1,0) -> places bridge tile #1
    const res1 = game.move({ x: 1, y: 0 });
    expect(res1.success).toBe(true);
    expect(game.inventory).toBe(1);
    expect(game.tiles.has('1,0')).toBe(true);

    // Step 2: move from (1,0) to void (2,0) -> places bridge tile #2; tile #1 stays down!
    const res2 = game.move({ x: 2, y: 0 });
    expect(res2.success).toBe(true);
    expect(res2.recoveredTiles).toBeUndefined();
    expect(game.tiles.has('1,0')).toBe(true);
    expect(game.tiles.has('2,0')).toBe(true);
    expect(game.inventory).toBe(0);

    // Step 3: step onto solid Exit (3,0) -> BOTH tiles reclaim simultaneously!
    const res3 = game.move({ x: 3, y: 0 });
    expect(res3.success).toBe(true);
    expect(res3.code).toBe('SUCCESS_WIN');
    expect(res3.recoveredTiles).toHaveLength(2);
    expect(game.status).toBe('won');
    expect(game.inventory).toBe(2);
  });

  it('traps bridge tile on sticky floor while reclaiming other tiles on solid landing', () => {
    const level: LevelDefinition = {
      id: 2,
      world: 1,
      name: 'Sticky Test',
      cols: 4,
      rows: 1,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 3, y: 0 },
      sticky: [{ x: 2, y: 0 }],
      parMoves: 3,
    };

    const game = new PuzzleGame(level);
    game.move({ x: 1, y: 0 }); // Bridge #1 at (1,0)
    game.move({ x: 2, y: 0 }); // Bridge #2 on sticky (2,0), inventory = 0
    expect(game.inventory).toBe(0);

    // Step onto solid Exit (3,0): (2,0) becomes trapped, while (1,0) is reclaimed!
    const res = game.move({ x: 3, y: 0 });
    expect(res.trappedTile).toEqual({ x: 2, y: 0 });
    expect(res.recoveredTiles).toEqual([{ x: 1, y: 0 }]);
    expect(game.trapped.has('2,0')).toBe(true);
    expect(game.tiles.size).toBe(0);
    expect(game.inventory).toBe(1); // 2 max - 1 trapped = 1 left
  });

  it('solves puzzle via BFS solver under Solid-Ground Reclamation', () => {
    const level: LevelDefinition = {
      id: 3,
      world: 1,
      name: 'BFS Solver Test',
      cols: 3,
      rows: 3,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 2, y: 2 },
      fixed: [{ x: 2, y: 0 }],
      rocks: [{ x: 1, y: 1 }],
      parMoves: 4,
    };

    const result = solveLevel(level);
    expect(result.solvable).toBe(true);
    expect(result.minMoves).toBe(4);
    expect(result.solutionPath.length).toBe(5); // start + 4 moves
  });

  it('handles undo and restores previous state', () => {
    const level: LevelDefinition = {
      id: 4,
      world: 1,
      name: 'Undo Test',
      cols: 3,
      rows: 1,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 2, y: 0 },
      parMoves: 2,
    };

    const game = new PuzzleGame(level);
    game.move({ x: 1, y: 0 });
    expect(game.player).toEqual({ x: 1, y: 0 });
    expect(game.moves).toBe(1);

    const undone = game.undo();
    expect(undone).toBe(true);
    expect(game.player).toEqual({ x: 0, y: 0 });
    expect(game.moves).toBe(0);
    expect(game.inventory).toBe(1);
  });

  it('handles switches and doors', () => {
    const level: LevelDefinition = {
      id: 5,
      world: 4,
      name: 'Switch Test',
      cols: 3,
      rows: 2,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 2, y: 0 },
      switches: [
        {
          id: 'gate-1',
          switchPos: { x: 1, y: 1 },
          doorPos: { x: 1, y: 0 },
          doorInitiallyOpen: false,
        },
      ],
      parMoves: 4,
    };

    const game = new PuzzleGame(level);
    // Door at (1,0) is closed
    const checkBlocked = game.canMoveTo({ x: 1, y: 0 });
    expect(checkBlocked.allowed).toBe(false);

    // Step down onto (0,1) then (1,1) to hit the switch
    game.move({ x: 0, y: 1 });
    const switchRes = game.move({ x: 1, y: 1 });
    expect(switchRes.doorToggled).toEqual({ id: 'gate-1', open: true });
    expect(game.openDoors.has('gate-1')).toBe(true);

    // Now door at (1,0) is open and walkable
    expect(game.hasWalkableFloor('1,0')).toBe(true);
  });

  it('handles teleporters', () => {
    const level: LevelDefinition = {
      id: 6,
      world: 4,
      name: 'Teleport Test',
      cols: 5,
      rows: 1,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      teleporters: [
        {
          id: 'tp-1',
          posA: { x: 1, y: 0 },
          posB: { x: 3, y: 0 },
        },
      ],
      parMoves: 2,
    };

    const game = new PuzzleGame(level);
    // Step to (1,0), teleports instantly to (3,0)
    const res = game.move({ x: 1, y: 0 });
    expect(res.teleportedTo).toEqual({ x: 3, y: 0 });
    expect(game.player).toEqual({ x: 3, y: 0 });

    // Step to exit (4,0)
    const winRes = game.move({ x: 4, y: 0 });
    expect(winRes.code).toBe('SUCCESS_WIN');
  });

  it('collects stars and toggles switches located on a teleporter destination pad', () => {
    const level: LevelDefinition = {
      id: 7,
      world: 4,
      name: 'Teleport Landing Effects',
      cols: 5,
      rows: 1,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      teleporters: [{ id: 'tp-1', posA: { x: 1, y: 0 }, posB: { x: 3, y: 0 } }],
      stars: [{ x: 3, y: 0 }],
      switches: [{ id: 'g1', switchPos: { x: 3, y: 0 }, doorPos: { x: 2, y: 0 } }],
      parMoves: 2,
    };

    const game = new PuzzleGame(level);
    const res = game.move({ x: 1, y: 0 });
    expect(res.teleportedTo).toEqual({ x: 3, y: 0 });
    expect(res.starCollected).toEqual({ x: 3, y: 0 });
    expect(game.collectedStars.has('3,0')).toBe(true);
    expect(game.openDoors.has('g1')).toBe(true);
  });

  it('computes live-state hints from mid-game positions and detects deadlocks', () => {
    const level: LevelDefinition = {
      id: 8,
      world: 3,
      name: 'Live Hint Test',
      cols: 4,
      rows: 2,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 3, y: 0 },
      sticky: [{ x: 1, y: 0 }],
      parMoves: 3,
    };

    const game = new PuzzleGame(level);
    // Walk down to (0,1) first — hint should solve from (0,1), not from (0,0)
    game.move({ x: 0, y: 1 });
    const midHint = solveFromState(game, 20, 5000);
    expect(midHint.solvable).toBe(true);
    expect(midHint.solutionPath[0]).toEqual({ x: 0, y: 1 });
    expect(midHint.solutionPath[1]).not.toEqual({ x: 0, y: 1 });

    // Trap 1 of 1 tiles on sticky cell to create a deadlocked state
    const deadlockLevel: LevelDefinition = {
      id: 9,
      world: 3,
      name: 'Deadlock Test',
      cols: 4,
      rows: 1,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 3, y: 0 },
      sticky: [{ x: 1, y: 0 }],
      parMoves: 3,
    };
    const stuckGame = new PuzzleGame(deadlockLevel);
    stuckGame.move({ x: 1, y: 0 });
    // Standing on (1,0) with 0 tiles left in inventory — cannot advance to void (2,0)
    // and going back to (0,0) traps the only tile on (1,0), leaving 0 tiles forever.
    stuckGame.move({ x: 0, y: 0 });
    expect(stuckGame.inventory).toBe(0);
    const deadResult = solveFromState(stuckGame, 15, 2000);
    expect(deadResult.solvable).toBe(false);
  });

  it('restores stars, crumbling tiles, trapped tiles, and doors on undo and restart', () => {
    const level: LevelDefinition = {
      id: 10,
      world: 5,
      name: 'Undo Integrity Test',
      cols: 5,
      rows: 1,
      maxTiles: 3,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      crumbling: [{ x: 1, y: 0 }],
      sticky: [{ x: 2, y: 0 }],
      stars: [{ x: 1, y: 0 }],
      parMoves: 4,
    };

    const game = new PuzzleGame(level);
    game.move({ x: 1, y: 0 }); // Collect star on crumbling cell
    expect(game.collectedStars.has('1,0')).toBe(true);

    game.move({ x: 2, y: 0 }); // (1,0) crumbles
    expect(game.crumbled.has('1,0')).toBe(true);

    game.move({ x: 3, y: 0 }); // (2,0) traps tile
    expect(game.trapped.has('2,0')).toBe(true);

    // Undo step 3 -> trapped cleared
    game.undo();
    expect(game.trapped.has('2,0')).toBe(false);
    expect(game.tiles.has('2,0')).toBe(true);

    // Undo step 2 -> crumbled cleared
    game.undo();
    expect(game.crumbled.has('1,0')).toBe(false);
    expect(game.collectedStars.has('1,0')).toBe(true);

    // Restart -> everything cleanly reset
    game.restart();
    expect(game.moves).toBe(0);
    expect(game.collectedStars.size).toBe(0);
    expect(game.crumbled.size).toBe(0);
    expect(game.trapped.size).toBe(0);
    expect(game.tiles.size).toBe(0);
    expect(game.inventory).toBe(3);
  });

  it('enforces one-way exit rules and requires all stars before winning', () => {
    const level: LevelDefinition = {
      id: 11,
      world: 3,
      name: 'One-Way & Star Gate',
      cols: 3,
      rows: 2,
      maxTiles: 3,
      start: { x: 0, y: 0 },
      exit: { x: 2, y: 0 },
      fixed: [{ x: 1, y: 0 }],
      oneWay: [{ x: 1, y: 0, direction: 'right' }],
      stars: [{ x: 0, y: 1 }],
      parMoves: 5,
    };

    const game = new PuzzleGame(level);
    game.move({ x: 1, y: 0 });

    // One-way right blocks going left or down
    expect(game.canMoveTo({ x: 0, y: 0 }).allowed).toBe(false);
    expect(game.canMoveTo({ x: 1, y: 1 }).allowed).toBe(false);

    // Moving right onto exit without star succeeds as a move, does NOT win, and returns clear message
    const exitRes = game.move({ x: 2, y: 0 });
    expect(exitRes.success).toBe(true);
    expect(exitRes.code).toBe('SUCCESS');
    expect(game.status).toBe('playing');
    expect(exitRes.message).toContain('Collect all 1 stars');
  });

  it('glides smoothly across ice tiles and stops before void or rocks', () => {
    const level: LevelDefinition = {
      id: 12,
      world: 6,
      name: 'Ice Glide Test',
      cols: 6,
      rows: 1,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 5, y: 0 },
      ice: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
      fixed: [{ x: 4, y: 0 }],
      stars: [{ x: 2, y: 0 }],
      parMoves: 2,
    };

    const game = new PuzzleGame(level);
    // Single step onto (1,0) ice slides through (2,0) collecting star, across (3,0), and stops on solid (4,0)!
    const res = game.move({ x: 1, y: 0 });
    expect(res.success).toBe(true);
    expect(res.slidePath).toEqual([
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ]);
    expect(game.player).toEqual({ x: 4, y: 0 });
    expect(game.collectedStars.has('2,0')).toBe(true);

    // Step to exit (5,0) wins in 2 moves total
    const winRes = game.move({ x: 5, y: 0 });
    expect(winRes.code).toBe('SUCCESS_WIN');
    expect(game.moves).toBe(2);
  });

  it('expands maxTiles capacity with +1 bonus tile pickups and restores on undo', () => {
    const level: LevelDefinition = {
      id: 13,
      world: 6,
      name: 'Bonus Tile Test',
      cols: 5,
      rows: 1,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      fixed: [{ x: 1, y: 0 }],
      bonusTiles: [{ x: 1, y: 0 }],
      parMoves: 4,
    };

    const game = new PuzzleGame(level);
    expect(game.currentMaxTiles).toBe(1);
    expect(game.inventory).toBe(1);

    // Step onto (1,0) to collect +1 bonus tile
    const pickupRes = game.move({ x: 1, y: 0 });
    expect(pickupRes.bonusTileCollected).toEqual({ x: 1, y: 0 });
    expect(game.currentMaxTiles).toBe(2);
    expect(game.inventory).toBe(2);

    // Now we can cross the 2-void-tile chasm (2,0) & (3,0) to reach exit (4,0)!
    expect(solveLevel(level).solvable).toBe(true);

    // Undo restores maxTiles back to 1
    game.undo();
    expect(game.currentMaxTiles).toBe(1);
    expect(game.inventory).toBe(1);
    expect(game.collectedBonusTiles.size).toBe(0);
  });

  it('handles timed switches with countdown expiry, standing safety, and undo restoration', () => {
    const level: LevelDefinition = {
      id: 14,
      world: 7,
      name: 'Timed Gate Test',
      cols: 5,
      rows: 2,
      maxTiles: 3,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      switches: [
        {
          id: 'g1',
          switchPos: { x: 1, y: 0 },
          doorPos: { x: 3, y: 0 },
          timedDuration: 2,
        },
      ],
      rocks: [{ x: 3, y: 1 }],
      parMoves: 4,
    };

    const game = new PuzzleGame(level);
    expect(game.openDoors.has('g1')).toBe(false);

    // Step onto timed switch (1,0) -> gate opens with timer = 2
    game.move({ x: 1, y: 0 });
    expect(game.openDoors.has('g1')).toBe(true);
    expect(game.doorTimers.get('g1')).toBe(2);

    // Move 1 away to (2,0) -> timer ticks down to 1, gate still open
    game.move({ x: 2, y: 0 });
    expect(game.openDoors.has('g1')).toBe(true);
    expect(game.doorTimers.get('g1')).toBe(1);

    // Detour down to (2,1) instead of entering gate -> timer hits 0 and gate snaps shut!
    game.move({ x: 2, y: 1 });
    expect(game.openDoors.has('g1')).toBe(false);
    expect(game.doorTimers.has('g1')).toBe(false);

    // Undo brings gate back open with timer = 1
    game.undo();
    expect(game.openDoors.has('g1')).toBe(true);
    expect(game.doorTimers.get('g1')).toBe(1);

    // Stepping onto gate (3,0) on last tick succeeds and stays open while standing on it
    const onGate = game.move({ x: 3, y: 0 });
    expect(onGate.success).toBe(true);
    expect(game.openDoors.has('g1')).toBe(true);

    // Stepping off gate onto exit (4,0) closes gate behind Puff and wins!
    const winRes = game.move({ x: 4, y: 0 });
    expect(winRes.code).toBe('SUCCESS_WIN');
    expect(game.openDoors.has('g1')).toBe(false);
  });

  it('pushes crates across solid ground and ice onto weighted hold-plates and restores on undo', () => {
    const level: LevelDefinition = {
      id: 15,
      world: 8,
      name: 'Crate & Weighted Plate Test',
      cols: 6,
      rows: 3,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 1, y: 2 },
      fixed: [{ x: 1, y: 0 }],
      crates: [{ x: 1, y: 0 }],
      ice: [{ x: 2, y: 0 }, { x: 3, y: 0 }],
      rocks: [{ x: 0, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }],
      switches: [
        {
          id: 'g1',
          switchPos: { x: 4, y: 0 },
          doorPos: { x: 1, y: 1 },
          holdSwitch: true,
        },
      ],
      parMoves: 3,
    };

    const game = new PuzzleGame(level);
    expect(game.openDoors.has('g1')).toBe(false);

    // Push crate at (1,0) right onto ice (2,0)-(3,0) -> glides onto weighted plate (4,0) and opens gate!
    const pushRes = game.move({ x: 1, y: 0 });
    expect(pushRes.success).toBe(true);
    expect(pushRes.pushedCrate).toEqual({ from: { x: 1, y: 0 }, to: { x: 4, y: 0 } });
    expect(game.crates.has('4,0')).toBe(true);
    expect(game.openDoors.has('g1')).toBe(true);

    // Undo restores crate to (1,0) and closes weighted gate
    game.undo();
    expect(game.crates.has('1,0')).toBe(true);
    expect(game.crates.has('4,0')).toBe(false);
    expect(game.openDoors.has('g1')).toBe(false);

    // Re-push and walk straight through open gate (1,1) to exit (1,2)
    game.move({ x: 1, y: 0 });
    expect(game.move({ x: 1, y: 1 }).success).toBe(true);
    expect(game.move({ x: 1, y: 2 }).code).toBe('SUCCESS_WIN');
  });

  it('vaults 2 tiles over rocks via Springboards, chains consecutive springs, lands on void, and restores on undo', () => {
    const level: LevelDefinition = {
      id: 16,
      world: 9,
      name: 'Springboard Chain Test',
      cols: 6,
      rows: 2,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 5, y: 0 },
      springs: [
        { x: 1, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 1 },
      ],
      rocks: [
        { x: 2, y: 0 },
        { x: 4, y: 0 },
        { x: 2, y: 1 }, // blocks landing when approaching (0,1) from left—wait from top (0,0)->(0,1) lands out of bounds!
      ],
      parMoves: 1,
    };

    const game = new PuzzleGame(level);

    // Stepping south onto (0,1) would land at (0,3) out of bounds -> blocked with ERR_SPRING_BLOCKED
    const blocked = game.move({ x: 0, y: 1 });
    expect(blocked.success).toBe(false);
    expect(blocked.code).toBe('ERR_SPRING_BLOCKED');

    // Stepping right onto (1,0) vaults over rock (2,0) onto spring (3,0), then chains over rock (4,0) straight onto exit (5,0)!
    const chain = game.move({ x: 1, y: 0 });
    expect(chain.success).toBe(true);
    expect(chain.code).toBe('SUCCESS_WIN');
    expect(chain.springPath).toEqual([
      { x: 3, y: 0 },
      { x: 5, y: 0 },
    ]);
    expect(game.player).toEqual({ x: 5, y: 0 });

    // Undo cleanly returns to start
    game.undo();
    expect(game.player).toEqual({ x: 0, y: 0 });
    expect(game.status).toBe('playing');

    // Also verify landing from a Springboard onto void consumes 1 bridge tile
    const voidSpringLevel: LevelDefinition = {
      id: 17,
      world: 9,
      name: 'Void Spring Landing',
      cols: 5,
      rows: 1,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 4, y: 0 },
      springs: [{ x: 1, y: 0 }],
      rocks: [{ x: 2, y: 0 }],
      parMoves: 2,
    };
    const g2 = new PuzzleGame(voidSpringLevel);
    const hop = g2.move({ x: 1, y: 0 });
    expect(hop.success).toBe(true);
    expect(g2.player).toEqual({ x: 3, y: 0 });
    expect(g2.tiles.has('3,0')).toBe(true);
    expect(g2.inventory).toBe(0);
    expect(g2.move({ x: 4, y: 0 }).code).toBe('SUCCESS_WIN');
  });
});
