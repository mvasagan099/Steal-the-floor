import { LevelDefinition } from '../engine/types';
import { ALL_LEVELS } from './levelsData';

export interface GauntletDefinition {
  id: string;
  name: string;
  icon: string;
  accent: string;
  subtitle: string;
  description: string;
  levelIds: number[];
}

export const MASTER_GAUNTLETS: GauntletDefinition[] = [
  {
    id: 'island-sprint',
    name: 'Island Sprint',
    icon: '🏝️',
    accent: 'from-sky-500/20 to-cyan-500/10 border-sky-400/40 text-sky-300',
    subtitle: 'Worlds 1–2 · Fundamentals',
    description: '4 fast-paced trials testing bridge reach, gem detours, and rock corridors.',
    levelIds: [5, 14, 24, 38],
  },
  {
    id: 'hazard-crucible',
    name: 'Hazard Crucible',
    icon: '🔥',
    accent: 'from-purple-500/20 to-rose-500/10 border-purple-400/40 text-purple-300',
    subtitle: 'Worlds 3–5 · Hazards & Portals',
    description: 'Master sticky honey sacrifices, crumbling checkpoints, laser gates, and warp portals.',
    levelIds: [44, 52, 66, 98],
  },
  {
    id: 'clockwork-frost',
    name: 'Clockwork Frost',
    icon: '❄️',
    accent: 'from-cyan-500/20 to-amber-500/10 border-cyan-400/40 text-cyan-200',
    subtitle: 'Worlds 6–7 · Ice & Countdowns',
    description: 'Chain frozen ice glides, +1 Bonus Tiles, and razor-tight countdown gates.',
    levelIds: [104, 118, 127, 140],
  },
  {
    id: 'sanctum-acrobat',
    name: 'Sanctum Acrobat',
    icon: '🦘',
    accent: 'from-teal-500/20 to-amber-500/10 border-teal-400/40 text-teal-200',
    subtitle: 'Worlds 8–9 · Crates & Springboards',
    description: 'Shove heavy crates onto weighted plates and vault over walls with golden springs.',
    levelIds: [146, 158, 168, 180],
  },
  {
    id: 'celestial-trial',
    name: 'Celestial Grand Trial',
    icon: '👑',
    accent: 'from-indigo-500/25 to-yellow-500/15 border-yellow-400/50 text-yellow-200',
    subtitle: 'World 10 · Keys, Vaults & Finale',
    description: 'Conquer sealed vaults, crate-lock chains, and Level 200 back-to-back!',
    levelIds: [183, 194, 198, 200],
  },
  {
    id: 'chrono-prism-trial',
    name: 'Chrono Prism Trial',
    icon: '⏳',
    accent: 'from-cyan-500/25 to-fuchsia-500/20 border-cyan-400/50 text-cyan-200',
    subtitle: 'World 11 · Bridge-Parity Phase Mastery',
    description: 'Chain even & odd phase islands, sanctum crates, and Level 220 back-to-back!',
    levelIds: [203, 209, 215, 220],
  },
  {
    id: 'aether-currents-trial',
    name: 'Aether Currents Trial',
    icon: '🌊',
    accent: 'from-emerald-500/25 to-teal-500/20 border-emerald-400/50 text-emerald-200',
    subtitle: 'World 12 · Conveyor Belt Mastery',
    description: 'Ride elbow tracks, corner crate freight, parity surges, and Level 240 back-to-back!',
    levelIds: [223, 232, 237, 240],
  },
];

export function getGauntletById(id: string): GauntletDefinition | undefined {
  return MASTER_GAUNTLETS.find((g) => g.id === id);
}

export function getGauntletStages(gauntletId: string): LevelDefinition[] {
  const gauntlet = getGauntletById(gauntletId);
  if (!gauntlet) return [];
  return gauntlet.levelIds
    .map((id) => ALL_LEVELS.find((l) => l.id === id))
    .filter((l): l is LevelDefinition => Boolean(l));
}

export function getGauntletParTotals(gauntletId: string): {
  totalPar: number;
  silverMaxMoves: number;
} {
  const stages = getGauntletStages(gauntletId);
  const totalPar = stages.reduce((sum, s) => sum + s.parMoves, 0);
  const silverMaxMoves = stages.reduce(
    (sum, s) => sum + (s.star2Moves || s.parMoves + 2),
    0
  );
  return { totalPar, silverMaxMoves };
}

export function evaluateGauntletMedal(
  totalMoves: number,
  totalPar: number,
  silverMaxMoves: number
): 'bronze' | 'silver' | 'gold' {
  if (totalMoves <= totalPar) return 'gold';
  if (totalMoves <= silverMaxMoves) return 'silver';
  return 'bronze';
}
