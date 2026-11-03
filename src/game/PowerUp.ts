import { PowerUpType } from '../types/game';

export class PowerUpItem {
  public id: string;
  public x: number;
  public y: number;
  public type: PowerUpType;
  public duration: number; // in seconds
  public radius = 24;
  public animTimer = 0;
  public life = 14; // stays on screen for 14s before popping if not collected
  public isCollected = false;

  constructor(id: string, x: number, y: number, type: PowerUpType) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;

    switch (type) {
      case 'SUPER_NET':
        this.duration = 8;
        break;
      case 'SPEED_BOOST':
        this.duration = 7;
        break;
      case 'MAGNET':
        this.duration = 8;
        break;
      case 'BUBBLE_SHIELD':
        this.duration = 6;
        break;
      case 'DOUBLE_POINTS':
        this.duration = 10;
        break;
    }
  }

  public update(dt: number) {
    this.animTimer += dt;
    this.life -= dt;
    // Gentle floating bob
    this.y += Math.sin(this.animTimer * 2) * 12 * dt;
    this.x += Math.cos(this.animTimer * 1.5) * 8 * dt;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Blinking warning when expiring
    if (this.life < 3 && Math.floor(this.life * 6) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Outer glow aura
    const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, this.radius * 1.5);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    glow.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Translucent glass bubble orb
    const bubbleGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, this.radius);
    bubbleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    bubbleGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.5)');
    bubbleGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.6)');
    bubbleGrad.addColorStop(1, 'rgba(14, 165, 233, 0.9)');
    ctx.fillStyle = bubbleGrad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular bubble shine
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.75, -Math.PI * 0.7, -Math.PI * 0.35);
    ctx.stroke();

    // Icon in center
    ctx.save();
    this.drawIcon(ctx);
    ctx.restore();

    ctx.restore();
  }

  private drawIcon(ctx: CanvasRenderingContext2D) {
    switch (this.type) {
      case 'SUPER_NET': {
        // Golden net icon
        ctx.strokeStyle = '#facc15';
        ctx.fillStyle = 'rgba(254, 240, 138, 0.5)';
        ctx.lineWidth = 2.5;
        // hoop
        ctx.beginPath();
        ctx.ellipse(3, -2, 11, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // handle
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, 10);
        ctx.lineTo(-2, 3);
        ctx.stroke();
        break;
      }
      case 'SPEED_BOOST': {
        // Lightning bolt icon
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(1, -12);
        ctx.lineTo(-8, 1);
        ctx.lineTo(-1, 1);
        ctx.lineTo(-3, 12);
        ctx.lineTo(8, -2);
        ctx.lineTo(1, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'MAGNET': {
        // Red & silver horseshoe magnet
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -2, 8, Math.PI, 0, false);
        ctx.stroke();
        // Silver tips
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(-8, 6);
        ctx.moveTo(8, -2);
        ctx.lineTo(8, 6);
        ctx.stroke();
        break;
      }
      case 'BUBBLE_SHIELD': {
        // Shield badge
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.lineTo(9, -6);
        ctx.lineTo(8, 5);
        ctx.quadraticCurveTo(0, 12, 0, 12);
        ctx.quadraticCurveTo(0, 12, -8, 5);
        ctx.lineTo(-9, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'DOUBLE_POINTS': {
        // 2X text badge
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 15px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2X', 0, 1);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeText('2X', 0, 1);
        break;
      }
    }
  }
}
