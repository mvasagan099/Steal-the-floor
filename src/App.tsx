import React, { useState, useEffect, useRef } from 'react';
import { ALL_LEVELS, WORLDS } from './levels/levelsData';
import { getDailyChallenge, formatDailyShareText } from './levels/dailyChallenge';
import {
  storage,
  SKINS,
  Achievement,
  getLocalDateString,
  ACHIEVEMENT_REWARD_COINS,
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

type AppScreen = 'splash' | 'home' | 'game';

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
    icon: '🪨',
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
};

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [currentLevel, setCurrentLevel] = useState<LevelDefinition>(ALL_LEVELS[0]);
  const [isDaily, setIsDaily] = useState(false);

  // Modals
  const [showPause, setShowPause] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showLevels, setShowLevels] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Contextual onboarding banner & achievement unlock toast
  const [introDismissedFor, setIntroDismissedFor] = useState<number | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  // Victory details
  const [winMoves, setWinMoves] = useState(0);
  const [winStars, setWinStars] = useState(0);
  const [winCoins, setWinCoins] = useState(0);
  const [dailyShareText, setDailyShareText] = useState<string | undefined>(undefined);

  // Live game logic state
  const [moves, setMoves] = useState(0);
  const [availableTiles, setAvailableTiles] = useState(2);
  const [trappedTiles, setTrappedTiles] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [isDeadlocked, setIsDeadlocked] = useState(false);
  const [notice, setNotice] = useState('Tap or swipe to place a floor and walk.');

  // Customization & persisted audio
  const [themeId, setThemeId] = useState(() => storage.getData().selectedTheme);
  const [skinColor, setSkinColor] = useState(() => {
    const s = SKINS.find((sk) => sk.id === storage.getData().selectedSkin);
    return s ? s.color : '#f59e0b';
  });
  const [musicEnabled, setMusicEnabled] = useState(() => storage.getData().settings.musicEnabled);
  const [sfxEnabled, setSfxEnabled] = useState(() => storage.getData().settings.sfxEnabled);

  const canvasRef = useRef<GameCanvasHandle>(null);
  const prevTrappedRef = useRef(0);
  const usedUndoThisRunRef = useRef(false);
  const gemsCollectedRef = useRef(0);

  // Init audio and persisted settings
  useEffect(() => {
    const data = storage.getData();
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
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard controls (WASD / Arrow keys, Z Undo, R Restart, H Hint, Esc Pause/Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        if (showPause) setShowPause(false);
        else if (showLevels) setShowLevels(false);
        else if (showDaily) setShowDaily(false);
        else if (showThemes) setShowThemes(false);
        else if (showAchievements) setShowAchievements(false);
        else if (showSettings) setShowSettings(false);
        else if (screen === 'game' && !showWin) setShowPause(true);
        return;
      }

      if (screen !== 'game' || showPause || showWin) return;

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
    showLevels,
    showDaily,
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

  const handleStartLevel = (levelId: number) => {
    const target = ALL_LEVELS.find((l) => l.id === levelId) || ALL_LEVELS[0];
    prevTrappedRef.current = 0;
    usedUndoThisRunRef.current = false;
    gemsCollectedRef.current = 0;
    setIsDeadlocked(false);
    setIntroDismissedFor(null);
    setCurrentLevel(target);
    setIsDaily(false);
    setShowLevels(false);
    setShowWin(false);
    setShowPause(false);
    setDailyShareText(undefined);
    setNotice(target.hint || 'Tap or swipe to place a floor and walk.');
    setScreen('game');
  };

  const handleStartDaily = () => {
    const dailyLvl = getDailyChallenge();
    prevTrappedRef.current = 0;
    usedUndoThisRunRef.current = false;
    gemsCollectedRef.current = 0;
    setIsDeadlocked(false);
    setIntroDismissedFor(null);
    setCurrentLevel(dailyLvl);
    setIsDaily(true);
    setShowDaily(false);
    setShowWin(false);
    setShowPause(false);
    setDailyShareText(undefined);
    setNotice(dailyLvl.hint || 'A fresh procedural daily challenge! Plan your route carefully.');
    setScreen('game');
  };

  const handleStateChange = (game: PuzzleGame) => {
    setMoves(game.moves);
    setAvailableTiles(game.inventory);
    setTrappedTiles(game.trapped.size);
    setStarsCollected(game.collectedStars.size);
    gemsCollectedRef.current = game.collectedStars.size;

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
    setWinMoves(movesUsed);
    setWinStars(starsEarned);

    if (isDaily) {
      const todayStr = getLocalDateString();
      const dailyResult = storage.recordDailyCompletion(todayStr);
      setWinCoins(dailyResult.coinsAwarded);
      setDailyShareText(
        formatDailyShareText(
          todayStr,
          movesUsed,
          parMoves,
          starsEarned,
          storage.getData().dailyStreak
        )
      );
      showAchievementNotification(dailyResult.newlyUnlockedAchievements);
    } else {
      const victory = storage.recordLevelVictory(currentLevel.id, movesUsed, starsEarned, {
        usedUndo: usedUndoThisRunRef.current,
        gemsCollected: gemsCollectedRef.current,
      });
      setWinCoins(victory.coinsAwarded);
      setDailyShareText(undefined);
      showAchievementNotification(victory.newlyUnlockedAchievements);
    }

    setShowWin(true);
  };

  const handleNextLevel = () => {
    setShowWin(false);
    if (isDaily) {
      setScreen('home');
      return;
    }

    const nextId = currentLevel.id + 1;
    if (nextId <= 100) {
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
  const activeIntro =
    !isDaily &&
    moves === 0 &&
    introDismissedFor !== currentLevel.id &&
    MECHANIC_INTROS[currentLevel.id]
      ? MECHANIC_INTROS[currentLevel.id]
      : null;

  // Splash Screen Render
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

  // Home Screen Render
  if (screen === 'home') {
    return (
      <>
        <HomeScreen
          onPlay={handleStartLevel}
          onOpenLevels={() => setShowLevels(true)}
          onOpenDaily={() => setShowDaily(true)}
          onOpenThemes={() => setShowThemes(true)}
          onOpenAchievements={() => setShowAchievements(true)}
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

        {showThemes && (
          <ThemesModal
            onBack={() => setShowThemes(false)}
            onThemeChanged={(newTheme, newSkin) => {
              setThemeId(newTheme);
              setSkinColor(newSkin);
            }}
          />
        )}

        {showAchievements && (
          <AchievementsModal onBack={() => setShowAchievements(false)} />
        )}

        {showSettings && (
          <SettingsModal
            onBack={() => setShowSettings(false)}
            onReset={() => {
              const resetData = storage.getData();
              setCurrentLevel(ALL_LEVELS[0]);
              setThemeId(resetData.selectedTheme);
              setSkinColor(SKINS[0].color);
              setMusicEnabled(resetData.settings.musicEnabled);
              setSfxEnabled(resetData.settings.sfxEnabled);
              sound.hapticsEnabled = resetData.settings.hapticsEnabled;
              setShowSettings(false);
            }}
          />
        )}
      </>
    );
  }

  // Active Game Screen Render
  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden select-none safe-top safe-bottom">
      {/* Live Achievement Unlock Toast */}
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

      {/* Top Header */}
      <HeaderBar
        levelTitle={
          isDaily ? 'Daily Challenge' : `Level ${currentLevel.id}: ${currentLevel.name}`
        }
        worldName={
          isDaily ? 'Procedural Daily' : `World ${currentLevel.world}: ${currentWorld?.name}`
        }
        moves={moves}
        parMoves={currentLevel.parMoves}
        starsCollected={starsCollected}
        totalStars={currentLevel.stars?.length || 0}
        onPause={() => setShowPause(true)}
        onRestart={() => {
          usedUndoThisRunRef.current = false;
          canvasRef.current?.restart();
        }}
      />

      {/* Contextual Mechanic Intro Banner on Milestone Levels */}
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

      {/* Phaser Canvas Container */}
      <GameCanvas
        ref={canvasRef}
        level={currentLevel}
        themeId={themeId}
        skinColor={skinColor}
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

      {/* Bottom Inventory Bar */}
      <InventoryBar
        available={availableTiles}
        maxTiles={currentLevel.maxTiles}
        trappedCount={trappedTiles}
        canUndo={moves > 0}
        isDeadlocked={isDeadlocked}
        notice={notice}
        onUndo={() => canvasRef.current?.undo()}
        onHint={() => canvasRef.current?.hint()}
      />

      {/* Pause Modal */}
      {showPause && (
        <PauseModal
          levelId={currentLevel.id}
          levelName={currentLevel.name}
          onResume={() => setShowPause(false)}
          onRestart={() => {
            setShowPause(false);
            usedUndoThisRunRef.current = false;
            canvasRef.current?.restart();
          }}
          onHome={() => {
            setShowPause(false);
            setScreen('home');
          }}
          musicEnabled={musicEnabled}
          sfxEnabled={sfxEnabled}
          onToggleMusic={handleToggleMusic}
          onToggleSfx={handleToggleSfx}
        />
      )}

      {/* Level Complete Victory Modal */}
      {showWin && (
        <LevelCompleteModal
          levelId={currentLevel.id}
          levelName={currentLevel.name}
          isDaily={isDaily}
          shareText={dailyShareText}
          moves={winMoves}
          parMoves={currentLevel.parMoves}
          starsEarned={winStars}
          coinsEarned={winCoins}
          hasNextLevel={!isDaily && currentLevel.id < 100}
          onNext={handleNextLevel}
          onReplay={() => {
            setShowWin(false);
            usedUndoThisRunRef.current = false;
            canvasRef.current?.restart();
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
