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
};

export function generateAllTextures(scene: Phaser.Scene, themeId = 'floating-sky', skinColor = '#f59e0b'): void {
  const palette = THEME_PALETTES[themeId] || THEME_PALETTES['floating-sky'];
  const S = 128; // 128x128 crisp texture size

  const createTile = (
    key: string,
    drawFace: (ctx: CanvasRenderingContext2D, s: number) => void,
    sideColor = '#1e293b'
  ) => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d')!;

    // Soft drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 10;

    // 3D side edge bevel
    const r = 24;
    const topHeight = S - 20;

    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.roundRect(8, 12, S - 16, topHeight + 10, r);
    ctx.fill();

    // Top face
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.roundRect(8, 8, S - 16, topHeight - 8, r);
    ctx.clip();

    drawFace(ctx, S);

    scene.textures.addCanvas(key, canvas);
  };

  // 1. Fixed Platform
  createTile('tile_fixed', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, palette.tileFixed);
    grad.addColorStop(1, palette.tileFixedSide);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    // Subtle edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, S - 20, S - 32);
  }, palette.tileFixedSide);

  // 2. Bridge / Reusable Tile
  createTile('tile_bridge', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, '#67e8f9');
    grad.addColorStop(1, palette.tileBridge);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    // Plank / grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(35, 12); ctx.lineTo(35, S - 20);
    ctx.moveTo(S - 35, 12); ctx.lineTo(S - 35, S - 20);
    ctx.stroke();

    // Highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, S - 24, S - 34);
  }, palette.tileBridgeSide);

  // 3. Sticky Ground
  createTile('tile_sticky', (ctx) => {
    ctx.fillStyle = palette.tileSticky;
    ctx.fillRect(0, 0, S, S);

    // Honey / Goo bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(36, 36, 14, 0, Math.PI * 2);
    ctx.arc(88, 54, 18, 0, Math.PI * 2);
    ctx.arc(50, 75, 10, 0, Math.PI * 2);
    ctx.fill();

    // Honey drop symbol
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(64, 52, 12, 0, Math.PI * 2);
    ctx.fill();
  }, '#581c87');

  // 4. Crumbling Ground
  createTile('tile_crumbling', (ctx) => {
    ctx.fillStyle = palette.tileCrumbling;
    ctx.fillRect(0, 0, S, S);

    // Cracks
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(25, 20); ctx.lineTo(55, 50); ctx.lineTo(40, 80);
    ctx.moveTo(55, 50); ctx.lineTo(100, 45);
    ctx.moveTo(60, 70); ctx.lineTo(95, 90);
    ctx.stroke();
  }, '#334155');

  // 5. Rock Obstacle
  createTile('tile_rock', (ctx) => {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, S, S);

    // Jagged facets
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
      ctx.moveTo(0, -22);
      ctx.lineTo(24, 12);
      ctx.lineTo(10, 12);
      ctx.lineTo(10, 26);
      ctx.lineTo(-10, 26);
      ctx.lineTo(-10, 12);
      ctx.lineTo(-24, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }, palette.tileFixedSide);
  });

  // 7. Switch Button
  createTile('tile_switch', (ctx) => {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, S, S);

    // Circular button base
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(64, 50, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(64, 47, 24, 0, Math.PI * 2);
    ctx.fill();
  }, '#0f172a');

  // 8. Door / Gate (Closed)
  createTile('tile_door_closed', (ctx) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, S, S);

    // Barrier bars
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(20, 20, S - 40, 12);
    ctx.fillRect(20, 42, S - 40, 12);
    ctx.fillRect(20, 64, S - 40, 12);

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(25, 15); ctx.lineTo(S - 25, 78);
    ctx.stroke();
  }, '#0f172a');

  // 9. Door / Gate (Open)
  createTile('tile_door_open', (ctx) => {
    ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
    ctx.fillRect(0, 0, S, S);

    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, S - 32, S - 40);
  }, '#0f172a');

  // 10. Teleporter
  createTile('tile_teleporter', (ctx) => {
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(0, 0, S, S);

    // Swirling portal rings
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(64, 50, 28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(64, 50, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#e879f9';
    ctx.beginPath();
    ctx.arc(64, 50, 7, 0, Math.PI * 2);
    ctx.fill();
  }, '#1e053a');

  // 11. Exit Flag Platform
  createTile('tile_exit', (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, '#fbbf24');
    grad.addColorStop(1, '#d97706');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    // Flagpole
    ctx.fillStyle = '#475569';
    ctx.fillRect(40, 18, 6, 68);

    // Waving flag
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(46, 20);
    ctx.lineTo(92, 35);
    ctx.lineTo(46, 50);
    ctx.closePath();
    ctx.fill();
  }, '#92400e');

  // 12. Star Collectible
  if (scene.textures.exists('item_star')) scene.textures.remove('item_star');
  {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
    ctx.shadowBlur = 12;

    const cx = 32, cy = 32, spikes = 5, outer = 26, inner = 12;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outer;
      let y = cy + Math.sin(rot) * outer;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * inner;
      y = cy + Math.sin(rot) * inner;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#fef08a');
    grad.addColorStop(1, '#eab308');
    ctx.fillStyle = grad;
    ctx.fill();

    scene.textures.addCanvas('item_star', canvas);
  }

  // 13. Mascot Character ("Puff")
  if (scene.textures.exists('char_mascot')) scene.textures.remove('char_mascot');
  {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    const cx = 48, cy = 52, r = 36;

    // Soft drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, 88, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
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

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 4, 5, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 6, 2, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy - 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cute smiling mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();

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

    scene.textures.addCanvas('char_mascot', canvas);
  }

  // 14. Valid Move Glowing Ring
  if (scene.textures.exists('highlight_valid')) scene.textures.remove('highlight_valid');
  {
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d')!;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.roundRect(14, 14, S - 28, S - 38, 20);
    ctx.stroke();

    scene.textures.addCanvas('highlight_valid', canvas);
  }
}
