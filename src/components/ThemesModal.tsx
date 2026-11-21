import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Palette, Sparkles, Wind } from 'lucide-react';
import { THEMES, SKINS, TRAILS, storage } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface ThemesModalProps {
  onBack: () => void;
  onThemeChanged: (themeId: string, skinColor: string, trailId: string) => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({ onBack, onThemeChanged }) => {
  const [tab, setTab] = useState<'themes' | 'skins' | 'trails'>('themes');
  const [data, setData] = useState(() => storage.getData());

  const notifyChange = () => {
    const latest = storage.getData();
    const skin = SKINS.find((s) => s.id === latest.selectedSkin);
    onThemeChanged(latest.selectedTheme, skin?.color || '#f59e0b', latest.selectedTrail);
  };

  const handleSelectTheme = (themeId: string) => {
    sound.playTap();
    storage.selectTheme(themeId);
    setData({ ...storage.getData() });
    notifyChange();
  };

  const handleUnlockTheme = (themeId: string, price: number) => {
    const ok = storage.unlockTheme(themeId, price);
    if (ok) {
      sound.playStar();
      setData({ ...storage.getData() });
      notifyChange();
    } else {
      sound.playError();
    }
  };

  const handleSelectSkin = (skinId: string) => {
    sound.playTap();
    storage.selectSkin(skinId);
    setData({ ...storage.getData() });
    notifyChange();
  };

  const handleUnlockSkin = (skinId: string, price: number) => {
    const ok = storage.unlockSkin(skinId, price);
    if (ok) {
      sound.playStar();
      setData({ ...storage.getData() });
      notifyChange();
    } else {
      sound.playError();
    }
  };

  const handleSelectTrail = (trailId: string) => {
    sound.playTap();
    storage.selectTrail(trailId);
    setData({ ...storage.getData() });
    notifyChange();
  };

  const handleUnlockTrail = (trailId: string, price: number) => {
    const ok = storage.unlockTrail(trailId, price);
    if (ok) {
      sound.playStar();
      setData({ ...storage.getData() });
      notifyChange();
    } else {
      sound.playError();
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md safe-top">
        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="p-2 bg-slate-800 border border-slate-700 rounded-xl active:scale-95 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-extrabold tracking-tight">Customization</h2>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-bold text-xs">
          <span>{data.coins}</span>
          <span>🪙</span>
        </div>
      </div>

      {/* Tabs: Environments, Skins, Trails */}
      <div className="flex items-center p-2 bg-slate-900 border-b border-slate-800 gap-1">
        <button
          onClick={() => {
            sound.playTap();
            setTab('themes');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            tab === 'themes'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette size={14} />
          <span>Themes</span>
        </button>
        <button
          onClick={() => {
            sound.playTap();
            setTab('skins');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            tab === 'skins'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          <span>Skins</span>
        </button>
        <button
          onClick={() => {
            sound.playTap();
            setTab('trails');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            tab === 'trails'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wind size={14} />
          <span>Trails</span>
        </button>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 safe-bottom">
        {tab === 'themes' &&
          THEMES.map((theme) => {
            const isUnlocked = data.unlockedThemes.includes(theme.id);
            const isSelected = data.selectedTheme === theme.id;
            const canAfford = data.coins >= theme.price;

            return (
              <div
                key={theme.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 ring-2 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border border-white/20 shadow-inner flex items-center justify-center"
                    style={{ background: theme.bg }}
                  >
                    <div
                      className="w-6 h-6 rounded-md shadow"
                      style={{ background: theme.previewColor }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{theme.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      {isUnlocked ? (isSelected ? 'Active theme' : 'Unlocked') : `${theme.price} Coins`}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="px-3 py-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-xl text-xs font-bold flex items-center gap-1">
                    <Check size={14} />
                    <span>Active</span>
                  </div>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleSelectTheme(theme.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-bold text-white transition-all"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockTheme(theme.id, theme.price)}
                    disabled={!canAfford}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Lock size={12} />
                    <span>Unlock</span>
                  </button>
                )}
              </div>
            );
          })}

        {tab === 'skins' &&
          SKINS.map((skin) => {
            const isUnlocked = data.unlockedSkins.includes(skin.id);
            const isSelected = data.selectedSkin === skin.id;
            const canAfford = data.coins >= skin.price;

            return (
              <div
                key={skin.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 ring-2 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white/20 shadow-inner flex items-center justify-center relative"
                    style={{ background: skin.color }}
                  >
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full mr-2" />
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{skin.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      {isUnlocked ? (isSelected ? 'Active skin' : 'Unlocked') : `${skin.price} Coins`}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="px-3 py-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-xl text-xs font-bold flex items-center gap-1">
                    <Check size={14} />
                    <span>Active</span>
                  </div>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleSelectSkin(skin.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-bold text-white transition-all"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockSkin(skin.id, skin.price)}
                    disabled={!canAfford}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Lock size={12} />
                    <span>Unlock</span>
                  </button>
                )}
              </div>
            );
          })}

        {tab === 'trails' &&
          TRAILS.map((trail) => {
            const isUnlocked = data.unlockedTrails.includes(trail.id);
            const isSelected = data.selectedTrail === trail.id;
            const canAfford = data.coins >= trail.price;

            return (
              <div
                key={trail.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 ring-2 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border border-white/20 shadow-inner flex items-center justify-center"
                    style={{ background: trail.preview }}
                  >
                    <Wind size={18} className="text-white drop-shadow" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{trail.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      {isUnlocked ? (isSelected ? 'Active trail' : 'Unlocked') : `${trail.price} Coins`}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="px-3 py-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-xl text-xs font-bold flex items-center gap-1">
                    <Check size={14} />
                    <span>Active</span>
                  </div>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleSelectTrail(trail.id)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-bold text-white transition-all"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockTrail(trail.id, trail.price)}
                    disabled={!canAfford}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <Lock size={12} />
                    <span>Unlock</span>
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
