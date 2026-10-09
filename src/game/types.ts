/**
 * Game types and data models for Fruit Cutting Game
 */

export type GameMode = 'CLASSIC' | 'ZEN' | 'ARCADE';

export type GameStatus = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type FruitVariety =
  | 'WATERMELON'
  | 'ORANGE'
  | 'APPLE'
  | 'PINEAPPLE'
  | 'STRAWBERRY'
  | 'BANANA'
  | 'COCONUT'
  | 'DRAGONFRUIT'
  | 'BOMB'
  | 'FREEZE_BANANA'
  | 'FRENZY_MELON'
  | 'DOUBLE_BERRY';

export interface FruitConfig {
  variety: FruitVariety;
  name: string;
  points: number;
  radius: number;
  primaryColor: string;
  fleshColor: string;
  rindColor: string;
  splatterColor: string;
  isBomb?: boolean;
  isPowerup?: boolean;
  powerupType?: 'FREEZE' | 'FRENZY' | 'DOUBLE';
}

export interface FruitItem {
  id: string;
  variety: FruitVariety;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  radius: number;
  sliced: boolean;
  config: FruitConfig;
  spawnTime: number;
  halves?: FruitHalf[];
}

export interface FruitHalf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  cutAngle: number;
  side: 1 | -1;
  radius: number;
  config: FruitConfig;
  opacity: number;
}

export interface Splatter {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  opacity: number;
  dots: Array<{ dx: number; dy: number; r: number }>;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
  gravity?: number;
  shape?: 'CIRCLE' | 'SEED' | 'SPARK' | 'FROST' | 'PETAL';
  rotation?: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
  vy: number;
}

export interface BladePoint {
  x: number;
  y: number;
  time: number;
}

export interface BladeTheme {
  id: string;
  name: string;
  description: string;
  trailColor: string;
  glowColor: string;
  coreColor: string;
  particleType: 'SPARK' | 'FROST' | 'PETAL' | 'CIRCLE';
  particleColor: string;
  unlockRequirement: string;
  unlockedByDefault: boolean;
}

export interface DojoTheme {
  id: string;
  name: string;
  primaryBg: string;
  boardTexture: 'CEDAR' | 'BAMBOO' | 'MIDNIGHT';
  accentGlow: string;
}

export interface GameStats {
  classicHighScore: number;
  zenHighScore: number;
  arcadeHighScore: number;
  totalFruitsCut: number;
  highestCombo: number;
  bombsDodged: number;
  selectedBlade: string;
  selectedDojo: string;
  unlockedBlades: string[];
}
