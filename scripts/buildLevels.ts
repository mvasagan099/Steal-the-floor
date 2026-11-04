import * as fs from 'fs';
import * as path from 'path';
import { LevelDefinition, Coordinate, OneWayTile, SwitchDoorPair, TeleporterPair } from '../src/engine/types';
import { solveLevel } from '../src/engine/solver';

interface LevelDraft {
  id: number;
  world: number;
  name: string;
  cols?: number;
  rows?: number;
  maxTiles?: number;
  start: Coordinate;
  exit: Coordinate;
  fixed?: Coordinate[];
  rocks?: Coordinate[];
  sticky?: Coordinate[];
  crumbling?: Coordinate[];
  oneWay?: OneWayTile[];
  switches?: SwitchDoorPair[];
  teleporters?: TeleporterPair[];
  stars?: Coordinate[];
  hint?: string;
}

const levelsDraft: LevelDraft[] = [];

// Helper to push level
function addLevel(draft: LevelDraft) {
  levelsDraft.push({
    cols: 6,
    rows: 7,
    maxTiles: 3,
    ...draft,
  });
}

// ==========================================
// WORLD 1: FIRST STEPS (Levels 1 - 20)
// Mechanics: Movement, tile placement, tile recovery, reaching exit, stars
// ==========================================
addLevel({
  id: 1, world: 1, name: "First Steps",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  fixed: [{ x: 2, y: 3 }],
  hint: "Tap the empty space ahead to drop a floor tile and walk."
});

addLevel({
  id: 2, world: 1, name: "Crossing the Gap",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 2 },
  hint: "You have 3 reusable tiles. Bridge the void between the islands."
});

addLevel({
  id: 3, world: 1, name: "The Corner",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 4 },
  fixed: [{ x: 1, y: 4 }],
  hint: "Turn the corner! As you leave your old tile, it returns to your inventory."
});

addLevel({
  id: 4, world: 1, name: "First Star",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  stars: [{ x: 3, y: 3 }],
  hint: "Collect the star on your way to the exit flag."
});

addLevel({
  id: 5, world: 1, name: "Zigzag Meadow",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  fixed: [{ x: 4, y: 1 }, { x: 1, y: 3 }, { x: 4, y: 3 }],
  hint: "Hop from island to island."
});

addLevel({
  id: 6, world: 1, name: "Two Bridges",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  fixed: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  stars: [{ x: 1, y: 3 }],
  hint: "Visit the left island to collect the star before crossing."
});

addLevel({
  id: 7, world: 1, name: "Stash & Fetch",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 4 },
  maxTiles: 2,
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  hint: "With only 2 tiles, plan each step so you never get stranded."
});

addLevel({
  id: 8, world: 1, name: "Star Collector",
  start: { x: 2, y: 5 }, exit: { x: 2, y: 1 },
  fixed: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  stars: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  hint: "Collect both stars before reaching the goal!"
});

addLevel({
  id: 9, world: 1, name: "Wide River",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  hint: "The central islands give you a safe resting spot."
});

addLevel({
  id: 10, world: 1, name: "Spiral Walk",
  start: { x: 1, y: 1 }, exit: { x: 3, y: 3 },
  fixed: [{ x: 4, y: 1 }, { x: 4, y: 5 }, { x: 1, y: 5 }],
  stars: [{ x: 4, y: 5 }],
  hint: "Follow the outer perimeter around to the center."
});

