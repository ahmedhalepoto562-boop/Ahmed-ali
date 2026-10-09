import React from 'react';
import { GameMode, GameStatus } from '../game/types';
import { Volume2, VolumeX } from 'lucide-react';
import { audio } from '../game/audio';

interface HeaderProps {
  status: GameStatus;
  mode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onOpenArmory: () => void;
  onOpenHelp: () => void;
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  mode,
  onSelectMode,
  onOpenArmory,
  onOpenHelp,
  onStartGame,
  isMuted,
  onToggleMute,
}) => {
  // If in active gameplay, show minimal floating nav to keep full focus on blade action
  if (status === 'PLAYING') {
    return null;
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-8 px-6 py-4 border-b border-white/10 bg-neutral-950/60 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => {
          audio.playUiClick();
          window.location.reload();
        }}
        className="text-xl font-black tracking-tight text-white font-display hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 text-left"
      >
        Blade Fruit
      </button>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
        <button
          onClick={() => {
            audio.playUiClick();
            onSelectMode('CLASSIC');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            mode === 'CLASSIC' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Classic Mode
        </button>
        <button
          onClick={() => {
            audio.playUiClick();
            onSelectMode('ZEN');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            mode === 'ZEN' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Zen Mode
        </button>
        <button
          onClick={() => {
            audio.playUiClick();
            onSelectMode('ARCADE');
          }}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            mode === 'ARCADE' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Arcade Mode
        </button>
        <button
          onClick={() => {
            audio.playUiClick();
            onOpenArmory();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Blade Armory
        </button>
        <button
          onClick={() => {
            audio.playUiClick();
            onOpenHelp();
          }}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          Rules
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <button
          onClick={() => {
            audio.playUiClick();
            onStartGame();
          }}
          className="px-4 py-2 text-sm font-bold text-neutral-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-lg shadow-amber-400/20 active:scale-95"
        >
          Play Game
        </button>
      </div>
    </header>
  );
};
