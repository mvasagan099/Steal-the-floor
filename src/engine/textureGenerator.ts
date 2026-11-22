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
  'clockwork-forge': {
    name: 'Clockwork Forge',
    tileFixed: '#fb923c',
    tileFixedSide: '#c2410c',
    tileBridge: '#fbbf24',
    tileBridgeSide: '#b45309',
    tileSticky: '#f43f5e',
    tileCrumbling: '#a8a29e',
    tileRock: '#44403c',
    bgGradTop: '#451a03',
    bgGradBottom: '#1c0a00',
    accent: '#fb923c',
  },
  'crate-sanctum': {
    name: 'Obsidian Sanctum',
    tileFixed: '#eab308',
    tileFixedSide: '#a16207',
    tileBridge: '#34d399',
    tileBridgeSide: '#059669',
    tileSticky: '#c084fc',
    tileCrumbling: '#94a3b8',
    tileRock: '#334155',
    bgGradTop: '#1e1b4b',
    bgGradBottom: '#09090b',
    accent: '#34d399',
  },
  'skyward-spire': {
    name: 'Skyward Spire',
    tileFixed: '#38bdf8',
    tileFixedSide: '#0369a1',
    tileBridge: '#fcd34d',
    tileBridgeSide: '#d97706',
    tileSticky: '#f472b6',
    tileCrumbling: '#cbd5e1',
    tileRock: '#334155',
    bgGradTop: '#0284c7',
    bgGradBottom: '#0f172a',
    accent: '#fcd34d',
  },
  'celestial-crown': {
    name: 'Celestial Crown',
    tileFixed: '#818cf8',
    tileFixedSide: '#4338ca',
    tileBridge: '#fbbf24',
    tileBridgeSide: '#b45309',
    tileSticky: '#f472b6',
    tileCrumbling: '#cbd5e1',
    tileRock: '#1e1b4b',
    bgGradTop: '#312e81',
    bgGradBottom: '#030712',
    accent: '#fde047',
  },
  'chrono-prism': {
    name: 'Chrono Prism',
    tileFixed: '#22d3ee',
    tileFixedSide: '#0e7490',
    tileBridge: '#e879f9',
    tileBridgeSide: '#a21caf',
    tileSticky: '#c084fc',
    tileCrumbling: '#cbd5e1',
    tileRock: '#312e81',
    bgGradTop: '#164e63',
    bgGradBottom: '#2e1065',
    accent: '#22d3ee',
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

export function generateAllTextures(
  scene: Phaser.Scene,
  themeId = 'floating-sky',
  skinColor = '#f59e0b',
  highContrast = false,
  tileSkinId = 'tile-classic'
): void {
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

    ctx.strokeStyle = highContrast ? 'rgba(255, 255, 255, 0.32)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = highContrast ? 4 : 3;
    ctx.beginPath();
    ctx.roundRect(14, 14, S - 28, S - 36, 20);
    ctx.stroke();

    // Faint center dot
    ctx.fillStyle = highContrast ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(S / 2, S / 2 - 4, highContrast ? 5 : 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 1. Fixed Platform
  createTile('tile_fixed', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, palette.tileFixed);
    grad.addColorStop(1, palette.tileFixedSide);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = highContrast ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = highContrast ? 7 : 4;
    ctx.strokeRect(10, 10, S - 20, S - 32);

    if (highContrast) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      [
        [24, 24],
        [S - 24, 24],
        [24, S - 42],
        [S - 24, S - 42],
      ].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, palette.tileFixedSide);

  // 1b. Start Island (fixed platform with subtle spawn emblem)
  createTile('tile_start', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, palette.tileFixed);
    grad.addColorStop(1, palette.tileFixedSide);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = highContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = highContrast ? 6 : 4;
    ctx.strokeRect(10, 10, S - 20, S - 32);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
    ctx.beginPath();
    ctx.arc(64, 52, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 64, 54);
  }, palette.tileFixedSide);

  // 2. Bridge / Reusable Tile (supports 7 custom procedural Bridge Tile Skins!)
  const bridgeSideMap: Record<string, string> = {
    'tile-classic': palette.tileBridgeSide,
    'tile-bamboo': '#78350f',
    'tile-circuit': '#083344',
    'tile-crystal': '#6366f1',
    'tile-obsidian': '#9a3412',
    'tile-celestial': '#1e1b4b',
    'tile-prism': '#86198f',
  };
  const activeBridgeSide = bridgeSideMap[tileSkinId] || palette.tileBridgeSide;

  createTile('tile_bridge', (ctx) => {
    if (tileSkinId === 'tile-prism') {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#22d3ee');
      grad.addColorStop(0.5, '#818cf8');
      grad.addColorStop(1, '#e879f9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Prismatic hourglass lattice
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(26, 20);
      ctx.lineTo(S - 26, 20);
      ctx.lineTo(26, 88);
      ctx.lineTo(S - 26, 88);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(64, 54, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (tileSkinId === 'tile-bamboo') {
      const grad = ctx.createLinearGradient(0, 0, 0, S);
      grad.addColorStop(0, '#fcd34d');
      grad.addColorStop(0.5, '#d97706');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Slatted bamboo planks
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.72)';
      ctx.lineWidth = 4;
      for (const y of [32, 58, 84]) {
        ctx.beginPath();
        ctx.moveTo(8, y);
        ctx.lineTo(S - 8, y);
        ctx.stroke();
      }
      // Brass corner rivets
      ctx.fillStyle = '#fef3c7';
      [
        [24, 22],
        [S - 24, 22],
        [24, 94],
        [S - 24, 94],
      ].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (tileSkinId === 'tile-circuit') {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#164e63');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Neon cyan PCB traces
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(22, 30);
      ctx.lineTo(48, 30);
      ctx.lineTo(64, 46);
      ctx.lineTo(104, 46);
      ctx.moveTo(24, 82);
      ctx.lineTo(58, 82);
      ctx.lineTo(74, 66);
      ctx.lineTo(104, 66);
      ctx.stroke();

      // Glowing magenta/cyan nodes
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(64, 56, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#67e8f9';
      [
        [22, 30],
        [104, 46],
        [24, 82],
        [104, 66],
      ].forEach(([nx, ny]) => {
        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (tileSkinId === 'tile-crystal') {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#f5d0fe');
      grad.addColorStop(0.5, '#67e8f9');
      grad.addColorStop(1, '#818cf8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Faceted diamond planes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.beginPath();
      ctx.moveTo(64, 14);
      ctx.lineTo(108, 54);
      ctx.lineTo(64, 54);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.beginPath();
      ctx.moveTo(64, 96);
      ctx.lineTo(20, 54);
      ctx.lineTo(64, 54);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(64, 14);
      ctx.lineTo(108, 54);
      ctx.lineTo(64, 96);
      ctx.lineTo(20, 54);
      ctx.closePath();
      ctx.stroke();
    } else if (tileSkinId === 'tile-obsidian') {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#27272a');
      grad.addColorStop(1, '#18181b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Molten forge cracks & rune diamond
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(22, 24);
      ctx.lineTo(48, 54);
      ctx.lineTo(22, 86);
      ctx.moveTo(S - 22, 24);
      ctx.lineTo(S - 48, 54);
      ctx.lineTo(S - 22, 86);
      ctx.stroke();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(64, 24);
      ctx.lineTo(86, 54);
      ctx.lineTo(64, 84);
      ctx.lineTo(42, 54);
      ctx.closePath();
      ctx.stroke();
    } else if (tileSkinId === 'tile-celestial') {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#312e81');
      grad.addColorStop(0.55, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Constellation lines
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(28, 34);
      ctx.lineTo(64, 54);
      ctx.lineTo(96, 30);
      ctx.moveTo(64, 54);
      ctx.lineTo(84, 84);
      ctx.stroke();

      // Golden stars
      const stars: Array<[number, number, number]> = [
        [28, 34, 4.5],
        [64, 54, 7],
        [96, 30, 4.5],
        [84, 84, 4],
        [34, 80, 3],
      ];
      ctx.fillStyle = '#fde047';
      stars.forEach(([sx, sy, sr]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Default Classic Glass
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#67e8f9');
      grad.addColorStop(1, palette.tileBridge);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      ctx.strokeStyle = highContrast ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = highContrast ? 5 : 3;
      ctx.beginPath();
      ctx.moveTo(35, 12); ctx.lineTo(35, S - 20);
      ctx.moveTo(S - 35, 12); ctx.lineTo(S - 35, S - 20);
      ctx.stroke();
    }

    ctx.strokeStyle = tileSkinId === 'tile-celestial' ? '#fde047' : '#ffffff';
    ctx.lineWidth = highContrast ? 5 : 2.5;
    ctx.strokeRect(12, 12, S - 24, S - 34);
  }, activeBridgeSide);

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

  // 16. Weighted Pressure Plates (Hold Switches: require a crate or Puff to stay open)
  PAIR_COLORS.forEach((pair, idx) => {
    createTile(
      `tile_switch_hold_${idx}`,
      (ctx) => {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, S, S);

        // Recessed square socket frame
        ctx.strokeStyle = pair.primary;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(22, 18, S - 44, S - 52, 14);
        ctx.stroke();

        // Inner weighted pad
        ctx.fillStyle = pair.dark;
        ctx.beginPath();
        ctx.roundRect(34, 30, S - 68, S - 76, 10);
        ctx.fill();

        // Pair letter badge
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pair.label, S / 2, S / 2 - 8);
      },
      '#1e293b'
    );
  });

  // 17. Pushable Crate (unlit wood/bronze & lit emerald-glowing when resting on weighted plate)
  const drawCrate = (key: string, lit: boolean) => {
    createCanvas(key, S, S, (ctx) => {
      // Soft drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.roundRect(20, 26, S - 40, S - 42, 16);
      ctx.fill();

      // 3D Crate body
      const topColor = lit ? '#34d399' : '#d97706';
      const sideColor = lit ? '#059669' : '#92400e';
      const borderColor = lit ? '#a7f3d0' : '#fcd34d';

      ctx.fillStyle = sideColor;
      ctx.beginPath();
      ctx.roundRect(20, 22, S - 40, S - 42, 14);
      ctx.fill();

      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.roundRect(20, 14, S - 40, S - 48, 14);
      ctx.fill();

      // Cross-brace planks
      ctx.strokeStyle = sideColor;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(32, 26);
      ctx.lineTo(S - 32, S - 46);
      ctx.moveTo(S - 32, 26);
      ctx.lineTo(32, S - 46);
      ctx.stroke();

      // Outer metallic frame
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(24, 18, S - 48, S - 56, 10);
      ctx.stroke();

      // Center rivet / crystal
      ctx.fillStyle = lit ? '#ecfdf5' : '#fef3c7';
      ctx.beginPath();
      ctx.arc(S / 2, S / 2 - 10, 9, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  drawCrate('item_crate', false);
  drawCrate('item_crate_lit', true);

  // 18. Springboard Launch Pad (vaults Puff 2 tiles forward over obstacles/void)
  createTile(
    'tile_spring',
    (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#0f766e');
      grad.addColorStop(1, '#115e59');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Outer luminous ring
      ctx.strokeStyle = highContrast ? '#fef08a' : '#2dd4bf';
      ctx.lineWidth = highContrast ? 6 : 4;
      ctx.beginPath();
      ctx.arc(S / 2, S / 2 - 8, 34, 0, Math.PI * 2);
      ctx.stroke();

      // Inner coiled bounce pad
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(S / 2, S / 2 - 8, 22, 0, Math.PI * 2);
      ctx.fill();

      // Concentric coil ring
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(S / 2, S / 2 - 8, 13, 0, Math.PI * 2);
      ctx.stroke();

      // Bright launch star core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(S / 2, S / 2 - 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // 4 directional chevron tips around the ring
      ctx.fillStyle = '#fef08a';
      const cx = S / 2;
      const cy = S / 2 - 8;
      const offsets = [
        { dx: 0, dy: -36 },
        { dx: 0, dy: 36 },
        { dx: -36, dy: 0 },
        { dx: 36, dy: 0 },
      ];
      offsets.forEach(({ dx, dy }) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    '#042f2e'
  );

  // 19. Locked Vault Tile (closed iron/gold padlock block & open golden sanctuary tile)
  createTile(
    'tile_lock_closed',
    (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#475569');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      // Ornate gold outer frame
      ctx.strokeStyle = highContrast ? '#fef08a' : '#f59e0b';
      ctx.lineWidth = highContrast ? 8 : 6;
      ctx.strokeRect(14, 14, S - 28, S - 42);

      // Central golden shield badge
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(36, 20, S - 72, S - 54, 12);
      ctx.fill();

      // Dark keyhole cutout
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(S / 2, 42, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(S / 2 - 5, 46);
      ctx.lineTo(S / 2 + 5, 46);
      ctx.lineTo(S / 2 + 8, 66);
      ctx.lineTo(S / 2 - 8, 66);
      ctx.closePath();
      ctx.fill();
    },
    '#0f172a'
  );

  createTile(
    'tile_lock_open',
    (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, '#fde68a');
      grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, S, S);

      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, S - 32, S - 44);
      ctx.globalAlpha = 1;

      // Subtle open keyhole emblem
      ctx.fillStyle = 'rgba(146, 64, 14, 0.35)';
      ctx.beginPath();
      ctx.arc(S / 2, 44, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(S / 2 - 4, 48, 8, 16);
    },
    '#b45309'
  );

  // 20. Collectible Golden Key Sprite
  createCanvas('item_key', 64, 64, (ctx) => {
    ctx.save();
    ctx.translate(32, 32);
    ctx.rotate(-Math.PI / 5);

    // Outer glow
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 10;

    // Key bow (ring)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(-12, 0, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-12, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Key shaft & teeth
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-3, -3, 26, 6);
    ctx.fillRect(10, 3, 5, 8);
    ctx.fillRect(18, 3, 5, 10);

    // Specular glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -2, 18, 2);
    ctx.restore();
  });

  // 21. Bridge-Parity Phase-Shift Tiles (Cyan Even 0/2 & Magenta Odd 1/3)
  const drawPhaseSolid = (
    key: string,
    topColor: string,
    bottomColor: string,
    sideColor: string,
    label: string
  ) => {
    createTile(
      key,
      (ctx) => {
        const grad = ctx.createLinearGradient(0, 0, S, S);
        grad.addColorStop(0, topColor);
        grad.addColorStop(1, bottomColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, S, S);

        // Inner crystalline diamond
        ctx.strokeStyle = highContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.72)';
        ctx.lineWidth = highContrast ? 6 : 4;
        ctx.beginPath();
        ctx.moveTo(S / 2, 16);
        ctx.lineTo(S - 18, 52);
        ctx.lineTo(S / 2, 88);
        ctx.lineTo(18, 52);
        ctx.closePath();
        ctx.stroke();

        // Crisp parity glyph ("0/2" or "1/3" -> clean "E" / "O" with dot cues)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.beginPath();
        ctx.arc(S / 2, 52, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, S / 2, 53);
      },
      sideColor
    );
  };

  const drawPhaseGhost = (key: string, strokeColor: string, label: string) => {
    createCanvas(key, S, S, (ctx) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.roundRect(12, 12, S - 24, S - 34, 22);
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = highContrast ? 5 : 4;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.roundRect(14, 14, S - 28, S - 38, 20);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = strokeColor;
      ctx.globalAlpha = 0.75;
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, S / 2, 52);
      ctx.globalAlpha = 1;
    });
  };

  drawPhaseSolid('tile_phase_even_on', '#67e8f9', '#0891b2', '#155e75', '0·2');
  drawPhaseGhost('tile_phase_even_off', '#22d3ee', '0·2');
  drawPhaseSolid('tile_phase_odd_on', '#f0abfc', '#c026d3', '#701a75', '1·3');
  drawPhaseGhost('tile_phase_odd_off', '#e879f9', '1·3');

  // 22. Translucent Spectral Speedrun Ghost Puff
  createCanvas('char_ghost', 96, 96, (ctx) => {
    ctx.save();
    // Spectral cyan-gold glow ring
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;

    const grad = ctx.createRadialGradient(38, 34, 8, 48, 48, 36);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    grad.addColorStop(0.55, 'rgba(103, 232, 249, 0.65)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(48, 48, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(253, 224, 71, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cute ghost eyes
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(38, 44, 4.5, 0, Math.PI * 2);
    ctx.arc(58, 44, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Lightning badge on forehead
    ctx.fillStyle = '#fde047';
    ctx.font = '900 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 48, 28);
    ctx.restore();
  });
}