addLevel({
  id: 11, world: 1, name: "Island Hopping",
  start: { x: 0, y: 1 }, exit: { x: 5, y: 5 },
  fixed: [{ x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 5 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Step across the stepping stones diagonally."
});

addLevel({
  id: 12, world: 1, name: "Double Trouble",
  start: { x: 1, y: 3 }, exit: { x: 4, y: 3 },
  maxTiles: 2,
  fixed: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  stars: [{ x: 2, y: 2 }],
  hint: "2 tiles are enough if you reuse each tile immediately."
});

addLevel({
  id: 13, world: 1, name: "The Bridge Loop",
  start: { x: 2, y: 1 }, exit: { x: 3, y: 5 },
  fixed: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  stars: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  hint: "Visit both wings before proceeding south."
});

addLevel({
  id: 14, world: 1, name: "Narrow Passage",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  fixed: [{ x: 2, y: 2 }, { x: 2, y: 4 }],
  hint: "A direct north-south crossing."
});

addLevel({
  id: 15, world: 1, name: "Diamond Route",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  fixed: [{ x: 0, y: 3 }, { x: 4, y: 3 }],
  stars: [{ x: 0, y: 3 }, { x: 4, y: 3 }],
  hint: "Branch out to both tips of the diamond."
});

addLevel({
  id: 16, world: 1, name: "T-Junction",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  fixed: [{ x: 2, y: 3 }, { x: 2, y: 1 }, { x: 3, y: 3 }],
  stars: [{ x: 2, y: 1 }],
  hint: "Take a short detour north to grab the shiny star."
});

addLevel({
  id: 17, world: 1, name: "Crossing the Chasm",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Build a bridge to the center, rest, then bridge to the goal."
});

addLevel({
  id: 18, world: 1, name: "Three Steps Ahead",
  start: { x: 0, y: 2 }, exit: { x: 5, y: 4 },
  maxTiles: 3,
  fixed: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  stars: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  hint: "Grab both stars on your way across."
});

addLevel({
  id: 19, world: 1, name: "The Crossroads",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  fixed: [{ x: 2, y: 3 }, { x: 0, y: 3 }, { x: 4, y: 3 }],
  stars: [{ x: 0, y: 3 }, { x: 4, y: 3 }],
  hint: "From the central hub, explore the side wings."
});

addLevel({
  id: 20, world: 1, name: "World 1 Graduation",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  fixed: [{ x: 1, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 4 }],
  stars: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  hint: "Show your mastery of tile reclamation and star collection!"
});

// ==========================================
// WORLD 2: THINK AHEAD (Levels 21 - 40)
// Mechanics: Rocks/Obstacles, Limited Inventory, Multiple Paths
// ==========================================
addLevel({
  id: 21, world: 2, name: "First Boulder",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  rocks: [{ x: 2, y: 3 }],
  hint: "A rock blocks the direct route. Bridge around it."
});

addLevel({
  id: 22, world: 2, name: "Stone Barrier",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 2 },
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 2 }],
  hint: "Curve your bridge around the wall of rocks."
});

addLevel({
  id: 23, world: 2, name: "Rock Maze",
  start: { x: 0, y: 1 }, exit: { x: 4, y: 5 },
  rocks: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 3, y: 5 }],
  fixed: [{ x: 2, y: 3 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Weave between the obstacles."
});

addLevel({
  id: 24, world: 2, name: "Tight Budget",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 4 },
  maxTiles: 2,
  rocks: [{ x: 2, y: 2 }],
  fixed: [{ x: 3, y: 2 }, { x: 2, y: 3 }],
  hint: "Plan each tile carefully with only 2 tiles in hand."
});

addLevel({
  id: 25, world: 2, name: "Twin Pillars",
  start: { x: 1, y: 0 }, exit: { x: 4, y: 6 },
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Navigate the passage between the stone pillars."
});

addLevel({
  id: 26, world: 2, name: "The Horseshoe",
  start: { x: 1, y: 4 }, exit: { x: 4, y: 4 },
  rocks: [{ x: 2, y: 4 }, { x: 3, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 3 }],
  fixed: [{ x: 2, y: 1 }, { x: 3, y: 1 }],
  stars: [{ x: 2, y: 1 }],
  hint: "Travel north around the horseshoe reef."
});

addLevel({
  id: 27, world: 2, name: "Rocky Archipelago",
  start: { x: 0, y: 2 }, exit: { x: 5, y: 4 },
  rocks: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  fixed: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  stars: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  hint: "Island-hop between the reefs."
});

addLevel({
  id: 28, world: 2, name: "The Gauntlet",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  rocks: [{ x: 1, y: 2 }, { x: 3, y: 2 }, { x: 1, y: 4 }, { x: 3, y: 4 }],
  fixed: [{ x: 2, y: 3 }],
  hint: "Pass through the central corridor."
});

addLevel({
  id: 29, world: 2, name: "Two Paths",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  rocks: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  fixed: [{ x: 0, y: 3 }, { x: 5, y: 3 }],
  stars: [{ x: 0, y: 3 }],
  hint: "The western path holds the golden star."
});

addLevel({
  id: 30, world: 2, name: "Fortress Wall",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  rocks: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 2, y: 5 }],
  fixed: [{ x: 2, y: 3 }],
  hint: "There is a breach in the center of the wall."
});

addLevel({
  id: 31, world: 2, name: "Pebble Trail",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  rocks: [{ x: 2, y: 4 }, { x: 3, y: 2 }],
  fixed: [{ x: 3, y: 4 }, { x: 2, y: 2 }],
  stars: [{ x: 3, y: 4 }],
  hint: "Step carefully around the boulders."
});

addLevel({
  id: 32, world: 2, name: "The Snaking Gorge",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  rocks: [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 5 }],
  fixed: [{ x: 4, y: 2 }, { x: 1, y: 4 }],
  stars: [{ x: 4, y: 2 }],
  hint: "Snake through the winding gorge."
});

