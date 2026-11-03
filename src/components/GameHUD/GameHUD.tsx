import React, { useEffect, useState } from 'react';
import { Pause, Volume2, VolumeX, Sparkles, Shield, Zap, Magnet, Gauge } from 'lucide-react';
import { GameMode, PowerUpActive, PowerUpType } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface GameHUDProps {
  score: number;
  lives: number;
  timeRemaining: number;
  currentLevel: number;
  levelCatches: number;
  targetCatches: number;
  mode: GameMode;
  powerUps: PowerUpActive[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  lives,
  timeRemaining,
  currentLevel,
  levelCatches,
  targetCatches,
  mode,
  powerUps,
  soundEnabled,
  onToggleSound,
  onPause,
}) => {
  const [prevScore, setPrevScore] = useState(score);
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    if (score !== prevScore) {
      setPrevScore(score);
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 240);
      return () => clearTimeout(timer);
    }
  }, [score, prevScore]);

  const formatTime = (secs: number) => {
    if (mode === 'RELAX') return '∞';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPowerUpIcon = (type: PowerUpType) => {
    switch (type) {
      case 'SUPER_NET':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'SPEED_BOOST':
        return <Zap className="w-4 h-4 text-yellow-300" />;
      case 'MAGNET':
        return <Magnet className="w-4 h-4 text-rose-400" />;
      case 'BUBBLE_SHIELD':
        return <Shield className="w-4 h-4 text-sky-300" />;
      case 'DOUBLE_POINTS':
        return <Gauge className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getPowerUpName = (type: PowerUpType) => {
    switch (type) {
      case 'SUPER_NET':
        return 'Super Net';
      case 'SPEED_BOOST':
        return 'Speed Boost';
      case 'MAGNET':
        return 'Magnet';
      case 'BUBBLE_SHIELD':
        return 'Shield';
      case 'DOUBLE_POINTS':
        return '2X Points';
    }
  };

  const isLowTime = mode !== 'RELAX' && timeRemaining <= 15;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none z-20 p-3 sm:p-5 flex flex-col gap-2">
      {/* Top Main Status Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Top Left: Score & Level */}
        <div className="flex items-center gap-2.5">
          {/* Score Card */}
          <div className="pointer-events-auto bg-slate-900/75 backdrop-blur-md border border-white/15 shadow-lg rounded-2xl px-3.5 py-2 flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-200">
              Score
            </span>
            <span
              className={`font-cartoon text-xl sm:text-2xl font-bold tracking-tight text-amber-300 transition-transform duration-150 tabular-nums ${
                isPopping ? 'scale-125 text-amber-200' : 'scale-100'
              }`}
            >
              {score}
            </span>
          </div>

          {/* Level Progress */}
          {mode === 'CLASSIC' && (
            <div className="pointer-events-auto bg-slate-900/75 backdrop-blur-md border border-white/15 shadow-lg rounded-2xl px-3.5 py-2 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-200">
                  Level {currentLevel}
                </span>
                <span className="text-[10px] text-slate-300 tabular-nums">
                  {levelCatches}/{targetCatches}
                </span>
              </div>
              <div className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (levelCatches / Math.max(1, targetCatches)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Center: Timer */}
        <div className="pointer-events-auto bg-slate-900/75 backdrop-blur-md border border-white/15 shadow-lg rounded-2xl px-4 py-2 flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-200">
            {mode === 'RELAX' ? 'Relax Mode' : 'Time Left'}
          </span>
          <span
            className={`font-cartoon text-xl sm:text-2xl font-bold tabular-nums tracking-wide ${
              isLowTime ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Top Right: Lives, Sound & Pause */}
        <div className="flex items-center gap-2">
          {/* Lives (Hearts / Krabby Patties) */}
          {mode === 'CLASSIC' && (
            <div className="pointer-events-auto bg-slate-900/75 backdrop-blur-md border border-white/15 shadow-lg rounded-2xl px-3 py-2 flex items-center gap-1.5">
              {[1, 2, 3].map((heart) => (
                <div
                  key={heart}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    heart <= lives
                      ? 'scale-100 opacity-100'
                      : 'scale-75 opacity-25 grayscale'
                  }`}
                  title={`${lives} lives remaining`}
                >
                  <span className="text-sm">🍔</span>
                </div>
              ))}
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onToggleSound();
            }}
            aria-label="Toggle sound"
            className="pointer-events-auto p-2.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors shadow-lg active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onPause();
            }}
            aria-label="Pause game"
            className="pointer-events-auto p-2.5 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-white/15 text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors shadow-lg active:scale-95"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </button>
        </div>
      </div>

      {/* Active Power-Ups Row */}
      {powerUps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {powerUps.map((p) => {
            const percent = (p.remaining / p.duration) * 100;
            return (
              <div
                key={p.type}
                className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-amber-400/30 rounded-xl px-2.5 py-1.5 shadow-md"
              >
                {getPowerUpIcon(p.type)}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-200 font-medium">
                    <span>{getPowerUpName(p.type)}</span>
                    <span className="tabular-nums text-amber-300">
                      {Math.ceil(p.remaining)}s
                    </span>
                  </div>
                  <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-amber-400 transition-all duration-100"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
