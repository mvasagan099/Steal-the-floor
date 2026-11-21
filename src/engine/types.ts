export interface Coordinate {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface OneWayTile {
  x: number;
  y: number;
  direction: Direction;
}

export interface SwitchDoorPair {
  id: string;
  switchPos: Coordinate;
  doorPos: Coordinate;
  doorInitiallyOpen?: boolean;
}

export interface TeleporterPair {
  id: string;
  posA: Coordinate;
  posB: Coordinate;
}

export interface LevelDefinition {
  id: number;
  world: number; // 1 to 6 (0 for daily/endless/custom)
  name: string;
  cols: number;
  rows: number;
  maxTiles: number; // Default: 2 or 3
  start: Coordinate;
  exit: Coordinate;
  fixed?: Coordinate[];
  rocks?: Coordinate[];
  sticky?: Coordinate[];
  crumbling?: Coordinate[];
  ice?: Coordinate[];
  bonusTiles?: Coordinate[];
  oneWay?: OneWayTile[];
  switches?: SwitchDoorPair[];
  teleporters?: TeleporterPair[];
  stars?: Coordinate[];
  parMoves: number; // 3 stars threshold
  star2Moves?: number; // 2 stars threshold
  hint?: string;
}

export type MoveResultCode =
  | 'SUCCESS'
  | 'SUCCESS_WIN'
  | 'ERR_NOT_ADJACENT'
  | 'ERR_ROCK'
  | 'ERR_CLOSED_DOOR'
  | 'ERR_ONE_WAY'
  | 'ERR_NO_TILES'
  | 'ERR_OUT_OF_BOUNDS';

export interface MoveResult {
  success: boolean;
  code: MoveResultCode;
  message: string;
  placedTile?: Coordinate;
  recoveredTile?: Coordinate;
  recoveredTiles?: Coordinate[];
  trappedTile?: Coordinate;
  crumbledTile?: Coordinate;
  teleportedTo?: Coordinate;
  starCollected?: Coordinate;
  bonusTileCollected?: Coordinate;
  slidePath?: Coordinate[];
  doorToggled?: { id: string; open: boolean };
}

export interface GameStateSnapshot {
  player: Coordinate;
  tiles: string[]; // "x,y" keys
  trapped: string[]; // "x,y" keys
  crumbled: string[]; // "x,y" keys
  collectedStars: string[]; // "x,y" keys
  collectedBonusTiles: string[]; // "x,y" keys
  openDoors: string[]; // IDs
  moves: number;
  status: 'playing' | 'won';
}
