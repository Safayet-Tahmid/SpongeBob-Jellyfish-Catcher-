import { JellyfishType } from '../types/game';

export class Jellyfish {
  public id: string;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public type: JellyfishType;
  public scoreValue: number;
  public radius: number;
  public isCaught = false;
  public caughtProgress = 0; // 0 to 1 as it gets pulled into net

  // Swimming animation
  public animTimer: number;
  public pulseSpeed: number;
  public baseSpeed: number;
  private changeDirTimer: number;
  public hue = 0; // for rainbow jellyfish
  public electricSparkTimer = 0;

  constructor(
    id: string,
    x: number,
    y: number,
    type: JellyfishType,
    speedMultiplier = 1.0
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
    this.animTimer = Math.random() * Math.PI * 2;
    this.changeDirTimer = 1.5 + Math.random() * 2.5;

    switch (type) {
      case 'BLUE':
        this.scoreValue = 20;
        this.baseSpeed = (85 + Math.random() * 35) * speedMultiplier;
        this.pulseSpeed = 4.2;
        this.radius = 20;
        break;
      case 'GOLD':
        this.scoreValue = 50;
        this.baseSpeed = (75 + Math.random() * 25) * speedMultiplier;
        this.pulseSpeed = 3.6;
        this.radius = 22;
        break;
      case 'ELECTRIC':
        this.scoreValue = 0; // hazard!
        this.baseSpeed = (95 + Math.random() * 40) * speedMultiplier;
        this.pulseSpeed = 5.0;
        this.radius = 21;
        break;
      case 'RAINBOW':
        this.scoreValue = 100;
        this.baseSpeed = (120 + Math.random() * 45) * speedMultiplier;
        this.pulseSpeed = 5.2;
        this.radius = 23;
        break;
      case 'PINK':
      default:
        this.scoreValue = 10;
        this.baseSpeed = (65 + Math.random() * 25) * speedMultiplier;
        this.pulseSpeed = 3.2;
        this.radius = 20;
        break;
    }

    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * this.baseSpeed;
    this.vy = Math.sin(angle) * this.baseSpeed * 0.7;
  }

  public update(
    dt: number,
    bounds: { width: number; height: number },
    playerPos?: { x: number; y: number },
    magnetActive?: boolean
  ) {
    this.animTimer += dt * this.pulseSpeed;
    this.electricSparkTimer += dt;
    if (this.type === 'RAINBOW') {
      this.hue = (this.hue + dt * 140) % 360;
    }

    // Direction shift timer (Blue jellyfish changes direction more frequently)
    this.changeDirTimer -= dt;
    if (this.changeDirTimer <= 0) {
      this.changeDirTimer = this.type === 'BLUE' ? 1.0 + Math.random() * 1.5 : 2.5 + Math.random() * 3;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * this.baseSpeed;
      this.vy = Math.sin(angle) * this.baseSpeed * 0.6;
    }

    // Magnet power-up attraction (attracts PINK and BLUE toward player)
    if (
      magnetActive &&
      playerPos &&
      (this.type === 'PINK' || this.type === 'BLUE')
    ) {
      const dx = playerPos.x - this.x;
      const dy = playerPos.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 320 && dist > 5) {
        this.vx += (dx / dist) * 160 * dt;
        this.vy += (dy / dist) * 160 * dt;
      }
    }

    // Natural rhythmic propulsion pulse
    const pulseFactor = 0.6 + Math.pow(Math.max(0, Math.sin(this.animTimer)), 2) * 0.8;
    this.x += this.vx * pulseFactor * dt;
    this.y += this.vy * pulseFactor * dt;

    // Gentle bounds bounce
    const pad = this.radius + 10;
    const topMargin = 70;
    const bottomMargin = 85;

    if (this.x < pad) {
      this.x = pad;
      this.vx = Math.abs(this.vx);
    } else if (this.x > bounds.width - pad) {
      this.x = bounds.width - pad;
      this.vx = -Math.abs(this.vx);
    }

    if (this.y < pad + topMargin) {
      this.y = pad + topMargin;
      this.vy = Math.abs(this.vy);
    } else if (this.y > bounds.height - pad - bottomMargin) {
      this.y = bounds.height - pad - bottomMargin;
      this.vy = -Math.abs(this.vy);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, isProximityHint = false) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Subtle angle based on motion
    const moveAngle = Math.atan2(this.vy, this.vx) - Math.PI / 2;
    ctx.rotate(moveAngle * 0.25);

    // Contraction expansion scale
    const contraction = 1 + Math.sin(this.animTimer) * 0.15;
    const verticalSquash = 1 - Math.sin(this.animTimer) * 0.12;

