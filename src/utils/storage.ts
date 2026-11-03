import { CustomControlLayout, GameSettings, PlayerStats } from '../types/game';

const STATS_KEY = 'spongebob_jellyfish_stats_v1';
const SETTINGS_KEY = 'spongebob_jellyfish_settings_v1';

export const defaultControlLayout: CustomControlLayout = {
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
};

export const defaultSettings: GameSettings = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  reducedMotion: false,
  sensitivity: 1.0,
  joystickSize: 'large',
  controlLayout: defaultControlLayout,
};

export const defaultStats: PlayerStats = {
  bestScore: 0,
  totalCaught: 0,
  caughtByType: {
    PINK: 0,
    BLUE: 0,
    GOLD: 0,
    ELECTRIC: 0,
    RAINBOW: 0,
  },
  highestLevel: 1,
  gamesPlayed: 0,
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        controlLayout: {
          ...defaultControlLayout,
          ...(parsed.controlLayout || {}),
        },
      };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return { ...defaultStats, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return defaultStats;
}

export function saveStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function recordGameCompletion(
  score: number,
  caughtCount: number,
  caughtByType: Record<string, number>,
  levelReached: number
): { isNewHigh: boolean; stats: PlayerStats } {
  const current = loadStats();
  const isNewHigh = score > current.bestScore;

  const updated: PlayerStats = {
    bestScore: Math.max(current.bestScore, score),
    totalCaught: current.totalCaught + caughtCount,
    caughtByType: {
      PINK: current.caughtByType.PINK + (caughtByType.PINK || 0),
      BLUE: current.caughtByType.BLUE + (caughtByType.BLUE || 0),
      GOLD: current.caughtByType.GOLD + (caughtByType.GOLD || 0),
      ELECTRIC: current.caughtByType.ELECTRIC + (caughtByType.ELECTRIC || 0),
      RAINBOW: current.caughtByType.RAINBOW + (caughtByType.RAINBOW || 0),
    },
    highestLevel: Math.max(current.highestLevel, levelReached),
    gamesPlayed: current.gamesPlayed + 1,
  };

  saveStats(updated);
  return { isNewHigh, stats: updated };
}
