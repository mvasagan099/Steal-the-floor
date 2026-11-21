import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  Smartphone,
  Trash2,
  ShieldCheck,
  Download,
  Upload,
  Check,
  Timer,
  Eye,
  Sparkles,
} from 'lucide-react';
import { storage } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface SettingsModalProps {
  onBack: () => void;
  onReset: () => void;
  onSettingsChanged?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onBack,
  onReset,
  onSettingsChanged,
}) => {
  const [data, setData] = useState(() => storage.getData());
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const [restoreInput, setRestoreInput] = useState('');
  const [backupMsg, setBackupMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const handleMusicChange = (val: number) => {
    sound.setMusicVolume(val);
    const updated = storage.getData();
    updated.settings.musicVolume = val;
    storage.save();
    setData({ ...updated });
  };

  const handleSfxChange = (val: number) => {
    sound.setSfxVolume(val);
    const updated = storage.getData();
    updated.settings.sfxVolume = val;
    storage.save();
    setData({ ...updated });
  };

  const handleToggleHaptics = () => {
    sound.playTap();
    const updated = storage.getData();
    updated.settings.hapticsEnabled = !updated.settings.hapticsEnabled;
    sound.hapticsEnabled = updated.settings.hapticsEnabled;
    storage.save();
    setData({ ...updated });
    if (updated.settings.hapticsEnabled) {
      sound.triggerHaptic('medium');
    }
    onSettingsChanged?.();
  };

  const handleToggleSetting = (key: 'speedrunTimer' | 'highContrast' | 'reducedMotion') => {
    sound.playTap();
    const updated = storage.getData();
    updated.settings[key] = !updated.settings[key];
    storage.save();
    setData({ ...updated });
    onSettingsChanged?.();
  };

  const handleExportBackup = async () => {
    sound.playTap();
    const code = storage.exportSaveCode();
    setExportCode(code);
    try {
      await navigator.clipboard.writeText(code);
      setBackupCopied(true);
      setBackupMsg({ kind: 'ok', text: 'Save backup copied to clipboard!' });
      setTimeout(() => setBackupCopied(false), 2200);
    } catch {
      setBackupMsg({ kind: 'ok', text: 'Backup generated below — copy it to transfer your save.' });
    }
  };

  const handleRestoreBackup = () => {
    if (!restoreInput.trim()) return;
    const res = storage.importSaveCode(restoreInput);
    if (!res.ok) {
      sound.playError();
      setBackupMsg({ kind: 'err', text: res.error });
      return;
    }
    sound.playStar();
    const fresh = storage.getData();
    setData({ ...fresh });
    setRestoreInput('');
    setBackupMsg({ kind: 'ok', text: 'Progress restored successfully!' });
    onSettingsChanged?.();
    onReset();
  };

  const handleResetProgress = () => {
    sound.playError();
    storage.resetProgress();
    setShowConfirmReset(false);
    onSettingsChanged?.();
    onReset();
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
        <h2 className="text-base font-extrabold tracking-tight">Settings</h2>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-w-sm mx-auto w-full safe-bottom">
        {/* Audio Volume Controls */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Volume2 size={16} />
            <span>Audio & Music</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Music Volume</span>
              <span className="font-mono">{Math.round(data.settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={data.settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Sound Effects</span>
              <span className="font-mono">{Math.round(data.settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={data.settings.sfxVolume}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              className="accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Haptics & Vibration */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone size={18} className="text-sky-400" />
            <div>
              <div className="text-xs font-bold text-white">Haptic Vibration</div>
              <div className="text-[11px] text-slate-400">Tactile tap feedback on steps</div>
            </div>
          </div>
          <button
            onClick={handleToggleHaptics}
            aria-label="Toggle Haptic Vibration"
            className={`w-12 h-7 rounded-full transition-all relative p-1 flex-none ${
              data.settings.hapticsEnabled ? 'bg-sky-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-all ${
                data.settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Gameplay & Accessibility */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Eye size={16} />
            <span>Gameplay & Accessibility</span>
          </div>

          {/* Speedrun Timer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Timer size={17} className="text-indigo-400 flex-none" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white">Speedrun Timer</div>
                <div className="text-[11px] text-slate-400">Live clear clock & personal bests</div>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('speedrunTimer')}
              aria-label="Toggle Speedrun Timer"
              className={`w-12 h-7 rounded-full transition-all relative p-1 flex-none ${
                data.settings.speedrunTimer ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  data.settings.speedrunTimer ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High-Contrast Patterns */}
          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <Eye size={17} className="text-amber-400 flex-none" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white">High-Contrast Patterns</div>
                <div className="text-[11px] text-slate-400">Crisper tile borders & rivets</div>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('highContrast')}
              aria-label="Toggle High-Contrast Patterns"
              className={`w-12 h-7 rounded-full transition-all relative p-1 flex-none ${
                data.settings.highContrast ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  data.settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles size={17} className="text-emerald-400 flex-none" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white">Reduced Motion</div>
                <div className="text-[11px] text-slate-400">Turns off shake, confetti & particles</div>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('reducedMotion')}
              aria-label="Toggle Reduced Motion"
              className={`w-12 h-7 rounded-full transition-all relative p-1 flex-none ${
                data.settings.reducedMotion ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  data.settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Offline Save Backup / Device Transfer */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Offline Save Backup
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Transfer your stars, themes, daily medals, and custom levels to another device without any account or server.
          </p>
          <button
            onClick={handleExportBackup}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {backupCopied ? (
              <Check size={14} className="text-emerald-400" />
            ) : (
              <Download size={14} className="text-sky-400" />
            )}
            <span>{backupCopied ? 'Copied Backup Code!' : 'Copy Save Backup Code'}</span>
          </button>

          {exportCode && (
            <input
              type="text"
              readOnly
              value={exportCode}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-sky-300"
            />
          )}

          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              value={restoreInput}
              onChange={(e) => setRestoreInput(e.target.value)}
              placeholder="Paste STFSAVE:... code"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleRestoreBackup}
              className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 rounded-xl text-xs font-bold text-sky-300 flex items-center gap-1 active:scale-95"
            >
              <Upload size={13} />
              <span>Restore</span>
            </button>
          </div>

          {backupMsg && (
            <div
              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg ${
                backupMsg.kind === 'ok'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {backupMsg.text}
            </div>
          )}
        </div>

        {/* Privacy & Offline Info */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-400 flex-none mt-0.5" />
          <div className="text-left text-xs">
            <div className="font-bold text-white mb-0.5">100% Offline & Private</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Steal the Floor runs entirely on your device. No ads, analytics, tracking, or remote servers. All your level progress is saved safely in local storage.
            </p>
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-2xl flex flex-col gap-2">
          {!showConfirmReset ? (
            <button
              onClick={() => {
                sound.playTap();
                setShowConfirmReset(true);
              }}
              className="flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
            >
              <Trash2 size={15} />
              <span>Reset Game Progress</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 text-center animate-in fade-in">
              <span className="text-xs font-bold text-rose-300">
                Are you sure? This will erase all unlocked levels!
              </span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  className="py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  Yes, Wipe Data
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-slate-600 font-mono mt-2">
          Steal the Floor v2.2.0 • 100% Offline Ad-Free Build
        </div>
      </div>
    </div>
  );
};