addLevel({
  id: 33, world: 2, name: "Star Fortress",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  rocks: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  fixed: [{ x: 2, y: 3 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Claim the star nestled between the rocks."
});

addLevel({
  id: 34, world: 2, name: "Strict Allocation",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  maxTiles: 2,
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  hint: "No wasted tiles! Recover and advance."
});

addLevel({
  id: 35, world: 2, name: "Boulder Alley",
  start: { x: 1, y: 0 }, exit: { x: 4, y: 6 },
  rocks: [{ x: 2, y: 1 }, { x: 1, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 5 }],
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  stars: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  hint: "Grab both stars in the central clearing."
});

addLevel({
  id: 36, world: 2, name: "Zigzag Reef",
  start: { x: 0, y: 1 }, exit: { x: 5, y: 5 },
  rocks: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 5 }, { x: 3, y: 6 }],
  fixed: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  stars: [{ x: 1, y: 3 }],
  hint: "Use the reefs to cross the lagoon."
});

addLevel({
  id: 37, world: 2, name: "Stone Divide",
  start: { x: 2, y: 1 }, exit: { x: 3, y: 5 },
  rocks: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  fixed: [{ x: 0, y: 3 }, { x: 5, y: 3 }],
  stars: [{ x: 0, y: 3 }, { x: 5, y: 3 }],
  hint: "Visit both flanking islands to gather all stars."
});

addLevel({
  id: 38, world: 2, name: "The Quarry",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 4 },
  rocks: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }],
  fixed: [{ x: 1, y: 3 }, { x: 4, y: 2 }],
  stars: [{ x: 1, y: 3 }],
  hint: "A staggered pathway through the rocks."
});

addLevel({
  id: 39, world: 2, name: "Narrow Margin",
  start: { x: 0, y: 4 }, exit: { x: 5, y: 2 },
  maxTiles: 2,
  rocks: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  fixed: [{ x: 2, y: 4 }, { x: 3, y: 2 }],
  hint: "Leap precisely with only 2 tiles."
});

addLevel({
  id: 40, world: 2, name: "World 2 Finale",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  rocks: [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 2 }, { x: 4, y: 4 }],
  fixed: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  stars: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  hint: "Master the rock obstacles and collect both trophies!"
});

// ==========================================
// WORLD 3: TRICKY TILES (Levels 41 - 60)
// Mechanics: Sticky tiles, Crumbling floors, One-way tiles
// ==========================================
addLevel({
  id: 41, world: 3, name: "Honey Trap",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  sticky: [{ x: 2, y: 3 }],
  hint: "Stepping off a bridge tile on sticky honey traps that tile permanently! You can avoid it or sacrifice a tile."
});

addLevel({
  id: 42, world: 3, name: "Stick or Detour",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 2 },
  sticky: [{ x: 2, y: 2 }],
  hint: "Bridge around the purple sticky tile to save your tiles, or step right through!"
});

addLevel({
  id: 43, world: 3, name: "The Weak Beam",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  crumbling: [{ x: 2, y: 3 }],
  hint: "Crumbling floors break once you step off. Do not turn back!"
});

addLevel({
  id: 44, world: 3, name: "One Way North",
  start: { x: 2, y: 5 }, exit: { x: 2, y: 1 },
  fixed: [{ x: 2, y: 3 }],
  oneWay: [{ x: 2, y: 3, direction: 'up' }],
  hint: "The arrow indicates you can only leave this tile going UP."
});

addLevel({
  id: 45, world: 3, name: "Sticky Crossing",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  sticky: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  fixed: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  stars: [{ x: 4, y: 3 }],
  hint: "The side islands provide safe footing without sticky honey."
});

addLevel({
  id: 46, world: 3, name: "Brittle Steps",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 4 },
  crumbling: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Move forward steadily across the crumbling stones."
});

addLevel({
  id: 47, world: 3, name: "One-Way Labyrinth",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 4 },
  fixed: [{ x: 3, y: 1 }, { x: 3, y: 4 }],
  oneWay: [{ x: 3, y: 1, direction: 'down' }],
  hint: "Follow the directional arrows."
});

addLevel({
  id: 48, world: 3, name: "Sacrificial Bridge",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 4 },
  maxTiles: 3,
  sticky: [{ x: 2, y: 3 }],
  fixed: [{ x: 3, y: 3 }],
  hint: "Sometimes sacrificing one tile on sticky ground is the only way across."
});

addLevel({
  id: 49, world: 3, name: "Arrow Crossroads",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  fixed: [{ x: 2, y: 3 }],
  oneWay: [{ x: 2, y: 3, direction: 'down' }],
  rocks: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  hint: "You can only exit the crossroads downward."
});

