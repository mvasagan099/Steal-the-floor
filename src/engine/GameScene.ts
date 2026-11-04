import Phaser from 'phaser';
import { Coordinate, LevelDefinition, MoveResult } from './types';
import { PuzzleGame, coordToKey, areCoordsEqual } from './logic';
import { generateAllTextures, THEME_PALETTES } from './textureGenerator';
import { sound } from '../audio/soundManager';
import { solveLevel } from './solver';

export interface GameSceneConfig {
  level: LevelDefinition;
  themeId: string;
  skinColor: string;
  onStateChange: (game: PuzzleGame) => void;
  onWin: (moves: number, starsEarned: number, parMoves: number) => void;
  onError: (message: string) => void;
}

export class GameScene extends Phaser.Scene {
  private config!: GameSceneConfig;
  public gameLogic!: PuzzleGame;

  private tileSize = 56;
  private offsetX = 0;
  private offsetY = 0;

  private tileSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private starSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private doorSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private highlightSprites: Phaser.GameObjects.Sprite[] = [];
  private hintHighlight: Phaser.GameObjects.Sprite | null = null;

  private playerSprite!: Phaser.GameObjects.Sprite;
  private isAnimating = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  public init(data: GameSceneConfig): void {
    this.config = data;
    this.gameLogic = new PuzzleGame(data.level);
    this.tileSprites.clear();
    this.starSprites.clear();
    this.doorSprites.clear();
    this.highlightSprites = [];
    this.hintHighlight = null;
    this.isAnimating = false;
  }

  public create(): void {
    const { width, height } = this.scale;
    const theme = THEME_PALETTES[this.config.themeId] || THEME_PALETTES['floating-sky'];

    // Generate crisp textures
    generateAllTextures(this, this.config.themeId, this.config.skinColor);

    // Dynamic background gradient
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor(theme.bgGradTop).color,
      Phaser.Display.Color.HexStringToColor(theme.bgGradTop).color,
      Phaser.Display.Color.HexStringToColor(theme.bgGradBottom).color,
      Phaser.Display.Color.HexStringToColor(theme.bgGradBottom).color,
      1
    );
    bgGraphics.fillRect(0, 0, width, height);

