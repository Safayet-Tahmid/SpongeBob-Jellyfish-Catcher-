import { LevelConfig } from '../types/game';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Beginner Jellyfisher',
    description: 'Learn the ropes in shallow Jellyfish Fields! Friendly swimming with peaceful waters.',
    targetCatches: 10,
    spawnInterval: 1250,
    maxJellyfish: 9,
    speedMultiplier: 0.95,
    enemySpawnConfig: {
      maxActiveEnemies: 1, // STRICTLY 1 active enemy max in Level 1!
      initialEnemyDelay: 8.0, // 8.0 seconds of peaceful swimming before 1st enemy
      enemySpawnInterval: 14.0, // 14 seconds between spawns (at most 1-2 in Level 1)
    },
    probabilities: {
      pink: 0.70,
      blue: 0.22,
      gold: 0.08,
      electric: 0,
      rainbow: 0.0,
    },
  },
  {
    level: 2,
    name: 'Jellyfish Explorer',
    description: 'Venturing deeper! Swift blue jellyfish and occasional electric hazards.',
    targetCatches: 16,
    spawnInterval: 1100,
    maxJellyfish: 11,
    speedMultiplier: 1.05,
    enemySpawnConfig: {
      maxActiveEnemies: 2, // Max 2 simultaneously active enemies
      initialEnemyDelay: 6.0, // 6.0s delay
      enemySpawnInterval: 10.0, // 10.0s cooldown
    },
    probabilities: {
      pink: 0.55,
      blue: 0.32,
      gold: 0.11,
      electric: 0,
      rainbow: 0.02,
    },
  },
  {
    level: 3,
    name: 'Electric Trouble',
    description: 'Moderate currents! Up to 3 dangerous electric jellyfish roam the field.',
    targetCatches: 22,
    spawnInterval: 950,
    maxJellyfish: 13,
    speedMultiplier: 1.15,
    enemySpawnConfig: {
      maxActiveEnemies: 3, // Max 3 simultaneously active enemies
      initialEnemyDelay: 4.5, // 4.5s delay
      enemySpawnInterval: 7.5, // 7.5s cooldown
    },
    probabilities: {
      pink: 0.45,
      blue: 0.33,
      gold: 0.16,
      electric: 0,
      rainbow: 0.06,
    },
  },
  {
    level: 4,
    name: 'Golden Hunt',
    description: 'A rich golden swarm approaches! High stakes with up to 4 roaming hazards.',
    targetCatches: 28,
    spawnInterval: 800,
    maxJellyfish: 15,
    speedMultiplier: 1.25,
    enemySpawnConfig: {
      maxActiveEnemies: 4, // Max 4 simultaneously active enemies
      initialEnemyDelay: 3.5, // 3.5s delay
      enemySpawnInterval: 6.0, // 6.0s cooldown
    },
    probabilities: {
      pink: 0.35,
      blue: 0.30,
      gold: 0.27,
      electric: 0,
      rainbow: 0.08,
    },
  },
  {
    level: 5,
    name: 'Jellyfish Master',
    description: 'Ultimate frenzy! Fast swimming, rainbow treasures, and disciplined hazard dodging!',
    targetCatches: 35,
    spawnInterval: 650,
    maxJellyfish: 16,
    speedMultiplier: 1.35,
    enemySpawnConfig: {
      maxActiveEnemies: 4, // Capped at 4 for a fair, balanced master challenge
      initialEnemyDelay: 3.0, // 3.0s delay
      enemySpawnInterval: 4.8, // 4.8s cooldown
    },
    probabilities: {
      pink: 0.30,
      blue: 0.25,
      gold: 0.27,
      electric: 0,
      rainbow: 0.18,
    },
  },
];

export function getLevelConfig(levelNumber: number): LevelConfig {
  if (levelNumber <= LEVELS.length) {
    return LEVELS[levelNumber - 1];
  }
  const base = LEVELS[LEVELS.length - 1];
  const extra = levelNumber - LEVELS.length;
  return {
    ...base,
    level: levelNumber,
    name: `Deep Sea Veteran (Tier ${extra})`,
    description: `Deep sea expedition! Fast paced and balanced.`,
    targetCatches: base.targetCatches + extra * 6,
    spawnInterval: Math.max(500, base.spawnInterval - extra * 30),
    maxJellyfish: Math.min(18, base.maxJellyfish + Math.floor(extra / 2)),
    speedMultiplier: Math.min(1.5, base.speedMultiplier + extra * 0.03),
    enemySpawnConfig: {
      maxActiveEnemies: Math.min(5, 4 + (extra >= 3 ? 1 : 0)), // never exceed 5
      initialEnemyDelay: 3.0,
      enemySpawnInterval: Math.max(4.0, 4.8 - extra * 0.2),
    },
  };
}
