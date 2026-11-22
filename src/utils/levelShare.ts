import {
  LevelDefinition,
  Coordinate,
  OneWayTile,
  ConveyorTile,
  SwitchDoorPair,
  TeleporterPair,
} from '../engine/types';
import { solveLevel } from '../engine/solver';

const PREFIX = 'STF1:';
const MAX_SHARE_CODE_LENGTH = 8192;
const VALID_DIRECTIONS = new Set<OneWayTile['direction']>(['up', 'down', 'left', 'right']);

interface CompactLevelPayload {
  n: string; // name
  c: number; // cols
  r: number; // rows
  m: number; // maxTiles
  s: [number, number]; // start
  e: [number, number]; // exit
  f?: [number, number][]; // fixed
  x?: [number, number][]; // rocks
  h?: [number, number][]; // sticky
  cr?: [number, number][]; // crumbling
  i?: [number, number][]; // ice
  j?: [number, number][]; // springs
  ky?: [number, number][]; // keys
  lk?: [number, number][]; // locks
  ph?: [number, number, 0 | 1][]; // phaseTiles (0=even, 1=odd)
  cv?: [number, number, ConveyorTile['direction']][]; // conveyors
  b?: [number, number][]; // bonusTiles
  k?: [number, number][]; // crates
  g?: [number, number][]; // stars/gems
  o?: [number, number, OneWayTile['direction']][]; // oneWay
  sw?: [string, [number, number], [number, number], number?, number?, number?][]; // switches (+ timedDuration, holdSwitch)
  tp?: [string, [number, number], [number, number]][]; // teleporters
}

const toPair = (c: Coordinate): [number, number] => [c.x, c.y];
const fromPair = (p: [number, number]): Coordinate => ({ x: p[0], y: p[1] });

function isValidCoordPair(pair: unknown, cols: number, rows: number): pair is [number, number] {
  return (
    Array.isArray(pair) &&
    pair.length === 2 &&
    Number.isInteger(pair[0]) &&
    Number.isInteger(pair[1]) &&
    pair[0] >= 0 &&
    pair[0] < cols &&
    pair[1] >= 0 &&
    pair[1] < rows
  );
}

function parseCoordList(
  raw: unknown,
  cols: number,
  rows: number,
  maxItems: number
): Coordinate[] | null {
  if (raw === undefined) return [];
  if (!Array.isArray(raw) || raw.length > maxItems) return null;
  const out: Coordinate[] = [];
  for (const item of raw) {
    if (!isValidCoordPair(item, cols, rows)) return null;
    out.push(fromPair(item));
  }
  return out;
}

function sanitizeLabel(raw: unknown, fallback: string, maxLen: number): string {
  if (typeof raw !== 'string') return fallback;
  // Strip ASCII control characters to prevent terminal/UI spoofing
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLen);
  return cleaned || fallback;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(b64: string): string {
  let padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4 !== 0) padded += '=';
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Encodes a custom LevelDefinition into a compact offline STF1:... share code.
 */
export function encodeLevelCode(level: LevelDefinition): string {
  const payload: CompactLevelPayload = {
    n: sanitizeLabel(level.name, 'Custom Puzzle', 32),
    c: level.cols,
    r: level.rows,
    m: level.maxTiles,
    s: toPair(level.start),
    e: toPair(level.exit),
  };

  if (level.fixed?.length) payload.f = level.fixed.map(toPair);
  if (level.rocks?.length) payload.x = level.rocks.map(toPair);
  if (level.sticky?.length) payload.h = level.sticky.map(toPair);
  if (level.crumbling?.length) payload.cr = level.crumbling.map(toPair);
  if (level.ice?.length) payload.i = level.ice.map(toPair);
  if (level.springs?.length) payload.j = level.springs.map(toPair);
  if (level.keys?.length) payload.ky = level.keys.map(toPair);
  if (level.locks?.length) payload.lk = level.locks.map(toPair);
  if (level.phaseTiles?.length) {
    payload.ph = level.phaseTiles.map((pt) => [pt.x, pt.y, pt.polarity === 'odd' ? 1 : 0]);
  }
  if (level.conveyors?.length) {
    payload.cv = level.conveyors.map((cv) => [cv.x, cv.y, cv.direction]);
  }
  if (level.bonusTiles?.length) payload.b = level.bonusTiles.map(toPair);
  if (level.crates?.length) payload.k = level.crates.map(toPair);
  if (level.stars?.length) payload.g = level.stars.map(toPair);
  if (level.oneWay?.length) payload.o = level.oneWay.map((o) => [o.x, o.y, o.direction]);
  if (level.switches?.length) {
    payload.sw = level.switches.map((sw) =>
      sw.holdSwitch
        ? [sw.id, toPair(sw.switchPos), toPair(sw.doorPos), sw.doorInitiallyOpen ? 1 : 0, sw.timedDuration || 0, 1]
        : sw.timedDuration
        ? [sw.id, toPair(sw.switchPos), toPair(sw.doorPos), sw.doorInitiallyOpen ? 1 : 0, sw.timedDuration]
        : [sw.id, toPair(sw.switchPos), toPair(sw.doorPos), sw.doorInitiallyOpen ? 1 : 0]
    );
  }
  if (level.teleporters?.length) {
    payload.tp = level.teleporters.map((tp) => [tp.id, toPair(tp.posA), toPair(tp.posB)]);
  }

  return PREFIX + toBase64Url(JSON.stringify(payload));
}

