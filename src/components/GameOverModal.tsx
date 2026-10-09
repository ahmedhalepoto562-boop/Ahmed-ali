import React from 'react';
import { GameMode } from '../game/types';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { audio } from '../game/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  fruitsCut: number;
  highestCombo: number;
  bombsDodged: number;
  mode: GameMode;
  newlyUnlockedBlades: string[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  fruitsCut,
  highestCombo,
  bombsDodged,
  mode,
  newlyUnlockedBlades,
  onPlayAgain,
  onBackToMenu,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Title & Badge */}
        <div className="mb-2">
          {isNewHighScore ? (
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-sm tracking-wide mb-1">
              <Trophy className="w-4 h-4" />
              <span>NEW HIGH SCORE</span>
            </div>
          ) : (
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              {mode === 'CLASSIC' ? 'Classic Round Summary' : mode === 'ZEN' ? 'Zen Round Summary' : 'Arcade Round Summary'}
            </div>
          )}
          <h2 className="text-3xl font-extrabold font-display text-white">Slice Session Complete</h2>
        </div>

        {/* Big Final Score */}
        <div className="my-6">
          <div className="text-6xl font-black font-display text-amber-400 tabular-nums tracking-tight">
            {score}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Personal Best: <span className="font-semibold text-neutral-200 tabular-nums">{highScore}</span>
          </div>
        </div>

        {/* Unboxed Stats Breakdown (Zero-Pill Discipline) */}
        <div className="w-full grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-3 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Fruits Sliced</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">{fruitsCut}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Best Combo</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
              {highestCombo > 0 ? `${highestCombo}x` : '—'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-neutral-400">Bombs Evaded</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">{bombsDodged}</span>
          </div>
        </div>

        {/* Unlocks Announcement */}
        {newlyUnlockedBlades.length > 0 && (
          <div className="w-full mb-6 p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW BLADE UNLOCKED!</span>
            </div>
            <p className="text-xs text-neutral-300">
              You unlocked <strong className="text-white">{newlyUnlockedBlades.join(', ')}</strong> in the Blade Armory!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              audio.playUiClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 bg-amber-400 text-neutral-950 font-bold rounded-xl hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={() => {
              audio.playUiClick();
              onBackToMenu();
            }}
            className="flex-1 py-3 px-4 bg-neutral-800 text-neutral-200 font-medium rounded-xl hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 border border-white/5 active:scale-95 whitespace-nowrap"
          >
            <Home className="w-4 h-4" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
