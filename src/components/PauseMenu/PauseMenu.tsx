import React from 'react';
import { Play, RotateCcw, Settings as SettingsIcon, Home } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3">
          <span className="text-2xl">⏸️</span>
        </div>

        <h2 className="font-cartoon text-3xl font-extrabold text-amber-300">
          GAME PAUSED
        </h2>
        <p className="text-xs text-sky-200/80 mb-6">
          Taking a Krabby Patty break?
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onResume();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold flex items-center justify-center gap-2 border border-white/10 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-sky-300" />
            <span>Restart Round</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenSettings();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold flex items-center justify-center gap-2 border border-white/10 active:scale-98 transition-all"
          >
            <SettingsIcon className="w-4 h-4 text-sky-300" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-2 border border-white/10 active:scale-98 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
