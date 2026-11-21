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

const DIR_DELTA: Record<Direction, Coordinate> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export class PuzzleGame {
  public level: LevelDefinition;
  public player: Coordinate;
  public tiles: Set<string>; // Reusable bridge tiles placed
  public trapped: Set<string>; // Tiles trapped on sticky ground (lost from inventory)
  public crumbled: Set<string>; // Cells that crumbled away
  public collectedStars: Set<string>;
  public collectedBonusTiles: Set<string>; // +1 maxTiles pickups collected
  public openDoors: Set<string>;
  public doorTimers: Map<string, number>; // timed door ID -> moves remaining before auto-close
  public moves: number;
  public status: 'playing' | 'won';
  public history: GameStateSnapshot[];

  // Static lookup sets for level static elements
  private fixedSet: Set<string>;
  private rockSet: Set<string>;
  private stickySet: Set<string>;
  private crumblingSet: Set<string>;
  private iceSet: Set<string>;
  private bonusTileSet: Set<string>;
  private oneWayMap: Map<string, Direction>;
  private switchMap: Map<string, string>; // coordKey -> switchDoorId
  private switchDurationMap: Map<string, number>; // switchDoorId -> timedDuration
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
    this.collectedBonusTiles = new Set<string>();
    this.openDoors = new Set<string>();
    this.doorTimers = new Map<string, number>();
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

    this.iceSet = new Set<string>();
    level.ice?.forEach((c) => {
      const key = coordToKey(c);
      this.iceSet.add(key);
      // Ice tiles are solid platforms that slide the player in their move direction
      this.fixedSet.add(key);
    });

    this.bonusTileSet = new Set<string>();
    level.bonusTiles?.forEach((c) => this.bonusTileSet.add(coordToKey(c)));

    this.oneWayMap = new Map<string, Direction>();
    level.oneWay?.forEach((ow) => {
      const key = coordToKey(ow);
      this.oneWayMap.set(key, ow.direction);
      this.fixedSet.add(key);
    });

    this.switchMap = new Map<string, string>();
    this.switchDurationMap = new Map<string, number>();
    this.doorMap = new Map<string, string>();
    level.switches?.forEach((sw) => {
      const swKey = coordToKey(sw.switchPos);
      this.switchMap.set(swKey, sw.id);
      if (sw.timedDuration && sw.timedDuration > 0) {
        this.switchDurationMap.set(sw.id, sw.timedDuration);
      }
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
      this.fixedSet.add(keyA);
      this.fixedSet.add(keyB);
    });

    this.totalStars = level.stars?.length || 0;
  }

  public get currentMaxTiles(): number {
    return this.level.maxTiles + this.collectedBonusTiles.size;
  }

  public get inventory(): number {
    return this.currentMaxTiles - (this.tiles.size + this.trapped.size);
  }

  public canMoveTo(target: Coordinate): { allowed: boolean; reason?: string } {
    if (this.status === 'won') {
      return { allowed: false, reason: 'Level already completed!' };
    }

    if (
      target.x < 0 ||
      target.x >= this.level.cols ||
      target.y < 0 ||
      target.y >= this.level.rows
    ) {
      return { allowed: false, reason: 'Outside map boundaries' };
    }

    if (areCoordsEqual(this.player, target)) {
      return { allowed: false, reason: 'Already on this square' };
    }

    if (!isAdjacent(this.player, target)) {
      return { allowed: false, reason: 'Only tap adjacent tiles' };
    }

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

    if (this.rockSet.has(targetKey)) {
      return { allowed: false, reason: 'That rock blocks the path' };
    }

    const doorId = this.doorMap.get(targetKey);
    if (doorId && !this.openDoors.has(doorId)) {
      return { allowed: false, reason: 'This gate is closed! Find a switch.' };
    }

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
   * ice tiles, open gates, and intact (not yet crumbled) crumbling stones.
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
    if (this.trapped.has(coordKey)) return true;
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
    const timersObj: Record<string, number> = {};
    this.doorTimers.forEach((v, k) => {
      timersObj[k] = v;
    });
    return {
      player: { ...this.player },
      tiles: Array.from(this.tiles),
      trapped: Array.from(this.trapped),
      crumbled: Array.from(this.crumbled),
      collectedStars: Array.from(this.collectedStars),
      collectedBonusTiles: Array.from(this.collectedBonusTiles),
      openDoors: Array.from(this.openDoors),
      doorTimers: timersObj,
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
    this.collectedBonusTiles = new Set(snapshot.collectedBonusTiles || []);
    this.openDoors = new Set(snapshot.openDoors);
    this.doorTimers = new Map(
      Object.entries(snapshot.doorTimers || {}).map(([k, v]) => [k, Number(v)])
    );
    this.moves = snapshot.moves;
    this.status = snapshot.status;
  }

  private canSlideInto(coord: Coordinate): boolean {
    if (coord.x < 0 || coord.x >= this.level.cols || coord.y < 0 || coord.y >= this.level.rows) {
      return false;
    }
    const key = coordToKey(coord);
    if (this.rockSet.has(key)) return false;
    const doorId = this.doorMap.get(key);
    if (doorId && !this.openDoors.has(doorId)) return false;
    return this.hasWalkableFloor(key);
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

    this.history.push(this.snapshot());

    const prevCoord = { ...this.player };
    const prevKey = coordToKey(prevCoord);
    const targetKey = coordToKey(target);
    const moveDir = getDirection(prevCoord, target)!;

    const result: MoveResult = {
      success: true,
      code: 'SUCCESS',
      message: 'Moved successfully',
    };

    // 1. Place bridge tile if target is empty void
    const targetHadFloor = this.hasWalkableFloor(targetKey);
    if (!targetHadFloor) {
      this.tiles.add(targetKey);
      result.placedTile = { ...target };
    }

    // 2. Step player onto target & advance move counter
    this.player = { ...target };
    this.moves++;

    // 2b. Tick down any active timed gates (a gate does not snap shut while player is standing on it)
    const standingDoorId = this.doorMap.get(targetKey);
    for (const [dId, remaining] of Array.from(this.doorTimers.entries())) {
      const nextRemaining = remaining - 1;
      if (nextRemaining <= 0 && standingDoorId !== dId) {
        this.doorTimers.delete(dId);
        this.openDoors.delete(dId);
        result.doorToggled = { id: dId, open: false };
      } else {
        this.doorTimers.set(dId, Math.max(1, nextRemaining));
      }
    }

    // 3. Handle departure hazards from previous cell
    const isPrevSticky = this.stickySet.has(prevKey);
    const isPrevCrumbling = this.crumblingSet.has(prevKey);

    if (isPrevSticky && this.tiles.has(prevKey)) {
      this.tiles.delete(prevKey);
      this.trapped.add(prevKey);
      result.trappedTile = { ...prevCoord };
    } else if (isPrevCrumbling && !this.crumbled.has(prevKey)) {
      this.crumbled.add(prevKey);
      result.crumbledTile = { ...prevCoord };
    }

    // 4. Solid-Ground Reclamation
    const reclaimOnSolid = (key: string) => {
      if (this.isSolidGround(key) && this.tiles.size > 0) {
        const reclaimed: Coordinate[] = result.recoveredTiles || [];
        for (const tKey of Array.from(this.tiles)) {
          this.tiles.delete(tKey);
          reclaimed.push(keyToCoord(tKey));
        }
        result.recoveredTiles = reclaimed;
        result.recoveredTile = reclaimed[0];
      }
    };
    reclaimOnSolid(targetKey);

    // Helper to trigger collectibles, bonus tiles, and switches at current cell
    const triggerCellEffects = () => {
      const pKey = coordToKey(this.player);

      const isStar = this.level.stars?.some((s) => areCoordsEqual(s, this.player));
      if (isStar && !this.collectedStars.has(pKey)) {
        this.collectedStars.add(pKey);
        result.starCollected = { ...this.player };
      }

      if (this.bonusTileSet.has(pKey) && !this.collectedBonusTiles.has(pKey)) {
        this.collectedBonusTiles.add(pKey);
        result.bonusTileCollected = { ...this.player };
      }

      const switchId = this.switchMap.get(pKey);
      if (switchId) {
        const timedDuration = this.switchDurationMap.get(switchId);
        if (timedDuration) {
          // Timed switch always opens/refreshes the countdown timer!
          this.openDoors.add(switchId);
          this.doorTimers.set(switchId, timedDuration);
          result.doorToggled = { id: switchId, open: true };
        } else if (this.openDoors.has(switchId)) {
          this.openDoors.delete(switchId);
          result.doorToggled = { id: switchId, open: false };
        } else {
          this.openDoors.add(switchId);
          result.doorToggled = { id: switchId, open: true };
        }
      }
    };

    // 5. Initial landing cell effects
    triggerCellEffects();

    // 6. Ice Sliding
    if (this.iceSet.has(coordToKey(this.player))) {
      const slidePath: Coordinate[] = [];
      const delta = DIR_DELTA[moveDir];
      let safety = 0;

      while (this.iceSet.has(coordToKey(this.player)) && safety < 20) {
        safety++;
        const nextCell: Coordinate = {
          x: this.player.x + delta.x,
          y: this.player.y + delta.y,
        };
        if (!this.canSlideInto(nextCell)) break;

        this.player = nextCell;
        slidePath.push({ ...nextCell });
        reclaimOnSolid(coordToKey(nextCell));
        triggerCellEffects();

        if (
          (areCoordsEqual(this.player, this.level.exit) &&
            this.collectedStars.size === this.totalStars) ||
          this.teleporterMap.has(coordToKey(this.player))
        ) {
          break;
        }
      }

      if (slidePath.length > 0) {
        result.slidePath = slidePath;
      }
    }

    // 7. Teleporter
    const dest = this.teleporterMap.get(coordToKey(this.player));
    if (dest) {
      this.player = { ...dest };
      result.teleportedTo = { ...dest };
      triggerCellEffects();
    }

    // 8. Win check
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
      this.collectedBonusTiles.clear();
      this.openDoors.clear();
      this.doorTimers.clear();
      this.level.switches?.forEach((sw) => {
        if (sw.doorInitiallyOpen) this.openDoors.add(sw.id);
      });
      this.moves = 0;
      this.status = 'playing';
    }
    this.history = [];
  }
}
