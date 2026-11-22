import Phaser from 'phaser';
import { Coordinate, Direction, LevelDefinition, MoveResult } from './types';
import { PuzzleGame, coordToKey, keyToCoord, areCoordsEqual } from './logic';
import { generateAllTextures, THEME_PALETTES } from './textureGenerator';
import { sound } from '../audio/soundManager';
import { solveFromState, solveLevel } from './solver';

export interface GameSceneConfig {
  level: LevelDefinition;
  themeId: string;
  skinColor: string;
  trailId?: string;
  tileSkinId?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
  ghostRun?: [number, number, number][];
  showGhost?: boolean;
  onStateChange: (game: PuzzleGame) => void;
  onWin: (moves: number, starsEarned: number, parMoves: number) => void;
  onError: (message: string) => void;
  onDeadlock?: (isDeadlocked: boolean) => void;
  onTilePlaced?: () => void;
  onUndoUsed?: () => void;
  onDemoStateChange?: (isDemoPlaying: boolean) => void;
}

interface PositionedSprite {
  coord: Coordinate;
  sprite: Phaser.GameObjects.Sprite;
}

interface DoorEntry {
  coord: Coordinate;
  switchPos: Coordinate;
  pairIndex: number;
  sprite: Phaser.GameObjects.Sprite;
  timedDuration?: number;
  timerText?: Phaser.GameObjects.Text;
}

const TRAIL_TINTS: Record<string, number[]> = {
  'trail-none': [],
  'trail-sparkle': [0xfef08a, 0xfbbf24, 0xffffff],
  'trail-frost': [0xe0f2fe, 0x67e8f9, 0x38bdf8],
  'trail-neon': [0xf472b6, 0xc084fc, 0x38bdf8],
  'trail-ember': [0xfb923c, 0xfbbf24, 0xf43f5e],
  'trail-gold': [0xfef08a, 0xf59e0b, 0xfffbeb],
  'trail-celestial': [0xfef08a, 0xa5b4fc, 0xf472b6, 0xffffff],
  'trail-chrono': [0x22d3ee, 0xe879f9, 0xffffff],
  'trail-rainbow': [0xf43f5e, 0xfbbf24, 0x4ade80, 0x38bdf8, 0xc084fc],
};

export class GameScene extends Phaser.Scene {
  private config!: GameSceneConfig;
  public gameLogic!: PuzzleGame;

  private tileSize = 56;
  private offsetX = 0;
  private offsetY = 0;
  private baseTileScale = 1;
  private basePlayerScale = 1;
  private baseStarScale = 1;
  private baseHintScale = 1;

  private bgGraphics: Phaser.GameObjects.Graphics | null = null;
  private staticSprites: PositionedSprite[] = [];
  private crumblingSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private phaseSprites: Map<
    string,
    { sprite: Phaser.GameObjects.Sprite; polarity: 'even' | 'odd' }
  > = new Map();
  private tileSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private starSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private bonusTileSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private keySprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private lockSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private crateSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private holdSwitchKeys: Set<string> = new Set();
  private doorSprites: Map<string, DoorEntry> = new Map();
  private highlightSprites: Phaser.GameObjects.Sprite[] = [];
  private hintHighlight: Phaser.GameObjects.Sprite | null = null;
  private hintCoord: Coordinate | null = null;

  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerIdleTween: Phaser.Tweens.Tween | null = null;
  private ghostSprite: Phaser.GameObjects.Sprite | null = null;
  private ghostCoord: Coordinate | null = null;
  private ghostTimers: Phaser.Time.TimerEvent[] = [];
  private ghostStarted = false;
  private isAnimating = false;
  private isDemoPlaying = false;
  private demoTimer: Phaser.Time.TimerEvent | null = null;
  private trailColorIndex = 0;

  // Swipe gesture tracking
  private pointerDownPos: { x: number; y: number } | null = null;
  private readonly SWIPE_THRESHOLD = 26;

  constructor() {
    super({ key: 'GameScene' });
  }

  public init(data: GameSceneConfig): void {
    this.config = data;
    this.gameLogic = new PuzzleGame(data.level);
    this.bgGraphics = null;
    this.staticSprites = [];
    this.crumblingSprites.clear();
    this.phaseSprites.clear();
    this.tileSprites.clear();
    this.starSprites.clear();
    this.bonusTileSprites.clear();
    this.keySprites.clear();
    this.lockSprites.clear();
    this.crateSprites.clear();
    this.holdSwitchKeys.clear();
    this.doorSprites.clear();
    this.highlightSprites = [];
    this.hintHighlight = null;
    this.hintCoord = null;
    this.playerIdleTween = null;
    this.ghostSprite = null;
    this.ghostCoord = null;
    this.ghostTimers = [];
    this.ghostStarted = false;
    this.pointerDownPos = null;
    this.isAnimating = false;
    this.isDemoPlaying = false;
    this.demoTimer = null;
  }

