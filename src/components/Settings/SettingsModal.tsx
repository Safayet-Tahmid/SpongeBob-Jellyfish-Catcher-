import React from 'react';
import { X, Volume2, VolumeX, Sliders, Smartphone, Eye } from 'lucide-react';
import { GameSettings } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="font-cartoon text-2xl font-bold text-amber-300">
              SETTINGS
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            aria-label="Close settings"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex flex-col gap-4 py-4 text-xs sm:text-sm">
          {/* Music Toggle & Volume */}
          <div className="flex flex-col gap-2 bg-slate-800/50 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                Background Music
              </span>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ musicEnabled: !settings.musicEnabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.musicEnabled ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {settings.musicEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] text-slate-400 w-12">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) =>
                    onUpdateSettings({ musicVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 tabular-nums w-8 text-right">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Sound Effects Toggle & Volume */}
          <div className="flex flex-col gap-2 bg-slate-800/50 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Sound Effects
              </span>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  onUpdateSettings({ sfxEnabled: !settings.sfxEnabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.sfxEnabled ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {settings.sfxEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] text-slate-400 w-12">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) =>
                    onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-slate-300 tabular-nums w-8 text-right">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Motion & Accessibility */}
          <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Reduced Motion
              </span>
              <span className="text-[10px] text-slate-400">
                Minimizes background animations and shaking
              </span>
            </div>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onUpdateSettings({ reducedMotion: !settings.reducedMotion });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.reducedMotion ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Mobile Joystick Size */}
          <div className="flex flex-col gap-2 bg-slate-800/50 p-3 rounded-2xl border border-white/5">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              Mobile Touch Controls Size
            </span>
            <div className="grid grid-cols-3 gap-1.5 mt-1">
              {(['small', 'medium', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    soundManager.playButtonClick();
                    onUpdateSettings({ joystickSize: s });
                  }}
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    settings.joystickSize === s
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