/**
 * Decodes and strictly validates an offline STF1:... share code into a playable LevelDefinition.
 */
export function decodeLevelCode(
  rawCode: string
): { ok: true; level: LevelDefinition; parMoves: number } | { ok: false; error: string } {
  if (typeof rawCode !== 'string') {
    return { ok: false, error: 'Share code must be a text string.' };
  }
  const trimmed = rawCode.trim();
  if (!trimmed.startsWith(PREFIX)) {
    return { ok: false, error: 'Code must start with "STF1:"' };
  }
  if (trimmed.length > MAX_SHARE_CODE_LENGTH) {
    return { ok: false, error: 'Share code exceeds maximum safe size.' };
  }

  try {
    const jsonStr = fromBase64Url(trimmed.slice(PREFIX.length));
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Invalid puzzle payload format.' };
    }
    const p = parsed as CompactLevelPayload;

    if (
      !Number.isInteger(p.c) ||
      !Number.isInteger(p.r) ||
      p.c < 3 ||
      p.c > 9 ||
      p.r < 3 ||
      p.r > 9 ||
      !isValidCoordPair(p.s, p.c, p.r) ||
      !isValidCoordPair(p.e, p.c, p.r)
    ) {
      return { ok: false, error: 'Invalid puzzle dimensions or start/exit data.' };
    }

    if (p.s[0] === p.e[0] && p.s[1] === p.e[1]) {
      return { ok: false, error: 'Start and exit cannot share the same tile.' };
    }

    const maxCells = p.c * p.r;
    const fixed = parseCoordList(p.f, p.c, p.r, maxCells);
    const rocks = parseCoordList(p.x, p.c, p.r, maxCells);
    const sticky = parseCoordList(p.h, p.c, p.r, maxCells);
    const crumbling = parseCoordList(p.cr, p.c, p.r, maxCells);
    const ice = parseCoordList(p.i, p.c, p.r, maxCells);
    const springs = parseCoordList(p.j, p.c, p.r, maxCells);
    const keys = parseCoordList(p.ky, p.c, p.r, maxCells);
    const locks = parseCoordList(p.lk, p.c, p.r, maxCells);
    const bonusTiles = parseCoordList(p.b, p.c, p.r, maxCells);
    const crates = parseCoordList(p.k, p.c, p.r, maxCells);
    const stars = parseCoordList(p.g, p.c, p.r, maxCells);

    if (
      !fixed ||
      !rocks ||
      !sticky ||
      !crumbling ||
      !ice ||
      !springs ||
      !keys ||
      !locks ||
      !bonusTiles ||
      !crates ||
      !stars
    ) {
      return { ok: false, error: 'Puzzle contains out-of-bounds or malformed tile coordinates.' };
    }

    let phaseTiles: LevelDefinition['phaseTiles'];
    if (p.ph !== undefined) {
      if (!Array.isArray(p.ph) || p.ph.length > maxCells) {
        return { ok: false, error: 'Invalid phase tile data.' };
      }
      phaseTiles = [];
      for (const entry of p.ph) {
        if (
          !Array.isArray(entry) ||
          entry.length !== 3 ||
          !isValidCoordPair([entry[0], entry[1]], p.c, p.r) ||
          (entry[2] !== 0 && entry[2] !== 1)
        ) {
          return { ok: false, error: 'Invalid phase tile entry.' };
        }
        phaseTiles.push({ x: entry[0], y: entry[1], polarity: entry[2] === 1 ? 'odd' : 'even' });
      }
    }

    const parseDirectional = (
      raw: unknown
    ): Array<{ x: number; y: number; direction: OneWayTile['direction'] }> | null => {
      if (raw === undefined) return [];
      if (!Array.isArray(raw) || raw.length > maxCells) return null;
      const list: Array<{ x: number; y: number; direction: OneWayTile['direction'] }> = [];
      for (const entry of raw) {
        if (
          !Array.isArray(entry) ||
          entry.length !== 3 ||
          !isValidCoordPair([entry[0], entry[1]], p.c, p.r) ||
          typeof entry[2] !== 'string' ||
          !VALID_DIRECTIONS.has(entry[2] as OneWayTile['direction'])
        ) {
          return null;
        }
        list.push({
          x: entry[0],
          y: entry[1],
          direction: entry[2] as OneWayTile['direction'],
        });
      }
      return list;
    };

    const oneWay = parseDirectional(p.o);
    const conveyors = parseDirectional(p.cv);
    if (!oneWay || !conveyors) {
      return { ok: false, error: 'Invalid directional tile data.' };
    }

    let switches: SwitchDoorPair[] | undefined;
    if (p.sw !== undefined) {
      if (!Array.isArray(p.sw) || p.sw.length > 12) {
        return { ok: false, error: 'Invalid switch/gate data.' };
      }
      switches = [];
      for (const entry of p.sw) {
        if (
          !Array.isArray(entry) ||
          entry.length < 3 ||
          !isValidCoordPair(entry[1], p.c, p.r) ||
          !isValidCoordPair(entry[2], p.c, p.r)
        ) {
          return { ok: false, error: 'Invalid switch/gate coordinates.' };
        }
        const [rawId, sp, dp, open, timed, hold] = entry;
        const safeId = sanitizeLabel(rawId, `g${switches.length + 1}`, 16);
        const safeTimed =
          typeof timed === 'number' && Number.isInteger(timed) && timed > 0
            ? Math.min(99, timed)
            : undefined;
        switches.push({
          id: safeId,
          switchPos: fromPair(sp),
          doorPos: fromPair(dp),
          ...(open === 1 ? { doorInitiallyOpen: true } : {}),
          ...(safeTimed ? { timedDuration: safeTimed } : {}),
          ...(hold === 1 ? { holdSwitch: true } : {}),
        });
      }
    }

    let teleporters: TeleporterPair[] | undefined;
    if (p.tp !== undefined) {
      if (!Array.isArray(p.tp) || p.tp.length > 12) {
        return { ok: false, error: 'Invalid teleporter data.' };
      }
      teleporters = [];
      for (const entry of p.tp) {
        if (
          !Array.isArray(entry) ||
          entry.length !== 3 ||
          !isValidCoordPair(entry[1], p.c, p.r) ||
          !isValidCoordPair(entry[2], p.c, p.r)
        ) {
          return { ok: false, error: 'Invalid teleporter coordinates.' };
        }
        const [rawId, a, b] = entry;
        teleporters.push({
          id: sanitizeLabel(rawId, `tp-${teleporters.length + 1}`, 16),
          posA: fromPair(a),
          posB: fromPair(b),
        });
      }
    }

    const rawMaxTiles = Number(p.m);
    const safeMaxTiles = Number.isFinite(rawMaxTiles)
      ? Math.max(1, Math.min(5, Math.floor(rawMaxTiles)))
      : 2;

    const level: LevelDefinition = {
      id: 30000 + Math.floor(Math.random() * 9000),
      world: 0,
      name: sanitizeLabel(p.n, 'Shared Puzzle', 32),
      cols: p.c,
      rows: p.r,
      maxTiles: safeMaxTiles,
      start: fromPair(p.s),
      exit: fromPair(p.e),
      fixed: fixed.length ? fixed : undefined,
      rocks: rocks.length ? rocks : undefined,
      sticky: sticky.length ? sticky : undefined,
      crumbling: crumbling.length ? crumbling : undefined,
      ice: ice.length ? ice : undefined,
      springs: springs.length ? springs : undefined,
      keys: keys.length ? keys : undefined,
      locks: locks.length ? locks : undefined,
      phaseTiles: phaseTiles?.length ? phaseTiles : undefined,
      conveyors: conveyors.length ? conveyors : undefined,
      bonusTiles: bonusTiles.length ? bonusTiles : undefined,
      crates: crates.length ? crates : undefined,
      stars: stars.length ? stars : undefined,
      oneWay: oneWay.length ? oneWay : undefined,
      switches: switches?.length ? switches : undefined,
      teleporters: teleporters?.length ? teleporters : undefined,
      parMoves: 0,
      hint: 'Custom community puzzle shared offline!',
    };

    const solution = solveLevel(level, 40);
    if (!solution.solvable) {
      return { ok: false, error: 'This puzzle code is mathematically unsolvable!' };
    }

    level.parMoves = solution.minMoves;
    level.star2Moves = solution.minMoves + Math.max(2, Math.ceil(solution.minMoves * 0.25));
    return { ok: true, level, parMoves: solution.minMoves };
  } catch {
    return { ok: false, error: 'Could not decode share code. Check that it was copied completely.' };
  }
}
