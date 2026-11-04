import { Coordinate, LevelDefinition } from './types';
import { PuzzleGame, coordToKey } from './logic';

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
  const d = Array.from(game.openDoors).sort().join(';');
  return `${p}|${t}|${tr}|${c}|${s}|${d}`;
}

interface BFSNode {
  game: PuzzleGame;
  path: Coordinate[];
}

export function solveLevel(level: LevelDefinition, maxDepth = 40): SolverResult {
  const initialGame = new PuzzleGame(level);
  const queue: BFSNode[] = [{ game: initialGame, path: [{ ...level.start }] }];
  const visited = new Set<string>();

  const startHash = encodeGameState(initialGame);
  visited.add(startHash);

  let statesExplored = 0;

  while (queue.length > 0) {
    const { game, path } = queue.shift()!;
    statesExplored++;

    if (game.status === 'won') {
      return {
        solvable: true,
        minMoves: game.moves,
        solutionPath: path,
        statesExplored,
      };
    }

    if (path.length > maxDepth) {
      continue;
    }

    const legalMoves = game.getLegalMoves();
    for (const moveTarget of legalMoves) {
      // Clone game state to simulate branch
      const nextGame = new PuzzleGame(level);
      nextGame.restore(game.snapshot());

      const res = nextGame.move(moveTarget);
      if (!res.success) continue;

      if (nextGame.status === 'won') {
        return {
          solvable: true,
          minMoves: nextGame.moves,
          solutionPath: [...path, { ...moveTarget }],
          statesExplored,
        };
      }

      const hash = encodeGameState(nextGame);
      if (!visited.has(hash)) {
        visited.add(hash);
        queue.push({
          game: nextGame,
          path: [...path, { ...moveTarget }],
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
