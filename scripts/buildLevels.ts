import * as fs from 'fs';
import * as path from 'path';
import {
  LevelDefinition,
  Coordinate,
  OneWayTile,
  ConveyorTile,
  SwitchDoorPair,
  TeleporterPair,
  PhaseTile,
} from '../src/engine/types';
import { PuzzleGame } from '../src/engine/logic';
import { solveLevel } from '../src/engine/solver';

interface GridLevelInput {
  id: number;
  world: number;
  name: string;
  maxTiles: number;
  /**
   * Compact ASCII map (6x7):
   *  . = void
   *  S = start island
   *  E = exit island
   *  # = fixed island
   *  X = rock wall
   *  H = sticky honey (void that traps placed bridge tile permanently)
   *  C = crumbling stone (one-use solid reclaim island)
   *  I = ice sliding platform (glides across consecutive walkable tiles)
   *  J = golden springboard (vaults 2 tiles forward)
   *  K = fixed island with a Golden Key
   *  L = locked vault (unlocks into solid ground with a Golden Key)
   *  P = Cyan Even Phase Tile (solid when 0/2/4 bridge tiles placed)
   *  Q = Magenta Odd Phase Tile (solid when 1/3/5 bridge tiles placed)
   *  u d l r = Aether Conveyor Belt (up, down, left, right — carries Puff & Crates)
   *  + = fixed island containing a +1 Bonus Tile pickup
   *  M = fixed island with a pushable crate
   *  ^ v < > = one-way arrow platform
   *  a / A = switch 'g1' / closed door 'g1' (O = initially open door 'g1')
   *  b / B = switch 'g2' / closed door 'g2'
   *  1 / 2 = teleporter pair 'tp-1' / 'tp-2'
   *  * = void cell containing a gem
   */
  grid: string[];
  /** Extra gems placed on islands, switches, portals, crumbling tiles, etc. */
  stars?: Coordinate[];
  /** Extra bonus tile (+1 maxTiles) coordinates */
  bonusTiles?: Coordinate[];
  /** Optional countdown durations for timed switches (e.g. { g1: 4 }) */
  timedDurations?: Record<string, number>;
  /** Switch IDs that act as weighted hold-plates (require a crate or Puff to stay open) */
  holdSwitches?: string[];
  hint: string;
}

function parseGridLevel(input: GridLevelInput): LevelDefinition {
  const rows = input.grid.length;
  const cols = input.grid[0].length;

  let start: Coordinate | null = null;
  let exit: Coordinate | null = null;
  const fixed: Coordinate[] = [];
  const rocks: Coordinate[] = [];
  const sticky: Coordinate[] = [];
  const crumbling: Coordinate[] = [];
  const ice: Coordinate[] = [];
  const springs: Coordinate[] = [];
  const keys: Coordinate[] = [];
  const locks: Coordinate[] = [];
  const phaseTiles: PhaseTile[] = [];
  const conveyors: ConveyorTile[] = [];
  const bonusTiles: Coordinate[] = [...(input.bonusTiles || [])];
  const crates: Coordinate[] = [];
  const oneWay: OneWayTile[] = [];
  const stars: Coordinate[] = [...(input.stars || [])];

  const switchPositions: Record<string, Coordinate> = {};
  const doorPositions: Record<string, { pos: Coordinate; initiallyOpen?: boolean }> = {};
  const teleporterPads: Record<string, Coordinate[]> = {};

  for (let y = 0; y < rows; y++) {
    const line = input.grid[y];
    if (line.length !== cols) {
      throw new Error(`Level ${input.id} row ${y} has length ${line.length}, expected ${cols}`);
    }
    for (let x = 0; x < cols; x++) {
      const ch = line[x];
      const coord = { x, y };
      switch (ch) {
        case '.':
          break;
        case 'S':
          start = coord;
          break;
        case 'E':
          exit = coord;
          break;
        case '#':
          fixed.push(coord);
          break;
        case 'X':
          rocks.push(coord);
          break;
        case 'H':
          sticky.push(coord);
          break;
        case 'C':
          crumbling.push(coord);
          break;
        case 'I':
          ice.push(coord);
          break;
        case 'J':
          springs.push(coord);
          break;
        case 'K':
          fixed.push(coord);
          keys.push(coord);
          break;
        case 'L':
          locks.push(coord);
          break;
        case 'P':
          phaseTiles.push({ x, y, polarity: 'even' });
          break;
        case 'Q':
          phaseTiles.push({ x, y, polarity: 'odd' });
          break;
        case 'u':
          conveyors.push({ x, y, direction: 'up' });
          break;
        case 'd':
          conveyors.push({ x, y, direction: 'down' });
          break;
        case 'l':
          conveyors.push({ x, y, direction: 'left' });
          break;
        case 'r':
          conveyors.push({ x, y, direction: 'right' });
          break;
        case '+':
          fixed.push(coord);
          bonusTiles.push(coord);
          break;
        case 'M':
          fixed.push(coord);
          crates.push(coord);
          break;
        case '^':
          oneWay.push({ x, y, direction: 'up' });
          break;
        case 'v':
          oneWay.push({ x, y, direction: 'down' });
          break;
        case '<':
          oneWay.push({ x, y, direction: 'left' });
          break;
        case '>':
          oneWay.push({ x, y, direction: 'right' });
          break;
        case '*':
          stars.push(coord);
          break;
        case 'a':
          switchPositions['g1'] = coord;
          break;
        case 'A':
          doorPositions['g1'] = { pos: coord, initiallyOpen: false };
          break;
        case 'O':
          doorPositions['g1'] = { pos: coord, initiallyOpen: true };
          break;
        case 'b':
          switchPositions['g2'] = coord;
          break;
        case 'B':
          doorPositions['g2'] = { pos: coord, initiallyOpen: false };
          break;
        case '1':
          teleporterPads['tp-1'] = teleporterPads['tp-1'] || [];
          teleporterPads['tp-1'].push(coord);
          break;
        case '2':
          teleporterPads['tp-2'] = teleporterPads['tp-2'] || [];
          teleporterPads['tp-2'].push(coord);
          break;
        default:
          throw new Error(`Unknown grid symbol '${ch}' in Level ${input.id} at (${x},${y})`);
      }
    }
  }

  if (!start || !exit) {
    throw new Error(`Level ${input.id} missing Start (S) or Exit (E)`);
  }

  const holdSet = new Set(input.holdSwitches || []);
  const switches: SwitchDoorPair[] = [];
  for (const id of Object.keys(switchPositions)) {
    const door = doorPositions[id];
    if (!door) throw new Error(`Level ${input.id} switch '${id}' missing matching door`);
    const timedDuration = input.timedDurations?.[id];
    const isHold = holdSet.has(id);
    switches.push({
      id,
      switchPos: switchPositions[id],
      doorPos: door.pos,
      ...(door.initiallyOpen ? { doorInitiallyOpen: true } : {}),
      ...(timedDuration ? { timedDuration } : {}),
      ...(isHold ? { holdSwitch: true } : {}),
    });
  }

  const teleporters: TeleporterPair[] = [];
  for (const id of Object.keys(teleporterPads)) {
    const pads = teleporterPads[id];
    if (pads.length !== 2) {
      throw new Error(`Level ${input.id} teleporter '${id}' must have 2 pads, found ${pads.length}`);
    }
    teleporters.push({ id, posA: pads[0], posB: pads[1] });
  }

  const level: LevelDefinition = {
    id: input.id,
    world: input.world,
    name: input.name,
    cols,
    rows,
    maxTiles: input.maxTiles,
    start,
    exit,
    parMoves: 0,
    hint: input.hint,
  };

  if (fixed.length) level.fixed = fixed;
  if (rocks.length) level.rocks = rocks;
  if (sticky.length) level.sticky = sticky;
  if (crumbling.length) level.crumbling = crumbling;
  if (ice.length) level.ice = ice;
  if (springs.length) level.springs = springs;
  if (keys.length) level.keys = keys;
  if (locks.length) level.locks = locks;
  if (phaseTiles.length) level.phaseTiles = phaseTiles;
  if (conveyors.length) level.conveyors = conveyors;
  if (bonusTiles.length) level.bonusTiles = bonusTiles;
  if (crates.length) level.crates = crates;
  if (oneWay.length) level.oneWay = oneWay;
  if (switches.length) level.switches = switches;
  if (teleporters.length) level.teleporters = teleporters;
  if (stars.length) level.stars = stars;

  return level;
}

