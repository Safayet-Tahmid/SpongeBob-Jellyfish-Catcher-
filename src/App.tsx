/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GameMode,
  GameState,
  GameSettings,
  PlayerStats,
  PowerUpActive,
} from './types/game';
import { GameEngine } from './game/GameEngine';
import { soundManager } from './utils/audio';
import {
  loadSettings,
  loadStats,
  saveSettings,
  defaultSettings,
  defaultStats,
} from './utils/storage';
import { GameHUD } from './components/GameHUD/GameHUD';
import { MobileControls } from './components/MobileControls/MobileControls';
import { MainMenu } from './components/MainMenu/MainMenu';
import { PauseMenu } from './components/PauseMenu/PauseMenu';
import { GameOverModal } from './components/GameOver/GameOverModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { ControlEditorModal } from './components/ControlEditor/ControlEditorModal';
import { HowToPlayModal } from './components/HowToPlay/HowToPlayModal';
import { AboutModal } from './components/About/AboutModal';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // States
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [selectedMode, setSelectedMode] = useState<GameMode>('CLASSIC');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelCatches, setLevelCatches] = useState(0);
  const [targetCatches, setTargetCatches] = useState(10);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpActive[]>([]);

  // Persistent data
  const [stats, setStats] = useState<PlayerStats>(defaultStats);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isControlEditorOpen, setIsControlEditorOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Game over state
  const [gameOverSummary, setGameOverSummary] = useState<{
    finalScore: number;
    isNewHigh: boolean;
    totalCaught: number;
    goldenCaught: number;
    accuracy: number;
    levelReached: number;
  } | null>(null);

  // Device touch detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Initialize storage
  useEffect(() => {
    const loadedS = loadSettings();
    const loadedSt = loadStats();
    setSettings(loadedS);
    setStats(loadedSt);
    soundManager.updateSettings(loadedS);

    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 1024;
    setIsTouchDevice(hasTouch);
  }, []);

  // Update Settings handler
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
    soundManager.updateSettings(newSettings);
  };

  // Toggle sound shortcut in HUD
  const handleToggleSound = () => {
    const newSoundState = !settings.sfxEnabled || !settings.musicEnabled;
    handleUpdateSettings({
      sfxEnabled: newSoundState,
      musicEnabled: newSoundState,
    });
  };

  // Engine instantiation
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onScoreUpdate: (s) => setScore(s),
      onLivesUpdate: (l) => setLives(l),
      onTimeUpdate: (t) => setTimeRemaining(t),
      onLevelUpdate: (lvl, cur, tgt) => {
        setCurrentLevel(lvl);
        setLevelCatches(cur);
        setTargetCatches(tgt);
      },
      onPowerUpsUpdate: (pus) => setActivePowerUps(pus),
      onStateChange: (st) => setGameState(st),
      onGameOver: (summary) => {
        setGameOverSummary(summary);
        setStats(loadStats());
      },
    });

    engineRef.current = engine;

    const onResize = () => {
      engine.handleResize();
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 1024;
      setIsTouchDevice(hasTouch);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      engine.stop();
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const keysDown = new Set<string>();

    const updateEngineInput = () => {
      if (!engineRef.current) return;
      let dx = 0;
      let dy = 0;

      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) dx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) dx += 1;
      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) dy -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) dy += 1;

      engineRef.current.setInput(dx, dy);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }

      if (e.code === 'Space') {
        engineRef.current?.triggerNetCatch();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
          soundManager.pauseBackgroundMusic();
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
          soundManager.resumeBackgroundMusic();
        }
      }

      keysDown.add(e.code);
      updateEngineInput();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      updateEngineInput();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Game control triggers
  const handleStartGame = (mode?: GameMode) => {
    const m = mode || selectedMode;
    setSelectedMode(m);
    setGameOverSummary(null);
    soundManager.playGameplayMusic();
    engineRef.current?.start(m);
  };

  const handlePauseGame = () => {
    engineRef.current?.pause();
    soundManager.pauseBackgroundMusic();
  };

  const handleResumeGame = () => {
    engineRef.current?.resume();
    soundManager.resumeBackgroundMusic();
  };

  const handleRestartGame = () => {
    soundManager.playGameplayMusic();
    engineRef.current?.start(selectedMode);
  };

  const handleMainMenu = () => {
    engineRef.current?.stop();
    setGameState('MAIN_MENU');
    setGameOverSummary(null);
    setStats(loadStats());
    soundManager.playMenuMusic();
  };

  const handleSaveControlLayout = (newLayout: any) => {
    handleUpdateSettings({ controlLayout: newLayout });
  };

  const handleCatchAction = useCallback(() => {
    engineRef.current?.triggerNetCatch();
  }, []);

  const handleJoystickMove = useCallback((x: number, y: number) => {
    engineRef.current?.setInput(x, y);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full min-h-[100dvh] overflow-hidden bg-sky-950 text-slate-100 select-none touch-none">
      {/* HTML5 Game Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCatchAction}
        className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
      />

      {/* 1. Loading Screen */}
      {gameState === 'LOADING' && (
        <LoadingScreen
          onLoaded={() => {
            setGameState('MAIN_MENU');
            soundManager.playMenuMusic();
          }}
        />
      )}

      {/* 2. Main Menu */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          stats={stats}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onPlay={() => handleStartGame(selectedMode)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenControlEditor={() => setIsControlEditorOpen(true)}
        />
      )}

      {/* 3. In-Game HUD */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameHUD
          score={score}
          lives={lives}
          timeRemaining={timeRemaining}
          currentLevel={currentLevel}
          levelCatches={levelCatches}
          targetCatches={targetCatches}
          mode={selectedMode}
          powerUps={activePowerUps}
          soundEnabled={settings.sfxEnabled && settings.musicEnabled}
          layout={settings.controlLayout}
          onToggleSound={handleToggleSound}
          onPause={handlePauseGame}
        />
      )}

      {/* 4. Mobile Virtual Controls */}
      {gameState === 'PLAYING' && isTouchDevice && (
        <MobileControls
          onMove={handleJoystickMove}
          onCatch={handleCatchAction}
          layout={settings.controlLayout}
          sensitivity={settings.sensitivity}
        />
      )}

      {/* 5. Pause Menu Overlay */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResumeGame}
          onRestart={handleRestartGame}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* 6. Game Over / Victory Modal */}
      {gameState === 'GAME_OVER' && gameOverSummary && (
        <GameOverModal
          score={gameOverSummary.finalScore}
          bestScore={stats.bestScore}
          isNewHigh={gameOverSummary.isNewHigh}
          totalCaught={gameOverSummary.totalCaught}
          goldenCaught={gameOverSummary.goldenCaught}
          accuracy={gameOverSummary.accuracy}
          levelReached={gameOverSummary.levelReached}
          onPlayAgain={() => handleStartGame(selectedMode)}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* 7. Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenControlEditor={() => {
            setIsSettingsOpen(false);
            setIsControlEditorOpen(true);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* 8. Control Layout Editor */}
      {isControlEditorOpen && (
        <ControlEditorModal
          layout={settings.controlLayout}
          onSave={handleSaveControlLayout}
          onClose={() => setIsControlEditorOpen(false)}
        />
      )}

      {/* 9. How To Play Modal */}
      {isHowToPlayOpen && (
        <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />
      )}

      {/* 10. About Modal */}
      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
    </div>
  );
}
