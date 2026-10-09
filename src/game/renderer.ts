/**
 * HTML5 Canvas rendering engine for Dojo Slicer.
 * Handles fruits, 3D-shaded fruit cross-sections, blade trails, splatters, and particle systems.
 */

import {
  FruitItem,
  FruitHalf,
  Splatter,
  Particle,
  FloatingText,
  BladePoint,
  BladeTheme,
  DojoTheme,
} from './types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Draw the dojo board background (Cedar, Bamboo, or Midnight Tatami)
   */
  public drawBackground(dojo: DojoTheme) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Base tone
    ctx.fillStyle = dojo.primaryBg;
    ctx.fillRect(0, 0, w, h);

    if (dojo.boardTexture === 'CEDAR') {
      // Warm horizontal wood planks
      const plankHeight = 84;
      const numPlanks = Math.ceil(h / plankHeight);

      for (let i = 0; i < numPlanks; i++) {
        const y = i * plankHeight;
        // Subtle plank color variation
        const shade = (i % 2 === 0) ? '#241710' : '#2b1b13';
        ctx.fillStyle = shade;
        ctx.fillRect(0, y, w, plankHeight);

        // Plank seam shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, y + plankHeight - 2, w, 2);

        // Wood grain lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + 25);
        ctx.bezierCurveTo(w * 0.3, y + 20, w * 0.7, y + 30, w, y + 22);
        ctx.moveTo(0, y + 55);
        ctx.bezierCurveTo(w * 0.4, y + 60, w * 0.6, y + 50, w, y + 58);
        ctx.stroke();

        // Wooden pegs / nails at edges
        ctx.fillStyle = 'rgba(15, 10, 7, 0.8)';
        ctx.beginPath();
        ctx.arc(32, y + 16, 3, 0, Math.PI * 2);
        ctx.arc(w - 32, y + 16, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (dojo.boardTexture === 'BAMBOO') {
      // Vertical bamboo slats
      const slatWidth = 44;
      const numSlats = Math.ceil(w / slatWidth);

      for (let i = 0; i < numSlats; i++) {
        const x = i * slatWidth;
        ctx.fillStyle = (i % 2 === 0) ? '#0f172a' : '#131e33';
        ctx.fillRect(x, 0, slatWidth, h);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x + slatWidth - 2, 0, 2, h);

        // Bamboo nodes (horizontal notches)
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        const nodeY1 = ((i * 73) % (h - 100)) + 50;
        const nodeY2 = ((i * 127) % (h - 100)) + 50;
        ctx.fillRect(x, nodeY1, slatWidth, 3);
        ctx.fillRect(x, nodeY2, slatWidth, 3);
      }
    } else {
      // Midnight tatami grid
      const grid = 60;
      ctx.fillStyle = '#141416';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Vignette shadow around viewport edges
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Draw splatters on the dojo wood
   */
  public drawSplatters(splatters: Splatter[]) {
    const ctx = this.ctx;
    splatters.forEach((splat) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, splat.opacity);
      ctx.fillStyle = splat.color;

      // Central irregular pool
      ctx.beginPath();
      ctx.arc(splat.x, splat.y, splat.radius, 0, Math.PI * 2);
      ctx.fill();

      // Satellite droplets
      splat.dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(splat.x + dot.dx, splat.y + dot.dy, dot.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });
  }

  /**
   * Draw a whole fruit or bomb with realistic details and 3D lighting
   */
  public drawFruit(fruit: FruitItem) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(fruit.x, fruit.y);
    ctx.rotate(fruit.rotation);

    const r = fruit.radius;
    const cfg = fruit.config;

    // Power-up glowing aura
    if (cfg.isPowerup) {
      ctx.save();
      const auraGlow = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 1.55);
      auraGlow.addColorStop(0, cfg.rindColor);
      auraGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGlow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (cfg.isBomb) {
      // Cast shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, r + 4, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Charcoal sphere with spherical gradient
      const bombGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
      bombGrad.addColorStop(0, '#52525b');
      bombGrad.addColorStop(0.4, '#27272a');
      bombGrad.addColorStop(1, '#09090b');

      ctx.fillStyle = bombGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Bronze fuse cap
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-r * 0.25, -r - 4, r * 0.5, 6);

      // Curved fuse rope
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -r - 4);
      ctx.quadraticCurveTo(r * 0.4, -r - 14, r * 0.2, -r - 20);
      ctx.stroke();

      // Hazard skull / danger symbol
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -2, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(-r * 0.1, -4, 2, 0, Math.PI * 2);
      ctx.arc(r * 0.1, -4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-r * 0.18, 5, r * 0.36, 4);

    } else if (cfg.variety === 'WATERMELON') {
      // Green striped melon
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#22c55e');
      grad.addColorStop(0.7, '#15803d');
      grad.addColorStop(1, '#14532d');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Darker green wavy stripes
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 4;
      for (let s = -2; s <= 2; s++) {
        const offset = s * (r * 0.38);
        ctx.beginPath();
        ctx.moveTo(offset, -r * 0.9);
        ctx.bezierCurveTo(offset + 6, -r * 0.3, offset - 6, r * 0.3, offset, r * 0.9);
        ctx.stroke();
      }

      // Specular shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

    } else if (cfg.variety === 'ORANGE') {
      // Vibrant citrus
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fdba74');
      grad.addColorStop(0.6, '#f97316');
      grad.addColorStop(1, '#c2410c');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Stem & tiny green leaf
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(-r * 0.1, -r - 1, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Citrus pore dimples
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.25, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

    } else if (cfg.variety === 'APPLE') {
      // Crimson glossy apple with heart-like indent
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#f87171');
      grad.addColorStop(0.5, '#dc2626');
      grad.addColorStop(1, '#7f1d1d');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Brown stem
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -r + 2);
      ctx.quadraticCurveTo(3, -r - 8, 8, -r - 10);
      ctx.stroke();

      // Green leaf
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(7, -r - 6, 7, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.22, r * 0.14, -0.4, 0, Math.PI * 2);
      ctx.fill();

    } else if (cfg.variety === 'PINEAPPLE') {
      // Textured oval with spiky crown
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(1, '#854d0e');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 4, r * 0.82, r, 0, 0, Math.PI * 2);
      ctx.fill();

      // Diamond scale pattern
      ctx.strokeStyle = 'rgba(113, 63, 18, 0.5)';
      ctx.lineWidth = 2;
      for (let d = -r * 0.7; d <= r * 0.7; d += 14) {
        ctx.beginPath();
        ctx.moveTo(d - 12, -r * 0.5);
        ctx.lineTo(d + 12, r * 0.8);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(d + 12, -r * 0.5);
        ctx.lineTo(d - 12, r * 0.8);
        ctx.stroke();
      }

      // Spiky crown leaves
      ctx.fillStyle = '#15803d';
      for (let ang = -0.5; ang <= 0.5; ang += 0.25) {
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, -r + 6);
        ctx.lineTo(-6, -r - 16);
        ctx.lineTo(0, -r - 22);
        ctx.lineTo(6, -r - 16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

    } else if (cfg.variety === 'STRAWBERRY') {
      // Conical ruby strawberry
      const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#fb7185');
      grad.addColorStop(0.6, '#e11d48');
      grad.addColorStop(1, '#881337');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.3);
      ctx.quadraticCurveTo(-r * 0.7, r * 0.6, 0, r);
      ctx.quadraticCurveTo(r * 0.7, r * 0.6, r * 0.8, -r * 0.3);
      ctx.quadraticCurveTo(0, -r * 0.8, -r * 0.8, -r * 0.3);
      ctx.fill();

      // Tiny golden seeds
      ctx.fillStyle = '#fde047';
      const seeds = [
        { x: -8, y: -6 }, { x: 8, y: -6 }, { x: 0, y: 0 },
        { x: -10, y: 8 }, { x: 10, y: 8 }, { x: 0, y: 14 },
      ];
      seeds.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Green star cap
      ctx.fillStyle = '#16a34a';
      for (let c = 0; c < 5; c++) {
        ctx.save();
        ctx.rotate((c * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.3);
        ctx.lineTo(-4, -r * 0.7);
        ctx.lineTo(4, -r * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

    } else if (cfg.variety === 'BANANA' || cfg.variety === 'FREEZE_BANANA') {
      // Curved yellow or ice-cyan banana
      const isIce = cfg.variety === 'FREEZE_BANANA';
      ctx.strokeStyle = isIce ? '#0284c7' : '#ca8a04';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0.4, Math.PI - 0.4);
      ctx.stroke();

      ctx.strokeStyle = isIce ? '#7dd3fc' : '#fde047';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Brown tips
      ctx.fillStyle = isIce ? '#0369a1' : '#78350f';
      ctx.beginPath();
      ctx.arc(r * 0.75, r * 0.3, 4, 0, Math.PI * 2);
      ctx.arc(-r * 0.75, r * 0.3, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (cfg.variety === 'COCONUT') {
      // Dark brown fibrous husk
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(0.7, '#451a03');
      grad.addColorStop(1, '#290e02');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // 3 signature coconut eyes
      ctx.fillStyle = '#170801';
      ctx.beginPath();
      ctx.arc(-7, -8, 4, 0, Math.PI * 2);
      ctx.arc(7, -8, 4, 0, Math.PI * 2);
      ctx.arc(0, 2, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (cfg.variety === 'DRAGONFRUIT') {
      // Vibrant magenta dragonfruit with green flame scales
      const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      grad.addColorStop(0, '#f472b6');
      grad.addColorStop(0.6, '#ec4899');
      grad.addColorStop(1, '#be185d');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Green scales
      ctx.fillStyle = '#84cc16';
      for (let s = 0; s < 6; s++) {
        ctx.save();
        ctx.rotate((s * Math.PI) / 3);
        ctx.beginPath();
        ctx.moveTo(r * 0.7, -4);
        ctx.lineTo(r + 7, 0);
        ctx.lineTo(r * 0.7, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

    } else {
      // Fallback circular power-up fruit (Frenzy / Double)
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      grad.addColorStop(0, cfg.fleshColor);
      grad.addColorStop(0.8, cfg.primaryColor);
      grad.addColorStop(1, '#1e1b4b');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw sliced fruit half with detailed cross-section (rind, pulp, seeds, segments)
   */
  public drawFruitHalf(half: FruitHalf) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = Math.max(0, half.opacity);
    ctx.translate(half.x, half.y);
    ctx.rotate(half.rotation);

    const r = half.radius;
    const cfg = half.config;

    // Clip to a semi-circle along the cut angle
    ctx.save();
    ctx.beginPath();
    // Semi-circle: from cutAngle to cutAngle + PI
    ctx.arc(0, 0, r, 0, Math.PI);
    ctx.closePath();
    ctx.clip();

    // 1. Outer rind
    ctx.fillStyle = cfg.primaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI);
    ctx.fill();

    // 2. White pith / intermediate rind ring
    ctx.fillStyle = cfg.rindColor;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.88, 0, Math.PI);
    ctx.fill();

    // 3. Inner succulent flesh
    ctx.fillStyle = cfg.fleshColor;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, 0, Math.PI);
    ctx.fill();

    // Detailed internal fruit anatomy based on variety
    if (cfg.variety === 'WATERMELON') {
      // Crimson flesh + black teardrop seeds
      ctx.fillStyle = '#0f172a';
      const seeds = [
        { ang: 0.3, dist: 0.55 },
        { ang: 0.6, dist: 0.68 },
        { ang: 1.0, dist: 0.5 },
        { ang: 1.4, dist: 0.65 },
        { ang: 1.8, dist: 0.48 },
        { ang: 2.2, dist: 0.62 },
        { ang: 2.6, dist: 0.52 },
      ];
      seeds.forEach(s => {
        const sx = Math.cos(s.ang) * r * s.dist;
        const sy = Math.sin(s.ang) * r * s.dist;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 3, 2, s.ang, 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (cfg.variety === 'ORANGE') {
      // Citrus segments
      ctx.strokeStyle = '#ffedd5';
      ctx.lineWidth = 1.5;
      for (let a = 0.2; a <= Math.PI - 0.2; a += 0.4) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
        ctx.stroke();
      }

    } else if (cfg.variety === 'APPLE') {
      // Apple core star + 2 dark seeds
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.4, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(-4, 8, 3, 2, -0.3, 0, Math.PI * 2);
      ctx.ellipse(4, 8, 3, 2, 0.3, 0, Math.PI * 2);
      ctx.fill();

    } else if (cfg.variety === 'COCONUT') {
      // Thick pure white coconut meat with hollow dark center
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI);
      ctx.fill();

    } else if (cfg.variety === 'DRAGONFRUIT') {
      // Black poppy seed dots scattered in white pulp
      ctx.fillStyle = '#09090b';
      for (let s = 0; s < 12; s++) {
        const ang = 0.2 + (s * (Math.PI - 0.4)) / 12;
        const dist = 0.3 + ((s % 3) * 0.18);
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * r * dist, Math.sin(ang) * r * dist, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore(); // remove clip

    // Draw the bright flat cut slice line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw the dynamic sword blade trail ribbon with glow and customization
   */
  public drawBladeTrail(points: BladePoint[], theme: BladeTheme) {
    if (points.length < 2) return;
    const ctx = this.ctx;

    ctx.save();

    // 1. Outer colored blade aura
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const progress = i / (points.length - 1); // 0 at tail, 1 at knife tip

      const width = Math.max(1.5, progress * 14);

      // Glow pass
      ctx.strokeStyle = theme.glowColor;
      ctx.lineWidth = width * 1.8;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Main trail color
      ctx.strokeStyle = theme.trailColor;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Inner white core
      ctx.strokeStyle = theme.coreColor;
      ctx.lineWidth = Math.max(1, width * 0.4);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw particles (juice drops, sparks, frost, cherry petals, seeds)
   */
  public drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach((p) => {
      ctx.save();
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'SPARK') {
        // Glowing star / spark
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 2);
        ctx.lineTo(p.radius * 0.5, 0);
        ctx.lineTo(0, p.radius * 2);
        ctx.lineTo(-p.radius * 0.5, 0);
        ctx.closePath();
        ctx.fill();

      } else if (p.shape === 'PETAL') {
        // Sakura petal
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.5, p.radius * 0.8, 0.4, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.shape === 'FROST') {
        // Diamond frost crystal
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.moveTo(0, -p.radius);
        ctx.lineTo(p.radius, 0);
        ctx.lineTo(0, p.radius);
        ctx.lineTo(-p.radius, 0);
        ctx.closePath();
        ctx.fill();

      } else if (p.shape === 'SEED') {
        // Black teardrop seed
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Juicy round droplet
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  /**
   * Draw floating score & combo popups (+1, 3x COMBO, etc.)
   */
  public drawFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    texts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = '800 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text stroke for punchy arcade look
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, 0, 0);

      // Text fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    });
  }
}
