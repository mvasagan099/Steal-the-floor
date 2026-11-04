import { describe, it, expect } from 'vitest';
import { PuzzleGame } from '../src/engine/logic';
import { solveLevel } from '../src/engine/solver';
import { LevelDefinition } from '../src/engine/types';

describe('PuzzleGame Engine Mechanics', () => {
  it('handles basic movement, tile placement, and tile recovery', () => {
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

    // Step 1: move from (0,0) to empty (1,0)
    // Places a bridge tile at (1,0). (0,0) was fixed start, so nothing recovered.
    const res1 = game.move({ x: 1, y: 0 });
    expect(res1.success).toBe(true);
    expect(game.inventory).toBe(1); // 1 bridge placed
    expect(game.tiles.has('1,0')).toBe(true);

    // Step 2: move from (1,0) to empty (2,0)
    // Places a bridge tile at (2,0). Previous tile at (1,0) is recovered!
    const res2 = game.move({ x: 2, y: 0 });
    expect(res2.success).toBe(true);
    expect(res2.recoveredTile).toEqual({ x: 1, y: 0 });
    expect(game.tiles.has('1,0')).toBe(false);
    expect(game.tiles.has('2,0')).toBe(true);
    expect(game.inventory).toBe(1); // Still 1 available!

    // Step 3: move to exit (3,0)
    const res3 = game.move({ x: 3, y: 0 });
    expect(res3.success).toBe(true);
    expect(res3.code).toBe('SUCCESS_WIN');
    expect(game.status).toBe('won');
    expect(game.inventory).toBe(2); // All tiles back in inventory
  });

  it('traps bridge tile on sticky floor', () => {
    const level: LevelDefinition = {
      id: 2,
      world: 1,
      name: 'Sticky Test',
      cols: 4,
      rows: 1,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 3, y: 0 },
      sticky: [{ x: 1, y: 0 }],
      parMoves: 3,
    };

    const game = new PuzzleGame(level);
    game.move({ x: 1, y: 0 }); // Step onto sticky cell (bridge placed)
    expect(game.inventory).toBe(1);

    game.move({ x: 2, y: 0 }); // Step onto (2,0)
    // Previous tile at (1,0) is trapped!
    expect(game.trapped.has('1,0')).toBe(true);
    expect(game.tiles.has('1,0')).toBe(false);
    // Inventory is now 0 because 1 is trapped and 1 is at (2,0)!
    expect(game.inventory).toBe(0);
  });

  it('solves simple puzzle via BFS solver', () => {
    const level: LevelDefinition = {
      id: 3,
      world: 1,
      name: 'BFS Solver Test',
      cols: 3,
      rows: 3,
      maxTiles: 2,
      start: { x: 0, y: 0 },
      exit: { x: 2, y: 2 },
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
});
