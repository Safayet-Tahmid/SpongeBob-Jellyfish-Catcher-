import { GameSettings } from '../types/game';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrack: 'MENU' | 'GAMEPLAY' | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private step = 0;

  private settings: GameSettings = {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    reducedMotion: false,
    sensitivity: 1.0,
    joystickSize: 'large',
    controlLayout: {
      joystickSize: 'large',
      catchBtnSize: 'large',
      joystickScale: 1.15,
      catchBtnScale: 1.25,
      joystickX: 20,
      joystickY: 20,
      catchBtnX: 20,
      catchBtnY: 20,
      hudScale: 1.0,
      opacity: 0.9,
      pauseBtnPos: 'top-right',
    },
  };

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(
        this.settings.musicEnabled ? this.settings.musicVolume * 0.38 : 0,
        this.ctx.currentTime
      );
      this.sfxGain.gain.setValueAtTime(
        this.settings.sfxEnabled ? this.settings.sfxVolume : 0,
        this.ctx.currentTime
      );

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public updateSettings(settings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...settings };
    if (this.ctx && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      const targetMusicGain = this.settings.musicEnabled
        ? this.settings.musicVolume * 0.38
        : 0;
      const targetSfxGain = this.settings.sfxEnabled ? this.settings.sfxVolume : 0;

      this.musicGain.gain.setTargetAtTime(targetMusicGain, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(targetSfxGain, now, 0.05);
    }

    if (this.settings.musicEnabled && !this.isMusicPlaying && this.currentTrack) {
      this.startTrack(this.currentTrack);
    } else if (!this.settings.musicEnabled && this.isMusicPlaying) {
      this.stopBackgroundMusic();
    }
  }

  // --- Sound Effects (Classic 2000s Cartoon Arcade style) ---

  public playNetSwing() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playCatch(type: 'PINK' | 'BLUE' | 'GOLD' | 'RAINBOW') {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    if (type === 'GOLD') {
      // Shimmering radiant golden harp arpeggio
      const notes = [587.33, 739.99, 880, 1174.66, 1479.98];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        gain.gain.setValueAtTime(0.3, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.32);
      });
      return;
    }

    if (type === 'RAINBOW') {
      // Magical sparkling cartoon xylophone chord
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.32, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.38);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.4);
      });
      return;
    }

    // Classic cartoon pop + xylophone tap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type === 'BLUE' ? 'triangle' : 'sine';
    const baseFreq = type === 'BLUE' ? 640 : 520;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
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
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.3);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playPowerUpCollect() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const fanfare = [440, 554.37, 659.25, 880, 1108.73];
    fanfare.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.28, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.32);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  }

  public playLevelUp() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    fanfare.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      gain.gain.setValueAtTime(0.35, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.42);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.45);
    });
  }

  public playGameOver() {
    if (!this.settings.sfxEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [349.23, 329.63, 311.13, 293.66];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      const start = now + idx * 0.22;
      const duration = idx === 3 ? 0.6 : 0.2;
      osc.frequency.setValueAtTime(freq, start);
      if (idx === 3) {
        osc.frequency.linearRampToValueAtTime(freq - 35, start + duration);
      }
      gain.gain.setValueAtTime(0.22, start);
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
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // --- Soundtracks: Original 2000s Cartoon Orchestral & Piano Compositions ---

  public playMenuMusic() {
    this.startTrack('MENU');
  }

  public playGameplayMusic() {
    this.startTrack('GAMEPLAY');
  }

  public startBackgroundMusic() {
    this.playGameplayMusic();
  }

  private startTrack(track: 'MENU' | 'GAMEPLAY') {
    this.stopBackgroundMusic();
    this.currentTrack = track;
    if (!this.settings.musicEnabled) return;

    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    this.step = 0;

    const playLoop = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      if (track === 'MENU') {
        this.renderMenuMeasure();
        this.step++;
        this.musicTimer = window.setTimeout(playLoop, 340); // relaxed nostalgic waltz tempo
      } else {
        this.renderGameplayMeasure();
        this.step++;
        this.musicTimer = window.setTimeout(playLoop, 280); // brisk cartoon arcade tempo
      }
    };

    playLoop();
  }

  // Menu Track: Nostalgic underwater waltz with warm piano chords and flute
  private renderMenuMeasure() {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const stepInPattern = this.step % 16;
    const chordIndex = Math.floor(stepInPattern / 4);

    // Warm chord progression (F major -> C major -> Dm -> Bb)
    const chords = [
      [174.61, 261.63, 329.63, 392.0], // F, C, E, G
      [130.81, 261.63, 329.63, 392.0], // C, C, E, G
      [146.83, 293.66, 349.23, 440.0], // D, D, F, A
      [116.54, 233.08, 293.66, 349.23], // Bb, Bb, D, F
    ];

    // Piano chord strike on beat 0 of each bar
    if (stepInPattern % 4 === 0) {
      const chord = chords[chordIndex];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle'; // warm piano tone
        const startTime = now + idx * 0.015;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    }

    // Melodic Flute/Woodwind line
    const fluteMelody = [
      523.25, 587.33, 659.25, 523.25, 698.46, 659.25, 587.33, 523.25,
      587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0, 523.25,
    ];
    const fluteFreq = fluteMelody[stepInPattern];
    const fluteOsc = this.ctx.createOscillator();
    const fluteGain = this.ctx.createGain();
    fluteOsc.type = 'sine'; // soft pure woodwind
    fluteOsc.frequency.setValueAtTime(fluteFreq, now);

    fluteGain.gain.setValueAtTime(0.14, now);
    fluteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    fluteOsc.connect(fluteGain);
    fluteGain.connect(this.musicGain);
    fluteOsc.start(now);
    fluteOsc.stop(now + 0.32);

    // Gentle ocean bubble / marimba pluck
    if (this.step % 2 === 0) {
      const plkOsc = this.ctx.createOscillator();
      const plkGain = this.ctx.createGain();
      plkOsc.type = 'sine';
      plkOsc.frequency.setValueAtTime(880 + Math.random() * 200, now + 0.1);
      plkOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.16);
      plkGain.gain.setValueAtTime(0.04, now + 0.1);
      plkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      plkOsc.connect(plkGain);
      plkGain.connect(this.musicGain);
      plkOsc.start(now + 0.1);
      plkOsc.stop(now + 0.19);
    }
  }

  // Gameplay Track: Energetic 2000s nautical cartoon promenade
  private renderGameplayMeasure() {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const stepInPattern = this.step % 16;
    const bar = Math.floor(stepInPattern / 4);

    // Jaunty cartoon bassline (C -> G -> Am -> F)
    const rootBass = [130.81, 98.0, 110.0, 87.31];
    const fifthBass = [196.0, 146.83, 164.81, 130.81];
    const beat = stepInPattern % 4;

    // Bouncy cartoon tuba/bass on 0 and 2
    if (beat === 0 || beat === 2) {
      const bassFreq = beat === 0 ? rootBass[bar] : fifthBass[bar];
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bassFreq, now);

      bGain.gain.setValueAtTime(0.28, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      bOsc.connect(bGain);
      bGain.connect(this.musicGain);
      bOsc.start(now);
      bOsc.stop(now + 0.25);
    }

    // Ragtime cartoon piano chord on off-beats (1 and 3)
    if (beat === 1 || beat === 3) {
      const pianoChords = [
        [261.63, 329.63, 392.0], // C
        [246.94, 293.66, 392.0], // G
        [220.0, 261.63, 329.63], // Am
        [220.0, 261.63, 349.23], // F
      ];
      pianoChords[bar].forEach((freq) => {
        const pOsc = this.ctx!.createOscillator();
        const pGain = this.ctx!.createGain();
        pOsc.type = 'triangle';
        pOsc.frequency.setValueAtTime(freq * 1.5, now);
        pGain.gain.setValueAtTime(0.12, now);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        pOsc.connect(pGain);
        pGain.connect(this.musicGain!);
        pOsc.start(now);
        pOsc.stop(now + 0.16);
      });
    }

    // Playful Marimba / Ukulele melody on top
    const melody = [
      523.25, 587.33, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25,
      783.99, 880.0, 783.99, 659.25, 587.33, 523.25, 392.0, 523.25,
    ];
    const mOsc = this.ctx.createOscillator();
    const mGain = this.ctx.createGain();
    mOsc.type = 'sine';
    mOsc.frequency.setValueAtTime(melody[stepInPattern], now);
    mGain.gain.setValueAtTime(0.16, now);
    mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    mOsc.connect(mGain);
    mGain.connect(this.musicGain);
    mOsc.start(now);
    mOsc.stop(now + 0.2);
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
