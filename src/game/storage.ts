import { GameStats } from './types';
import { BLADE_THEMES } from './cosmetics';

const STATS_KEY = 'blade_fruit_game_stats_v1';

const DEFAULT_STATS: GameStats = {
  classicHighScore: 0,
  zenHighScore: 0,
  arcadeHighScore: 0,
  totalFruitsCut: 0,
  highestCombo: 0,
  bombsDodged: 0,
  selectedBlade: 'katana',
  selectedDojo: 'cedar',
  unlockedBlades: ['katana'],
};

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      unlockedBlades: Array.isArray(parsed.unlockedBlades)
        ? Array.from(new Set(['katana', ...parsed.unlockedBlades]))
        : ['katana'],
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // LocalStorage quota or privacy guard
  }
}

export function updateStatsAfterGame(
  currentStats: GameStats,
  mode: 'CLASSIC' | 'ZEN' | 'ARCADE',
  score: number,
  fruitsCutInRound: number,
  maxComboInRound: number,
  bombsDodgedInRound: number
): { updatedStats: GameStats; newlyUnlocked: string[] } {
  const updated: GameStats = { ...currentStats };

  if (mode === 'CLASSIC' && score > updated.classicHighScore) {
    updated.classicHighScore = score;
  } else if (mode === 'ZEN' && score > updated.zenHighScore) {
    updated.zenHighScore = score;
  } else if (mode === 'ARCADE' && score > updated.arcadeHighScore) {
    updated.arcadeHighScore = score;
  }

  updated.totalFruitsCut += fruitsCutInRound;
  updated.bombsDodged += bombsDodgedInRound;
  if (maxComboInRound > updated.highestCombo) {
    updated.highestCombo = maxComboInRound;
  }

  // Check unlocks
  const newlyUnlocked: string[] = [];
  const currentUnlocked = new Set(updated.unlockedBlades);

  BLADE_THEMES.forEach((blade) => {
    if (currentUnlocked.has(blade.id)) return;

    let qualifies = false;
    if (blade.id === 'inferno' && updated.totalFruitsCut >= 75) qualifies = true;
    if (blade.id === 'frost' && updated.totalFruitsCut >= 200) qualifies = true;
    if (blade.id === 'cyber' && updated.highestCombo >= 4) qualifies = true;
    if (blade.id === 'sakura' && updated.totalFruitsCut >= 400) qualifies = true;

    if (qualifies) {
      currentUnlocked.add(blade.id);
      newlyUnlocked.push(blade.name);
    }
  });

  updated.unlockedBlades = Array.from(currentUnlocked);
  saveGameStats(updated);

  return { updatedStats: updated, newlyUnlocked };
}
