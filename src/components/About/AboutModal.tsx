import React from 'react';
import {
  X,
  Info,
  Heart,
  ExternalLink,
  ShieldCheck,
  Instagram,
  Sparkles,
  Code2,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

// Easily editable developer profile configuration
export const DEVELOPER_PROFILE = {
  name: 'SAFAYET TAHMID',
  role: 'Game Developer & Creator',
  tagline: 'Hi, I am SpongeBob r u Patrick??',
  instagramUrl: 'https://www.instagram.com/safayettahmid',
  instagramHandle: '@safayettahmid',
  buttonLabel: 'Follow on Instagram',
  photoPath: 'assets/aistudio/IMG_3782_3a94bae4.jpeg',
};

function getPhotoUrl(path: string): string {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none touch-auto safe-area-pad animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-4 border-amber-800 rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-[0_12px_0_#78350f,0_25px_30px_rgba(0,0,0,0.6)] flex flex-col max-h-[88dvh] overflow-hidden">
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
          {/* 🌟 FEATURED DEVELOPER PROFILE CARD */}
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-3 border-amber-700 rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_0_#78350f,0_8px_16px_rgba(0,0,0,0.12)] flex flex-col gap-3 transition-transform">
            {/* Card Header: Photo & Name */}
            <div className="flex items-center gap-3">
              {/* Creator's Actual Uploaded Photograph */}
              <div className="relative shrink-0">
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-3 border-amber-600 bg-amber-900 shadow-[0_4px_0_#78350f,0_6px_12px_rgba(0,0,0,0.15)]">
                  {/* Background Fallback Avatar */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white font-cartoon font-black text-xl tracking-wider select-none">
                    ST
                  </div>
                  {/* Photograph fills the entire circle frame edge-to-edge */}
                  <img
                    src={getPhotoUrl(DEVELOPER_PROFILE.photoPath)}
                    alt="SAFAYET TAHMID"
                    className="absolute inset-0 w-full h-full object-cover object-[center_16%] select-none pointer-events-none block"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div
                  title="Verified Creator"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-b from-yellow-300 to-amber-400 border-2 border-amber-800 flex items-center justify-center text-amber-950 shadow-md z-10"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              {/* Developer Attribution & Title */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 bg-amber-200/90 text-amber-950 border border-amber-400 font-cartoon text-[10px] font-black uppercase px-2 py-0.5 rounded-full mb-0.5">
                  <Code2 className="w-2.5 h-2.5" />
                  <span>{DEVELOPER_PROFILE.role}</span>
                </div>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider leading-none">
                  Developed by
                </div>
                <h3 className="font-cartoon text-lg sm:text-xl font-black text-amber-950 tracking-normal leading-tight truncate">
                  {DEVELOPER_PROFILE.name}
                </h3>
              </div>
            </div>

            {/* Creator Description */}
            <p className="text-amber-900 text-xs italic font-medium leading-relaxed bg-amber-100/70 p-2.5 rounded-xl border border-amber-300/80">
              &ldquo;{DEVELOPER_PROFILE.tagline}&rdquo;
            </p>

            {/* Instagram Action Button */}
            <a
              href={DEVELOPER_PROFILE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundManager.playButtonClick()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:brightness-105 active:brightness-95 border-2 border-white text-white font-cartoon font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#4a0e17] active:translate-y-0.5 active:shadow-[0_1px_0_#4a0e17] transition-all cursor-pointer group"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform group-hover:scale-110" />
              <span>{DEVELOPER_PROFILE.buttonLabel}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 ml-0.5" />
            </a>
          </div>

          {/* Game Description */}
          <p className="font-medium px-1">
            <strong className="font-cartoon text-amber-900 font-black">SpongeBob: Jellyfish Catcher</strong> is an authentic 2000s cartoon arcade tribute set in Bikini Bottom’s Jellyfish Fields, crafted with hand-painted nautical colors, expressive character animation, and nostalgic sounds.
          </p>

          {/* Fan Tribute Disclaimer */}
          <div className="bg-amber-50/90 p-3 rounded-2xl border-2 border-amber-400 shadow-sm flex flex-col gap-1.5 text-xs">
            <span className="font-cartoon font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              Fan Tribute Disclaimer
            </span>
            <p className="text-amber-800 text-[11px] leading-normal font-medium">
              This is a non-commercial fan tribute created for educational and entertainment purposes. SpongeBob SquarePants, characters, music, and related marks are trademarks of Viacom International Inc. / Nickelodeon.
            </p>
          </div>

          {/* Engine & Architecture */}
          <div className="bg-amber-50/90 p-3 rounded-2xl border-2 border-amber-400 shadow-sm flex flex-col gap-1.5 text-xs">
            <span className="font-cartoon font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              Engine & Architecture
            </span>
            <ul className="list-disc list-inside space-y-1 text-amber-900 text-[11px] font-medium">
              <li>HTML5 Canvas 60 FPS sub-pixel physics engine with high-DPI scaling</li>
              <li>Procedural 2000s cartoon SpongeBob animation system</li>
              <li>Full-screen responsive touch & gesture control system (drag & tap)</li>
              <li>Original authentic JellyPop theme music with Web Audio sound effects</li>
              <li>Multi-level progression with local high score persistence</li>
            </ul>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="pt-3 border-t-2 border-amber-400 flex items-center justify-between shrink-0">
          <a
            href={DEVELOPER_PROFILE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playButtonClick()}
            className="text-xs text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1 underline underline-offset-2 transition-colors"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-700" />
            <span>{DEVELOPER_PROFILE.instagramHandle}</span>
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