addLevel({
  id: 50, world: 3, name: "Quicksand Field",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  sticky: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  fixed: [{ x: 2, y: 4 }, { x: 3, y: 2 }],
  stars: [{ x: 2, y: 4 }],
  hint: "Rest on the solid islands to avoid the quicksand."
});

addLevel({
  id: 51, world: 3, name: "Falling Bridges",
  start: { x: 1, y: 0 }, exit: { x: 4, y: 6 },
  crumbling: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Don't look back as the bridge collapses behind you."
});

addLevel({
  id: 52, world: 3, name: "Sticky Fork",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  sticky: [{ x: 1, y: 3 }],
  rocks: [{ x: 2, y: 3 }],
  fixed: [{ x: 3, y: 3 }],
  stars: [{ x: 3, y: 3 }],
  hint: "The right branch has solid ground and a star!"
});

addLevel({
  id: 53, world: 3, name: "One-Way Express",
  start: { x: 0, y: 1 }, exit: { x: 5, y: 5 },
  fixed: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  oneWay: [{ x: 2, y: 2, direction: 'right' }, { x: 3, y: 4, direction: 'right' }],
  hint: "Ride the one-way arrows towards the east."
});

addLevel({
  id: 54, world: 3, name: "Brittle Shortcut",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  crumbling: [{ x: 2, y: 3 }],
  rocks: [{ x: 3, y: 2 }, { x: 3, y: 4 }],
  fixed: [{ x: 1, y: 4 }],
  stars: [{ x: 1, y: 4 }],
  hint: "A crumbling tile opens a quick route."
});

addLevel({
  id: 55, world: 3, name: "Sticky Perimeter",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  sticky: [{ x: 1, y: 2 }, { x: 3, y: 2 }, { x: 1, y: 4 }, { x: 3, y: 4 }],
  fixed: [{ x: 2, y: 3 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Stay down the center channel."
});

addLevel({
  id: 56, world: 3, name: "Directional Steps",
  start: { x: 1, y: 4 }, exit: { x: 4, y: 1 },
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 2 }],
  oneWay: [{ x: 2, y: 3, direction: 'right' }, { x: 3, y: 2, direction: 'up' }],
  stars: [{ x: 2, y: 3 }],
  hint: "Follow the directional arrows up and right."
});

addLevel({
  id: 57, world: 3, name: "Crumbly Corridor",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  crumbling: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  hint: "Step across without backtracking."
});

addLevel({
  id: 58, world: 3, name: "Sticky Conundrum",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 4 },
  maxTiles: 3,
  sticky: [{ x: 2, y: 2 }],
  fixed: [{ x: 3, y: 3 }],
  stars: [{ x: 3, y: 3 }],
  hint: "Stepping into sticky honey will cost 1 tile. Make sure 2 are enough to finish!"
});

addLevel({
  id: 59, world: 3, name: "Tri-Hazard Trail",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  sticky: [{ x: 2, y: 4 }],
  crumbling: [{ x: 3, y: 2 }],
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  oneWay: [{ x: 2, y: 3, direction: 'right' }],
  stars: [{ x: 3, y: 3 }],
  hint: "Avoid the sticky honey and ride the arrow across."
});

addLevel({
  id: 60, world: 3, name: "World 3 Finale",
  start: { x: 0, y: 2 }, exit: { x: 5, y: 4 },
  sticky: [{ x: 2, y: 2 }],
  crumbling: [{ x: 3, y: 4 }],
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  rocks: [{ x: 1, y: 4 }, { x: 4, y: 2 }],
  stars: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  hint: "Combine all your knowledge of sticky, crumbling, and one-way tiles!"
});

// ==========================================
// WORLD 4: OPEN THE WAY (Levels 61 - 80)
// Mechanics: Switches, Doors, Teleporters
// ==========================================
addLevel({
  id: 61, world: 4, name: "The First Button",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 2 },
  switches: [{ id: 'gate-1', switchPos: { x: 2, y: 4 }, doorPos: { x: 3, y: 2 } }],
  fixed: [{ x: 2, y: 4 }],
  hint: "Step on the blue pressure plate to open the gate."
});

addLevel({
  id: 62, world: 4, name: "First Warp",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  teleporters: [{ id: 'tp-1', posA: { x: 2, y: 2 }, posB: { x: 4, y: 3 } }],
  hint: "Step onto the swirling portal to warp across the void!"
});

addLevel({
  id: 63, world: 4, name: "Key and Lock",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  switches: [{ id: 'gate-1', switchPos: { x: 0, y: 3 }, doorPos: { x: 2, y: 3 } }],
  fixed: [{ x: 0, y: 3 }],
  hint: "Take a trip to the west wing to step on the switch."
});

