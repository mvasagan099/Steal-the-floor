import {
  Coordinate,
  Direction,
  LevelDefinition,
  MoveResult,
  MoveResultCode,
  GameStateSnapshot,
} from './types';

export const coordToKey = (coord: Coordinate): string => `${coord.x},${coord.y}`;
export const keyToCoord = (key: string): Coordinate => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

export const areCoordsEqual = (a: Coordinate, b: Coordinate): boolean =>
  a.x === b.x && a.y === b.y;

export const isAdjacent = (a: Coordinate, b: Coordinate): boolean =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

export const getDirection = (from: Coordinate, to: Coordinate): Direction | null => {
  if (to.x === from.x && to.y === from.y - 1) return 'up';
  if (to.x === from.x && to.y === from.y + 1) return 'down';
  if (to.x === from.x - 1 && to.y === from.y) return 'left';
  if (to.x === from.x + 1 && to.y === from.y) return 'right';
  return null;
};

export class PuzzleGame {
  public level: LevelDefinition;
  public player: Coordinate;
  public tiles: Set<string>; // Reusable bridge tiles placed
  public trapped: Set<string>; // Tiles trapped on sticky ground (lost from inventory)
  public crumbled: Set<string>; // Cells that crumbled away
  public collectedStars: Set<string>;
  public openDoors: Set<string>;
  public moves: number;
  public status: 'playing' | 'won';
  public history: GameStateSnapshot[];

  // Static lookup sets for level static elements
  private fixedSet: Set<string>;
  private rockSet: Set<string>;
  private stickySet: Set<string>;
  private crumblingSet: Set<string>;
  private oneWayMap: Map<string, Direction>;
  private switchMap: Map<string, string>; // coordKey -> switchDoorId
  private doorMap: Map<string, string>; // coordKey -> switchDoorId
  private teleporterMap: Map<string, Coordinate>; // coordKey -> destCoord
  public totalStars: number;

  constructor(level: LevelDefinition) {
    this.level = level;
    this.player = { ...level.start };
    this.tiles = new Set<string>();
    this.trapped = new Set<string>();
    this.crumbled = new Set<string>();
    this.collectedStars = new Set<string>();
    this.openDoors = new Set<string>();
    this.moves = 0;
    this.status = 'playing';
    this.history = [];

    // Precalculate lookups
    this.fixedSet = new Set<string>();
    this.fixedSet.add(coordToKey(level.start));
    this.fixedSet.add(coordToKey(level.exit));
    level.fixed?.forEach((c) => this.fixedSet.add(coordToKey(c)));

    this.rockSet = new Set<string>();
    level.rocks?.forEach((c) => this.rockSet.add(coordToKey(c)));

    this.stickySet = new Set<string>();
    level.sticky?.forEach((c) => this.stickySet.add(coordToKey(c)));

    this.crumblingSet = new Set<string>();
    level.crumbling?.forEach((c) => this.crumblingSet.add(coordToKey(c)));

    this.oneWayMap = new Map<string, Direction>();
    level.oneWay?.forEach((ow) => {
      const key = coordToKey(ow);
      this.oneWayMap.set(key, ow.direction);
      // One-way arrows are permanent directional platforms
      this.fixedSet.add(key);
    });

    this.switchMap = new Map<string, string>();
    this.doorMap = new Map<string, string>();
    level.switches?.forEach((sw) => {
      const swKey = coordToKey(sw.switchPos);
      this.switchMap.set(swKey, sw.id);
      // Switch pressure pads are permanent platforms
      this.fixedSet.add(swKey);
      this.doorMap.set(coordToKey(sw.doorPos), sw.id);
      if (sw.doorInitiallyOpen) {
        this.openDoors.add(sw.id);
      }
    });

    this.teleporterMap = new Map<string, Coordinate>();
    level.teleporters?.forEach((tp) => {
      const keyA = coordToKey(tp.posA);
      const keyB = coordToKey(tp.posB);
      this.teleporterMap.set(keyA, { ...tp.posB });
      this.teleporterMap.set(keyB, { ...tp.posA });
      // Teleporter pads are permanent platforms
      this.fixedSet.add(keyA);
      this.fixedSet.add(keyB);
    });

    this.totalStars = level.stars?.length || 0;
  }

  public get inventory(): number {
    return this.level.maxTiles - (this.tiles.size + this.trapped.size);
  }