    // Floating background particles
    const particles = this.add.particles(0, 0, 'item_star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      scale: { min: 0.05, max: 0.15 },
      alpha: { min: 0.1, max: 0.35 },
      speedY: { min: -10, max: -30 },
      lifespan: 6000,
      frequency: 400,
    });
    particles.setDepth(0);

    // Calculate grid layout
    const cols = this.config.level.cols;
    const rows = this.config.level.rows;

    const maxGridWidth = width * 0.92;
    const maxGridHeight = height * 0.72;

    this.tileSize = Math.floor(Math.min(maxGridWidth / cols, maxGridHeight / rows));
    this.offsetX = Math.floor((width - cols * this.tileSize) / 2 + this.tileSize / 2);
    this.offsetY = Math.floor((height - rows * this.tileSize) / 2 + this.tileSize / 2 + 10);

    this.buildGrid();
    this.createPlayer();
    this.updateLegalHighlights();

    // Tap input handler
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerTap(pointer.x, pointer.y);
    });

    // Notify initial state
    this.config.onStateChange(this.gameLogic);
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

    // 1. Static base tiles
    // Start tile
    this.addStaticTile(level.start, 'tile_fixed');

    // Exit tile
    const exitPos = this.gridToScreen(level.exit);
    const exitSprite = this.add.sprite(exitPos.x, exitPos.y, 'tile_exit');
    exitSprite.setDisplaySize(this.tileSize, this.tileSize);
    exitSprite.setDepth(1);

    // Fixed islands
    level.fixed?.forEach((c) => this.addStaticTile(c, 'tile_fixed'));

    // Rocks
    level.rocks?.forEach((c) => this.addStaticTile(c, 'tile_rock'));

    // Sticky tiles
    level.sticky?.forEach((c) => this.addStaticTile(c, 'tile_sticky'));

    // Crumbling tiles
    level.crumbling?.forEach((c) => this.addStaticTile(c, 'tile_crumbling'));

    // One-way tiles
    level.oneWay?.forEach((ow) => this.addStaticTile(ow, `tile_oneway_${ow.direction}`));

    // Switches
    level.switches?.forEach((sw) => this.addStaticTile(sw.switchPos, 'tile_switch'));

    // Doors
    level.switches?.forEach((sw) => {
      const pos = this.gridToScreen(sw.doorPos);
      const isInitiallyOpen = !!sw.doorInitiallyOpen;
      const doorKey = isInitiallyOpen ? 'tile_door_open' : 'tile_door_closed';
      const doorSprite = this.add.sprite(pos.x, pos.y, doorKey);
      doorSprite.setDisplaySize(this.tileSize, this.tileSize);
      doorSprite.setDepth(2);
      this.doorSprites.set(sw.id, doorSprite);
    });

    // Teleporters
    level.teleporters?.forEach((tp) => {
      [tp.posA, tp.posB].forEach((pad) => {
        const pos = this.gridToScreen(pad);
        const tpSprite = this.add.sprite(pos.x, pos.y, 'tile_teleporter');
        tpSprite.setDisplaySize(this.tileSize, this.tileSize);
        tpSprite.setDepth(1);

        // Gentle ambient rotation
        this.tweens.add({
          targets: tpSprite,
          angle: 360,
          duration: 12000,
          repeat: -1,
        });
      });
    });

    // Stars
    level.stars?.forEach((star) => {
      const pos = this.gridToScreen(star);
      const starSprite = this.add.sprite(pos.x, pos.y, 'item_star');
      starSprite.setDisplaySize(this.tileSize * 0.55, this.tileSize * 0.55);
      starSprite.setDepth(4);

      // Gentle floating animation
      this.tweens.add({
        targets: starSprite,
        y: pos.y - 6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.starSprites.set(coordToKey(star), starSprite);
    });
  }

  private addStaticTile(coord: Coordinate, textureKey: string): Phaser.GameObjects.Sprite {
    const pos = this.gridToScreen(coord);
    const sprite = this.add.sprite(pos.x, pos.y, textureKey);
    sprite.setDisplaySize(this.tileSize, this.tileSize);
    sprite.setDepth(1);
    return sprite;
  }

  private createPlayer(): void {
    const pos = this.gridToScreen(this.gameLogic.player);
    this.playerSprite = this.add.sprite(pos.x, pos.y - 4, 'char_mascot');
    this.playerSprite.setDisplaySize(this.tileSize * 0.85, this.tileSize * 0.85);
    this.playerSprite.setDepth(10);

    // Cute idle breathing bob
    this.tweens.add({
      targets: this.playerSprite,
      y: pos.y - 8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private updateLegalHighlights(): void {
    // Clear previous
    this.highlightSprites.forEach((s) => s.destroy());
    this.highlightSprites = [];

    if (this.gameLogic.status === 'won' || this.isAnimating) return;

    const legalMoves = this.gameLogic.getLegalMoves();
    legalMoves.forEach((coord) => {
      const pos = this.gridToScreen(coord);
      const hl = this.add.sprite(pos.x, pos.y, 'highlight_valid');
      hl.setDisplaySize(this.tileSize, this.tileSize);
      hl.setAlpha(0.7);
      hl.setDepth(3);

      // Pulse
      this.tweens.add({
        targets: hl,
        alpha: 0.25,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      this.highlightSprites.push(hl);
    });
  }

  private handlePointerTap(screenX: number, screenY: number): void {
    if (this.isAnimating || this.gameLogic.status === 'won') return;

    const targetCoord = this.screenToGrid(screenX, screenY);
    if (!targetCoord) return;

    // Check legality
    const check = this.gameLogic.canMoveTo(targetCoord);
    if (!check.allowed) {
      sound.playError();
      sound.triggerHaptic('warning');
      this.config.onError(check.reason || 'Invalid move');

      // Wiggle player in confusion
      this.tweens.add({
        targets: this.playerSprite,
        x: this.playerSprite.x + 4,
        duration: 50,
        yoyo: true,
        repeat: 3,
      });
      return;
    }

    // Execute move
    this.executeMoveAnimation(targetCoord);
  }

  private executeMoveAnimation(target: Coordinate): void {
    this.isAnimating = true;
    this.clearHint();

    const fromCoord = { ...this.gameLogic.player };
    const res = this.gameLogic.move(target);

    // Audio & Haptics
    sound.playTap();
    sound.triggerHaptic('light');

    // 1. If bridge tile placed at target: create sprite with drop bounce
    if (res.placedTile) {
      sound.playPlaceTile();
      const pos = this.gridToScreen(res.placedTile);
      const tileSprite = this.add.sprite(pos.x, pos.y - 15, 'tile_bridge');
      tileSprite.setDisplaySize(this.tileSize, this.tileSize);
      tileSprite.setScale(0.7);
      tileSprite.setDepth(2);

      this.tweens.add({
        targets: tileSprite,
        y: pos.y,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: 'Back.easeOut',
      });

      this.tileSprites.set(coordToKey(res.placedTile), tileSprite);
    }

    // 2. Animate player jumping to target
    const targetPos = this.gridToScreen(target);
    const midX = (this.playerSprite.x + targetPos.x) / 2;
    const peakY = Math.min(this.playerSprite.y, targetPos.y) - 22;

    this.tweens.chain({
      tweens: [
        {
          targets: this.playerSprite,
          x: midX,
          y: peakY,
          scaleY: 1.15,
          scaleX: 0.9,
          duration: 110,
          ease: 'Quad.easeOut',
        },
        {
          targets: this.playerSprite,
          x: targetPos.x,
          y: targetPos.y - 4,
          scaleY: 0.8,
          scaleX: 1.2,
          duration: 110,
          ease: 'Quad.easeIn',
          onComplete: () => {
            sound.playStep();

            // Squash & stretch rebound
            this.tweens.add({
              targets: this.playerSprite,
              scaleY: 1,
              scaleX: 1,
              duration: 120,
              ease: 'Back.easeOut',
            });

            // 3. Handle tile departure from previous cell
            this.handleTileDeparture(res);

            // 4. Handle star collection
            if (res.starCollected) {
              sound.playStar();
              sound.triggerHaptic('medium');
              const starKey = coordToKey(res.starCollected);
              const starSprite = this.starSprites.get(starKey);
              if (starSprite) {
                this.tweens.add({
                  targets: starSprite,
                  y: starSprite.y - 40,
                  alpha: 0,
                  scale: 1.5,
                  duration: 350,
                  onComplete: () => starSprite.destroy(),
                });
                this.starSprites.delete(starKey);
              }
            }

            // 5. Handle door toggle
            if (res.doorToggled) {
              sound.playSwitch();
              const doorSprite = this.doorSprites.get(res.doorToggled.id);
              if (doorSprite) {
                doorSprite.setTexture(res.doorToggled.open ? 'tile_door_open' : 'tile_door_closed');
              }
            }

            // 6. Handle teleporter warp
            if (res.teleportedTo) {
              sound.playTeleport();
              sound.triggerHaptic('medium');
              const warpPos = this.gridToScreen(res.teleportedTo);

              // Disappear into vortex
              this.tweens.add({
                targets: this.playerSprite,
                scale: 0.1,
                alpha: 0,
                duration: 140,
                onComplete: () => {
                  this.playerSprite.setPosition(warpPos.x, warpPos.y - 4);
                  this.tweens.add({
                    targets: this.playerSprite,
                    scale: 1,
                    alpha: 1,
                    duration: 180,
                    ease: 'Back.easeOut',
                  });
                },
              });
            }

            // 7. Check win condition
            if (this.gameLogic.status === 'won') {
              this.handleVictory();
            } else {
              this.isAnimating = false;
              this.updateLegalHighlights();
              this.config.onStateChange(this.gameLogic);
            }
          },
        },
      ],
    });
  }

  private handleTileDeparture(res: MoveResult): void {
    if (res.recoveredTile) {
      sound.playRecoverTile();
      const key = coordToKey(res.recoveredTile);
      const sprite = this.tileSprites.get(key);
      if (sprite) {
        this.tweens.add({
          targets: sprite,
          scale: 0.2,
          alpha: 0,
          duration: 200,
          onComplete: () => sprite.destroy(),
        });
        this.tileSprites.delete(key);
      }
    } else if (res.trappedTile) {
      sound.playSticky();
      const key = coordToKey(res.trappedTile);
      const sprite = this.tileSprites.get(key);
      if (sprite) {
        // Tint to sticky purple
        sprite.setTint(0xc084fc);
      }
    } else if (res.crumbledTile) {
      sound.playCrumble();
      const key = coordToKey(res.crumbledTile);
      const sprite = this.tileSprites.get(key);
      if (sprite) {
        this.tweens.add({
          targets: sprite,
          y: sprite.y + 20,
          alpha: 0,
          duration: 250,
          onComplete: () => sprite.destroy(),
        });
        this.tileSprites.delete(key);
      }
    }
  }

  private handleVictory(): void {
    sound.playWin();
    sound.triggerHaptic('success');

    // Victory celebration jump
    this.tweens.add({
      targets: this.playerSprite,
      y: this.playerSprite.y - 30,
      angle: 360,
      duration: 500,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.isAnimating = false;
        // Calculate stars: 3 stars if moves <= par, 2 stars if <= star2Moves, else 1 star
        let stars = 1;
        if (this.gameLogic.moves <= this.config.level.parMoves) {
          stars = 3;
        } else if (this.gameLogic.moves <= (this.config.level.star2Moves || this.config.level.parMoves + 2)) {
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

    // Use solver from current snapshot to find next optimal step
    const solution = solveLevel(this.config.level, 35);
    if (!solution.solvable || solution.solutionPath.length < 2) {
      this.config.onError('No path found from here. Try Undo or Restart!');
      return;
    }

    // Find the next step from current player location
    const nextTarget = solution.solutionPath[1];
    if (!nextTarget) return;

    this.clearHint();
    const pos = this.gridToScreen(nextTarget);

    this.hintHighlight = this.add.sprite(pos.x, pos.y, 'highlight_valid');
    this.hintHighlight.setDisplaySize(this.tileSize * 1.15, this.tileSize * 1.15);
    this.hintHighlight.setTint(0xfacc15);
    this.hintHighlight.setDepth(15);

    this.tweens.add({
      targets: this.hintHighlight,
      scale: 1.25,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    sound.playTap();
  }

  private clearHint(): void {
    if (this.hintHighlight) {
      this.hintHighlight.destroy();
      this.hintHighlight = null;
    }
  }

  private syncVisualsWithState(): void {
    this.clearHint();

    // 1. Update player position
    const pPos = this.gridToScreen(this.gameLogic.player);
    this.playerSprite.setPosition(pPos.x, pPos.y - 4);
    this.playerSprite.setAlpha(1);
    this.playerSprite.setScale(1);

    // 2. Remove any placed tiles not in game.tiles or game.trapped
    for (const [key, sprite] of this.tileSprites.entries()) {
      if (!this.gameLogic.tiles.has(key) && !this.gameLogic.trapped.has(key)) {
        sprite.destroy();
        this.tileSprites.delete(key);
      }
    }

    // 3. Add any missing placed tiles
    this.gameLogic.tiles.forEach((key) => {
      if (!this.tileSprites.has(key)) {
        const coord = { x: Number(key.split(',')[0]), y: Number(key.split(',')[1]) };
        const pos = this.gridToScreen(coord);
        const sprite = this.add.sprite(pos.x, pos.y, 'tile_bridge');
        sprite.setDisplaySize(this.tileSize, this.tileSize);
        sprite.setDepth(2);
        this.tileSprites.set(key, sprite);
      }
    });

    // 4. Update doors
    this.config.level.switches?.forEach((sw) => {
      const doorSprite = this.doorSprites.get(sw.id);
      if (doorSprite) {
        const isOpen = this.gameLogic.openDoors.has(sw.id);
        doorSprite.setTexture(isOpen ? 'tile_door_open' : 'tile_door_closed');
      }
    });

    this.updateLegalHighlights();
    this.config.onStateChange(this.gameLogic);
  }
}