addLevel({
  id: 64, world: 4, name: "Portal Hop",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  teleporters: [{ id: 'tp-1', posA: { x: 1, y: 3 }, posB: { x: 4, y: 3 } }],
  hint: "Teleporters act as solid permanent platforms."
});

addLevel({
  id: 65, world: 4, name: "Gatekeeper",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 4 },
  switches: [{ id: 'gate-1', switchPos: { x: 1, y: 4 }, doorPos: { x: 3, y: 2 } }],
  fixed: [{ x: 1, y: 4 }],
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 1 }, { x: 3, y: 3 }],
  hint: "Unlock the gate to pass through the rock fortress."
});

addLevel({
  id: 66, world: 4, name: "Two Portals",
  start: { x: 1, y: 0 }, exit: { x: 4, y: 6 },
  teleporters: [
    { id: 'tp-1', posA: { x: 2, y: 1 }, posB: { x: 2, y: 4 } },
    { id: 'tp-2', posA: { x: 3, y: 4 }, posB: { x: 4, y: 5 } }
  ],
  hint: "Chain the teleporters together."
});

addLevel({
  id: 67, world: 4, name: "Toggle Trap",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  switches: [{ id: 'gate-1', switchPos: { x: 4, y: 3 }, doorPos: { x: 2, y: 3 } }],
  fixed: [{ x: 4, y: 3 }],
  stars: [{ x: 4, y: 3 }],
  hint: "Hit the switch once to open the door, then march straight to the exit."
});

addLevel({
  id: 68, world: 4, name: "Warp to Star",
  start: { x: 1, y: 3 }, exit: { x: 4, y: 3 },
  teleporters: [{ id: 'tp-1', posA: { x: 2, y: 1 }, posB: { x: 2, y: 5 } }],
  stars: [{ x: 2, y: 5 }],
  fixed: [{ x: 3, y: 3 }],
  hint: "Warp south to fetch the star, then return."
});

addLevel({
  id: 69, world: 4, name: "Switch & Wall",
  start: { x: 0, y: 1 }, exit: { x: 5, y: 5 },
  switches: [{ id: 'gate-1', switchPos: { x: 2, y: 1 }, doorPos: { x: 4, y: 3 } }],
  fixed: [{ x: 2, y: 1 }],
  rocks: [{ x: 3, y: 3 }, { x: 5, y: 3 }],
  hint: "Press the button before heading south."
});

addLevel({
  id: 70, world: 4, name: "The Isolated Island",
  start: { x: 0, y: 2 }, exit: { x: 5, y: 4 },
  teleporters: [{ id: 'tp-1', posA: { x: 1, y: 2 }, posB: { x: 4, y: 4 } }],
  stars: [{ x: 1, y: 4 }],
  hint: "Collect the star before jumping into the portal."
});

addLevel({
  id: 71, world: 4, name: "Dual Gates",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  switches: [
    { id: 'g1', switchPos: { x: 0, y: 2 }, doorPos: { x: 2, y: 2 } },
    { id: 'g2', switchPos: { x: 4, y: 4 }, doorPos: { x: 2, y: 4 } }
  ],
  fixed: [{ x: 0, y: 2 }, { x: 4, y: 4 }],
  hint: "Unlock the north gate, then the south gate."
});

addLevel({
  id: 72, world: 4, name: "Warp Maze",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  teleporters: [{ id: 'tp-1', posA: { x: 3, y: 1 }, posB: { x: 2, y: 4 } }],
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 3 }],
  hint: "Portals bypass impassable rock formations."
});

addLevel({
  id: 73, world: 4, name: "The Closed Exit",
  start: { x: 1, y: 3 }, exit: { x: 4, y: 3 },
  switches: [{ id: 'gate-exit', switchPos: { x: 1, y: 1 }, doorPos: { x: 3, y: 3 } }],
  fixed: [{ x: 1, y: 1 }],
  hint: "The gate right in front of the exit is sealed tight. Find the switch!"
});

addLevel({
  id: 74, world: 4, name: "Teleport Swap",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  teleporters: [{ id: 'tp-1', posA: { x: 1, y: 3 }, posB: { x: 3, y: 3 } }],
  rocks: [{ x: 2, y: 3 }],
  stars: [{ x: 3, y: 3 }],
  hint: "Warp across the center divider."
});

addLevel({
  id: 75, world: 4, name: "Pressure Circuit",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 4 },
  switches: [{ id: 'g1', switchPos: { x: 4, y: 1 }, doorPos: { x: 2, y: 3 } }],
  fixed: [{ x: 4, y: 1 }],
  rocks: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  hint: "Reach the switch on the northeast island."
});

