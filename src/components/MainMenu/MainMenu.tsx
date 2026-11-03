import React from 'react';
import {
  Play,
  HelpCircle,
  Settings as SettingsIcon,
  Info,
  Trophy,
  Sparkles,
  Clock,
  Smile,
  Sliders,
} from 'lucide-react';
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
  onOpenControlEditor: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  selectedMode,
  onSelectMode,
  onPlay,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenAbout,
  onOpenControlEditor,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between overflow-y-auto overscroll-contain touch-auto p-3 sm:p-6 pt-[max(1rem,env(safe-area-inset-top,1rem))] pb-[max(1rem,env(safe-area-inset-bottom,1rem))] pl-[max(1rem,env(safe-area-inset-left,1rem))] pr-[max(1rem,env(safe-area-inset-right,1rem))] bg-sky-950/40 select-none">
      {/* Top Header Strip (Safely away from notch and top bezel) */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-2 bg-amber-100/90 border-2 border-amber-800 px-3 py-1 rounded-full shadow-[0_3px_0_#78350f]">
          <span className="text-base sm:text-lg">🧽</span>
          <span className="font-cartoon text-xs font-black uppercase tracking-wider text-amber-950">
            Bikini Bottom Arcade
          </span>
        </div>

        {/* High Score Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 border-2 border-amber-800 text-xs text-amber-950 font-black shadow-[0_3px_0_#78350f]">
          <Trophy className="w-3.5 h-3.5 text-amber-900 fill-current" />
          <span>High Score:</span>
          <span className="font-cartoon text-sm sm:text-base text-amber-950 tabular-nums">
            {stats.bestScore}
          </span>
        </div>
      </div>

      {/* Center Title & Game Selection (Centered within safe viewport) */}
      <div className="flex flex-col items-center justify-center max-w-md w-full mx-auto text-center my-auto py-3 sm:py-6">
        {/* 2000s Cartoon Title Banner */}
        <div className="relative mb-3 sm:mb-5">
          <div className="inline-block px-3.5 py-1 rounded-full bg-yellow-300 border-2 border-amber-800 text-amber-950 text-[11px] sm:text-xs font-black uppercase tracking-widest mb-1.5 shadow-[0_2px_0_#78350f]">
            Classic Cartoon Arcade
          </div>
          <h1 className="font-cartoon text-4xl sm:text-5xl md:text-6xl font-black tracking-normal text-amber-300 drop-shadow-[0_4px_0_#78350f] stroke-text leading-tight">
            SPONGEBOB
          </h1>
          <h2 className="font-cartoon text-2xl sm:text-3xl md:text-4xl font-black tracking-normal text-sky-200 drop-shadow-[0_3px_0_#075985] -mt-1">
            JELLYFISH CATCHER
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/95 font-medium mt-1.5 max-w-xs sm:max-w-sm mx-auto drop-shadow leading-relaxed">
            Run, swim, and catch jellyfish in Jellyfish Fields! Avoid electric shocks and scoop up bonus power-ups!
          </p>
        </div>

        {/* 2000s Game Mode Selector Buttons */}
        <div className="w-full bg-amber-50/95 border-3 border-amber-800 rounded-2xl p-1.5 sm:p-2 mb-3.5 shadow-[0_4px_0_#78350f]">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                soundManager.playButtonClick('mode');
                onSelectMode('CLASSIC');
              }}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                selectedMode === 'CLASSIC'
                  ? 'bg-amber-400 text-amber-950 font-black border-2 border-amber-800 shadow-[0_3px_0_#78350f] -translate-y-0.5'
                  : 'text-amber-900 font-bold hover:bg-amber-200/60'
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
                soundManager.playButtonClick('mode');
                onSelectMode('TIME_ATTACK');
              }}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                selectedMode === 'TIME_ATTACK'
                  ? 'bg-amber-400 text-amber-950 font-black border-2 border-amber-800 shadow-[0_3px_0_#78350f] -translate-y-0.5'
                  : 'text-amber-900 font-bold hover:bg-amber-200/60'
              }`}
            >
              <div className="flex items-center gap-1 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Time Attack</span>
              </div>
              <span className="text-[10px] opacity-80 mt-0.5">60s · Blitz</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick('mode');
                onSelectMode('RELAX');
              }}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all cursor-pointer ${
                selectedMode === 'RELAX'
                  ? 'bg-amber-400 text-amber-950 font-black border-2 border-amber-800 shadow-[0_3px_0_#78350f] -translate-y-0.5'
                  : 'text-amber-900 font-bold hover:bg-amber-200/60'
              }`}
            >
              <div className="flex items-center gap-1 text-xs">
                <Smile className="w-3.5 h-3.5" />
                <span>Relax</span>
              </div>
              <span className="text-[10px] opacity-80 mt-0.5">Zen Endless</span>
            </button>
          </div>
        </div>

        {/* Big Cartoon Play Button (Classic 3D Press Down) */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playButtonClick('save');
              onPlay();
            }}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 border-4 border-white text-slate-950 font-cartoon font-black text-2xl sm:text-3xl shadow-[0_5px_0_#78350f] active:translate-y-1 active:shadow-[0_1px_0_#78350f] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            <span>PLAY GAME!</span>
          </button>

          {/* Secondary Action Grid: 44px min height for touch comfort */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenControlEditor();
              }}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-sky-200 hover:bg-sky-100 border-2 border-sky-800 text-sky-950 font-cartoon text-xs font-black shadow-[0_3px_0_#075985] active:translate-y-0.5 active:shadow-[0_1px_0_#075985] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Controls</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenHowToPlay();
              }}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-50 border-2 border-amber-800 text-amber-950 font-cartoon text-xs font-black shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How To Play</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenSettings();
              }}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-50 border-2 border-amber-800 text-amber-950 font-cartoon text-xs font-black shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onOpenAbout();
              }}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-amber-100 hover:bg-amber-50 border-2 border-amber-800 text-amber-950 font-cartoon text-xs font-black shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Footer Stats Strip (Protected from home indicator & bottom bezel) */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between text-xs text-sky-100/80 pt-2 border-t border-white/15 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span>
            Total Caught:{' '}
            <strong className="text-amber-300 font-cartoon text-sm">{stats.totalCaught}</strong>
          </span>
          <span>·</span>
          <span>
            Games Played:{' '}
            <strong className="text-amber-300 font-cartoon text-sm">{stats.gamesPlayed}</strong>
          </span>
        </div>

        <div className="text-[11px] text-sky-200">
          Desktop: <span className="text-white font-bold">WASD / Space</span> · Mobile: <span className="text-white font-bold">Touch Joystick & Net</span>
        </div>
      </div>
    </div>
  );
};
