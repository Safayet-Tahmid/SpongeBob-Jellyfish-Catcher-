import { GameSettings } from '../types/game';

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private settings: GameSettings = {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    reducedMotion: false,
    sensitivity: 1.0,
    joystickSize: 'medium',
  };

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.setValueAtTime(this.settings.musicEnabled ? this.settings.musicVolume * 0.35 : 0, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.settings.sfxEnabled ? this.settings.sfxVolume : 0, this.ctx.currentTime);

      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public updateSettings(settings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...settings };
    if (this.ctx && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      const targetMusicGain = this.settings.musicEnabled ? this.settings.musicVolume * 0.35 : 0;
      const targetSfxGain = this.settings.sfxEnabled ? this.settings.sfxVolume : 0;

      this.musicGain.gain.setTargetAtTime(targetMusicGain, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(targetSfxGain, now, 0.05);
    }

    if (this.settings.musicEnabled && !this.isMusicPlaying) {
      this.startBackgroundMusic();
    } else if (!this.settings.musicEnabled && this.isMusicPlaying) {
      this.stopBackgroundMusic();
    }
  }

  // --- Sound Effects ---

  public playNetSwing() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio fallback safety
    }
  }

  public playCatch(type: 'PINK' | 'BLUE' | 'GOLD' | 'RAINBOW') {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    if (type === 'GOLD') {
      // Shimmering triple arpeggio
      const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.25, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.26);
      });
      return;
    }

    if (type === 'RAINBOW') {
      // Radiant rainbow chime
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.28, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.36);
      });
      return;
    }

    // Normal pink / blue: Cute plucky bubble pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type === 'BLUE' ? 'triangle' : 'sine';
    const baseFreq = type === 'BLUE' ? 620 : 540;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playElectricShock() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Buzzy saw wave + noise burst
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(65, now + 0.25);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playPowerUpCollect() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880]; // A major fanfare
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.32);
    });
  }

  public playLevelUp() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      gain.gain.setValueAtTime(0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.42);
    });
  }

  public playGameOver() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Descending sad trombone notes: F4, E4, Eb4, D4
    const notes = [349.23, 329.63, 311.13, 293.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      const start = now + idx * 0.22;
      const duration = idx === 3 ? 0.6 : 0.2;
      osc.frequency.setValueAtTime(freq, start);
      if (idx === 3) {
        osc.frequency.linearRampToValueAtTime(freq - 30, start + duration);
      }
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    });
  }

  public playButtonClick() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // --- Background Hawaiian / Tropical Nautical Music ---

  public startBackgroundMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    let step = 0;

    // Cheerful Bikini Bottom ukulele & marimba chord progression
    // C major -> Am -> F -> G (C, E, G, A, C)
    const melodyScale = [
      261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25
    ];
    const bassNotes = [130.81, 110.00, 87.31, 98.00]; // C3, A2, F2, G2

    const playMeasure = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;
      const chordIndex = Math.floor(step / 4) % 4;
      const beatInChord = step % 4;

      // Bass note on beats 0 and 2
      if (beatInChord === 0 || beatInChord === 2) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassNotes[chordIndex], now);
        bassGain.gain.setValueAtTime(0.3, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.3);
      }

      // Marimba/Ukulele cheerful arpeggio notes
      const pattern = [
        [0, 2, 4],
        [3, 5],
        [2, 4, 7],
        [1, 3]
      ];
      const noteIndices = pattern[beatInChord];
      noteIndices.forEach((nIdx, offset) => {
        const noteFreq = melodyScale[(nIdx + chordIndex) % melodyScale.length];
        const melOsc = this.ctx!.createOscillator();
        const melGain = this.ctx!.createGain();

        melOsc.type = 'sine';
        const noteStart = now + offset * 0.08;
        melOsc.frequency.setValueAtTime(noteFreq, noteStart);

        melGain.gain.setValueAtTime(0.18, noteStart);
        melGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.2);

        melOsc.connect(melGain);
        melGain.connect(this.musicGain!);

        melOsc.start(noteStart);
        melOsc.stop(noteStart + 0.22);
      });

      // Subtle bubble water pulse
      if (step % 2 === 0) {
        const bubOsc = this.ctx.createOscillator();
        const bubGain = this.ctx.createGain();
        bubOsc.type = 'sine';
        bubOsc.frequency.setValueAtTime(800 + Math.random() * 400, now + 0.15);
        bubOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.22);
        bubGain.gain.setValueAtTime(0.04, now + 0.15);
        bubGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        bubOsc.connect(bubGain);
        bubGain.connect(this.musicGain);
        bubOsc.start(now + 0.15);
        bubOsc.stop(now + 0.23);
      }

      step++;
      this.musicTimer = window.setTimeout(playMeasure, 320); // ~94 BPM cheerful tempo
    };

    playMeasure();
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const soundManager = new SoundManager();