  public create(): void {
    if (!this.config) return;

    const { width, height } = this.scale;

    generateAllTextures(
      this,
      this.config.themeId,
      this.config.skinColor,
      !!this.config.highContrast,
      this.config.tileSkinId || 'tile-classic'
    );

    this.bgGraphics = this.add.graphics();
    this.bgGraphics.setDepth(-2);
    this.drawBackground(width, height);

    // World-themed living ambient atmosphere (respects Reduced Motion accessibility)
    if (!this.config.reducedMotion) {
      const ambientMap: Record<
        string,
        { texture: string; tint: number[]; speedX: { min: number; max: number }; speedY: { min: number; max: number }; scale: { min: number; max: number }; frequency: number }
      > = {
        'floating-sky': {
          texture: 'fx_particle',
          tint: [0xe0f2fe, 0x38bdf8, 0xffffff],
          speedX: { min: 6, max: 18 },
          speedY: { min: -12, max: -4 },
          scale: { min: 0.16, max: 0.36 },
          frequency: 360,
        },
        'candy-world': {
          texture: 'item_star',
          tint: [0xf9a8d4, 0xfef08a, 0xffffff],
          speedX: { min: -8, max: 8 },
          speedY: { min: -22, max: -10 },
          scale: { min: 0.06, max: 0.14 },
          frequency: 340,
        },
        'ocean-islands': {
          texture: 'fx_particle',
          tint: [0x99f6e4, 0x38bdf8, 0xe0f2fe],
          speedX: { min: -6, max: 6 },
          speedY: { min: -34, max: -16 },
          scale: { min: 0.14, max: 0.32 },
          frequency: 280,
        },
        'neon-space': {
          texture: 'item_star',
          tint: [0xd8b4fe, 0x38bdf8, 0xf472b6],
          speedX: { min: -10, max: 10 },
          speedY: { min: -14, max: 14 },
          scale: { min: 0.05, max: 0.13 },
          frequency: 260,
        },
        'forest-adventure': {
          texture: 'fx_particle',
          tint: [0xbef264, 0xfef08a, 0x4ade80],
          speedX: { min: -14, max: 14 },
          speedY: { min: -16, max: 8 },
          scale: { min: 0.14, max: 0.28 },
          frequency: 300,
        },
        'arctic-frost': {
          texture: 'fx_particle',
          tint: [0xffffff, 0xe0f2fe, 0xbae6fd],
          speedX: { min: -14, max: 14 },
          speedY: { min: 18, max: 42 },
          scale: { min: 0.12, max: 0.28 },
          frequency: 220,
        },
        'clockwork-forge': {
          texture: 'fx_particle',
          tint: [0xfb923c, 0xfbbf24, 0xf43f5e],
          speedX: { min: -12, max: 12 },
          speedY: { min: -44, max: -20 },
          scale: { min: 0.14, max: 0.3 },
          frequency: 220,
        },
        'crate-sanctum': {
          texture: 'fx_particle',
          tint: [0xfde047, 0x34d399, 0xa5b4fc],
          speedX: { min: -10, max: 10 },
          speedY: { min: -18, max: -6 },
          scale: { min: 0.12, max: 0.28 },
          frequency: 280,
        },
        'skyward-spire': {
          texture: 'item_star',
          tint: [0xfef08a, 0x38bdf8, 0xffffff],
          speedX: { min: 10, max: 24 },
          speedY: { min: -26, max: -12 },
          scale: { min: 0.06, max: 0.14 },
          frequency: 260,
        },
        'celestial-crown': {
          texture: 'item_star',
          tint: [0xfde047, 0xa5b4fc, 0xf9a8d4, 0xffffff],
          speedX: { min: -8, max: 8 },
          speedY: { min: -16, max: -4 },
          scale: { min: 0.06, max: 0.16 },
          frequency: 230,
        },
        'chrono-prism': {
          texture: 'fx_particle',
          tint: [0x22d3ee, 0xe879f9, 0xffffff],
          speedX: { min: -12, max: 12 },
          speedY: { min: -24, max: -8 },
          scale: { min: 0.1, max: 0.24 },
          frequency: 210,
        },
      };
      const amb = ambientMap[this.config.themeId] || ambientMap['floating-sky'];
      const particles = this.add.particles(0, 0, amb.texture, {
        x: { min: 0, max: Math.max(width, 320) },
        y: { min: 0, max: Math.max(height, 480) },
        scale: amb.scale,
        alpha: { min: 0.12, max: 0.36 },
        speedX: amb.speedX,
        speedY: amb.speedY,
        tint: amb.tint,
        lifespan: 6000,
        frequency: amb.frequency,
      });
      particles.setDepth(0);
    }

    this.recalculateLayout(width, height);

    this.buildGrid();
    this.createPlayer();
    this.createGhostSprite();
    this.updateLegalHighlights();

    // Tap + Swipe gesture input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isDemoPlaying) return;
      this.pointerDownPos = { x: pointer.x, y: pointer.y };
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDemoPlaying) return;
      if (!this.pointerDownPos) {
        this.handlePointerTap(pointer.x, pointer.y);
        return;
      }
      const dx = pointer.x - this.pointerDownPos.x;
      const dy = pointer.y - this.pointerDownPos.y;
      const dist = Math.hypot(dx, dy);
      this.pointerDownPos = null;