addLevel({
  id: 76, world: 4, name: "Warp to Safety",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  teleporters: [{ id: 'tp-1', posA: { x: 2, y: 3 }, posB: { x: 4, y: 2 } }],
  rocks: [{ x: 3, y: 3 }],
  hint: "Teleport over the gap."
});

addLevel({
  id: 77, world: 4, name: "Switch & Warp Combo",
  start: { x: 1, y: 0 }, exit: { x: 4, y: 6 },
  teleporters: [{ id: 'tp-1', posA: { x: 2, y: 2 }, posB: { x: 3, y: 4 } }],
  switches: [{ id: 'g1', switchPos: { x: 1, y: 2 }, doorPos: { x: 4, y: 5 } }],
  fixed: [{ x: 1, y: 2 }],
  hint: "Hit the switch, enter the portal, and walk through the unlocked gate."
});

addLevel({
  id: 78, world: 4, name: "Inverted Gate",
  start: { x: 1, y: 3 }, exit: { x: 4, y: 3 },
  switches: [{ id: 'g1', switchPos: { x: 2, y: 1 }, doorPos: { x: 3, y: 3 }, doorInitiallyOpen: true }],
  fixed: [{ x: 2, y: 1 }],
  stars: [{ x: 2, y: 1 }],
  hint: "The gate is already open! But stepping on the switch closes it. Plan wisely!"
});

addLevel({
  id: 79, world: 4, name: "Cosmic Hub",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  teleporters: [
    { id: 'tp-1', posA: { x: 1, y: 2 }, posB: { x: 4, y: 4 } },
  ],
  switches: [{ id: 'g1', switchPos: { x: 4, y: 2 }, doorPos: { x: 2, y: 4 } }],
  fixed: [{ x: 4, y: 2 }],
  hint: "A multi-stage spatial puzzle."
});

addLevel({
  id: 80, world: 4, name: "World 4 Finale",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  teleporters: [{ id: 'tp-1', posA: { x: 2, y: 4 }, posB: { x: 3, y: 2 } }],
  switches: [{ id: 'g1', switchPos: { x: 1, y: 2 }, doorPos: { x: 4, y: 2 } }],
  fixed: [{ x: 1, y: 2 }],
  stars: [{ x: 1, y: 2 }, { x: 3, y: 2 }],
  hint: "Coordinate switches, teleporters, and stars to claim victory!"
});

// ==========================================
// WORLD 5: MASTER BUILDER (Levels 81 - 100)
// Mechanics: Combinations of all mechanics
// ==========================================
addLevel({
  id: 81, world: 5, name: "The Grand Entrance",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  fixed: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  crumbling: [{ x: 2, y: 3 }],
  sticky: [{ x: 3, y: 2 }],
  stars: [{ x: 2, y: 2 }],
  hint: "The ultimate trial begins. Watch your footing on crumbling and sticky tiles."
});

addLevel({
  id: 82, world: 5, name: "Portal & Honey",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  teleporters: [{ id: 'tp-1', posA: { x: 1, y: 2 }, posB: { x: 3, y: 4 } }],
  sticky: [{ x: 2, y: 3 }],
  stars: [{ x: 3, y: 4 }],
  hint: "Bypass the sticky trap by taking the teleporter."
});

addLevel({
  id: 83, world: 5, name: "One-Way Gate",
  start: { x: 1, y: 0 }, exit: { x: 4, y: 6 },
  switches: [{ id: 'g1', switchPos: { x: 1, y: 3 }, doorPos: { x: 3, y: 3 } }],
  fixed: [{ x: 1, y: 3 }, { x: 2, y: 3 }],
  oneWay: [{ x: 2, y: 3, direction: 'right' }],
  hint: "Ride the arrow through the unlocked gate."
});

addLevel({
  id: 84, world: 5, name: "Crumbling Causeway",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  crumbling: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  fixed: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  stars: [{ x: 2, y: 3 }],
  hint: "Cross the bridge before it collapses beneath you."
});

addLevel({
  id: 85, world: 5, name: "Switchboard",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  switches: [
    { id: 'g1', switchPos: { x: 1, y: 4 }, doorPos: { x: 3, y: 2 } },
    { id: 'g2', switchPos: { x: 4, y: 2 }, doorPos: { x: 3, y: 4 } }
  ],
  fixed: [{ x: 1, y: 4 }, { x: 4, y: 2 }],
  hint: "Sequence both switches in the right order."
});

addLevel({
  id: 86, world: 5, name: "Sticky Portal",
  start: { x: 1, y: 2 }, exit: { x: 4, y: 4 },
  sticky: [{ x: 2, y: 2 }],
  teleporters: [{ id: 'tp-1', posA: { x: 3, y: 2 }, posB: { x: 2, y: 4 } }],
  stars: [{ x: 3, y: 2 }],
  hint: "Don't drop a bridge tile on sticky honey if you need it later!"
});

