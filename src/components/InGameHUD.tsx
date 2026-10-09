import React from 'react';
import { GameMode } from '../game/types';
import { Pause, Play, RotateCcw, Home, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { audio } from '../game/audio';

interface InGameHUDProps {
  score: number;
  strikes: number;
  timeLeft: number;
  mode: GameMode;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onToggleMute: () => void;
}

export const InGameHUD: React.FC<InGameHUDProps> = ({
  score,
  strikes,
  timeLeft,
  mode,
  isPaused,
  isMuted,
  onTogglePause,
  onRestart,
  onQuitToMenu,
  onToggleMute,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none flex items-start justify-between p-6">
        {/* Left: Score & Mode */}
        <div className="flex flex-col gap-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
            {mode === 'CLASSIC' ? 'Classic Mode' : mode === 'ZEN' ? 'Zen 90s' : 'Arcade Frenzy'}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight tabular-nums drop-shadow-md">
              {score}
            </span>
            <span className="text-xs uppercase font-semibold text-neutral-400">PTS</span>
          </div>
        </div>

        {/* Center: Mode-specific Status (Strikes or Timer) */}
        <div className="flex flex-col items-center">
          {mode === 'CLASSIC' ? (
            <div className="flex items-center gap-2 bg-neutral-950/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-xs font-semibold text-neutral-400 mr-1">STRIKES</span>
              {[0, 1, 2].map((idx) => {
                const isStruck = idx < strikes;
                return (
                  <div
                    key={idx}
                    className={`w-6 h-6 flex items-center justify-center font-black text-sm rounded ${
                      isStruck
                        ? 'text-red-500 bg-red-950/50 border border-red-500/40'
                        : 'text-neutral-600 bg-neutral-900 border border-white/5'
                    }`}
                  >
                    ✕
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-neutral-950/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="text-xs font-semibold text-neutral-400">TIME</span>
              <span className={`text-xl font-mono font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="p-2.5 bg-neutral-950/60 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-900 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              audio.playUiClick();
              onTogglePause();
            }}
            className="p-2.5 bg-neutral-950/60 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white rounded-xl hover:bg-neutral-900 transition-colors"
            title="Pause Game (Esc)"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-6">
          <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold font-display text-white mb-2">Game Paused</h2>
            <p className="text-sm text-neutral-400 mb-6">Take a breath, hone your blade.</p>

            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  audio.playUiClick();
                  onTogglePause();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-400 text-neutral-950 font-bold rounded-xl hover:bg-amber-300 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume Slicing
              </button>

              <button
                onClick={() => {
                  audio.playUiClick();
                  onRestart();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition-colors border border-white/5"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Round
              </button>

              <button
                onClick={() => {
                  audio.playUiClick();
                  onQuitToMenu();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition-colors border border-white/5"
              >
                <Home className="w-4 h-4" />
                Quit to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
