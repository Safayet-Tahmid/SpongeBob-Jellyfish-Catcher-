import React from 'react';
import { X, Volume2, VolumeX, Sliders, Smartphone, Eye, SlidersHorizontal } from 'lucide-react';
import { GameSettings } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onOpenControlEditor: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onOpenControlEditor,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-amber-50 border-4 border-amber-800 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-[0_8px_0_#78350f] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-800/20">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-800" />
            <h2 className="font-cartoon text-2xl font-black text-amber-950">
              SETTINGS
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            aria-label="Close settings"
            className="p-1.5 rounded-full hover:bg-amber-200/60 text-amber-900 transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-3.5 py-4 text-xs sm:text-sm">
          {/* Dedicated Control Editor Banner */}
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onOpenControlEditor();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 border-3 border-sky-800 text-sky-950 font-cartoon font-black text-sm sm:text-base shadow-[0_4px_0_#075985] active:translate-y-0.5 active:shadow-[0_1px_0_#075985] flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              <span>CUSTOMIZE CONTROLS</span>
            </span>
            <span className="text-[11px] bg-sky-100 text-sky-950 px-2 py-0.5 rounded-full border border-sky-800 font-bold">
              Position & Size
            </span>
          </button>

          {/* Music Toggle & Volume */}
          <div className="flex flex-col gap-2 bg-amber-100/70 p-3 rounded-2xl border-2 border-amber-800/30">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-950 flex items-center gap-2 font-cartoon text-sm">
                <Volume2 className="w-4 h-4 text-amber-800" />
                Background Music
              </span>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ musicEnabled: !settings.musicEnabled });
                }}
                className={`w-12 h-6 rounded-full border-2 border-amber-800 transition-colors relative p-0.5 ${
                  settings.musicEnabled ? 'bg-amber-400' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white border border-amber-900 transition-transform ${
                    settings.musicEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {settings.musicEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] font-bold text-amber-900 w-12">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) =>
                    onUpdateSettings({ musicVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-black text-amber-950 tabular-nums w-8 text-right">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Sound Effects Toggle & Volume */}
          <div className="flex flex-col gap-2 bg-amber-100/70 p-3 rounded-2xl border-2 border-amber-800/30">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-950 flex items-center gap-2 font-cartoon text-sm">
                <Volume2 className="w-4 h-4 text-amber-800" />
                Sound Effects
              </span>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ sfxEnabled: !settings.sfxEnabled });
                }}
                className={`w-12 h-6 rounded-full border-2 border-amber-800 transition-colors relative p-0.5 ${
                  settings.sfxEnabled ? 'bg-amber-400' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white border border-amber-900 transition-transform ${
                    settings.sfxEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {settings.sfxEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] font-bold text-amber-900 w-12">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) =>
                    onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-600 h-2 bg-amber-200 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-black text-amber-950 tabular-nums w-8 text-right">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Motion & Accessibility */}
          <div className="flex items-center justify-between bg-amber-100/70 p-3 rounded-2xl border-2 border-amber-800/30">
            <div className="flex flex-col">
              <span className="font-black text-amber-950 flex items-center gap-2 font-cartoon text-sm">
                <Eye className="w-4 h-4 text-amber-800" />
                Reduced Motion
              </span>
              <span className="text-[10px] text-amber-800/80 font-medium">
                Minimizes screen shaking and background animations
              </span>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onUpdateSettings({ reducedMotion: !settings.reducedMotion });
              }}
              className={`w-12 h-6 rounded-full border-2 border-amber-800 transition-colors relative p-0.5 ${
                settings.reducedMotion ? 'bg-amber-400' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white border border-amber-900 transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t-2 border-amber-800/20 flex justify-end">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-800 text-amber-950 font-cartoon font-black text-sm shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
