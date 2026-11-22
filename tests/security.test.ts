import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { decodeLevelCode } from '../src/utils/levelShare';
import { GameStorage, TOTAL_CAMPAIGN_LEVELS, MAX_CAMPAIGN_STARS } from '../src/storage/gameStorage';
import { solveLevel } from '../src/engine/solver';
import { LevelDefinition } from '../src/engine/types';

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

function encodeRawBase64Url(obj: unknown): string {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  return Buffer.from(json, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

describe('Security & Vulnerability Test Suite', () => {
  let storage: GameStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = GameStorage.getInstance();
    storage.resetProgress();
  });

  describe('STF1 Share Code Input Validation & DoS Resistance', () => {
    it('rejects oversized share codes before decoding to prevent UI freeze DoS', () => {
      const huge = 'STF1:' + 'A'.repeat(10_000);
      const res = decodeLevelCode(huge);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain('maximum safe size');
      }
    });

    it('rejects out-of-bounds coordinates, non-integer dimensions, and start===exit payloads', () => {
      const payloads = [
        { n: 'Float Dim', c: 5.5, r: 5, m: 2, s: [0, 0], e: [4, 0] },
        { n: 'Huge Dim', c: 50, r: 50, m: 2, s: [0, 0], e: [4, 0] },
        { n: 'OOB Exit', c: 5, r: 5, m: 2, s: [0, 0], e: [9, 0] },
        { n: 'Negative Start', c: 5, r: 5, m: 2, s: [-1, 0], e: [4, 0] },
        { n: 'Same Start Exit', c: 5, r: 5, m: 2, s: [2, 2], e: [2, 2] },
        { n: 'OOB Fixed', c: 5, r: 5, m: 2, s: [0, 0], e: [2, 0], f: [[10, 10]] },
        { n: 'Null Entry', c: 5, r: 5, m: 2, s: [0, 0], e: [2, 0], f: [null] },
        { n: 'Bad Phase Polarity', c: 5, r: 5, m: 2, s: [0, 0], e: [2, 0], ph: [[1, 0, 99]] },
        { n: 'Bad Switch Coord', c: 5, r: 5, m: 2, s: [0, 0], e: [2, 0], sw: [['g1', [1, 0], [99, 0]]] },
        { n: 'Too Many Tiles', c: 3, r: 3, m: 2, s: [0, 0], e: [2, 0], f: Array(50).fill([1, 0]) },
      ];

      for (const payload of payloads) {
        const res = decodeLevelCode('STF1:' + encodeRawBase64Url(payload));
        expect(res.ok, `Expected payload "${payload.n}" to be rejected`).toBe(false);
      }
    });

    it('rejects invalid directional strings (prevents texture key injection)', () => {
      const badOneWay = 'STF1:' + encodeRawBase64Url({
        n: 'Inject Dir',
        c: 4,
        r: 3,
        m: 2,
        s: [0, 0],
        e: [3, 0],
        o: [[1, 0, '../../evil']],
      });
      expect(decodeLevelCode(badOneWay).ok).toBe(false);

      const badConveyor = 'STF1:' + encodeRawBase64Url({
        n: 'Inject Conv',
        c: 4,
        r: 3,
        m: 2,
        s: [0, 0],
        e: [3, 0],
        cv: [[1, 0, 'right<script>']],
      });
      expect(decodeLevelCode(badConveyor).ok).toBe(false);
    });

    it('strips ASCII control characters from shared puzzle names', () => {
      const code = 'STF1:' + encodeRawBase64Url({
        n: 'Evil\u0000\u001b[31mName\n\r',
        c: 4,
        r: 3,
        m: 2,
        s: [0, 0],
        e: [2, 0],
      });
      const res = decodeLevelCode(code);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.level.name).toBe('Evil[31mName');
      }
    });
  });

  describe('STFSAVE Backup Hardening & Prototype Pollution Prevention', () => {
    it('rejects oversized STFSAVE payloads before decoding', () => {
      const huge = 'STFSAVE:' + 'A'.repeat(300_000);
      const res = storage.importSaveCode(huge);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain('maximum safe size');
      }
    });

    it('blocks prototype pollution and arbitrary property injection via STFSAVE', () => {
      const rawJson =
        '{"highestUnlockedLevel":5,"coins":100,"__proto__":{"polluted":true},' +
        '"evilExtraField":"injected",' +
        '"achievements":{"__proto__":{"unlocked":true},"toString":{"unlocked":true},"constructor":{"unlocked":true}},' +
        '"gauntletProgress":{"__proto__":{"medal":"gold"},"../bad":{"medal":"gold"}}}';

      const code = 'STFSAVE:' + encodeRawBase64Url(rawJson);
      const res = storage.importSaveCode(code);
      expect(res.ok).toBe(true);

      // Global Object.prototype MUST NOT be polluted
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();

      const data = storage.getData() as unknown as Record<string, unknown>;
      expect(data.evilExtraField).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(storage.getData().achievements, 'toString')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(storage.getData().gauntletProgress, '../bad')).toBe(false);
    });

    it('clamps tampered numbers, invalid cosmetic IDs, and drops malformed customLevels', () => {
      const tampered = {
        highestUnlockedLevel: 999999,
        currentLevel: -50,
        coins: -999,
        totalStars: 999999,
        selectedTheme: 'javascript:alert(1)',
        unlockedThemes: ['floating-sky', 'nonexistent-theme'],
        selectedSkin: '<script>',
        selectedTrail: 'bogus',
        selectedTileSkin: 'bogus',
        completedDailyDates: ['2026-11-22', 'not-a-date', '<img src=x>'],
        settings: { musicVolume: 500, sfxVolume: -10, musicEnabled: 'yes' },
        customLevels: [
          { cols: 999, rows: 999, start: { x: 0, y: 0 }, exit: { x: 1, y: 0 } },
          null,
        ],
      };

      const res = storage.importSaveCode('STFSAVE:' + encodeRawBase64Url(tampered));
      expect(res.ok).toBe(true);

      const data = storage.getData();
      expect(data.highestUnlockedLevel).toBe(TOTAL_CAMPAIGN_LEVELS);
      expect(data.currentLevel).toBe(1);
      expect(data.coins).toBe(0);
      expect(data.totalStars).toBe(MAX_CAMPAIGN_STARS);
      expect(data.selectedTheme).toBe('floating-sky');
      expect(data.unlockedThemes).toEqual(['floating-sky']);
      expect(data.selectedSkin).toBe('puff-yellow');
      expect(data.selectedTrail).toBe('trail-none');
      expect(data.selectedTileSkin).toBe('tile-classic');
      expect(data.completedDailyDates).toEqual(['2026-11-22']);
      expect(data.settings.musicVolume).toBe(1);
      expect(data.settings.sfxVolume).toBe(0);
      expect(data.settings.musicEnabled).toBe(true);
      expect(data.customLevels).toEqual([]);
    });
  });

  describe('BFS Solver Resource-Exhaustion Resistance', () => {
    it('respects maxStates budget on open adversarial grids without hanging', () => {
      const openGrid: LevelDefinition = {
        id: 99999,
        world: 0,
        name: 'Worst-Case Open Grid',
        cols: 9,
        rows: 9,
        maxTiles: 5,
        start: { x: 0, y: 0 },
        exit: { x: 8, y: 8 },
        rocks: [
          { x: 7, y: 8 },
          { x: 8, y: 7 },
        ],
        parMoves: 10,
      };
      const t0 = Date.now();
      const result = solveLevel(openGrid, 40);
      const elapsed = Date.now() - t0;
      expect(result.solvable).toBe(false);
      expect(result.statesExplored).toBeLessThanOrEqual(25000);
      expect(elapsed).toBeLessThan(3000);
    });
  });

  describe('Offline, Privacy, CSP & Static Codebase Security Invariants', () => {
    const root = process.cwd();

    it('keeps AndroidManifest.xml 100% offline with zero INTERNET permission', () => {
      const manifest = fs.readFileSync(
        path.join(root, 'android/app/src/main/AndroidManifest.xml'),
        'utf-8'
      );
      expect(manifest).not.toContain('android.permission.INTERNET');
      expect(manifest).not.toContain('ACCESS_NETWORK_STATE');
      expect(manifest).not.toContain('usesCleartextTraffic="true"');
    });

    it('enforces a strict offline Content-Security-Policy in index.html', () => {
      const html = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
      expect(html).toContain('http-equiv="Content-Security-Policy"');
      expect(html).toContain("default-src 'self'");
      expect(html).toContain("object-src 'none'");
      expect(html).toContain("form-action 'none'");
    });

    it('guards Service Worker caching with response.ok and response.type === basic', () => {
      const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf-8');
      expect(sw).toContain("response.ok && response.type === 'basic'");
    });

    it('contains zero dangerous DOM/code-execution sinks in src/', () => {
      const dangerousPattern =
        /\b(dangerouslySetInnerHTML|innerHTML|outerHTML|document\.write|eval\s*\(|new\s+Function\s*\()/;

      const walk = (dir: string): string[] => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const files: string[] = [];
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) files.push(...walk(full));
          else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(full);
        }
        return files;
      };

      const srcFiles = walk(path.join(root, 'src'));
      expect(srcFiles.length).toBeGreaterThan(10);
      for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(dangerousPattern.test(content), `Dangerous sink detected in ${file}`).toBe(false);
      }
    });
  });
});
