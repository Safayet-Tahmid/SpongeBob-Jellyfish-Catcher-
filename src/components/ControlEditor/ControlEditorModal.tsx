import React, { useState, useRef } from 'react';
import {
  X,
  RotateCcw,
  Check,
  Smartphone,
  Eye,
  SlidersHorizontal,
  Hand,
  Sparkles,
  Zap,
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
  const [activeTab, setActiveTab] = useState<'PLAYGROUND' | 'SETTINGS'>('PLAYGROUND');
  const [showToast, setShowToast] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Playground interactive test state
  const [testTouchPos, setTestTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [testTapMessage, setTestTapMessage] = useState<string | null>(null);
  const [testIsDragging, setTestIsDragging] = useState(false);
  const playgroundStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePlaygroundDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    playgroundStartRef.current = { x, y, time: performance.now() };
    setTestTouchPos({ x, y });
    setTestIsDragging(false);
  };

  const handlePlaygroundMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playgroundStartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - playgroundStartRef.current.x;
    const dy = y - playgroundStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 12) {
      setTestIsDragging(true);
      setTestTouchPos({ x, y });
    }
  };

  const handlePlaygroundUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playgroundStartRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const elapsed = performance.now() - playgroundStartRef.current.time;
    const dx = x - playgroundStartRef.current.x;
    const dy = y - playgroundStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (!testIsDragging && dist <= 12 && elapsed <= 320) {
      soundManager.playNetSwing();
      setTestTapMessage('Net Swing! (Catch gesture)');
      setTimeout(() => setTestTapMessage(null), 800);
    }

    playgroundStartRef.current = null;
    setTestTouchPos(null);
    setTestIsDragging(false);
  };

  const applyPreset = (preset: 'BALANCED' | 'HIGH' | 'CASUAL') => {
    soundManager.playButtonClick('mode');
    if (preset === 'BALANCED') {
      setCurrentLayout({
        ...defaultControlLayout,
        hudScale: 1.0,
        opacity: 0.9,
      });
    } else if (preset === 'HIGH') {
      setCurrentLayout({
        ...defaultControlLayout,
        hudScale: 1.1,
        opacity: 1.0,
      });
    } else if (preset === 'CASUAL') {
      setCurrentLayout({
        ...defaultControlLayout,
        hudScale: 0.95,
        opacity: 0.8,
      });
    }
  };

  const handleSave = () => {
    soundManager.playButtonClick('save');
    onSave(currentLayout);
    setShowToast(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleConfirmReset = () => {
    soundManager.playButtonClick('reset');
    setCurrentLayout({ ...defaultControlLayout });
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-2.5 sm:p-5 select-none touch-auto overflow-hidden safe-area-pad animate-in fade-in duration-200">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-cartoon font-black px-6 py-2.5 rounded-2xl shadow-[0_6px_0_#14532d,0_10px_25px_rgba(0,0,0,0.5)] border-3 border-white flex items-center gap-2 text-sm sm:text-base animate-bounce">
          <Check className="w-5 h-5 stroke-[3]" />
          <span>PREFERENCES SAVED SUCCESSFULLY!</span>
        </div>
      )}

      {/* TOP ACTION BAR (Sticky & Always Visible) */}
      <div className="bg-slate-900/95 border-2 border-amber-400/40 rounded-2xl p-2.5 sm:p-4 mb-2.5 shadow-xl flex flex-col gap-2.5 shrink-0">
        {/* Row 1: Header Title & Mode Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-400 text-slate-950">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-cartoon text-lg sm:text-xl md:text-2xl font-black text-amber-300 leading-none">
                TOUCH CONTROLS & HUD
              </h2>
              <span className="text-[10px] sm:text-xs text-sky-200/80 font-medium hidden sm:inline">
                Full-Screen Touchscreen Gestures · HUD Sizing
              </span>
            </div>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-white/15 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('PLAYGROUND')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'PLAYGROUND'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Test Gestures
            </button>
            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SETTINGS'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              HUD & Display
            </button>
          </div>
        </div>

        {/* Row 2: Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 flex-wrap">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial py-2 px-5 sm:px-7 rounded-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 border-2 border-white text-slate-950 font-cartoon font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#78350f] active:translate-y-0.5 active:shadow-[0_1px_0_#78350f] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SAVE SETTINGS</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="py-2 px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="py-2 px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Presets:</span>
            <button
              onClick={() => applyPreset('BALANCED')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              Standard
            </button>
            <button
              onClick={() => applyPreset('HIGH')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-amber-300 transition-colors cursor-pointer"
            >
              Large HUD
            </button>
            <button
              onClick={() => applyPreset('CASUAL')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
            >
              Compact HUD
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
              RESET PREFERENCES?
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Reset touch sensitivity and HUD scaling to default settings?
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-white/15 cursor-pointer"
              >
                Keep Current
              </button>
              <button
                onClick={handleConfirmReset}
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-cartoon font-black shadow-[0_2px_0_#78350f] cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MIDDLE SECTION */}
      {activeTab === 'PLAYGROUND' ? (
        <div
          onPointerDown={handlePlaygroundDown}
          onPointerMove={handlePlaygroundMove}
          onPointerUp={handlePlaygroundUp}
          onPointerCancel={handlePlaygroundUp}
          className="relative flex-1 min-h-0 bg-slate-900/60 border-2 border-dashed border-amber-400/40 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center justify-between p-3 sm:p-5 touch-none cursor-crosshair select-none"
        >
          {/* Header Card */}
          <div className="bg-slate-950/90 border border-amber-400/30 rounded-2xl px-4 py-2.5 max-w-md w-full text-center shadow-lg pointer-events-none">
            <span className="font-cartoon text-amber-300 text-sm sm:text-base font-black block">
              ✨ Full-Screen Touch Active!
            </span>
            <p className="text-[11px] sm:text-xs text-sky-200 mt-0.5 leading-relaxed">
              <strong>Drag anywhere</strong> to swim SpongeBob. <strong>Tap anywhere</strong> to swing the net. Test it here!
            </p>
          </div>

          {/* Dynamic Gesture Feedback */}
          <div className="pointer-events-none flex flex-col items-center my-auto">
            {testTapMessage ? (
              <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-cartoon font-black px-5 py-2 rounded-2xl border-2 border-white shadow-xl animate-bounce flex items-center gap-2 text-sm sm:text-base">
                <span className="text-xl">🕸️</span>
                <span>{testTapMessage}</span>
              </div>
            ) : testIsDragging ? (
              <div className="bg-sky-500/20 text-sky-200 font-cartoon font-bold px-4 py-1.5 rounded-full border border-sky-400/40 text-xs sm:text-sm flex items-center gap-2 animate-pulse">
                <Hand className="w-4 h-4 text-sky-300" />
                <span>Dragging: SpongeBob Swimming!</span>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs flex flex-col items-center gap-1 opacity-70">
                <span className="text-2xl">🖐️</span>
                <span>Try tapping or dragging in this test box</span>
              </div>
            )}
          </div>

          {/* Test Pointer Visual */}
          {testTouchPos && (
            <div
              style={{
                left: `${testTouchPos.x}px`,
                top: `${testTouchPos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-none w-12 h-12 rounded-full border-2 border-sky-300 bg-sky-400/30 shadow-[0_0_15px_rgba(56,189,248,0.6)] flex items-center justify-center animate-ping"
            />
          )}

          {/* Bottom Info Footer */}
          <div className="text-[11px] text-slate-400 text-center pointer-events-none">
            No virtual joystick or buttons clutter your view during real gameplay!
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-auto max-w-lg mx-auto w-full flex flex-col gap-3 p-1 text-xs sm:text-sm">
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
            <span className="text-[10px] text-slate-400">
              Adjust size of the score, timer, and life indicators.
            </span>
          </div>

          {/* Controls / HUD Opacity Slider */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                Interface Opacity
              </span>
              <span className="font-cartoon text-amber-300 font-bold tabular-nums">
                {Math.round(currentLayout.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
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

          {/* Full Screen Gestures Feature Highlights */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-sm">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Full-Screen Touch Controls System
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl">
                <span className="text-base">🌊</span>
                <div>
                  <strong className="text-amber-300 block">Touch & Drag Anywhere</strong>
                  <span>Drag across any part of the screen to guide SpongeBob. Floating dynamic anchor guarantees instant directional response.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl">
                <span className="text-base">🕸️</span>
                <div>
                  <strong className="text-amber-300 block">Single Tap to Catch</strong>
                  <span>Quick tap anywhere on the water swings your jellyfish net.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl">
                <span className="text-base">✌️</span>
                <div>
                  <strong className="text-amber-300 block">Multi-Touch Ready</strong>
                  <span>Swim with one thumb while tapping with the other, or play single-handed.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
