import React from 'react';
import { X, Flame, ShieldAlert, Sparkles, Zap, Award } from 'lucide-react';
import { audio } from '../game/audio';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold font-display text-white">How to Play</h2>
          <button
            onClick={() => {
              audio.playUiClick();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-300">
          {/* Controls */}
          <section>
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Slicing Controls
            </h3>
            <p className="leading-relaxed text-neutral-400">
              Drag your mouse or swipe your finger across incoming fruit to cut them with your blade. Faster swipes create vibrant glowing trails and dynamic whoosh sounds.
            </p>
          </section>

          {/* Combos */}
          <section>
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Combo Multipliers
            </h3>
            <p className="leading-relaxed text-neutral-400">
              Slice 3 or more fruits in a single fluid stroke to earn Combo bonuses!
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
              <div className="p-2 bg-neutral-800/60 rounded-lg border border-white/5">
                <div className="font-bold text-amber-400">3x Combo</div>
                <div className="text-neutral-400">+3 bonus pts</div>
              </div>
              <div className="p-2 bg-neutral-800/60 rounded-lg border border-white/5">
                <div className="font-bold text-amber-400">4x Combo</div>
                <div className="text-neutral-400">+5 bonus pts</div>
              </div>
              <div className="p-2 bg-neutral-800/60 rounded-lg border border-white/5">
                <div className="font-bold text-amber-400">5x+ Combo</div>
                <div className="text-neutral-400">+8 bonus pts</div>
              </div>
            </div>
          </section>

          {/* Game Modes */}
          <section>
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Game Modes
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-neutral-800/50 rounded-xl border border-white/5">
                <strong className="text-white">Classic Mode:</strong> 3 strikes. Missing an unsliced fruit costs 1 strike. Cutting a bomb results in immediate Game Over!
              </div>
              <div className="p-3 bg-neutral-800/50 rounded-xl border border-white/5">
                <strong className="text-white">Zen Mode:</strong> 90 seconds of uninterrupted slicing. No bombs, no strikes, pure combo zen.
              </div>
              <div className="p-3 bg-neutral-800/50 rounded-xl border border-white/5">
                <strong className="text-white">Arcade Mode:</strong> 60 seconds with special powerups! Freeze Bananas slow time, Frenzy Melons rain fruit, and Double Berries double all points. Bombs deduct 10 points.
              </div>
            </div>
          </section>

          {/* Bombs */}
          <section>
            <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Beware of Bombs
            </h3>
            <p className="leading-relaxed text-neutral-400">
              Iron bombs with lit fuses appear among the fruit. Do not slice them! Let them fall safely off the bottom of the screen to dodge them.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-neutral-950/40 text-center">
          <button
            onClick={() => {
              audio.playUiClick();
              onClose();
            }}
            className="w-full py-2.5 bg-amber-400 text-neutral-950 font-bold rounded-xl hover:bg-amber-300 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