  public canMoveTo(target: Coordinate): { allowed: boolean; reason?: string } {
    if (this.status === 'won') {
      return { allowed: false, reason: 'Level already completed!' };
    }

    // Bounds check
    if (
      target.x < 0 ||
      target.x >= this.level.cols ||
      target.y < 0 ||
      target.y >= this.level.rows
    ) {
      return { allowed: false, reason: 'Outside map boundaries' };
    }

    // Cannot step in place
    if (areCoordsEqual(this.player, target)) {
      return { allowed: false, reason: 'Already on this square' };
    }

    // Adjacency check
    if (!isAdjacent(this.player, target)) {
      return { allowed: false, reason: 'Only tap adjacent tiles' };
    }

    // One-way restriction on current cell
    const currentKey = coordToKey(this.player);
    const oneWayDir = this.oneWayMap.get(currentKey);
    if (oneWayDir) {
      const moveDir = getDirection(this.player, target);
      if (moveDir !== oneWayDir) {
        return {
          allowed: false,
          reason: `One-way tile! You can only exit going ${oneWayDir}.`,
        };
      }
    }

    const targetKey = coordToKey(target);

    // Rock obstacle
    if (this.rockSet.has(targetKey)) {
      return { allowed: false, reason: 'That rock blocks the path' };
    }

    // Closed door
    const doorId = this.doorMap.get(targetKey);
    if (doorId && !this.openDoors.has(doorId)) {
      return { allowed: false, reason: 'This gate is closed! Find a switch.' };
    }

    // Has floor or needs bridge tile?
    const hasFloor = this.hasWalkableFloor(targetKey);
    if (!hasFloor && this.inventory <= 0) {
      return {
        allowed: false,
        reason: 'Out of tiles! Step onto solid ground to reclaim them, or Undo.',
      };
    }

    return { allowed: true };
  }

  /**
   * Solid ground platforms reclaim all un-trapped bridge tiles when landed upon.
   * Includes start, exit, fixed islands, switches, one-way pads, teleporters,
   * open gates, and intact (not yet crumbled) crumbling stones.
   */
  public isSolidGround(coordKey: string): boolean {
    if (this.fixedSet.has(coordKey)) return true;
    if (this.crumblingSet.has(coordKey) && !this.crumbled.has(coordKey)) return true;
    const doorId = this.doorMap.get(coordKey);
    if (doorId && this.openDoors.has(doorId)) return true;
    return false;
  }

  public hasWalkableFloor(coordKey: string): boolean {
    if (this.isSolidGround(coordKey)) return true;
    if (this.tiles.has(coordKey)) return true;
    if (this.trapped.has(coordKey)) return true; // Stuck bridge still acts as floor
    return false;
  }

  public getLegalMoves(): Coordinate[] {
    const moves: Coordinate[] = [];
    const deltas = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ];

