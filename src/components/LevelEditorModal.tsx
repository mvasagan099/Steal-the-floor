import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  FolderOpen,
  Dices,
} from 'lucide-react';
import { LevelDefinition, Coordinate, PhaseTile } from '../engine/types';
import { solveLevel } from '../engine/solver';
import { encodeLevelCode, decodeLevelCode } from '../utils/levelShare';
import {
  STUDIO_BLUEPRINTS,
  generateStudioRandomLevel,
} from '../levels/studioBlueprints';
import { storage } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';
import { BoardThumbnail } from './BoardThumbnail';

type BrushType =
  | 'void'
  | 'start'
  | 'exit'
  | 'fixed'
  | 'rock'
  | 'sticky'
  | 'crumbling'
  | 'ice'
  | 'spring'
  | 'key'
  | 'lock'
  | 'phaseEven'
  | 'phaseOdd'
  | 'crate'
  | 'bonus'
  | 'gem'
  | 'switchA'
  | 'doorA'
  | 'portal1';

const COLS = 6;
const ROWS = 7;

interface CellData {
  base:
    | 'void'
    | 'start'
    | 'exit'
    | 'fixed'
    | 'rock'
    | 'sticky'
    | 'crumbling'
    | 'ice'
    | 'spring'
    | 'key'
    | 'lock'
    | 'phaseEven'
    | 'phaseOdd'
    | 'crate'
    | 'switchA'
    | 'doorA'
    | 'portal1';
  hasGem: boolean;
  hasBonus: boolean;
}

const BRUSHES: Array<{ id: BrushType; label: string; badge: string; color: string }> = [
  { id: 'fixed', label: 'Island', badge: '🟦', color: 'bg-sky-500/20 border-sky-400/50 text-sky-300' },
  { id: 'rock', label: 'Rock', badge: '🪨', color: 'bg-slate-700/60 border-slate-500 text-slate-200' },
  { id: 'gem', label: 'Gem', badge: '💎', color: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200' },
  { id: 'sticky', label: 'Honey', badge: '🍯', color: 'bg-purple-500/20 border-purple-400/50 text-purple-200' },
  { id: 'crumbling', label: 'Crumble', badge: '🧱', color: 'bg-stone-500/25 border-stone-400/50 text-stone-200' },
  { id: 'ice', label: 'Ice', badge: '❄️', color: 'bg-sky-300/20 border-sky-200/50 text-sky-100' },
  { id: 'spring', label: 'Spring', badge: '🦘', color: 'bg-teal-500/25 border-teal-300/60 text-teal-200' },
  { id: 'key', label: 'Key', badge: '🔑', color: 'bg-yellow-500/25 border-yellow-300/60 text-yellow-200' },
  { id: 'lock', label: 'Vault', badge: '🔒', color: 'bg-amber-700/35 border-amber-400/60 text-amber-200' },
  { id: 'phaseEven', label: 'Phase 0·2', badge: '🔷', color: 'bg-cyan-500/25 border-cyan-300/60 text-cyan-200' },
  { id: 'phaseOdd', label: 'Phase 1·3', badge: '🟪', color: 'bg-fuchsia-500/25 border-fuchsia-300/60 text-fuchsia-200' },
  { id: 'crate', label: 'Crate', badge: '📦', color: 'bg-amber-600/25 border-amber-400/60 text-amber-200' },
  { id: 'bonus', label: '+1 Tile', badge: '➕', color: 'bg-amber-500/20 border-amber-400/50 text-amber-200' },
  { id: 'switchA', label: 'Switch', badge: '🔘', color: 'bg-blue-500/20 border-blue-400/50 text-blue-200' },
  { id: 'doorA', label: 'Gate', badge: '🚧', color: 'bg-rose-500/20 border-rose-400/50 text-rose-200' },
  { id: 'portal1', label: 'Portal', badge: '🌀', color: 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-200' },
  { id: 'start', label: 'Start', badge: 'S', color: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200' },
  { id: 'exit', label: 'Exit', badge: '🏁', color: 'bg-amber-500/25 border-amber-400/60 text-amber-200' },
  { id: 'void', label: 'Erase', badge: '✕', color: 'bg-slate-800 border-slate-700 text-slate-400' },
];

function createInitialGrid(): CellData[][] {
  const grid: CellData[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ base: 'void', hasGem: false, hasBonus: false }))
  );
  grid[1][1].base = 'start';
  grid[3][2].base = 'fixed';
  grid[5][4].base = 'exit';
  return grid;
}

