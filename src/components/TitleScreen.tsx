import React from 'react';
import { GameMode, GameStats } from '../game/types';
import { Sword, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { audio } from '../game/audio';

interface TitleScreenProps {
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  stats: GameStats;
  onStartGame: () => void;
  onOpenArmory: () => void;
  onOpenHelp: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  onSelectMode,
  stats,
  onStartGame,
  onOpenArmory,
  onOpenHelp,
}) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-between pointer-events-none p-6 pt-24 pb-8 sm:pb-12 text-center">
      {/* Hero Title Section */}
      <div className="flex flex-col items-center pointer-events-auto">
        <h1 className="text-5xl sm:text-7xl font-black font-display tracking-tight text-white drop-shadow-2xl">
          Blade Fruit
        </h1>
        <p className="text-sm sm:text-base text-amber-300/90 font-medium tracking-wide mt-2">
          Dojo Slicer · Master the Blade
        </p>

        {/* Mode Selector Segmented Tabs */}
        <div className="mt-8 flex items-center p-1.5 bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
          <button
            onClick={() => {
              audio.playUiClick();
              onSelectMode('CLASSIC');
            }}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'CLASSIC'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Classic (3 Strikes)
          </button>

          <button
            onClick={() => {
              audio.playUiClick();
              onSelectMode('ZEN');
            }}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'ZEN'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Zen (90s Flow)
          </button>

          <button
            onClick={() => {
              audio.playUiClick();
              onSelectMode('ARCADE');
            }}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'ARCADE'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Arcade (Power-ups)
          </button>
        </div>

        {/* High score indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Best in {mode.toLowerCase()}:</span>
          <span className="font-bold text-amber-300 font-mono tabular-nums">
            {mode === 'CLASSIC'
              ? stats.classicHighScore
              : mode === 'ZEN'
              ? stats.zenHighScore
              : stats.arcadeHighScore}{' '}
            pts
          </span>
        </div>
      </div>

      {/* Middle zone is left clear for the canvas floating watermelon "SWIPE TO PLAY" */}
      <div className="h-44 sm:h-52" />

      {/* Bottom Bar Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pointer-events-auto">
        <button
          onClick={() => {
            audio.playUiClick();
            onStartGame();
          }}
          className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 text-neutral-950 font-black rounded-xl hover:bg-amber-300 transition-all shadow-xl shadow-amber-400/25 active:scale-95 text-base font-display flex items-center justify-center gap-2"
        >
          <Sword className="w-5 h-5 fill-current" />
          <span>Start Slicing</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <button
            onClick={() => {
              audio.playUiClick();
              onOpenArmory();
            }}
            className="px-4 py-3 bg-neutral-900/80 backdrop-blur-md border border-white/10 hover:border-white/25 text-neutral-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Blade Armory</span>
          </button>

          <button
            onClick={() => {
              audio.playUiClick();
              onOpenHelp();
            }}
            className="px-4 py-3 bg-neutral-900/80 backdrop-blur-md border border-white/10 hover:border-white/25 text-neutral-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>How to Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};
