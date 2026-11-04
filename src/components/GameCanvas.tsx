import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../engine/GameScene';
import { LevelDefinition } from '../engine/types';
import { PuzzleGame } from '../engine/logic';

export interface GameCanvasHandle {
  undo: () => void;
  restart: () => void;
  hint: () => void;
}

interface GameCanvasProps {
  level: LevelDefinition;
  themeId: string;
  skinColor: string;
  onStateChange: (game: PuzzleGame) => void;
  onWin: (moves: number, stars: number, par: number) => void;
  onError: (message: string) => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  ({ level, themeId, skinColor, onStateChange, onWin, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<GameScene | null>(null);

    useImperativeHandle(ref, () => ({
      undo: () => {
        sceneRef.current?.undo();
      },
      restart: () => {
        sceneRef.current?.restart();
      },
      hint: () => {
        sceneRef.current?.showHint();
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const scene = new GameScene();
      sceneRef.current = scene;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: '100%',
        height: '100%',
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        transparent: true,
        backgroundColor: '#00000000',
        scene: [scene],
        physics: {
          default: 'arcade',
        },
      };

      const game = new Phaser.Game(config);
      gameInstanceRef.current = game;

      game.scene.start('GameScene', {
        level,
        themeId,
        skinColor,
        onStateChange,
        onWin,
        onError,
      });

      return () => {
        game.destroy(true);
        gameInstanceRef.current = null;
        sceneRef.current = null;
      };
    }, [level.id, themeId, skinColor]);

    return (
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-hidden relative touch-none select-none"
      />
    );
  }
);

GameCanvas.displayName = 'GameCanvas';