    // Optional proximity ring indicating within catching range!
    if (isProximityHint && this.type !== 'ELECTRIC') {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Outer glow for Gold, Rainbow, or Electric
    if (this.type === 'GOLD') {
      ctx.save();
      const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, this.radius * 1.8);
      glow.addColorStop(0, 'rgba(250, 204, 21, 0.5)');
      glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'RAINBOW') {
      ctx.save();
      const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, this.radius * 1.8);
      glow.addColorStop(0, `hsla(${this.hue}, 90%, 65%, 0.45)`);
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (this.type === 'ELECTRIC') {
      // Crackling electric aura
      ctx.save();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + this.electricSparkTimer * 8;
        const rad = this.radius * 1.35 + (Math.random() - 0.5) * 6;
        const sx = Math.cos(ang) * rad;
        const sy = Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // --- Undulating Tentacles ---
    ctx.save();
    const tentacleCount = 4;
    const tentacleSpread = 16 * contraction;
    const tentacleLength = 22 * verticalSquash;

    for (let i = 0; i < tentacleCount; i++) {
      const tx = -tentacleSpread / 2 + (i / (tentacleCount - 1)) * tentacleSpread;
      const wave = Math.sin(this.animTimer + i * 1.2) * 5;

      ctx.beginPath();
      ctx.moveTo(tx, 4);
      ctx.bezierCurveTo(
        tx + wave,
        10,
        tx - wave,
        tentacleLength * 0.7,
        tx + wave * 0.5,
        tentacleLength
      );

      if (this.type === 'PINK') {
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.85)';
        ctx.lineWidth = 2.4;
      } else if (this.type === 'BLUE') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.lineWidth = 2.4;
      } else if (this.type === 'GOLD') {
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.95)';
        ctx.lineWidth = 2.6;
      } else if (this.type === 'ELECTRIC') {
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
      } else if (this.type === 'RAINBOW') {
        ctx.strokeStyle = `hsl(${(this.hue + i * 40) % 360}, 90%, 65%)`;
        ctx.lineWidth = 2.6;
      }
      ctx.stroke();
    }
    ctx.restore();

    // --- Bell Umbrella Dome ---
    ctx.save();
    ctx.scale(contraction, verticalSquash);

    // Fill style based on type
    if (this.type === 'PINK') {
      const grad = ctx.createRadialGradient(0, -6, 2, 0, 0, this.radius);
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(0.7, '#f472b6');
      grad.addColorStop(1, '#db2777');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#be185d';
    } else if (this.type === 'BLUE') {
      const grad = ctx.createRadialGradient(0, -6, 2, 0, 0, this.radius);
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#0369a1';
    } else if (this.type === 'GOLD') {
      const grad = ctx.createRadialGradient(0, -6, 2, 0, 0, this.radius);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.7, '#facc15');
      grad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#a16207';
    } else if (this.type === 'ELECTRIC') {
      const grad = ctx.createRadialGradient(0, -6, 2, 0, 0, this.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, '#fef08a');
      grad.addColorStop(1, '#eab308');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#ca8a04';
    } else if (this.type === 'RAINBOW') {
      const grad = ctx.createRadialGradient(0, -6, 2, 0, 0, this.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, `hsl(${this.hue}, 95%, 70%)`);
      grad.addColorStop(1, `hsl(${(this.hue + 60) % 360}, 85%, 50%)`);
      ctx.fillStyle = grad;
      ctx.strokeStyle = `hsl(${(this.hue + 80) % 360}, 90%, 40%)`;
    }

    ctx.lineWidth = 1.8;

    // Draw mushroom bell
    ctx.beginPath();
    ctx.moveTo(-this.radius, 4);
    // Bell curve top
    ctx.bezierCurveTo(
      -this.radius * 0.95,
      -this.radius * 1.25,
      this.radius * 0.95,
      -this.radius * 1.25,
      this.radius,
      4
    );
    // Ruffled bottom rim
    const lobes = 4;
    for (let l = lobes; l >= 0; l--) {
      const rx = -this.radius + (l / lobes) * (this.radius * 2);
      ctx.quadraticCurveTo(rx, 7, rx - this.radius / lobes, 4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Three cute spots on the bell (iconic SpongeBob jellyfish spots)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.35, -this.radius * 0.3, 3.2, 0, Math.PI * 2);
    ctx.arc(this.radius * 0.3, -this.radius * 0.35, 3.8, 0, Math.PI * 2);
    ctx.arc(0, -this.radius * 0.65, 3, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight rim on top
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -4, this.radius * 0.75, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }
}