addLevel({
  id: 87, world: 5, name: "The Fragile Loop",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  crumbling: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  fixed: [{ x: 2, y: 3 }],
  stars: [{ x: 1, y: 3 }, { x: 3, y: 3 }],
  hint: "Plan your route so you never step onto a broken tile."
});

addLevel({
  id: 88, world: 5, name: "Arrow Matrix",
  start: { x: 0, y: 1 }, exit: { x: 5, y: 5 },
  fixed: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  oneWay: [{ x: 2, y: 2, direction: 'down' }, { x: 3, y: 4, direction: 'right' }],
  rocks: [{ x: 1, y: 3 }, { x: 4, y: 3 }],
  hint: "Trust the directional flow of the arrows."
});

addLevel({
  id: 89, world: 5, name: "Sacrifice and Teleport",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  sticky: [{ x: 2, y: 1 }],
  teleporters: [{ id: 'tp-1', posA: { x: 3, y: 1 }, posB: { x: 3, y: 4 } }],
  hint: "Sacrifice one tile to reach the warp pad."
});

addLevel({
  id: 90, world: 5, name: "Chamber of Trials",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  switches: [{ id: 'g1', switchPos: { x: 4, y: 3 }, doorPos: { x: 2, y: 3 } }],
  teleporters: [{ id: 'tp-1', posA: { x: 1, y: 3 }, posB: { x: 3, y: 3 } }],
  fixed: [{ x: 4, y: 3 }],
  hint: "Warp across to access the switch chamber."
});

addLevel({
  id: 91, world: 5, name: "The Broken Spiral",
  start: { x: 1, y: 1 }, exit: { x: 3, y: 3 },
  crumbling: [{ x: 4, y: 2 }, { x: 2, y: 5 }],
  fixed: [{ x: 4, y: 1 }, { x: 4, y: 4 }, { x: 1, y: 5 }],
  stars: [{ x: 4, y: 4 }],
  hint: "Follow the crumbling spiral towards the center."
});

addLevel({
  id: 92, world: 5, name: "Double Locked",
  start: { x: 0, y: 2 }, exit: { x: 5, y: 4 },
  switches: [
    { id: 'g1', switchPos: { x: 1, y: 4 }, doorPos: { x: 2, y: 3 } },
    { id: 'g2', switchPos: { x: 4, y: 2 }, doorPos: { x: 3, y: 3 } }
  ],
  fixed: [{ x: 1, y: 4 }, { x: 4, y: 2 }],
  hint: "Both sides hold keys to the inner corridor."
});

addLevel({
  id: 93, world: 5, name: "One-Way Bridge",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  fixed: [{ x: 2, y: 4 }, { x: 3, y: 2 }],
  oneWay: [{ x: 2, y: 4, direction: 'up' }, { x: 3, y: 2, direction: 'right' }],
  sticky: [{ x: 2, y: 2 }],
  hint: "Steer clear of the sticky patch while obeying the arrows."
});

addLevel({
  id: 94, world: 5, name: "Portal Labyrinth",
  start: { x: 1, y: 0 }, exit: { x: 4, y: 6 },
  teleporters: [
    { id: 'tp-1', posA: { x: 1, y: 2 }, posB: { x: 4, y: 2 } },
    { id: 'tp-2', posA: { x: 4, y: 4 }, posB: { x: 1, y: 4 } }
  ],
  rocks: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  hint: "Criss-cross the map via twin portals."
});

addLevel({
  id: 95, world: 5, name: "The Crucible",
  start: { x: 2, y: 1 }, exit: { x: 2, y: 5 },
  switches: [{ id: 'g1', switchPos: { x: 0, y: 3 }, doorPos: { x: 2, y: 3 } }],
  teleporters: [{ id: 'tp-1', posA: { x: 4, y: 1 }, posB: { x: 0, y: 1 } }],
  fixed: [{ x: 0, y: 3 }, { x: 4, y: 1 }],
  stars: [{ x: 0, y: 3 }],
  hint: "Warp across to hit the switch and rescue the star."
});

addLevel({
  id: 96, world: 5, name: "Clockwork Maze",
  start: { x: 0, y: 3 }, exit: { x: 5, y: 3 },
  switches: [{ id: 'g1', switchPos: { x: 2, y: 1 }, doorPos: { x: 3, y: 3 } }],
  fixed: [{ x: 2, y: 1 }],
  crumbling: [{ x: 2, y: 2 }, { x: 3, y: 4 }],
  hint: "Race across the crumbling stones to the pressure pad."
});

