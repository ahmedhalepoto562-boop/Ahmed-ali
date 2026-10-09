import React, { useState } from 'react';
import { BladeTheme, DojoTheme } from '../game/types';
import { BLADE_THEMES, DOJO_THEMES } from '../game/cosmetics';
import { X, Check, Lock, Sparkles, Sword } from 'lucide-react';
import { audio } from '../game/audio';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBlade: string;
  onSelectBlade: (bladeId: string) => void;
  selectedDojo: string;
  onSelectDojo: (dojoId: string) => void;
  unlockedBlades: string[];
  totalFruitsCut: number;
  highestCombo: number;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  selectedBlade,
  onSelectBlade,
  selectedDojo,
  onSelectDojo,
  unlockedBlades,
  totalFruitsCut,
  highestCombo,
}) => {
  const [activeTab, setActiveTab] = useState<'BLADES' | 'DOJOS'>('BLADES');

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">Blade & Dojo Armory</h2>
          </div>
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

        {/* Tab switch */}
        <div className="px-6 pt-4 pb-2 border-b border-white/5 flex gap-2">
          <button
            onClick={() => {
              audio.playUiClick();
              setActiveTab('BLADES');
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'BLADES'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Blades ({BLADE_THEMES.length})
          </button>
          <button
            onClick={() => {
              audio.playUiClick();
              setActiveTab('DOJOS');
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'DOJOS'
                ? 'bg-amber-400 text-neutral-950'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Dojo Backdrops ({DOJO_THEMES.length})
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {activeTab === 'BLADES' ? (
            BLADE_THEMES.map((blade) => {
              const isUnlocked = unlockedBlades.includes(blade.id);
              const isEquipped = selectedBlade === blade.id;

              return (
                <div
                  key={blade.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isEquipped
                      ? 'bg-amber-400/10 border-amber-400/40'
                      : isUnlocked
                      ? 'bg-neutral-800/60 border-white/5 hover:border-white/20'
                      : 'bg-neutral-900/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Visual Blade Color Preview Dot */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                      style={{
                        backgroundColor: blade.glowColor,
                        boxShadow: `0 0 12px ${blade.trailColor}`,
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{blade.name}</h3>
                        {isEquipped && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded">
                            Equipped
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{blade.description}</p>
                      {!isUnlocked && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400/80 mt-1 font-medium">
                          <Lock className="w-3 h-3" />
                          <span>{blade.unlockRequirement}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <div className="px-3 py-1.5 text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        In Use
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          audio.playUiClick();
                          onSelectBlade(blade.id);
                        }}
                        className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap active:scale-95"
                      >
                        Equip
                      </button>
                    ) : (
                      <div className="px-3 py-1.5 text-xs text-neutral-500 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            DOJO_THEMES.map((dojo) => {
              const isEquipped = selectedDojo === dojo.id;
              return (
                <div
                  key={dojo.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isEquipped
                      ? 'bg-amber-400/10 border-amber-400/40'
                      : 'bg-neutral-800/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl border border-white/10 shrink-0"
                      style={{ backgroundColor: dojo.primaryBg }}
                    />
                    <div>
                      <h3 className="font-bold text-white text-base">{dojo.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {dojo.boardTexture === 'CEDAR'
                          ? 'Horizontal traditional cedar planks with rustic woodgrain'
                          : dojo.boardTexture === 'BAMBOO'
                          ? 'Vertical midnight bamboo slats with deep navy tones'
                          : 'Minimal dark tatami weave texture with subtle ambient glow'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <div className="px-3 py-1.5 text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Selected
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          audio.playUiClick();
                          onSelectDojo(dojo.id);
                        }}
                        className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap active:scale-95"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info: Total stats progress */}
        <div className="px-6 py-3 border-t border-white/10 bg-neutral-950/40 flex items-center justify-between text-xs text-neutral-400">
          <div>
            Total Sliced: <strong className="text-neutral-200">{totalFruitsCut}</strong> fruits
          </div>
          <div>
            Best Combo: <strong className="text-neutral-200">{highestCombo}x</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
