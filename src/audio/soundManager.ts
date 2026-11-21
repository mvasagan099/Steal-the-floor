// High-quality procedural Web Audio engine for Steal the Floor
// Zero external files, 100% offline, zero latency, ultra-lightweight
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private chordStep = 0;

  public musicEnabled = true;
  public sfxEnabled = true;
  public hapticsEnabled = true;
  public musicVolume = 0.4;
  public sfxVolume = 0.7;

  private constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) {
          this.ctx.suspend().catch(() => {});
        } else if (this.musicEnabled || this.sfxEnabled) {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.connect(this.ctx.destination);

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.value = this.musicVolume;
      this.musicGainNode.connect(this.masterGainNode);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.value = this.sfxVolume;
      this.sfxGainNode.connect(this.masterGainNode);

      if (this.ctx.state === 'suspended') {
        const resume = () => {
          this.ctx?.resume();
          window.removeEventListener('pointerdown', resume);
          window.removeEventListener('keydown', resume);
        };
        window.addEventListener('pointerdown', resume);
        window.addEventListener('keydown', resume);
      }
    } catch {
      // AudioContext not supported
    }
  }

  private ensureCtx(): AudioContext | null {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMusicVolume(val: number): void {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // ---- SFX GENERATORS ----

  public playTap(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playPlaceTile(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playRecoverTile(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.14);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playStep(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.07);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playStar(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  public playTeleport(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.22);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playSwitch(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.setValueAtTime(700, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playPushCrate(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(92, t + 0.14);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playSpring(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.14);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.22);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playKeyPickup(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const notes = [880, 1174.66, 1567.98]; // A5, D6, G6 shimmering chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.05;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGainNode!);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  public playUnlockVault(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const t = ctx.currentTime;
    // Crisp lock tumbler click + triumphant harmonic swell
    [440, 659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.045);
      gain.gain.setValueAtTime(0.18, t + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.045 + 0.32);
      osc.connect(gain);
      gain.connect(this.sfxGainNode!);
      osc.start(t + idx * 0.045);
      osc.stop(t + idx * 0.045 + 0.34);
    });
  }

  public playCrumble(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    // Filtered noise for crumbling debris
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGainNode);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  public playSticky(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(240, t + 0.08);
    osc.frequency.linearRampToValueAtTime(140, t + 0.18);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  public playError(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.setValueAtTime(120, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playWin(): void {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.sfxGainNode) return;

    // Victory arpeggio (C5, G5, C6, E6)
    const notes = [523.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + idx * 0.11;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  // ---- GENERATIVE AMBIENT BACKGROUND MUSIC ----

  public startMusic(): void {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.musicGainNode) return;

    this.isMusicPlaying = true;
    this.playAmbientChordLoop();
  }

  private currentTheme = 'floating-sky';

  public setTheme(themeId: string): void {
    this.currentTheme = themeId || 'floating-sky';
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playAmbientChordLoop(): void {
    if (!this.isMusicPlaying || !this.musicEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.musicGainNode) return;

    const themeProgressions: Record<
      string,
      Array<{ pad: number[]; chime: number[]; wave?: OscillatorType }>
    > = {
      'floating-sky': [
        { pad: [261.63, 329.63, 392.0, 493.88], chime: [523.25, 659.25, 783.99] },
        { pad: [220.0, 261.63, 329.63, 392.0], chime: [440.0, 523.25, 659.25] },
        { pad: [174.61, 220.0, 261.63, 329.63], chime: [523.25, 587.33, 659.25] },
        { pad: [196.0, 246.94, 293.66, 392.0], chime: [587.33, 659.25, 783.99] },
      ],
      'candy-world': [
        { pad: [293.66, 369.99, 440.0, 554.37], chime: [587.33, 739.99, 880.0] },
        { pad: [246.94, 293.66, 369.99, 440.0], chime: [493.88, 587.33, 739.99] },
        { pad: [196.0, 246.94, 293.66, 369.99], chime: [587.33, 659.25, 739.99] },
        { pad: [220.0, 277.18, 329.63, 440.0], chime: [659.25, 739.99, 880.0] },
      ],
      'ocean-islands': [
        { pad: [174.61, 220.0, 261.63, 329.63], chime: [523.25, 659.25, 783.99] },
        { pad: [196.0, 246.94, 293.66, 349.23], chime: [493.88, 587.33, 698.46] },
        { pad: [164.81, 196.0, 246.94, 293.66], chime: [493.88, 587.33, 659.25] },
        { pad: [220.0, 261.63, 329.63, 392.0], chime: [523.25, 659.25, 783.99] },
      ],
      'neon-space': [
        { pad: [146.83, 220.0, 261.63, 329.63], chime: [587.33, 659.25, 880.0], wave: 'triangle' },
        { pad: [130.81, 196.0, 246.94, 329.63], chime: [523.25, 659.25, 783.99], wave: 'triangle' },
        { pad: [116.54, 174.61, 220.0, 293.66], chime: [466.16, 587.33, 698.46], wave: 'triangle' },
        { pad: [130.81, 196.0, 261.63, 311.13], chime: [523.25, 622.25, 783.99], wave: 'triangle' },
      ],
      'forest-adventure': [
        { pad: [196.0, 246.94, 293.66, 369.99], chime: [392.0, 493.88, 587.33] },
        { pad: [164.81, 196.0, 246.94, 293.66], chime: [329.63, 392.0, 493.88] },
        { pad: [130.81, 164.81, 196.0, 246.94], chime: [392.0, 440.0, 493.88] },
        { pad: [146.83, 185.0, 220.0, 293.66], chime: [440.0, 493.88, 587.33] },
      ],
      'arctic-frost': [
        { pad: [329.63, 392.0, 493.88, 587.33], chime: [783.99, 987.77, 1174.66] },
        { pad: [261.63, 329.63, 392.0, 493.88], chime: [659.25, 783.99, 987.77] },
        { pad: [220.0, 261.63, 329.63, 392.0], chime: [659.25, 783.99, 880.0] },
        { pad: [246.94, 293.66, 369.99, 493.88], chime: [739.99, 880.0, 987.77] },
      ],
      'clockwork-forge': [
        { pad: [146.83, 174.61, 220.0, 261.63], chime: [440.0, 523.25, 587.33], wave: 'triangle' },
        { pad: [116.54, 146.83, 174.61, 220.0], chime: [349.23, 440.0, 523.25], wave: 'triangle' },
        { pad: [130.81, 164.81, 196.0, 261.63], chime: [392.0, 493.88, 523.25], wave: 'triangle' },
        { pad: [110.0, 138.59, 164.81, 220.0], chime: [440.0, 554.37, 659.25], wave: 'triangle' },
      ],
      'crate-sanctum': [
        { pad: [164.81, 246.94, 293.66, 392.0], chime: [493.88, 587.33, 739.99] },
        { pad: [146.83, 220.0, 261.63, 329.63], chime: [440.0, 523.25, 659.25] },
        { pad: [130.81, 196.0, 246.94, 329.63], chime: [392.0, 493.88, 659.25] },
        { pad: [146.83, 220.0, 293.66, 369.99], chime: [587.33, 659.25, 739.99] },
      ],
      'skyward-spire': [
        { pad: [293.66, 369.99, 440.0, 587.33], chime: [739.99, 880.0, 1174.66] },
        { pad: [246.94, 329.63, 392.0, 493.88], chime: [659.25, 783.99, 987.77] },
        { pad: [220.0, 293.66, 369.99, 440.0], chime: [587.33, 739.99, 880.0] },
        { pad: [261.63, 329.63, 392.0, 523.25], chime: [659.25, 783.99, 1046.5] },
      ],
      'celestial-crown': [
        { pad: [246.94, 311.13, 369.99, 493.88], chime: [739.99, 932.33, 1244.51] },
        { pad: [207.65, 246.94, 311.13, 369.99], chime: [622.25, 739.99, 987.77] },
        { pad: [185.0, 233.08, 277.18, 369.99], chime: [554.37, 739.99, 932.33] },
        { pad: [220.0, 277.18, 329.63, 440.0], chime: [659.25, 880.0, 1108.73] },
      ],
    };

    const progression = themeProgressions[this.currentTheme] || themeProgressions['floating-sky'];
    const bar = progression[this.chordStep % progression.length];
    this.chordStep = (this.chordStep + 1) % progression.length;

    const t = ctx.currentTime;
    const duration = 4.2;

    bar.pad.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = bar.wave || 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.022, t + 1.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.musicGainNode!);
      osc.start(t);
      osc.stop(t + duration);
    });

    // Subtle pentatonic chime accent mid-bar
    const chimeFreq = bar.chime[this.chordStep % bar.chime.length];
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    const chimeStart = t + 1.6;
    chimeOsc.type = 'triangle';
    chimeOsc.frequency.setValueAtTime(chimeFreq, chimeStart);
    chimeGain.gain.setValueAtTime(0.0001, chimeStart);
    chimeGain.gain.linearRampToValueAtTime(0.014, chimeStart + 0.08);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeStart + 1.6);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.musicGainNode);
    chimeOsc.start(chimeStart);
    chimeOsc.stop(chimeStart + 1.65);

    this.musicTimer = window.setTimeout(() => {
      this.playAmbientChordLoop();
    }, (duration - 0.6) * 1000);
  }

  public suspendAudio(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public resumeAudio(): void {
    if (this.ctx && this.ctx.state === 'suspended' && (this.musicEnabled || this.sfxEnabled)) {
      this.ctx.resume().catch(() => {});
    }
  }

  public triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light'): void {
    if (!this.hapticsEnabled) return;

    // Prefer native Capacitor Haptics when running inside Android/iOS shell
    if (Capacitor.isNativePlatform()) {
      try {
        switch (type) {
          case 'light':
            Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
            return;
          case 'medium':
            Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
            return;
          case 'success':
            Haptics.notification({ type: NotificationType.Success }).catch(() => {});
            return;
          case 'warning':
            Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
            return;
        }
      } catch {
        // Fall through to web vibration API
      }
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(25);
            break;
          case 'success':
            navigator.vibrate([15, 40, 30]);
            break;
          case 'warning':
            navigator.vibrate([30, 40, 50]);
            break;
        }
      } catch {
        // Haptics not available
      }
    }
  }
}

export const sound = SoundManager.getInstance();
