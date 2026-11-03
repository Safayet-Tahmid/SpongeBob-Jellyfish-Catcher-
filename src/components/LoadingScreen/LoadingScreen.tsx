import React, { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  'Preparing Jellyfish Fields...',
  'Looking for Patrick’s net...',
  'Polishing the jellyfish glasses...',
  'Stretching the bamboo handle...',
  'Ready to jelly-fish!',
];

interface LoadingScreenProps {
  onLoaded: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(15);
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 25;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => onLoaded(), 250);
          return 100;
        }
        return next;
      });
      setMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 280);

    return () => clearInterval(timer);
  }, [onLoaded]);

  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-b from-sky-900 via-sky-800 to-sky-950 flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Animated Floating SpongeBob Icon */}
      <div className="relative mb-6 animate-bounce">
        <div className="w-20 h-24 rounded-2xl bg-yellow-400 border-4 border-yellow-500 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden">
          {/* Eyes */}
          <div className="flex items-center gap-1.5 -mt-3">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            </div>
            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            </div>
          </div>
          {/* Buck teeth */}
          <div className="flex gap-1 mt-1">
            <div className="w-2 h-2.5 bg-white border border-amber-900 rounded-xs" />
            <div className="w-2 h-2.5 bg-white border border-amber-900 rounded-xs" />
          </div>
          {/* Shirt & Tie */}
          <div className="absolute bottom-0 inset-x-0 h-6 bg-white flex flex-col items-center">
            <div className="w-1.5 h-3 bg-red-600 -mt-0.5" />
            <div className="w-full h-3 bg-amber-900" />
          </div>
        </div>
        {/* Floating Bubble behind */}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-sky-400/30 border border-white/60 animate-ping" />
      </div>

      {/* Title */}
      <h1 className="font-cartoon text-3xl sm:text-4xl font-extrabold text-amber-300 drop-shadow-md mb-2">
        SPONGEBOB
      </h1>
      <h2 className="font-cartoon text-lg sm:text-xl font-bold text-sky-200 mb-6">
        JELLYFISH CATCHER
      </h2>

      {/* Progress Bar */}
      <div className="w-64 max-w-xs h-3 bg-slate-900/80 rounded-full border border-white/20 p-0.5 mb-3 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Playful Loading Status */}
      <span className="text-xs text-sky-200/90 font-medium h-4">
        {LOADING_MESSAGES[messageIdx]}
      </span>
    </div>
  );
};
