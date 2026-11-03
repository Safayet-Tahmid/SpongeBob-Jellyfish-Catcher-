import React, { useState, useRef } from 'react';
import {
  X,
  RotateCcw,
  Check,
  Move,
  Maximize2,
  Sliders,
  Smartphone,
  Eye,
  Sparkles,
} from 'lucide-react';
import { CustomControlLayout } from '../../types/game';
import { defaultControlLayout } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

interface ControlEditorModalProps {
  layout: CustomControlLayout;
  onSave: (layout: CustomControlLayout) => void;
  onClose: () => void;
}

export const ControlEditorModal: React.FC<ControlEditorModalProps> = ({
  layout,
  onSave,
  onClose,
}) => {
  const [currentLayout, setCurrentLayout] = useState<CustomControlLayout>({ ...layout });
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'SLIDERS'>('VISUAL');
  const [draggingTarget, setDraggingTarget] = useState<'JOYSTICK' | 'CATCH' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (
    target: 'JOYSTICK' | 'CATCH',
    e: React.PointerEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingTarget(target);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTarget || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (draggingTarget === 'JOYSTICK') {
      const offsetX = Math.max(10, Math.min(rect.width - 120, clientX - rect.left - 40));
      const offsetY = Math.max(10, Math.min(rect.height - 120, rect.bottom - clientY - 40));
      setCurrentLayout((prev) => ({
        ...prev,
        joystickX: Math.round(offsetX),
        joystickY: Math.round(offsetY),
      }));
    } else if (draggingTarget === 'CATCH') {
      const offsetX = Math.max(10, Math.min(rect.width - 120, rect.right - clientX - 40));
      const offsetY = Math.max(10, Math.min(rect.height - 120, rect.bottom - clientY - 40));
      setCurrentLayout((prev) => ({
        ...prev,
        catchBtnX: Math.round(offsetX),
        catchBtnY: Math.round(offsetY),
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTarget) {
      setDraggingTarget(null);
    }
  };

  const applyPreset = (preset: 'DEFAULT' | 'XLARGE' | 'LEFTHANDED') => {
    soundManager.playButtonClick();
    if (preset === 'DEFAULT') {
      setCurrentLayout({ ...defaultControlLayout });
    } else if (preset === 'XLARGE') {
      setCurrentLayout({
        ...defaultControlLayout,
        joystickScale: 1.45,
        catchBtnScale: 1.5,
        joystickSize: 'xlarge',
        catchBtnSize: 'xlarge',
        opacity: 0.95,
      });
    } else if (preset === 'LEFTHANDED') {
      // Invert positions: Catch button on left, Joystick on right
      setCurrentLayout({
        ...defaultControlLayout,
        joystickX: 240,
        catchBtnX: 40,
      });
    }
  };

  const handleSave = () => {
    soundManager.playButtonClick();
    onSave(currentLayout);
    onClose();
  };

  const handleReset = () => {
    soundManager.playButtonClick();
    setCurrentLayout({ ...defaultControlLayout });
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Bar with Title & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-400/30">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h2 className="font-cartoon text-xl sm:text-2xl font-black text-amber-300">
            CUSTOMIZE CONTROLS
          </h2>
        </div>

        {/* Segmented Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-white/15 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('VISUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'VISUAL'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Drag to Move
          </button>
          <button
            onClick={() => setActiveTab('SLIDERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'SLIDERS'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Fine Sliders
          </button>
        </div>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body */}
      {activeTab === 'VISUAL' ? (
        // Interactive Drag Workspace
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex-1 my-3 bg-slate-900/60 border-2 border-dashed border-amber-400/40 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-4 touch-none"
        >
          <div className="text-center text-xs text-sky-200/80 bg-slate-950/70 px-4 py-2 rounded-full border border-white/10 mb-auto pointer-events-none">
            🖐️ Drag the <span className="text-amber-300 font-bold">Joystick</span> and <span className="text-amber-300 font-bold">Catch Button</span> anywhere on screen to reposition!
          </div>

          {/* Draggable Virtual Joystick */}
          <div
            onPointerDown={(e) => handlePointerDown('JOYSTICK', e)}
            style={{
              left: `${currentLayout.joystickX}px`,
              bottom: `${currentLayout.joystickY}px`,
              transform: `scale(${currentLayout.joystickScale})`,
              opacity: currentLayout.opacity,
            }}
            className={`absolute w-28 h-28 rounded-full bg-slate-900/80 border-4 border-amber-400 flex items-center justify-center cursor-move shadow-2xl transition-shadow ${
              draggingTarget === 'JOYSTICK'
                ? 'ring-4 ring-amber-300 scale-105'
                : 'hover:border-amber-300'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-sky-400 border-2 border-white shadow-md flex items-center justify-center text-slate-950">
              <Move className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-6 text-[10px] font-bold uppercase text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full whitespace-nowrap">
              Joystick
            </span>
          </div>

          {/* Draggable Catch Button */}
          <button
            onPointerDown={(e) => handlePointerDown('CATCH', e)}
            style={{
              right: `${currentLayout.catchBtnX}px`,
              bottom: `${currentLayout.catchBtnY}px`,
              transform: `scale(${currentLayout.catchBtnScale})`,
              opacity: currentLayout.opacity,
            }}
            className={`absolute w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-4 border-white text-slate-950 flex flex-col items-center justify-center cursor-move shadow-2xl transition-shadow ${
              draggingTarget === 'CATCH'
                ? 'ring-4 ring-yellow-300 scale-105'
                : 'hover:scale-102'
            }`}
          >
            <span className="text-2xl">🕸️</span>
            <span className="text-[10px] font-black uppercase text-slate-950">
              Catch
            </span>
            <span className="absolute -bottom-6 text-[10px] font-bold uppercase text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full whitespace-nowrap">
              Catch Button
            </span>
          </button>
        </div>
      ) : (
        // Fine Tuning Sliders & Steppers
        <div className="flex-1 my-3 bg-slate-900/80 border border-white/10 rounded-3xl p-4 sm:p-6 overflow-y-auto max-w-lg mx-auto w-full flex flex-col gap-4 text-xs sm:text-sm">
          {/* Joystick Scale Slider */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-sky-400" />
                Joystick Size Scale
              </span>
              <span className="font-cartoon text-amber-300 font-bold tabular-nums">
                {Math.round(currentLayout.joystickScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.6"
              step="0.05"
              value={currentLayout.joystickScale}
              onChange={(e) =>
                setCurrentLayout({
                  ...currentLayout,
                  joystickScale: parseFloat(e.target.value),
                })
              }
              className="w-full accent-amber-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Catch Button Scale Slider */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-amber-400" />
                Catch Button Size Scale
              </span>
              <span className="font-cartoon text-amber-300 font-bold tabular-nums">
                {Math.round(currentLayout.catchBtnScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.6"
              step="0.05"
              value={currentLayout.catchBtnScale}
              onChange={(e) =>
                setCurrentLayout({
                  ...currentLayout,
                  catchBtnScale: parseFloat(e.target.value),
                })
              }
              className="w-full accent-amber-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Control Opacity Slider */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                Controls Opacity
              </span>
              <span className="font-cartoon text-amber-300 font-bold tabular-nums">
                {Math.round(currentLayout.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="1.0"
              step="0.05"
              value={currentLayout.opacity}
              onChange={(e) =>
                setCurrentLayout({
                  ...currentLayout,
                  opacity: parseFloat(e.target.value),
                })
              }
              className="w-full accent-amber-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* HUD Scale Slider */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-400" />
                HUD Interface Scale
              </span>
              <span className="font-cartoon text-amber-300 font-bold tabular-nums">
                {Math.round(currentLayout.hudScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={currentLayout.hudScale}
              onChange={(e) =>
                setCurrentLayout({
                  ...currentLayout,
                  hudScale: parseFloat(e.target.value),
                })
              }
              className="w-full accent-amber-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Quick Layout Presets Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap py-2 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
          <button
            onClick={() => applyPreset('DEFAULT')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Standard
          </button>
          <button
            onClick={() => applyPreset('XLARGE')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition-colors"
          >
            Extra Large
          </button>
          <button
            onClick={() => applyPreset('LEFTHANDED')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 transition-colors"
          >
            Left-Handed
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Layout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
