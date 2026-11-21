import React, { useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { sound } from '../audio/soundManager';

type CodexCategory = 'all' | 'core' | 'hazards' | 'contraptions';

interface MechanicEntry {
  id: string;
  icon: string;
  title: string;
  worldTag: string;
  category: Exclude<CodexCategory, 'all'>;
  accent: string;
  rule: string;
  tip: string;
}

const MECHANICS: MechanicEntry[] = [
  {
    id: 'reclaim',
    icon: '🧱',
    title: 'Bridge & Solid Reclamation',
    worldTag: 'World 1',
    category: 'core',
    accent: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    rule: 'Stepping into void drops a bridge tile from your hand. Stepping onto any solid island pulls all un-trapped bridge tiles back!',
    tip: 'Count gaps carefully: a budget of 2 tiles lets you cross 2 void squares between solid islands (3 steps total).',
  },
  {
    id: 'gems',
    icon: '💎',
    title: 'Collectible Gems',
    worldTag: 'World 1',
    category: 'core',
    accent: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    rule: 'Every glowing gem on the board must be collected before stepping onto the Exit Flag.',
    tip: 'Gems are separate from Par Stars—plan a route that sweeps all gems within Par moves for 3★!',
  },
  {
    id: 'bonus',
    icon: '➕',
    title: '+1 Bonus Tile Spark',
    worldTag: 'World 6',
    category: 'core',
    accent: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
    rule: 'Picking up a glowing +1 Spark permanently increases your tile hand size for the rest of the level.',
    tip: 'If a gap looks 1 tile too wide, look for a detour to grab a +1 Spark first!',
  },
  {
    id: 'rocks',
    icon: '🪨',
    title: 'Granite Rocks',
    worldTag: 'World 2',
    category: 'hazards',
    accent: 'border-slate-500/50 bg-slate-700/30 text-slate-200',
    rule: 'Solid rock pillars completely block movement and crate pushing.',
    tip: 'Rocks stop Ice slides too—use them as brakes, or vault right over them with a Springboard!',
  },
  {
    id: 'sticky',
    icon: '🍯',
    title: 'Sticky Honey',
    worldTag: 'World 3',
    category: 'hazards',
    accent: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    rule: 'Leaving a bridge tile placed on sticky honey traps it forever, shrinking your usable tile hand by 1.',
    tip: 'Only step into honey if you can finish the rest of the board with your reduced tile budget.',
  },
  {
    id: 'crumbling',
    icon: '🪨',
    title: 'Crumbling Stone',
    worldTag: 'World 3',
    category: 'hazards',
    accent: 'border-stone-400/40 bg-stone-500/15 text-stone-200',
    rule: 'Acts as solid ground to recharge your tiles once—then shatters into empty void as soon as you step off.',
    tip: 'You can still cross a shattered square later by spending a bridge tile on the void it left behind.',
  },
  {
    id: 'oneway',
    icon: '➡️',
    title: 'One-Way Arrow Pads',
    worldTag: 'World 3',
    category: 'hazards',
    accent: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    rule: 'You can enter an arrow pad from any side, but you may only exit in the direction it points.',
    tip: 'Collect upstream gems before committing to a one-way funnel!',
  },
  {
    id: 'switches',
    icon: '🔘',
    title: 'Switches & Laser Gates',
    worldTag: 'World 4',
    category: 'contraptions',
    accent: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    rule: 'Step on a colored pressure plate (A/B) to toggle its matching laser gate open or closed. Open gates act as solid ground!',
    tip: 'Watch your step when backtracking across a toggle switch so you do not accidentally re-lock your gate.',
  },
  {
    id: 'portals',
    icon: '🌀',
    title: 'Warp Portals',
    worldTag: 'World 4',
    category: 'contraptions',
    accent: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300',
    rule: 'Stepping onto a rune portal (I/II) instantly teleports Puff to its matching twin pad and reclaims bridge tiles.',
    tip: 'Stepping back onto the exit twin warps you right back—great for grabbing gems across walled chambers.',
  },
  {
    id: 'ice',
    icon: '❄️',
    title: 'Frozen Ice Rinks',
    worldTag: 'World 6',
    category: 'contraptions',
    accent: 'border-sky-300/40 bg-sky-400/10 text-sky-200',
    rule: 'Stepping onto ice slides Puff continuously across connected walkable tiles in one move until stopping on solid ground or an obstacle.',
    tip: 'Slides cost just 1 move—and pushable crates also glide straight across connected ice!',
  },
  {
    id: 'timed',
    icon: '⏱️',
    title: 'Clockwork Timed Gates',
    worldTag: 'World 7',
    category: 'contraptions',
    accent: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    rule: 'Timed switches hold their gate open for a limited number of moves shown on the countdown badge. Stepping on the switch again refreshes the timer.',
    tip: 'A timed gate will never snap shut while Puff is standing directly on it—aim to reach the gate on or before 1 move left!',
  },
  {
    id: 'crates',
    icon: '📦',
    title: 'Pushable Crates & Weighted Plates',
    worldTag: 'World 8',
    category: 'contraptions',
    accent: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    rule: 'Shove heavy crates across solid ground (or ice!) onto square-socket Weighted Plates to hold sanctum gates open while you pass.',
    tip: 'Avoid pushing crates into corners or dead ends—approach from the side opposite the plate!',
  },
  {
    id: 'springs',
    icon: '🦘',
    title: 'Golden Springboards',
    worldTag: 'World 9',
    category: 'contraptions',
    accent: 'border-teal-400/40 bg-teal-500/10 text-teal-200',
    rule: 'Stepping onto a Springboard vaults Puff 2 tiles forward in your move direction, leaping right over rocks, void, or honey! Chained springs bounce consecutively.',
    tip: 'Approach the same Springboard from different sides to launch in different directions—and you can even vault straight onto Void (using 1 tile) or Ice!',
  },
  {
    id: 'keys',
    icon: '🔑',
    title: 'Golden Keys & Vault Locks',
    worldTag: 'World 10',
    category: 'contraptions',
    accent: 'border-yellow-400/40 bg-yellow-500/10 text-yellow-200',
    rule: 'Collect a floating Golden Key to carry it in your pocket. Stepping onto a Locked Vault consumes 1 Key and permanently turns the vault into solid ground!',
    tip: 'Once unlocked, a Vault Lock stays open forever, reclaims bridge tiles, and even lets pushable crates slide across it.',
  },
];

interface CodexModalProps {
  onBack: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onBack }) => {
  const [category, setCategory] = useState<CodexCategory>('all');

  const visible =
    category === 'all' ? MECHANICS : MECHANICS.filter((m) => m.category === category);

  const tabs: Array<{ id: CodexCategory; label: string }> = [
    { id: 'all', label: `All (${MECHANICS.length})` },
    { id: 'core', label: 'Core' },
    { id: 'hazards', label: 'Hazards' },
    { id: 'contraptions', label: 'Contraptions' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md safe-top">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="p-2 bg-slate-800 border border-slate-700 rounded-xl active:scale-95 transition-all"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="text-base font-extrabold tracking-tight flex items-center gap-1.5 justify-center">
            <BookOpen size={16} className="text-sky-400" />
            <span>Mechanic Field Guide</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            All 14 Puzzle Rules &amp; Tactics
          </p>
        </div>
        <div className="w-9" />
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const active = tab.id === category;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTap();
                setCategory(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex-none ${
                active
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm shadow-sky-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mechanics List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-w-md mx-auto w-full safe-bottom">
        {visible.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg flex-none ${item.accent}`}
                >
                  {item.icon}
                </div>
                <h3 className="text-sm font-extrabold text-white truncate">{item.title}</h3>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 flex-none">
                {item.worldTag}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{item.rule}</p>

            <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-sky-300/90 leading-snug">
              <span className="font-black text-sky-400">Tip: </span>
              {item.tip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
