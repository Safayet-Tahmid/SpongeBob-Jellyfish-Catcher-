import {
  GameMode,
  GameState,
  JellyfishType,
  PowerUpActive,
  PowerUpType,
} from '../types/game';
import { soundManager } from '../utils/audio';
import { recordGameCompletion } from '../utils/storage';
import { Background } from './Background';
import { CameoManager } from './Cameos';
import { Jellyfish } from './Jellyfish';
import { getLevelConfig, LEVELS } from './LevelManager';
import { ParticleSystem } from './ParticleSystem';
import { Player } from './Player';
import { PowerUpItem } from './PowerUp';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onTimeUpdate: (time: number) => void;
  onLevelUpdate: (level: number, progress: number, target: number) => void;
  onPowerUpsUpdate: (powerUps: PowerUpActive[]) => void;
  onStateChange: (state: GameState) => void;
  onGameOver: (summary: {
    finalScore: number;
    isNewHigh: boolean;
    totalCaught: number;
    goldenCaught: number;
    accuracy: number;
    levelReached: number;
  }) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  public state: GameState = 'MAIN_MENU';
  public mode: GameMode = 'CLASSIC';

  // Systems
  private player: Player;
  private background: Background;
  private particles: ParticleSystem;
  private cameoManager: CameoManager;

  private jellyfishList: Jellyfish[] = [];
  private powerUpsList: PowerUpItem[] = [];
  private activePowerUps: PowerUpActive[] = [];

  // Game Stats & Counters
  public score = 0;
  public lives = 3;
  public remainingTime = 90;
  public currentLevel = 1;
  public levelCatches = 0;
  public totalCatches = 0;
  public totalSwings = 0;
  public goldenCatches = 0;
  public caughtByType: Record<JellyfishType, number> = {
    PINK: 0,
    BLUE: 0,
    GOLD: 0,
    ELECTRIC: 0,
    RAINBOW: 0,
  };

  // Input states
  public inputX = 0;
  public inputY = 0;
  private isTouching = false;

  // Timers & Loops
  private lastTime = 0;
  private animFrameId: number | null = null;
  private spawnTimer = 0;
  private powerUpSpawnTimer = 10;
  private isRunning = false;

  // Controlled Gradual Enemy Spawning
  private enemySpawnDelayTimer = 0; // Delay countdown before first enemy appears in level
  private enemySpawnIntervalTimer = 0; // Cooldown countdown between successive enemy spawns

  // Camera Shake
  private shakeTimer = 0;
  private shakeIntensity = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.callbacks = callbacks;

    const width = canvas.width || window.innerWidth;
    const height = canvas.height || window.innerHeight;

    this.player = new Player(width / 2, height / 2);
    this.background = new Background(width, height);
    this.particles = new ParticleSystem();
    this.cameoManager = new CameoManager();

    this.handleResize();
  }

  public handleResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    this.background.init(w, h);
  }

  public getWidth(): number {
    return this.canvas.width / Math.min(window.devicePixelRatio || 1, 2);
  }

  public getHeight(): number {
    return this.canvas.height / Math.min(window.devicePixelRatio || 1, 2);
  }

  public start(mode: GameMode = 'CLASSIC') {
    this.mode = mode;
    this.score = 0;
    this.totalCatches = 0;
    this.totalSwings = 0;
    this.goldenCatches = 0;
    this.currentLevel = 1;
    this.levelCatches = 0;
    this.caughtByType = {
      PINK: 0,
      BLUE: 0,
      GOLD: 0,
      ELECTRIC: 0,
      RAINBOW: 0,
    };

    if (mode === 'CLASSIC') {
      this.lives = 3;
      this.remainingTime = 90;
    } else if (mode === 'TIME_ATTACK') {
      this.lives = 999;
      this.remainingTime = 60;
    } else if (mode === 'RELAX') {
      this.lives = 999;
      this.remainingTime = 99999;
    }

    this.jellyfishList = [];
    this.powerUpsList = [];
    this.activePowerUps = [];
    this.particles.clear();
    this.powerUpSpawnTimer = 14;

    const config = getLevelConfig(this.currentLevel);

    // Initial enemy timers from level config (peaceful start breathing room)
    this.enemySpawnDelayTimer = config.enemySpawnConfig.initialEnemyDelay;
    this.enemySpawnIntervalTimer = config.enemySpawnConfig.enemySpawnInterval;
    this.spawnTimer = 0;

    const w = this.getWidth();
    const h = this.getHeight();
    this.player = new Player(w / 2, h / 2);

    // Initial jellyfish population: ZERO ENEMIES on screen! ONLY friendly collectible jellyfish!
    const initialPopulation = 7;
    for (let i = 0; i < initialPopulation; i++) {
      this.spawnCollectibleJellyfish();
    }

    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
    this.updateHUD();

    soundManager.startBackgroundMusic();

    this.isRunning = true;
    this.lastTime = performance.now();
    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  public pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.callbacks.onStateChange('PAUSED');
  }

  public resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
    this.lastTime = performance.now();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // --- Input handlers ---

  public setInput(x: number, y: number) {
    this.inputX = x;
    this.inputY = y;
  }

  public triggerNetCatch() {
    if (this.state !== 'PLAYING') return;

    const swung = this.player.swingNet();
    if (!swung) return;

    this.totalSwings++;
    soundManager.playNetSwing();

    // Check jellyfish catches
    const hitbox = this.player.getNetHitbox();
    let caughtAny = false;

    for (const jelly of this.jellyfishList) {
      if (jelly.isCaught) continue;

      const dist = Math.hypot(jelly.x - hitbox.x, jelly.y - hitbox.y);
      if (dist <= hitbox.radius + jelly.radius) {
        if (jelly.type === 'ELECTRIC') {
          // Touching an electric enemy conducts electric shock!
          if (this.player.invulnerabilityTimer <= 0) {
            this.handleElectricShock(jelly);
          }
          continue;
        }

        // Caught collectible jellyfish!
        jelly.isCaught = true;
        caughtAny = true;
        this.processCatch(jelly);
      }
    }

    if (caughtAny) {
      this.jellyfishList = this.jellyfishList.filter((j) => !j.isCaught);
    } else {
      soundManager.playMiss();
    }
  }

  private processCatch(jelly: Jellyfish) {
    this.totalCatches++;
    this.levelCatches++;
    this.caughtByType[jelly.type] = (this.caughtByType[jelly.type] || 0) + 1;

    let pts = jelly.scoreValue;
    const isDouble = this.activePowerUps.some((p) => p.type === 'DOUBLE_POINTS');
    if (isDouble) pts *= 2;

    this.score += pts;

    if (jelly.type === 'GOLD') {
      this.goldenCatches++;
      soundManager.playCatch('GOLD');
      this.player.triggerCheer(0.9);
      this.triggerScreenShake(0.18, 4);
      this.particles.addFloatingText(jelly.x, jelly.y, `+${pts} GOLD!`, '#facc15', 24);
      this.particles.spawnCatchBurst(jelly.x, jelly.y, '#facc15', true);
    } else if (jelly.type === 'RAINBOW') {
      soundManager.playCatch('RAINBOW');
      this.player.triggerCheer(1.3);
      this.triggerScreenShake(0.22, 5);
      this.particles.addFloatingText(jelly.x, jelly.y, `+${pts} RAINBOW!`, '#ec4899', 26);
      this.particles.spawnCatchBurst(jelly.x, jelly.y, '#38bdf8', true);
    } else {
      soundManager.playCatch(jelly.type as 'PINK' | 'BLUE');
      this.particles.addFloatingText(jelly.x, jelly.y, `+${pts}`, '#ffffff', 18);
      this.particles.spawnCatchBurst(
        jelly.x,
        jelly.y,
        jelly.type === 'PINK' ? '#f472b6' : '#38bdf8'
      );
    }

    // Classic Level Progression Check
    if (this.mode === 'CLASSIC') {
      const config = getLevelConfig(this.currentLevel);
      if (this.levelCatches >= config.targetCatches && this.currentLevel < LEVELS.length) {
        this.advanceLevel();
      }
    }

    this.updateHUD();
  }

  private advanceLevel() {
    this.currentLevel++;
    this.levelCatches = 0;
    const config = getLevelConfig(this.currentLevel);

    // Reset enemy spawn timers so player has breathing room at start of each new level
    this.enemySpawnDelayTimer = config.enemySpawnConfig.initialEnemyDelay;
    this.enemySpawnIntervalTimer = config.enemySpawnConfig.enemySpawnInterval;
    this.spawnTimer = 0;

    this.player.triggerCheer(1.6);
    soundManager.playLevelUp();
    this.particles.addFloatingText(
      this.getWidth() / 2,
      this.getHeight() / 2 - 40,
      `LEVEL ${this.currentLevel}!`,
      '#facc15',
      32
    );
    this.particles.spawnCatchBurst(this.getWidth() / 2, this.getHeight() / 2, '#38bdf8', true);
  }

  private triggerScreenShake(duration: number, intensity: number) {
    this.shakeTimer = duration;
    this.shakeIntensity = intensity;
  }

  // --- Main Game Loop ---

  private gameLoop = (timestamp: number) => {
    if (!this.isRunning) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number) {
    const w = this.getWidth();
    const h = this.getHeight();

    // Timer countdown
    if (this.mode !== 'RELAX') {
      this.remainingTime -= dt;
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.endGame();
        return;
      }
    }

    // Camera shake update
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }

    // Update PowerUps active timers
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const p = this.activePowerUps[i];
      p.remaining -= dt;
      if (p.remaining <= 0) {
        this.deactivatePowerUp(p.type);
        this.activePowerUps.splice(i, 1);
      }
    }
    this.callbacks.onPowerUpsUpdate([...this.activePowerUps]);

    // Update Player
    const levelConfig = getLevelConfig(this.currentLevel);
    this.player.update(dt, this.inputX, this.inputY, { width: w, height: h });

    // Underwater swimming motion audio (rate-limited subtle bubbles & aquatic swishing)
    const playerSpeed = Math.hypot(this.player.vx, this.player.vy);
    if (playerSpeed > 30 && this.player.shockTimer <= 0) {
      soundManager.playMovement(Math.min(1.0, playerSpeed / this.player.baseSpeed), dt);
    }

    // Update Background
    this.background.update(dt, { width: w, height: h });

    // Update Cameos
    this.cameoManager.update(dt, { width: w, height: h }, (dropX, dropY) => {
      this.spawnDroppedBonus(dropX, dropY);
    });

    // Update Jellyfish
    const playerPos = { x: this.player.x, y: this.player.y };
    for (const jelly of this.jellyfishList) {
      jelly.update(dt, { width: w, height: h }, playerPos, this.player.magnetActive);

      // Electric enemy collision check with SpongeBob (precise box-to-circle detection)
      if (
        jelly.type === 'ELECTRIC' &&
        this.player.invulnerabilityTimer <= 0 &&
        this.player.shockTimer <= 0
      ) {
        const halfW = 24;
        const halfH = 30;
        const closestX = Math.max(this.player.x - halfW, Math.min(jelly.x, this.player.x + halfW));
        const closestY = Math.max(this.player.y - halfH, Math.min(jelly.y, this.player.y + halfH));
        const pDist = Math.hypot(jelly.x - closestX, jelly.y - closestY);

        if (pDist <= jelly.radius + 6) {
          this.handleElectricShock(jelly);
        }
      }
    }

    // Clean up despawned or caught jellyfish
    this.jellyfishList = this.jellyfishList.filter((j) => !j.isDespawned && !j.isCaught);

    // Update Collectible Power-Ups on screen
    for (let i = this.powerUpsList.length - 1; i >= 0; i--) {
      const item = this.powerUpsList[i];
      item.update(dt);

      if (item.life <= 0) {
        this.powerUpsList.splice(i, 1);
        continue;
      }

      // Check pickup by player
      const dist = Math.hypot(item.x - this.player.x, item.y - this.player.y);
      if (dist < item.radius + 30) {
        this.collectPowerUp(item);
        this.powerUpsList.splice(i, 1);
      }
    }

    // 1. Regular Collectible Jellyfish Spawning (Pink, Blue, Gold, Rainbow)
    this.spawnTimer += dt * 1000;
    if (
      this.spawnTimer >= levelConfig.spawnInterval &&
      this.jellyfishList.length < levelConfig.maxJellyfish
    ) {
      this.spawnTimer = 0;
      this.spawnCollectibleJellyfish();
    }

    // 2. Controlled Gradual Enemy Spawning (Classic and Time Attack modes only)
    if (this.mode !== 'RELAX') {
      if (this.enemySpawnDelayTimer > 0) {
        this.enemySpawnDelayTimer -= dt;
      } else {
        if (this.enemySpawnIntervalTimer > 0) {
          this.enemySpawnIntervalTimer -= dt;
        }

        const activeEnemies = this.countActiveEnemies();
        const maxAllowed = levelConfig.enemySpawnConfig.maxActiveEnemies;

        // Strictly spawn ONLY 1 enemy when timer expires and below level cap
        if (this.enemySpawnIntervalTimer <= 0 && activeEnemies < maxAllowed) {
          this.spawnSingleEnemyJellyfish();
          this.enemySpawnIntervalTimer = levelConfig.enemySpawnConfig.enemySpawnInterval;
        }
      }
    }

    // Spawn Collectible Power-Up check
    this.powerUpSpawnTimer -= dt;
    if (this.powerUpSpawnTimer <= 0 && this.powerUpsList.length < 2) {
      this.spawnCollectiblePowerUp();
      this.powerUpSpawnTimer = 14 + Math.random() * 12;
    }

    // Update Particles
    this.particles.update(dt);

    this.updateHUD();
  }

  private handleElectricShock(jelly: Jellyfish) {
    if (this.player.shieldActive) {
      // Bubble shield deflects shock!
      soundManager.playShieldDeflect();
      this.triggerScreenShake(0.18, 4);
      this.particles.spawnElectricShock(jelly.x, jelly.y);
      this.particles.addFloatingText(this.player.x, this.player.y - 30, 'DEFLECTED!', '#38bdf8', 18);
      // Knock deflected enemy away
      const dx = jelly.x - this.player.x;
      const dy = jelly.y - this.player.y;
      const dist = Math.hypot(dx, dy) || 1;
      jelly.vx = (dx / dist) * 240;
      jelly.vy = (dy / dist) * 240;
      return;
    }

    soundManager.playElectricShock();
    soundManager.playLifeLost();
    this.player.triggerShock();
    this.triggerScreenShake(0.35, 10);
    this.particles.spawnElectricShock(this.player.x, this.player.y);

    // Push enemy away with impulse so SpongeBob doesn't stay stuck inside it
    const dx = jelly.x - this.player.x;
    const dy = jelly.y - this.player.y;
    const dist = Math.hypot(dx, dy) || 1;
    jelly.vx = (dx / dist) * 220;
    jelly.vy = (dy / dist) * 220;

    if (this.mode === 'CLASSIC') {
      this.lives = Math.max(0, this.lives - 1);
      this.callbacks.onLivesUpdate(this.lives);
      this.particles.addFloatingText(this.player.x, this.player.y - 35, '-1 LIFE!', '#ef4444', 22);
      if (this.lives <= 0) {
        this.endGame();
      }
    } else if (this.mode === 'TIME_ATTACK') {
      this.score = Math.max(0, this.score - 50);
      this.callbacks.onScoreUpdate(this.score);
      this.particles.addFloatingText(this.player.x, this.player.y - 35, '-50 PTS!', '#ef4444', 22);
    }
  }

  private collectPowerUp(item: PowerUpItem) {
    soundManager.playPowerUpCollect(item.type);
    this.activatePowerUp(item.type, item.duration);
    this.particles.spawnCatchBurst(item.x, item.y, '#38bdf8', true);

    const names: Record<PowerUpType, string> = {
      SUPER_NET: 'SUPER NET!',
      SPEED_BOOST: 'SPEED BOOST!',
      MAGNET: 'JELLY MAGNET!',
      BUBBLE_SHIELD: 'BUBBLE SHIELD!',
      DOUBLE_POINTS: 'DOUBLE POINTS (2X)!',
    };
    this.particles.addFloatingText(this.player.x, this.player.y - 40, names[item.type], '#facc15', 20);
  }

  private activatePowerUp(type: PowerUpType, duration: number) {
    const existing = this.activePowerUps.find((p) => p.type === type);
    if (existing) {
      existing.remaining = duration;
    } else {
      this.activePowerUps.push({ type, duration, remaining: duration });
    }

    if (type === 'SUPER_NET') this.player.superNetActive = true;
    if (type === 'SPEED_BOOST') this.player.speedBoostActive = true;
    if (type === 'MAGNET') this.player.magnetActive = true;
    if (type === 'BUBBLE_SHIELD') this.player.shieldActive = true;
  }

  private deactivatePowerUp(type: PowerUpType) {
    if (type === 'SUPER_NET') this.player.superNetActive = false;
    if (type === 'SPEED_BOOST') this.player.speedBoostActive = false;
    if (type === 'MAGNET') this.player.magnetActive = false;
    if (type === 'BUBBLE_SHIELD') this.player.shieldActive = false;
  }

  private countActiveEnemies(): number {
    let count = 0;
    for (const j of this.jellyfishList) {
      if (j.type === 'ELECTRIC' && !j.isCaught && !j.isDespawned) {
        count++;
      }
    }
    return count;
  }

  private spawnCollectibleJellyfish() {
    const w = this.getWidth();
    const h = this.getHeight();
    const config = getLevelConfig(this.currentLevel);

    // Roll type based strictly on collectible probabilities
    const roll = Math.random();
    let type: JellyfishType = 'PINK';
    const p = config.probabilities;

    if (roll < p.pink) {
      type = 'PINK';
    } else if (roll < p.pink + p.blue) {
      type = 'BLUE';
    } else if (roll < p.pink + p.blue + p.gold) {
      type = 'GOLD';
    } else {
      type = 'RAINBOW';
    }

    // Determine safe spawn position
    let x = 0;
    let y = 0;

    if (this.jellyfishList.length < 5) {
      // Initial field distribution away from player
      x = 60 + Math.random() * (w - 120);
      y = 90 + Math.random() * (h - 220);
      if (Math.hypot(x - this.player.x, y - this.player.y) < 140) {
        x = (x + w / 2) % (w - 120) + 60;
      }
    } else {
      // Off-screen edge spawning
      const edge = Math.floor(Math.random() * 3);
      if (edge === 0) {
        x = -25;
        y = 90 + Math.random() * (h - 200);
      } else if (edge === 1) {
        x = w + 25;
        y = 90 + Math.random() * (h - 200);
      } else {
        x = 50 + Math.random() * (w - 100);
        y = 70;
      }
    }

    const jelly = new Jellyfish(
      Math.random().toString(36).substring(2, 9),
      x,
      y,
      type,
      config.speedMultiplier
    );
    this.jellyfishList.push(jelly);
  }

  private spawnSingleEnemyJellyfish() {
    if (this.mode === 'RELAX') return;

    const w = this.getWidth();
    const h = this.getHeight();
    const config = getLevelConfig(this.currentLevel);

    // Pick an edge far from SpongeBob
    let chosenEdge = 0;
    if (this.player.x > w / 2) {
      chosenEdge = 0; // spawn from left edge
    } else {
      chosenEdge = 1; // spawn from right edge
    }
    if (Math.random() < 0.25) chosenEdge = 2; // occasionally top edge

    let x = 0;
    let y = 0;
    if (chosenEdge === 0) {
      x = -30;
      y = 90 + Math.random() * (h - 200);
    } else if (chosenEdge === 1) {
      x = w + 30;
      y = 90 + Math.random() * (h - 200);
    } else {
      x = 60 + Math.random() * (w - 120);
      y = 65;
    }

    // Ensure it never spawns right on SpongeBob (at least 180px away)
    if (Math.hypot(x - this.player.x, y - this.player.y) < 180) {
      x = (x + w / 2) % (w - 80) + 40;
    }

    const enemy = new Jellyfish(
      `enemy_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      x,
      y,
      'ELECTRIC',
      config.speedMultiplier
    );
    this.jellyfishList.push(enemy);
  }

  private spawnJellyfish(forcedType?: JellyfishType) {
    if (forcedType === 'ELECTRIC') {
      this.spawnSingleEnemyJellyfish();
    } else {
      this.spawnCollectibleJellyfish();
    }
  }

  private spawnCollectiblePowerUp() {
    const w = this.getWidth();
    const h = this.getHeight();
    const types: PowerUpType[] = [
      'SUPER_NET',
      'SPEED_BOOST',
      'MAGNET',
      'BUBBLE_SHIELD',
      'DOUBLE_POINTS',
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = 70 + Math.random() * (w - 140);
    const y = 120 + Math.random() * (h - 240);

    const item = new PowerUpItem(Math.random().toString(36).substring(2, 9), x, y, type);
    this.powerUpsList.push(item);
  }

  private spawnDroppedBonus(x: number, y: number) {
    soundManager.playPowerUpCollect();
    this.particles.spawnCatchBurst(x, y, '#facc15', true);
    this.particles.addFloatingText(x, y - 20, 'BONUS DROP!', '#facc15', 20);

    // Roll either golden/rainbow jellyfish or powerup
    if (Math.random() < 0.5) {
      const goldJelly = new Jellyfish(
        Math.random().toString(36).substring(2, 9),
        x,
        y,
        Math.random() < 0.7 ? 'GOLD' : 'RAINBOW',
        1.1
      );
      this.jellyfishList.push(goldJelly);
    } else {
      const types: PowerUpType[] = ['SUPER_NET', 'BUBBLE_SHIELD', 'DOUBLE_POINTS'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      this.powerUpsList.push(
        new PowerUpItem(Math.random().toString(36).substring(2, 9), x, y, chosen)
      );
    }
  }

  private updateHUD() {
    const config = getLevelConfig(this.currentLevel);
    this.callbacks.onScoreUpdate(this.score);
    this.callbacks.onLivesUpdate(this.lives);
    this.callbacks.onTimeUpdate(Math.ceil(this.remainingTime));
    this.callbacks.onLevelUpdate(this.currentLevel, this.levelCatches, config.targetCatches);
  }

  private endGame() {
    this.state = 'GAME_OVER';
    this.callbacks.onStateChange('GAME_OVER');

    const accuracy =
      this.totalSwings > 0
        ? Math.min(100, Math.round((this.totalCatches / this.totalSwings) * 100))
        : 0;

    const { isNewHigh } = recordGameCompletion(
      this.score,
      this.totalCatches,
      this.caughtByType,
      this.currentLevel
    );

    if (isNewHigh) {
      soundManager.playNewHighScore();
    } else {
      soundManager.playGameOver();
    }

    this.callbacks.onGameOver({
      finalScore: this.score,
      isNewHigh,
      totalCaught: this.totalCatches,
      goldenCaught: this.goldenCatches,
      accuracy,
      levelReached: this.currentLevel,
    });
  }

  // --- Rendering ---

  private render() {
    const w = this.getWidth();
    const h = this.getHeight();

    this.ctx.save();

    // Camera shake application
    if (this.shakeTimer > 0) {
      const rx = (Math.random() - 0.5) * this.shakeIntensity;
      const ry = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(rx, ry);
    }

    // 1. Jellyfish Fields Background
    this.background.draw(this.ctx, w, h);

    // 2. Cameo character (Patrick, Squidward, etc.)
    this.cameoManager.draw(this.ctx);

    // 3. Collectible PowerUps
    for (const item of this.powerUpsList) {
      item.draw(this.ctx);
    }

    // 4. Jellyfish (with catch proximity indicator check)
    const netHitbox = this.player.getNetHitbox();
    for (const jelly of this.jellyfishList) {
      const dist = Math.hypot(jelly.x - netHitbox.x, jelly.y - netHitbox.y);
      const isProximity = dist < netHitbox.radius + jelly.radius + 20;
      jelly.draw(this.ctx, isProximity);
    }

    // 5. Player (SpongeBob)
    this.player.draw(this.ctx);

    // 6. Particle & Floating Text FX
    this.particles.draw(this.ctx);

    this.ctx.restore();
  }
}
