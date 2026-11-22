import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { ALL_LEVELS, WORLDS } from './levels/levelsData';
import { getDailyChallenge, formatDailyShareText } from './levels/dailyChallenge';
import { generateEndlessStage } from './levels/endlessMode';
import {
  getGauntletById,
  getGauntletStages,
  getGauntletParTotals,
  evaluateGauntletMedal,
} from './levels/gauntlets';
import {
  storage,
  SKINS,
  Achievement,
  GhostFrame,
  getLocalDateString,
  ACHIEVEMENT_REWARD_COINS,
  TOTAL_CAMPAIGN_LEVELS,
} from './storage/gameStorage';
import { sound } from './audio/soundManager';
import { LevelDefinition } from './engine/types';
import { PuzzleGame } from './engine/logic';

import { HomeScreen } from './components/HomeScreen';
import { GameCanvas, GameCanvasHandle } from './components/GameCanvas';
import { HeaderBar } from './components/HeaderBar';
import { InventoryBar } from './components/InventoryBar';
import { PauseModal } from './components/PauseModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ThemesModal } from './components/ThemesModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelEditorModal } from './components/LevelEditorModal';
import { CodexModal } from './components/CodexModal';
import { GauntletsModal } from './components/GauntletsModal';

type AppScreen = 'splash' | 'home' | 'game';
type PlayMode = 'campaign' | 'daily' | 'endless' | 'gauntlet' | 'custom';

