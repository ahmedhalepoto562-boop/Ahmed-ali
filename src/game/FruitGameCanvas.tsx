/**
 * FruitGameCanvas: Central Canvas Game Loop & Interaction Component
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  GameMode,
  GameStatus,
  FruitItem,
  FruitHalf,
  Splatter,
  Particle,
  FloatingText,
  BladePoint,
  FruitVariety,
} from './types';
import { FRUIT_CONFIGS, STANDARD_FRUIT_VARIETIES } from './fruits';
import { BLADE_THEMES, DOJO_THEMES } from './cosmetics';
import { CanvasRenderer } from './renderer';
import { audio } from './audio';

interface FruitGameCanvasProps {
  status: GameStatus;
  mode: GameMode;
  selectedBlade: string;
  selectedDojo: string;
  onScoreChange: (score: number) => void;
  onStrikesChange: (strikes: number) => void;
  onTimeChange: (secondsLeft: number) => void;
  onFruitSliced: (variety: FruitVariety) => void;
  onCombo: (count: number) => void;
  onBombDodged: () => void;
  onGameOver: (finalScore: number, fruitsCut: number, maxCombo: number, bombsDodged: number) => void;
  onStartGame: () => void;
}

export const FruitGameCanvas: React.FC<FruitGameCanvasProps> = ({
  status,
  mode,
  selectedBlade,
  selectedDojo,
  onScoreChange,
  onStrikesChange,
  onTimeChange,
  onFruitSliced,
  onCombo,
  onBombDodged,
  onGameOver,
  onStartGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Loop State
  const stateRef = useRef<{
    score: number;
    strikes: number;
    timeLeft: number;
    fruitsCutThisGame: number;
    bombsDodgedThisGame: number;
    maxComboThisGame: number;
    fruits: FruitItem[];
    splatters: Splatter[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    bladePoints: BladePoint[];
    isSwiping: boolean;
    lastSwipeTime: number;
    lastSwishSoundTime: number;
    comboTracker: { count: number; timer: number };
    powerupFreezeTimer: number;
    powerupDoubleTimer: number;
    powerupFrenzyTimer: number;
    screenShake: number;
    screenFlash: number;
    nextSpawnTimer: number;
    lastTimestamp: number;
    titleFruit: FruitItem | null;
  }>({
    score: 0,
    strikes: 0,
    timeLeft: mode === 'ZEN' ? 90 : mode === 'ARCADE' ? 60 : 0,
    fruitsCutThisGame: 0,
    bombsDodgedThisGame: 0,
    maxComboThisGame: 0,
    fruits: [],
    splatters: [],
    particles: [],
    floatingTexts: [],
    bladePoints: [],
    isSwiping: false,
    lastSwipeTime: 0,
    lastSwishSoundTime: 0,
    comboTracker: { count: 0, timer: 0 },
    powerupFreezeTimer: 0,
    powerupDoubleTimer: 0,
    powerupFrenzyTimer: 0,
    screenShake: 0,
    screenFlash: 0,
    nextSpawnTimer: 60,
    lastTimestamp: 0,
    titleFruit: null,
  });

  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Reset or setup round when status or mode changes
  useEffect(() => {
    const s = stateRef.current;
    if (status === 'PLAYING') {
      s.score = 0;
      s.strikes = 0;
      s.timeLeft = mode === 'ZEN' ? 90 : mode === 'ARCADE' ? 60 : 0;
      s.fruitsCutThisGame = 0;
      s.bombsDodgedThisGame = 0;
      s.maxComboThisGame = 0;
      s.fruits = [];
      s.splatters = [];
      s.particles = [];
      s.floatingTexts = [];
      s.bladePoints = [];
      s.comboTracker = { count: 0, timer: 0 };
      s.powerupFreezeTimer = 0;
      s.powerupDoubleTimer = 0;
      s.powerupFrenzyTimer = 0;
      s.screenShake = 0;
      s.screenFlash = 0;
      s.nextSpawnTimer = 30; // first wave soon
      s.titleFruit = null;

      onScoreChange(0);
      onStrikesChange(0);
      if (mode !== 'CLASSIC') onTimeChange(s.timeLeft);
    } else if (status === 'TITLE_MENU') {
      s.titleFruit = {
        id: 'title_melon',
        variety: 'WATERMELON',
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.58,
        vx: 0,
        vy: 0,
        rotation: 0,
        vRot: 0.015,
        radius: 54,
        sliced: false,
        config: FRUIT_CONFIGS.WATERMELON,
        spawnTime: performance.now(),
      };
    }
  }, [status, mode, onScoreChange, onStrikesChange, onTimeChange]);

  // Current blade & dojo themes
  const currentBlade = BLADE_THEMES.find((b) => b.id === selectedBlade) || BLADE_THEMES[0];
  const currentDojo = DOJO_THEMES.find((d) => d.id === selectedDojo) || DOJO_THEMES[0];

  // Spawn random fruits/bombs wave
  const spawnWave = useCallback((width: number, height: number, isFrenzy = false) => {
    const s = stateRef.current;
    const waveCount = isFrenzy ? Math.floor(Math.random() * 4) + 4 : Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < waveCount; i++) {
      // Pick variety
      let variety: FruitVariety;

      // Bomb chance (only in CLASSIC and ARCADE)
      const allowBomb = mode === 'CLASSIC' || mode === 'ARCADE';
      const bombChance = mode === 'CLASSIC' ? 0.22 : 0.18;
      const roll = Math.random();

      if (allowBomb && !isFrenzy && roll < bombChance) {
        variety = 'BOMB';
      } else if (mode === 'ARCADE' && !isFrenzy && roll > 0.88) {
        // Special arcade powerup fruit
        const powerups: FruitVariety[] = ['FREEZE_BANANA', 'FRENZY_MELON', 'DOUBLE_BERRY'];
        variety = powerups[Math.floor(Math.random() * powerups.length)];
      } else {
        variety = STANDARD_FRUIT_VARIETIES[Math.floor(Math.random() * STANDARD_FRUIT_VARIETIES.length)];
      }

      const cfg = FRUIT_CONFIGS[variety];

      // Spawn location and trajectory (arc from bottom)
      const spawnX = (width * 0.15) + Math.random() * (width * 0.7);
      const spawnY = height + 40;

      // Velocity towards center
      const targetX = (width * 0.3) + Math.random() * (width * 0.4);
      const vx = (targetX - spawnX) * (0.012 + Math.random() * 0.008);
      // vy scaled with screen height for nice gravity peak
      const vy = -Math.sqrt(2 * 0.38 * (height * (0.55 + Math.random() * 0.28)));

      const fruit: FruitItem = {
        id: `fruit_${Date.now()}_${Math.random()}`,
        variety,
        x: spawnX,
        y: spawnY,
        vx,
        vy,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        radius: cfg.radius,
        sliced: false,
        config: cfg,
        spawnTime: performance.now(),
      };

      s.fruits.push(fruit);
    }
  }, [mode]);

  // Handle slicing an item
  const sliceItem = useCallback(
    (item: FruitItem, cutAngle: number) => {
      const s = stateRef.current;
      item.sliced = true;

      // If it's a bomb
      if (item.config.isBomb) {
        audio.playExplosion();
        s.screenShake = 35;
        s.screenFlash = 1.0;

        // Smoke & spark particles
        for (let i = 0; i < 40; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 10;
          s.particles.push({
            id: `p_${Math.random()}`,
            x: item.x,
            y: item.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            color: Math.random() > 0.4 ? '#ef4444' : '#f97316',
            radius: 3 + Math.random() * 4,
            life: 40,
            maxLife: 40,
            shape: 'SPARK',
          });
        }

        if (mode === 'CLASSIC') {
          // Instant Game Over
          s.strikes = 3;
          onStrikesChange(3);
          onGameOver(s.score, s.fruitsCutThisGame, s.maxComboThisGame, s.bombsDodgedThisGame);
        } else if (mode === 'ARCADE') {
          // Deduct 10 points and break combo
          s.score = Math.max(0, s.score - 10);
          onScoreChange(s.score);
          s.comboTracker = { count: 0, timer: 0 };
          s.floatingTexts.push({
            id: `ft_${Math.random()}`,
            text: '-10 BOMB!',
            x: item.x,
            y: item.y - 15,
            color: '#ef4444',
            scale: 1.2,
            opacity: 1,
            vy: -2,
          });
        }
        return;
      }

      // It's a fruit!
      audio.playSplat(0.9 + Math.random() * 0.3);
      s.fruitsCutThisGame += 1;
      onFruitSliced(item.variety);

      // Check combo
      s.comboTracker.count += 1;
      s.comboTracker.timer = 22; // ~350ms window to chain more cuts into combo

      // Points calculation
      let pts = item.config.points;
      if (s.powerupDoubleTimer > 0) {
        pts *= 2;
      }
      s.score += pts;
      onScoreChange(s.score);

      // Create two halves flying apart perpendicular to cut angle
      const spread = 4.5 + Math.random() * 2;
      const normalX = -Math.sin(cutAngle);
      const normalY = Math.cos(cutAngle);

      item.halves = [
        {
          x: item.x,
          y: item.y,
          vx: item.vx + normalX * spread,
          vy: item.vy + normalY * spread - 1.5,
          rotation: cutAngle,
          vRot: 0.08 + Math.random() * 0.08,
          cutAngle,
          side: 1,
          radius: item.radius,
          config: item.config,
          opacity: 1,
        },
        {
          x: item.x,
          y: item.y,
          vx: item.vx - normalX * spread,
          vy: item.vy - normalY * spread - 1.5,
          rotation: cutAngle + Math.PI,
          vRot: -(0.08 + Math.random() * 0.08),
          cutAngle: cutAngle + Math.PI,
          side: -1,
          radius: item.radius,
          config: item.config,
          opacity: 1,
        },
      ];

      // Add permanent/long-lived splatter to dojo wood
      const dots: Array<{ dx: number; dy: number; r: number }> = [];
      for (let d = 0; d < 6; d++) {
        dots.push({
          dx: (Math.random() - 0.5) * (item.radius * 2.2),
          dy: (Math.random() - 0.5) * (item.radius * 2.2),
          r: 2 + Math.random() * 6,
        });
      }
      s.splatters.push({
        id: `splat_${Math.random()}`,
        x: item.x,
        y: item.y,
        color: item.config.splatterColor,
        radius: item.radius * (0.45 + Math.random() * 0.25),
        opacity: 0.85,
        dots,
      });
      // Cap max splatters to 25 to prevent memory pressure
      if (s.splatters.length > 25) {
        s.splatters.shift();
      }

      // Juice droplets & seed particles
      const numJuice = 16;
      for (let p = 0; p < numJuice; p++) {
        const pAng = Math.random() * Math.PI * 2;
        const pSpeed = 2 + Math.random() * 7;
        const isSeed = item.config.variety === 'WATERMELON' && Math.random() > 0.6;

        s.particles.push({
          id: `p_${Math.random()}`,
          x: item.x,
          y: item.y,
          vx: Math.cos(pAng) * pSpeed,
          vy: Math.sin(pAng) * pSpeed - 2,
          color: isSeed ? '#18181b' : item.config.fleshColor,
          radius: isSeed ? 2.5 : 2.5 + Math.random() * 3.5,
          life: 45,
          maxLife: 45,
          gravity: 0.35,
          shape: isSeed ? 'SEED' : 'CIRCLE',
        });
      }

      // Blade skin particles
      for (let bp = 0; bp < 8; bp++) {
        const bpAng = Math.random() * Math.PI * 2;
        s.particles.push({
          id: `bp_${Math.random()}`,
          x: item.x,
          y: item.y,
          vx: Math.cos(bpAng) * (2 + Math.random() * 4),
          vy: Math.sin(bpAng) * (2 + Math.random() * 4),
          color: currentBlade.particleColor,
          radius: 3 + Math.random() * 3,
          life: 30,
          maxLife: 30,
          shape: currentBlade.particleType,
          rotation: Math.random() * Math.PI,
        });
      }

      // Floating score point indicator
      s.floatingTexts.push({
        id: `ft_${Math.random()}`,
        text: `+${pts}`,
        x: item.x,
        y: item.y - 12,
        color: item.config.fleshColor,
        scale: 1,
        opacity: 1,
        vy: -1.8,
      });

      // Special powerup triggers
      if (item.config.isPowerup) {
        if (item.config.powerupType === 'FREEZE') {
          audio.playFreeze();
          s.powerupFreezeTimer = 300; // ~5 seconds at 60fps
          s.floatingTexts.push({
            id: `ft_freeze_${Math.random()}`,
            text: 'FREEZE!',
            x: item.x,
            y: item.y - 45,
            color: '#38bdf8',
            scale: 1.4,
            opacity: 1,
            vy: -2,
          });
        } else if (item.config.powerupType === 'FRENZY') {
          audio.playFrenzy();
          s.powerupFrenzyTimer = 240; // ~4 seconds
          s.floatingTexts.push({
            id: `ft_frenzy_${Math.random()}`,
            text: 'FRUIT FRENZY!',
            x: item.x,
            y: item.y - 45,
            color: '#facc15',
            scale: 1.4,
            opacity: 1,
            vy: -2,
          });
        } else if (item.config.powerupType === 'DOUBLE') {
          audio.playCombo(4);
          s.powerupDoubleTimer = 360; // ~6 seconds
          s.floatingTexts.push({
            id: `ft_double_${Math.random()}`,
            text: '2X POINTS!',
            x: item.x,
            y: item.y - 45,
            color: '#c084fc',
            scale: 1.4,
            opacity: 1,
            vy: -2,
          });
        }
      }
    },
    [
      mode,
      currentBlade,
      onStrikesChange,
      onGameOver,
      onFruitSliced,
      onScoreChange,
    ]
  );

  // Check collision between a blade swipe segment and fruits
  const checkBladeCut = useCallback(
    (p1: BladePoint, p2: BladePoint) => {
      const s = stateRef.current;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq < 4) return; // Ignore microscopic jitter

      const cutAngle = Math.atan2(dy, dx);

      // Check Title Screen watermelon
      if (status === 'TITLE_MENU' && s.titleFruit && !s.titleFruit.sliced) {
        const tf = s.titleFruit;
        const u = Math.max(0, Math.min(1, ((tf.x - p1.x) * dx + (tf.y - p1.y) * dy) / lenSq));
        const nearX = p1.x + u * dx;
        const nearY = p1.y + u * dy;
        const distSq = (tf.x - nearX) ** 2 + (tf.y - nearY) ** 2;

        if (distSq <= tf.radius ** 2) {
          audio.playSplat(1.0);
          tf.sliced = true;
          // Spawn big splash particles
          for (let p = 0; p < 25; p++) {
            const pAng = Math.random() * Math.PI * 2;
            s.particles.push({
              id: `p_title_${Math.random()}`,
              x: tf.x,
              y: tf.y,
              vx: Math.cos(pAng) * (4 + Math.random() * 8),
              vy: Math.sin(pAng) * (4 + Math.random() * 8),
              color: '#ef4444',
              radius: 3 + Math.random() * 4,
              life: 50,
              maxLife: 50,
              shape: 'CIRCLE',
            });
          }
          setTimeout(() => {
            onStartGame();
          }, 250);
        }
        return;
      }

      if (status !== 'PLAYING') return;

      s.fruits.forEach((fruit) => {
        if (fruit.sliced) return;

        // Project circle center onto segment p1->p2
        const u = Math.max(0, Math.min(1, ((fruit.x - p1.x) * dx + (fruit.y - p1.y) * dy) / lenSq));
        const nearX = p1.x + u * dx;
        const nearY = p1.y + u * dy;
        const distSq = (fruit.x - nearX) ** 2 + (fruit.y - nearY) ** 2;

        if (distSq <= fruit.radius ** 2) {
          sliceItem(fruit, cutAngle);
        }
      });
    },
    [status, sliceItem, onStartGame]
  );

  // Input handlers (Pointer events handle both mouse & touch effortlessly)
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = stateRef.current;
    s.isSwiping = true;
    s.bladePoints = [{ x, y, time: performance.now() }];
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const s = stateRef.current;
      if (!s.isSwiping) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();

      const prev = s.bladePoints[s.bladePoints.length - 1];
      if (prev) {
        const dist = Math.hypot(x - prev.x, y - prev.y);
        const dt = Math.max(1, now - prev.time);
        const speed = dist / dt; // px per ms

        // Play sword swoosh when swiping quickly (throttled to every 180ms)
        if (speed > 1.2 && now - s.lastSwishSoundTime > 180) {
          audio.playSwish(speed);
          s.lastSwishSoundTime = now;
        }

        // Test collision with fruits along this path
        checkBladeCut(prev, { x, y, time: now });
      }

      s.bladePoints.push({ x, y, time: now });

      // Keep only recent points for sleek trail
      if (s.bladePoints.length > 16) {
        s.bladePoints.shift();
      }
    },
    [checkBladeCut]
  );

  const handlePointerUp = useCallback(() => {
    const s = stateRef.current;
    s.isSwiping = false;
  }, []);

  // Main 60 FPS Game Physics & Render Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const renderer = new CanvasRenderer(ctx, canvas.width, canvas.height);
    rendererRef.current = renderer;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      renderer.resize(w, h);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let secondAccumulator = 0;

    const gameLoop = (timestamp: number) => {
      const s = stateRef.current;
      if (!s.lastTimestamp) s.lastTimestamp = timestamp;
      const delta = Math.min(timestamp - s.lastTimestamp, 64);
      s.lastTimestamp = timestamp;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // Time dilation (Freeze powerup slows down physics)
      const timeScale = s.powerupFreezeTimer > 0 ? 0.38 : 1.0;
      if (s.powerupFreezeTimer > 0) {
        s.powerupFreezeTimer -= 1;
      }
      if (s.powerupDoubleTimer > 0) {
        s.powerupDoubleTimer -= 1;
      }
      if (s.powerupFrenzyTimer > 0) {
        s.powerupFrenzyTimer -= 1;
        // Launch rapid fruits during frenzy!
        if (s.powerupFrenzyTimer % 18 === 0) {
          spawnWave(w, h, true);
        }
      }

      // Screen shake decay
      if (s.screenShake > 0) {
        s.screenShake *= 0.88;
        if (s.screenShake < 0.5) s.screenShake = 0;
      }
      // Screen flash decay
      if (s.screenFlash > 0) {
        s.screenFlash *= 0.86;
        if (s.screenFlash < 0.02) s.screenFlash = 0;
      }

      // Fade out old blade trail points
      const now = performance.now();
      s.bladePoints = s.bladePoints.filter((p) => now - p.time < 140);

      // Fade splatters slowly over time
      s.splatters.forEach((splat) => {
        splat.opacity -= 0.0001;
      });
      s.splatters = s.splatters.filter((splat) => splat.opacity > 0.05);

      // Handle Game Timer (in Zen and Arcade)
      if (status === 'PLAYING' && (mode === 'ZEN' || mode === 'ARCADE')) {
        secondAccumulator += delta;
        if (secondAccumulator >= 1000) {
          secondAccumulator -= 1000;
          s.timeLeft -= 1;
          onTimeChange(s.timeLeft);

          if (s.timeLeft <= 0) {
            onGameOver(s.score, s.fruitsCutThisGame, s.maxComboThisGame, s.bombsDodgedThisGame);
          }
        }
      }

      // Combo expiration check
      if (s.comboTracker.timer > 0) {
        s.comboTracker.timer -= 1;
        if (s.comboTracker.timer <= 0) {
          if (s.comboTracker.count >= 3) {
            const count = s.comboTracker.count;
            const bonusPts = count >= 5 ? 8 : count === 4 ? 5 : 3;
            s.score += bonusPts;
            onScoreChange(s.score);
            audio.playCombo(count);
            onCombo(count);

            if (count > s.maxComboThisGame) {
              s.maxComboThisGame = count;
            }

            s.floatingTexts.push({
              id: `combo_${Math.random()}`,
              text: `${count}x COMBO! +${bonusPts}`,
              x: w / 2,
              y: h * 0.35,
              color: '#38bdf8',
              scale: 1.5,
              opacity: 1,
              vy: -1.5,
            });
          }
          s.comboTracker.count = 0;
        }
      }

      // Spawn waves in playing state
      if (status === 'PLAYING') {
        s.nextSpawnTimer -= 1 * timeScale;
        if (s.nextSpawnTimer <= 0) {
          spawnWave(w, h, false);
          // Frequency scales subtly with score
          const baseInterval = Math.max(65, 120 - Math.floor(s.score / 25) * 5);
          s.nextSpawnTimer = baseInterval + Math.random() * 30;
        }
      }

      // Physics update: Whole fruits
      const gravity = 0.36 * timeScale;
      for (let i = s.fruits.length - 1; i >= 0; i--) {
        const f = s.fruits[i];

        if (!f.sliced) {
          f.x += f.vx * timeScale;
          f.y += f.vy * timeScale;
          f.vy += gravity;
          f.rotation += f.vRot * timeScale;

          // Dropped fruit check (fallen off screen bottom)
          if (f.y > h + 90 && f.vy > 0) {
            if (status === 'PLAYING') {
              if (f.config.isBomb) {
                // Good job dodging a bomb!
                s.bombsDodgedThisGame += 1;
                onBombDodged();
              } else if (mode === 'CLASSIC') {
                // Lost a strike for dropping fruit!
                audio.playStrike();
                s.strikes += 1;
                onStrikesChange(s.strikes);
                s.floatingTexts.push({
                  id: `miss_${Math.random()}`,
                  text: 'STRIKE X',
                  x: Math.max(40, Math.min(w - 40, f.x)),
                  y: h - 50,
                  color: '#ef4444',
                  scale: 1.3,
                  opacity: 1,
                  vy: -1.2,
                });

                if (s.strikes >= 3) {
                  onGameOver(s.score, s.fruitsCutThisGame, s.maxComboThisGame, s.bombsDodgedThisGame);
                }
              }
            }
            s.fruits.splice(i, 1);
            continue;
          }
        }

        // Halves physics
        if (f.halves) {
          f.halves.forEach((hItem) => {
            hItem.x += hItem.vx * timeScale;
            hItem.y += hItem.vy * timeScale;
            hItem.vy += gravity * 1.1;
            hItem.rotation += hItem.vRot * timeScale;
            hItem.opacity -= 0.007 * timeScale;
          });

          // Remove if both halves have fallen off
          if (f.halves.every((hItem) => hItem.y > h + 150 || hItem.opacity <= 0)) {
            s.fruits.splice(i, 1);
          }
        }
      }

      // Title fruit gentle idle motion
      if (status === 'TITLE_MENU' && s.titleFruit && !s.titleFruit.sliced) {
        s.titleFruit.rotation += s.titleFruit.vRot;
        s.titleFruit.y = (h * 0.58) + Math.sin(now * 0.003) * 8;
      }

      // Particles physics
      for (let pIdx = s.particles.length - 1; pIdx >= 0; pIdx--) {
        const p = s.particles[pIdx];
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        if (p.gravity) p.vy += p.gravity * timeScale;
        p.life -= 1 * timeScale;
        if (p.rotation !== undefined) p.rotation += 0.04;
        if (p.life <= 0) s.particles.splice(pIdx, 1);
      }

      // Floating texts update
      for (let tIdx = s.floatingTexts.length - 1; tIdx >= 0; tIdx--) {
        const ft = s.floatingTexts[tIdx];
        ft.y += ft.vy;
        ft.opacity -= 0.02;
        ft.scale = Math.max(0.7, ft.scale * 0.99);
        if (ft.opacity <= 0) s.floatingTexts.splice(tIdx, 1);
      }

      // RENDER PASS
      ctx.save();

      // Screen shake translation
      if (s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Draw Dojo Board Background
      renderer.drawBackground(currentDojo);

      // 2. Draw splatters on wood
      renderer.drawSplatters(s.splatters);

      // 3. Draw Title Watermelon if on menu
      if (status === 'TITLE_MENU' && s.titleFruit) {
        renderer.drawFruit(s.titleFruit);

        // "SLICE TO PLAY" guide label
        if (!s.titleFruit.sliced) {
          ctx.save();
          ctx.font = '800 22px "Outfit", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 4;
          ctx.textAlign = 'center';
          ctx.strokeText('SWIPE TO SLICE & PLAY', s.titleFruit.x, s.titleFruit.y + 75);
          ctx.fillText('SWIPE TO SLICE & PLAY', s.titleFruit.x, s.titleFruit.y + 75);

          // Animated swipe dashed guide arrow
          const arrowOffset = Math.sin(now * 0.006) * 20;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.moveTo(s.titleFruit.x - 70 + arrowOffset, s.titleFruit.y - 45);
          ctx.lineTo(s.titleFruit.x + 70 + arrowOffset, s.titleFruit.y + 45);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }

      // 4. Draw Fruit Halves
      s.fruits.forEach((f) => {
        if (f.halves) {
          f.halves.forEach((hItem) => renderer.drawFruitHalf(hItem));
        }
      });

      // 5. Draw Whole Fruits
      s.fruits.forEach((f) => {
        if (!f.sliced) renderer.drawFruit(f);
      });

      // 6. Draw Particles
      renderer.drawParticles(s.particles);

      // 7. Draw Blade Trail
      renderer.drawBladeTrail(s.bladePoints, currentBlade);

      // 8. Draw Floating Score Popups
      renderer.drawFloatingTexts(s.floatingTexts);

      // 9. Freeze ice vignette effect when active
      if (s.powerupFreezeTimer > 0) {
        ctx.save();
        const iceGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.7);
        iceGrad.addColorStop(0, 'transparent');
        iceGrad.addColorStop(1, 'rgba(56, 189, 248, 0.28)');
        ctx.fillStyle = iceGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // 10. Bomb Explosion White/Red Flash
      if (s.screenFlash > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(239, 68, 68, ${s.screenFlash * 0.5})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [
    status,
    mode,
    currentBlade,
    currentDojo,
    spawnWave,
    onTimeChange,
    onScoreChange,
    onGameOver,
    onStrikesChange,
    onBombDodged,
    onCombo,
  ]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none select-none"
    />
  );
};
