import { GameSettings } from '../types/game';

function getBgmUrl(): string {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}audio/jellypop-theme.mp3`;
}

class SoundManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private isMusicPlaying = false;
  private isPausedByUser = false;
  private isUnlocked = false;

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

    if (!this.bgmAudio) {
      this.initAudioElement();
    }

    if (this.bgmAudio) {
      const targetVolume = this.settings.musicEnabled
        ? Math.max(0, Math.min(1, this.settings.musicVolume))
        : 0;
      this.bgmAudio.volume = targetVolume;

      if (!this.settings.musicEnabled && this.isMusicPlaying) {
        this.bgmAudio.pause();
        this.isMusicPlaying = false;
      } else if (this.settings.musicEnabled && !this.isMusicPlaying && !this.isPausedByUser) {
        this.playBackgroundMusic();
      }
    }
  }

  // --- Background Music Controls (Single MP3 throughout entire game) ---

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
          // Handled gracefully: will trigger on next user interaction
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

  // Persistent soundtrack aliases across all game screens:
  // All screens use the same persistent MP3 without resetting playback position.
  public playMenuMusic() {
    this.playBackgroundMusic();
  }

  public playGameplayMusic() {
    this.playBackgroundMusic();
  }

  public startBackgroundMusic() {
    this.playBackgroundMusic();
  }

  // --- Retained sound effect interfaces for compatibility ---

  public playNetSwing() {}
  public playCatch(_type: 'PINK' | 'BLUE' | 'GOLD' | 'RAINBOW') {}
  public playElectricShock() {}
  public playPowerUpCollect() {}
  public playLevelUp() {}
  public playGameOver() {}
  public playButtonClick() {}
}

export const soundManager = new SoundManager();
