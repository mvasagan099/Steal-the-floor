// AUTO-GENERATED & SOLVER-VALIDATED LEVELS DATA
// 140 Handcrafted levels across 7 worlds — verified with Solid-Ground Reclamation & Quality Gates
import { LevelDefinition } from '../engine/types';

export const ALL_LEVELS: LevelDefinition[] = [
  {
    "id": 1,
    "world": 1,
    "name": "First Steps",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 1
    },
    "exit": {
      "x": 2,
      "y": 5
    },
    "parMoves": 4,
    "hint": "Step into the void to drop bridge tiles. Reach the island to reclaim them!",
    "fixed": [
      {
        "x": 2,
        "y": 3
      }
    ],
    "star2Moves": 6
  },
  {
    "id": 2,
    "world": 1,
    "name": "Bridge & Reclaim",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 3,
      "y": 6
    },
    "parMoves": 7,
    "hint": "With 2 tiles you can cross 2 void squares before needing a solid island.",
    "fixed": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "star2Moves": 9
  },
  {
    "id": 3,
    "world": 1,
    "name": "Island Detour",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 1,
      "y": 1
    },
    "exit": {
      "x": 3,
      "y": 6
    },
    "parMoves": 9,
    "hint": "The direct route is too wide! Hop between islands to recharge your tiles.",
    "fixed": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "star2Moves": 12
  },
  {
    "id": 4,
    "world": 1,
    "name": "First Star",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 1,
      "y": 5
    },
    "exit": {
      "x": 4,
      "y": 1
    },
    "parMoves": 9,
    "hint": "Grab the star between the central islands before heading to the exit!",
    "fixed": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 3
      }
    ],
    "star2Moves": 12
  },
  {
    "id": 5,
    "world": 1,
    "name": "Stepping Stones",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 1,
      "y": 1
    },
    "exit": {
      "x": 1,
      "y": 6
    },
    "parMoves": 9,
    "hint": "Only 1 tile! Every void step must land right onto the next island.",
    "fixed": [
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "star2Moves": 12
  },
  {
    "id": 6,
    "world": 1,
    "name": "Twin Wings",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 1
    },
    "exit": {
      "x": 5,
      "y": 5
    },
    "parMoves": 15,
    "hint": "Swing west to grab the star, recharge on the island, then cross east.",
    "fixed": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 3
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 7,
    "world": 1,
    "name": "Diagonal Hop",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 11,
    "hint": "Use the stepping islands diagonally so your 2 tiles never run dry.",
    "fixed": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "star2Moves": 14
  },
  {
    "id": 8,
    "world": 1,
    "name": "Star Arch",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 3
    },
    "exit": {
      "x": 5,
      "y": 3
    },
    "parMoves": 13,
    "hint": "Climb over the northern arch to collect the star before landing on the exit.",
    "fixed": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 9,
    "world": 1,
    "name": "Zigzag Lagoon",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Weave across the archipelago to collect the western star.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 10,
    "world": 1,
    "name": "The Spiral",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 2,
      "y": 2
    },
    "parMoves": 18,
    "hint": "Loop clockwise around the outer islands to grab the star and enter the center.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 5
      }
    ],
    "star2Moves": 23
  },
  {
    "id": 11,
    "world": 1,
    "name": "One-Tile Tightrope",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "With 1 tile, each gap can be at most 1 square wide. Plan your star order!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 12,
    "world": 1,
    "name": "Out and Back",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 4
    },
    "exit": {
      "x": 5,
      "y": 4
    },
    "parMoves": 13,
    "hint": "Venture north into the void to snag the star, then walk back onto your laid bridge!",
    "fixed": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 13,
    "world": 1,
    "name": "Forked Isles",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 6
    },
    "exit": {
      "x": 2,
      "y": 0
    },
    "parMoves": 18,
    "hint": "From the central hub, visit both outer islands to collect both stars.",
    "fixed": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 23
  },
  {
    "id": 14,
    "world": 1,
    "name": "Three-Tile Chasm",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "With 3 tiles you can cross 3 void cells at once—stretch every single bridge!",
    "fixed": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 1,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 1,
        "y": 6
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 15,
    "world": 1,
    "name": "Diamond Archipelago",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 0
    },
    "exit": {
      "x": 2,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Use the twin central islands to reach opposite wings of the diamond.",
    "fixed": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 16,
    "world": 1,
    "name": "Northern Outpost",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 4
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Climb to both northern outposts before descending to the exit.",
    "fixed": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 17,
    "world": 1,
    "name": "Corner Harvest",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 6
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 31,
    "hint": "Scale the central pillars to reach both top corners.",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      }
    ],
    "star2Moves": 39
  },
  {
    "id": 18,
    "world": 1,
    "name": "Minimalist Run",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "One tile only! Chart an island chain that collects all three stars.",
    "fixed": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 19,
    "world": 1,
    "name": "Starlight Crossroads",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 4
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 25,
    "hint": "Visit every wing around the hub without wasting moves.",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "star2Moves": 32
  },
  {
    "id": 20,
    "world": 1,
    "name": "World 1 Graduation",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 5
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 24,
    "hint": "Prove your mastery of island hopping and tile reclamation!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "star2Moves": 30
  },
  {
    "id": 21,
    "world": 2,
    "name": "First Boulder",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 1
    },
    "exit": {
      "x": 2,
      "y": 5
    },
    "parMoves": 8,
    "hint": "Rocks block the middle—bridge to a flanking island to get around!",
    "fixed": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "star2Moves": 10
  },
  {
    "id": 22,
    "world": 2,
    "name": "The Reef Wall",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 2
    },
    "parMoves": 13,
    "hint": "The reef splits the map. Bridge around the southern tip via the islands!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 2,
        "y": 4
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 23,
    "world": 2,
    "name": "Canyon Switchback",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Snake around each canyon wall using the islands at the turns.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 24,
    "world": 2,
    "name": "Boulder Pocket",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Rock pillars carve narrow lanes—check your tile reach before committing.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 25,
    "world": 2,
    "name": "The Horseshoe",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 4
    },
    "exit": {
      "x": 3,
      "y": 4
    },
    "parMoves": 13,
    "hint": "Loop up and over the horseshoe reef to enter the exit pocket from below!",
    "fixed": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 5,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 0
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 26,
    "world": 2,
    "name": "Tight Alcove",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Cross under the rock divider, recharge on the southern island, then climb north for the star!",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 27,
    "world": 2,
    "name": "Twin Pillars",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 1,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Weave left and right between staggered stone barriers.",
    "fixed": [
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 28,
    "world": 2,
    "name": "Stone Courtyard",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Enter the courtyard from an island edge so you can grab the center star and exit.",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 2,
        "y": 3
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 29,
    "world": 2,
    "name": "The Breach",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 4,
      "y": 5
    },
    "parMoves": 15,
    "hint": "Collect both western stars before crossing the central breach.",
    "fixed": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 30,
    "world": 2,
    "name": "One-Tile Maze",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 31,
    "hint": "With just 1 tile, every detour around the rocks must hop island-to-island!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "star2Moves": 39
  },
  {
    "id": 31,
    "world": 2,
    "name": "Quarry Crossing",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Harvest both left corners while navigating the quarry walls.",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 32,
    "world": 2,
    "name": "S-Curve Gorge",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Follow the winding S-curve gorge and pick up both alcove stars.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 33,
    "world": 2,
    "name": "Fortress Moat",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 3,
      "y": 3
    },
    "parMoves": 22,
    "hint": "Circle the fortress moat to find the southern gate into the inner keep.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 6
      }
    ],
    "star2Moves": 28
  },
  {
    "id": 34,
    "world": 2,
    "name": "Three-Way Divide",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 3
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 26,
    "hint": "The single central island connects west and east—sweep the west side first!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "star2Moves": 33
  },
  {
    "id": 35,
    "world": 2,
    "name": "Boulder Spiral",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 3,
      "y": 3
    },
    "parMoves": 20,
    "hint": "Loop around the outside to enter the inner chamber from below.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      },
      {
        "x": 5,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 25
  },
  {
    "id": 36,
    "world": 2,
    "name": "Narrow Pass",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 30,
    "hint": "Thread through the narrow rock gates to gather all three stars.",
    "fixed": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "star2Moves": 38
  },
  {
    "id": 37,
    "world": 2,
    "name": "The Vault",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 4
    },
    "exit": {
      "x": 5,
      "y": 0
    },
    "parMoves": 23,
    "hint": "Cross east around the wall, climb into the upper vault, grab the star, and finish!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      }
    ],
    "star2Moves": 29
  },
  {
    "id": 38,
    "world": 2,
    "name": "Reef Islands",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 23,
    "hint": "Every rock forces a specific island step—map both star loops first.",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "star2Moves": 29
  },
  {
    "id": 39,
    "world": 2,
    "name": "Double Moat",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Use the central island as your anchor between both stone moats.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 40,
    "world": 2,
    "name": "World 2 Finale",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 25,
    "hint": "Navigate the entire granite labyrinth with only 2 tiles in hand!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "star2Moves": 32
  },
  {
    "id": 41,
    "world": 3,
    "name": "Honey Trap",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 13,
    "hint": "Honey sits in the direct shortcut—taking it leaves only 1 tile, unable to cross the 2-tile gap! Detour north!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 1,
        "y": 2
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 42,
    "world": 3,
    "name": "Sticky Shortcut",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 8,
    "hint": "The only corridor runs straight through sticky honey! Lose 1 tile, then finish with your remaining 2!",
    "fixed": [
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 2
      }
    ],
    "star2Moves": 10
  },
  {
    "id": 43,
    "world": 3,
    "name": "The Weak Beam",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 1
    },
    "exit": {
      "x": 2,
      "y": 5
    },
    "parMoves": 4,
    "hint": "Crumbling stone recharges your tiles once, then shatters behind you!",
    "crumbling": [
      {
        "x": 2,
        "y": 3
      }
    ],
    "star2Moves": 6
  },
  {
    "id": 44,
    "world": 3,
    "name": "One-Way Chute",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 6
    },
    "exit": {
      "x": 2,
      "y": 0
    },
    "parMoves": 12,
    "hint": "You can only exit the arrow going UP—grab the star before committing!",
    "fixed": [
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      }
    ],
    "oneWay": [
      {
        "x": 2,
        "y": 2,
        "direction": "up"
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 4
      }
    ],
    "star2Moves": 15
  },
  {
    "id": 45,
    "world": 3,
    "name": "No Turning Back",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Cross the upper crumbling stone, loop east, and return via the lower fragile bridge!",
    "fixed": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 46,
    "world": 3,
    "name": "Sticky Chasm",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 0
    },
    "parMoves": 13,
    "hint": "Watch your tile budget: stepping into honey shrinks your reach from 3 down to 2.",
    "fixed": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 4
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 47,
    "world": 3,
    "name": "Arrow Loop",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Ride the clockwise one-way conveyor around the rock core.",
    "fixed": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 0,
        "direction": "right"
      },
      {
        "x": 5,
        "y": 2,
        "direction": "down"
      },
      {
        "x": 3,
        "y": 4,
        "direction": "left"
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 48,
    "world": 3,
    "name": "Fragile Star Run",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Each crumbling stone only holds once—route from top-right down to the exit.",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 4
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 49,
    "world": 3,
    "name": "Cross-Bridge Honey",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Detour north around the honey so both tiles survive for the western star and exit chasm!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 1,
        "y": 2
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 4
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 50,
    "world": 3,
    "name": "Brittle Archipelago",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 23,
    "hint": "Plan which crumbling stone you break first—once gone, you cannot rest there again!",
    "fixed": [
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 29
  },
  {
    "id": 51,
    "world": 3,
    "name": "Directional Divide",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 3
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Ride the upper arrow left to grab the star, then weave back via the center!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "oneWay": [
      {
        "x": 5,
        "y": 0,
        "direction": "left"
      },
      {
        "x": 0,
        "y": 2,
        "direction": "down"
      },
      {
        "x": 3,
        "y": 6,
        "direction": "right"
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 52,
    "world": 3,
    "name": "Honey Gauntlet",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 1
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 20,
    "hint": "Both eastern shortcuts are glazed in sticky honey—weave around them to keep both tiles for the exit!",
    "fixed": [
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 1
      }
    ],
    "star2Moves": 25
  },
  {
    "id": 53,
    "world": 3,
    "name": "One-Shot Bridge",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Cross the top crumbling stone, grab the west star, then take the lower fragile stone home.",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "crumbling": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 54,
    "world": 3,
    "name": "Arrow Crossroads",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 3
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 23,
    "hint": "Climb the east side to collect both northern stars, then ride the downward chute to exit!",
    "fixed": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "oneWay": [
      {
        "x": 2,
        "y": 2,
        "direction": "down"
      },
      {
        "x": 3,
        "y": 3,
        "direction": "right"
      },
      {
        "x": 2,
        "y": 4,
        "direction": "down"
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      }
    ],
    "star2Moves": 29
  },
  {
    "id": 55,
    "world": 3,
    "name": "Honey Cost",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 1
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 20,
    "hint": "One sticky crossing is affordable with 3 tiles, but hitting both honey traps leaves you short!",
    "fixed": [
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 25
  },
  {
    "id": 56,
    "world": 3,
    "name": "Crumble & Commit",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Ride the crumbling entry down the one-way chute, sweep both stars, then exit.",
    "fixed": [
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 2,
        "direction": "down"
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 57,
    "world": 3,
    "name": "Honey vs Crumble",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Skip the sticky top shortcut—take the crumbling west lane to keep both bridge tiles!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "crumbling": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 58,
    "world": 3,
    "name": "Conveyor Canyon",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Follow the one-way arrows down the canyon terraces without breaking stride.",
    "fixed": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 0,
        "direction": "right"
      },
      {
        "x": 3,
        "y": 2,
        "direction": "left"
      },
      {
        "x": 5,
        "y": 2,
        "direction": "down"
      },
      {
        "x": 0,
        "y": 4,
        "direction": "down"
      },
      {
        "x": 0,
        "y": 6,
        "direction": "right"
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 59,
    "world": 3,
    "name": "Tri-Hazard Trial",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Sacrifice 1 tile on honey across the crumbling stone, collect the west star, and ride the arrow east!",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 4,
        "direction": "right"
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 60,
    "world": 3,
    "name": "World 3 Finale",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Combine crumbling checkpoints, sticky avoidance, and one-way arrows to clear World 3!",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 4,
        "direction": "right"
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 61,
    "world": 4,
    "name": "The First Button",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 0
    },
    "parMoves": 11,
    "hint": "The rock wall seals the exit behind a laser gate. Step on the blue switch to open it!",
    "fixed": [
      {
        "x": 2,
        "y": 2
      }
    ],
    "rocks": [
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 4
        },
        "doorPos": {
          "x": 4,
          "y": 2
        }
      }
    ],
    "star2Moves": 14
  },
  {
    "id": 62,
    "world": 4,
    "name": "First Warp",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 5
    },
    "parMoves": 6,
    "hint": "No bridge can cross the solid stone wall—step onto the swirling portal to warp through!",
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 1,
          "y": 2
        },
        "posB": {
          "x": 5,
          "y": 2
        }
      }
    ],
    "star2Moves": 8
  },
  {
    "id": 63,
    "world": 4,
    "name": "Key and Lock",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 2,
      "y": 0
    },
    "exit": {
      "x": 2,
      "y": 6
    },
    "parMoves": 12,
    "hint": "Take the western island to press the switch, then march through the unlocked gate.",
    "fixed": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 2
        },
        "doorPos": {
          "x": 2,
          "y": 3
        }
      }
    ],
    "star2Moves": 15
  },
  {
    "id": 64,
    "world": 4,
    "name": "Portal Island",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 0
    },
    "parMoves": 17,
    "hint": "Warp into the southern cavern, grab the star, and climb the eastern passage!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 2,
          "y": 2
        },
        "posB": {
          "x": 0,
          "y": 4
        }
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 6
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 65,
    "world": 4,
    "name": "Gatekeeper",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Press the western switch, cross the eastern laser gate, and sweep the lower cavern!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 2
        },
        "doorPos": {
          "x": 4,
          "y": 3
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 66,
    "world": 4,
    "name": "Twin Portals",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 9,
    "hint": "Chain Portal 1 into Portal 2 to cross both granite walls!",
    "fixed": [
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 2,
          "y": 0
        },
        "posB": {
          "x": 4,
          "y": 2
        }
      },
      {
        "id": "tp-2",
        "posA": {
          "x": 5,
          "y": 3
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 12
  },
  {
    "id": 67,
    "world": 4,
    "name": "Star Behind Bars",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Unlock the laser barrier, drop through, snag the star, and finish.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 68,
    "world": 4,
    "name": "Warp to Star",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 2
    },
    "parMoves": 15,
    "hint": "Warp south to grab the isolated star, then climb the eastern passage to the exit!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 1,
          "y": 2
        },
        "posB": {
          "x": 3,
          "y": 4
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 69,
    "world": 4,
    "name": "Vault Switch",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 4
    },
    "exit": {
      "x": 5,
      "y": 0
    },
    "parMoves": 17,
    "hint": "Climb north to hit the pressure plate, return south through the unlocked gate, and grab the star.",
    "fixed": [
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 3
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 70,
    "world": 4,
    "name": "Isolated Star",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 23,
    "hint": "Warp across the northern barrier, snag the star, then loop down into the southern cavern.",
    "fixed": [
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 1,
          "y": 2
        },
        "posB": {
          "x": 5,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 1,
        "y": 4
      }
    ],
    "star2Moves": 29
  },
  {
    "id": 71,
    "world": 4,
    "name": "Dual Gates",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Open Gate 1 to reach Switch 2, then unlock Gate 2 to reach the exit!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 2
        }
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 5,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 4
        }
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 72,
    "world": 4,
    "name": "Portal Crossing",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 1,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Jump between twin portals to traverse all four quadrants of the stone cross.",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 5,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      },
      {
        "id": "tp-2",
        "posA": {
          "x": 0,
          "y": 4
        },
        "posB": {
          "x": 5,
          "y": 6
        }
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 4
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 73,
    "world": 4,
    "name": "The Closed Exit",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 4
    },
    "exit": {
      "x": 5,
      "y": 3
    },
    "parMoves": 18,
    "hint": "The exit chamber is sealed! Climb north to unlock the gate.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 4
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      }
    ],
    "star2Moves": 23
  },
  {
    "id": 74,
    "world": 4,
    "name": "Teleport Relay",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Warp across the diagonal reef, then swing west to grab the hidden star.",
    "fixed": [
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 2,
          "y": 1
        },
        "posB": {
          "x": 4,
          "y": 3
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 75,
    "world": 4,
    "name": "Switch & Star",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 25,
    "hint": "Press the switch, pass through the gate, and sweep both lower islands!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 2
        },
        "doorPos": {
          "x": 2,
          "y": 3
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "star2Moves": 32
  },
  {
    "id": 76,
    "world": 4,
    "name": "Warp Over Reef",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Chain both portals to leap across two solid granite ridges!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 3
        }
      },
      {
        "id": "tp-2",
        "posA": {
          "x": 5,
          "y": 3
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 3
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 77,
    "world": 4,
    "name": "Switch & Warp Combo",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Hit the switch BEFORE stepping into the portal, or the lower gate will still be sealed!",
    "fixed": [
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 0
        },
        "doorPos": {
          "x": 4,
          "y": 5
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 1,
          "y": 2
        },
        "posB": {
          "x": 1,
          "y": 4
        }
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 78,
    "world": 4,
    "name": "Inverted Gate",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "The gate starts OPEN, but grabbing the star on the switch closes it! Step on the switch again to reopen it!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 2
        },
        "doorPos": {
          "x": 2,
          "y": 3
        },
        "doorInitiallyOpen": true
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 2
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 79,
    "world": 4,
    "name": "Cosmic Hub",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Warp east to hit the switch, then descend through the unlocked gate!",
    "fixed": [
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 4,
          "y": 3
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 1
        },
        "posB": {
          "x": 1,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 4
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 80,
    "world": 4,
    "name": "World 4 Finale",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Unlock Gate 1, hit Switch 2, and use the portal + Gate 2 to claim World 4 victory!",
    "fixed": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        }
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 5,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 4
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 0,
          "y": 3
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 81,
    "world": 5,
    "name": "The Grand Entrance",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Use the crumbling bridge, skirt around the sticky honey, and gather both stars.",
    "fixed": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 1,
        "y": 2
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 82,
    "world": 5,
    "name": "Portal & Honey",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Cross the sticky honey to reach the portal, then use your remaining 2 tiles to claim the star and exit!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 2,
        "y": 4
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 83,
    "world": 5,
    "name": "One-Way Gate",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Press the switch BEFORE riding the one-way arrow down—there is no climbing back up!",
    "fixed": [
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "oneWay": [
      {
        "x": 2,
        "y": 2,
        "direction": "down"
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 4
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 84,
    "world": 5,
    "name": "Crumbling Vault",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 23,
    "hint": "Cross the crumbling stone to hit the switch, then drop through the unlocked gate!",
    "fixed": [
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 1
        },
        "doorPos": {
          "x": 2,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 29
  },
  {
    "id": 85,
    "world": 5,
    "name": "Switchboard",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 25,
    "hint": "Unlock both gates in sequence while collecting both western stars.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 2
        }
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 3,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 4
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 32
  },
  {
    "id": 86,
    "world": 5,
    "name": "Sticky Portal",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 1
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Avoid the sticky shortcut above—detour south to keep both tiles for the portal cavern!",
    "fixed": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "sticky": [
      {
        "x": 1,
        "y": 1
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 3,
          "y": 1
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 3
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 87,
    "world": 5,
    "name": "The Fragile Loop",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Three crumbling stones form a fragile ring—trace a single unbroken path!",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 88,
    "world": 5,
    "name": "Arrow Matrix",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Obey the directional arrows while collecting both central stars.",
    "fixed": [
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 0,
        "direction": "right"
      },
      {
        "x": 5,
        "y": 2,
        "direction": "down"
      },
      {
        "x": 0,
        "y": 4,
        "direction": "down"
      },
      {
        "x": 0,
        "y": 6,
        "direction": "right"
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 0,
        "y": 3
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 89,
    "world": 5,
    "name": "Honey & Gate",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Cross the honey trench to reach the warp pad, unlock the gate, and finish with 2 tiles!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 2
        },
        "doorPos": {
          "x": 3,
          "y": 3
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 90,
    "world": 5,
    "name": "Chamber of Trials",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Warp into the switch room, open the gate, ride the arrow south, grab the star, and finish!",
    "fixed": [
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "oneWay": [
      {
        "x": 2,
        "y": 5,
        "direction": "down"
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 3
        },
        "doorPos": {
          "x": 2,
          "y": 4
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 3,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 3
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 6
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 91,
    "world": 5,
    "name": "The Broken Spiral",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 3,
      "y": 3
    },
    "parMoves": 18,
    "hint": "Trace the crumbling spiral clockwise into the exit sanctuary.",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      },
      {
        "x": 5,
        "y": 6
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 23
  },
  {
    "id": 92,
    "world": 5,
    "name": "Double Locked",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 18,
    "hint": "Open Gate 1, grab the star, warp south to hit Switch 2, and unlock the exit gate!",
    "fixed": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 2
        }
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 2,
          "y": 5
        },
        "doorPos": {
          "x": 3,
          "y": 6
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 3,
          "y": 3
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 3
      }
    ],
    "star2Moves": 23
  },
  {
    "id": 93,
    "world": 5,
    "name": "One-Way Honey",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Ride the top arrow, sacrifice 1 tile in the honey chute, then clear the lower terrace with 2 tiles!",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      }
    ],
    "sticky": [
      {
        "x": 4,
        "y": 1
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 0,
        "direction": "right"
      },
      {
        "x": 3,
        "y": 4,
        "direction": "down"
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 94,
    "world": 5,
    "name": "Portal Labyrinth",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Warp east, hit the switch, take Portal 2, and cross the unlocked gate to the exit!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 5
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 3,
          "y": 0
        },
        "posB": {
          "x": 4,
          "y": 2
        }
      },
      {
        "id": "tp-2",
        "posA": {
          "x": 3,
          "y": 3
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 95,
    "world": 5,
    "name": "The Crucible",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 22,
    "hint": "Wait—make sure Switch a is reachable and Gate A blocks the exit cleanly!",
    "fixed": [
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 1,
          "y": 2
        },
        "doorPos": {
          "x": 4,
          "y": 5
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 5,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 4
        }
      }
    ],
    "stars": [
      {
        "x": 4,
        "y": 2
      }
    ],
    "star2Moves": 28
  },
  {
    "id": 96,
    "world": 5,
    "name": "Clockwork Maze",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Open the gate, descend across the fragile stepping stones, and sweep the lower star.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 0,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "crumbling": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 97,
    "world": 5,
    "name": "Perilous Passage",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 23,
    "hint": "Step around the sticky honey to keep both tiles for the crumbling lower hall and star!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "crumbling": [
      {
        "x": 4,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 29
  },
  {
    "id": 98,
    "world": 5,
    "name": "Quantum Leap",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 13,
    "hint": "Warp into the central chamber, press the switch, grab the star, take Portal 2, and pass Gate A!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 6
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 3,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 3
        }
      },
      {
        "id": "tp-2",
        "posA": {
          "x": 4,
          "y": 3
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 3
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 99,
    "world": 5,
    "name": "The Penultimate Riddle",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 20,
    "hint": "Sacrifice 1 tile on the sticky bridge to cross the crumbling stone into Portal 1, flip Switch a, and finish with 2 tiles!",
    "fixed": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 2
        },
        "doorPos": {
          "x": 3,
          "y": 3
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 5,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 25
  },
  {
    "id": 100,
    "world": 5,
    "name": "Steal the Floor Master",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "The ultimate trial! Sacrifice 1 tile on honey, cross the crumbling stone to Switch a, warp south, unlock both gates, and claim the crown!",
    "fixed": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 4
        }
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 0,
          "y": 5
        },
        "doorPos": {
          "x": 3,
          "y": 6
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 1
        },
        "posB": {
          "x": 0,
          "y": 3
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 101,
    "world": 6,
    "name": "First Freeze",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 1
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 8,
    "hint": "Step onto glistening ice to glide across solid tiles in a single move!",
    "fixed": [
      {
        "x": 5,
        "y": 1
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 2
      }
    ],
    "ice": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "star2Moves": 10
  },
  {
    "id": 102,
    "world": 6,
    "name": "Power Up +1",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 10,
    "hint": "With only 1 tile you cannot cross the final 2-tile chasm—grab the +1 Bonus Tile first!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      }
    ],
    "bonusTiles": [
      {
        "x": 4,
        "y": 0
      }
    ],
    "star2Moves": 13
  },
  {
    "id": 103,
    "world": 6,
    "name": "Glacier Rink",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 7,
    "hint": "Glide around the perimeter ice rinks to reach the western gem and exit.",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "ice": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 9
  },
  {
    "id": 104,
    "world": 6,
    "name": "Spark Collector",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 13,
    "hint": "Claim the +1 tile on the northeast island to unlock 2-tile bridges!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 4,
        "y": 2
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 1
      }
    ],
    "stars": [
      {
        "x": 2,
        "y": 3
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 105,
    "world": 6,
    "name": "Ice Express",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 9,
    "hint": "Use the central ice spine to zip quickly between northern and southern islands.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      }
    ],
    "ice": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 12
  },
  {
    "id": 106,
    "world": 6,
    "name": "Double Boost",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 1,
      "y": 6
    },
    "parMoves": 13,
    "hint": "Pick up BOTH +1 Bonus Tiles to expand your reach from 1 tile to 3 tiles!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 107,
    "world": 6,
    "name": "Frozen Switch",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Glide east to hit the switch, then skate south through the unlocked laser gate!",
    "fixed": [
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "ice": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 108,
    "world": 6,
    "name": "Frost & Crumble",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 11,
    "hint": "Skate east across the crumbling ice anchor, glide south, then sweep the western gem!",
    "fixed": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 4,
        "y": 2
      }
    ],
    "crumbling": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 1,
        "y": 4
      }
    ],
    "ice": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      }
    ],
    "star2Moves": 14
  },
  {
    "id": 109,
    "world": 6,
    "name": "Bonus Bridge",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 3,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Start with 1 tile, grab the gem and +1 boost, then bridge the 2-tile southern chasm!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "bonusTiles": [
      {
        "x": 4,
        "y": 0
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 2
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 110,
    "world": 6,
    "name": "Polar Warp",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 10,
    "hint": "Skate straight into Portal 1 to warp onto the southern glacier!",
    "fixed": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      }
    ],
    "ice": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 5,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 13
  },
  {
    "id": 111,
    "world": 6,
    "name": "Honey vs Spark",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 1
    },
    "exit": {
      "x": 1,
      "y": 5
    },
    "parMoves": 11,
    "hint": "The sticky honey steals 1 tile, but the +1 Spark restores your 3-tile reach for the final chasm!",
    "fixed": [
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 1
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 1
      }
    ],
    "star2Moves": 14
  },
  {
    "id": 112,
    "world": 6,
    "name": "Ice Gatekeeper",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 21,
    "hint": "Grab the +1 tile and flip Switch a before sliding south through Gate A!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "ice": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "bonusTiles": [
      {
        "x": 4,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 113,
    "world": 6,
    "name": "Slippery Arrows",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 18,
    "hint": "One-way arrows steer your skate path cleanly across the ice.",
    "fixed": [
      {
        "x": 0,
        "y": 3
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      }
    ],
    "ice": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "oneWay": [
      {
        "x": 4,
        "y": 0,
        "direction": "right"
      },
      {
        "x": 3,
        "y": 3,
        "direction": "left"
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 3
      }
    ],
    "star2Moves": 23
  },
  {
    "id": 114,
    "world": 6,
    "name": "Arctic Vault",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 14,
    "hint": "Grab the +1 tile before warping so you have 2 tiles to sweep the vault!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 4,
        "y": 4
      }
    ],
    "bonusTiles": [
      {
        "x": 4,
        "y": 0
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 5,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 18
  },
  {
    "id": 115,
    "world": 6,
    "name": "Twin Glaciers",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 24,
    "hint": "Unlock both frosted laser gates while skating down the twin glaciers!",
    "fixed": [
      {
        "x": 4,
        "y": 0
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "ice": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 2
        }
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 5,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 4
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 5
      }
    ],
    "star2Moves": 30
  },
  {
    "id": 116,
    "world": 6,
    "name": "Crumble & Boost",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Cross the fragile stone to claim the +1 tile, then leap south with 2 tiles!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "bonusTiles": [
      {
        "x": 5,
        "y": 0
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 4
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 117,
    "world": 6,
    "name": "Frost Labyrinth",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Skate into Portal 1, glide to Switch a, and drop through Gate A onto the lower ice.",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "ice": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 2
        },
        "doorPos": {
          "x": 3,
          "y": 3
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 4
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 118,
    "world": 6,
    "name": "Spark Chasm",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 2,
      "y": 5
    },
    "parMoves": 15,
    "hint": "Collect both +1 Bonus Tiles to grow your bridge reach from 1 to 3 and leap the final chasm!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 119,
    "world": 6,
    "name": "Cryo Trials",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Boost your tiles, unlock Gate A, skate down to the gem, and warp onto the final ice strip!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "ice": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 1
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 0,
          "y": 2
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 3
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 120,
    "world": 6,
    "name": "Grand Frost Master",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 21,
    "hint": "The grand finale of Frost & Spark! Combine +1 tiles, crumbling stone, ice slides, portals, and dual gates!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 6
      },
      {
        "x": 1,
        "y": 6
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "crumbling": [
      {
        "x": 4,
        "y": 0
      }
    ],
    "ice": [
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 1
        }
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 5,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 6
        }
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 0,
          "y": 2
        },
        "posB": {
          "x": 0,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "star2Moves": 27
  },
  {
    "id": 121,
    "world": 7,
    "name": "Tick Tock Gate",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 11,
    "hint": "Step on the timed switch to open Gate A for 3 moves — sprint straight through before it shuts!",
    "fixed": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        },
        "timedDuration": 3
      }
    ],
    "star2Moves": 14
  },
  {
    "id": 122,
    "world": 7,
    "name": "Beat the Bell",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Hit Switch a on the east ledge, reclaim on the middle stone, and race through Gate A in 5 moves!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 2,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 2
        },
        "timedDuration": 5
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 123,
    "world": 7,
    "name": "Gearbox Sprint",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 3,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Grab the western gem FIRST — once you tap Switch a, you only have 3 moves to reach Gate A!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 4,
          "y": 2
        },
        "timedDuration": 3
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 124,
    "world": 7,
    "name": "Pendulum Path",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 13,
    "hint": "Hit Switch a, use the central island to reclaim your bridge tiles, and dash through Gate A!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 0
        },
        "doorPos": {
          "x": 4,
          "y": 3
        },
        "timedDuration": 7
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 125,
    "world": 7,
    "name": "Crumbling Clockwork",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 10,
    "hint": "Use the crumbling checkpoint to reclaim your bridge tiles midway through the timed sprint!",
    "fixed": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 2
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 2
        },
        "doorPos": {
          "x": 4,
          "y": 3
        },
        "timedDuration": 5
      }
    ],
    "star2Moves": 13
  },
  {
    "id": 126,
    "world": 7,
    "name": "Frosty Fuse",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 2,
      "y": 6
    },
    "parMoves": 12,
    "hint": "Hit Switch a and immediately glide across the ice runway — one move covers the whole ledge to beat the 3-move timer!",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      }
    ],
    "ice": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 0
        },
        "doorPos": {
          "x": 5,
          "y": 2
        },
        "timedDuration": 3
      }
    ],
    "star2Moves": 15
  },
  {
    "id": 127,
    "world": 7,
    "name": "Forge Spark",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 3,
      "y": 0
    },
    "exit": {
      "x": 3,
      "y": 6
    },
    "parMoves": 16,
    "hint": "Collect the +1 Bonus Tile first so your 2-tile bridge can sprint directly from Switch a to Gate A!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "bonusTiles": [
      {
        "x": 0,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        },
        "timedDuration": 4
      }
    ],
    "star2Moves": 20
  },
  {
    "id": 128,
    "world": 7,
    "name": "Sticky Delay",
    "cols": 6,
    "rows": 7,
    "maxTiles": 3,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Cross the sticky honey corridor sacrificing 1 tile, hit Switch a, and sprint to Gate A with your remaining 2!",
    "fixed": [
      {
        "x": 1,
        "y": 0
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 2,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 3
        },
        "timedDuration": 5
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 129,
    "world": 7,
    "name": "One-Way Escapement",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 14,
    "hint": "Ride the one-way escapement arrows straight from Switch a into Gate A in 4 crisp moves!",
    "fixed": [
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 0,
        "direction": "right"
      },
      {
        "x": 4,
        "y": 0,
        "direction": "down"
      },
      {
        "x": 4,
        "y": 1,
        "direction": "down"
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 0
        },
        "doorPos": {
          "x": 4,
          "y": 2
        },
        "timedDuration": 4
      }
    ],
    "star2Moves": 18
  },
  {
    "id": 130,
    "world": 7,
    "name": "Warp Relay",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 15,
    "hint": "Hit Switch a, dive into Portal 1, and sprint across the middle vault before Gate A seals shut!",
    "fixed": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 0
        },
        "doorPos": {
          "x": 5,
          "y": 2
        },
        "timedDuration": 7
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "star2Moves": 19
  },
  {
    "id": 131,
    "world": 7,
    "name": "Twin Mainsprings",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Two rapid countdown gates in a row! Clear Gate A in 3 moves, then trip Switch b and race back to Gate B!",
    "fixed": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 0
        },
        "doorPos": {
          "x": 2,
          "y": 1
        },
        "timedDuration": 3
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 4,
          "y": 2
        },
        "doorPos": {
          "x": 2,
          "y": 3
        },
        "timedDuration": 3
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 132,
    "world": 7,
    "name": "Gem Before Gear",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 22,
    "hint": "Sweeping both top gems first is mandatory — Switch a only holds Gate A open for 3 moves!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 2
        },
        "doorPos": {
          "x": 4,
          "y": 3
        },
        "timedDuration": 3
      }
    ],
    "stars": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      }
    ],
    "star2Moves": 28
  },
  {
    "id": 133,
    "world": 7,
    "name": "Glacial Timer",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 4,
      "y": 6
    },
    "parMoves": 11,
    "hint": "Step on Switch a, skate straight into Portal 1 in one glide, and clear Gate A before the clock hits zero!",
    "fixed": [
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 2,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      }
    ],
    "ice": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 2
        },
        "timedDuration": 4
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 5,
          "y": 0
        },
        "posB": {
          "x": 0,
          "y": 2
        }
      }
    ],
    "star2Moves": 14
  },
  {
    "id": 134,
    "world": 7,
    "name": "Anvil Overdrive",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 1,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Grab the +1 Bonus Tile first, trigger Switch a, and dash over the crumbling stone through Gate A!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 2
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 0,
          "y": 2
        },
        "doorPos": {
          "x": 4,
          "y": 3
        },
        "timedDuration": 5
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 135,
    "world": 7,
    "name": "Synchronized Gears",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 19,
    "hint": "Sprint from Switch a through Gate A, grab the gem, then hit Switch b and race back through Gate B!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 4,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 3,
          "y": 0
        },
        "doorPos": {
          "x": 1,
          "y": 2
        },
        "timedDuration": 4
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 4,
          "y": 3
        },
        "doorPos": {
          "x": 2,
          "y": 4
        },
        "timedDuration": 3
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 3
      }
    ],
    "star2Moves": 24
  },
  {
    "id": 136,
    "world": 7,
    "name": "Molten Shortcut",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 2
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 17,
    "hint": "Detour north around the sticky honey so both tiles survive for the 3-move timed sprint from Switch a to Gate A!",
    "fixed": [
      {
        "x": 0,
        "y": 0
      },
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 3
      },
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 5,
        "y": 3
      }
    ],
    "sticky": [
      {
        "x": 1,
        "y": 2
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 5,
          "y": 2
        },
        "doorPos": {
          "x": 3,
          "y": 3
        },
        "timedDuration": 3
      }
    ],
    "stars": [
      {
        "x": 3,
        "y": 4
      }
    ],
    "star2Moves": 22
  },
  {
    "id": 137,
    "world": 7,
    "name": "Spring-Loaded Ice",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 12,
    "hint": "Grab the +1 Bonus Tile, press Switch a, and ride the vertical ice chute straight into Gate A!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 2,
        "y": 5
      },
      {
        "x": 4,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "ice": [
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 4,
        "y": 3
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 1
        },
        "doorPos": {
          "x": 4,
          "y": 4
        },
        "timedDuration": 3
      }
    ],
    "star2Moves": 15
  },
  {
    "id": 138,
    "world": 7,
    "name": "Clockwork Labyrinth",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 5,
      "y": 6
    },
    "parMoves": 13,
    "hint": "Press Switch a, ride the one-way chute into Portal 1, and dash through Gate A before it shuts!",
    "fixed": [
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "oneWay": [
      {
        "x": 3,
        "y": 0,
        "direction": "right"
      },
      {
        "x": 4,
        "y": 0,
        "direction": "down"
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 0
        },
        "doorPos": {
          "x": 3,
          "y": 4
        },
        "timedDuration": 7
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 4,
          "y": 1
        },
        "posB": {
          "x": 0,
          "y": 3
        }
      }
    ],
    "star2Moves": 17
  },
  {
    "id": 139,
    "world": 7,
    "name": "The Furnace Core",
    "cols": 6,
    "rows": 7,
    "maxTiles": 2,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 26,
    "hint": "Skate from Switch a through Gate A in 2 moves, cross the crumbling stone for the gem, then beat Timed Gate B!",
    "fixed": [
      {
        "x": 5,
        "y": 0
      },
      {
        "x": 5,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 3,
        "y": 5
      },
      {
        "x": 3,
        "y": 6
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 1
      },
      {
        "x": 1,
        "y": 1
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 3,
        "y": 1
      },
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 2
      }
    ],
    "ice": [
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 4,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 2,
          "y": 0
        },
        "doorPos": {
          "x": 5,
          "y": 1
        },
        "timedDuration": 2
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 5,
          "y": 3
        },
        "doorPos": {
          "x": 3,
          "y": 4
        },
        "timedDuration": 3
      }
    ],
    "stars": [
      {
        "x": 1,
        "y": 3
      }
    ],
    "star2Moves": 33
  },
  {
    "id": 140,
    "world": 7,
    "name": "Grand Horologist",
    "cols": 6,
    "rows": 7,
    "maxTiles": 1,
    "start": {
      "x": 0,
      "y": 0
    },
    "exit": {
      "x": 0,
      "y": 6
    },
    "parMoves": 18,
    "hint": "The ultimate Clockwork Forge trial! Grab +1, glide past Timed Gate A, cross crumbling stone to Portal 1, and beat Timed Gate B!",
    "fixed": [
      {
        "x": 2,
        "y": 0
      },
      {
        "x": 3,
        "y": 0
      },
      {
        "x": 5,
        "y": 3
      },
      {
        "x": 1,
        "y": 5
      }
    ],
    "rocks": [
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 2,
        "y": 2
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 0,
        "y": 4
      },
      {
        "x": 1,
        "y": 4
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 4
      },
      {
        "x": 4,
        "y": 4
      },
      {
        "x": 5,
        "y": 4
      },
      {
        "x": 0,
        "y": 5
      },
      {
        "x": 2,
        "y": 6
      },
      {
        "x": 3,
        "y": 6
      },
      {
        "x": 4,
        "y": 6
      },
      {
        "x": 5,
        "y": 6
      }
    ],
    "crumbling": [
      {
        "x": 3,
        "y": 3
      }
    ],
    "ice": [
      {
        "x": 4,
        "y": 1
      },
      {
        "x": 5,
        "y": 1
      }
    ],
    "bonusTiles": [
      {
        "x": 3,
        "y": 0
      }
    ],
    "switches": [
      {
        "id": "g1",
        "switchPos": {
          "x": 4,
          "y": 0
        },
        "doorPos": {
          "x": 5,
          "y": 2
        },
        "timedDuration": 3
      },
      {
        "id": "g2",
        "switchPos": {
          "x": 4,
          "y": 5
        },
        "doorPos": {
          "x": 1,
          "y": 6
        },
        "timedDuration": 4
      }
    ],
    "teleporters": [
      {
        "id": "tp-1",
        "posA": {
          "x": 0,
          "y": 3
        },
        "posB": {
          "x": 5,
          "y": 5
        }
      }
    ],
    "stars": [
      {
        "x": 5,
        "y": 3
      }
    ],
    "star2Moves": 23
  }
];

export const WORLDS = [
  { id: 1, name: 'First Steps', levels: [1, 20], theme: 'floating-sky', description: 'Master bridge reach, island reclamation, and gem detours.' },
  { id: 2, name: 'Think Ahead', levels: [21, 40], theme: 'candy-world', description: 'Navigate rock walls, tight corridors, and limited tile budgets.' },
  { id: 3, name: 'Tricky Tiles', levels: [41, 60], theme: 'ocean-islands', description: 'Master sticky honey sacrifices, crumbling checkpoints, and one-way arrows.' },
  { id: 4, name: 'Open the Way', levels: [61, 80], theme: 'neon-space', description: 'Unlock enclosed laser gates and warp across impassable divides.' },
  { id: 5, name: 'Master Builder', levels: [81, 100], theme: 'forest-adventure', description: 'Combine every mechanic in intricate multi-stage master puzzles.' },
  { id: 6, name: 'Frost & Spark', levels: [101, 120], theme: 'arctic-frost', description: 'Glide across frozen ice rinks and collect +1 Bonus Tiles to expand your reach.' },
  { id: 7, name: 'Clockwork Forge', levels: [121, 140], theme: 'clockwork-forge', description: 'Race countdown switches and timed gates across mechanical gauntlets.' },
];
