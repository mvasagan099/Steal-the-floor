import { LevelDefinition, Coordinate, OneWayTile, SwitchDoorPair, TeleporterPair } from '../engine/types';
import { solveLevel } from '../engine/solver';

const PREFIX = 'STF1:';

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
  b?: [number, number][]; // bonusTiles
  g?: [number, number][]; // stars/gems
  o?: [number, number, OneWayTile['direction']][]; // oneWay
  sw?: [string, [number, number], [number, number], number?][]; // switches
  tp?: [string, [number, number], [number, number]][]; // teleporters
}

const toPair = (c: Coordinate): [number, number] => [c.x, c.y];
const fromPair = (p: [number, number]): Coordinate => ({ x: p[0], y: p[1] });

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
    n: level.name.slice(0, 32) || 'Custom Puzzle',
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
  if (level.bonusTiles?.length) payload.b = level.bonusTiles.map(toPair);
  if (level.stars?.length) payload.g = level.stars.map(toPair);
  if (level.oneWay?.length) payload.o = level.oneWay.map((o) => [o.x, o.y, o.direction]);
  if (level.switches?.length) {
    payload.sw = level.switches.map((sw) => [
      sw.id,
      toPair(sw.switchPos),
      toPair(sw.doorPos),
      sw.doorInitiallyOpen ? 1 : 0,
    ]);
  }
  if (level.teleporters?.length) {
    payload.tp = level.teleporters.map((tp) => [tp.id, toPair(tp.posA), toPair(tp.posB)]);
  }

  return PREFIX + toBase64Url(JSON.stringify(payload));
}

/**
 * Decodes and validates an offline STF1:... share code into a playable LevelDefinition.
 */
export function decodeLevelCode(
  rawCode: string
): { ok: true; level: LevelDefinition; parMoves: number } | { ok: false; error: string } {
  const trimmed = rawCode.trim();
  if (!trimmed.startsWith(PREFIX)) {
    return { ok: false, error: 'Code must start with "STF1:"' };
  }

  try {
    const jsonStr = fromBase64Url(trimmed.slice(PREFIX.length));
    const p = JSON.parse(jsonStr) as CompactLevelPayload;

    if (
      typeof p.c !== 'number' ||
      typeof p.r !== 'number' ||
      p.c < 3 ||
      p.c > 9 ||
      p.r < 3 ||
      p.r > 9 ||
      !Array.isArray(p.s) ||
      !Array.isArray(p.e)
    ) {
      return { ok: false, error: 'Invalid puzzle dimensions or start/exit data.' };
    }

    const switches: SwitchDoorPair[] | undefined = p.sw?.map(([id, sp, dp, open]) => ({
      id,
      switchPos: fromPair(sp),
      doorPos: fromPair(dp),
      ...(open ? { doorInitiallyOpen: true } : {}),
    }));

    const teleporters: TeleporterPair[] | undefined = p.tp?.map(([id, a, b]) => ({
      id,
      posA: fromPair(a),
      posB: fromPair(b),
    }));

    const level: LevelDefinition = {
      id: 30000 + Math.floor(Math.random() * 9000),
      world: 0,
      name: String(p.n || 'Shared Puzzle').slice(0, 32),
      cols: p.c,
      rows: p.r,
      maxTiles: Math.max(1, Math.min(5, Number(p.m) || 2)),
      start: fromPair(p.s),
      exit: fromPair(p.e),
      fixed: p.f?.map(fromPair),
      rocks: p.x?.map(fromPair),
      sticky: p.h?.map(fromPair),
      crumbling: p.cr?.map(fromPair),
      ice: p.i?.map(fromPair),
      bonusTiles: p.b?.map(fromPair),
      stars: p.g?.map(fromPair),
      oneWay: p.o?.map(([x, y, direction]) => ({ x, y, direction })),
      switches,
      teleporters,
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
