import * as fs from 'fs';
import * as path from 'path';
import {
  LevelDefinition,
  Coordinate,
  OneWayTile,
  SwitchDoorPair,
  TeleporterPair,
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
   *  + = fixed island containing a +1 Bonus Tile pickup
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
  const bonusTiles: Coordinate[] = [...(input.bonusTiles || [])];
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
        case '+':
          fixed.push(coord);
          bonusTiles.push(coord);
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

  const switches: SwitchDoorPair[] = [];
  for (const id of Object.keys(switchPositions)) {
    const door = doorPositions[id];
    if (!door) throw new Error(`Level ${input.id} switch '${id}' missing matching door`);
    switches.push({
      id,
      switchPos: switchPositions[id],
      doorPos: door.pos,
      ...(door.initiallyOpen ? { doorInitiallyOpen: true } : {}),
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
  if (bonusTiles.length) level.bonusTiles = bonusTiles;
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

console.log(`Validating all ${drafts.length} levels with Solid-Ground Reclamation & Quality Gates...\n`);

const validatedLevels: LevelDefinition[] = [];
const failures: string[] = [];
const worldPars: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

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
  let usedBonusTile = false;

  const oneWayKeys = new Set((level.oneWay || []).map((o) => `${o.x},${o.y}`));
  const crumblingKeys = new Set((level.crumbling || []).map((c) => `${c.x},${c.y}`));
  const iceKeys = new Set((level.ice || []).map((c) => `${c.x},${c.y}`));

  for (let i = 1; i < solution.solutionPath.length; i++) {
    const step = solution.solutionPath[i];
    const r = g.move(step);
    if (r.doorToggled) usedSwitch = true;
    if (r.teleportedTo) usedTeleport = true;
    if (r.trappedTile) hitSticky = true;
    if (r.crumbledTile || crumblingKeys.has(`${step.x},${step.y}`)) usedCrumble = true;
    if (oneWayKeys.has(`${step.x},${step.y}`)) usedOneWay = true;
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
for (const w of [1, 2, 3, 4, 5, 6]) {
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

if (validatedLevels.length !== 120) {
  console.error(`Expected 120 levels, got ${validatedLevels.length}`);
  process.exit(1);
}

const fileContent = `// AUTO-GENERATED & SOLVER-VALIDATED LEVELS DATA
// 120 Handcrafted levels across 6 worlds — verified with Solid-Ground Reclamation & Quality Gates
import { LevelDefinition } from '../engine/types';

export const ALL_LEVELS: LevelDefinition[] = ${JSON.stringify(validatedLevels, null, 2)};

export const WORLDS = [
  { id: 1, name: 'First Steps', levels: [1, 20], theme: 'floating-sky', description: 'Master bridge reach, island reclamation, and gem detours.' },
  { id: 2, name: 'Think Ahead', levels: [21, 40], theme: 'candy-world', description: 'Navigate rock walls, tight corridors, and limited tile budgets.' },
  { id: 3, name: 'Tricky Tiles', levels: [41, 60], theme: 'ocean-islands', description: 'Master sticky honey sacrifices, crumbling checkpoints, and one-way arrows.' },
  { id: 4, name: 'Open the Way', levels: [61, 80], theme: 'neon-space', description: 'Unlock enclosed laser gates and warp across impassable divides.' },
  { id: 5, name: 'Master Builder', levels: [81, 100], theme: 'forest-adventure', description: 'Combine every mechanic in intricate multi-stage master puzzles.' },
  { id: 6, name: 'Frost & Spark', levels: [101, 120], theme: 'arctic-frost', description: 'Glide across frozen ice rinks and collect +1 Bonus Tiles to expand your reach.' },
];
`;

const outputPath = path.resolve(process.cwd(), 'src/levels/levelsData.ts');
fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`\n✅ ALL 120 LEVELS PASSED EVERY QUALITY GATE! Generated ${outputPath}`);
