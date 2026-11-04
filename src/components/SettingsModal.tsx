import React, { useState } from 'react';
import { ArrowLeft, Volume2, Smartphone, Trash2, ShieldCheck } from 'lucide-react';
import { storage } from '../storage/gameStorage';
import { sound } from '../audio/soundManager';

interface SettingsModalProps {
  onBack: () => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onBack, onReset }) => {
  const [data, setData] = useState(() => storage.getData());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

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
    storage.save();
    setData({ ...updated });
    if (updated.settings.hapticsEnabled) {
      sound.triggerHaptic('medium');
    }
  };

  const handleResetProgress = () => {
    sound.playError();
    storage.resetProgress();
    setShowConfirmReset(false);
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
            className={`w-12 h-7 rounded-full transition-all relative p-1 ${
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

        {/* Privacy & Offline Info */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-400 flex-none mt-0.5" />
          <div className="text-left text-xs">
            <div className="font-bold text-white mb-0.5">100% Offline & Private</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Steal the Floor runs entirely on your device. No analytics, tracking, or remote servers. All your level progress is saved safely in local storage.
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
                  className="py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  className="py-2 bg-rose-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-slate-600 mt-2 font-mono">
          Steal the Floor · Production v1.0.0
        </div>
      </div>
    </div>
  );
};
