import Phaser from 'phaser';
import { Coordinate, Direction, LevelDefinition, MoveResult } from './types';
import { PuzzleGame, coordToKey, keyToCoord, areCoordsEqual } from './logic';
import { generateAllTextures, THEME_PALETTES } from './textureGenerator';
import { sound } from '../audio/soundManager';
import { solveFromState } from './solver';

export interface GameSceneConfig {
  level: LevelDefinition;
  themeId: string;
  skinColor: string;
  onStateChange: (game: PuzzleGame) => void;
  onWin: (moves: number, starsEarned: number, parMoves: number) => void;
  onError: (message: string) => void;
  onDeadlock?: (isDeadlocked: boolean) => void;
  onTilePlaced?: () => void;
  onUndoUsed?: () => void;
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
}

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
  private tileSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private starSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private doorSprites: Map<string, DoorEntry> = new Map();
  private highlightSprites: Phaser.GameObjects.Sprite[] = [];
  private hintHighlight: Phaser.GameObjects.Sprite | null = null;
  private hintCoord: Coordinate | null = null;

  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerIdleTween: Phaser.Tweens.Tween | null = null;
  private isAnimating = false;

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
    this.tileSprites.clear();
    this.starSprites.clear();
    this.doorSprites.clear();
    this.highlightSprites = [];
    this.hintHighlight = null;
    this.hintCoord = null;
    this.playerIdleTween = null;
    this.pointerDownPos = null;
    this.isAnimating = false;
  }

  public create(): void {
    if (!this.config) return;

    const { width, height } = this.scale;

    generateAllTextures(this, this.config.themeId, this.config.skinColor);

    this.bgGraphics = this.add.graphics();
    this.bgGraphics.setDepth(-2);
    this.drawBackground(width, height);

    // Floating ambient background particles
    const particles = this.add.particles(0, 0, 'item_star', {
      x: { min: 0, max: Math.max(width, 320) },
      y: { min: 0, max: Math.max(height, 480) },
      scale: { min: 0.05, max: 0.14 },
      alpha: { min: 0.08, max: 0.28 },
      speedY: { min: -10, max: -26 },
      lifespan: 6500,
      frequency: 420,
    });
    particles.setDepth(0);

    this.recalculateLayout(width, height);

    this.buildGrid();
    this.createPlayer();
    this.updateLegalHighlights();

    // Tap + Swipe gesture input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerDownPos = { x: pointer.x, y: pointer.y };
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
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
      this.scale.off('resize', this.handleResize, this);
      this.stopPlayerIdleTween();
    });

    this.config.onStateChange(this.gameLogic);
    this.config.onDeadlock?.(false);
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

    for (const [key, sprite] of this.tileSprites.entries()) {
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseTileScale);
    }

    for (const entry of this.doorSprites.values()) {
      const pos = this.gridToScreen(entry.coord);
      entry.sprite.setPosition(pos.x, pos.y);
      entry.sprite.setScale(this.baseTileScale);
    }

    for (const [key, sprite] of this.starSprites.entries()) {
      this.tweens.killTweensOf(sprite);
      const pos = this.gridToScreen(keyToCoord(key));
      sprite.setPosition(pos.x, pos.y);
      sprite.setScale(this.baseStarScale);
      this.addStarFloatTween(sprite, pos.y);
    }

    if (!this.isAnimating) {
      this.stopPlayerIdleTween();
      const pPos = this.gridToScreen(this.gameLogic.player);
      this.playerSprite.setPosition(pPos.x, pPos.y - 4);
      this.playerSprite.setScale(this.basePlayerScale);
      this.startPlayerIdleTween();
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
    level.fixed?.forEach((c) => this.addStaticTile(c, 'tile_fixed', 1));

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

    // Color-coded Switches & Doors
    level.switches?.forEach((sw, idx) => {
      const pairIdx = idx % 2;
      this.addStaticTile(sw.switchPos, `tile_switch_${pairIdx}`, 1);

      const pos = this.gridToScreen(sw.doorPos);
      const isInitiallyOpen = !!sw.doorInitiallyOpen;
      const doorKey = isInitiallyOpen ? `tile_door_open_${pairIdx}` : `tile_door_closed_${pairIdx}`;
      const doorSprite = this.add.sprite(pos.x, pos.y, doorKey);
      doorSprite.setScale(this.baseTileScale);
      doorSprite.setDepth(2);
      this.doorSprites.set(sw.id, {
        coord: sw.doorPos,
        switchPos: sw.switchPos,
        pairIndex: pairIdx,
        sprite: doorSprite,
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

    // Collectible Gems
    level.stars?.forEach((gem) => {
      this.spawnStarSprite(gem);
    });
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

    if (this.gameLogic.status === 'won' || this.isAnimating) return;

    const legalMoves = this.gameLogic.getLegalMoves();
    legalMoves.forEach((coord) => {
      const pos = this.gridToScreen(coord);
      const hl = this.add.sprite(pos.x, pos.y, 'highlight_valid');
      hl.setScale(this.baseTileScale);
      hl.setAlpha(0.7);
      hl.setDepth(3);

      this.tweens.add({
        targets: hl,
        alpha: 0.22,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      this.highlightSprites.push(hl);
    });
  }

  public moveByDirection(dir: Direction): void {
    if (this.isAnimating || this.gameLogic.status === 'won') return;
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
    if (this.isAnimating || this.gameLogic.status === 'won') return;
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
      this.cameras.main.shake(90, 0.003);

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

  private executeMoveAnimation(target: Coordinate): void {
    this.isAnimating = true;
    this.clearHint();
    this.stopPlayerIdleTween();
    this.tweens.killTweensOf(this.playerSprite);

    this.highlightSprites.forEach((s) => s.destroy());
    this.highlightSprites = [];

    const res = this.gameLogic.move(target);

    sound.playTap();
    sound.triggerHaptic('light');

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

    // 2. Player arc jump
    const targetPos = this.gridToScreen(target);
    const midX = (this.playerSprite.x + targetPos.x) / 2;
    const peakY = Math.min(this.playerSprite.y, targetPos.y) - 22;

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
            this.animateCollectedStars();

            if (res.doorToggled) {
              sound.playSwitch();
              const doorEntry = this.doorSprites.get(res.doorToggled.id);
              if (doorEntry) {
                const tex = res.doorToggled.open
                  ? `tile_door_open_${doorEntry.pairIndex}`
                  : `tile_door_closed_${doorEntry.pairIndex}`;
                doorEntry.sprite.setTexture(tex);
                const beamColor = doorEntry.pairIndex === 0 ? 0x38bdf8 : 0xf59e0b;
                this.drawSwitchBeam(doorEntry.switchPos, doorEntry.coord, beamColor);
                const doorPos = this.gridToScreen(doorEntry.coord);
                this.spawnBurst(doorPos.x, doorPos.y, beamColor, 10);
              }
            }

            if (res.teleportedTo) {
              sound.playTeleport();
              sound.triggerHaptic('medium');
              const fromPos = this.gridToScreen(target);
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

  private finishMoveStep(res: MoveResult): void {
    this.updatePlayerMood();

    if (this.gameLogic.status === 'won') {
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
      this.cameras.main.shake(110, 0.004);
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

    const baseY = this.playerSprite.y;
    this.tweens.add({
      targets: this.playerSprite,
      y: baseY - 26,
      angle: 360,
      duration: 420,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
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
      },
    });
  }

  public undo(): void {
    if (this.isAnimating) return;
    const ok = this.gameLogic.undo();
    if (ok) {
      sound.playRecoverTile();
      sound.triggerHaptic('light');
      this.config.onUndoUsed?.();
      this.syncVisualsWithState();
    }
  }

  public restart(): void {
    if (this.isAnimating) return;
    this.gameLogic.restart();
    sound.playTap();
    this.syncVisualsWithState();
  }

  public showHint(): void {
    if (this.isAnimating || this.gameLogic.status === 'won') return;

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

    this.config.level.switches?.forEach((sw) => {
      const doorEntry = this.doorSprites.get(sw.id);
      if (doorEntry) {
        const isOpen = this.gameLogic.openDoors.has(sw.id);
        doorEntry.sprite.setTexture(
          isOpen
            ? `tile_door_open_${doorEntry.pairIndex}`
            : `tile_door_closed_${doorEntry.pairIndex}`
        );
      }
    });

    this.updateLegalHighlights();
    this.config.onStateChange(this.gameLogic);
    const deadlocked =
      this.gameLogic.status !== 'won' &&
      (this.gameLogic.getLegalMoves().length === 0 ||
        !solveFromState(this.gameLogic, 30, 5000).solvable);
    this.config.onDeadlock?.(deadlocked);
  }
}
