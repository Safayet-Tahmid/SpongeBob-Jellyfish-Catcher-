import React from 'react';
import { X, HelpCircle, Sparkles, Shield, Zap, Gauge, Keyboard, Check } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none touch-auto safe-area-pad animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-4 border-amber-800 rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-[0_12px_0_#78350f,0_25px_30px_rgba(0,0,0,0.6)] flex flex-col max-h-[85dvh] overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-400 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-400 border-2 border-amber-600 text-amber-950">
              <HelpCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="font-cartoon text-xl sm:text-2xl md:text-3xl font-black text-amber-950 drop-shadow-[0_2px_0_#fef08a] uppercase tracking-wide">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            aria-label="Close how to play"
            className="w-9 h-9 rounded-full bg-amber-300 hover:bg-amber-400 text-amber-950 border-2 border-amber-700 shadow-[0_2px_0_#78350f] flex items-center justify-center transition-all cursor-pointer active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Guide */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-auto flex flex-col gap-4 py-3 pr-1 text-xs sm:text-sm">
          {/* Controls Section */}
          <div>
            <h3 className="font-cartoon text-sm sm:text-base text-amber-950 font-bold mb-2 flex items-center gap-2 uppercase tracking-wide">
              <Keyboard className="w-4 h-4 text-amber-800" />
              Game Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-amber-50/90 p-3 rounded-2xl border-2 border-amber-500 shadow-sm">
                <span className="font-cartoon font-bold text-amber-950 block mb-1">🖥️ Desktop / Keyboard:</span>
                <p className="text-amber-900 leading-relaxed">
                  <span className="bg-amber-200 px-1 py-0.5 rounded font-bold text-amber-950 border border-amber-400">WASD</span> or{' '}
                  <span className="bg-amber-200 px-1 py-0.5 rounded font-bold text-amber-950 border border-amber-400">Arrow Keys</span> to swim.
                  <br />
                  <span className="bg-amber-200 px-1 py-0.5 rounded font-bold text-amber-950 border border-amber-400">Spacebar</span> or click to swing net!
                </p>
              </div>
              <div className="bg-amber-50/90 p-3 rounded-2xl border-2 border-amber-500 shadow-sm">
                <span className="font-cartoon font-bold text-amber-950 block mb-1">📱 Mobile / Touchscreen:</span>
                <p className="text-amber-900 leading-relaxed">
                  <span className="font-bold text-amber-950">Touch & Drag</span> anywhere on screen to swim.
                  <br />
                  <span className="font-bold text-amber-950">Single Tap</span> anywhere on screen to swing net!
                  <br />
                  <span className="text-[10px] text-amber-700 italic font-semibold">✨ Full-screen freedom — no on-screen buttons blocking your view!</span>
                </p>
              </div>
            </div>
          </div>

          {/* Jellyfish Varieties */}
          <div>
            <h3 className="font-cartoon text-sm sm:text-base text-amber-950 font-bold mb-2 uppercase tracking-wide">
              Jellyfish Varieties
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 bg-amber-50/90 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-pink-100 border-2 border-pink-400 flex items-center justify-center shrink-0 text-sm">
                  🌸
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-cartoon font-bold text-pink-700">Pink Jellyfish</span>
                    <span className="font-cartoon text-amber-700 font-extrabold">+10 pts</span>
                  </div>
                  <span className="text-[11px] text-amber-900 font-medium">Gentle and common swimmers. Easy catches!</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50/90 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-sky-100 border-2 border-sky-400 flex items-center justify-center shrink-0 text-sm">
                  💧
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-cartoon font-bold text-sky-700">Blue Jellyfish</span>
                    <span className="font-cartoon text-amber-700 font-extrabold">+20 pts</span>
                  </div>
                  <span className="text-[11px] text-amber-900 font-medium">Fast and darting swimmer. Time your swings!</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50/90 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center shrink-0 text-sm">
                  ✨
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-cartoon font-bold text-amber-700">Golden Jellyfish</span>
                    <span className="font-cartoon text-amber-700 font-extrabold">+50 pts</span>
                  </div>
                  <span className="text-[11px] text-amber-900 font-medium">Rare sparkling prize! Triggers victory fanfare.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-red-50/90 p-2.5 rounded-2xl border-2 border-red-400 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-red-100 border-2 border-red-500 flex items-center justify-center shrink-0 text-sm">
                  ⚡
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-cartoon font-black text-red-700">Electric Jellyfish</span>
                    <span className="font-cartoon text-red-700 font-black">HAZARD!</span>
                  </div>
                  <span className="text-[11px] text-red-950 font-medium">Avoid contact! Shocks SpongeBob and costs 1 Krabby Patty life.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-purple-50/90 p-2.5 rounded-2xl border-2 border-purple-400 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-100 border-2 border-purple-400 flex items-center justify-center shrink-0 text-sm">
                  🌈
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-cartoon font-bold text-purple-700">Rainbow Jellyfish</span>
                    <span className="font-cartoon text-purple-700 font-extrabold">+100 pts</span>
                  </div>
                  <span className="text-[11px] text-purple-950 font-medium">Ultra-rare trophy with shifting iridescent spectrum aura!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Power-Ups */}
          <div>
            <h3 className="font-cartoon text-sm sm:text-base text-amber-950 font-bold mb-2 uppercase tracking-wide">
              Collectible Power-Ups
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-amber-50/90 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-cartoon font-bold text-amber-950 block">Super Net (8s)</span>
                  <span className="text-[11px] text-amber-800">Giant catch radius.</span>
                </div>
              </div>

              <div className="bg-amber-50/90 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-cartoon font-bold text-amber-950 block">Speed Boost (7s)</span>
                  <span className="text-[11px] text-amber-800">Fast swimming speed.</span>
                </div>
              </div>

              <div className="bg-amber-50/90 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm flex items-start gap-2">
                <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-cartoon font-bold text-amber-950 block">Bubble Shield (6s)</span>
                  <span className="text-[11px] text-amber-800">Deflects shocks safely.</span>
                </div>
              </div>

              <div className="bg-amber-50/90 p-2.5 rounded-2xl border-2 border-amber-400 shadow-sm flex items-start gap-2">
                <Gauge className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-cartoon font-bold text-amber-950 block">Double Points (10s)</span>
                  <span className="text-[11px] text-amber-800">2X multiplier!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="pt-3 border-t-2 border-amber-400 flex justify-end shrink-0">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="w-full sm:w-auto py-2.5 px-7 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-cartoon font-extrabold text-base border-3 border-amber-700 shadow-[0_4px_0_#92400e] active:translate-y-0.5 active:shadow-[0_1px_0_#92400e] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>GOT IT!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
