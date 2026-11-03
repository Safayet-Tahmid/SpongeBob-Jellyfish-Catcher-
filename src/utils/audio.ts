import { GameSettings, PowerUpType } from '../types/game';

function getBgmUrl(): string {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}audio/jellypop-theme.mp3`;
}

export type ButtonSoundType = 'tap' | 'save' | 'reset' | 'mode' | 'cancel';

class SoundManager {
  // Background Music (HTMLAudioElement for the single jellypop-theme.mp3 track)
  private bgmAudio: HTMLAudioElement | null = null;
  private isMusicPlaying = false;
  private isPausedByUser = false;
  private isUnlocked = false;

  // Web Audio API for Real-Time Gameplay Sound Effects
  private audioCtx: AudioContext | null = null;
  private sfxMasterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Movement & Swing sound cooldown state
  private movementTimer = 0;
  private lastNetSwingTime = 0;

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

  constructor() {
    this.initAudioElement();
    this.setupAutoplayUnlock();
  }

  // --- Background Music System (Strictly preserved jellypop-theme.mp3) ---

  private initAudioElement() {
    if (typeof window === 'undefined') return;
    if (this.bgmAudio) return;

    try {
      const audio = new Audio();
      audio.src = getBgmUrl();
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = this.settings.musicEnabled
        ? Math.max(0, Math.min(1, this.settings.musicVolume))
        : 0;

      // Ensure iOS Safari treats audio as inline media
      audio.setAttribute('playsinline', 'true');
      (audio as unknown as { playsInline: boolean }).playsInline = true;

      audio.addEventListener('error', (e) => {
        console.warn('Background music loading error:', e);
      });

      this.bgmAudio = audio;
    } catch (err) {
      console.warn('Failed to initialize background music element:', err);
    }
  }

  private setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      // Resume Web Audio Context if suspended
      this.resumeAudioContext();

      if (this.isUnlocked) return;
      this.isUnlocked = true;

      // Start music upon first user interaction if enabled and not intentionally paused
      if (this.settings.musicEnabled && !this.isPausedByUser) {
        this.playBackgroundMusic();
      }

      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
  }

  public updateSettings(settings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...settings };

    // 1. Update BGM
    if (!this.bgmAudio) {
      this.initAudioElement();
    }
    if (this.bgmAudio) {
      const targetMusicVolume = this.settings.musicEnabled
        ? Math.max(0, Math.min(1, this.settings.musicVolume))
        : 0;
      this.bgmAudio.volume = targetMusicVolume;

      if (!this.settings.musicEnabled && this.isMusicPlaying) {
        this.bgmAudio.pause();
        this.isMusicPlaying = false;
      } else if (this.settings.musicEnabled && !this.isMusicPlaying && !this.isPausedByUser) {
        this.playBackgroundMusic();
      }
    }

    // 2. Update SFX Master Gain
    if (this.sfxMasterGain && this.audioCtx) {
      const targetSfxVolume = this.settings.sfxEnabled
        ? Math.max(0, Math.min(1, this.settings.sfxVolume))
        : 0;
      this.sfxMasterGain.gain.setValueAtTime(targetSfxVolume, this.audioCtx.currentTime);
    }
  }

  public playBackgroundMusic() {
    if (!this.settings.musicEnabled) return;
    if (!this.bgmAudio) {
      this.initAudioElement();
    }
    if (!this.bgmAudio) return;

    this.isPausedByUser = false;
    this.bgmAudio.volume = Math.max(0, Math.min(1, this.settings.musicVolume));

    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isMusicPlaying = true;
        })
        .catch((_err) => {
          // Will auto-resume on next user gesture
          this.isMusicPlaying = false;
        });
    }
  }

  public pauseBackgroundMusic() {
    this.isPausedByUser = true;
    if (this.bgmAudio && this.isMusicPlaying) {
      this.bgmAudio.pause();
      this.isMusicPlaying = false;
    }
  }

  public resumeBackgroundMusic() {
    this.isPausedByUser = false;
    if (this.settings.musicEnabled) {
      this.playBackgroundMusic();
    }
  }

  public stopBackgroundMusic() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.isMusicPlaying = false;
    }
  }

  // Persistent soundtrack aliases across all game screens
  public playMenuMusic() {
    this.playBackgroundMusic();
  }

  public playGameplayMusic() {
    this.playBackgroundMusic();
  }

  public startBackgroundMusic() {
    this.playBackgroundMusic();
  }

  // --- Web Audio API Procedural Sound Effects Synthesizer ---

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.sfxMasterGain = this.audioCtx.createGain();
        const initialVol = this.settings.sfxEnabled
          ? Math.max(0, Math.min(1, this.settings.sfxVolume))
          : 0;
        this.sfxMasterGain.gain.setValueAtTime(initialVol, this.audioCtx.currentTime);
        this.sfxMasterGain.connect(this.audioCtx.destination);
      }
    }
    return this.audioCtx;
  }

  private resumeAudioContext() {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate, sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < sampleRate; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // 1. UI Button Sounds
  public playButtonClick(type: ButtonSoundType = 'tap') {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;

    if (type === 'save') {
      // Affirmative two-tone bright cartoon chord (E5 -> G#5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, t); // E5
      osc2.frequency.setValueAtTime(830.61, t + 0.05); // G#5

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc1.start(t);
      osc2.start(t + 0.05);
      osc1.stop(t + 0.22);
      osc2.stop(t + 0.22);
    } else if (type === 'reset') {
      // Bouncy comic spring blip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(210, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(t);
      osc.stop(t + 0.14);
    } else if (type === 'mode') {
      // Cheery nautical bubble click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.06);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(t);
      osc.stop(t + 0.09);
    } else if (type === 'cancel') {
      // Gentle downward soft bubble
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.09);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(t);
      osc.stop(t + 0.1);
    } else {
      // Default: Crisp, tactile cartoon bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.07);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  // 2. Net Swing Sound (Underwater Woosh, debounced to prevent spam)
  public playNetSwing() {
    if (!this.settings.sfxEnabled) return;
    const now = performance.now();
    if (now - this.lastNetSwingTime < 180) return; // Debounced
    this.lastNetSwingTime = now;

    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.getNoiseBuffer(ctx);

    // Bandpass sweep simulating swift underwater mesh displacement
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.2;
    filter.frequency.setValueAtTime(380, t);
    filter.frequency.exponentialRampToValueAtTime(980, t + 0.08);
    filter.frequency.exponentialRampToValueAtTime(280, t + 0.22);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    // Low undertone whoosh for weight
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, t);
    subOsc.frequency.exponentialRampToValueAtTime(95, t + 0.2);
    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(0.2, t + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxMasterGain);

    subOsc.connect(subGain);
    subGain.connect(this.sfxMasterGain);

    noise.start(t);
    noise.stop(t + 0.23);
    subOsc.start(t);
    subOsc.stop(t + 0.23);
  }

  // 3. Jellyfish Catching Sounds (Pink, Blue, Gold, Rainbow)
  public playCatch(type: 'PINK' | 'BLUE' | 'GOLD' | 'RAINBOW') {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;

    if (type === 'PINK') {
      // Classic satisfying cartoon bubble pop (+10 pts)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, t);
      osc.frequency.exponentialRampToValueAtTime(840, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.38, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === 'BLUE') {
      // Snappier double droplet pop (+20 pts)
      [0, 0.045].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startPitch = idx === 0 ? 540 : 760;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startPitch, t + delay);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 1.5, t + delay + 0.03);
        osc.frequency.exponentialRampToValueAtTime(startPitch * 0.8, t + delay + 0.1);

        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(0.32, t + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxMasterGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 0.11);
      });
    } else if (type === 'GOLD') {
      // Rich shimmering golden nautical bell / major triad fanfare (+50 pts)
      const notes = [783.99, 987.77, 1174.66, 1567.98]; // G5, B5, D6, G6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.045;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(0.24, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.42);

        osc.connect(gain);
        gain.connect(this.sfxMasterGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 0.43);
      });
    } else if (type === 'RAINBOW') {
      // Sparkling magical 6-note arpeggio with shimmering glissando (+100 pts)
      const rainbowNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0]; // C5 to C7
      rainbowNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.038;

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);
        osc.frequency.linearRampToValueAtTime(freq * 1.05, t + delay + 0.3);

        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(0.26, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.48);

        osc.connect(gain);
        gain.connect(this.sfxMasterGain!);

        osc.start(t + delay);
        osc.stop(t + delay + 0.5);
      });
    }
  }

  // 4. Jellyfish Escape / Swing Miss
  public playMiss() {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // 5. Electric Jellyfish Shock (Sawtooth zapping buzz & crackle)
  public playElectricShock() {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;

    // Dual detuned sawtooth waves
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(175, t);
    osc2.frequency.setValueAtTime(184, t);

    // AM Tremolo modulator for electrical stutter
    const tremolo = ctx.createOscillator();
    const tremoloGain = ctx.createGain();
    tremolo.type = 'square';
    tremolo.frequency.setValueAtTime(36, t); // 36Hz rapid zap
    tremoloGain.gain.setValueAtTime(0.6, t);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.5;
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(700, t + 0.38);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  // 6. Shield Deflect Ping (When bubble shield blocks electric shock)
  public playShieldDeflect() {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1450, t + 0.06);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // 7. Player Damage / Life Lost (Comic cartoon downward stumble)
  public playLifeLost() {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.3);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.36, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(t);
    osc.stop(t + 0.33);
  }

  // 8. Power-Up Collection (Distinct audio for each PowerUp type)
  public playPowerUpCollect(type?: PowerUpType) {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;

    if (type === 'SUPER_NET') {
      // Wide power surge whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.22);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(t);
      osc.stop(t + 0.33);
    } else if (type === 'SPEED_BOOST') {
      // Rapid turbo rev flutter
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(1050, t + 0.2);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(t);
      osc.stop(t + 0.29);
    } else if (type === 'MAGNET') {
      // Magnetic dual-harmonic pulse
      [440, 659.25].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.linearRampToValueAtTime(freq * 1.25, t + 0.25);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        osc.connect(gain);
        gain.connect(this.sfxMasterGain!);
        osc.start(t);
        osc.stop(t + 0.33);
      });
    } else if (type === 'BUBBLE_SHIELD') {
      // Hollow resonant bubble orb expansion
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.18);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(t);
      osc.stop(t + 0.36);
    } else if (type === 'DOUBLE_POINTS') {
      // High energetic double chime
      [1174.66, 1567.98].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = i * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(0.28, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxMasterGain!);
        osc.start(t + delay);
        osc.stop(t + delay + 0.3);
      });
    } else {
      // Default PowerUp chime (C5 -> E5 -> G5 -> C6)
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = i * 0.05;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(0.25, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxMasterGain!);
        osc.start(t + delay);
        osc.stop(t + delay + 0.32);
      });
    }
  }

  // 9. Underwater Movement Swish (Gentle, rate-limited aquatic swimming stir)
  public playMovement(speedFactor: number, dt: number) {
    if (!this.settings.sfxEnabled) return;
    this.movementTimer += dt;
    if (this.movementTimer < 0.28) return; // Rate-limited swimming cadence (approx 3.5 per sec)
    this.movementTimer = 0;

    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    const baseFreq = 95 + Math.random() * 25;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.4, t + 0.08);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);

    const volume = 0.12 * Math.min(1.0, speedFactor);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  // 10. Level Up Fanfare (Triumphant cartoon bugle flourish)
  public playLevelUp() {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;
    // Nautical bugle flourish: G4, C5, E5, G5, high C6
    const fanfare = [
      { freq: 392.0, time: 0, dur: 0.12 },
      { freq: 523.25, time: 0.12, dur: 0.12 },
      { freq: 659.25, time: 0.24, dur: 0.12 },
      { freq: 783.99, time: 0.36, dur: 0.16 },
      { freq: 1046.5, time: 0.52, dur: 0.45 },
    ];

    fanfare.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, t + n.time);

      gain.gain.setValueAtTime(0.001, t + n.time);
      gain.gain.linearRampToValueAtTime(0.3, t + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain!);

      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur + 0.02);
    });
  }

  // 11. Game Over (Melancholy cartoon descending slide whistle & nautical brass)
  public playGameOver() {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;
    // Three mournful notes followed by a comic slide
    const sadNotes = [
      { freq: 587.33, time: 0, dur: 0.2 }, // D5
      { freq: 523.25, time: 0.22, dur: 0.2 }, // C5
      { freq: 466.16, time: 0.44, dur: 0.26 }, // Bb4
    ];

    sadNotes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, t + n.time);

      gain.gain.setValueAtTime(0.001, t + n.time);
      gain.gain.linearRampToValueAtTime(0.26, t + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain!);
      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur + 0.02);
    });

    // Comic downward slide whistle
    const slideOsc = ctx.createOscillator();
    const slideGain = ctx.createGain();
    const slideStart = t + 0.72;
    slideOsc.type = 'sine';
    slideOsc.frequency.setValueAtTime(320, slideStart);
    slideOsc.frequency.exponentialRampToValueAtTime(80, slideStart + 0.55);

    slideGain.gain.setValueAtTime(0.001, slideStart);
    slideGain.gain.linearRampToValueAtTime(0.24, slideStart + 0.05);
    slideGain.gain.exponentialRampToValueAtTime(0.001, slideStart + 0.55);

    slideOsc.connect(slideGain);
    slideGain.connect(this.sfxMasterGain);
    slideOsc.start(slideStart);
    slideOsc.stop(slideStart + 0.58);
  }

  // 12. New High Score Victory Celebration
  public playNewHighScore() {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.resumeAudioContext();

    const t = ctx.currentTime;
    // Grand victory arpeggio
    const highScores = [
      { freq: 523.25, time: 0, dur: 0.1 },
      { freq: 659.25, time: 0.1, dur: 0.1 },
      { freq: 783.99, time: 0.2, dur: 0.1 },
      { freq: 1046.5, time: 0.3, dur: 0.18 },
      { freq: 1318.51, time: 0.48, dur: 0.5 },
    ];

    highScores.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, t + n.time);

      gain.gain.setValueAtTime(0.001, t + n.time);
      gain.gain.linearRampToValueAtTime(0.3, t + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain!);
      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur + 0.02);
    });

    // Glittering high sparkles
    [1567.98, 1760.0, 2093.0, 2349.32].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = 0.55 + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.001, t + delay);
      gain.gain.linearRampToValueAtTime(0.2, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain!);
      osc.start(t + delay);
      osc.stop(t + delay + 0.3);
    });
  }
}

export const soundManager = new SoundManager();