function levelToGrid(level: LevelDefinition): CellData[][] {
  const grid: CellData[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ base: 'void', hasGem: false, hasBonus: false }))
  );
  const inBounds = (c: Coordinate) => c.x >= 0 && c.x < COLS && c.y >= 0 && c.y < ROWS;
  level.fixed?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'fixed'; });
  level.rocks?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'rock'; });
  level.sticky?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'sticky'; });
  level.crumbling?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'crumbling'; });
  level.ice?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'ice'; });
  level.springs?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'spring'; });
  level.keys?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'key'; });
  level.locks?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'lock'; });
  level.phaseTiles?.forEach((pt) => {
    if (inBounds(pt)) grid[pt.y][pt.x].base = pt.polarity === 'odd' ? 'phaseOdd' : 'phaseEven';
  });
  level.crates?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].base = 'crate'; });
  level.switches?.slice(0, 1).forEach((sw) => {
    if (inBounds(sw.switchPos)) grid[sw.switchPos.y][sw.switchPos.x].base = 'switchA';
    if (inBounds(sw.doorPos)) grid[sw.doorPos.y][sw.doorPos.x].base = 'doorA';
  });
  level.teleporters?.slice(0, 1).forEach((tp) => {
    if (inBounds(tp.posA)) grid[tp.posA.y][tp.posA.x].base = 'portal1';
    if (inBounds(tp.posB)) grid[tp.posB.y][tp.posB.x].base = 'portal1';
  });
  if (inBounds(level.start)) grid[level.start.y][level.start.x].base = 'start';
  if (inBounds(level.exit)) grid[level.exit.y][level.exit.x].base = 'exit';
  level.stars?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].hasGem = true; });
  level.bonusTiles?.forEach((c) => { if (inBounds(c)) grid[c.y][c.x].hasBonus = true; });
  return grid;
}

interface LevelEditorModalProps {
  onBack: () => void;
  onPlayCustomLevel: (level: LevelDefinition) => void;
}

