import { Coordinate, LevelDefinition } from './types';
import { PuzzleGame } from './logic';

export interface SolverResult {
  solvable: boolean;
  minMoves: number;
  solutionPath: Coordinate[];
  statesExplored: number;
}

function encodeGameState(game: PuzzleGame): string {
  const p = `${game.player.x},${game.player.y}`;
  const t = Array.from(game.tiles).sort().join(';');
  const tr = Array.from(game.trapped).sort().join(';');
  const c = Array.from(game.crumbled).sort().join(';');
  const s = Array.from(game.collectedStars).sort().join(';');
  const b = Array.from(game.collectedBonusTiles).sort().join(';');
  const d = Array.from(game.openDoors).sort().join(';');
  const tm = Array.from(game.doorTimers.entries())
    .sort((a, b2) => a[0].localeCompare(b2[0]))
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `${p}|${t}|${tr}|${c}|${s}|${b}|${d}|${tm}`;
}

interface BFSNode {
  game: PuzzleGame;
  path: Coordinate[];
}

/**
 * Solves a puzzle starting from any live PuzzleGame state.
 * Uses an index pointer (O(1) dequeue) and a maxStates budget to stay UI-safe.
 */
export function solveFromState(
  startState: PuzzleGame,
  maxDepth = 40,
  maxStates = 25000
): SolverResult {
  const rootGame = new PuzzleGame(startState.level);
  rootGame.restore(startState.snapshot());

  if (rootGame.status === 'won') {
    return {
      solvable: true,
      minMoves: 0,
      solutionPath: [{ ...rootGame.player }],
      statesExplored: 1,
    };
  }

  const queue: BFSNode[] = [{ game: rootGame, path: [{ ...rootGame.player }] }];
  let head = 0;
  const visited = new Set<string>();
  visited.add(encodeGameState(rootGame));

  let statesExplored = 0;

  while (head < queue.length && statesExplored < maxStates) {
    const { game, path } = queue[head++];
    statesExplored++;

    // path includes starting position, so moves taken from root is path.length - 1
    if (path.length - 1 >= maxDepth) {
      continue;
    }

    const legalMoves = game.getLegalMoves();
    for (const moveTarget of legalMoves) {
      const nextGame = new PuzzleGame(startState.level);
      nextGame.restore(game.snapshot());

      const res = nextGame.move(moveTarget);
      if (!res.success) continue;

      const nextPath = [...path, { ...moveTarget }];

      if (nextGame.status === 'won') {
        return {
          solvable: true,
          minMoves: nextPath.length - 1,
          solutionPath: nextPath,
          statesExplored,
        };
      }

      const hash = encodeGameState(nextGame);
      if (!visited.has(hash)) {
        visited.add(hash);
        queue.push({
          game: nextGame,
          path: nextPath,
        });
      }
    }
  }

  return {
    solvable: false,
    minMoves: -1,
    solutionPath: [],
    statesExplored,
  };
}

export function solveLevel(level: LevelDefinition, maxDepth = 40): SolverResult {
  const initialGame = new PuzzleGame(level);
  return solveFromState(initialGame, maxDepth);
}
