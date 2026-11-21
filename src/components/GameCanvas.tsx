import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import { GameScene, GameSceneConfig } from '../engine/GameScene';
import { Direction, LevelDefinition } from '../engine/types';
import { PuzzleGame } from '../engine/logic';

export interface GameCanvasHandle {
  undo: () => void;
  restart: () => void;
  hint: () => void;
  move: (dir: Direction) => void;
  watchSolution: () => boolean;
  stopDemo: (resetBoard?: boolean) => void;
}

interface GameCanvasProps {
  level: LevelDefinition;
  themeId: string;
  skinColor: string;
  trailId?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
  onStateChange: (game: PuzzleGame) => void;
  onWin: (moves: number, stars: number, par: number) => void;
  onError: (message: string) => void;
  onDeadlock?: (isDeadlocked: boolean) => void;
  onTilePlaced?: () => void;
  onUndoUsed?: () => void;
  onDemoStateChange?: (isDemoPlaying: boolean) => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  (
    {
      level,
      themeId,
      skinColor,
      trailId = 'trail-none',
      reducedMotion = false,
      highContrast = false,
      onStateChange,
      onWin,
      onError,
      onDeadlock,
      onTilePlaced,
      onUndoUsed,
      onDemoStateChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<GameScene | null>(null);
    const isBootedRef = useRef(false);

    // Keep latest React callbacks in a ref so Phaser never invokes stale closures
    const callbacksRef = useRef({
      onStateChange,
      onWin,
      onError,
      onDeadlock,
      onTilePlaced,
      onUndoUsed,
      onDemoStateChange,
    });
    callbacksRef.current = {
      onStateChange,
      onWin,
      onError,
      onDeadlock,
      onTilePlaced,
      onUndoUsed,
      onDemoStateChange,
    };

    const buildSceneData = (
      lvl: LevelDefinition,
      theme: string,
      skin: string,
      trail: string,
      rm: boolean,
      hc: boolean
    ): GameSceneConfig => ({
      level: lvl,
      themeId: theme,
      skinColor: skin,
      trailId: trail,
      reducedMotion: rm,
      highContrast: hc,
      onStateChange: (game) => callbacksRef.current.onStateChange(game),
      onWin: (moves, stars, par) => callbacksRef.current.onWin(moves, stars, par),
      onError: (message) => callbacksRef.current.onError(message),
      onDeadlock: (deadlocked) => callbacksRef.current.onDeadlock?.(deadlocked),
      onTilePlaced: () => callbacksRef.current.onTilePlaced?.(),
      onUndoUsed: () => callbacksRef.current.onUndoUsed?.(),
      onDemoStateChange: (playing) => callbacksRef.current.onDemoStateChange?.(playing),
    });

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
      move: (dir: Direction) => {
        sceneRef.current?.moveByDirection(dir);
      },
      watchSolution: () => {
        return sceneRef.current?.playOptimalDemo() ?? false;
      },
      stopDemo: (resetBoard?: boolean) => {
        sceneRef.current?.stopDemo(resetBoard);
      },
    }));

    // Mount Phaser.Game once while GameCanvas is active
    useEffect(() => {
      if (!containerRef.current) return;

      const scene = new GameScene();
      sceneRef.current = scene;
      isBootedRef.current = false;

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
      };

      const game = new Phaser.Game(config);
      gameInstanceRef.current = game;

      game.scene.start(
        'GameScene',
        buildSceneData(level, themeId, skinColor, trailId, reducedMotion, highContrast)
      );
      isBootedRef.current = true;

      return () => {
        isBootedRef.current = false;
        game.destroy(true);
        gameInstanceRef.current = null;
        sceneRef.current = null;
      };
      // Intentionally mount Phaser once; config changes restart the scene below.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Restart GameScene cleanly when level, theme, skin, trail, or accessibility flags change
    useEffect(() => {
      if (!isBootedRef.current || !sceneRef.current) return;
      sceneRef.current.scene.restart(
        buildSceneData(level, themeId, skinColor, trailId, reducedMotion, highContrast)
      );
    }, [level, themeId, skinColor, trailId, reducedMotion, highContrast]);

    return (
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-hidden relative touch-none select-none"
      />
    );
  }
);

GameCanvas.displayName = 'GameCanvas';