const drafts: GridLevelInput[] = [
  // =========================================================================
  // WORLD 1: FIRST STEPS (Levels 1 - 20)
  // Core loop: maxTiles reach (Manhattan <= maxTiles+1), solid-ground reclaim, stars
  // =========================================================================
  {
    id: 1, world: 1, name: 'First Steps', maxTiles: 2,
    grid: [
      '......',
      '..S...',
      '......',
      '..#...',
      '......',
      '..E...',
      '......',
    ],
    hint: 'Step into the void to drop bridge tiles. Reach the island to reclaim them!',
  },
  {
    id: 2, world: 1, name: 'Bridge & Reclaim', maxTiles: 2,
    grid: [
      '......',
      '......',
      'S..#..',
      '......',
      '...#..',
      '......',
      '...E..',
    ],
    hint: 'With 2 tiles you can cross 2 void squares before needing a solid island.',
  },
  {
    id: 3, world: 1, name: 'Island Detour', maxTiles: 2,
    grid: [
      '......',
      '.S....',
      '...#..',
      '......',
      '.#....',
      '......',
      '...E..',
    ],
    hint: 'The direct route is too wide! Hop between islands to recharge your tiles.',
  },
  {
    id: 4, world: 1, name: 'First Star', maxTiles: 2,
    grid: [
      '......',
      '....E.',
      '..#...',
      '...*..',
      '..#...',
      '.S....',
      '......',
    ],
    hint: 'Grab the star between the central islands before heading to the exit!',
  },
  {
    id: 5, world: 1, name: 'Stepping Stones', maxTiles: 1,
    grid: [
      '......',
      '.S.#..',
      '......',
      '...#.#',
      '......',
      '.#.#..',
      '.E....',
    ],
    hint: 'Only 1 tile! Every void step must land right onto the next island.',
  },
  {
    id: 6, world: 1, name: 'Twin Wings', maxTiles: 2,
    grid: [
      '......',
      '..S...',
      '......',
      '#..#..',
      '......',
      '..#..E',
      '......',
    ],
    stars: [{ x: 0, y: 3 }],
    hint: 'Swing west to grab the star, recharge on the island, then cross east.',
  },
  {
    id: 7, world: 1, name: 'Diagonal Hop', maxTiles: 2,
    grid: [
      'S.....',
      '..#...',
      '......',
      '...#..',
      '.....#',
      '......',
      '.....E',
    ],
    stars: [{ x: 2, y: 1 }, { x: 3, y: 3 }],
    hint: 'Use the stepping islands diagonally so your 2 tiles never run dry.',
  },
  {
    id: 8, world: 1, name: 'Star Arch', maxTiles: 2,
    grid: [
      '..*...',
      '.#..#.',
      '......',
      'S....E',
      '..#...',
      '......',
      '......',
    ],
    hint: 'Climb over the northern arch to collect the star before landing on the exit.',
  },
  {
    id: 9, world: 1, name: 'Zigzag Lagoon', maxTiles: 2,
    grid: [
      'S..#..',
      '.....#',
      '......',
      '...#..',
      '#.....',
      '..#...',
      '.....E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Weave across the archipelago to collect the western star.',
  },
  {
    id: 10, world: 1, name: 'The Spiral', maxTiles: 2,
    grid: [
      'S..#..',
      '......',
      '..E..#',
      '......',
      '.#....',
      '.....#',
      '..#...',
    ],
    stars: [{ x: 5, y: 5 }],
    hint: 'Loop clockwise around the outer islands to grab the star and enter the center.',
  },
  {
    id: 11, world: 1, name: 'One-Tile Tightrope', maxTiles: 1,
    grid: [
      'S.#...',
      '......',
      '..#.#.',
      '......',
      '....#.',
      '......',
      '..#.#E',
    ],
    stars: [{ x: 4, y: 2 }, { x: 2, y: 6 }],
    hint: 'With 1 tile, each gap can be at most 1 square wide. Plan your star order!',
  },
  {
    id: 12, world: 1, name: 'Out and Back', maxTiles: 3,
    grid: [
      '..*...',
      '......',
      '..#...',
      '......',
      'S....E',
      '......',
      '......',
    ],
    hint: 'Venture north into the void to snag the star, then walk back onto your laid bridge!',
  },
  {
    id: 13, world: 1, name: 'Forked Isles', maxTiles: 2,
    grid: [
      '..E...',
      '......',
      '#..#.#' ,
      '......',
      '..#...',
      '......',
      '..S...',
    ],
    stars: [{ x: 0, y: 2 }, { x: 5, y: 2 }],
    hint: 'From the central hub, visit both outer islands to collect both stars.',
  },
  {
    id: 14, world: 1, name: 'Three-Tile Chasm', maxTiles: 3,
    grid: [
      'S.....',
      '......',
      '..#...',
      '......',
      '....#.',
      '......',
      '.#...E',
    ],
    stars: [{ x: 4, y: 4 }, { x: 1, y: 6 }],
    hint: 'With 3 tiles you can cross 3 void cells at once—stretch every single bridge!',
  },
  {
    id: 15, world: 1, name: 'Diamond Archipelago', maxTiles: 2,
    grid: [
      '..S...',
      '......',
      '#.#..#',
      '......',
      '#..#.#',
      '......',
      '..E...',
    ],
    stars: [{ x: 0, y: 2 }, { x: 5, y: 4 }],
    hint: 'Use the twin central islands to reach opposite wings of the diamond.',
  },
  {
    id: 16, world: 1, name: 'Northern Outpost', maxTiles: 2,
    grid: [
      '.#..#.',
      '......',
      '.#..#.',
      '......',
      'S..#..',
      '......',
      '....#E',
    ],
    stars: [{ x: 1, y: 0 }, { x: 4, y: 0 }],
    hint: 'Climb to both northern outposts before descending to the exit.',
  },
  {
    id: 17, world: 1, name: 'Corner Harvest', maxTiles: 2,
    grid: [
      '#..#.#',
      '......',
      '..#...',
      '......',
      '..#...',
      '......',
      'S....E',
    ],
    stars: [{ x: 0, y: 0 }, { x: 5, y: 0 }],
    hint: 'Scale the central pillars to reach both top corners.',
  },
  {
    id: 18, world: 1, name: 'Minimalist Run', maxTiles: 1,
    grid: [
      '.#.#..',
      '......',
      'S#.#.#',
      '......',
      '.#.#..',
      '......',
      '...#.E',
    ],
    stars: [{ x: 1, y: 0 }, { x: 5, y: 2 }, { x: 1, y: 4 }],
    hint: 'One tile only! Chart an island chain that collects all three stars.',
  },
  {
    id: 19, world: 1, name: 'Starlight Crossroads', maxTiles: 2,
    grid: [
      '..#...',
      '......',
      '#..#.#',
      '......',
      'S..#..',
      '......',
      '#..#.E',
    ],
    stars: [{ x: 2, y: 0 }, { x: 0, y: 2 }, { x: 5, y: 2 }, { x: 0, y: 6 }],
    hint: 'Visit every wing around the hub without wasting moves.',
  },
  {
    id: 20, world: 1, name: 'World 1 Graduation', maxTiles: 2,
    grid: [
      '#..#..',
      '......',
      '....#.',
      '.#....',
      '....#.',
      'S..#..',
      '.....E',
    ],
    stars: [{ x: 0, y: 0 }, { x: 4, y: 2 }, { x: 4, y: 4 }],
    hint: 'Prove your mastery of island hopping and tile reclamation!',
  },

  // =========================================================================
  // WORLD 2: THINK AHEAD (Levels 21 - 40)
  // Rocks forming walls, chasms, tight corridors, and multi-route choices
  // =========================================================================
  {
    id: 21, world: 2, name: 'First Boulder', maxTiles: 2,
    grid: [
      '......',
      '..S...',
      '.XXX..',
      '#...#.',
      '.XXX..',
      '..E...',
      '......',
    ],
    hint: 'Rocks block the middle—bridge to a flanking island to get around!',
  },
  {
    id: 22, world: 2, name: 'The Reef Wall', maxTiles: 2,
    grid: [
      '..#...',
      '..X...',
      'S.X.#E',
      '..X...',
      '.#X.#.',
      '......',
      '..#...',
    ],
    hint: 'The reef splits the map. Bridge around the southern tip via the islands!',
  },
  {
    id: 23, world: 2, name: 'Canyon Switchback', maxTiles: 2,
    grid: [
      'S..#..',
      'XXXX.#',
      '.....#',
      '#..XXX',
      '#.....',
      'XXXX.#',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Snake around each canyon wall using the islands at the turns.',
  },
  {
    id: 24, world: 2, name: 'Boulder Pocket', maxTiles: 2,
    grid: [
      'S..#..',
      '.X.X..',
      '#X.#.#',
      '.X.X..',
      '#....#',
      '.XXXX.',
      '..#..E',
    ],
    stars: [{ x: 0, y: 4 }, { x: 5, y: 2 }],
    hint: 'Rock pillars carve narrow lanes—check your tile reach before committing.',
  },
  {
    id: 25, world: 2, name: 'The Horseshoe', maxTiles: 2,
    grid: [
      '.#..#.',
      '......',
      '#XXXX#',
      '.X..X.',
      'S#.EX#',
      '....X.',
      '..#..#',
    ],
    stars: [{ x: 1, y: 0 }],
    hint: 'Loop up and over the horseshoe reef to enter the exit pocket from below!',
  },
  {
    id: 26, world: 2, name: 'Tight Alcove', maxTiles: 3,
    grid: [
      'S.X..#',
      '..X...',
      '.#X..*',
      '..X...',
      '..#..X',
      '....#.',
      '.....E',
    ],
    stars: [],
    hint: 'Cross under the rock divider, recharge on the southern island, then climb north for the star!',
  },
  {
    id: 27, world: 2, name: 'Twin Pillars', maxTiles: 2,
    grid: [
      '.S..#.',
      '.XX...',
      '#...#.',
      '...XX.',
      '.#...#',
      '.XX...',
      '...#E.',
    ],
    stars: [{ x: 0, y: 2 }, { x: 5, y: 4 }],
    hint: 'Weave left and right between staggered stone barriers.',
  },
  {
    id: 28, world: 2, name: 'Stone Courtyard', maxTiles: 2,
    grid: [
      'S.#..#',
      '......',
      '.X..X.',
      '#.*..#',
      '.X..X.',
      '......',
      '#..#.E',
    ],
    stars: [{ x: 5, y: 0 }],
    hint: 'Enter the courtyard from an island edge so you can grab the center star and exit.',
  },
  {
    id: 29, world: 2, name: 'The Breach', maxTiles: 2,
    grid: [
      '.#..#.',
      '..X...',
      'S.X..#',
      '.##...',
      '..X...',
      '.#X.E.',
      '......',
    ],
    stars: [{ x: 1, y: 0 }, { x: 1, y: 5 }],
    hint: 'Collect both western stars before crossing the central breach.',
  },
  {
    id: 30, world: 2, name: 'One-Tile Maze', maxTiles: 1,
    grid: [
      'S.#.X#',
      '.XX.#.',
      '#.#.#.',
      '...XX.',
      '.#..#.',
      '.XX...',
      '#.#.#E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 6 }],
    hint: 'With just 1 tile, every detour around the rocks must hop island-to-island!',
  },
  {
    id: 31, world: 2, name: 'Quarry Crossing', maxTiles: 2,
    grid: [
      '#...#.',
      '.XX...',
      'S..#X.',
      '..X...',
      '.#..#.',
      '...XX.',
      '#...#E',
    ],
    stars: [{ x: 0, y: 0 }, { x: 0, y: 6 }],
    hint: 'Harvest both left corners while navigating the quarry walls.',
  },
  {
    id: 32, world: 2, name: 'S-Curve Gorge', maxTiles: 2,
    grid: [
      'S..#.#',
      'XXXX..',
      '.#..##',
      '#..XXX',
      '#...#.',
      'XXXX..',
      '...##E',
    ],
    stars: [{ x: 1, y: 2 }, { x: 0, y: 4 }],
    hint: 'Follow the winding S-curve gorge and pick up both alcove stars.',
  },
  {
    id: 33, world: 2, name: 'Fortress Moat', maxTiles: 2,
    grid: [
      'S..#.#',
      '.XXXX.',
      '#X..X#',
      '.X#EX.',
      '#X..X#',
      '.XX.X.',
      '.#.#..',
    ],
    stars: [{ x: 5, y: 0 }, { x: 1, y: 6 }],
    hint: 'Circle the fortress moat to find the southern gate into the inner keep.',
  },
  {
    id: 34, world: 2, name: 'Three-Way Divide', maxTiles: 2,
    grid: [
      '#..X.#',
      '...X..',
      '.#.X.#',
      'S..#..',
      '.#.X.#',
      '...X..',
      '#..X.E',
    ],
    stars: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 6 }],
    hint: 'The single central island connects west and east—sweep the west side first!',
  },
  {
    id: 35, world: 2, name: 'Boulder Spiral', maxTiles: 2,
    grid: [
      'S..#.#',
      '.....X',
      '#XXX.#',
      '.X#E.X',
      '#X.#.#',
      '.#....',
      '..XXXX',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 4 }],
    hint: 'Loop around the outside to enter the inner chamber from below.',
  },
  {
    id: 36, world: 2, name: 'Narrow Pass', maxTiles: 2,
    grid: [
      '.#..#.',
      'XX..XX',
      'S.#...',
      '..XX..',
      '.#..##',
      'XX..XX',
      '..#.E.',
    ],
    stars: [{ x: 1, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 4 }],
    hint: 'Thread through the narrow rock gates to gather all three stars.',
  },
  {
    id: 37, world: 2, name: 'The Vault', maxTiles: 2,
    grid: [
      '#.#X.E',
      '...X..',
      '.#...#',
      'XXXX.#',
      'S..#..',
      '.....#',
      '..#...',
    ],
    stars: [{ x: 0, y: 0 }],
    hint: 'Cross east around the wall, climb into the upper vault, grab the star, and finish!',
  },
  {
    id: 38, world: 2, name: 'Reef Islands', maxTiles: 2,
    grid: [
      'S.#..X',
      '..X..#',
      '#..#..',
      'X..X..',
      '.#...#',
      '..X.X.',
      '#..#.E',
    ],
    stars: [{ x: 5, y: 1 }, { x: 0, y: 6 }],
    hint: 'Every rock forces a specific island step—map both star loops first.',
  },
  {
    id: 39, world: 2, name: 'Double Moat', maxTiles: 2,
    grid: [
      'S..#..',
      '.XXX.#',
      '#....X',
      '.X#..#',
      '.X.XX.',
      '#....#',
      '..X#.E',
    ],
    stars: [{ x: 2, y: 3 }, { x: 0, y: 5 }],
    hint: 'Use the central island as your anchor between both stone moats.',
  },
  {
    id: 40, world: 2, name: 'World 2 Finale', maxTiles: 2,
    grid: [
      '#..#.#',
      '.XX..X',
      'S..#..',
      'X.XX.#',
      '.#...X',
      '..XX.#',
      '#..#.E',
    ],
    stars: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 6 }],
    hint: 'Navigate the entire granite labyrinth with only 2 tiles in hand!',
  },

  // =========================================================================
  // WORLD 3: TRICKY TILES (Levels 41 - 60)
  // Sticky honey hazards/sacrifices, Crumbling 1-use islands, One-way arrows
  // =========================================================================
  {
    id: 41, world: 3, name: 'Honey Trap', maxTiles: 2,
    grid: [
      '......',
      'S.H#..',
      '....X.',
      '.#..X.',
      '...#X.',
      '....XE',
      '...#..',
    ],
    hint: 'Honey traps a tile forever! Detour south around the honey so you keep 2 tiles for the exit.',
  },
  {
    id: 42, world: 3, name: 'Sticky Shortcut', maxTiles: 3,
    grid: [
      '......',
      'S.H..#',
      '..X...',
      '.#X..#',
      '..X...',
      '..#..E',
      '......',
    ],
    stars: [{ x: 5, y: 1 }],
    hint: 'Stepping on honey leaves only 2 tiles—enough to finish if you plan the eastern hops!',
  },
  {
    id: 43, world: 3, name: 'The Weak Beam', maxTiles: 2,
    grid: [
      '......',
      '..S...',
      '......',
      '..C...',
      '......',
      '..E...',
      '......',
    ],
    hint: 'Crumbling stone recharges your tiles once, then shatters behind you!',
  },
  {
    id: 44, world: 3, name: 'One-Way Chute', maxTiles: 2,
    grid: [
      '..E...',
      '......',
      'XX^XX.',
      '......',
      '..#..#',
      '......',
      '..S...',
    ],
    stars: [{ x: 5, y: 4 }],
    hint: 'You can only exit the arrow going UP—grab the star before committing!',
  },
  {
    id: 45, world: 3, name: 'No Turning Back', maxTiles: 2,
    grid: [
      'S..C..',
      'XXXX.#',
      '.....#',
      'XXXX..',
      '#..C..',
      '......',
      'E.....',
    ],
    stars: [{ x: 5, y: 2 }],
    hint: 'Cross the upper crumbling stone, loop east, and return via the lower fragile bridge!',
  },
  {
    id: 46, world: 3, name: 'Sticky Chasm', maxTiles: 3,
    grid: [
      'S.X..E',
      '..X...',
      '#.X..#',
      '..X...',
      '.#H.#.',
      '......',
      '..#...',
    ],
    hint: 'Watch your tile budget: stepping into honey shrinks your reach from 3 down to 2.',
  },
  {
    id: 47, world: 3, name: 'Arrow Loop', maxTiles: 2,
    grid: [
      'S..>..',
      '.....#',
      'X.XX.v',
      '.....#',
      '#..<..',
      '......',
      'E.....',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Ride the clockwise one-way conveyor around the rock core.',
  },
  {
    id: 48, world: 3, name: 'Fragile Star Run', maxTiles: 2,
    grid: [
      'S..C.#',
      '......',
      'XXXX.#',
      '...C..',
      '.#.X..',
      '......',
      'E..#..',
    ],
    stars: [{ x: 5, y: 0 }, { x: 1, y: 4 }],
    hint: 'Each crumbling stone only holds once—route from top-right down to the exit.',
  },
  {
    id: 49, world: 3, name: 'Cross-Bridge Honey', maxTiles: 2,
    grid: [
      '..#...',
      'S.H..#',
      '.XXX..',
      '....#.',
      '.#....',
      '......',
      '..E...',
    ],
    stars: [{ x: 1, y: 4 }],
    hint: 'Take the northern island over the honey so you keep both tiles for the western star!',
  },
  {
    id: 50, world: 3, name: 'Brittle Archipelago', maxTiles: 2,
    grid: [
      'S..C..',
      '.....C',
      '......',
      '..#..#',
      'C.....',
      '......',
      '..#C.E',
    ],
    stars: [{ x: 5, y: 1 }, { x: 0, y: 4 }],
    hint: 'Plan which crumbling stone you break first—once gone, you cannot rest there again!',
  },
  {
    id: 51, world: 3, name: 'Directional Divide', maxTiles: 2,
    grid: [
      '#..#.<',
      '.....#',
      'X.XX.X',
      'S..#.#',
      'X.XX.X',
      '..#...',
      'E..>..',
    ],
    stars: [{ x: 0, y: 0 }],
    hint: 'Ride the upper arrow left to grab the star, then weave back via the center!',
  },
  {
    id: 52, world: 3, name: 'Honey Gauntlet', maxTiles: 2,
    grid: [
      'S.H#..',
      '.#...X',
      '.#H..#',
      '.X.#..',
      '..#..X',
      '......',
      '....#E',
    ],
    stars: [{ x: 5, y: 2 }],
    hint: 'Avoid both honey patches so you keep both tiles intact for the eastern star.',
  },
  {
    id: 53, world: 3, name: 'One-Shot Bridge', maxTiles: 2,
    grid: [
      'S.#..C',
      'XXXX..',
      '#..#.#',
      '#..XXX',
      'C..#..',
      '......',
      '....#E',
    ],
    stars: [{ x: 0, y: 2 }],
    hint: 'Cross the top crumbling stone, grab the west star, then take the lower fragile stone home.',
  },
  {
    id: 54, world: 3, name: 'Arrow Crossroads', maxTiles: 2,
    grid: [
      '.#..#.',
      '......',
      'XXvXX#',
      'S.#>.#',
      'XX^XX.',
      '......',
      '.#..E.',
    ],
    stars: [{ x: 1, y: 0 }, { x: 4, y: 0 }],
    hint: 'Climb the east side to collect both northern stars, then ride the downward chute to exit!',
  },
  {
    id: 55, world: 3, name: 'Honey Cost', maxTiles: 3,
    grid: [
      'S.H..#',
      'X.XX..',
      '#....#',
      'X.XX..',
      '#..H.#',
      '......',
      '.....E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'One sticky crossing is affordable with 3 tiles, but hitting both honey traps leaves you short!',
  },
  {
    id: 56, world: 3, name: 'Crumble & Commit', maxTiles: 2,
    grid: [
      'S..C..',
      '......',
      '.XXvXX',
      '......',
      '#..#.#',
      '......',
      'E..C..',
    ],
    stars: [{ x: 0, y: 4 }, { x: 5, y: 4 }],
    hint: 'Ride the crumbling entry down the one-way chute, sweep both stars, then exit.',
  },
  {
    id: 57, world: 3, name: 'Honey vs Crumble', maxTiles: 2,
    grid: [
      'S.H#.#',
      '.X.X..',
      'C..#..',
      '.X.X..',
      '#..C.#',
      '......',
      '....#E',
    ],
    stars: [{ x: 5, y: 0 }],
    hint: 'Skip the sticky top shortcut—take the crumbling west lane to keep both bridge tiles!',
  },
  {
    id: 58, world: 3, name: 'Conveyor Canyon', maxTiles: 2,
    grid: [
      'S..>..',
      'XXXX.#',
      '#..<.v',
      '#..XXX',
      'v..#..',
      '......',
      '>..#.E',
    ],
    stars: [{ x: 0, y: 2 }],
    hint: 'Follow the one-way arrows down the canyon terraces without breaking stride.',
  },
  {
    id: 59, world: 3, name: 'Tri-Hazard Trial', maxTiles: 2,
    grid: [
      'S.H#..',
      '.#..X.',
      '.X..C.',
      '.X..X.',
      '#.#>..',
      '....X.',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Dodge the honey, collect the western star, ride the arrow east, and reach the exit.',
  },
  {
    id: 60, world: 3, name: 'World 3 Finale', maxTiles: 2,
    grid: [
      'S..C.#',
      '.XXH.X',
      '#..#..',
      'X..XX.',
      'C..>..',
      '....X.',
      '....#E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 2 }],
    hint: 'Combine crumbling checkpoints, sticky avoidance, and one-way arrows to clear World 3!',
  },

  // =========================================================================
  // WORLD 4: OPEN THE WAY (Levels 61 - 80)
  // Enclosed gates (100% switch-mandatory!) and teleporters across divides
  // =========================================================================
  {
    id: 61, world: 4, name: 'The First Button', maxTiles: 2,
    grid: [
      '....XE',
      '....X.',
      'S.#.A.',
      '....X.',
      '..a.X.',
      '....X.',
      '....X.',
    ],
    hint: 'The rock wall seals the exit behind a laser gate. Step on the blue switch to open it!',
  },
  {
    id: 62, world: 4, name: 'First Warp', maxTiles: 2,
    grid: [
      'S..X..',
      '...X..',
      '.1.X.1',
      '...X..',
      '...X..',
      '...X.E',
      '...X..',
    ],
    hint: 'No bridge can cross the solid stone wall—step onto the swirling portal to warp through!',
  },
  {
    id: 63, world: 4, name: 'Key and Lock', maxTiles: 2,
    grid: [
      '..S...',
      '......',
      'a..#..',
      'XXAXXX',
      '......',
      '..#...',
      '..E...',
    ],
    hint: 'Take the western island to press the switch, then march through the unlocked gate.',
  },
  {
    id: 64, world: 4, name: 'Portal Island', maxTiles: 2,
    grid: [
      'S.#X#E',
      '...X..',
      '..1X.#',
      'XXXX..',
      '1..#..',
      '......',
      '...#..',
    ],
    stars: [{ x: 3, y: 6 }],
    hint: 'Warp into the southern cavern, grab the star, and climb the eastern passage!',
  },
  {
    id: 65, world: 4, name: 'Gatekeeper', maxTiles: 2,
    grid: [
      'S..#..',
      '......',
      'a..#..',
      'XXXXAX',
      '#..#.#',
      '......',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Press the western switch, cross the eastern laser gate, and sweep the lower cavern!',
  },
  {
    id: 66, world: 4, name: 'Twin Portals', maxTiles: 2,
    grid: [
      'S.1X..',
      '...X..',
      'XXXX1#',
      '.....2',
      'XXXX..',
      '2..#..',
      '....#E',
    ],
    stars: [{ x: 5, y: 2 }],
    hint: 'Chain Portal 1 into Portal 2 to cross both granite walls!',
  },
  {
    id: 67, world: 4, name: 'Star Behind Bars', maxTiles: 2,
    grid: [
      'S..#a.',
      '......',
      'XXXAXX',
      '......',
      '#..#..',
      '.....#',
      '.....E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Unlock the laser barrier, drop through, snag the star, and finish.',
  },
  {
    id: 68, world: 4, name: 'Warp to Star', maxTiles: 2,
    grid: [
      'S..#..',
      '...X..',
      '.1.X.E',
      'XXXX..',
      '#..1.#',
      '......',
      '..#...',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Warp south to grab the isolated star, then climb the eastern passage to the exit!',
  },
  {
    id: 69, world: 4, name: 'Vault Switch', maxTiles: 2,
    grid: [
      'a..X.E',
      '...X..',
      '.#.X.#',
      '...A..',
      'S..X..',
      '...X..',
      '..#X..',
    ],
    stars: [{ x: 5, y: 2 }],
    hint: 'Climb north to hit the pressure plate, return south through the unlocked gate, and grab the star.',
  },
  {
    id: 70, world: 4, name: 'Isolated Star', maxTiles: 2,
    grid: [
      'S..X#.',
      '...X..',
      '.1.X.1',
      'XXXX..',
      '.#..#.',
      '......',
      '....#E',
    ],
    stars: [{ x: 4, y: 0 }, { x: 1, y: 4 }],
    hint: 'Warp across the northern barrier, snag the star, then loop down into the southern cavern.',
  },
  {
    id: 71, world: 4, name: 'Dual Gates', maxTiles: 2,
    grid: [
      'S..#a.',
      '......',
      'XXAXXX',
      '..#..b',
      'XXXBXX',
      '......',
      '..#..E',
    ],
    hint: 'Open Gate 1 to reach Switch 2, then unlock Gate 2 to reach the exit!',
  },
  {
    id: 72, world: 4, name: 'Portal Crossing', maxTiles: 2,
    grid: [
      'S.#X#1',
      '...X..',
      '1..X.#',
      'XXXX..',
      '2..#..',
      '...X..',
      '#E.X.2',
    ],
    stars: [{ x: 3, y: 4 }],
    hint: 'Jump between twin portals to traverse all four quadrants of the stone cross.',
  },
  {
    id: 73, world: 4, name: 'The Closed Exit', maxTiles: 2,
    grid: [
      'a..#..',
      '......',
      '.#.XXX',
      '...X.E',
      'S..A..',
      '...XXX',
      '..#...',
    ],
    stars: [{ x: 0, y: 0 }],
    hint: 'The exit chamber is sealed! Climb north to unlock the gate.',
  },
  {
    id: 74, world: 4, name: 'Teleport Relay', maxTiles: 2,
    grid: [
      'S..X..',
      '..1X..',
      'XXXX#.',
      '....1.',
      '#..XXX',
      '#..#..',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Warp across the diagonal reef, then swing west to grab the hidden star.',
  },
  {
    id: 75, world: 4, name: 'Switch & Star', maxTiles: 2,
    grid: [
      'S..#..',
      '......',
      '.#..a.',
      'XXAXXX',
      '#....#',
      '......',
      '..#..E',
    ],
    stars: [{ x: 0, y: 4 }, { x: 5, y: 4 }],
    hint: 'Press the switch, pass through the gate, and sweep both lower islands!',
  },
  {
    id: 76, world: 4, name: 'Warp Over Reef', maxTiles: 2,
    grid: [
      'S..#1X',
      '.....X',
      'XXXXXX',
      '1..#.2',
      'XXXXXX',
      '2..#..',
      '.....E',
    ],
    stars: [{ x: 3, y: 3 }],
    hint: 'Chain both portals to leap across two solid granite ridges!',
  },
  {
    id: 77, world: 4, name: 'Switch & Warp Combo', maxTiles: 2,
    grid: [
      'S..a.X',
      '.....X',
      '.1...X',
      'XXXXXX',
      '.1.#AX',
      '....XX',
      '....#E',
    ],
    hint: 'Hit the switch BEFORE stepping into the portal, or the lower gate will still be sealed!',
  },
  {
    id: 78, world: 4, name: 'Inverted Gate', maxTiles: 2,
    grid: [
      'S..#..',
      '......',
      '.#.a..',
      'XXOXXX',
      '..#...',
      '....#.',
      '.....E',
    ],
    stars: [{ x: 3, y: 2 }],
    hint: 'The gate starts OPEN, but grabbing the star on the switch closes it! Step on the switch again to reopen it!',
  },
  {
    id: 79, world: 4, name: 'Cosmic Hub', maxTiles: 2,
    grid: [
      'S..X.a',
      '...X..',
      '.1.X.1',
      'XXXAXX',
      '#..#.#',
      '......',
      '..#..E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 4 }],
    hint: 'Warp east to hit the switch, then descend through the unlocked gate!',
  },
  {
    id: 80, world: 4, name: 'World 4 Finale', maxTiles: 2,
    grid: [
      'S..a.X',
      '.....X',
      'XXXAXX',
      '1..#.b',
      'XXXBXX',
      '1..#..',
      '.....E',
    ],
    stars: [{ x: 3, y: 3 }, { x: 3, y: 5 }],
    hint: 'Unlock Gate 1, hit Switch 2, and use the portal + Gate 2 to claim World 4 victory!',
  },

  // =========================================================================
  // WORLD 5: MASTER BUILDER (Levels 81 - 100)
  // Full synthesis of all mechanics on deeper puzzles
  // =========================================================================
  {
    id: 81, world: 5, name: 'The Grand Entrance', maxTiles: 2,
    grid: [
      'S..C..',
      '.XX..#',
      '#..H.#',
      '.#XX..',
      '.#..C.',
      '......',
      '....#E',
    ],
    stars: [{ x: 0, y: 2 }, { x: 5, y: 2 }],
    hint: 'Use the crumbling bridge, skirt around the sticky honey, and gather both stars.',
  },
  {
    id: 82, world: 5, name: 'Portal & Honey', maxTiles: 3,
    grid: [
      'S.H#1X',
      'XXXXXX',
      '1..#..',
      '....X.',
      '.#..X.',
      '...#X.',
      '....XE',
    ],
    hint: 'Wait—check the exit row! Bridge around the lower rock to reach the exit after warping.',
  },
  {
    id: 83, world: 5, name: 'One-Way Gate', maxTiles: 2,
    grid: [
      'S..a..',
      '......',
      'XXvXXX',
      '..#...',
      'XXXAXX',
      '#..#.#',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Press the switch BEFORE riding the one-way arrow down—there is no climbing back up!',
  },
  {
    id: 84, world: 5, name: 'Crumbling Vault', maxTiles: 2,
    grid: [
      'S..C..',
      '.....a',
      'XXAXXX',
      '..#..C',
      '......',
      '#..#.#',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Cross the crumbling stone to hit the switch, then drop through the unlocked gate!',
  },
  {
    id: 85, world: 5, name: 'Switchboard', maxTiles: 2,
    grid: [
      'S..#a.',
      '......',
      'XXAXXX',
      '#..b.#',
      'XXXBXX',
      '#..#..',
      '.....E',
    ],
    stars: [{ x: 0, y: 3 }, { x: 0, y: 5 }],
    hint: 'Unlock both gates in sequence while collecting both western stars.',
  },
  {
    id: 86, world: 5, name: 'Sticky Portal', maxTiles: 2,
    grid: [
      'S.H..1',
      '.#....',
      'XXXXXX',
      '1..#..',
      '......',
      '#..#.X',
      '....#E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Detour cleanly around the honey to preserve both tiles for the southern star!',
  },
  {
    id: 87, world: 5, name: 'The Fragile Loop', maxTiles: 2,
    grid: [
      'S..C.#',
      '....X.',
      'X.#.C.',
      '....X.',
      '#..C..',
      '......',
      'E..#..',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 4 }],
    hint: 'Three crumbling stones form a fragile ring—trace a single unbroken path!',
  },
  {
    id: 88, world: 5, name: 'Arrow Matrix', maxTiles: 2,
    grid: [
      'S..>..',
      '.....#',
      'X.XX.v',
      '#..#.#',
      'v.XX.X',
      '......',
      '>..#.E',
    ],
    stars: [{ x: 3, y: 3 }, { x: 0, y: 3 }],
    hint: 'Obey the directional arrows while collecting both central stars.',
  },
  {
    id: 89, world: 5, name: 'Honey & Gate', maxTiles: 3,
    grid: [
      'S.H#1X',
      'XXXXXX',
      '1..#a.',
      'XXXAXX',
      '..#...',
      '.....#',
      '....#E',
    ],
    hint: 'Cross the honey trench to reach the warp pad, unlock the gate, and finish with 2 tiles!',
  },
  {
    id: 90, world: 5, name: 'Chamber of Trials', maxTiles: 2,
    grid: [
      'S..1.X',
      '.....X',
      'XXXXXX',
      '1..a.#',
      'XXAXXX',
      '..v..#',
      '#....E',
    ],
    stars: [{ x: 0, y: 6 }],
    hint: 'Warp into the switch room, open the gate, ride the arrow south, grab the star, and finish!',
  },
  {
    id: 91, world: 5, name: 'The Broken Spiral', maxTiles: 2,
    grid: [
      'S..C.#',
      '.....X',
      '#XXX.C',
      '.X#E.X',
      '#X.C.#',
      '.#....',
      '..XXXX',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 4 }],
    hint: 'Trace the crumbling spiral clockwise into the exit sanctuary.',
  },
  {
    id: 92, world: 5, name: 'Double Locked', maxTiles: 2,
    grid: [
      'S..a.X',
      '.....X',
      'XXAXXX',
      '#..1.X',
      'XXXXXX',
      '1.b..#',
      'XXXB#E',
    ],
    stars: [{ x: 0, y: 3 }],
    hint: 'Open Gate 1, grab the star, warp south to hit Switch 2, and unlock the exit gate!',
  },
  {
    id: 93, world: 5, name: 'One-Way Honey', maxTiles: 2,
    grid: [
      'S..>..',
      '....X.',
      '.#.HX.',
      '..#.#.',
      '#..v..',
      '......',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Ride the top arrow, dodge the honey, grab the western star, and ride south!',
  },
  {
    id: 94, world: 5, name: 'Portal Labyrinth', maxTiles: 2,
    grid: [
      'S.#1.X',
      '...X.X',
      'XXXX1#',
      'a..2.X',
      'XXXXXX',
      '2.#A.#',
      '...X#E',
    ],
    stars: [{ x: 5, y: 2 }],
    hint: 'Warp east, hit the switch, take Portal 2, and cross the unlocked gate to the exit!',
  },
  {
    id: 95, world: 5, name: 'The Crucible', maxTiles: 2,
    grid: [
      'S..C.#',
      '...X..',
      '.1.X.a',
      'XXXXXX',
      '1..#.A',
      '.....X',
      '..#.#E',
    ],
    stars: [{ x: 5, y: 0 }],
    hint: 'Wait—make sure Switch a is reachable and Gate A blocks the exit cleanly!',
  },
  {
    id: 96, world: 5, name: 'Clockwork Maze', maxTiles: 2,
    grid: [
      'S..#a.',
      '......',
      'XXAXXX',
      'C..#..',
      '..XX..',
      '#..C..',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Open the gate, descend across the fragile stepping stones, and sweep the lower star.',
  },
  {
    id: 97, world: 5, name: 'Perilous Passage', maxTiles: 2,
    grid: [
      'S.H#a.',
      '.#....',
      'XXXAXX',
      '.#..C.',
      '.X..X.',
      '#..#.#',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Step around the sticky honey to keep both tiles for the crumbling lower hall and star!',
  },
  {
    id: 98, world: 5, name: 'Quantum Leap', maxTiles: 2,
    grid: [
      'S.#1.X',
      '.....X',
      'XXXXXX',
      '1.a#2X',
      'XXXXXX',
      '2.#A.#',
      '...X#E',
    ],
    stars: [{ x: 3, y: 3 }],
    hint: 'Warp into the central chamber, press the switch, grab the star, take Portal 2, and pass Gate A!',
  },
  {
    id: 99, world: 5, name: 'The Penultimate Riddle', maxTiles: 2,
    grid: [
      'S..C.1',
      '.XXX..',
      '#..H.X',
      'XXXXXX',
      '1.a#.A',
      '.....X',
      '..#.#E',
    ],
    stars: [{ x: 0, y: 2 }],
    hint: 'Grab the western star, cross the crumbling bridge to Portal 1, hit Switch a, and unlock the vault!',
  },
  {
    id: 100, world: 5, name: 'Steal the Floor Master', maxTiles: 2,
    grid: [
      'S..C.a',
      '...X..',
      '.1.X#.',
      'XXXAXX',
      '1.H#b.',
      'XXXBXX',
      '#..#.E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 6 }],
    hint: 'The ultimate trial! Master crumbling bridges, dual gates, portals, and sticky traps to claim the crown!',
  },
];

// Verified level refinements so 100/100 levels pass every quality gate cleanly
const patches: Record<number, Partial<GridLevelInput>> = {
  // World 1 fixes (4 levels)
  3: {
    grid: [
      '......',
      '.S....',
      '...#..',
      '......',
      '..#...',
      '......',
      '...E..',
    ],
  },
  9: {
    grid: [
      'S..#..',
      '.....#',
      '......',
      '...#..',
      '#.#...',
      '......',
      '...#.E',
    ],
    stars: [{ x: 0, y: 4 }],
  },
  12: {
    maxTiles: 3,
    grid: [
      '..*...',
      '......',
      '..#...',
      '......',
      'S.#..E',
      '......',
      '......',
    ],
  },
  17: {
    grid: [
      '#..#.#',
      '......',
      '..#...',
      '......',
      '.#..#.',
      '......',
      'S....E',
    ],
    stars: [{ x: 0, y: 0 }, { x: 5, y: 0 }],
  },

  // World 2 fixes (9 levels)
  21: {
    grid: [
      '......',
      '# S...',
      '.XXX..',
      '#...#.',
      '.XXX..',
      '.#E...',
      '......',
    ].map((r) => r.replace(' ', '.')),
  },
  22: {
    grid: [
      '..#...',
      '..X...',
      'S.X.#E',
      '..X...',
      '.#X.#.',
      '......',
      '..##..',
    ],
  },
  23: {
    grid: [
      'S..#..',
      'XXXX.#',
      '.#.#.#',
      '#..XXX',
      '#..#..',
      'XXXX.#',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
  },
  24: {
    grid: [
      'S..#..',
      '.X.X..',
      '#X.#.#',
      '.X.X..',
      '#..#.#',
      '.XXXX.',
      '.##..E',
    ],
    stars: [{ x: 0, y: 4 }, { x: 5, y: 2 }],
  },
  26: {
    maxTiles: 3,
    grid: [
      'S.X..#',
      '..X...',
      '.#X..*',
      '..X.#.',
      '..#..X',
      '....#.',
      '.....E',
    ],
  },
  29: {
    grid: [
      '.#..#.',
      '..X...',
      'S.X..#',
      '.##...',
      '..X.#.',
      '.#X.E.',
      '......',
    ],
    stars: [{ x: 1, y: 0 }, { x: 1, y: 5 }],
  },
  30: {
    maxTiles: 1,
    grid: [
      'S.#.X#',
      '.XX.#.',
      '#.#.#.',
      '.#.XX.',
      '.#.#.#',
      '.XX.#.',
      '#.#.#E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 6 }],
  },
  32: {
    grid: [
      'S..#.#',
      'XXXX..',
      '.#..##',
      '#..XXX',
      '#..#..',
      'XXXX.#',
      '...##E',
    ],
    stars: [{ x: 1, y: 2 }, { x: 0, y: 4 }],
  },
  37: {
    grid: [
      '#.#X.E',
      '...X..',
      '.#.#.#',
      'XXXX.#',
      'S..#..',
      '.....#',
      '..#...',
    ],
    stars: [{ x: 0, y: 0 }],
  },

  // World 3 fixes (12 levels)
  41: {
    maxTiles: 2,
    grid: [
      '#.#..#',
      '.X.XX.',
      'SH#..#',
      'XXXXX.',
      '.....#',
      '......',
      '....#E',
    ],
    hint: 'Honey sits in the direct shortcut—taking it leaves only 1 tile, unable to cross the 2-tile gap! Detour north!',
  },
  42: {
    maxTiles: 3,
    grid: [
      '......',
      'XXXXXX',
      'S.H.#.',
      'XXXX.X',
      '....#.',
      '......',
      '...#E.',
    ],
    stars: [],
    hint: 'The only corridor runs straight through sticky honey! Lose 1 tile, then finish with your remaining 2!',
  },
  45: {
    maxTiles: 2,
    grid: [
      'S..C..',
      'XXXX.#',
      '.....#',
      'XXXX.#',
      '#..C..',
      '......',
      'E.....',
    ],
    stars: [{ x: 5, y: 2 }],
  },
  49: {
    maxTiles: 2,
    grid: [
      '#.#..#',
      '.X.XX.',
      'SH#..#',
      'XXXXX.',
      '.#..#.',
      '......',
      '.....E',
    ],
    stars: [{ x: 1, y: 4 }],
    hint: 'Detour north around the honey so both tiles survive for the western star and exit chasm!',
  },
  51: {
    maxTiles: 2,
    grid: [
      '#..#.<',
      '.....#',
      'vXXX.#',
      'S..#.#',
      'X#XX.X',
      '..#...',
      'E..>..',
    ],
    stars: [{ x: 0, y: 0 }],
  },
  52: {
    maxTiles: 2,
    grid: [
      'XXXXXX',
      'S.H#.#',
      '.X.X..',
      '#..H.#',
      '.X...X',
      '.#..#.',
      '....XE',
    ],
    stars: [{ x: 5, y: 1 }],
    hint: 'Both eastern shortcuts are glazed in sticky honey—weave around them to keep both tiles for the exit!',
  },
  54: {
    maxTiles: 2,
    grid: [
      '.#..#.',
      '.....#',
      'XXvXX#',
      'S.#>.#',
      'XXvXX.',
      '......',
      '.#..E.',
    ],
    stars: [{ x: 1, y: 0 }, { x: 4, y: 0 }],
  },
  55: {
    maxTiles: 3,
    grid: [
      'XXXXXX',
      'S.H.#.',
      'XXXX..',
      '....#.',
      'X.XX..',
      '#.#H.#',
      '....#E',
    ],
    stars: [{ x: 0, y: 5 }],
  },
  57: {
    maxTiles: 2,
    grid: [
      'S.H#.#',
      '.X.X.#',
      'C..#..',
      '.X.X..',
      '#..C.#',
      '......',
      '....#E',
    ],
    stars: [{ x: 5, y: 0 }],
  },
  59: {
    maxTiles: 3,
    grid: [
      'S.HC.#',
      'XXXXX.',
      '#..#.#',
      '..XXX.',
      '#..>.#',
      '....X.',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Sacrifice 1 tile on honey across the crumbling stone, collect the west star, and ride the arrow east!',
  },
  60: {
    maxTiles: 3,
    grid: [
      'S.HC.#',
      'XXXX..',
      '#..#.#',
      'XXX.XX',
      'C..>.#',
      '....X.',
      '....#E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 2 }],
  },

  // World 4 fixes (5 levels)
  64: {
    maxTiles: 2,
    grid: [
      'S.#X#E',
      '...X..',
      '..1X.#',
      'XXXX..',
      '1..#.#',
      '......',
      '...#..',
    ],
    stars: [{ x: 3, y: 6 }],
  },
  72: {
    maxTiles: 2,
    grid: [
      'S.#X#1',
      '...X..',
      '1..X.#',
      'XXXX..',
      '2..#.#',
      '...X..',
      '#E.X.2',
    ],
    stars: [{ x: 3, y: 4 }],
  },
  74: {
    maxTiles: 2,
    grid: [
      'S..X..',
      '..1X..',
      'XXXX#.',
      '...#1.',
      '.#.XXX',
      '#..#..',
      '....#E',
    ],
    stars: [{ x: 0, y: 5 }],
  },
  77: {
    maxTiles: 2,
    grid: [
      'S..a.X',
      '.....X',
      '.1...X',
      'XXXXXX',
      '.1.#..',
      'XXXXAX',
      '....#E',
    ],
  },
  79: {
    maxTiles: 2,
    grid: [
      'S..X.a',
      '...X1.',
      '.1.X.#',
      'XXXXAX',
      '.#.#.#',
      '......',
      '...#.E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 1, y: 4 }],
  },

  // World 5 fixes (13 levels)
  81: {
    maxTiles: 2,
    grid: [
      'S..C..',
      '.XX..#',
      '#H.#.#',
      '.#XX..',
      '.#..C.',
      '......',
      '....#E',
    ],
    stars: [{ x: 0, y: 2 }, { x: 5, y: 2 }],
  },
  82: {
    maxTiles: 3,
    grid: [
      'S.H#1X',
      'XXXXXX',
      '1..#..',
      '....X.',
      '..#.X.',
      '...#..',
      '....#E',
    ],
    stars: [{ x: 2, y: 4 }],
    hint: 'Cross the sticky honey to reach the portal, then use your remaining 2 tiles to claim the star and exit!',
  },
  84: {
    maxTiles: 2,
    grid: [
      'S..C..',
      '....#a',
      'XXAXXX',
      '..#..C',
      '......',
      '#..#.#',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
  },
  86: {
    maxTiles: 2,
    grid: [
      'XXXXXX',
      'SH#1..',
      '.X.XXX',
      '#..#..',
      'XXXXXX',
      '1..#X.',
      '....#E',
    ],
    stars: [{ x: 0, y: 3 }],
    hint: 'Avoid the sticky shortcut above—detour south to keep both tiles for the portal cavern!',
  },
  89: {
    maxTiles: 3,
    grid: [
      'S.H#1X',
      'XXXXXX',
      '1..#a.',
      'XXXAXX',
      '..#..#',
      '......',
      '....#E',
    ],
  },
  90: {
    maxTiles: 2,
    grid: [
      'S..1.X',
      '.....X',
      'XXXXXX',
      '1..a.#',
      'XXAXXX',
      '..v..#',
      '#..#.E',
    ],
    stars: [{ x: 0, y: 6 }],
  },
  91: {
    maxTiles: 2,
    grid: [
      'S..C.#',
      '....X.',
      '#XXX.C',
      '.X#E.X',
      '#X.C.#',
      '.#...#',
      '..XXXX',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 4 }],
  },
  93: {
    maxTiles: 3,
    grid: [
      'S..>.#',
      'XXXXHX',
      '#..#.#',
      '.....#',
      '#..v.#',
      '......',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Ride the top arrow, sacrifice 1 tile in the honey chute, then clear the lower terrace with 2 tiles!',
  },
  94: {
    maxTiles: 2,
    grid: [
      'S.#1.X',
      '...X.X',
      'XXXX1#',
      'a.#2.#',
      'XXXXXX',
      '2.#A..',
      'XXX#XE',
    ],
    stars: [{ x: 5, y: 2 }],
  },
  95: {
    maxTiles: 2,
    grid: [
      'S..C.1',
      '...X..',
      '.a.X#.',
      'XXXXXX',
      '1..#..',
      'XXXXAX',
      '....#E',
    ],
    stars: [{ x: 4, y: 2 }],
  },
  97: {
    maxTiles: 2,
    grid: [
      'S.H#a.',
      '.#....',
      'XXXAXX',
      '.XX.C.',
      '.XXX..',
      '#..#.#',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
  },
  98: {
    maxTiles: 2,
    grid: [
      'S.#1.X',
      '.....X',
      'XXXXXX',
      '1.a#2X',
      'XXXXXX',
      '2..#XX',
      'XXXA#E',
    ],
    stars: [{ x: 3, y: 3 }],
  },
  99: {
    maxTiles: 3,
    grid: [
      'S.HC.1',
      'XXXXXX',
      '1.a#..',
      'XXXAXX',
      '#..#..',
      '......',
      '....#E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Sacrifice 1 tile on the sticky bridge to cross the crumbling stone into Portal 1, flip Switch a, and finish with 2 tiles!',
  },
  100: {
    maxTiles: 3,
    grid: [
      'S.HC.a',
      'XXXX1.',
      'XXXXXX',
      '1..#..',
      'XXXAXX',
      'b..#..',
      'XXXB#E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 0, y: 5 }],
    hint: 'The ultimate trial! Sacrifice 1 tile on honey, cross the crumbling stone to Switch a, warp south, unlock both gates, and claim the crown!',
  },
};

for (const d of drafts) {
  if (patches[d.id]) {
    Object.assign(d, patches[d.id]);
  }
}

// =========================================================================
// WORLD 6: FROST & SPARK (Levels 101 - 120)
// New Mechanics: Ice Sliding (I) & +1 Bonus Tile Pickups (+)
// =========================================================================
const world6Drafts: GridLevelInput[] = [
  {
    id: 101, world: 6, name: 'First Freeze', maxTiles: 2,
    grid: [
      '......',
      'SIIII#',
      '.....X',
      '.....I',
      '.....I',
      '.....I',
      '.....E',
    ],
    hint: 'Step onto glistening ice to glide across solid tiles in a single move!',
  },
  {
    id: 102, world: 6, name: 'Power Up +1', maxTiles: 1,
    grid: [
      'S.#.+.',
      '......',
      'XXXX..',
      '....#.',
      '......',
      '......',
      '....E.',
    ],
    hint: 'With only 1 tile you cannot cross the final 2-tile chasm—grab the +1 Bonus Tile first!',
  },
  {
    id: 103, world: 6, name: 'Glacier Rink', maxTiles: 2,
    grid: [
      'S.III#',
      '.....I',
      '.#...I',
      '.....I',
      '#III.#',
      '......',
      'E.....',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Glide around the perimeter ice rinks to reach the western gem and exit.',
  },
  {
    id: 104, world: 6, name: 'Spark Collector', maxTiles: 1,
    grid: [
      'S.#...',
      '..X+..',
      '....X.',
      '..#...',
      '....#.',
      '......',
      '.....E',
    ],
    stars: [{ x: 2, y: 3 }],
    hint: 'Claim the +1 tile on the northeast island to unlock 2-tile bridges!',
  },
  {
    id: 105, world: 6, name: 'Ice Express', maxTiles: 2,
    grid: [
      'SII#..',
      '...I..',
      '#..I.#',
      '...I..',
      '...#II',
      '.....I',
      '.....E',
    ],
    stars: [{ x: 0, y: 2 }, { x: 5, y: 2 }],
    hint: 'Use the central ice spine to zip quickly between northern and southern islands.',
  },
  {
    id: 106, world: 6, name: 'Double Boost', maxTiles: 1,
    grid: [
      'S.#+..',
      'XXX...',
      '....+.',
      '......',
      '......',
      '....#.',
      '.E....',
    ],
    hint: 'Pick up BOTH +1 Bonus Tiles to expand your reach from 1 tile to 3 tiles!',
  },
  {
    id: 107, world: 6, name: 'Frozen Switch', maxTiles: 2,
    grid: [
      'S.IIIa',
      '......',
      'XXXAXX',
      '...I..',
      '#..I..',
      '...I..',
      '...#E.',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Glide east to hit the switch, then skate south through the unlocked laser gate!',
  },
  {
    id: 108, world: 6, name: 'Frost & Crumble', maxTiles: 2,
    grid: [
      'S.IIIC',
      'XXX..I',
      '#...XI',
      '.....I',
      '#CIII#',
      '......',
      'E.....',
    ],
    stars: [{ x: 0, y: 2 }],
    hint: 'Skate east across the crumbling ice anchor, glide south, then sweep the western gem!',
  },
  {
    id: 109, world: 6, name: 'Bonus Bridge', maxTiles: 1,
    grid: [
      'S.#.+.',
      '.X.X..',
      '#..#..',
      'XXXX..',
      '....#.',
      '......',
      '...E..',
    ],
    stars: [{ x: 0, y: 2 }],
    hint: 'Start with 1 tile, grab the gem and +1 boost, then bridge the 2-tile southern chasm!',
  },
  {
    id: 110, world: 6, name: 'Polar Warp', maxTiles: 2,
    grid: [
      'S.III1',
      'XXXXXX',
      '1II#..',
      '...I..',
      '#..I..',
      '...I..',
      '...#.E',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Skate straight into Portal 1 to warp onto the southern glacier!',
  },
  {
    id: 111, world: 6, name: 'Honey vs Spark', maxTiles: 3,
    grid: [
      'XXXXXX',
      'S.H+..',
      'XXX..#',
      '......',
      '....#.',
      '.E....',
      '......',
    ],
    hint: 'The sticky honey steals 1 tile, but the +1 Spark restores your 3-tile reach for the final chasm!',
  },
  {
    id: 112, world: 6, name: 'Ice Gatekeeper', maxTiles: 1,
    grid: [
      'S.#.+a',
      '......',
      'XXXAXX',
      '...I..',
      '...I..',
      '#..I..',
      '...#E.',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Grab the +1 tile and flip Switch a before sliding south through Gate A!',
  },
  {
    id: 113, world: 6, name: 'Slippery Arrows', maxTiles: 2,
    grid: [
      'S.II>I',
      '.....I',
      'XXXX.I',
      '#..<.I',
      '......',
      '..I...',
      '..I..E',
    ],
    stars: [{ x: 0, y: 3 }],
    hint: 'One-way arrows steer your skate path cleanly across the ice.',
  },
  {
    id: 114, world: 6, name: 'Arctic Vault', maxTiles: 1,
    grid: [
      'S.#.+1',
      'XXXXXX',
      '1..#..',
      '....X.',
      '....X.',
      '#.#...',
      '....#E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Grab the +1 tile before warping so you have 2 tiles to sweep the vault!',
  },
  {
    id: 115, world: 6, name: 'Twin Glaciers', maxTiles: 2,
    grid: [
      'S.II#a',
      '....X.',
      'XXAXXX',
      '..I..b',
      'XXXBXX',
      '#..I.#',
      '.....E',
    ],
    stars: [{ x: 0, y: 5 }],
    hint: 'Unlock both frosted laser gates while skating down the twin glaciers!',
  },
  {
    id: 116, world: 6, name: 'Crumble & Boost', maxTiles: 1,
    grid: [
      'S.#C.+',
      'XXXX..',
      '....#.',
      '......',
      '...#..',
      '......',
      '....#E',
    ],
    stars: [{ x: 3, y: 4 }],
    hint: 'Cross the fragile stone to claim the +1 tile, then leap south with 2 tiles!',
  },
  {
    id: 117, world: 6, name: 'Frost Labyrinth', maxTiles: 2,
    grid: [
      'SII#1X',
      'XXXXXX',
      '1II#a.',
      'XXXAXX',
      '#..I..',
      '...I..',
      '...#E.',
    ],
    stars: [{ x: 0, y: 4 }],
    hint: 'Skate into Portal 1, glide to Switch a, and drop through Gate A onto the lower ice.',
  },
  {
    id: 118, world: 6, name: 'Spark Chasm', maxTiles: 1,
    grid: [
      'S.#+..',
      'XX....',
      '..#..+',
      'XXXXX.',
      '.....#',
      '..E...',
      '......',
    ],
    hint: 'Collect both +1 Bonus Tiles to grow your bridge reach from 1 to 3 and leap the final chasm!',
  },
  {
    id: 119, world: 6, name: 'Cryo Trials', maxTiles: 1,
    grid: [
      'S.#+a.',
      'XXXAXX',
      '1..I..',
      '...I.#',
      'XXXXXX',
      '1II#..',
      '....#E',
    ],
    stars: [{ x: 5, y: 3 }],
    hint: 'Boost your tiles, unlock Gate A, skate down to the gem, and warp onto the final ice strip!',
  },
  {
    id: 120, world: 6, name: 'Grand Frost Master', maxTiles: 1,
    grid: [
      'S.#+Ca',
      'XXXAXX',
      '1..I..',
      '...I.b',
      'XXXXXX',
      '1..#..',
      'XXXB#E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 3, y: 5 }],
    hint: 'The grand finale of Frost & Spark! Combine +1 tiles, crumbling stone, ice slides, portals, and dual gates!',
  },
];

drafts.push(...world6Drafts);

// =========================================================================
// WORLD 7: CLOCKWORK FORGE (Levels 121 - 140) — Timed Switches & Countdown Gates
// =========================================================================
const world7Drafts: GridLevelInput[] = [
  {
    id: 121, world: 7, name: 'Tick Tock Gate', maxTiles: 2,
    grid: [
      'S..a..',
      '......',
      'XXXAXX',
      '...#..',
      '......',
      '...#..',
      '.....E',
    ],
    timedDurations: { g1: 3 },
    hint: 'Step on the timed switch to open Gate A for 3 moves — sprint straight through before it shuts!',
  },
  {
    id: 122, world: 7, name: 'Beat the Bell', maxTiles: 2,
    grid: [
      'S.#..a',
      '......',
      'XXAXXX',
      '..#...',
      '......',
      '..#...',
      '....E.',
    ],
    timedDurations: { g1: 5 },
    hint: 'Hit Switch a on the east ledge, reclaim on the middle stone, and race through Gate A in 5 moves!',
  },
  {
    id: 123, world: 7, name: 'Gearbox Sprint', maxTiles: 2,
    grid: [
      '#..S.a',
      '......',
      'XXXXAX',
      '....#.',
      '...#..',
      '.#....',
      'E.....',
    ],
    stars: [{ x: 0, y: 0 }],
    timedDurations: { g1: 3 },
    hint: 'Grab the western gem FIRST — once you tap Switch a, you only have 3 moves to reach Gate A!',
  },
  {
    id: 124, world: 7, name: 'Pendulum Path', maxTiles: 2,
    grid: [
      'a..#..',
      '......',
      'S..#..',
      'XXXXAX',
      '....#.',
      '......',
      '....#E',
    ],
    timedDurations: { g1: 7 },
    hint: 'Hit Switch a, use the central island to reclaim your bridge tiles, and dash through Gate A!',
  },
  {
    id: 125, world: 7, name: 'Crumbling Clockwork', maxTiles: 2,
    grid: [
      'S..#..',
      '......',
      'a..C..',
      'XXXXAX',
      '....#.',
      '......',
      '..#.E.',
    ],
    timedDurations: { g1: 5 },
    hint: 'Use the crumbling checkpoint to reclaim your bridge tiles midway through the timed sprint!',
  },
  {
    id: 126, world: 7, name: 'Frosty Fuse', maxTiles: 2,
    grid: [
      'S.aII#',
      'XXXXX.',
      '.....A',
      '.....#',
      '......',
      '....#.',
      '..E...',
    ],
    timedDurations: { g1: 3 },
    hint: 'Hit Switch a and immediately glide across the ice runway — one move covers the whole ledge to beat the 3-move timer!',
  },
  {
    id: 127, world: 7, name: 'Forge Spark', maxTiles: 1,
    grid: [
      '+.#S.a',
      '......',
      'XXXAXX',
      '...#..',
      '......',
      '.....#',
      '...E..',
    ],
    timedDurations: { g1: 4 },
    hint: 'Collect the +1 Bonus Tile first so your 2-tile bridge can sprint directly from Switch a to Gate A!',
  },
  {
    id: 128, world: 7, name: 'Sticky Delay', maxTiles: 3,
    grid: [
      'S#H.a.',
      'XXXX..',
      '....#.',
      'XXAXXX',
      '..#...',
      '....#.',
      '.....E',
    ],
    timedDurations: { g1: 5 },
    hint: 'Cross the sticky honey corridor sacrificing 1 tile, hit Switch a, and sprint to Gate A with your remaining 2!',
  },
  {
    id: 129, world: 7, name: 'One-Way Escapement', maxTiles: 2,
    grid: [
      'S.a>v.',
      '....v.',
      'XXXXAX',
      '....#.',
      '...#..',
      '.#....',
      'E.....',
    ],
    timedDurations: { g1: 4 },
    hint: 'Ride the one-way escapement arrows straight from Switch a into Gate A in 4 crisp moves!',
  },
  {
    id: 130, world: 7, name: 'Warp Relay', maxTiles: 2,
    grid: [
      'S.a.1X',
      'XXXXXX',
      '1.#..A',
      'XXXXX.',
      '....#.',
      '...#..',
      '..#..E',
    ],
    timedDurations: { g1: 7 },
    hint: 'Hit Switch a, dive into Portal 1, and sprint across the middle vault before Gate A seals shut!',
  },
  {
    id: 131, world: 7, name: 'Twin Mainsprings', maxTiles: 2,
    grid: [
      'S..a..',
      'XXAXXX',
      '..#.b.',
      'XXBXXX',
      '..#...',
      '...#..',
      '....#E',
    ],
    timedDurations: { g1: 3, g2: 3 },
    hint: 'Two rapid countdown gates in a row! Clear Gate A in 3 moves, then trip Switch b and race back to Gate B!',
  },
  {
    id: 132, world: 7, name: 'Gem Before Gear', maxTiles: 2,
    grid: [
      '#..#.#',
      '......',
      'S.a...',
      'XXXXAX',
      '....#.',
      '......',
      'E..#..',
    ],
    stars: [{ x: 0, y: 0 }, { x: 5, y: 0 }],
    timedDurations: { g1: 3 },
    hint: 'Sweeping both top gems first is mandatory — Switch a only holds Gate A open for 3 moves!',
  },
  {
    id: 133, world: 7, name: 'Glacial Timer', maxTiles: 2,
    grid: [
      'S.aII1',
      'XXXXXX',
      '1.#A..',
      'XXXX..',
      '....#.',
      '......',
      '..#.E.',
    ],
    timedDurations: { g1: 4 },
    hint: 'Step on Switch a, skate straight into Portal 1 in one glide, and clear Gate A before the clock hits zero!',
  },
  {
    id: 134, world: 7, name: 'Anvil Overdrive', maxTiles: 1,
    grid: [
      'S.#+..',
      '......',
      'a..C..',
      'XXXXAX',
      '....#.',
      '......',
      '.E..#.',
    ],
    timedDurations: { g1: 5 },
    hint: 'Grab the +1 Bonus Tile first, trigger Switch a, and dash over the crumbling stone through Gate A!',
  },
  {
    id: 135, world: 7, name: 'Synchronized Gears', maxTiles: 2,
    grid: [
      'S.#a..',
      '......',
      'XAXXXX',
      '.#..b.',
      'XXBXXX',
      '..#...',
      '....#E',
    ],
    stars: [{ x: 1, y: 3 }],
    timedDurations: { g1: 4, g2: 3 },
    hint: 'Sprint from Switch a through Gate A, grab the gem, then hit Switch b and race back through Gate B!',
  },
  {
    id: 136, world: 7, name: 'Molten Shortcut', maxTiles: 2,
    grid: [
      '#.#..#',
      '.X.XX.',
      'SH#..a',
      'XXXAXX',
      '...#..',
      '....#.',
      '.....E',
    ],
    stars: [{ x: 3, y: 4 }],
    timedDurations: { g1: 3 },
    hint: 'Detour north around the sticky honey so both tiles survive for the 3-move timed sprint from Switch a to Gate A!',
  },
  {
    id: 137, world: 7, name: 'Spring-Loaded Ice', maxTiles: 1,
    grid: [
      'S.#+..',
      '....a.',
      'XX..I.',
      'XX..I.',
      'XXXXAX',
      '..#.#.',
      'E.....',
    ],
    timedDurations: { g1: 3 },
    hint: 'Grab the +1 Bonus Tile, press Switch a, and ride the vertical ice chute straight into Gate A!',
  },
  {
    id: 138, world: 7, name: 'Clockwork Labyrinth', maxTiles: 2,
    grid: [
      'S.a>v.',
      'XXXX1.',
      'XXXXXX',
      '1..#..',
      'XXXAXX',
      '...#..',
      '.....E',
    ],
    timedDurations: { g1: 7 },
    hint: 'Press Switch a, ride the one-way chute into Portal 1, and dash through Gate A before it shuts!',
  },
  {
    id: 139, world: 7, name: 'The Furnace Core', maxTiles: 2,
    grid: [
      'S.aII#',
      'XXXXXA',
      '...C.#',
      '.#...b',
      'XXXBXX',
      '...#..',
      'E..#..',
    ],
    stars: [{ x: 1, y: 3 }],
    timedDurations: { g1: 2, g2: 3 },
    hint: 'Skate from Switch a through Gate A in 2 moves, cross the crumbling stone for the gem, then beat Timed Gate B!',
  },
  {
    id: 140, world: 7, name: 'Grand Horologist', maxTiles: 1,
    grid: [
      'S.#+a.',
      '....II',
      'XXXXXA',
      '1..C.#',
      'XXXXXX',
      'X#..b1',
      'EBXXXX',
    ],
    stars: [{ x: 5, y: 3 }],
    timedDurations: { g1: 3, g2: 4 },
    hint: 'The ultimate Clockwork Forge trial! Grab +1, glide past Timed Gate A, cross crumbling stone to Portal 1, and beat Timed Gate B!',
  },
];

drafts.push(...world7Drafts);

// =========================================================================
// WORLD 8: OBSIDIAN SANCTUM (Levels 141 - 160) — Pushable Crates & Weighted Plates
// =========================================================================
const world8Drafts: GridLevelInput[] = [
  {
    id: 141, world: 8, name: 'First Push', maxTiles: 2,
    grid: [
      'S#M#a.',
      '......',
      'XXXAXX',
      '...#..',
      '......',
      '...#..',
      '.....E',
    ],
    holdSwitches: ['g1'],
    hint: 'Push the heavy crate right onto Weighted Plate A to hold Gate A open while you cross!',
  },
  {
    id: 142, world: 8, name: 'Walk Around', maxTiles: 2,
    grid: [
      'S.##..',
      '..#M..',
      '..#a..',
      'XAXXXX',
      '.#....',
      '..#...',
      '...#.E',
    ],
    holdSwitches: ['g1'],
    hint: 'Circle above the crate so you can shove it south onto Weighted Plate A, then bridge back to Gate A!',
  },
  {
    id: 143, world: 8, name: 'Bridge to Push', maxTiles: 2,
    grid: [
      'S.#...',
      '..#M#a',
      '......',
      'XXAXXX',
      '..#...',
      '...#..',
      '....#E',
    ],
    holdSwitches: ['g1'],
    hint: 'Bridge to the west side of the crate, push it east onto Plate A, then pass Gate A!',
  },
  {
    id: 144, world: 8, name: 'Stone Corridor', maxTiles: 2,
    grid: [
      'S###..',
      '.X#M##',
      '#..#a#',
      'XAXXXX',
      '.#....',
      '..#...',
      '...#E.',
    ],
    holdSwitches: ['g1'],
    hint: 'Guide the crate carefully around the rock wall onto Plate A, then circle back through Gate A!',
  },
  {
    id: 145, world: 8, name: 'Sanctum Gem', maxTiles: 2,
    grid: [
      '#..#..',
      'S.#M#a',
      '......',
      'XXXAXX',
      '...#..',
      '......',
      'E..#..',
    ],
    stars: [{ x: 0, y: 0 }],
    holdSwitches: ['g1'],
    hint: 'Grab the top-west gem, park the crate on Weighted Plate A, and bridge to the exit!',
  },
  {
    id: 146, world: 8, name: 'Ice Shove', maxTiles: 2,
    grid: [
      'S#MIIa',
      '......',
      'XXXAXX',
      '...#..',
      '......',
      '....#.',
      '.....E',
    ],
    holdSwitches: ['g1'],
    hint: 'Give the crate one shove onto the ice strip — it will glide all the way onto Weighted Plate A!',
  },
  {
    id: 147, world: 8, name: 'Double Weight', maxTiles: 2,
    grid: [
      'S#M#a.',
      'XXAXXX',
      '..#M#b',
      'XXBXXX',
      '..#...',
      '...#..',
      '....#E',
    ],
    holdSwitches: ['g1', 'g2'],
    hint: 'Two chambers, two crates! Lock Gate A open first, then drop down and park the second crate on Plate B!',
  },
  {
    id: 148, world: 8, name: 'Crumble Delivery', maxTiles: 2,
    grid: [
      'S..C..',
      '...#..',
      '..#M#a',
      'XXXAXX',
      '...#..',
      '......',
      '..#.E.',
    ],
    holdSwitches: ['g1'],
    hint: 'Cross the crumbling checkpoint to reach the crate island, push it onto Plate A, and pass Gate A!',
  },
  {
    id: 149, world: 8, name: 'Spark Leverage', maxTiles: 1,
    grid: [
      'S.#+..',
      '......',
      '..#M#a',
      'XXAXXX',
      '..#...',
      '......',
      '...E..',
    ],
    holdSwitches: ['g1'],
    hint: 'Pick up the +1 Bonus Tile first so your 2-tile bridge can reach the crate island and leap the final chasm!',
  },
  {
    id: 150, world: 8, name: 'Portal Sokoban', maxTiles: 2,
    grid: [
      'S..1.X',
      'XXXXXX',
      '1#M#a.',
      'XXAXXX',
      '..#...',
      '...#..',
      '....#E',
    ],
    holdSwitches: ['g1'],
    hint: 'Warp into the sealed sanctum via Portal 1, push the crate onto Plate A, and exit through Gate A!',
  },
  {
    id: 151, world: 8, name: 'Honey & Stone', maxTiles: 3,
    grid: [
      'S#H.#.',
      'XXXX#.',
      'a#M#..',
      'XXXAXX',
      '...#..',
      '....#.',
      '.....E',
    ],
    holdSwitches: ['g1'],
    hint: 'Cross the sticky honey corridor sacrificing 1 tile, push the crate west onto Plate A, and finish with 2 tiles!',
  },
  {
    id: 152, world: 8, name: 'One-Way Shove', maxTiles: 2,
    grid: [
      'S>v...',
      'XX#...',
      '..#M#a',
      'XXAXXX',
      '..#...',
      '......',
      'E..#..',
    ],
    holdSwitches: ['g1'],
    hint: 'Ride the one-way chute onto the crate platform, push the crate east onto Plate A, and escape via Gate A!',
  },
  {
    id: 153, world: 8, name: 'Weight & Clock', maxTiles: 2,
    grid: [
      'S#M#a.',
      'XXXAXX',
      '..#.b.',
      'XXBXXX',
      '..#...',
      '...#..',
      '....#E',
    ],
    holdSwitches: ['g1'],
    timedDurations: { g2: 3 },
    hint: 'Park the crate on Plate A to unlock the middle hall, then beat the 3-move clock on Timed Gate B!',
  },
  {
    id: 154, world: 8, name: 'Glacier Freight', maxTiles: 2,
    grid: [
      'S#MIIa',
      'XXAXXX',
      '..#...',
      '.#MIIb',
      'XXXXBX',
      '....#.',
      '..#.E.',
    ],
    holdSwitches: ['g1', 'g2'],
    hint: 'Slide both crates across consecutive frozen runways to lock Weighted Plates A and B!',
  },
  {
    id: 155, world: 8, name: 'Sanctum Pillars', maxTiles: 2,
    grid: [
      'S####.',
      '.#XM#.',
      '.###a.',
      'XXXAXX',
      '...#..',
      '.#....',
      'E.....',
    ],
    stars: [{ x: 1, y: 5 }],
    holdSwitches: ['g1'],
    hint: 'Approach the crate from above without pinning it against the pillar, push it onto Plate A, and grab the gem!',
  },
  {
    id: 156, world: 8, name: 'Warp & Boost', maxTiles: 1,
    grid: [
      'S.#+1X',
      'XXXXXX',
      '1#MIIa',
      'XXAXXX',
      '..#...',
      '....#.',
      '.....E',
    ],
    stars: [{ x: 4, y: 5 }],
    holdSwitches: ['g1'],
    hint: 'Collect the +1 Bonus Tile, warp through Portal 1, glide the crate onto Plate A, and bridge to the exit!',
  },
  {
    id: 157, world: 8, name: 'Brittle Freight', maxTiles: 2,
    grid: [
      'S#..C.',
      'XXXX#X',
      'aIIM#.',
      'XXXAXX',
      '...#..',
      '....#.',
      '..E...',
    ],
    stars: [{ x: 4, y: 5 }],
    holdSwitches: ['g1'],
    hint: 'Cross the crumbling checkpoint, shove the crate west across ice onto Plate A, and grab the lower gem!',
  },
  {
    id: 158, world: 8, name: 'Clockwork Sanctum', maxTiles: 2,
    grid: [
      'S.#M#a',
      'XXXAXX',
      '.#..b.',
      'XXXBXX',
      '...#..',
      '......',
      'E..#..',
    ],
    stars: [{ x: 1, y: 2 }],
    holdSwitches: ['g1'],
    timedDurations: { g2: 3 },
    hint: 'Hold Gate A open with the crate, grab the gem first, then sprint from Timed Switch b through Gate B!',
  },
  {
    id: 159, world: 8, name: 'Twin Sanctums', maxTiles: 2,
    grid: [
      '1S#M#a',
      'XXXXXX',
      '1.#A..',
      'XXXX#.',
      'bIIM#.',
      'XXXBXX',
      '...#E.',
    ],
    stars: [{ x: 2, y: 2 }],
    holdSwitches: ['g1', 'g2'],
    hint: 'Park Crate 1 on Plate A, take Portal 1, pass Gate A, then glide Crate 2 west onto Plate B!',
  },
  {
    id: 160, world: 8, name: 'Sanctum Grandmaster', maxTiles: 1,
    grid: [
      'S.#+..',
      '.#MIIa',
      'XXAXXX',
      '1.C#.#',
      'XXXXXX',
      'X#..b1',
      'EBXXXX',
    ],
    stars: [{ x: 5, y: 3 }],
    holdSwitches: ['g1'],
    timedDurations: { g2: 4 },
    hint: 'The ultimate 160th puzzle! Grab +1, shove the crate across ice onto Plate A, grab the gem, cross crumbling stone to Portal 1, and beat Timed Gate B!',
  },
];

drafts.push(...world8Drafts);

// =========================================================================
// WORLD 9: SKYWARD SPIRE (Levels 161–180) — Springboard Launch Pads (J)
// =========================================================================
const world9Drafts: GridLevelInput[] = [
  {
    id: 161, world: 9, name: 'First Leap', maxTiles: 2,
    grid: [
      '......',
      'S#JX#.',
      '..XX..',
      '....#.',
      '......',
      '..#..E',
      '......',
    ],
    stars: [{ x: 2, y: 5 }],
    hint: 'Step onto the golden Springboard (J) to vault 2 tiles forward right over rocks and void!',
  },
  {
    id: 162, world: 9, name: 'Rock Hurdle', maxTiles: 2,
    grid: [
      'S#JX#.',
      'XXXX#.',
      '....J.',
      'XXXXXX',
      '..#.#.',
      '......',
      'E..#..',
    ],
    stars: [{ x: 2, y: 4 }],
    hint: 'Vault east over the first wall, then step south onto the second springboard to clear the stone barrier!',
  },
  {
    id: 163, world: 9, name: 'Double Bounce', maxTiles: 2,
    grid: [
      'SJXJX#',
      'XXXXX.',
      '....#.',
      '..#...',
      '.#..#.',
      '..#...',
      '....#E',
    ],
    stars: [{ x: 5, y: 0 }, { x: 1, y: 4 }],
    hint: 'Step east onto the first springboard to chain-bounce straight across two barriers in a single leap!',
  },
  {
    id: 164, world: 9, name: 'Four-Way Pad', maxTiles: 2,
    grid: [
      '..#...',
      '..#...',
      'S#J.#.',
      'XXXXX.',
      '..#...',
      '..#...',
      '..E...',
    ],
    stars: [{ x: 4, y: 2 }],
    hint: 'Approach the central Springboard from the west to grab the eastern gem, then approach from the north to vault south!',
  },
  {
    id: 165, world: 9, name: 'Abyssal Hop', maxTiles: 1,
    grid: [
      'S.J..#',
      '.....J',
      '......',
      '......',
      '..J#.#',
      '#.....',
      'E.....',
    ],
    stars: [{ x: 5, y: 4 }],
    hint: 'With only 1 bridge tile, launch off springboards into void and reclaim your tile on the next island!',
  },
  {
    id: 166, world: 9, name: 'Honey Hurdle', maxTiles: 1,
    grid: [
      'S#H#.E',
      '#..XX#',
      '#JX##.',
      'XXXXXX',
      '......',
      '......',
      '......',
    ],
    hint: 'Stepping on sticky honey traps your only tile—detour south and use the Springboard to vault over the wall!',
  },
  {
    id: 167, world: 9, name: 'Spring & Slide', maxTiles: 2,
    grid: [
      'S#JX##',
      'XXXXI.',
      '....I.',
      '..#.I.',
      '....#.',
      '.#....',
      'E.....',
    ],
    stars: [{ x: 2, y: 3 }],
    hint: 'Launch over the rock wall, glide down the frozen runway, grab the mid-board gem, and bridge to the exit!',
  },
  {
    id: 168, world: 9, name: 'Ice Catapult', maxTiles: 2,
    grid: [
      'S#JXII',
      'XXXXXI',
      '#.#.##',
      '...J..',
      'XXXXXX',
      '...#..',
      '...E..',
    ],
    stars: [{ x: 0, y: 2 }],
    hint: 'Vault onto the frozen upper corner, collect the western gem, then approach the springboard from the north to vault south!',
  },
  {
    id: 169, world: 9, name: 'Cracked Landing', maxTiles: 2,
    grid: [
      'S#JXC.',
      'XXXX..',
      '....J.',
      'XXXXXX',
      '..C.#.',
      '.#....',
      'E.....',
    ],
    stars: [{ x: 4, y: 0 }, { x: 1, y: 5 }],
    hint: 'Vault onto crumbling checkpoints — plan your route cleanly before the fragile stones shatter behind you!',
  },
  {
    id: 170, world: 9, name: 'Switch Vault', maxTiles: 2,
    grid: [
      'S#JXa.',
      'XXXX#.',
      '.#.#J.',
      'XXXAXX',
      '...#..',
      '.#....',
      'E.....',
    ],
    stars: [{ x: 1, y: 2 }],
    hint: 'Vault into the upper switch vault, trigger Switch a, then use the lower springboard to pass Gate A!',
  },
  {
    id: 171, world: 9, name: 'Portal Bounce', maxTiles: 2,
    grid: [
      'S#JX1.',
      'XXXXXX',
      '1.#J..',
      '...X..',
      '...#..',
      '.#....',
      '....E.',
    ],
    stars: [{ x: 1, y: 5 }],
    hint: 'Launch right over the rock wall straight into Warp Portal 1, then bounce south to the exit!',
  },
  {
    id: 172, world: 9, name: 'Spark Vault', maxTiles: 1,
    grid: [
      'S#JX+.',
      'XXXX..',
      '....#.',
      '..#...',
      '......',
      '...E..',
      '......',
    ],
    stars: [{ x: 2, y: 3 }],
    hint: 'Vault east to collect the +1 Bonus Tile so you have enough reach to cross the southern void!',
  },
  {
    id: 173, world: 9, name: 'Clockwork Leap', maxTiles: 2,
    grid: [
      'a#JXA.',
      'SXXX#.',
      '....#.',
      '..#...',
      '......',
      '...#.E',
      '......',
    ],
    stars: [{ x: 2, y: 3 }],
    timedDurations: { g1: 3 },
    hint: 'Press Timed Switch a and immediately springboard over the wall straight onto Gate A before it shuts!',
  },
  {
    id: 174, world: 9, name: 'Crate & Vault', maxTiles: 2,
    grid: [
      'S#M#a.',
      'XXJXXX',
      '..X...',
      '..#A..',
      'XXX#..',
      '..#...',
      '....E.',
    ],
    stars: [{ x: 2, y: 5 }],
    holdSwitches: ['g1'],
    hint: 'Shove the crate onto Weighted Plate a, then step south onto the springboard to vault right over the barrier!',
  },
  {
    id: 175, world: 9, name: 'Arrow Launch', maxTiles: 2,
    grid: [
      'S#>JX#',
      'XXXXX.',
      '....v#',
      '....J.',
      'XXXXXX',
      '..#.#.',
      'E.....',
    ],
    stars: [{ x: 2, y: 5 }],
    hint: 'Follow the one-way arrow onto the first springboard, ride south into the second leap, and sweep the gem!',
  },
  {
    id: 176, world: 9, name: 'Twin Springs', maxTiles: 2,
    grid: [
      'S.J.#.',
      '..X...',
      '#.#.J.',
      'XXX.X.',
      '..#.#.',
      '......',
      'E..#..',
    ],
    stars: [{ x: 0, y: 2 }, { x: 4, y: 0 }],
    hint: 'Use both omni-directional springboards from multiple angles to sweep both upper gems before leaping south!',
  },
  {
    id: 177, world: 9, name: 'Double Gate Spire', maxTiles: 2,
    grid: [
      'S#aJX#',
      'XXXXXA',
      '1.#b#.',
      'XXXXXX',
      '1#JXB#',
      '....#.',
      '..E...',
    ],
    stars: [{ x: 2, y: 2 }],
    hint: 'Unlock Gate A, vault over the top wall, grab the gem and Switch b, warp through Portal 1, and vault through Gate B!',
  },
  {
    id: 178, world: 9, name: 'Frozen Freight Vault', maxTiles: 2,
    grid: [
      'S#MIIa',
      'XXJXXX',
      '..X...',
      '..#A.#',
      'XXXX.#',
      '...#..',
      '.E....',
    ],
    stars: [{ x: 5, y: 3 }],
    holdSwitches: ['g1'],
    hint: 'Glide the crate across ice onto Weighted Plate a, vault south off the springboard, grab the gem, and exit!',
  },
  {
    id: 179, world: 9, name: 'Skyward Labyrinth', maxTiles: 2,
    grid: [
      'S#JX1.',
      'XXXXXX',
      '1#C#..',
      'XXXJXX',
      '.#.X..',
      '.#H#..',
      'E.....',
    ],
    stars: [{ x: 1, y: 4 }, { x: 3, y: 5 }],
    hint: 'Vault into Portal 1, cross the crumbling stone, bounce south over the divide, and avoid the sticky honey trap!',
  },
  {
    id: 180, world: 9, name: 'Spire Grandmaster', maxTiles: 1,
    grid: [
      'S#+M#a',
      'XXXJXX',
      '...X..',
      '..#A.b',
      'XXXXJ.',
      '.#..X.',
      'E..#B#',
    ],
    stars: [{ x: 1, y: 5 }],
    holdSwitches: ['g1'],
    timedDurations: { g2: 2 },
    hint: 'The 180th grand finale! Grab +1, park the crate on Plate a, vault south through Gate A, hit Timed Switch b, and leap straight into Gate B!',
  },
];

drafts.push(...world9Drafts);

// =========================================================================
// WORLD 10: CELESTIAL CROWN (Levels 181–200) — Golden Keys (K) & Vault Locks (L)
// =========================================================================
const world10Drafts: GridLevelInput[] = [
  {
    id: 181, world: 10, name: 'Golden Key', maxTiles: 2,
    grid: [
      'S..#..',
      '.....K',
      'XXLXXX',
      '..#...',
      '......',
      '...#.E',
      '......',
    ],
    stars: [{ x: 3, y: 5 }],
    hint: 'Collect the floating Golden Key (K) on the eastern island, then step onto the Locked Vault (L) to open it permanently!',
  },
  {
    id: 182, world: 10, name: 'Twin Vaults', maxTiles: 2,
    grid: [
      'S.#..K',
      'XXX#XX',
      'XXXLXX',
      '#..#K.',
      'XXXXLX',
      '..#.#.',
      'E.....',
    ],
    stars: [{ x: 0, y: 3 }],
    hint: 'Unlock the first vault, sweep the western gem and second key, then unlock the southern vault!',
  },
  {
    id: 183, world: 10, name: 'Choice of Locks', maxTiles: 2,
    grid: [
      'S.#K..',
      'XLXXLX',
      '#X..#K',
      'XX..XX',
      '..#LX.',
      '....#.',
      '....E.',
    ],
    stars: [{ x: 2, y: 4 }],
    hint: 'One vault is a dead end—spend your first key on the eastern vault to reach the second key and exit!',
  },
  {
    id: 184, world: 10, name: 'Gilded Honey', maxTiles: 1,
    grid: [
      'S#H#KX',
      '#..X.X',
      '#.#.#X',
      'XXXXLX',
      '....#.',
      '....E.',
      '......',
    ],
    hint: 'Avoid trapping your only tile in the honey—detour south around the honey, snatch the Key, and unlock Vault L!',
  },
  {
    id: 185, world: 10, name: 'Brittle Keychain', maxTiles: 2,
    grid: [
      'S..C.K',
      'XXX..#',
      'XXXLXX',
      '..#...',
      '.#..#.',
      '......',
      '....#E',
    ],
    stars: [{ x: 1, y: 4 }],
    hint: 'Cross the crumbling stone to grab the Golden Key, then bridge back to unlock Vault L!',
  },
  {
    id: 186, world: 10, name: 'Frozen Keychain', maxTiles: 2,
    grid: [
      'S#IIK.',
      'XXXXX.',
      '..#L##',
      'XXX#XX',
      '..#...',
      '...#.#',
      '...E..',
    ],
    stars: [{ x: 5, y: 5 }],
    hint: 'Glide east across the frozen runway to grab the key, loop around to unlock Vault L, and grab the gem!',
  },
  {
    id: 187, world: 10, name: 'Spring for the Key', maxTiles: 2,
    grid: [
      'S#JXK.',
      'XXXX#.',
      '..#.#.',
      'XXLXXX',
      '..#...',
      '....#.',
      '.....E',
    ],
    stars: [{ x: 4, y: 5 }],
    hint: 'Launch east over the wall to snag the Golden Key, loop around to unlock Vault L, and bridge to the exit!',
  },
  {
    id: 188, world: 10, name: 'Vaulting Launch', maxTiles: 2,
    grid: [
      'S.#..K',
      '..J#..',
      'XXXXX.',
      '..L...',
      '..#...',
      '....#.',
      '.....E',
    ],
    stars: [{ x: 4, y: 5 }],
    hint: 'Grab the Key first, then step south onto Springboard J to vault straight onto Locked Vault L—unlocking it on landing!',
  },
  {
    id: 189, world: 10, name: 'Portal Treasury', maxTiles: 2,
    grid: [
      'S.#1.X',
      'XXXXLX',
      '1#KX#.',
      'XXXX#.',
      '..#...',
      '....#.',
      '..E...',
    ],
    stars: [{ x: 4, y: 5 }],
    hint: 'Warp through Portal 1 to collect the Key inside the sealed vault, warp back, and unlock Vault L!',
  },
  {
    id: 190, world: 10, name: 'Spark & Key', maxTiles: 1,
    grid: [
      'S#+..K',
      'XXXX..',
      'XXXXLX',
      'XXXX#X',
      '..#...',
      '......',
      '...E..',
    ],
    stars: [{ x: 2, y: 4 }],
    hint: 'Grab the +1 Bonus Tile first so you can bridge across to the Key, unlock Vault L, and finish!',
  },
  {
    id: 191, world: 10, name: 'One-Way Vault', maxTiles: 2,
    grid: [
      'S.#>K.',
      'XXXX.X',
      '....v.',
      'XXXXLX',
      '..#.#.',
      '.#....',
      'E.....',
    ],
    stars: [{ x: 1, y: 5 }],
    hint: 'Ride the one-way arrows to claim the Key, dive south through Vault L, and sweep the gem!',
  },
  {
    id: 192, world: 10, name: 'Key & Laser', maxTiles: 2,
    grid: [
      'S#K.LX',
      'XXXXaX',
      '..#..#',
      'XXXAXX',
      '...#..',
      '.#....',
      '....E.',
    ],
    stars: [{ x: 1, y: 5 }],
    hint: 'Collect the Key, unlock Vault L to reach Switch a, open Laser Gate A, and claim the southern gem!',
  },
  {
    id: 193, world: 10, name: 'Timed Treasury', maxTiles: 2,
    grid: [
      'S.#K..',
      'XXXaL#',
      'XXXX#.',
      'XXXXA.',
      '..#.#.',
      '......',
      'E..#..',
    ],
    stars: [{ x: 2, y: 4 }],
    timedDurations: { g1: 3 },
    hint: 'Unlock Vault L FIRST with your Key, then step back onto Timed Switch a and sprint through Gate A before it shuts!',
  },
  {
    id: 194, world: 10, name: 'Crate Behind Lock', maxTiles: 2,
    grid: [
      'S#ML#a',
      'K###XX',
      'XXAXXX',
      '..#...',
      '.#....',
      '...#..',
      '.....E',
    ],
    stars: [{ x: 1, y: 4 }],
    holdSwitches: ['g1'],
    hint: 'Unlock Vault L first so it becomes solid ground—then shove the heavy Crate right across it onto Weighted Plate a!',
  },
  {
    id: 195, world: 10, name: 'Glacial Vault Freight', maxTiles: 2,
    grid: [
      'S#MLIa',
      'K###XX',
      'XXAXXX',
      '..#...',
      '....#.',
      '..#...',
      'E.....',
    ],
    stars: [{ x: 4, y: 4 }],
    holdSwitches: ['g1'],
    hint: 'Snatch the Key, unlock Vault L, then glide Crate M across Ice onto Weighted Plate a!',
  },
  {
    id: 196, world: 10, name: 'Double Bounce Key', maxTiles: 2,
    grid: [
      'SJXJXK',
      'XXXXX.',
      '..#L#.',
      'XXX#XX',
      '..#...',
      '....#.',
      '..E...',
    ],
    stars: [{ x: 4, y: 5 }],
    hint: 'Double-bounce across both springboards straight to the Key, then loop back to unlock Vault L!',
  },
  {
    id: 197, world: 10, name: 'Twin Keys & Gates', maxTiles: 2,
    grid: [
      'S#K.L1',
      'XXXXXX',
      '1#a#K.',
      'XXXAXX',
      '..#L#.',
      '....#.',
      '..E...',
    ],
    stars: [{ x: 4, y: 5 }],
    hint: 'Unlock Vault 1 to reach Portal 1, press Switch a and grab Key 2, pass Gate A, and unlock the final Vault!',
  },
  {
    id: 198, world: 10, name: 'Clockwork Crown', maxTiles: 2,
    grid: [
      'S#KXXX',
      'XLXXXX',
      'Xa#JXA',
      'XXXXX.',
      '....#.',
      '..#...',
      'E..#..',
    ],
    stars: [{ x: 2, y: 5 }],
    timedDurations: { g1: 3 },
    hint: 'Grab the Key, unlock Vault L, press Timed Switch a, and launch east off Springboard J straight onto Gate A!',
  },
  {
    id: 199, world: 10, name: 'Astral Gauntlet', maxTiles: 2,
    grid: [
      'S#K.C.',
      'XXXXLX',
      'aIIM#.',
      'XXXJXX',
      '...XXX',
      '...#A#',
      '...XXE',
    ],
    stars: [{ x: 5, y: 5 }],
    holdSwitches: ['g1'],
    hint: 'Snatch the Key, cross the crumbling stone to unlock Vault L, glide the crate onto Plate a, and vault south through Gate A!',
  },
  {
    id: 200, world: 10, name: 'Celestial Crown', maxTiles: 1,
    grid: [
      'S#+KXX',
      'X#ML#a',
      'XXXJXX',
      'XXXXXX',
      'XXXA.b',
      'XXXXBX',
      'E..#.#',
    ],
    stars: [{ x: 5, y: 6 }],
    holdSwitches: ['g1'],
    timedDurations: { g2: 2 },
    hint: 'The 200th Grand Finale! Grab +1 & the Key, unlock Vault L, shove Crate M across it onto Plate a, vault through Gate A, beat Timed Gate B, and claim the Crown!',
  },
];

drafts.push(...world10Drafts);

// =========================================================================
// WORLD 11: CHRONO PRISM (Levels 201 - 220) — Bridge-Parity Phase-Shift Tiles
//   P = Cyan Even Phase Tile (solid when 0, 2, 4... bridge tiles placed)
//   Q = Magenta Odd Phase Tile (solid when 1, 3, 5... bridge tiles placed)
// =========================================================================
const world11Drafts: GridLevelInput[] = [
  {
    id: 201, world: 11, name: 'First Phase', maxTiles: 1,
    grid: [
      '......',
      '......',
      'S.QP.Q',
      '.....P',
      '......',
      '.....E',
      '......',
    ],
    hint: 'Drop 1 bridge tile (odd) to materialize Magenta Q! Landing reclaims to 0 (even) so adjacent Cyan P glows solid!',
  },
  {
    id: 202, world: 11, name: 'Two-Step Resonance', maxTiles: 2,
    grid: [
      'S..P..',
      '......',
      '......',
      '...P..',
      '......',
      '......',
      '...E..',
    ],
    hint: 'Cyan P is solid at 0 or 2 bridge tiles! Bridge 2 void cells in a row so Cyan P materializes right as you reach it!',
  },
  {
    id: 203, world: 11, name: 'Prism Hopscotch', maxTiles: 2,
    grid: [
      'S.Q...',
      '......',
      '......',
      '..P.Q.',
      '......',
      '....P.',
      '....E.',
    ],
    stars: [{ x: 2, y: 3 }],
    hint: 'Use 1-tile hops onto Magenta Q and 2-tile bridges onto Cyan P to hopscotch across the prism!',
  },
  {
    id: 204, world: 11, name: 'Mirror Parity', maxTiles: 2,
    grid: [
      'S.X...',
      '..X...',
      '.PX...',
      '..Q...',
      '....P.',
      '...XQ.',
      '....E.',
    ],
    stars: [{ x: 1, y: 2 }],
    hint: 'Curve 2 bridge tiles down to Cyan P (so 2 tiles = even!), then 1-bridge to Magenta Q, 2-bridge to Cyan P, and hop via Magenta Q to E!',
  },
  {
    id: 205, world: 11, name: 'Ruby Refraction', maxTiles: 1,
    grid: [
      'S.Q...',
      '..P...',
      '......',
      '..QP..',
      '....X.',
      '...Q..',
      '...PE.',
    ],
    stars: [{ x: 2, y: 1 }, { x: 3, y: 3 }],
    hint: 'Chain 1-tile hops to Magenta Q, reclaim to 0, then step straight onto adjacent Cyan P gems!',
  },
  {
    id: 206, world: 11, name: 'Prism Canyon', maxTiles: 2,
    grid: [
      'S..PX.',
      'XXX.X.',
      '...QX.',
      '...P..',
      '.PXX..',
      '...X..',
      '.E.X..',
    ],
    stars: [{ x: 3, y: 2 }],
    hint: 'Bridge 2 cells to Cyan P, hop 1 bridge south to Magenta Q, reclaim on Cyan P, and curve 2 tiles west onto the lower Cyan P!',
  },
  {
    id: 207, world: 11, name: 'Crumbling Phase', maxTiles: 1,
    grid: [
      'S.QC..',
      'XXX...',
      '...Q..',
      '...P..',
      'XXC.Q.',
      '....P.',
      '....E.',
    ],
    stars: [{ x: 3, y: 3 }],
    hint: 'Crumbling islands reclaim your bridge to 0 — chain them with 1-tile Magenta Q and 0-tile Cyan P pads!',
  },
  {
    id: 208, world: 11, name: 'Honey Shift', maxTiles: 2,
    grid: [
      'SHQ...',
      'XXP...',
      '......',
      '..Q...',
      '..P...',
      '......',
      '..Q.E.',
    ],
    stars: [{ x: 2, y: 1 }],
    hint: 'Sticky honey traps 1 tile forever, leaving you with 1 tile — rely on Magenta Q (1 tile) and Cyan P (0 tiles) to finish!',
  },
  {
    id: 209, world: 11, name: 'One-Way Spectrum', maxTiles: 2,
    grid: [
      'S..P>.',
      'XXXX.Q',
      '.....v',
      '..P..P',
      'XX....',
      '..Q...',
      'E.P...',
    ],
    stars: [{ x: 2, y: 3 }],
    hint: 'Ride the one-way prism circuit: 2 tiles to Cyan P, 1 tile to Magenta Q, exit south to Cyan P, and bridge 2 tiles west!',
  },
  {
    id: 210, world: 11, name: 'Frozen Phase', maxTiles: 2,
    grid: [
      'SIIP..',
      'XXX...',
      '......',
      '...P..',
      '..Q...',
      '..I...',
      '..I.PE',
    ],
    stars: [{ x: 3, y: 3 }],
    hint: 'Ice is solid ground (0 tiles out), so you glide right onto Cyan P! Then bridge 2 tiles south to the next Cyan P.',
  },
  {
    id: 211, world: 11, name: 'Parity Spark', maxTiles: 1,
    grid: [
      'S.Q+..',
      'XXX...',
      '......',
      '...P..',
      '......',
      '......',
      '...P.E',
    ],
    stars: [{ x: 3, y: 3 }],
    hint: 'With 1 tile you can only reach Magenta Q to grab the +1 Spark — with 2 tiles you unlock the 2-bridge Cyan P leaps!',
  },
  {
    id: 212, world: 11, name: 'Portal Shift', maxTiles: 2,
    grid: [
      'S..P1.',
      'XXXXXX',
      '1.Q...',
      '..P.Q.',
      '....P.',
      '......',
      '....QE',
    ],
    stars: [{ x: 2, y: 3 }],
    hint: 'Bridge 2 tiles to Cyan P and step into Portal 1, then descend through Magenta Q and Cyan P to the flag!',
  },
  {
    id: 213, world: 11, name: 'Phase Gatekeeper', maxTiles: 2,
    grid: [
      'S.Q..a',
      '......',
      'XXXXAX',
      '..Q.P.',
      '..P...',
      'E.....',
      '......',
    ],
    stars: [{ x: 4, y: 3 }],
    hint: 'Hop via Magenta Q to Switch a, pass through Gate A onto Cyan P, then cross Magenta Q and Cyan P to the exit!',
  },
  {
    id: 214, world: 11, name: 'Clockwork Prism', maxTiles: 2,
    grid: [
      'S.Qa..',
      '...P..',
      'XXXAXX',
      '...Q..',
      '...P..',
      '......',
      '...P.E',
    ],
    timedDurations: { g1: 3 },
    hint: 'Hit Timed Switch a, step across Cyan P into Gate A before the 3-move timer closes, then finish across the prism!',
  },
  {
    id: 215, world: 11, name: 'Sanctum Resonance', maxTiles: 2,
    grid: [
      'S#MPa.',
      '......',
      'XXXXAX',
      '....P.',
      '......',
      '....Q.',
      '..E.P.',
    ],
    holdSwitches: ['g1'],
    stars: [{ x: 4, y: 3 }],
    hint: 'While standing on solid ground (0 tiles), Cyan P is solid — shove Crate M right across Cyan P onto Hold Plate a!',
  },
  {
    id: 216, world: 11, name: 'Prism Vault', maxTiles: 2,
    grid: [
      'SJXP..',
      '..X...',
      '......',
      '...P..',
      '....Q.',
      '.PXJP.',
      'E.X...',
    ],
    stars: [{ x: 3, y: 3 }],
    hint: 'Springboards reclaim tiles to 0, so Cyan P catches your aerial vault! Bridge south, hop via Q to P, and springboard west to E!',
  },
  {
    id: 217, world: 11, name: 'Gilded Phase', maxTiles: 2,
    grid: [
      'S.QP.K',
      'XXXX..',
      '.....Q',
      '...Q.P',
      'XXXLXX',
      '.Q.P..',
      'EP....',
    ],
    stars: [{ x: 3, y: 3 }],
    hint: 'Cross Magenta Q & Cyan P for the Golden Key, hop south via Q & P to unlock Vault L into solid ground, and head west to E!',
  },
  {
    id: 218, world: 11, name: 'Double Spectrum', maxTiles: 2,
    grid: [
      'S.Qa..',
      'XXXAXX',
      '..bP..',
      'XXBXXX',
      '..P.Q.',
      '....P.',
      '....QE',
    ],
    stars: [{ x: 4, y: 4 }],
    hint: 'Toggle both prism laser gates while chaining Magenta Q (1-bridge) and Cyan P (0/2-bridge) islands!',
  },
  {
    id: 219, world: 11, name: 'Prism Gauntlet', maxTiles: 1,
    grid: [
      'S.Q+K.',
      'XXXX..',
      '......',
      'PXJLP.',
      '.XXXXX',
      'Q.....',
      'P..E..',
    ],
    stars: [{ x: 4, y: 3 }],
    hint: 'Grab +1 Spark and the Key via Magenta Q, bridge 2 tiles south to Cyan P, unlock Vault L, springboard west onto Cyan P, and hop to E!',
  },
  {
    id: 220, world: 11, name: 'Chrono Prism Finale', maxTiles: 1,
    grid: [
      'S.Q+KX',
      'XXXX.Q',
      'aPM#LX',
      'XAXXXX',
      'X.XXXX',
      'XQ.P..',
      'E..Q.P',
    ],
    holdSwitches: ['g1'],
    stars: [{ x: 5, y: 6 }],
    hint: 'The 220th Finale! Claim +1 & Key, hop via Magenta Q to unlock Vault L, push Crate M across Cyan P onto Plate a, descend Gate A, and claim the Prism!',
  },
];

drafts.push(...world11Drafts);

// =========================================================================
// WORLD 12: AETHER CURRENTS (Levels 221 - 240)
// Conveyor Belts: directional solid tracks that carry Puff & pushed Crates
// =========================================================================
const world12Drafts: GridLevelInput[] = [
  {
    id: 221, world: 12, name: 'First Current', maxTiles: 2,
    grid: [
      'Srrr#.',
      'XXXX..',
      '....#.',
      '....*.',
      '.#ll#.',
      '.d....',
      '.#..E.',
    ],
    hint: 'Step onto the glowing emerald Conveyor Belts to zip across lanes in a single move!',
  },
  {
    id: 222, world: 12, name: 'Void Launch', maxTiles: 2,
    grid: [
      'Srr..X',
      'XXX.XX',
      '...#..',
      '...Xd.',
      '....d.',
      '.ll.#.',
      '.#..E.',
    ],
    stars: [{ x: 3, y: 2 }, { x: 1, y: 6 }],
    hint: 'A conveyor belt can push you right off onto void—automatically dropping a bridge tile mid-ride!',
  },
  {
    id: 223, world: 12, name: 'Elbow Track', maxTiles: 2,
    grid: [
      'Srrrd.',
      'XXXXd.',
      '....d.',
      '..#.#.',
      '.dXXX.',
      '.d*...',
      '.#..E.',
    ],
    stars: [{ x: 4, y: 1 }],
    hint: 'Conveyor chains turn 90-degree corners automatically—ride the eastern elbow to sweep the first gem!',
  },
  {
    id: 224, world: 12, name: 'Counter Current', maxTiles: 2,
    grid: [
      'Srrr#.',
      'XXXX..',
      '.#ll#.',
      '..XXX.',
      '.#rr#.',
      'XXXX..',
      '...E..',
    ],
    stars: [{ x: 4, y: 0 }, { x: 1, y: 2 }],
    hint: 'Ride the top current east, drop south to catch the westbound return lane, then ride east to the exit!',
  },
  {
    id: 225, world: 12, name: 'Spiral Drift', maxTiles: 2,
    grid: [
      'Srrrd.',
      'XXX.d.',
      '.#lld.',
      '.dXXX.',
      '*..#d.',
      '.#..d.',
      '....E.',
    ],
    stars: [{ x: 4, y: 1 }, { x: 4, y: 5 }],
    hint: 'Follow the clockwise spiral current around the central granite core, sweep the western gem, and ride south to the exit!',
  },
  {
    id: 226, world: 12, name: 'Honey Slipstream', maxTiles: 2,
    grid: [
      'SrrH#.',
      'XXXX..',
      '.#ll#.',
      '.dXX..',
      '.dXX..',
      '.#rr#.',
      '....E.',
    ],
    stars: [{ x: 4, y: 2 }],
    hint: 'Sticky Honey steals 1 bridge tile when you leave it—use the western conveyor loop to bridge the rest with only 1 tile!',
  },
  {
    id: 227, world: 12, name: 'Crumbling Jetty', maxTiles: 2,
    grid: [
      'S..C..',
      'XXXd..',
      '#.ld..',
      '.XXX..',
      '.#rr#.',
      '....C.',
      '.E..#.',
    ],
    stars: [{ x: 0, y: 2 }, { x: 4, y: 4 }],
    hint: 'Recharge your bridges on Crumbling Stones before riding each conveyor across the chasms.',
  },
  {
    id: 228, world: 12, name: 'Gate Relay', maxTiles: 2,
    grid: [
      'Srrr#a',
      'XXXXX.',
      '.#ll#.',
      'X.XXXX',
      'XAXXXX',
      'Xd....',
      'X#rrE.',
    ],
    stars: [{ x: 3, y: 6 }],
    hint: 'Ride east to hit Switch A, ride west back across the return current, then pass through Gate A onto the final conveyor!',
  },
  {
    id: 229, world: 12, name: 'Portal Express', maxTiles: 2,
    grid: [
      'Srrr1X',
      'XXXXXX',
      '1rrrd.',
      'XXXXd.',
      '..#ld.',
      '..*XX.',
      '..#..E',
    ],
    hint: 'Ride the top belt straight into Portal 1 to emerge on the upper expressway, then follow the current south!',
  },
  {
    id: 230, world: 12, name: 'Chrono Current', maxTiles: 2,
    grid: [
      'S.aXXX',
      'X.d.XX',
      'X.rrdX',
      'XXXXdX',
      'X.#AdX',
      'X.*XXX',
      'X.#..E',
    ],
    timedDurations: { g1: 2 },
    hint: 'Hit timed Switch a, then ride the full conveyor chain in 1 move to slip through Gate A right before it snaps shut!',
  },
  {
    id: 231, world: 12, name: 'Cargo Line', maxTiles: 2,
    grid: [
      'S#MraX',
      '.XXXXX',
      '#...XX',
      'XXrrAX',
      'XXXX.X',
      '.#..*X',
      '....EX',
    ],
    holdSwitches: ['g1'],
    hint: 'Shove Crate M onto the eastbound conveyor belt—it rides onto Weighted Plate a to open Gate A for your conveyor dash!',
  },
  {
    id: 232, world: 12, name: 'Corner Freight', maxTiles: 2,
    grid: [
      'S#Mrrd',
      '.XXXXd',
      '.#..Xa',
      '.d..XX',
      '.#..A.',
      '....*.',
      '...#E.',
    ],
    holdSwitches: ['g1'],
    hint: 'Push Crate M onto the corner conveyor track—it turns the bend automatically and parks on Plate a!',
  },
  {
    id: 233, world: 12, name: 'Twin Freight', maxTiles: 2,
    grid: [
      'S#Mrda',
      '.XXX.X',
      '.#Mrdb',
      '.XXX.X',
      '.A..B.',
      '.d..*.',
      '.#..E.',
    ],
    holdSwitches: ['g1', 'g2'],
    hint: 'Send both crates along conveyor tracks onto Weighted Hold-Plates a and b to unlock the twin sanctum gates!',
  },
  {
    id: 234, world: 12, name: 'Frost Slipstream', maxTiles: 2,
    grid: [
      'SrrII#',
      'XXXXX.',
      '.#IIl#',
      '.dXXX.',
      '.#..*.',
      '.II...',
      '.#..E.',
    ],
    stars: [{ x: 5, y: 0 }, { x: 1, y: 2 }],
    hint: 'Conveyor momentum flows straight onto Ice Rinks—ride the belts to rocket across frozen stretches in 1 move!',
  },
  {
    id: 235, world: 12, name: 'Sky Launchpad', maxTiles: 2,
    grid: [
      'SrrJXE',
      'XXXX..',
      '.#ll#.',
      '.JXX..',
      '.X....',
      '.#rr#.',
      '....*.',
    ],
    hint: 'Conveyors feed directly into Golden Springboards—vault over granite walls and grab every gem before exiting!',
  },
  {
    id: 236, world: 12, name: 'Vault Courier', maxTiles: 2,
    grid: [
      'SrrK#.',
      'XXXX..',
      '.#ll#.',
      '.dXXX.',
      '.#rrL#',
      'XXXX..',
      '...E..',
    ],
    stars: [{ x: 1, y: 2 }],
    hint: 'Ride the northern belt to sweep the Golden Key, loop back west, and ride the southern current straight through Locked Vault L!',
  },
  {
    id: 237, world: 12, name: 'Parity Surge', maxTiles: 2,
    grid: [
      'Srr.Q.',
      'XXXX..',
      '...#P.',
      '.Qll#.',
      '..XXX.',
      '.P..*.',
      '...#E.',
    ],
    hint: 'Let the top conveyor push you 1 tile onto void—placing 1 bridge tile materializes Magenta Q (1·3) right ahead!',
  },
  {
    id: 238, world: 12, name: 'Spark Turbine', maxTiles: 1,
    grid: [
      'Srr+#.',
      'XXXX..',
      '....d.',
      '..#ld.',
      '..dXXX',
      '..*...',
      '..#..E',
    ],
    hint: 'You start with only 1 bridge tile! Ride the top belt to grab the +1 Spark so you can bridge the final chasm.',
  },
  {
    id: 239, world: 12, name: 'Sanctum Foundry', maxTiles: 2,
    grid: [
      'S#Mrrd',
      '.XXXXd',
      '.K..Xa',
      'XJXXXX',
      'XXXXXX',
      'X#rLAX',
      'XXXX*E',
    ],
    holdSwitches: ['g1'],
    hint: 'Ferry Crate M around the corner onto Plate a, claim Key K, springboard over the granite wall, and ride through Vault L and Gate A!',
  },
  {
    id: 240, world: 12, name: 'Grand Aether Finale', maxTiles: 1,
    grid: [
      'Srr+KX',
      'XXXX.d',
      'allM#d',
      'XAXXXX',
      'X.Q.LP',
      'X.XXX.',
      'E.llP.',
    ],
    holdSwitches: ['g1'],
    stars: [{ x: 5, y: 4 }],
    hint: 'The 240th Finale! Ride the current for +1 Spark & Key K, ferry Crate M west onto Plate a, cross Magenta Q to unlock Vault L, bridge 2 tiles onto Cyan P, and ride the final belt to E!',
  },
];

drafts.push(...world12Drafts);

console.log(`Validating all ${drafts.length} levels with Solid-Ground Reclamation & Quality Gates...\n`);

const validatedLevels: LevelDefinition[] = [];
const failures: string[] = [];
const worldPars: Record<number, number[]> = {
  1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
};

for (const draft of drafts) {
  const level = parseGridLevel(draft);
  const solution = solveLevel(level, 45);

  if (!solution.solvable) {
    failures.push(`Level ${level.id} ("${level.name}"): UNSOLVABLE!`);
    continue;
  }

  // Replay optimal solution to verify mechanic engagement
  const g = new PuzzleGame(level);
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

  for (let i = 1; i < solution.solutionPath.length; i++) {
    const step = solution.solutionPath[i];
    const r = g.move(step);
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

  // Quality Gate 1: Closed switches must be mandatory
  if (level.switches?.length) {
    const hasClosedDoor = level.switches.some((s) => !s.doorInitiallyOpen);
    if (hasClosedDoor && !usedSwitch) {
      failures.push(`Level ${level.id} ("${level.name}"): Switch/Door BYPASSED in optimal solution!`);
    }
    if (hasClosedDoor) {
      const lockedOnly: LevelDefinition = {
        ...level,
        switches: undefined,
        rocks: [
          ...(level.rocks || []),
          ...level.switches.filter((s) => !s.doorInitiallyOpen).map((s) => s.doorPos),
        ],
      };
      if (solveLevel(lockedOnly, 45).solvable) {
        failures.push(`Level ${level.id} ("${level.name}"): Closed door can be bypassed without switch!`);
      }
    }

    // Quality Gate 1b: Timed switches must have meaningful countdown tension
    const timedSwitches = level.switches.filter((s) => s.timedDuration && s.timedDuration > 0);
    for (const ts of timedSwitches) {
      const tighterLevel: LevelDefinition = {
        ...level,
        switches: level.switches.map((s) =>
          s.id === ts.id ? { ...s, timedDuration: Math.max(1, (s.timedDuration || 2) - 2) } : s
        ),
      };
      const tighterSol = solveLevel(tighterLevel, 45);
      if (tighterSol.solvable && tighterSol.minMoves <= solution.minMoves) {
        failures.push(
          `Level ${level.id} ("${level.name}"): Timed gate '${ts.id}' duration (${ts.timedDuration}) is too loose — even duration=${Math.max(1, (ts.timedDuration || 2) - 2)} solves in ${tighterSol.minMoves} moves!`
        );
      }
    }
  }

  if (level.locks?.length) {
    if (!usedKey || !usedLock) {
      failures.push(`Level ${level.id} ("${level.name}"): Key/Vault Lock BYPASSED in optimal solution!`);
    } else {
      const sealedVaults: LevelDefinition = {
        ...level,
        locks: undefined,
        rocks: [...(level.rocks || []), ...level.locks],
      };
      if (solveLevel(sealedVaults, 45).solvable) {
        failures.push(`Level ${level.id} ("${level.name}"): Locked vault can be bypassed without a key!`);
      }
    }
  }

  if (level.phaseTiles?.length) {
    const noPhaseSol = solveLevel({ ...level, phaseTiles: undefined }, 45);
    if (noPhaseSol.solvable && noPhaseSol.minMoves <= solution.minMoves) {
      failures.push(
        `Level ${level.id} ("${level.name}"): Phase-Shift tiles NOT needed (par=${solution.minMoves}, withoutPhase=${noPhaseSol.minMoves})!`
      );
    }
  }

  if (level.conveyors?.length) {
    if (!usedConveyor) {
      failures.push(`Level ${level.id} ("${level.name}"): Conveyor belt UNUSED in optimal solution!`);
    } else {
      const asFixedSol = solveLevel(
        {
          ...level,
          conveyors: undefined,
          fixed: [...(level.fixed || []), ...level.conveyors.map((c) => ({ x: c.x, y: c.y }))],
        },
        45
      );
      if (asFixedSol.solvable && asFixedSol.minMoves === solution.minMoves) {
        failures.push(
          `Level ${level.id} ("${level.name}"): Conveyor propulsion had NO par impact vs plain islands (par=${solution.minMoves})!`
        );
      }
    }
  }

  if (level.crates?.length && !usedCrate) {
    failures.push(`Level ${level.id} ("${level.name}"): Pushable crate UNUSED in optimal solution!`);
  }

  if (level.springs?.length && !usedSpring) {
    failures.push(`Level ${level.id} ("${level.name}"): Springboard UNUSED in optimal solution!`);
  }

  if (level.teleporters?.length && !usedTeleport) {
    failures.push(`Level ${level.id} ("${level.name}"): Teleporter UNUSED in optimal solution!`);
  }

  if (level.crumbling?.length && !usedCrumble) {
    failures.push(`Level ${level.id} ("${level.name}"): Crumbling tile UNUSED in optimal solution!`);
  }

  if (level.oneWay?.length && !usedOneWay) {
    failures.push(`Level ${level.id} ("${level.name}"): One-way tile UNUSED in optimal solution!`);
  }

  if (level.ice?.length && !usedIce) {
    failures.push(`Level ${level.id} ("${level.name}"): Ice tile UNUSED in optimal solution!`);
  }

  if (level.bonusTiles?.length) {
    if (!usedBonusTile) {
      failures.push(`Level ${level.id} ("${level.name}"): Bonus tile UNUSED in optimal solution!`);
    } else {
      const noBonusSol = solveLevel({ ...level, bonusTiles: undefined }, 45);
      if (noBonusSol.solvable && noBonusSol.minMoves <= solution.minMoves) {
        failures.push(
          `Level ${level.id} ("${level.name}"): Bonus tile NOT needed (par=${solution.minMoves}, withoutBonus=${noBonusSol.minMoves})!`
        );
      }
    }
  }

  if (level.sticky?.length && !hitSticky) {
    const noSticky: LevelDefinition = { ...level, sticky: undefined };
    const noStickySol = solveLevel(noSticky, 45);
    if (noStickySol.solvable && noStickySol.minMoves >= solution.minMoves) {
      failures.push(
        `Level ${level.id} ("${level.name}"): Sticky tile has NO effect (par=${solution.minMoves}, withoutSticky=${noStickySol.minMoves})!`
      );
    }
  }

  level.parMoves = solution.minMoves;
  level.star2Moves = solution.minMoves + Math.max(2, Math.ceil(solution.minMoves * 0.25));
  validatedLevels.push(level);
  worldPars[level.world].push(level.parMoves);

  console.log(
    `✓ L${String(level.id).padStart(3, ' ')} [W${level.world}] "${level.name.padEnd(23, ' ')}" par=${String(level.parMoves).padStart(2, ' ')} tiles=${level.maxTiles} states=${solution.statesExplored}`
  );
}

console.log('\n--- World Par Curve ---');
for (const w of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
  const arr = worldPars[w];
  if (arr.length) {
    const avg = (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
    console.log(`World ${w}: count=${arr.length}, min=${Math.min(...arr)}, max=${Math.max(...arr)}, avg=${avg}`);
  }
}

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} QUALITY GATE FAILURES:`);
  for (const f of failures) console.error('  -', f);
  process.exit(1);
}

if (validatedLevels.length !== 240) {
  console.error(`Expected 240 levels, got ${validatedLevels.length}`);
  process.exit(1);
}

const fileContent = `// AUTO-GENERATED & SOLVER-VALIDATED LEVELS DATA
// 240 Handcrafted levels across 12 worlds — verified with Solid-Ground Reclamation & Quality Gates
import { LevelDefinition } from '../engine/types';

export const ALL_LEVELS: LevelDefinition[] = ${JSON.stringify(validatedLevels, null, 2)};

export const WORLDS = [
  { id: 1, name: 'First Steps', levels: [1, 20], theme: 'floating-sky', description: 'Master bridge reach, island reclamation, and gem detours.' },
  { id: 2, name: 'Think Ahead', levels: [21, 40], theme: 'candy-world', description: 'Navigate rock walls, tight corridors, and limited tile budgets.' },
  { id: 3, name: 'Tricky Tiles', levels: [41, 60], theme: 'ocean-islands', description: 'Master sticky honey sacrifices, crumbling checkpoints, and one-way arrows.' },
  { id: 4, name: 'Open the Way', levels: [61, 80], theme: 'neon-space', description: 'Unlock enclosed laser gates and warp across impassable divides.' },
  { id: 5, name: 'Master Builder', levels: [81, 100], theme: 'forest-adventure', description: 'Combine every mechanic in intricate multi-stage master puzzles.' },
  { id: 6, name: 'Frost & Spark', levels: [101, 120], theme: 'arctic-frost', description: 'Glide across frozen ice rinks and collect +1 Bonus Tiles to expand your reach.' },
  { id: 7, name: 'Clockwork Forge', levels: [121, 140], theme: 'clockwork-forge', description: 'Race countdown switches and timed gates across mechanical gauntlets.' },
  { id: 8, name: 'Obsidian Sanctum', levels: [141, 160], theme: 'crate-sanctum', description: 'Push heavy crates onto weighted pressure plates to unlock ancient sanctum gates.' },
  { id: 9, name: 'Skyward Spire', levels: [161, 180], theme: 'skyward-spire', description: 'Vault 2 tiles over walls and chasms with golden springboard launch pads.' },
  { id: 10, name: 'Celestial Crown', levels: [181, 200], theme: 'celestial-crown', description: 'Collect golden keys to unlock sealed vaults permanently into solid ground.' },
  { id: 11, name: 'Chrono Prism', levels: [201, 220], theme: 'chrono-prism', description: 'Master Bridge-Parity Phase Tiles that materialize on even or odd bridge counts.' },
  { id: 12, name: 'Aether Currents', levels: [221, 240], theme: 'aether-currents', description: 'Ride directional conveyor belts that propel Puff and pushable crates across chasms.' },
];
`;

const outputPath = path.resolve(process.cwd(), 'src/levels/levelsData.ts');
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`\n✅ ALL 240 LEVELS PASSED EVERY QUALITY GATE! Generated ${outputPath}`);
