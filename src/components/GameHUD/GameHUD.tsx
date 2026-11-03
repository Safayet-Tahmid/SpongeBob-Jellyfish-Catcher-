import React, { useEffect, useState } from 'react';
import { Pause, Volume2, VolumeX, Sparkles, Shield, Zap, Magnet, Gauge } from 'lucide-react';
import { CustomControlLayout, GameMode, PowerUpActive, PowerUpType } from '../../types/game';
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
  layout?: CustomControlLayout;
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
  layout,
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
        return <Sparkles className="w-4 h-4 text-amber-500 fill-current" />;
      case 'SPEED_BOOST':
        return <Zap className="w-4 h-4 text-yellow-500 fill-current" />;
      case 'MAGNET':
        return <Magnet className="w-4 h-4 text-rose-500" />;
      case 'BUBBLE_SHIELD':
        return <Shield className="w-4 h-4 text-sky-500 fill-current" />;
      case 'DOUBLE_POINTS':
        return <Gauge className="w-4 h-4 text-emerald-600" />;
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
  const hudScale = layout?.hudScale || 1.0;

  return (
    <div
      style={{ transform: `scale(${hudScale})`, transformOrigin: 'top center' }}
      className="absolute inset-x-0 top-0 pointer-events-none z-20 p-2.5 sm:p-4 flex flex-col gap-2 transition-transform duration-100"
    >
      {/* Top Main Arcade Status Bar */}
      <div className="flex items-center justify-between gap-2.5 max-w-5xl mx-auto w-full">
        {/* Top Left: Score & Level */}
        <div className="flex items-center gap-2">
          {/* 2000s Cartoon Arcade Score Box */}
          <div className="pointer-events-auto bg-amber-100 border-3 border-amber-800 shadow-[0_4px_0_#78350f] rounded-2xl px-3 sm:px-4 py-1.5 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 leading-none">
              Score
            </span>
            <span
              className={`font-cartoon text-xl sm:text-2xl font-black text-amber-950 transition-transform duration-150 tabular-nums ${
                isPopping ? 'scale-125 text-amber-700' : 'scale-100'
              }`}
            >
              {score}
            </span>
          </div>

          {/* Level Progress */}
          {mode === 'CLASSIC' && (
            <div className="pointer-events-auto bg-sky-100 border-3 border-sky-800 shadow-[0_4px_0_#075985] rounded-2xl px-3 py-1.5 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-950 leading-none">
                  Lvl {currentLevel}
                </span>
                <span className="text-[10px] font-bold text-sky-900 tabular-nums leading-none">
                  {levelCatches}/{targetCatches}
                </span>
              </div>
              <div className="w-14 sm:w-18 h-2 bg-sky-200 border border-sky-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (levelCatches / Math.max(1, targetCatches)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top Center: Nautical Arcade Timer */}
        <div className="pointer-events-auto bg-amber-50 border-3 border-amber-800 shadow-[0_4px_0_#78350f] rounded-2xl px-4 py-1.5 flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 leading-none">
            {mode === 'RELAX' ? 'Relax Mode' : 'Time Left'}
          </span>
          <span
            className={`font-cartoon text-xl sm:text-2xl font-black tabular-nums tracking-wide ${
              isLowTime ? 'text-red-600 animate-pulse' : 'text-slate-900'
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Top Right: Lives, Sound & Pause */}
        <div className="flex items-center gap-2">
          {/* Krabby Patty Lives */}
          {mode === 'CLASSIC' && (
            <div className="pointer-events-auto bg-amber-100 border-3 border-amber-800 shadow-[0_4px_0_#78350f] rounded-2xl px-2.5 py-1.5 flex items-center gap-1">
              {[1, 2, 3].map((heart) => (
                <div
                  key={heart}
                  className={`w-6 h-6 flex items-center justify-center transition-all ${
                    heart <= lives
                      ? 'scale-100 opacity-100 drop-shadow'
                      : 'scale-75 opacity-25 grayscale'
                  }`}
                  title={`${lives} lives remaining`}
                >
                  <span className="text-base sm:text-lg select-none">🍔</span>
                </div>
              ))}
            </div>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onToggleSound();
            }}
            aria-label="Toggle sound"
            className="pointer-events-auto p-2 sm:p-2.5 rounded-2xl bg-amber-400 border-3 border-amber-800 shadow-[0_3px_0_#78350f] text-slate-950 hover:bg-amber-300 active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onPause();
            }}
            aria-label="Pause game"
            className="pointer-events-auto p-2 sm:p-2.5 rounded-2xl bg-amber-400 border-3 border-amber-800 shadow-[0_3px_0_#78350f] text-slate-950 hover:bg-amber-300 active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-current" />
          </button>
        </div>
      </div>

      {/* Active Power-Ups Row (Cartoon Badges) */}
      {powerUps.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap max-w-5xl mx-auto w-full mt-1">
          {powerUps.map((p) => {
            const percent = (p.remaining / p.duration) * 100;
            return (
              <div
                key={p.type}
                className="pointer-events-auto flex items-center gap-2 bg-yellow-100 border-2 border-amber-800 shadow-[0_2px_0_#78350f] rounded-xl px-2.5 py-1"
              >
                {getPowerUpIcon(p.type)}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 text-[10px] text-amber-950 font-black">
                    <span>{getPowerUpName(p.type)}</span>
                    <span className="tabular-nums text-amber-700">
                      {Math.ceil(p.remaining)}s
                    </span>
                  </div>
                  <div className="w-16 h-1.5 bg-yellow-200 border border-amber-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full bg-amber-500 transition-all duration-100"
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
