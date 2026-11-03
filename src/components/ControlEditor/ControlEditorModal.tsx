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
  SlidersHorizontal,
  AlertCircle,
  HelpCircle,
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
  const [showToast, setShowToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

    // Keep comfortably inside container margins (avoid edge clipping)
    const margin = 20;

    if (draggingTarget === 'JOYSTICK') {
      const offsetX = Math.max(margin, Math.min(rect.width - 130, clientX - rect.left - 50));
      const offsetY = Math.max(margin, Math.min(rect.height - 130, rect.bottom - clientY - 50));
      setCurrentLayout((prev) => ({
        ...prev,
        joystickX: Math.round(offsetX),
        joystickY: Math.round(offsetY),
      }));
    } else if (draggingTarget === 'CATCH') {
      const offsetX = Math.max(margin, Math.min(rect.width - 130, rect.right - clientX - 50));
      const offsetY = Math.max(margin, Math.min(rect.height - 130, rect.bottom - clientY - 50));
      setCurrentLayout((prev) => ({
        ...prev,
        catchBtnX: Math.round(offsetX),
        catchBtnY: Math.round(offsetY),
      }));
    }
  };

  const handlePointerUp = () => {
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
        joystickScale: 1.4,
        catchBtnScale: 1.45,
        joystickSize: 'xlarge',
        catchBtnSize: 'xlarge',
        opacity: 0.95,
      });
    } else if (preset === 'LEFTHANDED') {
      // Invert positions: Catch button on left, Joystick on right
      setCurrentLayout({
        ...defaultControlLayout,
        joystickX: 200,
        catchBtnX: 28,
      });
    }
  };

  const handleSave = () => {
    soundManager.playButtonClick();
    onSave(currentLayout);
    setShowToast(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleConfirmReset = () => {
    soundManager.playButtonClick();
    setCurrentLayout({ ...defaultControlLayout });
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-2.5 sm:p-5 select-none touch-auto overflow-hidden safe-area-pad animate-in fade-in duration-200">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-cartoon font-black px-6 py-2.5 rounded-2xl shadow-[0_6px_0_#14532d,0_10px_25px_rgba(0,0,0,0.5)] border-3 border-white flex items-center gap-2 text-sm sm:text-base animate-bounce">
          <Check className="w-5 h-5 stroke-[3]" />
          <span>LAYOUT SAVED SUCCESSFULLY!</span>
        </div>
      )}

      {/* TOP DEDICATED ACTION BAR (Sticky & Always Visible on Mobile & Desktop) */}
      <div className="bg-slate-900/95 border-2 border-amber-400/40 rounded-2xl p-2.5 sm:p-4 mb-2.5 shadow-xl flex flex-col gap-2.5 shrink-0">
        {/* Row 1: Header Title & Mode Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-400 text-slate-950">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-cartoon text-lg sm:text-xl md:text-2xl font-black text-amber-300 leading-none">
                HUD & CONTROLS CUSTOMIZATION
              </h2>
              <span className="text-[10px] sm:text-xs text-sky-200/80 font-medium hidden sm:inline">
                Reposition & resize controls to match your device and thumb grip
              </span>
            </div>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-white/15 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('VISUAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'VISUAL'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Drag to Move
            </button>
            <button
              onClick={() => setActiveTab('SLIDERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'SLIDERS'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Fine Sliders
            </button>
          </div>
        </div>

        {/* Row 2: PRIMARY ACTION BUTTONS (Always on Top!) */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 flex-wrap">
          {/* Main Action Group: SAVE LAYOUT, RESET, CANCEL */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            {/* Primary Save Button (Prominent 3D Cartoon) */}
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial py-2.5 px-5 sm:px-7 rounded-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 border-2 border-white text-slate-950 font-cartoon font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SAVE LAYOUT</span>
            </button>

            {/* Reset to Default Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Reset Default</span>
              <span className="xs:hidden">Reset</span>
            </button>

            {/* Cancel Button */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Presets:</span>
            <button
              onClick={() => applyPreset('DEFAULT')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              Standard
            </button>
            <button
              onClick={() => applyPreset('XLARGE')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
            >
              Extra Large
            </button>
            <button
              onClick={() => applyPreset('LEFTHANDED')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
            >
              Left-Handed
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="font-cartoon text-xl font-black text-amber-300 mb-1">
              RESET TO DEFAULT?
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Reset virtual joystick and catch button to default factory positions and sizing?
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-white/15"
              >
                Keep Current
              </button>
              <button
                onClick={handleConfirmReset}
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-cartoon font-black shadow-[0_2px_0_#78350f]"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MIDDLE SECTION (Visual Drag Workspace or Scrollable Sliders) */}
      {activeTab === 'VISUAL' ? (
        // Interactive Drag Workspace
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative flex-1 min-h-0 bg-slate-900/60 border-2 border-dashed border-amber-400/40 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center justify-between p-3 sm:p-4 touch-none"
        >
          {/* Visual Hint */}
          <div className="text-center text-[11px] sm:text-xs text-sky-200 bg-slate-950/80 px-4 py-1.5 rounded-full border border-white/10 pointer-events-none shadow-md">
            🖐️ Drag the <span className="text-amber-300 font-bold">Joystick</span> and <span className="text-amber-300 font-bold">Catch Button</span>. Tap <span className="text-amber-300 font-black">SAVE LAYOUT</span> above!
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
            className={`absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900/85 border-4 border-amber-400 flex items-center justify-center cursor-move shadow-2xl transition-shadow ${
              draggingTarget === 'JOYSTICK'
                ? 'ring-4 ring-amber-300 scale-105 shadow-amber-400/50'
                : 'hover:border-amber-300'
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-400 border-2 border-white shadow-md flex items-center justify-center text-slate-950">
              <Move className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="absolute -bottom-6 text-[10px] font-bold uppercase text-amber-300 bg-slate-950/85 px-2 py-0.5 rounded-full whitespace-nowrap border border-white/10">
              Joystick ({currentLayout.joystickX}, {currentLayout.joystickY})
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
            className={`absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-4 border-white text-slate-950 flex flex-col items-center justify-center cursor-move shadow-2xl transition-shadow ${
              draggingTarget === 'CATCH'
                ? 'ring-4 ring-yellow-300 scale-105 shadow-amber-400/50'
                : 'hover:scale-102'
            }`}
          >
            <span className="text-xl sm:text-2xl leading-none">🕸️</span>
            <span className="text-[10px] font-black uppercase text-slate-950 leading-tight">
              Catch
            </span>
            <span className="absolute -bottom-6 text-[10px] font-bold uppercase text-amber-300 bg-slate-950/85 px-2 py-0.5 rounded-full whitespace-nowrap border border-white/10">
              Catch ({currentLayout.catchBtnX}, {currentLayout.catchBtnY})
            </span>
          </button>
        </div>
      ) : (
        // Fine Tuning Sliders & Position Steppers (Scrolls independently without moving Top Action Bar)
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-auto max-w-lg mx-auto w-full flex flex-col gap-3 p-1 text-xs sm:text-sm">
          {/* Joystick Scale Slider */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-sm">
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
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-sm">
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
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-sm">
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
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-sm">
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

          {/* Precision Steppers: Fine coordinate adjustment */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2.5 shadow-sm">
            <span className="font-bold text-white">Fine Position Steppers (px offset)</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <span className="text-amber-300 font-bold">Joystick Left Offset</span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentLayout((prev) => ({
                        ...prev,
                        joystickX: Math.max(10, prev.joystickX - 10),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 font-black text-white"
                  >
                    -
                  </button>
                  <span className="tabular-nums font-cartoon text-white">{currentLayout.joystickX}px</span>
                  <button
                    onClick={() =>
                      setCurrentLayout((prev) => ({
                        ...prev,
                        joystickX: prev.joystickX + 10,
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 font-black text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <span className="text-amber-300 font-bold">Catch Right Offset</span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentLayout((prev) => ({
                        ...prev,
                        catchBtnX: Math.max(10, prev.catchBtnX - 10),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 font-black text-white"
                  >
                    -
                  </button>
                  <span className="tabular-nums font-cartoon text-white">{currentLayout.catchBtnX}px</span>
                  <button
                    onClick={() =>
                      setCurrentLayout((prev) => ({
                        ...prev,
                        catchBtnX: prev.catchBtnX + 10,
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 font-black text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