addLevel({
  id: 97, world: 5, name: "Perilous Passage",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  sticky: [{ x: 2, y: 2 }],
  crumbling: [{ x: 3, y: 4 }],
  switches: [{ id: 'g1', switchPos: { x: 1, y: 4 }, doorPos: { x: 3, y: 3 } }],
  fixed: [{ x: 1, y: 4 }],
  hint: "Navigate sticky honey, crumbling tiles, and locking gates."
});

addLevel({
  id: 98, world: 5, name: "The Quantum Leap",
  start: { x: 2, y: 0 }, exit: { x: 2, y: 6 },
  teleporters: [{ id: 'tp-1', posA: { x: 1, y: 2 }, posB: { x: 3, y: 4 } }],
  switches: [{ id: 'g1', switchPos: { x: 4, y: 4 }, doorPos: { x: 2, y: 5 } }],
  fixed: [{ x: 4, y: 4 }],
  stars: [{ x: 3, y: 4 }, { x: 4, y: 4 }],
  hint: "Teleport deep into the eastern wing, unlock the southern barrier, and claim both stars."
});

addLevel({
  id: 99, world: 5, name: "The Penultimate Riddle",
  start: { x: 1, y: 5 }, exit: { x: 4, y: 1 },
  teleporters: [{ id: 'tp-1', posA: { x: 2, y: 4 }, posB: { x: 3, y: 2 } }],
  crumbling: [{ x: 1, y: 3 }],
  sticky: [{ x: 4, y: 3 }],
  stars: [{ x: 3, y: 2 }],
  hint: "One final test of all mechanics before the master trial."
});

addLevel({
  id: 100, world: 5, name: "Steal the Floor Master",
  start: { x: 1, y: 1 }, exit: { x: 4, y: 5 },
  switches: [{ id: 'g-final', switchPos: { x: 4, y: 1 }, doorPos: { x: 3, y: 4 } }],
  teleporters: [{ id: 'tp-1', posA: { x: 2, y: 2 }, posB: { x: 1, y: 4 } }],
  fixed: [{ x: 4, y: 1 }],
  crumbling: [{ x: 3, y: 2 }],
  stars: [{ x: 4, y: 1 }, { x: 1, y: 4 }],
  hint: "Congratulations on reaching level 100! Prove your strategic genius by unlocking the grand exit!"
});

// Run solver on all 100 levels
console.log(`Validating all ${levelsDraft.length} levels with BFS puzzle solver...`);

const validatedLevels: LevelDefinition[] = [];
let passedCount = 0;

for (const draft of levelsDraft) {
  const level: LevelDefinition = {
    ...draft,
    cols: draft.cols || 6,
    rows: draft.rows || 7,
    maxTiles: draft.maxTiles || 3,
    parMoves: 0, // will be computed
  };

  const solution = solveLevel(level);
  if (!solution.solvable) {
    console.error(`ERROR: Level ${level.id} ("${level.name}") is IMPOSSIBLE!`);
    process.exit(1);
  }

  level.parMoves = solution.minMoves;
  level.star2Moves = solution.minMoves + 2;
  validatedLevels.push(level);
  passedCount++;
  console.log(`✓ Level ${level.id.toString().padStart(3, ' ')}: "${level.name}" solved in ${solution.minMoves} moves (${solution.statesExplored} states)`);
}

console.log(`\nALL ${passedCount} LEVELS VALIDATED AND SOLVABLE!`);

// Generate src/levels/levelsData.ts
const fileHeader = `// AUTO-GENERATED & SOLVER-VALIDATED LEVELS DATA
// 100 Handcrafted & procedurally assisted levels across 5 worlds
import { LevelDefinition } from '../engine/types';

export const ALL_LEVELS: LevelDefinition[] = ${JSON.stringify(validatedLevels, null, 2)};

export const WORLDS = [
  { id: 1, name: 'First Steps', levels: [1, 20], theme: 'floating-sky', description: 'Master basic movement, tile placement, and reclamation.' },
  { id: 2, name: 'Think Ahead', levels: [21, 40], theme: 'candy-world', description: 'Navigate rocks and tight tile budgets.' },
  { id: 3, name: 'Tricky Tiles', levels: [41, 60], theme: 'ocean-islands', description: 'Overcome sticky honey, crumbling tiles, and one-way arrows.' },
  { id: 4, name: 'Open the Way', levels: [61, 80], theme: 'neon-space', description: 'Trigger switches to open gates and step into teleporters.' },
  { id: 5, name: 'Master Builder', levels: [81, 100], theme: 'forest-adventure', description: 'Combine all mechanics in intricate master puzzles.' },
];
`;

const outputPath = path.resolve(process.cwd(), 'src/levels/levelsData.ts');
fs.writeFileSync(outputPath, fileHeader, 'utf-8');
console.log(`Successfully generated ${outputPath}`);
