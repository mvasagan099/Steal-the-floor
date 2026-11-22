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

export interface ConveyorTile {
  x: number;
  y: number;
  direction: Direction;
}

export interface SwitchDoorPair {
  id: string;
  switchPos: Coordinate;
  doorPos: Coordinate;
  doorInitiallyOpen?: boolean;
  /** If set, stepping on the switch opens the gate for N moves before it auto-closes. */
  timedDuration?: number;
  /** If true, gate stays open ONLY while a crate (or Puff) rests on the weighted plate. */
  holdSwitch?: boolean;
}

export type PhasePolarity = 'even' | 'odd';

export interface PhaseTile {
  x: number;
  y: number;
  polarity: PhasePolarity;
}

export interface TeleporterPair {
  id: string;
  posA: Coordinate;
  posB: Coordinate;
}

export interface LevelDefinition {
  id: number;
  world: number; // 1 to 12 (0 for daily/endless/custom)
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
  springs?: Coordinate[];
  keys?: Coordinate[];
  locks?: Coordinate[];
  phaseTiles?: PhaseTile[];
  conveyors?: ConveyorTile[];
  bonusTiles?: Coordinate[];
  crates?: Coordinate[];
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
  | 'ERR_OUT_OF_BOUNDS'
  | 'ERR_CRATE_BLOCKED'
  | 'ERR_SPRING_BLOCKED'
  | 'ERR_LOCKED_VAULT';

export interface MoveResult {
  success: boolean;
  code: MoveResultCode;
  message: string;
  placedTile?: Coordinate;
  placedTiles?: Coordinate[];
  recoveredTile?: Coordinate;
  recoveredTiles?: Coordinate[];
  trappedTile?: Coordinate;
  crumbledTile?: Coordinate;
  teleportedTo?: Coordinate;
  starCollected?: Coordinate;
  bonusTileCollected?: Coordinate;
  keyCollected?: Coordinate;
  lockOpened?: Coordinate;
  pushedCrate?: { from: Coordinate; to: Coordinate };
  cratePath?: Coordinate[];
  springPath?: Coordinate[];
  conveyorPath?: Coordinate[];
  slidePath?: Coordinate[];
  motionSteps?: Array<{ kind: 'spring' | 'conveyor' | 'ice'; to: Coordinate }>;
  doorToggled?: { id: string; open: boolean };
  phaseShifted?: boolean;
}

export interface GameStateSnapshot {
  player: Coordinate;
  tiles: string[]; // "x,y" keys
  trapped: string[]; // "x,y" keys
  crumbled: string[]; // "x,y" keys
  collectedStars: string[]; // "x,y" keys
  collectedBonusTiles: string[]; // "x,y" keys
  collectedKeys?: string[]; // "x,y" keys
  unlockedLocks?: string[]; // "x,y" keys
  crates?: string[]; // "x,y" keys
  openDoors: string[]; // IDs
  doorTimers?: Record<string, number>; // timed door ID -> remaining moves
  moves: number;
  status: 'playing' | 'won';
}
