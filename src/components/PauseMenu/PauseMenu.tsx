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
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none touch-auto safe-area-pad animate-in fade-in duration-200">
      <div className="bg-amber-50 border-4 border-amber-800 rounded-3xl p-5 sm:p-7 max-w-sm w-full shadow-[0_8px_0_#78350f,0_20px_25px_rgba(0,0,0,0.5)] flex flex-col items-center text-center max-h-[88dvh] overflow-y-auto overscroll-contain">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-3 border-amber-800 flex items-center justify-center mb-2 shadow-[0_3px_0_#78350f] shrink-0">
          <span className="text-3xl">⏸️</span>
        </div>

        <h2 className="font-cartoon text-2xl sm:text-3xl font-black text-amber-950 mb-0.5">
          GAME PAUSED
        </h2>
        <p className="text-xs text-amber-900 font-bold mb-4">
          Taking a Krabby Patty break?
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onResume();
            }}
            className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 border-3 border-amber-800 text-amber-950 font-cartoon font-black text-lg flex items-center justify-center gap-2 shadow-[0_4px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Resume Game</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onRestart();
            }}
            className="w-full min-h-[44px] py-2.5 px-5 rounded-2xl bg-sky-200 hover:bg-sky-100 border-2 border-sky-800 text-sky-950 font-cartoon font-black text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#075985] active:translate-y-0.5 active:shadow-[0_1px_0_#075985] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Round</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenSettings();
            }}
            className="w-full min-h-[44px] py-2.5 px-5 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-800 text-amber-950 font-cartoon font-black text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onMainMenu();
            }}
            className="w-full min-h-[44px] py-2.5 px-5 rounded-2xl bg-slate-200 hover:bg-slate-100 border-2 border-slate-700 text-slate-900 font-cartoon font-black text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#334155] active:translate-y-0.5 active:shadow-[0_1px_0_#334155] transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
