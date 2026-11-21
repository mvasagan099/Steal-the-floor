// Dynamic high-DPI canvas texture generator for Phaser 3
import Phaser from 'phaser';

export interface ThemeColors {
  name: string;
  tileFixed: string;
  tileFixedSide: string;
  tileBridge: string;
  tileBridgeSide: string;
  tileSticky: string;
  tileCrumbling: string;
  tileRock: string;
  bgGradTop: string;
  bgGradBottom: string;
  accent: string;
}

export const THEME_PALETTES: Record<string, ThemeColors> = {
  'floating-sky': {
    name: 'Floating Sky',
    tileFixed: '#38bdf8',
    tileFixedSide: '#0284c7',
    tileBridge: '#60a5fa',
    tileBridgeSide: '#2563eb',
    tileSticky: '#a855f7',
    tileCrumbling: '#94a3b8',
    tileRock: '#475569',
    bgGradTop: '#1e3a8a',
    bgGradBottom: '#0f172a',
    accent: '#38bdf8',
  },
  'candy-world': {
    name: 'Candy World',
    tileFixed: '#f472b6',
    tileFixedSide: '#db2777',
    tileBridge: '#fb7185',
    tileBridgeSide: '#e11d48',
    tileSticky: '#c084fc',
    tileCrumbling: '#fed7aa',
    tileRock: '#831843',
    bgGradTop: '#831843',
    bgGradBottom: '#3b0764',
    accent: '#f472b6',
  },
  'ocean-islands': {
    name: 'Ocean Islands',
    tileFixed: '#2dd4bf',
    tileFixedSide: '#0d9488',
    tileBridge: '#38bdf8',
    tileBridgeSide: '#0284c7',
    tileSticky: '#f43f5e',
    tileCrumbling: '#fde047',
    tileRock: '#134e4a',
    bgGradTop: '#115e59',
    bgGradBottom: '#042f2e',
    accent: '#2dd4bf',
  },
  'neon-space': {
    name: 'Neon Space',
    tileFixed: '#c084fc',
    tileFixedSide: '#7e22ce',
    tileBridge: '#38bdf8',
    tileBridgeSide: '#0284c7',
    tileSticky: '#ec4899',
    tileCrumbling: '#64748b',
    tileRock: '#3b0764',
    bgGradTop: '#2e1065',
    bgGradBottom: '#090514',
    accent: '#c084fc',
  },
  'forest-adventure': {
    name: 'Forest Adventure',
    tileFixed: '#4ade80',
    tileFixedSide: '#16a34a',
    tileBridge: '#a3e635',
    tileBridgeSide: '#65a30d',
    tileSticky: '#d97706',
    tileCrumbling: '#a8a29e',
    tileRock: '#3f3f46',
    bgGradTop: '#14532d',
    bgGradBottom: '#052e16',
    accent: '#4ade80',
  },
  'arctic-frost': {
    name: 'Arctic Frost',
    tileFixed: '#67e8f9',
    tileFixedSide: '#0891b2',
    tileBridge: '#bae6fd',
    tileBridgeSide: '#0284c7',
    tileSticky: '#a78bfa',
    tileCrumbling: '#cbd5e1',
    tileRock: '#334155',
    bgGradTop: '#0c4a6e',
    bgGradBottom: '#082f49',
    accent: '#67e8f9',
  },
};

const PAIR_COLORS = [
  { primary: '#38bdf8', dark: '#0284c7', barrier: '#f43f5e', barrierGlow: '#fda4af', label: 'A' },
  { primary: '#f59e0b', dark: '#b45309', barrier: '#fb923c', barrierGlow: '#fed7aa', label: 'B' },
];

const PORTAL_COLORS = [
  { outer: '#c084fc', inner: '#f472b6', core: '#f0abfc', bg: '#2e1065', side: '#1e053a', label: 'I' },
  { outer: '#2dd4bf', inner: '#38bdf8', core: '#a7f3d0', bg: '#042f2e', side: '#021d1c', label: 'II' },
];

