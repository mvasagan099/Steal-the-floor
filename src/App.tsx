import React, { useState, useEffect, useRef } from 'react';
import { ALL_LEVELS, WORLDS } from './levels/levelsData';
import { getDailyChallenge } from './levels/dailyChallenge';
import { storage, SKINS, THEMES } from './storage/gameStorage';
import { sound } from './audio/soundManager';
import { ads } from './utils/admobService';
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

  // Victory details
  const [winMoves, setWinMoves] = useState(0);
  const [winStars, setWinStars] = useState(0);
  const [winCoins, setWinCoins] = useState(0);

  // Live game logic state
  const [moves, setMoves] = useState(0);
  const [availableTiles, setAvailableTiles] = useState(3);
  const [trappedTiles, setTrappedTiles] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [notice, setNotice] = useState('Tap a glowing adjacent square to place a floor and walk.');

  // Customization & audio
  const [themeId, setThemeId] = useState(() => storage.getData().selectedTheme);
  const [skinColor, setSkinColor] = useState(() => {
    const s = SKINS.find((sk) => sk.id === storage.getData().selectedSkin);
    return s ? s.color : '#f59e0b';
  });
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  const canvasRef = useRef<GameCanvasHandle>(null);

  // Init audio and sound settings
  useEffect(() => {
    const data = storage.getData();
    sound.setMusicVolume(data.settings.musicVolume);
    sound.setSfxVolume(data.settings.sfxVolume);
    sound.startMusic();
    ads.initialize();

    // Auto transition splash screen
    const timer = setTimeout(() => {
      setScreen('home');
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  const handleStartLevel = (levelId: number) => {
    const target = ALL_LEVELS.find((l) => l.id === levelId) || ALL_LEVELS[0];
    setCurrentLevel(target);
    setIsDaily(false);
    setShowLevels(false);
    setShowWin(false);
    setShowPause(false);
    setNotice(target.hint || 'Tap a glowing adjacent square to place a floor and walk.');
    setScreen('game');
  };

  const handleStartDaily = () => {
    const dailyLvl = getDailyChallenge();
    setCurrentLevel(dailyLvl);
    setIsDaily(true);
    setShowDaily(false);
    setShowWin(false);
    setShowPause(false);
    setNotice(dailyLvl.hint || 'A special daily challenge! Plan your route carefully.');
    setScreen('game');
  };

  const handleStateChange = (game: PuzzleGame) => {
    setMoves(game.moves);
    setAvailableTiles(game.inventory);
    setTrappedTiles(game.trapped.size);
    setStarsCollected(game.collectedStars.size);

    if (game.moves === 1) {
      setNotice('Great! Notice how your old tile returns to your inventory as you walk.');
    } else if (game.trapped.size > 0 && trappedTiles === 0) {
      setNotice('Sticky honey trapped your tile! You have one less tile to work with.');
    } else if (game.inventory === 0) {
      setNotice('All tiles placed! Step onto solid ground to reclaim them.');
    } else if (game.collectedStars.size === game.totalStars && game.totalStars > 0) {
      setNotice('All stars collected! Head to the finish flag.');
    }
  };

  const handleWin = (movesUsed: number, starsEarned: number, parMoves: number) => {
    setWinMoves(movesUsed);
    setWinStars(starsEarned);

    let earnedCoins = starsEarned * 5;
    if (isDaily) {
      const todayStr = new Date().toISOString().split('T')[0];
      storage.recordDailyCompletion(todayStr);
      earnedCoins += 25;
    } else {
      storage.recordLevelVictory(currentLevel.id, movesUsed, starsEarned);
    }

    setWinCoins(earnedCoins);
    setShowWin(true);

    // Optional safe interstitial ad frequency
    if (!isDaily) {
      ads.showInterstitialIfEligible(currentLevel.id);
    }
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
    if (next) sound.startMusic();
    else sound.stopMusic();
  };

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    sound.sfxEnabled = next;
  };

  const currentWorld = WORLDS.find((w) => w.id === currentLevel.world);

  // Splash Screen Render
  if (screen === 'splash') {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center select-none">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-5xl shadow-2xl shadow-sky-500/30 mb-6 animate-pulse">
          🧩
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          STEAL THE FLOOR
        </h1>
        <p className="text-xs text-sky-400 font-bold uppercase tracking-widest mb-8">
          Offline Mobile Puzzle
        </p>

        {/* Loading Spinner bar */}
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
              setCurrentLevel(ALL_LEVELS[0]);
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
      {/* Top Header */}
      <HeaderBar
        levelTitle={isDaily ? 'Daily Challenge' : `Level ${currentLevel.id}: ${currentLevel.name}`}
        worldName={isDaily ? 'Special Event' : `World ${currentLevel.world}: ${currentWorld?.name}`}
        moves={moves}
        parMoves={currentLevel.parMoves}
        starsCollected={starsCollected}
        totalStars={currentLevel.stars?.length || 0}
        onPause={() => setShowPause(true)}
        onRestart={() => canvasRef.current?.restart()}
      />

      {/* Phaser Canvas Container */}
      <GameCanvas
        ref={canvasRef}
        level={currentLevel}
        themeId={themeId}
        skinColor={skinColor}
        onStateChange={handleStateChange}
        onWin={handleWin}
        onError={(msg) => setNotice(msg)}
      />

      {/* Bottom Inventory Bar */}
      <InventoryBar
        available={availableTiles}
        maxTiles={currentLevel.maxTiles}
        trappedCount={trappedTiles}
        canUndo={moves > 0}
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
          moves={winMoves}
          parMoves={currentLevel.parMoves}
          starsEarned={winStars}
          coinsEarned={winCoins}
          hasNextLevel={!isDaily && currentLevel.id < 100}
          onNext={handleNextLevel}
          onReplay={() => {
            setShowWin(false);
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
