import React from 'react';
import { X, Info, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-400" />
            <h2 className="font-cartoon text-2xl font-bold text-amber-300">
              ABOUT THE GAME
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            aria-label="Close about modal"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3.5 py-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">SpongeBob: Jellyfish Catcher</strong> is a high-polish, cross-platform underwater arcade game crafted to capture the warmth, humor, and nostalgia of Stephen Hillenburg’s legendary universe.
          </p>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-white/5 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-sky-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Fan-Made Disclaimer
            </span>
            <p className="text-slate-400 text-[11px] leading-normal">
              This is a non-commercial, fan-made interactive tribute created with love. SpongeBob SquarePants, characters, music, and recognizable names are trademarks and copyrights of Viacom International Inc. / Nickelodeon.
            </p>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-white/5 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400 fill-current" />
              Features & Architecture
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li>High-performance 60 FPS HTML5 Canvas engine with delta-time</li>
              <li>Procedural cartoon vector rendering for crisp Retina displays</li>
              <li>Synthesized retro arcade audio & tropical soundtrack (Web Audio)</li>
              <li>Responsive mobile touchscreen virtual joystick & desktop controls</li>
              <li>Local storage progression & high-score tracking</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sky-300 hover:text-sky-200 flex items-center gap-1 transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
