import React from 'react';
import { Play, HelpCircle, Settings as SettingsIcon, Info, Trophy, Sparkles, Clock, Smile } from 'lucide-react';
import { GameMode, PlayerStats } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface MainMenuProps {
  stats: PlayerStats;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onPlay: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  selectedMode,
  onSelectMode,
  onPlay,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenAbout,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-sky-950/40 backdrop-blur-[2px]">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧽</span>
          <span className="text-xs uppercase tracking-wider font-bold text-sky-200">
            Bikini Bottom Arcade
          </span>
        </div>

        {/* Quick Best Score Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/15 text-xs text-slate-200 shadow-md">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Best:</span>
          <span className="font-cartoon font-bold text-amber-300 tabular-nums">
            {stats.bestScore}
          </span>
        </div>
      </div>

      {/* Center Title & Game Selection */}
      <div className="flex flex-col items-center justify-center max-w-lg w-full mx-auto text-center my-auto">
        {/* Cartoon Title */}
        <div className="relative mb-6">
          <div className="inline-block px-4 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2 shadow-inner">
            Fan-Made Tribute
          </div>
          <h1 className="font-cartoon text-4xl sm:text-6xl font-extrabold tracking-tight text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] leading-tight">
            SPONGEBOB
          </h1>
          <h2 className="font-cartoon text-2xl sm:text-4xl font-extrabold tracking-normal text-sky-200 drop-shadow-[0_3px_8px_rgba(0,0,0,0.5)] -mt-1 sm:-mt-2">
            JELLYFISH CATCHER
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/90 mt-2 max-w-md mx-auto">
            Grab your net, sprint through Jellyfish Fields, scoop up rare jellyfish, and dodge dangerous electric stings!
          </p>
        </div>

        {/* Game Mode Selector */}
        <div className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-2xl p-1.5 sm:p-2 mb-6 shadow-xl">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onSelectMode('CLASSIC');
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${
                selectedMode === 'CLASSIC'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Classic</span>
              </div>
              <span className="text-[10px] opacity-80 mt-0.5">90s · 3 Lives</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onSelectMode('TIME_ATTACK');
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${
                selectedMode === 'TIME_ATTACK'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Time Attack</span>
              </div>
              <span className="text-[10px] opacity-80 mt-0.5">60s · High Score</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onSelectMode('RELAX');
              }}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${
                selectedMode === 'RELAX'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1 text-xs">
                <Smile className="w-3.5 h-3.5" />
                <span>Relax</span>
              </div>
              <span className="text-[10px] opacity-80 mt-0.5">Endless · Zen</span>
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onPlay();
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-cartoon font-bold text-xl sm:text-2xl shadow-xl shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 border-2 border-white/60"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>PLAY GAME</span>
          </button>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenHowToPlay();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/75 hover:bg-slate-800/80 backdrop-blur-md border border-white/15 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-95"
            >
              <HelpCircle className="w-4 h-4 text-sky-300" />
              <span>How To Play</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenSettings();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/75 hover:bg-slate-800/80 backdrop-blur-md border border-white/15 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-95"
            >
              <SettingsIcon className="w-4 h-4 text-sky-300" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenAbout();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/75 hover:bg-slate-800/80 backdrop-blur-md border border-white/15 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-95"
            >
              <Info className="w-4 h-4 text-sky-300" />
              <span>About</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Stats Strip */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-xs text-slate-300/80 pt-2 border-t border-white/10">
        <div className="flex items-center gap-4">
          <span>
            Total Caught:{' '}
            <strong className="text-white font-cartoon">{stats.totalCaught}</strong>
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">
            Games Played:{' '}
            <strong className="text-white font-cartoon">{stats.gamesPlayed}</strong>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Desktop: <span className="text-slate-300">WASD / Arrows + Space</span> · Mobile: <span className="text-slate-300">Touch Joystick</span>
        </div>
      </div>
    </div>
  );
};
