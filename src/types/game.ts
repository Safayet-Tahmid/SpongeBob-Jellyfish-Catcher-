export type GameState =
  | 'LOADING'
  | 'MAIN_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_CLEARED'
  | 'GAME_OVER';

export type GameMode = 'CLASSIC' | 'TIME_ATTACK' | 'RELAX';

export type JellyfishType = 'PINK' | 'BLUE' | 'GOLD' | 'ELECTRIC' | 'RAINBOW';

export type PowerUpType =
  | 'SUPER_NET'
  | 'SPEED_BOOST'
  | 'MAGNET'
  | 'BUBBLE_SHIELD'
  | 'DOUBLE_POINTS';

export interface PowerUpActive {
  type: PowerUpType;
  duration: number; // in seconds total
  remaining: number; // in seconds left
}

export interface EnemySpawnConfig {
  maxActiveEnemies: number; // Maximum simultaneously active electric enemies
  initialEnemyDelay: number; // Seconds before the first enemy can spawn in this level
  enemySpawnInterval: number; // Seconds to wait between enemy spawns
}

export interface LevelConfig {
  level: number;
  name: string;
  description: string;
  targetCatches: number; // to advance or complete level in classic mode
  spawnInterval: number; // ms for regular collectible jellyfish
  maxJellyfish: number;
  speedMultiplier: number;
  enemySpawnConfig: EnemySpawnConfig;
  probabilities: {
    pink: number;
    blue: number;
    gold: number;
    electric: number;
    rainbow: number;
  };
}

export interface PlayerStats {
  bestScore: number;
  totalCaught: number;
  caughtByType: Record<JellyfishType, number>;
  highestLevel: number;
  gamesPlayed: number;
}

export interface CustomControlLayout {
  joystickSize: 'small' | 'medium' | 'large' | 'xlarge';
  catchBtnSize: 'small' | 'medium' | 'large' | 'xlarge';
  joystickScale: number; // 0.75 to 1.6
  catchBtnScale: number; // 0.75 to 1.6
  joystickX: number; // px or % offset
  joystickY: number; // px or % offset
  catchBtnX: number;
  catchBtnY: number;
  hudScale: number; // 0.8 to 1.2
  opacity: number; // 0.4 to 1.0
  pauseBtnPos: 'top-right' | 'top-center' | 'top-left';
}

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
  reducedMotion: boolean;
  sensitivity: number; // 0.5 to 1.5
  joystickSize: 'small' | 'medium' | 'large';
  controlLayout: CustomControlLayout;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'bubble' | 'sparkle' | 'shock' | 'net_arc';
}

export interface CameoEvent {
  character: 'PATRICK' | 'SQUIDWARD' | 'SANDY' | 'PLANKTON';
  x: number;
  y: number;
  vx: number;
  vy: number;
  progress: number;
  message: string;
  active: boolean;
  droppedItem?: boolean;
}