export const LevelEditorModal: React.FC<LevelEditorModalProps> = ({
  onBack,
  onPlayCustomLevel,
}) => {
  const [grid, setGrid] = useState<CellData[][]>(() => createInitialGrid());
  const [brush, setBrush] = useState<BrushType>('fixed');
  const [name, setName] = useState('My Custom Puzzle');
  const [maxTiles, setMaxTiles] = useState(2);
  const [gateTimer, setGateTimer] = useState<number>(0); // -1 = holdSwitch, 0 = toggle, >0 = timedDuration
  const [statusMsg, setStatusMsg] = useState<{ kind: 'info' | 'ok' | 'err'; text: string }>({
    kind: 'info',
    text: 'Paint your puzzle, then tap Verify & Play to solve-check it!',
  });
  const [shareCode, setShareCode] = useState('');
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedLevels, setSavedLevels] = useState<LevelDefinition[]>(
    () => storage.getData().customLevels
  );

  const handleCellTap = (x: number, y: number) => {
    sound.playTap();
    setShareCode('');
    setGrid((prev) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      const cell = next[y][x];

      if (brush === 'gem') {
        if (cell.base === 'rock') return next;
        cell.hasGem = !cell.hasGem;
        return next;
      }

      if (brush === 'bonus') {
        if (cell.base === 'rock') return next;
        cell.hasBonus = !cell.hasBonus;
        if (cell.base === 'void') cell.base = 'fixed';
        return next;
      }

      if (brush === 'void') {
        if (cell.base === 'start' || cell.base === 'exit') return next;
        cell.base = 'void';
        cell.hasGem = false;
        cell.hasBonus = false;
        return next;
      }

      // Single-instance tiles: start, exit, switchA, doorA
      if (brush === 'start' || brush === 'exit' || brush === 'switchA' || brush === 'doorA') {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (next[r][c].base === brush) next[r][c].base = 'void';
          }
        }
      }

      // Limit Portal 1 to max 2 pads
      if (brush === 'portal1') {
        const portals: Coordinate[] = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (next[r][c].base === 'portal1') portals.push({ x: c, y: r });
          }
        }
        if (portals.length >= 2) {
          next[portals[0].y][portals[0].x].base = 'void';
        }
      }

      cell.base = brush;
      if (brush === 'rock') {
        cell.hasGem = false;
        cell.hasBonus = false;
      }
      return next;
    });
  };

  const buildAndVerify = (): LevelDefinition | null => {
    let start: Coordinate | null = null;
    let exit: Coordinate | null = null;
    const fixed: Coordinate[] = [];
    const rocks: Coordinate[] = [];
    const sticky: Coordinate[] = [];
    const crumbling: Coordinate[] = [];
    const ice: Coordinate[] = [];
    const springs: Coordinate[] = [];
    const keys: Coordinate[] = [];
    const locks: Coordinate[] = [];
    const phaseTiles: PhaseTile[] = [];
    const crates: Coordinate[] = [];
    const stars: Coordinate[] = [];
    const bonusTiles: Coordinate[] = [];
    let switchPos: Coordinate | null = null;
    let doorPos: Coordinate | null = null;
    const portals: Coordinate[] = [];

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = grid[y][x];
        const coord = { x, y };
        if (cell.base === 'start') start = coord;
        else if (cell.base === 'exit') exit = coord;
        else if (cell.base === 'fixed') fixed.push(coord);
        else if (cell.base === 'rock') rocks.push(coord);
        else if (cell.base === 'sticky') sticky.push(coord);
        else if (cell.base === 'crumbling') crumbling.push(coord);
        else if (cell.base === 'ice') ice.push(coord);
        else if (cell.base === 'spring') springs.push(coord);
        else if (cell.base === 'key') {
          fixed.push(coord);
          keys.push(coord);
        } else if (cell.base === 'lock') locks.push(coord);
        else if (cell.base === 'phaseEven') phaseTiles.push({ x, y, polarity: 'even' });
        else if (cell.base === 'phaseOdd') phaseTiles.push({ x, y, polarity: 'odd' });
        else if (cell.base === 'crate') {
          fixed.push(coord);
          crates.push(coord);
        } else if (cell.base === 'switchA') switchPos = coord;
        else if (cell.base === 'doorA') doorPos = coord;
        else if (cell.base === 'portal1') portals.push(coord);

        if (cell.hasGem) stars.push(coord);
        if (cell.hasBonus) bonusTiles.push(coord);
      }
    }

    if (!start || !exit) {
      sound.playError();
      setStatusMsg({ kind: 'err', text: 'Place both a Start (S) and an Exit (🏁) tile!' });
      return null;
    }

    if ((switchPos && !doorPos) || (!switchPos && doorPos)) {
      sound.playError();
      setStatusMsg({ kind: 'err', text: 'A Switch needs a matching Gate (and vice versa)!' });
      return null;
    }

    if (portals.length === 1) {
      sound.playError();
      setStatusMsg({ kind: 'err', text: 'Place 2 Portal pads to link a teleporter pair!' });
      return null;
    }

    const level: LevelDefinition = {
      id: 30000 + Date.now() % 10000,
      world: 0,
      name: name.trim() || 'Custom Puzzle',
      cols: COLS,
      rows: ROWS,
      maxTiles,
      start,
      exit,
      fixed: fixed.length ? fixed : undefined,
      rocks: rocks.length ? rocks : undefined,
      sticky: sticky.length ? sticky : undefined,
      crumbling: crumbling.length ? crumbling : undefined,
      ice: ice.length ? ice : undefined,
      springs: springs.length ? springs : undefined,
      keys: keys.length ? keys : undefined,
      locks: locks.length ? locks : undefined,
      phaseTiles: phaseTiles.length ? phaseTiles : undefined,
      bonusTiles: bonusTiles.length ? bonusTiles : undefined,
      crates: crates.length ? crates : undefined,
      stars: stars.length ? stars : undefined,
      switches:
        switchPos && doorPos
          ? [
              {
                id: 'g1',
                switchPos,
                doorPos,
                ...(gateTimer === -1 ? { holdSwitch: true } : {}),
                ...(gateTimer > 0 ? { timedDuration: gateTimer } : {}),
              },
            ]
          : undefined,
      teleporters: portals.length === 2 ? [{ id: 'tp-1', posA: portals[0], posB: portals[1] }] : undefined,
      parMoves: 0,
      hint: 'Custom puzzle built in Builder Studio!',
    };

    const sol = solveLevel(level, 40);
    if (!sol.solvable) {
      sound.playError();
      setStatusMsg({
        kind: 'err',
        text: 'Unsolvable! Add stepping islands or increase your tile budget.',
      });
      return null;
    }

    level.parMoves = sol.minMoves;
    level.star2Moves = sol.minMoves + Math.max(2, Math.ceil(sol.minMoves * 0.25));
    setStatusMsg({
      kind: 'ok',
      text: `Verified solvable! Optimal Par: ${sol.minMoves} moves.`,
    });
    return level;
  };

  const handlePlay = () => {
    const verified = buildAndVerify();
    if (!verified) return;
    storage.saveCustomLevel(verified);
    setSavedLevels([...storage.getData().customLevels]);
    sound.playStar();
    onPlayCustomLevel(verified);
  };

  const handleGenerateShare = async () => {
    const verified = buildAndVerify();
    if (!verified) return;
    storage.saveCustomLevel(verified);
    setSavedLevels([...storage.getData().customLevels]);
    const code = encodeLevelCode(verified);
    setShareCode(code);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard optional
    }
  };

  const handleImportCode = () => {
    if (!importText.trim()) return;
    const res = decodeLevelCode(importText);
    if (!res.ok) {
      sound.playError();
      setStatusMsg({ kind: 'err', text: res.error });
      return;
    }
    sound.playStar();
    storage.saveCustomLevel(res.level);
    setSavedLevels([...storage.getData().customLevels]);
    setGrid(levelToGrid(res.level));
    setName(res.level.name);
    setMaxTiles(res.level.maxTiles);
    const sw = res.level.switches?.[0];
    setGateTimer(sw?.holdSwitch ? -1 : sw?.timedDuration || 0);
    setImportText('');
    setStatusMsg({
      kind: 'ok',
      text: `Imported "${res.level.name}" (Par ${res.parMoves})! Ready to play.`,
    });
    onPlayCustomLevel(res.level);
  };

  const loadLevelIntoEditor = (lvl: LevelDefinition, message: string) => {
    setGrid(levelToGrid(lvl));
    setName(lvl.name);
    setMaxTiles(lvl.maxTiles);
    const sw = lvl.switches?.[0];
    setGateTimer(sw?.holdSwitch ? -1 : sw?.timedDuration || 0);
    setShareCode('');
    setStatusMsg({ kind: 'ok', text: message });
  };

  const handleRandomize = () => {
    sound.playStar();
    const randomLvl = generateStudioRandomLevel(Date.now() % 1000000);
    loadLevelIntoEditor(
      randomLvl,
      `Generated "${randomLvl.name}" (Par ${randomLvl.parMoves}) — tweak or tap Play!`
    );
  };

  const renderCellBadge = (cell: CellData) => {
    const map: Record<CellData['base'], { bg: string; icon: string }> = {
      void: { bg: 'bg-slate-900/90 border-slate-800', icon: '' },
      start: { bg: 'bg-emerald-500/80 border-emerald-300 text-slate-950 font-black', icon: 'S' },
      exit: { bg: 'bg-amber-500/85 border-amber-300', icon: '🏁' },
      fixed: { bg: 'bg-sky-500/75 border-sky-300', icon: '' },
      rock: { bg: 'bg-slate-600 border-slate-400', icon: '🪨' },
      sticky: { bg: 'bg-purple-600/80 border-purple-400', icon: '🍯' },
      crumbling: { bg: 'bg-stone-500/80 border-stone-300', icon: '🧱' },
      ice: { bg: 'bg-cyan-300/80 border-white text-slate-900', icon: '❄️' },
      spring: { bg: 'bg-teal-500/85 border-amber-300', icon: '🦘' },
      key: { bg: 'bg-yellow-500/80 border-yellow-200', icon: '🔑' },
      lock: { bg: 'bg-amber-800/90 border-amber-400', icon: '🔒' },
      phaseEven: { bg: 'bg-cyan-500/80 border-cyan-200 text-slate-950 font-black', icon: '0·2' },
      phaseOdd: { bg: 'bg-fuchsia-500/80 border-fuchsia-200 text-white font-black', icon: '1·3' },
      crate: { bg: 'bg-amber-600/85 border-amber-300', icon: '📦' },
      switchA: { bg: 'bg-blue-500/80 border-sky-300', icon: '🔘' },
      doorA: { bg: 'bg-rose-600/80 border-rose-300', icon: '🚧' },
      portal1: { bg: 'bg-fuchsia-600/80 border-fuchsia-300', icon: '🌀' },
    };
    return map[cell.base];
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md safe-top">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="p-2 bg-slate-800 border border-slate-700 rounded-xl active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-extrabold tracking-tight">Builder Studio</h2>
          <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
            Offline Puzzle Creator
          </p>
        </div>
        <button
          onClick={() => {
            sound.playTap();
            setShowSaved(!showSaved);
          }}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
        >
          <FolderOpen size={14} className="text-amber-400" />
          <span>{savedLevels.length}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 max-w-md mx-auto w-full safe-bottom">
        {showSaved && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 flex flex-col gap-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Saved Custom Puzzles
            </div>
            {savedLevels.length === 0 ? (
              <p className="text-xs text-slate-400">No saved puzzles yet.</p>
            ) : (
              savedLevels.map((lvl) => (
                <div
                  key={lvl.id}
                  className="flex items-center justify-between gap-2.5 bg-slate-950/70 px-2.5 py-2 rounded-xl border border-slate-800"
                >
                  <BoardThumbnail level={lvl} className="w-10 h-11 flex-none" />
                  <button
                    onClick={() => {
                      sound.playTap();
                      loadLevelIntoEditor(lvl, `Loaded "${lvl.name}" into editor.`);
                      setShowSaved(false);
                    }}
                    className="text-left flex-1 min-w-0"
                  >
                    <div className="text-xs font-bold text-white truncate">{lvl.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Par {lvl.parMoves} · {lvl.maxTiles} tiles
                    </div>
                  </button>
                  <button
                    onClick={() => onPlayCustomLevel(lvl)}
                    className="px-2.5 py-1 bg-sky-500 text-slate-950 text-[11px] font-extrabold rounded-lg"
                  >
                    Play
                  </button>
                  <button
                    onClick={() => {
                      storage.deleteCustomLevel(lvl.id);
                      setSavedLevels([...storage.getData().customLevels]);
                    }}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    aria-label="Delete custom level"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Starter Blueprints & Random Generator */}
        <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Starter Blueprints
            </span>
            <button
              onClick={handleRandomize}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition-all"
            >
              <Dices size={12} />
              <span>Random Puzzle</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {STUDIO_BLUEPRINTS.map((bp) => (
              <button
                key={bp.id}
                onClick={() => {
                  sound.playTap();
                  loadLevelIntoEditor(
                    bp.level,
                    `Loaded "${bp.level.name}" blueprint — remix or tap Play!`
                  );
                }}
                className="py-1.5 px-1 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-[10px] font-bold text-slate-200 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
              >
                <span className="text-sm">{bp.icon}</span>
                <span className="truncate w-full text-center">{bp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name & Tile Budget */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            maxLength={28}
            onChange={(e) => setName(e.target.value)}
            placeholder="Puzzle name"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
          />
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs font-bold">
            <span className="text-slate-400 text-[10px] uppercase">Tiles</span>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => {
                  sound.playTap();
                  setMaxTiles(n);
                }}
                className={`w-6 h-6 rounded-lg font-mono text-xs font-black ${
                  maxTiles === n ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Gate Mode: Toggle, Weighted Hold Plate, or Timed Countdown */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">🚧 Gate Mode</span>
          <div className="flex items-center gap-1">
            {[
              { val: 0, label: 'Toggle' },
              { val: -1, label: 'Hold' },
              { val: 3, label: '3t' },
              { val: 4, label: '4t' },
              { val: 5, label: '5t' },
              { val: 6, label: '6t' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => {
                  sound.playTap();
                  setGateTimer(opt.val);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                  gateTimer === opt.val
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive 6x7 Painter Grid */}
        <div className="grid grid-cols-6 gap-1.5 bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800">
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const visual = renderCellBadge(cell);
              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => handleCellTap(x, y)}
                  className={`aspect-square rounded-lg border flex items-center justify-center text-sm relative active:scale-90 transition-transform ${visual.bg}`}
                >
                  <span>{visual.icon}</span>
                  {cell.hasGem && (
                    <span className="absolute top-0.5 right-0.5 text-[10px] leading-none">💎</span>
                  )}
                  {cell.hasBonus && (
                    <span className="absolute bottom-0.5 left-0.5 text-[9px] font-black bg-amber-400 text-slate-950 px-1 rounded">
                      +1
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Brush Palette */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {BRUSHES.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                sound.playTap();
                setBrush(b.id);
              }}
              className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                brush === b.id
                  ? 'ring-2 ring-white scale-105 ' + b.color
                  : b.color + ' opacity-75'
              }`}
            >
              <span>{b.badge}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>

        {/* Solver Status Banner */}
        <div
          className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center ${
            statusMsg.kind === 'ok'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : statusMsg.kind === 'err'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          {statusMsg.text}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePlay}
            className="py-3 bg-gradient-to-r from-sky-500 to-blue-600 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            <Play size={15} className="fill-white" />
            <span>Verify & Play</span>
          </button>
          <button
            onClick={handleGenerateShare}
            className="py-3 bg-slate-800 active:scale-95 border border-slate-700 text-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Code Copied!' : 'Share Code'}</span>
          </button>
        </div>

        {shareCode && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-2 text-[10px] font-mono text-amber-200 break-all select-text">
            {shareCode}
          </div>
        )}

        {/* Import Offline Share Code */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
            <Sparkles size={13} className="text-sky-400" />
            <span>Import Offline Share Code (STF1:...)</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste STF1:... code here"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleImportCode}
              className="px-3 py-2 bg-emerald-500 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1"
            >
              <Download size={14} />
              <span>Play</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
