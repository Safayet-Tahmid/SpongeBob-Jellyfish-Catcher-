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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#38bdf8', '#f472b6', '#4ade80'],
      });
    }

    // Counting animation
    const duration = 1000;
    const startTime = performance.now();

    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(score * ease));
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [score, isNewHigh]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* New High Score Banner */}
        {isNewHigh && (
          <div className="mb-3 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 flex items-center gap-1.5 animate-bounce">
            <Trophy className="w-4 h-4" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        <h2 className="font-cartoon text-3xl sm:text-4xl font-extrabold text-amber-300">
          ROUND SUMMARY
        </h2>
        <p className="text-xs text-sky-200/80 mb-4">
          Great jellyfishing adventure in Bikini Bottom!
        </p>

        {/* Big Animated Score */}
        <div className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 mb-4 flex flex-col items-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Final Score
          </span>
          <span className="font-cartoon text-4xl sm:text-5xl font-black text-amber-300 tabular-nums">
            {displayScore}
          </span>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>Best Score:</span>
            <span className="font-bold text-slate-200 tabular-nums">
              {Math.max(bestScore, score)}
            </span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="bg-slate-800/60 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-medium">
                Caught
              </span>
              <span className="font-cartoon font-bold text-slate-100 text-sm sm:text-base tabular-nums">
                {totalCaught}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-medium">
                Golden
              </span>
              <span className="font-cartoon font-bold text-slate-100 text-sm sm:text-base tabular-nums">
                {goldenCaught}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-medium">
                Accuracy
              </span>
              <span className="font-cartoon font-bold text-slate-100 text-sm sm:text-base tabular-nums">
                {accuracy}%
              </span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-medium">
                Level
              </span>
              <span className="font-cartoon font-bold text-slate-100 text-sm sm:text-base tabular-nums">
                {levelReached}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-cartoon font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 border border-white/10 active:scale-98 transition-all"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
