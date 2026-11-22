import { LevelDefinition } from '../engine/types';
import { generateEndlessStage } from './endlessMode';

export interface StudioBlueprint {
  id: string;
  label: string;
  icon: string;
  level: LevelDefinition;
}

export const STUDIO_BLUEPRINTS: StudioBlueprint[] = [
  {
    id: 'bp-spring',
    label: 'Spring Vault',
    icon: '🦘',
    level: {
      id: 31001,
      world: 0,
      name: 'Spring Vault',
      cols: 6,
      rows: 7,
      maxTiles: 2,
      start: { x: 0, y: 1 },
      exit: { x: 5, y: 5 },
      fixed: [
        { x: 3, y: 1 },
        { x: 3, y: 5 },
      ],
      springs: [
        { x: 1, y: 1 },
        { x: 3, y: 3 },
      ],
      rocks: [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 },
      ],
      stars: [{ x: 3, y: 1 }],
      parMoves: 7,
      hint: 'Bounce over the granite wall, grab the gem, then vault south to the flag!',
    },
  },
  {
    id: 'bp-crate',
    label: 'Crate Hold',
    icon: '📦',
    level: {
      id: 31002,
      world: 0,
      name: 'Sanctum Crate Hold',
      cols: 6,
      rows: 7,
      maxTiles: 2,
      start: { x: 1, y: 1 },
      exit: { x: 3, y: 6 },
      fixed: [
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
      ],
      crates: [{ x: 2, y: 1 }],
      rocks: [
        { x: 0, y: 5 },
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
      ],
      switches: [
        {
          id: 'g1',
          switchPos: { x: 3, y: 1 },
          doorPos: { x: 3, y: 5 },
          holdSwitch: true,
        },
      ],
      stars: [{ x: 1, y: 3 }],
      parMoves: 9,
      hint: 'Shove the crate onto the weighted plate to hold the exit gate open!',
    },
  },
  {
    id: 'bp-vault',
    label: 'Vault Heist',
    icon: '🔑',
    level: {
      id: 31003,
      world: 0,
      name: 'Vault Heist',
      cols: 6,
      rows: 7,
      maxTiles: 2,
      start: { x: 0, y: 3 },
      exit: { x: 5, y: 3 },
      fixed: [
        { x: 1, y: 1 },
        { x: 1, y: 5 },
        { x: 4, y: 3 },
      ],
      keys: [{ x: 1, y: 1 }],
      locks: [{ x: 3, y: 3 }],
      rocks: [
        { x: 3, y: 0 },
        { x: 3, y: 1 },
        { x: 3, y: 2 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 3, y: 6 },
      ],
      stars: [{ x: 1, y: 5 }],
      parMoves: 11,
      hint: 'Collect the gem and golden key, then unlock the sealed vault into solid ground!',
    },
  },
  {
    id: 'bp-ice',
    label: 'Frozen Spark',
    icon: '❄️',
    level: {
      id: 31004,
      world: 0,
      name: 'Frozen Spark',
      cols: 6,
      rows: 7,
      maxTiles: 1,
      start: { x: 0, y: 0 },
      exit: { x: 5, y: 6 },
      fixed: [
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 3, y: 5 },
      ],
      ice: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 1 },
        { x: 4, y: 2 },
      ],
      bonusTiles: [{ x: 4, y: 3 }],
      stars: [{ x: 4, y: 0 }],
      parMoves: 8,
      hint: 'Glide across the frozen runway and grab the +1 Bonus Tile to bridge the final chasm!',
    },
  },
];

/**
 * Generates a fresh 6x7 solver-verified puzzle formatted cleanly for Builder Studio.
 */
export function generateStudioRandomLevel(seed = Date.now() % 1000000): LevelDefinition {
  const stage = 2 + (Math.abs(seed) % 6);
  const generated = generateEndlessStage(stage, seed);
  return {
    ...generated,
    id: 32000 + (Math.abs(seed) % 9000),
    world: 0,
    name: `Studio Mix #${Math.abs(seed) % 999}`,
    cols: 6,
    rows: 7,
  };
}
