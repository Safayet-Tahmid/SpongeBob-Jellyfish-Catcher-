import { LevelConfig } from '../types/game';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Beginner Jellyfisher',
    description: 'Learn the ropes in shallow Jellyfish Fields! Catch gentle pink jellyfish.',
    targetCatches: 10,
    spawnInterval: 1400,
    maxJellyfish: 9,
    speedMultiplier: 0.9,
    probabilities: {
      pink: 0.75,
      blue: 0.18,
      gold: 0.05,
      electric: 0.02,
      rainbow: 0.0,
    },
  },
  {
    level: 2,
    name: 'Jellyfish Explorer',
    description: 'Venturing deeper! Swift blue jellyfish dart around.',
    targetCatches: 16,
    spawnInterval: 1100,
    maxJellyfish: 12,
    speedMultiplier: 1.05,
    probabilities: {
      pink: 0.55,
      blue: 0.32,
      gold: 0.07,
      electric: 0.05,
      rainbow: 0.01,
    },
  },
  {
    level: 3,
    name: 'Electric Trouble',
    description: 'Look out! Dangerous electric jellyfish are swarming.',
    targetCatches: 22,
    spawnInterval: 950,
    maxJellyfish: 14,
    speedMultiplier: 1.15,
    probabilities: {
      pink: 0.40,
      blue: 0.30,
      gold: 0.08,
      electric: 0.18,
      rainbow: 0.04,
    },
  },
  {
    level: 4,
    name: 'Golden Hunt',
    description: 'A rare golden swarm approaches! Score big points.',
    targetCatches: 28,
    spawnInterval: 800,
    maxJellyfish: 16,
    speedMultiplier: 1.25,
    probabilities: {
      pink: 0.35,
      blue: 0.25,
      gold: 0.22,
      electric: 0.14,
      rainbow: 0.04,
    },
  },
  {
    level: 5,
    name: 'Jellyfish Master',
    description: 'Ultimate Jellyfish Fields frenzy! Rainbow jellyfish sighted!',
    targetCatches: 35,
    spawnInterval: 650,
    maxJellyfish: 18,
    speedMultiplier: 1.35,
    probabilities: {
      pink: 0.30,
      blue: 0.25,
      gold: 0.18,
      electric: 0.20,
      rainbow: 0.07,
    },
  },
];

export function getLevelConfig(levelNumber: number): LevelConfig {
  const clamped = Math.max(1, Math.min(levelNumber, LEVELS.length));
  return LEVELS[clamped - 1];
}
