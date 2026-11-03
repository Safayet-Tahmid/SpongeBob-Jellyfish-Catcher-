import React from 'react';
import { X, Info, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none touch-auto safe-area-pad animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-4 border-amber-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-[0_12px_0_#78350f,0_25px_30px_rgba(0,0,0,0.6)] flex flex-col max-h-[85dvh] overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-400 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-400 border-2 border-amber-600 text-amber-950">
              <Info className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="font-cartoon text-xl sm:text-2xl font-black text-amber-950 drop-shadow-[0_2px_0_#fef08a] uppercase tracking-wide">
              ABOUT THE GAME
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            aria-label="Close about modal"
            className="w-9 h-9 rounded-full bg-amber-300 hover:bg-amber-400 text-amber-950 border-2 border-amber-700 shadow-[0_2px_0_#78350f] flex items-center justify-center transition-all cursor-pointer active:translate-y-0.5"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-auto flex flex-col gap-3 py-3 pr-1 text-xs sm:text-sm text-amber-950 leading-relaxed">
          <p className="font-medium">
            <strong className="font-cartoon text-amber-900 font-black">SpongeBob: Jellyfish Catcher</strong> is an authentic 2000s cartoon arcade tribute set in Bikini Bottom’s Jellyfish Fields, crafted with hand-painted nautical colors, expressive character animation, and nostalgic sounds.
          </p>

          <div className="bg-amber-50/90 p-3 rounded-2xl border-2 border-amber-400 shadow-sm flex flex-col gap-1.5 text-xs">
            <span className="font-cartoon font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              Fan Tribute Disclaimer
            </span>
            <p className="text-amber-800 text-[11px] leading-normal font-medium">
              This is a non-commercial fan tribute created for educational and entertainment purposes. SpongeBob SquarePants, characters, music, and related marks are trademarks of Viacom International Inc. / Nickelodeon.
            </p>
          </div>

          <div className="bg-amber-50/90 p-3 rounded-2xl border-2 border-amber-400 shadow-sm flex flex-col gap-1.5 text-xs">
            <span className="font-cartoon font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              Engine & Architecture
            </span>
            <ul className="list-disc list-inside space-y-1 text-amber-900 text-[11px] font-medium">
              <li>HTML5 Canvas 60 FPS sub-pixel physics engine with high-DPI scaling</li>
              <li>Procedural 2000s cartoon SpongeBob animation system</li>
              <li>Fully customizable on-screen mobile joystick & catch button layout</li>
              <li>Dual synthesized nostalgic cartoon soundtrack via Web Audio API</li>
              <li>Multi-level progression with local high score persistence</li>
            </ul>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="pt-3 border-t-2 border-amber-400 flex items-center justify-between shrink-0">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1 underline underline-offset-2 transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="py-2 px-5 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-cartoon font-bold text-sm border-2 border-amber-700 shadow-[0_3px_0_#92400e] active:translate-y-0.5 active:shadow-[0_1px_0_#92400e] transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
