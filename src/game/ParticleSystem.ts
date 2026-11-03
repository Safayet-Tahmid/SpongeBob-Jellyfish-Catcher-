import { FloatingText, Particle } from '../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  public update(dt: number) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'bubble') {
        p.vy -= 15 * dt; // buoyant float
        p.alpha = Math.max(0, p.life / p.maxLife);
      } else if (p.type === 'sparkle') {
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha = Math.max(0, p.life / p.maxLife);
      } else if (p.type === 'shock') {
        p.alpha = Math.max(0, p.life / p.maxLife);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.vy *= 0.92;
      ft.alpha = Math.min(1, (ft.life / ft.maxLife) * 1.5);
    }
  }

  public addFloatingText(
    x: number,
    y: number,
    text: string,
    color = '#facc15',
    fontSize = 18
  ) {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      text,
      color,
      fontSize,
      alpha: 1.0,
      vy: -55,
      life: 0.9,
      maxLife: 0.9,
    });
  }

  public spawnCatchBurst(
    x: number,
    y: number,
    color: string,
    isSpecial = false
  ) {
    // Bubbles
    const count = isSpecial ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: 'rgba(255, 255, 255, 0.8)',
        alpha: 1,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        type: 'bubble',
      });
    }

    // Sparkles
    for (let i = 0; i < (isSpecial ? 18 : 6); i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isSpecial ? 4 + Math.random() * 3 : 2 + Math.random() * 2,
        color,
        alpha: 1,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        type: 'sparkle',
      });
    }
  }

  public spawnElectricShock(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 130;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: Math.random() < 0.5 ? '#fef08a' : '#38bdf8',
        alpha: 1,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        type: 'shock',
      });
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'bubble') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        // 4-point star sparkle
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.size * 1.5);
        ctx.lineTo(p.x + p.size * 0.4, p.y - p.size * 0.4);
        ctx.lineTo(p.x + p.size * 1.5, p.y);
        ctx.lineTo(p.x + p.size * 0.4, p.y + p.size * 0.4);
        ctx.lineTo(p.x, p.y + p.size * 1.5);
        ctx.lineTo(p.x - p.size * 0.4, p.y + p.size * 0.4);
        ctx.lineTo(p.x - p.size * 1.5, p.y);
        ctx.lineTo(p.x - p.size * 0.4, p.y - p.size * 0.4);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'shock') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (Math.random() - 0.5) * 12, p.y + (Math.random() - 0.5) * 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw floating texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `800 ${ft.fontSize}px "Fredoka", cursive, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);

      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
  }
}
