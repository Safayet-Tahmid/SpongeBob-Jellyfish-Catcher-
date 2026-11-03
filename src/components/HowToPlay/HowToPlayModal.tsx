import React from 'react';
import { X, HelpCircle, Sparkles, Shield, Zap, Magnet, Gauge, Keyboard, Smartphone } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="font-cartoon text-2xl font-bold text-amber-300">
              HOW TO PLAY
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            aria-label="Close how to play"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Guide */}
        <div className="flex flex-col gap-4 py-4 text-xs sm:text-sm">
          {/* Controls Section */}
          <div>
            <h3 className="font-cartoon text-base text-sky-200 mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-400" />
              Game Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5">
                <span className="font-bold text-white block mb-1">🖥️ Desktop:</span>
                <p className="text-slate-300 leading-relaxed">
                  <span className="text-amber-300 font-semibold">WASD</span> or{' '}
                  <span className="text-amber-300 font-semibold">Arrow Keys</span> to swim.
                  <br />
                  <span className="text-amber-300 font-semibold">Spacebar</span> or mouse click to swing net!
                </p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5">
                <span className="font-bold text-white block mb-1">📱 Mobile / Touch:</span>
                <p className="text-slate-300 leading-relaxed">
                  <span className="text-amber-300 font-semibold">Virtual Joystick</span> (bottom-left) to guide SpongeBob.
                  <br />
                  <span className="text-amber-300 font-semibold">Net Button</span> (bottom-right) to swing!
                </p>
              </div>
            </div>
          </div>

          {/* Jellyfish Types */}
          <div>
            <h3 className="font-cartoon text-base text-sky-200 mb-2">
              Jellyfish Varieties
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center shrink-0">
                  <span className="text-xs">🌸</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-300">Pink Jellyfish</span>
                    <span className="font-cartoon text-amber-300 font-bold">+10 pts</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Gentle and common swimmers.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                  <span className="text-xs">💧</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300">Blue Jellyfish</span>
                    <span className="font-cartoon text-amber-300 font-bold">+20 pts</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Faster and darts quickly.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
                  <span className="text-xs">✨</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-yellow-300">Golden Jellyfish</span>
                    <span className="font-cartoon text-amber-300 font-bold">+50 pts</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Rare sparkling prize!</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center shrink-0">
                  <span className="text-xs">⚡</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400">Electric Jellyfish</span>
                    <span className="font-cartoon text-red-400 font-bold">HAZARD!</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Avoid! Touching shocks you and costs 1 life.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded-xl border border-white/5">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0">
                  <span className="text-xs">🌈</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300">Rainbow Jellyfish</span>
                    <span className="font-cartoon text-amber-300 font-bold">+100 pts</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Ultra-rare prismatic treasure!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Power-Ups */}
          <div>
            <h3 className="font-cartoon text-base text-sky-200 mb-2">
              Collectible Power-Ups
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Super Net (8s)</span>
                  <span className="text-[11px] text-slate-400">Giant net with huge catch radius.</span>
                </div>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Speed Boost (7s)</span>
                  <span className="text-[11px] text-slate-400">Sprint at rapid swimming speed.</span>
                </div>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                <Shield className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Bubble Shield (6s)</span>
                  <span className="text-[11px] text-slate-400">Deflects electric shocks safely.</span>
                </div>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                <Gauge className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">2X Double Points (10s)</span>
                  <span className="text-[11px] text-slate-400">Doubles all catch points!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="py-2 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