export function generateAllTextures(scene: Phaser.Scene, themeId = 'floating-sky', skinColor = '#f59e0b'): void {
  const palette = THEME_PALETTES[themeId] || THEME_PALETTES['floating-sky'];
  const S = 128;

  const createCanvas = (key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    draw(ctx);
    scene.textures.addCanvas(key, canvas);
  };

  const createTile = (
    key: string,
    drawFace: (ctx: CanvasRenderingContext2D, s: number) => void,
    sideColor = '#1e293b'
  ) => {
    createCanvas(key, S, S, (ctx) => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 10;

      const r = 24;
      const topHeight = S - 20;

      ctx.fillStyle = sideColor;
      ctx.beginPath();
      ctx.roundRect(8, 12, S - 16, topHeight + 10, r);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.roundRect(8, 8, S - 16, topHeight - 8, r);
      ctx.clip();

      drawFace(ctx, S);
    });
  };

  // 0. Subtle Void Grid Slot (visualizes board dimensions & touch targets)
  createCanvas('tile_void', S, S, (ctx) => {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.roundRect(14, 14, S - 28, S - 36, 20);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(14, 14, S - 28, S - 36, 20);
    ctx.stroke();

    // Faint center dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(S / 2, S / 2 - 4, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 1. Fixed Platform
  createTile('tile_fixed', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, palette.tileFixed);
    grad.addColorStop(1, palette.tileFixedSide);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, S - 20, S - 32);
  }, palette.tileFixedSide);

  // 1b. Start Island (fixed platform with subtle spawn emblem)
  createTile('tile_start', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, palette.tileFixed);
    grad.addColorStop(1, palette.tileFixedSide);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, S - 20, S - 32);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
    ctx.beginPath();
    ctx.arc(64, 52, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 64, 54);
  }, palette.tileFixedSide);

  // 2. Bridge / Reusable Tile
  createTile('tile_bridge', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, '#67e8f9');
    grad.addColorStop(1, palette.tileBridge);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(35, 12); ctx.lineTo(35, S - 20);
    ctx.moveTo(S - 35, 12); ctx.lineTo(S - 35, S - 20);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, S - 24, S - 34);
  }, palette.tileBridgeSide);

  // 3. Sticky Ground
  createTile('tile_sticky', (ctx) => {
    ctx.fillStyle = palette.tileSticky;
    ctx.fillRect(0, 0, S, S);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(36, 36, 14, 0, Math.PI * 2);
    ctx.arc(88, 54, 18, 0, Math.PI * 2);
    ctx.arc(50, 75, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(64, 52, 12, 0, Math.PI * 2);
    ctx.fill();
  }, '#581c87');

  // 4. Crumbling Ground
  createTile('tile_crumbling', (ctx) => {
    ctx.fillStyle = palette.tileCrumbling;
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(24, 18); ctx.lineTo(56, 48); ctx.lineTo(38, 82);
    ctx.moveTo(56, 48); ctx.lineTo(102, 42);
    ctx.moveTo(62, 66); ctx.lineTo(96, 88);
    ctx.stroke();
  }, '#334155');

  // 5. Rock Obstacle
  createTile('tile_rock', (ctx) => {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, S, S);

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(20, 20); ctx.lineTo(70, 15); ctx.lineTo(110, 40); ctx.lineTo(90, 85); ctx.lineTo(30, 80);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(35, 25); ctx.lineTo(70, 20); ctx.lineTo(60, 55); ctx.lineTo(30, 45);
    ctx.closePath();
    ctx.fill();
  }, '#1e293b');

  // 6. One-Way Chevrons
  ['up', 'down', 'left', 'right'].forEach((dir) => {
    createTile(`tile_oneway_${dir}`, (ctx) => {
      ctx.fillStyle = palette.tileFixed;
      ctx.fillRect(0, 0, S, S);

      ctx.save();
      ctx.translate(64, 50);
      if (dir === 'down') ctx.rotate(Math.PI);
      if (dir === 'left') ctx.rotate(-Math.PI / 2);
      if (dir === 'right') ctx.rotate(Math.PI / 2);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(26, 10);
      ctx.lineTo(11, 10);
      ctx.lineTo(11, 26);
      ctx.lineTo(-11, 26);
      ctx.lineTo(-11, 10);
      ctx.lineTo(-26, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }, palette.tileFixedSide);
  });

  // 7, 8, 9. Color-coded Switch & Door Pairs (Pair 0 = Cyan/A, Pair 1 = Amber/B)
  PAIR_COLORS.forEach((pair, idx) => {
    createTile(`tile_switch_${idx}`, (ctx) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, S, S);

      ctx.fillStyle = pair.dark;
      ctx.beginPath();
      ctx.arc(64, 50, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pair.primary;
      ctx.beginPath();
      ctx.arc(64, 46, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pair.label, 64, 48);
    }, '#0f172a');

    createTile(`tile_door_closed_${idx}`, (ctx) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, S, S);

      ctx.fillStyle = pair.barrier;
      ctx.fillRect(20, 20, S - 40, 11);
      ctx.fillRect(20, 42, S - 40, 11);
      ctx.fillRect(20, 64, S - 40, 11);

      // Pair badge pill
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(64, 48, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pair.primary;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = pair.primary;
      ctx.font = '900 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pair.label, 64, 49);
    }, '#0f172a');

    createTile(`tile_door_open_${idx}`, (ctx) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(0, 0, S, S);

      ctx.strokeStyle = pair.primary;
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 5;
      ctx.strokeRect(16, 16, S - 32, S - 40);

      ctx.fillStyle = pair.primary;
      ctx.globalAlpha = 0.65;
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pair.label, 64, 50);
    }, '#0f172a');
  });

  // Backwards-compatible aliases
  if (scene.textures.exists('tile_switch_0')) {
    createTile('tile_switch', (ctx) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(64, 48, 24, 0, Math.PI * 2);
      ctx.fill();
    }, '#0f172a');
  }

  // 10. Color-coded Teleporter Pairs (Pair 0 = Violet/I, Pair 1 = Teal/II)
  PORTAL_COLORS.forEach((p, idx) => {
    createTile(`tile_teleporter_${idx}`, (ctx) => {
      ctx.fillStyle = p.bg;
      ctx.fillRect(0, 0, S, S);

      ctx.strokeStyle = p.outer;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(64, 50, 30, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = p.inner;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64, 50, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = p.core;
      ctx.beginPath();
      ctx.arc(64, 50, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.label, 64, 86);
    }, p.side);
  });

  // 11. Exit Flag Platform
  createTile('tile_exit', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#d97706');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    ctx.fillStyle = '#475569';
    ctx.fillRect(40, 18, 6, 68);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(46, 20);
    ctx.lineTo(94, 35);
    ctx.lineTo(46, 50);
    ctx.closePath();
    ctx.fill();
  }, '#92400e');

  // 12. Gem Collectible (distinct faceted cyan-gold crystal to disambiguate from Par Stars!)
  createCanvas('item_gem', 64, 64, (ctx) => {
    ctx.shadowColor = 'rgba(56, 189, 248, 0.85)';
    ctx.shadowBlur = 12;

    const grad = ctx.createLinearGradient(12, 8, 52, 56);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.4, '#38bdf8');
    grad.addColorStop(1, '#2563eb');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(32, 6);
    ctx.lineTo(54, 24);
    ctx.lineTo(32, 58);
    ctx.lineTo(10, 24);
    ctx.closePath();
    ctx.fill();

    // Crisp specular facets
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(32, 6);
    ctx.lineTo(42, 24);
    ctx.lineTo(22, 24);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 24);
    ctx.lineTo(54, 24);
    ctx.stroke();
  });

  // 12b. Ice Sliding Platform
  createTile('tile_ice', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.5, '#7dd3fc');
    grad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    // Glossy diagonal frost streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(26, 40);
    ctx.lineTo(54, 16);
    ctx.moveTo(32, 74);
    ctx.lineTo(94, 22);
    ctx.moveTo(68, 84);
    ctx.lineTo(104, 52);
    ctx.stroke();

    // Subtle crystal border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, S - 24, S - 34);
  }, '#0369a1');

  // 12c. Bonus Tile (+1 maxTiles pickup)
  createCanvas('item_bonus_tile', 64, 64, (ctx) => {
    ctx.shadowColor = 'rgba(250, 204, 21, 0.85)';
    ctx.shadowBlur = 10;

    const grad = ctx.createLinearGradient(8, 8, 56, 56);
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.5, '#38bdf8');
    grad.addColorStop(1, '#2563eb');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(10, 10, 44, 44, 11);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(10, 10, 44, 44, 11);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+1', 32, 33);
  });

  // Also keep item_star for ambient sparkles
  createCanvas('item_star', 64, 64, (ctx) => {
    const cx = 32, cy = 32, spikes = 5, outer = 24, inner = 10;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
      rot += step;
    }
    ctx.closePath();
    ctx.fillStyle = '#fef08a';
    ctx.fill();
  });

  // 13. Crisp Soft Particle Sprite (used for VFX bursts)
  createCanvas('fx_particle', 24, 24, (ctx) => {
    const grad = ctx.createRadialGradient(12, 12, 2, 12, 12, 11);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.85)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(12, 12, 11, 0, Math.PI * 2);
    ctx.fill();
  });

  // 14. Expressive Mascot Character ("Puff"): normal, worried (0 tiles), and joyful (win)
  const drawMascot = (key: string, mood: 'normal' | 'worried' | 'win') => {
    createCanvas(key, 96, 96, (ctx) => {
      const cx = 48, cy = 52, r = 36;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx, 88, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      const grad = ctx.createRadialGradient(cx - 10, cy - 12, 4, cx, cy, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, skinColor);
      grad.addColorStop(1, Phaser.Display.Color.HexStringToColor(skinColor).darken(25).rgba);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Blush cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(cx - 18, cy + 8, 6, 0, Math.PI * 2);
      ctx.arc(cx + 18, cy + 8, 6, 0, Math.PI * 2);
      ctx.fill();

      if (mood === 'win') {
        // Happy curved ^_^ eyes
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 2, 6, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 12, cy - 2, 6, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();

        // Big joyful grin
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx, cy + 5, 9, 0, Math.PI);
        ctx.fill();
      } else {
        // Round eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 12, cy - 4, mood === 'worried' ? 5.5 : 5, 0, Math.PI * 2);
        ctx.arc(cx + 12, cy - 4, mood === 'worried' ? 5.5 : 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 10, cy - 6, 2, 0, Math.PI * 2);
        ctx.arc(cx + 14, cy - 6, 2, 0, Math.PI * 2);
        ctx.fill();

        if (mood === 'worried') {
          // Small "o" mouth + blue sweat drop
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy + 9, 4.5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(cx + 26, cy - 20);
          ctx.quadraticCurveTo(cx + 32, cy - 10, cx + 26, cy - 7);
          ctx.quadraticCurveTo(cx + 20, cy - 10, cx + 26, cy - 20);
          ctx.fill();
        } else {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(cx, cy + 4, 7, 0.2, Math.PI - 0.2);
          ctx.stroke();
        }
      }

      // Antenna crown
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy - r - 12);
      ctx.stroke();

      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(cx, cy - r - 14, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  drawMascot('char_mascot', 'normal');
  drawMascot('char_mascot_worried', 'worried');
  drawMascot('char_mascot_win', 'win');

  // 15. Valid Move Glowing Ring
  createCanvas('highlight_valid', S, S, (ctx) => {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.roundRect(14, 14, S - 28, S - 38, 20);
    ctx.stroke();
  });
}