    for (const d of deltas) {
      const target: Coordinate = { x: this.player.x + d.x, y: this.player.y + d.y };
      if (this.canMoveTo(target).allowed) {
        moves.push(target);
      }
    }
    return moves;
  }

  public snapshot(): GameStateSnapshot {
    return {
      player: { ...this.player },
      tiles: Array.from(this.tiles),
      trapped: Array.from(this.trapped),
      crumbled: Array.from(this.crumbled),
      collectedStars: Array.from(this.collectedStars),
      openDoors: Array.from(this.openDoors),
      moves: this.moves,
      status: this.status,
    };
  }

  public restore(snapshot: GameStateSnapshot): void {
    this.player = { ...snapshot.player };
    this.tiles = new Set(snapshot.tiles);
    this.trapped = new Set(snapshot.trapped);
    this.crumbled = new Set(snapshot.crumbled);
    this.collectedStars = new Set(snapshot.collectedStars);
    this.openDoors = new Set(snapshot.openDoors);
    this.moves = snapshot.moves;
    this.status = snapshot.status;
  }

  public move(target: Coordinate): MoveResult {
    const check = this.canMoveTo(target);
    if (!check.allowed) {
      let code: MoveResultCode = 'ERR_NOT_ADJACENT';
      if (check.reason?.includes('rock')) code = 'ERR_ROCK';
      else if (check.reason?.includes('gate')) code = 'ERR_CLOSED_DOOR';
      else if (check.reason?.includes('One-way')) code = 'ERR_ONE_WAY';
      else if (check.reason?.includes('Out of tiles')) code = 'ERR_NO_TILES';
      else if (check.reason?.includes('boundaries')) code = 'ERR_OUT_OF_BOUNDS';

      return {
        success: false,
        code,
        message: check.reason || 'Invalid move',
      };
    }

    // Save snapshot for undo
    this.history.push(this.snapshot());

    const prevCoord = { ...this.player };
    const prevKey = coordToKey(prevCoord);
    const targetKey = coordToKey(target);

    const result: MoveResult = {
      success: true,
      code: 'SUCCESS',
      message: 'Moved successfully',
    };

    // 1. Place bridge tile if target is empty void (or sticky/crumbled void)
    const targetHadFloor = this.hasWalkableFloor(targetKey);
    if (!targetHadFloor) {
      this.tiles.add(targetKey);
      result.placedTile = { ...target };
    }

    // 2. Step player onto target
    this.player = { ...target };
    this.moves++;

    // 3. Handle departure hazards from previous cell (before any solid-ground reclaim!)
    const isPrevSticky = this.stickySet.has(prevKey);
    const isPrevCrumbling = this.crumblingSet.has(prevKey);

    if (isPrevSticky && this.tiles.has(prevKey)) {
      // Bridge tile left on sticky honey becomes permanently trapped
      this.tiles.delete(prevKey);
      this.trapped.add(prevKey);
      result.trappedTile = { ...prevCoord };
    } else if (isPrevCrumbling && !this.crumbled.has(prevKey)) {
      // Natural crumbling stone shatters behind the player into void
      this.crumbled.add(prevKey);
      result.crumbledTile = { ...prevCoord };
    }

    // 4. Solid-Ground Reclamation: landing on any solid platform reclaims all active bridge tiles!
    if (this.isSolidGround(targetKey) && this.tiles.size > 0) {
      const reclaimed: Coordinate[] = [];
      for (const key of Array.from(this.tiles)) {
        this.tiles.delete(key);
        reclaimed.push(keyToCoord(key));
      }
      result.recoveredTiles = reclaimed;
      result.recoveredTile = reclaimed[0];
    }

    // Helper to trigger cell collectibles & switches at current player position
    const triggerCellEffects = () => {
      const pKey = coordToKey(this.player);
      const isStar = this.level.stars?.some((s) => areCoordsEqual(s, this.player));
      if (isStar && !this.collectedStars.has(pKey)) {
        this.collectedStars.add(pKey);
        result.starCollected = { ...this.player };
      }

      const switchId = this.switchMap.get(pKey);
      if (switchId) {
        if (this.openDoors.has(switchId)) {
          this.openDoors.delete(switchId);
          result.doorToggled = { id: switchId, open: false };
        } else {
          this.openDoors.add(switchId);
          result.doorToggled = { id: switchId, open: true };
        }
      }
    };

    // 5. Star collection & Switches at stepped cell
    triggerCellEffects();

    // 6. Teleporter (pads are solid ground; trigger any star/switch on destination pad too)
    const dest = this.teleporterMap.get(coordToKey(this.player));
    if (dest) {
      this.player = { ...dest };
      result.teleportedTo = { ...dest };
      triggerCellEffects();
    }

    // 7. Win check
    if (areCoordsEqual(this.player, this.level.exit)) {
      if (this.collectedStars.size === this.totalStars) {
        this.status = 'won';
        result.code = 'SUCCESS_WIN';
        result.message = 'Level completed!';
      } else {
        result.message = `Collect all ${this.totalStars} stars before finishing!`;
      }
    }

    return result;
  }

  public undo(): boolean {
    if (this.history.length === 0) return false;
    const snap = this.history.pop()!;
    this.restore(snap);
    return true;
  }

  public restart(): void {
    const snap = this.history[0];
    if (snap) {
      this.restore(snap);
    } else {
      this.player = { ...this.level.start };
      this.tiles.clear();
      this.trapped.clear();
      this.crumbled.clear();
      this.collectedStars.clear();
      this.openDoors.clear();
      this.level.switches?.forEach((sw) => {
        if (sw.doorInitiallyOpen) this.openDoors.add(sw.id);
      });
      this.moves = 0;
      this.status = 'playing';
    }
    this.history = [];
  }
}