      if (dist >= this.SWIPE_THRESHOLD) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          this.moveByDirection(dx > 0 ? 'right' : 'left');
        } else {
          this.moveByDirection(dy > 0 ? 'down' : 'up');
        }
      } else {
        this.handlePointerTap(pointer.x, pointer.y);
      }
    });

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopDemo(false);
      this.stopGhostPlayback();
      this.scale.off('resize', this.handleResize, this);
      this.stopPlayerIdleTween();
    });

    this.config.onStateChange(this.gameLogic);
    this.config.onDeadlock?.(false);
    this.config.onDemoStateChange?.(false);
  }

  private drawBackground(width: number, height: number): void {
    if (!this.bgGraphics) return;
    const theme = THEME_PALETTES[this.config.themeId] || THEME_PALETTES['floating-sky'];
    this.bgGraphics.clear();
    this.bgGraphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor(theme.bgGradTop).color,
      Phaser.Display.Color.HexStringToColor(theme.bgGradTop).color,
      Phaser.Display.Color.HexStringToColor(theme.bgGradBottom).color,
      Phaser.Display.Color.HexStringToColor(theme.bgGradBottom).color,
      1
    );
    this.bgGraphics.fillRect(0, 0, width, height);
  }

  private recalculateLayout(width: number, height: number): void {
    const cols = this.config.level.cols;
    const rows = this.config.level.rows;

    const maxGridWidth = Math.max(160, width * 0.92);
    const maxGridHeight = Math.max(160, height * 0.78);

    this.tileSize = Math.max(28, Math.floor(Math.min(maxGridWidth / cols, maxGridHeight / rows)));
    this.offsetX = Math.floor((width - cols * this.tileSize) / 2 + this.tileSize / 2);
    this.offsetY = Math.floor((height - rows * this.tileSize) / 2 + this.tileSize / 2);

    this.baseTileScale = this.tileSize / 128;
    this.basePlayerScale = (this.tileSize * 0.85) / 96;
    this.baseStarScale = (this.tileSize * 0.56) / 64;
    this.baseHintScale = (this.tileSize * 1.14) / 128;
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    if (!this.config || !this.playerSprite) return;
    const width = gameSize.width;
    const height = gameSize.height;
    if (width <= 0 || height <= 0) return;

    this.drawBackground(width, height);
    this.recalculateLayout(width, height);

    for (const item of this.staticSprites) {
      const pos = this.gridToScreen(item.coord);
      item.sprite.setPosition(pos.x, pos.y);
      item.sprite.setScale(this.baseTileScale);
    }

    for (const [key, sprite] of this.crumblingSprites.entries()) {
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseTileScale);
    }

    for (const [key, entry] of this.phaseSprites.entries()) {
      const pos = this.gridToScreen(keyToCoord(key));
      entry.sprite.setPosition(pos.x, pos.y);
      entry.sprite.setScale(this.baseTileScale);
    }

    for (const [key, sprite] of this.tileSprites.entries()) {
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseTileScale);
    }

    for (const entry of this.doorSprites.values()) {
      const pos = this.gridToScreen(entry.coord);
      entry.sprite.setPosition(pos.x, pos.y);
      entry.sprite.setScale(this.baseTileScale);
      if (entry.timerText) {
        entry.timerText.setPosition(pos.x + this.tileSize * 0.28, pos.y - this.tileSize * 0.28);
        entry.timerText.setFontSize(Math.max(10, Math.round(this.tileSize * 0.26)));
      }
    }

    for (const [key, sprite] of this.starSprites.entries()) {
      this.tweens.killTweensOf(sprite);
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseStarScale);
      this.addStarFloatTween(sprite, pos.y);
    }

    for (const [key, sprite] of this.bonusTileSprites.entries()) {
      this.tweens.killTweensOf(sprite);
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseStarScale);
      this.addStarFloatTween(sprite, pos.y);
    }

    for (const [key, sprite] of this.keySprites.entries()) {
      this.tweens.killTweensOf(sprite);
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseStarScale * 1.1);
      this.addStarFloatTween(sprite, pos.y);
    }

    for (const [key, sprite] of this.lockSprites.entries()) {
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseTileScale);
    }

    for (const [key, sprite] of this.crateSprites.entries()) {
      this.tweens.killTweensOf(sprite);
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y - 2);
      sprite.setScale(this.baseTileScale * 0.92);
    }

    if (!this.isAnimating) {
      this.stopPlayerIdleTween();
      const pPos = this.gridToScreen(this.gameLogic.player);
      this.playerSprite.setPosition(pPos.x, pPos.y - 4);
      this.playerSprite.setScale(this.basePlayerScale);
      this.startPlayerIdleTween();
    }

    if (this.ghostSprite && this.ghostCoord) {
      this.tweens.killTweensOf(this.ghostSprite);
      const gPos = this.gridToScreen(this.ghostCoord);
      this.ghostSprite.setPosition(gPos.x, gPos.y - 6);
      this.ghostSprite.setScale(this.basePlayerScale * 0.88);
    }

    if (this.hintHighlight && this.hintCoord) {
      const hPos = this.gridToScreen(this.hintCoord);
      this.tweens.killTweensOf(this.hintHighlight);
      this.hintHighlight.setPosition(hPos.x, hPos.y);
      this.hintHighlight.setScale(this.baseHintScale);
      this.addHintPulseTween(this.hintHighlight);
    }

    this.updateLegalHighlights();
  }

  private gridToScreen(coord: Coordinate): { x: number; y: number } {
    return {
      x: this.offsetX + coord.x * this.tileSize,
      y: this.offsetY + coord.y * this.tileSize,
    };
  }

  private screenToGrid(screenX: number, screenY: number): Coordinate | null {
    const gx = Math.round((screenX - this.offsetX) / this.tileSize);
    const gy = Math.round((screenY - this.offsetY) / this.tileSize);

    if (gx >= 0 && gx < this.config.level.cols && gy >= 0 && gy < this.config.level.rows) {
      return { x: gx, y: gy };
    }
    return null;
  }

  private buildGrid(): void {
    const level = this.config.level;

    // 0. Subtle recessed void grid slots across entire playfield
    for (let y = 0; y < level.rows; y++) {
      for (let x = 0; x < level.cols; x++) {
        this.addStaticTile({ x, y }, 'tile_void', 0.5);
      }
    }

    // Start & Exit
    this.addStaticTile(level.start, 'tile_start', 1);
    this.addStaticTile(level.exit, 'tile_exit', 1);

    // Fixed islands
    const fixedKeys = new Set<string>();
    level.fixed?.forEach((c) => {
      fixedKeys.add(coordToKey(c));
      this.addStaticTile(c, 'tile_fixed', 1);
    });

    // Ice sliding platforms
    const iceKeys = new Set<string>();
    level.ice?.forEach((c) => {
      iceKeys.add(coordToKey(c));
      this.addStaticTile(c, 'tile_ice', 1);
    });

    // Rocks
    level.rocks?.forEach((c) => this.addStaticTile(c, 'tile_rock', 1));

    // Sticky honey void
    level.sticky?.forEach((c) => this.addStaticTile(c, 'tile_sticky', 1));

    // Crumbling stones
    level.crumbling?.forEach((c) => {
      const pos = this.gridToScreen(c);
      const sprite = this.add.sprite(pos.x, pos.y, 'tile_crumbling');
      sprite.setScale(this.baseTileScale);
      sprite.setDepth(1);
      this.crumblingSprites.set(coordToKey(c), sprite);
    });

    // One-way arrow pads
    level.oneWay?.forEach((ow) => this.addStaticTile(ow, `tile_oneway_${ow.direction}`, 1));

    // Springboard launch pads
    level.springs?.forEach((sp) => this.addStaticTile(sp, 'tile_spring', 1));

    // Color-coded Switches & Doors (toggle, timed, or weighted hold-switch)
    const switchKeys = new Set<string>();
    level.switches?.forEach((sw, idx) => {
      const pairIdx = idx % 2;
      const swKey = coordToKey(sw.switchPos);
      switchKeys.add(swKey);
      if (sw.holdSwitch) {
        this.holdSwitchKeys.add(swKey);
      }
      this.addStaticTile(
        sw.switchPos,
        sw.holdSwitch ? `tile_switch_hold_${pairIdx}` : `tile_switch_${pairIdx}`,
        1
      );

      const pos = this.gridToScreen(sw.doorPos);
      const isInitiallyOpen = this.gameLogic.openDoors.has(sw.id);
      const doorKey = isInitiallyOpen ? `tile_door_open_${pairIdx}` : `tile_door_closed_${pairIdx}`;
      const doorSprite = this.add.sprite(pos.x, pos.y, doorKey);
      doorSprite.setScale(this.baseTileScale);
      doorSprite.setDepth(2);

      let timerText: Phaser.GameObjects.Text | undefined;
      if (sw.timedDuration && sw.timedDuration > 0) {
        timerText = this.add
          .text(pos.x + this.tileSize * 0.28, pos.y - this.tileSize * 0.28, `${sw.timedDuration}t`, {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: `${Math.max(10, Math.round(this.tileSize * 0.26))}px`,
            fontStyle: 'bold',
            color: '#fef3c7',
            backgroundColor: '#92400e',
            padding: { x: 4, y: 2 },
          })
          .setOrigin(0.5)
          .setDepth(6);
      }

      this.doorSprites.set(sw.id, {
        coord: sw.doorPos,
        switchPos: sw.switchPos,
        pairIndex: pairIdx,
        sprite: doorSprite,
        timedDuration: sw.timedDuration,
        timerText,
      });
    });

    // Color-coded Teleporters
    level.teleporters?.forEach((tp, idx) => {
      const pairIdx = idx % 2;
      [tp.posA, tp.posB].forEach((pad) => {
        const tpSprite = this.addStaticTile(pad, `tile_teleporter_${pairIdx}`, 1);
        this.tweens.add({
          targets: tpSprite,
          angle: 360,
          duration: 12000,
          repeat: -1,
        });
      });
    });

    // Pushable Crates (also ensure solid tile visually underneath if not already rendered)
    level.crates?.forEach((crate) => {
      const key = coordToKey(crate);
      if (!fixedKeys.has(key) && !iceKeys.has(key) && !switchKeys.has(key)) {
        this.addStaticTile(crate, 'tile_fixed', 1);
      }
      this.spawnCrateSprite(crate);
    });

    // Locked Vaults
    level.locks?.forEach((lock) => {
      const key = coordToKey(lock);
      const pos = this.gridToScreen(lock);
      const tex = this.gameLogic.unlockedLocks.has(key) ? 'tile_lock_open' : 'tile_lock_closed';
      const sprite = this.add.sprite(pos.x, pos.y, tex);
      sprite.setScale(this.baseTileScale);
      sprite.setDepth(2);
      this.lockSprites.set(key, sprite);
    });

    // Bridge-Parity Phase-Shift Tiles (depth 1.5 so placed bridge tiles sit cleanly above ghost outlines)
    level.phaseTiles?.forEach((pt) => {
      const key = coordToKey(pt);
      const pos = this.gridToScreen(pt);
      const solid = this.gameLogic.isPhaseTileSolid(key);
      const tex =
        pt.polarity === 'even'
          ? solid
            ? 'tile_phase_even_on'
            : 'tile_phase_even_off'
          : solid
          ? 'tile_phase_odd_on'
          : 'tile_phase_odd_off';
      const sprite = this.add.sprite(pos.x, pos.y, tex);
      sprite.setScale(this.baseTileScale);
      sprite.setDepth(1.5);
      this.phaseSprites.set(key, { sprite, polarity: pt.polarity });
    });

    // Collectible Gems
    level.stars?.forEach((gem) => {
      this.spawnStarSprite(gem);
    });

    // Bonus Tile (+1) Pickups
    level.bonusTiles?.forEach((bonus) => {
      this.spawnBonusTileSprite(bonus);
    });

    // Collectible Golden Keys
    level.keys?.forEach((k) => {
      this.spawnKeySprite(k);
    });
  }

  private spawnCrateSprite(coord: Coordinate): void {
    const key = coordToKey(coord);
    if (this.crateSprites.has(key)) return;
    const pos = this.gridToScreen(coord);
    const tex = this.holdSwitchKeys.has(key) ? 'item_crate_lit' : 'item_crate';
    const sprite = this.add.sprite(pos.x, pos.y - 2, tex);
    sprite.setScale(this.baseTileScale * 0.92);
    sprite.setDepth(5);
    this.crateSprites.set(key, sprite);
  }

  private addStaticTile(
    coord: Coordinate,
    textureKey: string,
    depth = 1
  ): Phaser.GameObjects.Sprite {
    const pos = this.gridToScreen(coord);
    const sprite = this.add.sprite(pos.x, pos.y, textureKey);
    sprite.setScale(this.baseTileScale);
    sprite.setDepth(depth);
    this.staticSprites.push({ coord, sprite });
    return sprite;
  }

  private spawnStarSprite(star: Coordinate): void {
    const key = coordToKey(star);
    if (this.starSprites.has(key)) return;

    const pos = this.gridToScreen(star);
    const starSprite = this.add.sprite(pos.x, pos.y, 'item_gem');
    starSprite.setScale(this.baseStarScale);
    starSprite.setDepth(4);
    this.addStarFloatTween(starSprite, pos.y);
    this.starSprites.set(key, starSprite);
  }

  private spawnBonusTileSprite(coord: Coordinate): void {
    const key = coordToKey(coord);
    if (this.bonusTileSprites.has(key)) return;

    const pos = this.gridToScreen(coord);
    const sprite = this.add.sprite(pos.x, pos.y, 'item_bonus_tile');
    sprite.setScale(this.baseStarScale);
    sprite.setDepth(4);
    this.addStarFloatTween(sprite, pos.y);
    this.bonusTileSprites.set(key, sprite);
  }

  private spawnKeySprite(coord: Coordinate): void {
    const key = coordToKey(coord);
    if (this.keySprites.has(key)) return;

    const pos = this.gridToScreen(coord);
    const sprite = this.add.sprite(pos.x, pos.y, 'item_key');
    sprite.setScale(this.baseStarScale * 1.1);
    sprite.setDepth(4);
    this.addStarFloatTween(sprite, pos.y);
    this.keySprites.set(key, sprite);
  }

  private addStarFloatTween(sprite: Phaser.GameObjects.Sprite, baseY: number): void {
    this.tweens.add({
      targets: sprite,
      y: baseY - 6,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createPlayer(): void {
    const pos = this.gridToScreen(this.gameLogic.player);
    this.playerSprite = this.add.sprite(pos.x, pos.y - 4, 'char_mascot');
    this.playerSprite.setScale(this.basePlayerScale);
    this.playerSprite.setDepth(10);
    this.startPlayerIdleTween();
  }

  private updatePlayerMood(): void {
    if (!this.playerSprite) return;
    if (this.gameLogic.status === 'won') {
      this.playerSprite.setTexture('char_mascot_win');
    } else if (this.gameLogic.inventory === 0 && !this.gameLogic.isSolidGround(coordToKey(this.gameLogic.player))) {
      this.playerSprite.setTexture('char_mascot_worried');
    } else {
      this.playerSprite.setTexture('char_mascot');
    }
  }

  private startPlayerIdleTween(): void {
    this.stopPlayerIdleTween();
    if (!this.playerSprite) return;

    const pos = this.gridToScreen(this.gameLogic.player);
    this.playerSprite.setPosition(pos.x, pos.y - 4);
    if (this.config.reducedMotion) return;
    this.playerIdleTween = this.tweens.add({
      targets: this.playerSprite,
      y: pos.y - 8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopPlayerIdleTween(): void {
    if (this.playerIdleTween) {
      this.playerIdleTween.stop();
      this.playerIdleTween = null;
    }
  }

  private spawnBurst(x: number, y: number, tint: number, count = 10): void {
    if (this.config.reducedMotion) return;
    const emitter = this.add.particles(x, y, 'fx_particle', {
      speed: { min: 40, max: 130 },
      scale: { start: 0.45, end: 0 },
      alpha: { start: 0.95, end: 0 },
      lifespan: 360,
      tint,
      emitting: false,
    });
    emitter.setDepth(14);
    emitter.explode(count);
    this.time.delayedCall(450, () => emitter.destroy());
  }

  private drawSwitchBeam(from: Coordinate, to: Coordinate, color: number): void {
    const p1 = this.gridToScreen(from);
    const p2 = this.gridToScreen(to);
    const gfx = this.add.graphics();
    gfx.setDepth(12);
    gfx.lineStyle(4, color, 0.9);
    gfx.lineBetween(p1.x, p1.y, p2.x, p2.y);

    this.tweens.add({
      targets: gfx,
      alpha: 0,
      duration: 380,
      onComplete: () => gfx.destroy(),
    });
  }

  private updateLegalHighlights(): void {
    this.highlightSprites.forEach((s) => s.destroy());
    this.highlightSprites = [];

    if (this.gameLogic.status === 'won' || this.isAnimating || this.isDemoPlaying) return;

    const legalMoves = this.gameLogic.getLegalMoves();
    legalMoves.forEach((coord) => {
      const pos = this.gridToScreen(coord);
      const hl = this.add.sprite(pos.x, pos.y, 'highlight_valid');
      hl.setScale(this.baseTileScale);
      hl.setAlpha(0.7);
      hl.setDepth(3);

      if (!this.config.reducedMotion) {
        this.tweens.add({
          targets: hl,
          alpha: 0.22,
          duration: 800,
          yoyo: true,
          repeat: -1,
        });
      }

      this.highlightSprites.push(hl);
    });
  }

  public moveByDirection(dir: Direction): void {
    if (this.isAnimating || this.isDemoPlaying || this.gameLogic.status === 'won') return;
    const delta =
      dir === 'up'
        ? { x: 0, y: -1 }
        : dir === 'down'
        ? { x: 0, y: 1 }
        : dir === 'left'
        ? { x: -1, y: 0 }
        : { x: 1, y: 0 };

    const target: Coordinate = {
      x: this.gameLogic.player.x + delta.x,
      y: this.gameLogic.player.y + delta.y,
    };
    this.attemptMove(target);
  }

  private handlePointerTap(screenX: number, screenY: number): void {
    if (this.isAnimating || this.isDemoPlaying || this.gameLogic.status === 'won') return;
    const targetCoord = this.screenToGrid(screenX, screenY);
    if (!targetCoord) return;
    this.attemptMove(targetCoord);
  }

  private attemptMove(targetCoord: Coordinate): void {
    const check = this.gameLogic.canMoveTo(targetCoord);
    if (!check.allowed) {
      sound.playError();
      sound.triggerHaptic('warning');
      this.config.onError(check.reason || 'Invalid move');
      if (!this.config.reducedMotion) {
        this.cameras.main.shake(90, 0.003);
      }

      const restX = this.gridToScreen(this.gameLogic.player).x;
      this.tweens.killTweensOf(this.playerSprite);
      this.playerIdleTween = null;
      this.playerSprite.x = restX;
      this.tweens.add({
        targets: this.playerSprite,
        x: restX + 4,
        duration: 45,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.playerSprite.x = restX;
          this.startPlayerIdleTween();
        },
      });
      return;
    }

    this.executeMoveAnimation(targetCoord);
  }

  private spawnTrailPuff(x: number, y: number): void {
    const colors = TRAIL_TINTS[this.config.trailId || 'trail-none'];
    if (!colors || colors.length === 0) return;
    const tint = colors[this.trailColorIndex % colors.length];
    this.trailColorIndex++;
    this.spawnBurst(x, y + 6, tint, 5);
  }

  private executeMoveAnimation(target: Coordinate): void {
    this.isAnimating = true;
    this.clearHint();
    this.stopPlayerIdleTween();
    this.tweens.killTweensOf(this.playerSprite);

    this.highlightSprites.forEach((s) => s.destroy());
    this.highlightSprites = [];

    const startScreen = { x: this.playerSprite.x, y: this.playerSprite.y };
    this.spawnTrailPuff(startScreen.x, startScreen.y);

    if (!this.isDemoPlaying && !this.ghostStarted) {
      this.startGhostPlayback();
    }

    const res = this.gameLogic.move(target);

    sound.playTap();
    sound.triggerHaptic('light');

    // 0. Animate pushed crate gliding to its new solid-ground destination
    if (res.pushedCrate) {
      sound.playPushCrate();
      sound.triggerHaptic('medium');
      const fromKey = coordToKey(res.pushedCrate.from);
      const toKey = coordToKey(res.pushedCrate.to);
      const crateSprite = this.crateSprites.get(fromKey);
      if (crateSprite) {
        this.crateSprites.delete(fromKey);
        this.crateSprites.set(toKey, crateSprite);
        this.tweens.killTweensOf(crateSprite);
        const destPos = this.gridToScreen(res.pushedCrate.to);
        const isLit = this.holdSwitchKeys.has(toKey);
        this.tweens.add({
          targets: crateSprite,
          x: destPos.x,
          y: destPos.y - 2,
          duration: 155,
          ease: 'Quad.easeOut',
          onComplete: () => {
            crateSprite.setTexture(isLit ? 'item_crate_lit' : 'item_crate');
            this.spawnBurst(destPos.x, destPos.y, isLit ? 0x34d399 : 0xfbbf24, isLit ? 12 : 6);
          },
        });
      }
    }

    // 1. Bridge tile drop + dust burst
    if (res.placedTile) {
      sound.playPlaceTile();
      this.config.onTilePlaced?.();
      const pos = this.gridToScreen(res.placedTile);
      const tileSprite = this.add.sprite(pos.x, pos.y - 14, 'tile_bridge');
      tileSprite.setScale(this.baseTileScale * 0.72);
      tileSprite.setDepth(2);

      this.tweens.add({
        targets: tileSprite,
        y: pos.y,
        scaleX: this.baseTileScale,
        scaleY: this.baseTileScale,
        duration: 170,
        ease: 'Back.easeOut',
      });

      this.spawnBurst(pos.x, pos.y, 0x38bdf8, 7);
      this.tileSprites.set(coordToKey(res.placedTile), tileSprite);
    }

    // 2. Player arc jump to initial target
    const targetPos = this.gridToScreen(target);
    const midX = (this.playerSprite.x + targetPos.x) / 2;
    const peakY = Math.min(this.playerSprite.y, targetPos.y) - 22;

    const afterSlideOrLanding = () => {
      this.animateCollectedStars();
      this.animateCollectedBonusTiles();
      this.animateCollectedKeys();

      if (res.lockOpened) {
        sound.playUnlockVault();
        sound.triggerHaptic('success');
        const lockPos = this.gridToScreen(res.lockOpened);
        this.spawnBurst(lockPos.x, lockPos.y, 0xfde047, 16);
      }
      this.syncLocksVisuals();

      if (res.doorToggled) {
        sound.playSwitch();
        const doorEntry = this.doorSprites.get(res.doorToggled.id);
        if (doorEntry) {
          const beamColor = doorEntry.pairIndex === 0 ? 0x38bdf8 : 0xf59e0b;
          if (res.doorToggled.open) {
            this.drawSwitchBeam(doorEntry.switchPos, doorEntry.coord, beamColor);
          }
          const doorPos = this.gridToScreen(doorEntry.coord);
          this.spawnBurst(doorPos.x, doorPos.y, beamColor, 10);
        }
      }
      this.syncDoorsVisuals();

      if (res.teleportedTo) {
        sound.playTeleport();
        sound.triggerHaptic('medium');
        const fromCoord =
          res.slidePath && res.slidePath.length > 0
            ? res.slidePath[res.slidePath.length - 1]
            : res.springPath && res.springPath.length > 0
            ? res.springPath[res.springPath.length - 1]
            : target;
        const fromPos = this.gridToScreen(fromCoord);
        const warpPos = this.gridToScreen(res.teleportedTo);
        this.spawnBurst(fromPos.x, fromPos.y, 0xc084fc, 12);

        this.tweens.add({
          targets: this.playerSprite,
          scaleX: this.basePlayerScale * 0.1,
          scaleY: this.basePlayerScale * 0.1,
          alpha: 0,
          duration: 135,
          onComplete: () => {
            this.playerSprite.setPosition(warpPos.x, warpPos.y - 4);
            this.spawnBurst(warpPos.x, warpPos.y, 0x38bdf8, 12);
            this.tweens.add({
              targets: this.playerSprite,
              scaleX: this.basePlayerScale,
              scaleY: this.basePlayerScale,
              alpha: 1,
              duration: 175,
              ease: 'Back.easeOut',
              onComplete: () => {
                this.finishMoveStep(res);
              },
            });
          },
        });
      } else {
        this.finishMoveStep(res);
      }
    };

    const runSlideOrFinish = () => {
      // Smooth ice glide chain if Puff stepped/landed onto ice
      if (res.slidePath && res.slidePath.length > 0) {
        const glideTweens: Phaser.Types.Tweens.TweenBuilderConfig[] = res.slidePath.map(
          (stepCoord, i) => {
            const pos = this.gridToScreen(stepCoord);
            return {
              targets: this.playerSprite,
              x: pos.x,
              y: pos.y - 4,
              duration: 85,
              ease: 'Linear',
              onStart: () => {
                this.spawnBurst(this.playerSprite.x, this.playerSprite.y + 8, 0xbae6fd, 4);
              },
              onComplete:
                i === res.slidePath!.length - 1 ? () => afterSlideOrLanding() : undefined,
            };
          }
        );
        this.tweens.chain({ tweens: glideTweens });
      } else {
        afterSlideOrLanding();
      }
    };

    this.tweens.chain({
      tweens: [
        {
          targets: this.playerSprite,
          x: midX,
          y: peakY,
          scaleY: this.basePlayerScale * 1.15,
          scaleX: this.basePlayerScale * 0.9,
          duration: 100,
          ease: 'Quad.easeOut',
        },
        {
          targets: this.playerSprite,
          x: targetPos.x,
          y: targetPos.y - 4,
          scaleY: this.basePlayerScale * 0.82,
          scaleX: this.basePlayerScale * 1.18,
          duration: 100,
          ease: 'Quad.easeIn',
          onComplete: () => {
            sound.playStep();
            this.tweens.add({
              targets: this.playerSprite,
              scaleY: this.basePlayerScale,
              scaleX: this.basePlayerScale,
              duration: 105,
              ease: 'Back.easeOut',
            });

            this.handleTileDeparture(res);

            // High parabolic Springboard vault chain if Puff stepped onto a spring pad
            if (res.springPath && res.springPath.length > 0) {
              const springTweens: Phaser.Types.Tweens.TweenBuilderConfig[] = [];
              let prevPt = targetPos;
              res.springPath.forEach((landCoord, i) => {
                const landPos = this.gridToScreen(landCoord);
                const arcMidX = (prevPt.x + landPos.x) / 2;
                const arcPeakY = Math.min(prevPt.y, landPos.y) - 46;
                const launchFrom = prevPt;
                springTweens.push(
                  {
                    targets: this.playerSprite,
                    x: arcMidX,
                    y: arcPeakY,
                    scaleX: this.basePlayerScale * 1.25,
                    scaleY: this.basePlayerScale * 1.25,
                    duration: 135,
                    ease: 'Quad.easeOut',
                    onStart: () => {
                      sound.playSpring();
                      sound.triggerHaptic('medium');
                      this.spawnBurst(launchFrom.x, launchFrom.y, 0xfbbf24, 10);
                    },
                  },
                  {
                    targets: this.playerSprite,
                    x: landPos.x,
                    y: landPos.y - 4,
                    scaleX: this.basePlayerScale * 1.12,
                    scaleY: this.basePlayerScale * 0.86,
                    duration: 135,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                      sound.playStep();
                      this.spawnBurst(landPos.x, landPos.y, 0x2dd4bf, 8);
                      this.playerSprite.setScale(this.basePlayerScale);
                      if (i === res.springPath!.length - 1) {
                        runSlideOrFinish();
                      }
                    },
                  }
                );
                prevPt = landPos;
              });
              this.tweens.chain({ tweens: springTweens });
            } else {
              runSlideOrFinish();
            }
          },
        },
      ],
    });
  }

  private animateCollectedStars(): void {
    let collectedAny = false;
    for (const [starKey, starSprite] of Array.from(this.starSprites.entries())) {
      if (this.gameLogic.collectedStars.has(starKey)) {
        collectedAny = true;
        this.starSprites.delete(starKey);
        this.tweens.killTweensOf(starSprite);
        this.spawnBurst(starSprite.x, starSprite.y, 0x38bdf8, 12);
        this.tweens.add({
          targets: starSprite,
          y: starSprite.y - 36,
          alpha: 0,
          scaleX: this.baseStarScale * 1.5,
          scaleY: this.baseStarScale * 1.5,
          duration: 300,
          onComplete: () => starSprite.destroy(),
        });
      }
    }
    if (collectedAny) {
      sound.playStar();
      sound.triggerHaptic('medium');
    }
  }

  private animateCollectedBonusTiles(): void {
    let collectedAny = false;
    for (const [bonusKey, sprite] of Array.from(this.bonusTileSprites.entries())) {
      if (this.gameLogic.collectedBonusTiles.has(bonusKey)) {
        collectedAny = true;
        this.bonusTileSprites.delete(bonusKey);
        this.tweens.killTweensOf(sprite);
        this.spawnBurst(sprite.x, sprite.y, 0xfef08a, 14);
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 38,
          alpha: 0,
          scaleX: this.baseStarScale * 1.6,
          scaleY: this.baseStarScale * 1.6,
          duration: 320,
          onComplete: () => sprite.destroy(),
        });
      }
    }
    if (collectedAny) {
      sound.playStar();
      sound.triggerHaptic('success');
      this.config.onError('Bonus tile collected! Your tile capacity grew by +1!');
    }
  }

  private animateCollectedKeys(): void {
    let collectedAny = false;
    for (const [keyCoord, sprite] of Array.from(this.keySprites.entries())) {
      if (this.gameLogic.collectedKeys.has(keyCoord)) {
        collectedAny = true;
        this.keySprites.delete(keyCoord);
        this.tweens.killTweensOf(sprite);
        this.spawnBurst(sprite.x, sprite.y, 0xfde047, 14);
        this.tweens.add({
          targets: sprite,
          y: sprite.y - 36,
          alpha: 0,
          scaleX: this.baseStarScale * 1.6,
          scaleY: this.baseStarScale * 1.6,
          duration: 300,
          onComplete: () => sprite.destroy(),
        });
      }
    }
    if (collectedAny) {
      sound.playKeyPickup();
      sound.triggerHaptic('success');
    }
  }

  private finishMoveStep(res: MoveResult): void {
    this.syncPhaseVisuals(Boolean(res.phaseShifted));
    this.updatePlayerMood();

    if (this.gameLogic.status === 'won') {
      this.stopGhostPlayback();
      this.config.onDeadlock?.(false);
      this.handleVictory();
      return;
    }

    this.isAnimating = false;
    this.startPlayerIdleTween();
    this.updateLegalHighlights();
    this.config.onStateChange(this.gameLogic);

    if (areCoordsEqual(this.gameLogic.player, this.config.level.exit) && res.message) {
      this.config.onError(res.message.replace(/stars/gi, 'gems'));
    }

    const noMoves = this.gameLogic.getLegalMoves().length === 0;
    const deadlocked = noMoves || !solveFromState(this.gameLogic, 30, 5000).solvable;
    this.config.onDeadlock?.(deadlocked);
    if (deadlocked) {
      sound.playError();
      this.config.onError("You're stuck! No winning path left — tap Undo or Restart.");
    }
  }

  private handleTileDeparture(res: MoveResult): void {
    if (res.trappedTile) {
      sound.playSticky();
      const key = coordToKey(res.trappedTile);
      const pos = this.gridToScreen(res.trappedTile);
      this.spawnBurst(pos.x, pos.y, 0xc084fc, 10);
      const sprite = this.tileSprites.get(key);
      if (sprite) {
        sprite.setTint(0xc084fc);
      }
    }

    if (res.crumbledTile) {
      sound.playCrumble();
      if (!this.config.reducedMotion) {
        this.cameras.main.shake(110, 0.004);
      }
      const key = coordToKey(res.crumbledTile);
      const pos = this.gridToScreen(res.crumbledTile);
      this.spawnBurst(pos.x, pos.y, 0x94a3b8, 12);

      const bridgeSprite = this.tileSprites.get(key);
      if (bridgeSprite) {
        this.tweens.add({
          targets: bridgeSprite,
          y: bridgeSprite.y + 20,
          alpha: 0,
          duration: 240,
          onComplete: () => bridgeSprite.destroy(),
        });
        this.tileSprites.delete(key);
      }

      const crumbleSprite = this.crumblingSprites.get(key);
      if (crumbleSprite && crumbleSprite.visible) {
        this.tweens.killTweensOf(crumbleSprite);
        this.tweens.add({
          targets: crumbleSprite,
          y: crumbleSprite.y + 18,
          alpha: 0,
          duration: 240,
          onComplete: () => {
            crumbleSprite.setVisible(false);
          },
        });
      }
    }

    const recoveredList = res.recoveredTiles || (res.recoveredTile ? [res.recoveredTile] : []);
    if (recoveredList.length > 0) {
      sound.playRecoverTile();
      const playerPos = this.gridToScreen(this.gameLogic.player);
      this.spawnBurst(playerPos.x, playerPos.y, 0x67e8f9, 8);

      recoveredList.forEach((coord, idx) => {
        const key = coordToKey(coord);
        const sprite = this.tileSprites.get(key);
        if (sprite) {
          this.tileSprites.delete(key);
          this.tweens.killTweensOf(sprite);
          this.tweens.add({
            targets: sprite,
            x: playerPos.x,
            y: playerPos.y,
            scaleX: this.baseTileScale * 0.2,
            scaleY: this.baseTileScale * 0.2,
            alpha: 0,
            delay: idx * 35,
            duration: 210,
            ease: 'Quad.easeIn',
            onComplete: () => sprite.destroy(),
          });
        }
      });
    }
  }

  private handleVictory(): void {
    sound.playWin();
    sound.triggerHaptic('success');
    this.stopPlayerIdleTween();
    this.updatePlayerMood();

    const pPos = this.gridToScreen(this.gameLogic.player);
    this.spawnBurst(pPos.x, pPos.y, 0xfbbf24, 18);

    // If Solution Theater demo reached the exit, reset cleanly after a brief beat without awarding stars/coins
    if (this.isDemoPlaying) {
      this.isAnimating = false;
      this.config.onStateChange(this.gameLogic);
      this.demoTimer = this.time.delayedCall(900, () => {
        this.stopDemo(true);
        this.config.onError('Optimal Par replay finished — now try it yourself!');
      });
      return;
    }

    const completeWin = () => {
      this.playerSprite.setAngle(0);
      this.isAnimating = false;
      let stars = 1;
      if (this.gameLogic.moves <= this.config.level.parMoves) {
        stars = 3;
      } else if (
        this.gameLogic.moves <= (this.config.level.star2Moves || this.config.level.parMoves + 2)
      ) {
        stars = 2;
      }

      this.config.onWin(this.gameLogic.moves, stars, this.config.level.parMoves);
    };

    if (this.config.reducedMotion) {
      this.time.delayedCall(180, completeWin);
      return;
    }

    const baseY = this.playerSprite.y;
    this.tweens.add({
      targets: this.playerSprite,
      y: baseY - 26,
      angle: 360,
      duration: 420,
      yoyo: true,
      repeat: 1,
      onComplete: completeWin,
    });
  }

  public playOptimalDemo(): boolean {
    if (!this.config) return false;
    this.stopDemo(false);

    const solution = solveLevel(this.config.level, 45);
    if (!solution.solvable || solution.solutionPath.length < 2) {
      return false;
    }

    this.isAnimating = false;
    this.stopGhostPlayback();
    if (this.ghostSprite) this.ghostSprite.setVisible(false);
    this.gameLogic.restart();
    this.isDemoPlaying = true;
    this.config.onDemoStateChange?.(true);
    this.syncVisualsWithState();
    this.config.onError(`Watching Optimal Par (${solution.minMoves} moves)…`);

    const steps = solution.solutionPath.slice(1);
    let idx = 0;

    const runNextStep = () => {
      if (!this.isDemoPlaying) return;
      if (idx >= steps.length) {
        this.stopDemo(true);
        return;
      }
      if (this.isAnimating) {
        this.demoTimer = this.time.delayedCall(120, runNextStep);
        return;
      }
      const nextCoord = steps[idx++];
      this.executeMoveAnimation(nextCoord);
      if (idx < steps.length) {
        this.demoTimer = this.time.delayedCall(420, runNextStep);
      }
    };

    this.demoTimer = this.time.delayedCall(320, runNextStep);
    return true;
  }

  public stopDemo(resetBoard = true): void {
    if (this.demoTimer) {
      this.demoTimer.remove(false);
      this.demoTimer = null;
    }
    const wasPlaying = this.isDemoPlaying;
    this.isDemoPlaying = false;
    if (wasPlaying) {
      this.config?.onDemoStateChange?.(false);
      if (resetBoard && this.gameLogic) {
        this.isAnimating = false;
        this.gameLogic.restart();
        this.resetGhost();
        this.syncVisualsWithState();
      }
    }
  }

  public undo(): void {
    if (this.isAnimating || this.isDemoPlaying) return;
    const ok = this.gameLogic.undo();
    if (ok) {
      sound.playRecoverTile();
      sound.triggerHaptic('light');
      this.config.onUndoUsed?.();
      this.syncVisualsWithState();
    }
  }

  public restart(): void {
    if (this.isDemoPlaying) {
      this.stopDemo(true);
      sound.playTap();
      return;
    }
    if (this.isAnimating) return;
    this.gameLogic.restart();
    this.resetGhost();
    sound.playTap();
    this.syncVisualsWithState();
  }

  public showHint(): void {
    if (this.isAnimating || this.isDemoPlaying || this.gameLogic.status === 'won') return;

    const solution = solveFromState(this.gameLogic, 40, 25000);
    if (!solution.solvable || solution.solutionPath.length < 2) {
      sound.playError();
      this.config.onError('No winning path from here — try Undo or Restart!');
      return;
    }

    const nextTarget = solution.solutionPath[1];
    if (!nextTarget) return;

    this.clearHint();
    this.hintCoord = { ...nextTarget };
    const pos = this.gridToScreen(nextTarget);

    this.hintHighlight = this.add.sprite(pos.x, pos.y, 'highlight_valid');
    this.hintHighlight.setScale(this.baseHintScale);
    this.hintHighlight.setTint(0xfacc15);
    this.hintHighlight.setDepth(15);
    this.addHintPulseTween(this.hintHighlight);

    sound.playTap();
  }

  private addHintPulseTween(sprite: Phaser.GameObjects.Sprite): void {
    this.tweens.add({
      targets: sprite,
      scaleX: this.baseHintScale * 1.12,
      scaleY: this.baseHintScale * 1.12,
      alpha: 0.35,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  private clearHint(): void {
    if (this.hintHighlight) {
      this.tweens.killTweensOf(this.hintHighlight);
      this.hintHighlight.destroy();
      this.hintHighlight = null;
    }
    this.hintCoord = null;
  }

  private syncVisualsWithState(): void {
    this.clearHint();
    this.stopPlayerIdleTween();
    this.tweens.killTweensOf(this.playerSprite);

    const pPos = this.gridToScreen(this.gameLogic.player);
    this.playerSprite.setPosition(pPos.x, pPos.y - 4);
    this.playerSprite.setAlpha(1);
    this.playerSprite.setAngle(0);
    this.playerSprite.setScale(this.basePlayerScale);
    this.updatePlayerMood();
    this.startPlayerIdleTween();

    for (const [key, sprite] of Array.from(this.tileSprites.entries())) {
      if (!this.gameLogic.tiles.has(key) && !this.gameLogic.trapped.has(key)) {
        this.tweens.killTweensOf(sprite);
        sprite.destroy();
        this.tileSprites.delete(key);
      }
    }

    this.gameLogic.tiles.forEach((key) => {
      const existing = this.tileSprites.get(key);
      if (existing) {
        existing.clearTint();
        existing.setAlpha(1);
        existing.setScale(this.baseTileScale);
      } else {
        const pos = this.gridToScreen(keyToCoord(key));
        const sprite = this.add.sprite(pos.x, pos.y, 'tile_bridge');
        sprite.setScale(this.baseTileScale);
        sprite.setDepth(2);
        this.tileSprites.set(key, sprite);
      }
    });

    this.gameLogic.trapped.forEach((key) => {
      const existing = this.tileSprites.get(key);
      if (existing) {
        existing.setTint(0xc084fc);
        existing.setAlpha(1);
        existing.setScale(this.baseTileScale);
      } else {
        const pos = this.gridToScreen(keyToCoord(key));
        const sprite = this.add.sprite(pos.x, pos.y, 'tile_bridge');
        sprite.setScale(this.baseTileScale);
        sprite.setTint(0xc084fc);
        sprite.setDepth(2);
        this.tileSprites.set(key, sprite);
      }
    });

    for (const [key, sprite] of this.crumblingSprites.entries()) {
      this.tweens.killTweensOf(sprite);
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseTileScale);
      if (this.gameLogic.crumbled.has(key)) {
        sprite.setVisible(false);
        sprite.setAlpha(0);
      } else {
        sprite.setVisible(true);
        sprite.setAlpha(1);
      }
    }

    for (const [key, sprite] of Array.from(this.starSprites.entries())) {
      if (this.gameLogic.collectedStars.has(key)) {
        this.tweens.killTweensOf(sprite);
        sprite.destroy();
        this.starSprites.delete(key);
      }
    }
    this.config.level.stars?.forEach((gem) => {
      const key = coordToKey(gem);
      if (!this.gameLogic.collectedStars.has(key) && !this.starSprites.has(key)) {
        this.spawnStarSprite(gem);
      }
    });

    for (const [key, sprite] of Array.from(this.bonusTileSprites.entries())) {
      if (this.gameLogic.collectedBonusTiles.has(key)) {
        this.tweens.killTweensOf(sprite);
        sprite.destroy();
        this.bonusTileSprites.delete(key);
      }
    }
    this.config.level.bonusTiles?.forEach((bonus) => {
      const key = coordToKey(bonus);
      if (!this.gameLogic.collectedBonusTiles.has(key) && !this.bonusTileSprites.has(key)) {
        this.spawnBonusTileSprite(bonus);
      }
    });

    for (const [key, sprite] of Array.from(this.keySprites.entries())) {
      if (this.gameLogic.collectedKeys.has(key)) {
        this.tweens.killTweensOf(sprite);
        sprite.destroy();
        this.keySprites.delete(key);
      }
    }
    this.config.level.keys?.forEach((k) => {
      const key = coordToKey(k);
      if (!this.gameLogic.collectedKeys.has(key) && !this.keySprites.has(key)) {
        this.spawnKeySprite(k);
      }
    });

    // Rebuild crate sprite map cleanly to match current engine crate coordinates
    for (const sprite of this.crateSprites.values()) {
      this.tweens.killTweensOf(sprite);
      sprite.destroy();
    }
    this.crateSprites.clear();
    this.gameLogic.crates.forEach((key) => {
      this.spawnCrateSprite(keyToCoord(key));
    });

    this.syncDoorsVisuals();
    this.syncLocksVisuals();
    this.syncPhaseVisuals(false);

    this.updateLegalHighlights();
    this.config.onStateChange(this.gameLogic);
    const deadlocked =
      this.gameLogic.status !== 'won' &&
      (this.gameLogic.getLegalMoves().length === 0 ||
        !solveFromState(this.gameLogic, 30, 5000).solvable);
    this.config.onDeadlock?.(deadlocked);
  }

  private syncPhaseVisuals(animate: boolean): void {
    if (this.phaseSprites.size === 0) return;
    if (animate) {
      sound.playPhaseShift();
    }
    for (const [key, entry] of this.phaseSprites.entries()) {
      const solid = this.gameLogic.isPhaseTileSolid(key);
      const tex =
        entry.polarity === 'even'
          ? solid
            ? 'tile_phase_even_on'
            : 'tile_phase_even_off'
          : solid
          ? 'tile_phase_odd_on'
          : 'tile_phase_odd_off';
      entry.sprite.setTexture(tex);
      if (animate && !this.config.reducedMotion) {
        this.tweens.killTweensOf(entry.sprite);
        entry.sprite.setScale(this.baseTileScale * (solid ? 0.84 : 1.06));
        this.tweens.add({
          targets: entry.sprite,
          scaleX: this.baseTileScale,
          scaleY: this.baseTileScale,
          duration: 160,
          ease: 'Back.easeOut',
        });
      } else {
        entry.sprite.setScale(this.baseTileScale);
      }
    }
  }

  private createGhostSprite(): void {
    if (!this.config.showGhost || !this.config.ghostRun || this.config.ghostRun.length === 0) {
      return;
    }
    const startCoord = { ...this.config.level.start };
    this.ghostCoord = startCoord;
    const pos = this.gridToScreen(startCoord);
    this.ghostSprite = this.add.sprite(pos.x, pos.y - 6, 'char_ghost');
    this.ghostSprite.setScale(this.basePlayerScale * 0.88);
    this.ghostSprite.setAlpha(0.52);
    this.ghostSprite.setDepth(8);
  }

  private startGhostPlayback(): void {
    const frames = this.config.ghostRun;
    if (!this.config.showGhost || !this.ghostSprite || !frames || frames.length === 0) return;
    this.stopGhostPlayback();
    this.ghostStarted = true;
    this.ghostSprite.setVisible(true);
    this.ghostSprite.setAlpha(0.62);

    frames.forEach(([gx, gy, tMs], idx) => {
      const delay = Math.max(0, tMs);
      const timer = this.time.delayedCall(delay, () => {
        if (!this.ghostSprite) return;
        this.ghostCoord = { x: gx, y: gy };
        const dest = this.gridToScreen(this.ghostCoord);
        this.tweens.killTweensOf(this.ghostSprite);
        if (this.config.reducedMotion) {
          this.ghostSprite.setPosition(dest.x, dest.y - 6);
        } else {
          this.tweens.add({
            targets: this.ghostSprite,
            x: dest.x,
            y: dest.y - 6,
            duration: 140,
            ease: 'Quad.easeOut',
          });
        }
        if (idx === frames.length - 1) {
          this.ghostSprite.setAlpha(0.85);
        }
      });
      this.ghostTimers.push(timer);
    });
  }

  private stopGhostPlayback(): void {
    for (const timer of this.ghostTimers) {
      timer.remove(false);
    }
    this.ghostTimers = [];
  }

  private resetGhost(): void {
    this.stopGhostPlayback();
    this.ghostStarted = false;
    if (!this.ghostSprite) return;
    const startCoord = { ...this.config.level.start };
    this.ghostCoord = startCoord;
    const pos = this.gridToScreen(startCoord);
    this.tweens.killTweensOf(this.ghostSprite);
    this.ghostSprite.setPosition(pos.x, pos.y - 6);
    this.ghostSprite.setScale(this.basePlayerScale * 0.88);
    this.ghostSprite.setAlpha(0.52);
    this.ghostSprite.setVisible(Boolean(this.config.showGhost && this.config.ghostRun?.length));
  }

  private syncLocksVisuals(): void {
    for (const [key, sprite] of this.lockSprites.entries()) {
      const isOpen = this.gameLogic.unlockedLocks.has(key);
      sprite.setTexture(isOpen ? 'tile_lock_open' : 'tile_lock_closed');
    }
  }

  private syncDoorsVisuals(): void {
    this.config.level.switches?.forEach((sw) => {
      const doorEntry = this.doorSprites.get(sw.id);
      if (!doorEntry) return;
      const isOpen = this.gameLogic.openDoors.has(sw.id);
      doorEntry.sprite.setTexture(
        isOpen
          ? `tile_door_open_${doorEntry.pairIndex}`
          : `tile_door_closed_${doorEntry.pairIndex}`
      );
      if (doorEntry.timerText && doorEntry.timedDuration) {
        const remaining = this.gameLogic.doorTimers.get(sw.id);
        if (isOpen && remaining !== undefined) {
          doorEntry.timerText.setText(`${remaining}`);
          doorEntry.timerText.setStyle({
            color: remaining <= 2 ? '#fef2f2' : '#ecfdf5',
            backgroundColor: remaining <= 2 ? '#dc2626' : '#059669',
          });
        } else {
          doorEntry.timerText.setText(`${doorEntry.timedDuration}t`);
          doorEntry.timerText.setStyle({
            color: '#fef3c7',
            backgroundColor: '#92400e',
          });
        }
      }
    });
  }
}
