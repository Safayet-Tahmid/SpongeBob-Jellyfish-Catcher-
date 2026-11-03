import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Target, Award, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewHigh: boolean;
  totalCaught: number;
  goldenCaught: number;
  accuracy: number;
  levelReached: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  isNewHigh,
  totalCaught,
  goldenCaught,
  accuracy,
  levelReached,
  onPlayAgain,
  onMainMenu,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Fire confetti if new high score or great score
    if (isNewHigh || score >= 200) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fde047', '#38bdf8', '#f472b6', '#4ade80', '#fb923c'],
      });
    }

    // Counting animation
    const duration = 1000;
    const startTime = performance.now();

    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(score * ease));
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [score, isNewHigh]);

  return (
    <div className="absolute inset-0 z-40 bg-sky-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      {/* 2000s Classic Cartoon Arcade Frame */}
      <div className="bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-4 border-amber-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_12px_0_#78350f,0_25px_30px_rgba(0,0,0,0.6)] flex flex-col items-center text-center relative animate-in fade-in zoom-in-95 duration-200">
        {/* New High Score Banner */}
        {isNewHigh && (
          <div className="mb-3 px-5 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 text-amber-950 text-xs font-cartoon font-black uppercase tracking-wider shadow-[0_4px_0_#b45309] border-2 border-amber-600 flex items-center gap-1.5 animate-bounce">
            <Trophy className="w-4 h-4 fill-current text-amber-700" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        <h2 className="font-cartoon text-3xl sm:text-4xl font-extrabold text-amber-950 drop-shadow-[0_2px_0_#fef08a] uppercase tracking-wide">
          Round Summary
        </h2>
        <p className="text-xs text-amber-900 font-semibold mb-4">
          Great jellyfishing adventure in Bikini Bottom!
        </p>

        {/* Big Cartoon Score Board */}
        <div className="w-full bg-amber-50/90 border-3 border-amber-600 rounded-2xl p-4 mb-4 flex flex-col items-center shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)]">
          <span className="text-[11px] uppercase tracking-widest text-amber-900 font-bold">
            Final Score
          </span>
          <span className="font-cartoon text-5xl sm:text-6xl font-black text-amber-600 drop-shadow-[0_2px_0_#fef08a] tabular-nums my-0.5">
            {displayScore}
          </span>
          <div className="text-xs text-amber-900 font-medium flex items-center gap-1.5 mt-1">
            <span>Best Score:</span>
            <span className="font-cartoon font-bold text-amber-800 text-sm tabular-nums">
              {Math.max(bestScore, score)}
            </span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="bg-amber-50/80 border-2 border-amber-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-pink-100 text-pink-600 border border-pink-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-amber-900 block font-bold">
                Jellyfish Caught
              </span>
              <span className="font-cartoon font-black text-amber-950 text-base tabular-nums">
                {totalCaught}
              </span>
            </div>
          </div>

          <div className="bg-amber-50/80 border-2 border-amber-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-yellow-100 text-amber-600 border border-yellow-300 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-amber-900 block font-bold">
                Golden Jellyfish
              </span>
              <span className="font-cartoon font-black text-amber-950 text-base tabular-nums">
                {goldenCaught}
              </span>
            </div>
          </div>

          <div className="bg-amber-50/80 border-2 border-amber-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600 border border-sky-300 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-amber-900 block font-bold">
                Net Accuracy
              </span>
              <span className="font-cartoon font-black text-amber-950 text-base tabular-nums">
                {accuracy}%
              </span>
            </div>
          </div>

          <div className="bg-amber-50/80 border-2 border-amber-500 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-300 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-amber-900 block font-bold">
                Level Reached
              </span>
              <span className="font-cartoon font-black text-amber-950 text-base tabular-nums">
                Level {levelReached}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-b from-lime-400 to-green-500 hover:from-lime-300 hover:to-green-400 text-green-950 font-cartoon font-black text-xl flex items-center justify-center gap-2 border-3 border-green-700 shadow-[0_5px_0_#15803d,0_8px_15px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_#15803d] transition-all cursor-pointer"
          >
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-sky-950 font-cartoon font-bold text-base flex items-center justify-center gap-2 border-3 border-sky-700 shadow-[0_4px_0_#0369a1] active:translate-y-1 active:shadow-[0_1px_0_#0369a1] transition-all cursor-pointer"
          >
            <Home className="w-5 h-5 stroke-[2.5]" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