const MECHANIC_INTROS: Record<number, { icon: string; title: string; tip: string }> = {
  1: {
    icon: '🧱',
    title: 'Bridge & Reclaim',
    tip: 'Tap or swipe into the void to drop bridge tiles. Reach any solid island to pull all your tiles back!',
  },
  4: {
    icon: '💎',
    title: 'Collectible Gems',
    tip: 'Grab every glowing gem on the board before stepping onto the exit flag!',
  },
  21: {
    icon: '🪨',
    title: 'Granite Rocks',
    tip: 'Rocks block your path completely—chart an island route around them.',
  },
  41: {
    icon: '🍯',
    title: 'Sticky Honey',
    tip: 'Leaving a bridge tile on sticky honey traps it forever, shrinking your tile reach by 1!',
  },
  43: {
    icon: '🧱',
    title: 'Crumbling Stone',
    tip: 'Crumbling islands recharge your tiles once, then shatter into void behind you!',
  },
  44: {
    icon: '⬆️',
    title: 'One-Way Arrows',
    tip: 'You can only exit an arrow pad in the direction it points.',
  },
  61: {
    icon: '🔘',
    title: 'Switches & Laser Gates',
    tip: 'Step on a colored pressure plate (A/B) to toggle its matching laser gate open or closed.',
  },
  62: {
    icon: '🌀',
    title: 'Warp Portals',
    tip: 'Step onto a swirling rune portal (I/II) to warp instantly to its matching twin pad!',
  },
  101: {
    icon: '❄️',
    title: 'Frozen Ice Rinks',
    tip: 'Stepping onto glistening ice slides Puff continuously across connected walkable tiles in one move!',
  },
  102: {
    icon: '➕',
    title: '+1 Bonus Tiles',
    tip: 'Pick up glowing +1 Spark tiles to permanently expand your tile inventory for the level!',
  },
  121: {
    icon: '⏱️',
    title: 'Clockwork Timed Gates',
    tip: 'Timed switches hold their gate open for a limited number of moves—watch the countdown badge and sprint through!',
  },
  141: {
    icon: '📦',
    title: 'Pushable Crates & Weighted Plates',
    tip: 'Shove heavy crates across solid ground (or ice!) onto weighted pressure plates to hold sanctum gates open while you pass!',
  },
  161: {
    icon: '🦘',
    title: 'Golden Springboards',
    tip: 'Step onto a Springboard to vault 2 tiles forward—leaping cleanly over rocks, walls, honey, or open void!',
  },
  181: {
    icon: '🔑',
    title: 'Golden Keys & Vault Locks',
    tip: 'Collect floating Golden Keys, then step onto a Locked Vault to unlock it permanently into solid ground!',
  },
  201: {
    icon: '⏳',
    title: 'Bridge-Parity Phase Tiles',
    tip: 'Cyan (0·2) islands are solid when 0 or 2 bridge tiles are out; Magenta (1·3) islands materialize when 1 or 3 bridge tiles are placed!',
  },
  221: {
    icon: '🌊',
    title: 'Aether Conveyor Belts',
    tip: 'Conveyor Belts are solid ground that automatically carry Puff—and pushed Crates—along their glowing chevrons, even bridging onto void!',
  },
};

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [playMode, setPlayMode] = useState<PlayMode>('campaign');
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition>(ALL_LEVELS[0]);
  const [dailyDateStr, setDailyDateStr] = useState<string>(() => getLocalDateString());

  // Endless Void Rush state
  const [endlessStage, setEndlessStage] = useState(1);
  const [endlessSeed, setEndlessSeed] = useState(() => Date.now() % 100000);

  // Master Trials (Gauntlets) state
  const [activeGauntletId, setActiveGauntletId] = useState<string | null>(null);
  const [gauntletStageIdx, setGauntletStageIdx] = useState(0);
  const [gauntletMovesAcc, setGauntletMovesAcc] = useState(0);
  const [gauntletTimeAcc, setGauntletTimeAcc] = useState(0);

  // Modals
  const [showPause, setShowPause] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [showGauntlets, setShowGauntlets] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Contextual onboarding banner & achievement unlock toast
  const [introDismissedFor, setIntroDismissedFor] = useState<number | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  // Victory details
  const [winMoves, setWinMoves] = useState(0);
  const [winStars, setWinStars] = useState(0);
  const [winCoins, setWinCoins] = useState(0);
  const [winElapsedMs, setWinElapsedMs] = useState(0);
  const [winIsNewBestTime, setWinIsNewBestTime] = useState(false);
  const [winParOverride, setWinParOverride] = useState<number | null>(null);
  const [winGauntletTitle, setWinGauntletTitle] = useState<string | null>(null);
  const [dailyShareText, setDailyShareText] = useState<string | undefined>(undefined);

  // Live game logic state
  const [moves, setMoves] = useState(0);
  const [availableTiles, setAvailableTiles] = useState(2);
  const [currentMaxTiles, setCurrentMaxTiles] = useState(2);
  const [trappedTiles, setTrappedTiles] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [keysHeld, setKeysHeld] = useState(0);
  const [isDeadlocked, setIsDeadlocked] = useState(false);
  const [notice, setNotice] = useState('Tap or swipe to place a floor and walk.');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [activeGhostRun, setActiveGhostRun] = useState<GhostFrame[] | undefined>(undefined);

  // Customization, persisted audio & accessibility
  const [themeId, setThemeId] = useState(() => storage.getData().selectedTheme);
  const [skinColor, setSkinColor] = useState(() => {
    const s = SKINS.find((sk) => sk.id === storage.getData().selectedSkin);
    return s ? s.color : '#f59e0b';
  });
  const [trailId, setTrailId] = useState(() => storage.getData().selectedTrail);
  const [tileSkinId, setTileSkinId] = useState(
    () => storage.getData().selectedTileSkin || 'tile-classic'
  );
  const [musicEnabled, setMusicEnabled] = useState(() => storage.getData().settings.musicEnabled);
  const [sfxEnabled, setSfxEnabled] = useState(() => storage.getData().settings.sfxEnabled);
  const [speedrunTimer, setSpeedrunTimer] = useState(
    () => storage.getData().settings.speedrunTimer
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => storage.getData().settings.reducedMotion
  );
  const [highContrast, setHighContrast] = useState(() => storage.getData().settings.highContrast);

  const canvasRef = useRef<GameCanvasHandle>(null);
  const prevTrappedRef = useRef(0);
  const usedUndoThisRunRef = useRef(false);
  const gemsCollectedRef = useRef(0);
  const elapsedMsRef = useRef(0);
  const runFramesRef = useRef<GhostFrame[]>([]);
  const lastGauntletStageMovesRef = useRef(0);
  const lastGauntletStageTimeRef = useRef(0);

  const syncAccessibilitySettings = () => {
    const settings = storage.getData().settings;
    setSpeedrunTimer(settings.speedrunTimer);
    setReducedMotion(settings.reducedMotion);
    setHighContrast(settings.highContrast);
  };

  // Init audio and persisted settings
  useEffect(() => {
    const data = storage.getData();
    sound.setTheme(data.selectedTheme);
    sound.setMusicVolume(data.settings.musicVolume);
    sound.setSfxVolume(data.settings.sfxVolume);
    sound.musicEnabled = data.settings.musicEnabled;
    sound.sfxEnabled = data.settings.sfxEnabled;
    sound.hapticsEnabled = data.settings.hapticsEnabled;
    if (data.settings.musicEnabled) {
      sound.startMusic();
    }

    const timer = setTimeout(() => {
      setScreen('home');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    sound.setTheme(themeId);
  }, [themeId]);

  // Speedrun elapsed clock (runs smoothly after first move, pauses cleanly during modals/demos)
  const isTimerRunning =
    screen === 'game' && moves > 0 && !showPause && !showWin && !isDemoPlaying;

  useEffect(() => {
    if (!isTimerRunning) return;
    let lastTick = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;
      elapsedMsRef.current += delta;
      setElapsedMs(elapsedMsRef.current);
    }, 100);
    return () => window.clearInterval(id);
  }, [isTimerRunning]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        if (isDemoPlaying) {
          canvasRef.current?.stopDemo();
        } else if (showCodex) setShowCodex(false);
        else if (showPause) setShowPause(false);
        else if (showLevels) setShowLevels(false);
        else if (showDaily) setShowDaily(false);
        else if (showGauntlets) setShowGauntlets(false);
        else if (showEditor) setShowEditor(false);
        else if (showThemes) setShowThemes(false);
        else if (showAchievements) setShowAchievements(false);
        else if (showSettings) setShowSettings(false);
        else if (screen === 'game' && !showWin) setShowPause(true);
        return;
      }

      if (screen !== 'game' || showPause || showWin || showCodex || isDemoPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          canvasRef.current?.move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          canvasRef.current?.move('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          canvasRef.current?.move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          canvasRef.current?.move('right');
          break;
        case 'z':
        case 'Z':
        case 'Backspace':
          e.preventDefault();
          canvasRef.current?.undo();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          usedUndoThisRunRef.current = false;
          elapsedMsRef.current = 0;
          runFramesRef.current = [];
          setElapsedMs(0);
          canvasRef.current?.restart();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          canvasRef.current?.hint();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    screen,
    showPause,
    showWin,
    showCodex,
    isDemoPlaying,
    showLevels,
    showDaily,
    showGauntlets,
    showEditor,
    showThemes,
    showAchievements,
    showSettings,
  ]);

  // Native Capacitor hardware Back button & background audio pause/resume
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backPromise = CapacitorApp.addListener('backButton', () => {
      if (isDemoPlaying) canvasRef.current?.stopDemo();
      else if (showCodex) setShowCodex(false);
      else if (showPause) setShowPause(false);
      else if (showWin) {
        setShowWin(false);
        setScreen('home');
      } else if (showLevels) setShowLevels(false);
      else if (showDaily) setShowDaily(false);
      else if (showGauntlets) setShowGauntlets(false);
      else if (showEditor) setShowEditor(false);
      else if (showThemes) setShowThemes(false);
      else if (showAchievements) setShowAchievements(false);
      else if (showSettings) setShowSettings(false);
      else if (screen === 'game') setShowPause(true);
      else CapacitorApp.exitApp().catch(() => {});
    });

    const statePromise = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        sound.resumeAudio();
      } else {
        sound.suspendAudio();
      }
    });

    return () => {
      backPromise.then((h) => h.remove()).catch(() => {});
      statePromise.then((h) => h.remove()).catch(() => {});
    };
  }, [
    screen,
    showPause,
    showWin,
    showCodex,
    isDemoPlaying,
    showLevels,
    showDaily,
    showGauntlets,
    showEditor,
    showThemes,
    showAchievements,
    showSettings,
  ]);

  const showAchievementNotification = (unlocked: Achievement[]) => {
    if (unlocked.length === 0) return;
    setAchievementToast(unlocked[0]);
    setTimeout(() => {
      setAchievementToast((current) => (current?.id === unlocked[0].id ? null : current));
    }, 3600);
  };

  const launchLevel = (target: LevelDefinition, mode: PlayMode) => {
    prevTrappedRef.current = 0;
    usedUndoThisRunRef.current = false;
    gemsCollectedRef.current = 0;
    elapsedMsRef.current = 0;
    runFramesRef.current = [];
    setActiveGhostRun(mode === 'campaign' ? storage.getLevelProgress(target.id).bestRun : undefined);
    setElapsedMs(0);
    setWinElapsedMs(0);
    setWinIsNewBestTime(false);
    setWinParOverride(null);
    setWinGauntletTitle(null);
    setIsDemoPlaying(false);
    setIsDeadlocked(false);
    setIntroDismissedFor(null);
    setCurrentMaxTiles(target.maxTiles);
    setAvailableTiles(target.maxTiles);
    setCurrentLevel(target);
    setPlayMode(mode);
    setShowLevels(false);
    setShowDaily(false);
    setShowGauntlets(false);
    setShowEditor(false);
    setShowWin(false);
    setShowPause(false);
    setDailyShareText(undefined);
    setNotice(target.hint || 'Tap or swipe to place a floor and walk.');
    setScreen('game');
  };

  const handleRestartBoard = () => {
    usedUndoThisRunRef.current = false;
    elapsedMsRef.current = 0;
    runFramesRef.current = [];
    setElapsedMs(0);
    canvasRef.current?.stopDemo(false);
    canvasRef.current?.restart();
  };

  const handleWatchSolution = () => {
    setShowPause(false);
    setShowWin(false);
    usedUndoThisRunRef.current = false;
    elapsedMsRef.current = 0;
    setElapsedMs(0);
    const started = canvasRef.current?.watchSolution();
    if (!started) {
      setNotice('Unable to compute an optimal solution preview for this board.');
    }
  };

  const handleStartLevel = (levelId: number) => {
    const target = ALL_LEVELS.find((l) => l.id === levelId) || ALL_LEVELS[0];
    launchLevel(target, 'campaign');
  };

  const handleStartDaily = (dateStr?: string) => {
    const targetDate = dateStr || getLocalDateString();
    setDailyDateStr(targetDate);
    launchLevel(getDailyChallenge(targetDate), 'daily');
  };

  const handleStartEndless = () => {
    const seed = Math.floor(Date.now() % 1000000);
    setEndlessSeed(seed);
    setEndlessStage(1);
    launchLevel(generateEndlessStage(1, seed), 'endless');
  };

  const handleStartGauntlet = (gauntletId: string) => {
    const stages = getGauntletStages(gauntletId);
    if (stages.length === 0) return;
    setActiveGauntletId(gauntletId);
    setGauntletStageIdx(0);
    setGauntletMovesAcc(0);
    setGauntletTimeAcc(0);
    lastGauntletStageMovesRef.current = 0;
    lastGauntletStageTimeRef.current = 0;
    setShowGauntlets(false);
    launchLevel(stages[0], 'gauntlet');
  };

  const handlePlayCustomLevel = (level: LevelDefinition) => {
    launchLevel(level, 'custom');
  };

  const handleStateChange = (game: PuzzleGame) => {
    setMoves(game.moves);
    setAvailableTiles(game.inventory);
    setCurrentMaxTiles(game.currentMaxTiles);
    setTrappedTiles(game.trapped.size);
    setStarsCollected(game.collectedStars.size);
    setKeysHeld(game.keysHeld);
    gemsCollectedRef.current = game.collectedStars.size;

    if (game.moves === 0) {
      runFramesRef.current = [];
    } else if (!isDemoPlaying && runFramesRef.current.length < 80) {
      const lastFrame = runFramesRef.current[runFramesRef.current.length - 1];
      if (!lastFrame || lastFrame[0] !== game.player.x || lastFrame[1] !== game.player.y) {
        runFramesRef.current.push([
          game.player.x,
          game.player.y,
          Math.round(elapsedMsRef.current),
        ]);
      }
    }

    const prevTrapped = prevTrappedRef.current;
    prevTrappedRef.current = game.trapped.size;

    if (game.moves === 0) {
      setNotice(currentLevel.hint || 'Tap or swipe to place a floor and walk.');
    } else if (game.trapped.size > prevTrapped) {
      setNotice('Sticky honey trapped your tile! Your bridge reach shrank by 1.');
    } else if (game.collectedStars.size === game.totalStars && game.totalStars > 0) {
      setNotice('All gems collected! Head to the finish flag.');
    } else if (game.inventory === 0) {
      setNotice('All tiles placed! Reach solid ground to reclaim them all.');
    } else if (game.moves === 1) {
      setNotice('Reach a solid island to pull your bridge tiles back into your hand!');
    }
  };

  const handleWin = (movesUsed: number, starsEarned: number, parMoves: number) => {
    const clearTimeMs = elapsedMsRef.current;
    setWinMoves(movesUsed);
    setWinStars(starsEarned);
    setWinElapsedMs(clearTimeMs);
    setWinParOverride(null);
    setWinGauntletTitle(null);

    if (playMode === 'daily') {
      const todayStr = getLocalDateString();
      const isArchive = dailyDateStr !== todayStr;
      const dailyResult = storage.recordDailyCompletion(dailyDateStr, isArchive);
      setWinCoins(dailyResult.coinsAwarded);
      setWinIsNewBestTime(false);
      setDailyShareText(
        formatDailyShareText(
          dailyDateStr,
          movesUsed,
          parMoves,
          starsEarned,
          storage.getData().dailyStreak
        )
      );
      showAchievementNotification(dailyResult.newlyUnlockedAchievements);
    } else if (playMode === 'endless') {
      const endlessRes = storage.recordEndlessClear(endlessStage);
      setWinCoins(endlessRes.coinsAwarded);
      setWinIsNewBestTime(false);
      setDailyShareText(undefined);
      showAchievementNotification(endlessRes.newlyUnlockedAchievements);
    } else if (playMode === 'gauntlet' && activeGauntletId) {
      const stages = getGauntletStages(activeGauntletId);
      const gauntlet = getGauntletById(activeGauntletId);
      const nextMovesAcc = gauntletMovesAcc + movesUsed;
      const nextTimeAcc = gauntletTimeAcc + clearTimeMs;
      lastGauntletStageMovesRef.current = movesUsed;
      lastGauntletStageTimeRef.current = clearTimeMs;
      setDailyShareText(undefined);

      if (gauntletStageIdx < stages.length - 1) {
        setWinCoins(0);
        setWinIsNewBestTime(false);
        setWinParOverride(null);
        setWinGauntletTitle(
          `Stage ${gauntletStageIdx + 1}/${stages.length} Cleared!`
        );
      } else {
        const { totalPar, silverMaxMoves } = getGauntletParTotals(activeGauntletId);
        const medal = evaluateGauntletMedal(nextMovesAcc, totalPar, silverMaxMoves);
        const res = storage.recordGauntletCompletion(
          activeGauntletId,
          nextMovesAcc,
          nextTimeAcc,
          medal
        );
        const medalIcon = medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉';
        setWinMoves(nextMovesAcc);
        setWinParOverride(totalPar);
        setWinStars(medal === 'gold' ? 3 : medal === 'silver' ? 2 : 1);
        setWinElapsedMs(nextTimeAcc);
        setWinIsNewBestTime(res.isNewBestTime);
        setWinCoins(res.coinsAwarded);
        setWinGauntletTitle(
          `${medalIcon} ${gauntlet?.name || 'Master Trial'} Complete!`
        );
        showAchievementNotification(res.newlyUnlockedAchievements);
      }
    } else if (playMode === 'custom') {
      setWinCoins(0);
      setWinIsNewBestTime(false);
      setDailyShareText(undefined);
    } else {
      const finalFrames: GhostFrame[] = [
        ...runFramesRef.current,
        [currentLevel.exit.x, currentLevel.exit.y, Math.round(clearTimeMs)],
      ];
      const victory = storage.recordLevelVictory(currentLevel.id, movesUsed, starsEarned, {
        usedUndo: usedUndoThisRunRef.current,
        gemsCollected: gemsCollectedRef.current,
        elapsedMs: clearTimeMs,
        runFrames: finalFrames,
      });
      setActiveGhostRun(storage.getLevelProgress(currentLevel.id).bestRun);
      setWinCoins(victory.coinsAwarded);
      setWinIsNewBestTime(victory.isNewBestTime);
      setDailyShareText(undefined);
      showAchievementNotification(victory.newlyUnlockedAchievements);
    }

    setShowWin(true);
  };

  const handleNextLevel = () => {
    setShowWin(false);
    if (playMode === 'endless') {
      const nextStage = endlessStage + 1;
      setEndlessStage(nextStage);
      launchLevel(generateEndlessStage(nextStage, endlessSeed), 'endless');
      return;
    }

    if (playMode === 'gauntlet' && activeGauntletId) {
      const stages = getGauntletStages(activeGauntletId);
      if (gauntletStageIdx + 1 < stages.length) {
        const nextIdx = gauntletStageIdx + 1;
        setGauntletMovesAcc((prev) => prev + lastGauntletStageMovesRef.current);
        setGauntletTimeAcc((prev) => prev + lastGauntletStageTimeRef.current);
        setGauntletStageIdx(nextIdx);
        launchLevel(stages[nextIdx], 'gauntlet');
      } else {
        setScreen('home');
        setShowGauntlets(true);
      }
      return;
    }

    if (playMode === 'custom') {
      setScreen('home');
      setShowEditor(true);
      return;
    }

    if (playMode === 'daily') {
      setScreen('home');
      setShowDaily(true);
      return;
    }

    const nextId = currentLevel.id + 1;
    if (nextId <= TOTAL_CAMPAIGN_LEVELS) {
      handleStartLevel(nextId);
    } else {
      setScreen('home');
    }
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    sound.musicEnabled = next;
    storage.getData().settings.musicEnabled = next;
    storage.save();
    if (next) sound.startMusic();
    else sound.stopMusic();
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    sound.sfxEnabled = next;
    storage.getData().settings.sfxEnabled = next;
    storage.save();
  };

  const currentWorld = WORLDS.find((w) => w.id === currentLevel.world);
  const activeGauntlet = activeGauntletId ? getGauntletById(activeGauntletId) : undefined;
  const activeGauntletStages = activeGauntletId ? getGauntletStages(activeGauntletId) : [];
  const isFinalGauntletStage =
    playMode === 'gauntlet' &&
    activeGauntletStages.length > 0 &&
    gauntletStageIdx >= activeGauntletStages.length - 1;

  const activeIntro =
    playMode === 'campaign' &&
    moves === 0 &&
    !isDemoPlaying &&
    introDismissedFor !== currentLevel.id &&
    MECHANIC_INTROS[currentLevel.id]
      ? MECHANIC_INTROS[currentLevel.id]
      : null;

  const isArchiveDaily = playMode === 'daily' && dailyDateStr !== getLocalDateString();

  const headerTitle =
    playMode === 'daily'
      ? isArchiveDaily
        ? `Archive · ${dailyDateStr}`
        : 'Daily Challenge'
      : playMode === 'endless'
      ? `Void Rush · Stage ${endlessStage}`
      : playMode === 'gauntlet'
      ? `${activeGauntlet?.icon || '⚔️'} Stage ${gauntletStageIdx + 1}/${activeGauntletStages.length || 4}: ${currentLevel.name}`
      : playMode === 'custom'
      ? currentLevel.name
      : `Level ${currentLevel.id}: ${currentLevel.name}`;

  const headerSubtitle =
    playMode === 'daily'
      ? isArchiveDaily
        ? 'Monthly Archive Replay'
        : `Daily · ${dailyDateStr}`
      : playMode === 'endless'
      ? `Best Streak: ${storage.getData().bestEndlessStreak}`
      : playMode === 'gauntlet'
      ? `${activeGauntlet?.name || 'Master Trial'} · Total Moves: ${gauntletMovesAcc + moves}`
      : playMode === 'custom'
      ? 'Builder Studio'
      : `World ${currentLevel.world}: ${currentWorld?.name}`;

  if (screen === 'splash') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center select-none">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-5xl shadow-2xl shadow-sky-500/30 mb-6 animate-pulse">
          🧩
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">STEAL THE FLOOR</h1>
        <p className="text-xs text-sky-400 font-bold uppercase tracking-widest mb-8">
          100% Offline Puzzle Strategy
        </p>

        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="bg-sky-500 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (screen === 'home') {
    return (
      <>
        <HomeScreen
          onPlay={handleStartLevel}
          onOpenLevels={() => setShowLevels(true)}
          onOpenDaily={() => setShowDaily(true)}
          onOpenGauntlets={() => setShowGauntlets(true)}
          onStartEndless={handleStartEndless}
          onOpenEditor={() => setShowEditor(true)}
          onOpenThemes={() => setShowThemes(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenCodex={() => setShowCodex(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {showLevels && (
          <LevelSelectModal
            currentLevelId={currentLevel.id}
            onSelectLevel={handleStartLevel}
            onBack={() => setShowLevels(false)}
          />
        )}

        {showDaily && (
          <DailyChallengeModal
            onBack={() => setShowDaily(false)}
            onStartDaily={handleStartDaily}
          />
        )}

        {showGauntlets && (
          <GauntletsModal
            onBack={() => setShowGauntlets(false)}
            onStartGauntlet={handleStartGauntlet}
          />
        )}

        {showEditor && (
          <LevelEditorModal
            onBack={() => setShowEditor(false)}
            onPlayCustomLevel={handlePlayCustomLevel}
          />
        )}

        {showThemes && (
          <ThemesModal
            onBack={() => setShowThemes(false)}
            onThemeChanged={(newTheme, newSkin, newTrail, newTileSkin) => {
              setThemeId(newTheme);
              setSkinColor(newSkin);
              setTrailId(newTrail);
              setTileSkinId(newTileSkin);
            }}
          />
        )}

        {showAchievements && (
          <AchievementsModal onBack={() => setShowAchievements(false)} />
        )}

        {showCodex && <CodexModal onBack={() => setShowCodex(false)} />}

        {showSettings && (
          <SettingsModal
            onBack={() => setShowSettings(false)}
            onSettingsChanged={syncAccessibilitySettings}
            onReset={() => {
              const resetData = storage.getData();
              const matchedSkin = SKINS.find((sk) => sk.id === resetData.selectedSkin) || SKINS[0];
              setCurrentLevel(ALL_LEVELS[0]);
              setThemeId(resetData.selectedTheme);
              setSkinColor(matchedSkin.color);
              setTrailId(resetData.selectedTrail);
              setTileSkinId(resetData.selectedTileSkin || 'tile-classic');
              setMusicEnabled(resetData.settings.musicEnabled);
              setSfxEnabled(resetData.settings.sfxEnabled);
              setSpeedrunTimer(resetData.settings.speedrunTimer);
              setReducedMotion(resetData.settings.reducedMotion);
              setHighContrast(resetData.settings.highContrast);
              sound.hapticsEnabled = resetData.settings.hapticsEnabled;
              setShowSettings(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden select-none safe-top safe-bottom">
      {achievementToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 border border-amber-400/60 rounded-2xl shadow-2xl shadow-amber-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300 max-w-xs w-[90%]">
          <span className="text-2xl">{achievementToast.icon}</span>
          <div className="text-left min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Badge Unlocked! +{ACHIEVEMENT_REWARD_COINS} 🪙
            </div>
            <div className="text-xs font-extrabold text-white truncate">
              {achievementToast.title}
            </div>
          </div>
        </div>
      )}

      <HeaderBar
        levelTitle={headerTitle}
        worldName={headerSubtitle}
        moves={moves}
        parMoves={currentLevel.parMoves}
        starsCollected={starsCollected}
        totalStars={currentLevel.stars?.length || 0}
        keysHeld={keysHeld}
        hasKeys={Boolean(currentLevel.locks?.length || currentLevel.keys?.length)}
        elapsedMs={elapsedMs}
        showTimer={speedrunTimer}
        onPause={() => setShowPause(true)}
        onRestart={handleRestartBoard}
      />

      {isDemoPlaying && (
        <div className="px-3 py-2 bg-indigo-950/95 border-b border-indigo-400/40 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm flex-none">🎬</span>
            <p className="text-[11px] font-bold text-indigo-100 truncate">
              Watching Optimal Par Solution ({currentLevel.parMoves} moves)
            </p>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              canvasRef.current?.stopDemo();
            }}
            className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-indigo-500/30 hover:bg-indigo-500/40 border border-indigo-300/50 rounded-lg text-white flex-none active:scale-95 transition-all"
          >
            Stop &amp; Play
          </button>
        </div>
      )}

      {activeIntro && (
        <div className="px-3 py-2 bg-sky-950/90 border-b border-sky-500/30 flex items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base flex-none">{activeIntro.icon}</span>
            <p className="text-[11px] text-sky-100 leading-snug">
              <strong className="text-sky-300">{activeIntro.title}:</strong> {activeIntro.tip}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              setIntroDismissedFor(currentLevel.id);
            }}
            className="px-2 py-1 text-[10px] font-bold uppercase bg-sky-500/20 border border-sky-400/40 rounded-lg text-sky-200 flex-none"
          >
            Got it
          </button>
        </div>
      )}

      <GameCanvas
        ref={canvasRef}
        level={currentLevel}
        themeId={themeId}
        skinColor={skinColor}
        trailId={trailId}
        tileSkinId={tileSkinId}
        reducedMotion={reducedMotion}
        highContrast={highContrast}
        ghostRun={activeGhostRun}
        showGhost={speedrunTimer && playMode === 'campaign'}
        onDemoStateChange={setIsDemoPlaying}
        onStateChange={handleStateChange}
        onWin={handleWin}
        onError={(msg) => setNotice(msg)}
        onDeadlock={setIsDeadlocked}
        onTilePlaced={() => storage.recordTilePlaced()}
        onUndoUsed={() => {
          usedUndoThisRunRef.current = true;
          storage.recordUndo();
        }}
      />

      <InventoryBar
        available={availableTiles}
        maxTiles={currentMaxTiles}
        trappedCount={trappedTiles}
        canUndo={moves > 0 && !isDemoPlaying}
        isDeadlocked={isDeadlocked && !isDemoPlaying}
        notice={
          isDemoPlaying
            ? 'Solution Theater playing — tap "Stop & Play" anytime to try it yourself.'
            : notice
        }
        onUndo={() => canvasRef.current?.undo()}
        onHint={() => canvasRef.current?.hint()}
      />

      {showPause && (
        <PauseModal
          levelId={currentLevel.id}
          levelName={currentLevel.name}
          onResume={() => setShowPause(false)}
          onRestart={() => {
            setShowPause(false);
            handleRestartBoard();
          }}
          onWatchSolution={handleWatchSolution}
          onOpenCodex={() => setShowCodex(true)}
          onHome={() => {
            setShowPause(false);
            canvasRef.current?.stopDemo(false);
            setScreen('home');
          }}
          musicEnabled={musicEnabled}
          sfxEnabled={sfxEnabled}
          onToggleMusic={handleToggleMusic}
          onToggleSfx={handleToggleSfx}
        />
      )}

      {showCodex && <CodexModal onBack={() => setShowCodex(false)} />}

      {showWin && (
        <LevelCompleteModal
          levelId={currentLevel.id}
          levelName={
            playMode === 'gauntlet' && isFinalGauntletStage && activeGauntlet
              ? `${activeGauntlet.subtitle} · ${activeGauntletStages.length} Stages`
              : currentLevel.name
          }
          titleOverride={
            playMode === 'gauntlet'
              ? winGauntletTitle || undefined
              : playMode === 'endless'
              ? `Stage ${endlessStage} Cleared!`
              : playMode === 'custom'
              ? 'Custom Puzzle Solved!'
              : undefined
          }
          nextLabel={
            playMode === 'gauntlet'
              ? isFinalGauntletStage
                ? 'All Master Trials'
                : `Next Trial Stage (${gauntletStageIdx + 2}/${activeGauntletStages.length}) →`
              : playMode === 'endless'
              ? `Next Stage (${endlessStage + 1}) →`
              : playMode === 'custom'
              ? 'Back to Builder Studio'
              : 'Next Level'
          }
          isDaily={playMode === 'daily'}
          shareText={dailyShareText}
          moves={winMoves}
          parMoves={winParOverride ?? currentLevel.parMoves}
          starsEarned={winStars}
          coinsEarned={winCoins}
          elapsedMs={winElapsedMs}
          isNewBestTime={winIsNewBestTime}
          reducedMotion={reducedMotion}
          hasNextLevel={
            playMode === 'gauntlet' ||
            playMode === 'endless' ||
            playMode === 'custom' ||
            (playMode === 'campaign' && currentLevel.id < TOTAL_CAMPAIGN_LEVELS)
          }
          onNext={handleNextLevel}
          onWatchSolution={
            playMode === 'gauntlet' && isFinalGauntletStage
              ? undefined
              : handleWatchSolution
          }
          onReplay={() => {
            setShowWin(false);
            if (playMode === 'gauntlet' && isFinalGauntletStage && activeGauntletId) {
              handleStartGauntlet(activeGauntletId);
            } else {
              handleRestartBoard();
            }
          }}
          onHome={() => {
            setShowWin(false);
            setScreen('home');
          }}
        />
      )}
    </div>
  );
};
