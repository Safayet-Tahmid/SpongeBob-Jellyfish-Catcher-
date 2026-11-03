export type PlayerAnimation = 'IDLE' | 'MOVE' | 'CATCH' | 'SHOCKED' | 'CHEER' | 'SAD';

export class Player {
  public x: number;
  public y: number;
  public vx = 0;
  public vy = 0;
  public width = 64;
  public height = 76;
  public facing: 'left' | 'right' = 'right';
  public currentAnim: PlayerAnimation = 'IDLE';

  public animTimer = 0;
  public swingTimer = 0;
  public swingDuration = 0.22; // seconds
  public shockTimer = 0;
  public shockDuration = 0.8;
  public invulnerabilityTimer = 0;

  // Speeds
  public baseSpeed = 340; // px/sec
  public friction = 0.86;

  // Net swing mechanics
  public isSwinging = false;
  public netAngle = 0;
  public netRadius = 55; // default net reach
  public superNetActive = false;
  public speedBoostActive = false;
  public shieldActive = false;
  public magnetActive = false;

  private blinkTimer = 0;
  private isBlinking = false;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  public update(
    dt: number,
    inputX: number,
    inputY: number,
    bounds: { width: number; height: number },
    speedMultiplier = 1.0
  ) {
    this.animTimer += dt;
    this.blinkTimer += dt;

    if (this.blinkTimer > 3.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.7) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Shocked state handling
    if (this.shockTimer > 0) {
      this.shockTimer -= dt;
      this.currentAnim = 'SHOCKED';
      // Shake slightly
      this.vx *= 0.5;
      this.vy *= 0.5;
      this.x += (Math.random() - 0.5) * 6;
      this.y += (Math.random() - 0.5) * 6;
      return;
    }

    // Invulnerability timer countdown
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= dt;
    }

    // Net swing countdown
    if (this.isSwinging) {
      this.swingTimer += dt;
      if (this.swingTimer >= this.swingDuration) {
        this.isSwinging = false;
        this.swingTimer = 0;
      }
    }

    // Movement calculation
    const currentSpeed =
      this.baseSpeed * (this.speedBoostActive ? 1.55 : 1.0) * speedMultiplier;

    if (inputX !== 0 || inputY !== 0) {
      // Normalize
      const len = Math.hypot(inputX, inputY) || 1;
      const targetVx = (inputX / len) * currentSpeed;
      const targetVy = (inputY / len) * currentSpeed;

      // Smooth acceleration
      this.vx += (targetVx - this.vx) * 0.22;
      this.vy += (targetVy - this.vy) * 0.22;

      if (inputX < -0.1) this.facing = 'left';
      else if (inputX > 0.1) this.facing = 'right';

      if (!this.isSwinging) {
        this.currentAnim = 'MOVE';
      }
    } else {
      // Friction deceleration
      this.vx *= this.friction;
      this.vy *= this.friction;
      if (Math.abs(this.vx) < 1) this.vx = 0;
      if (Math.abs(this.vy) < 1) this.vy = 0;

      if (!this.isSwinging && this.shockTimer <= 0) {
        this.currentAnim = 'IDLE';
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundaries clamping
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const topMargin = 70; // HUD safe area
    const bottomMargin = 85; // Mobile touch safe area

    if (this.x < halfW + 10) {
      this.x = halfW + 10;
      this.vx = 0;
    }
    if (this.x > bounds.width - halfW - 10) {
      this.x = bounds.width - halfW - 10;
      this.vx = 0;
    }
    if (this.y < halfH + topMargin) {
      this.y = halfH + topMargin;
      this.vy = 0;
    }
    if (this.y > bounds.height - halfH - bottomMargin) {
      this.y = bounds.height - halfH - bottomMargin;
      this.vy = 0;
    }
  }

  public swingNet(): boolean {
    if (this.isSwinging || this.shockTimer > 0) return false;
    this.isSwinging = true;
    this.swingTimer = 0;
    this.currentAnim = 'CATCH';
    return true;
  }

  public triggerShock() {
    if (this.shieldActive || this.invulnerabilityTimer > 0) return;
    this.shockTimer = this.shockDuration;
    this.invulnerabilityTimer = 1.8;
  }

  public getNetHitbox(): { x: number; y: number; radius: number } {
    const reach = (this.superNetActive ? 75 : 50);
    const dir = this.facing === 'right' ? 1 : -1;
    return {
      x: this.x + dir * (this.width / 2 + reach * 0.6),
      y: this.y + 5,
      radius: this.superNetActive ? 65 : 44,
    };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Invulnerability blinking
    if (this.invulnerabilityTimer > 0 && Math.floor(this.invulnerabilityTimer * 12) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    ctx.translate(this.x, this.y);

    // Speed boost bubble trail indicator
    if (this.speedBoostActive && Math.random() < 0.4) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-this.width * 0.4 * (this.facing === 'right' ? 1 : -1), 15 + (Math.random() - 0.5) * 20, 4 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Flip if facing left
    if (this.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const isMoving = this.currentAnim === 'MOVE';
    const bob = isMoving ? Math.sin(this.animTimer * 14) * 4 : Math.sin(this.animTimer * 3.5) * 2.5;
    const legKick = isMoving ? Math.sin(this.animTimer * 14) * 0.35 : 0;

    // --- Bubble Shield render ---
    if (this.shieldActive) {
      ctx.save();
      const shieldGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 56);
      shieldGlow.addColorStop(0, 'rgba(125, 211, 252, 0.15)');
      shieldGlow.addColorStop(0.7, 'rgba(56, 189, 248, 0.35)');
      shieldGlow.addColorStop(1, 'rgba(186, 230, 253, 0.85)');
      ctx.fillStyle = shieldGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 56, 0, Math.PI * 2);
      ctx.fill();

      // Specular shine on shield
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 54, -Math.PI * 0.75, -Math.PI * 0.45);
      ctx.stroke();
      ctx.restore();
    }

    // --- Legs & Shoes ---
    const legY = 24 + bob;
    ctx.save();
    // Left Leg
    ctx.translate(-10, legY);
    ctx.rotate(legKick);
    // Stick leg
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 12);
    ctx.stroke();
    // Sock (white with red & blue stripe)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, 6, 6, 7);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3, 8, 6, 1.5);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-3, 10.5, 6, 1.5);
    // Black shoe
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(3, 14, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Leg
    ctx.save();
    ctx.translate(10, legY);
    ctx.rotate(-legKick);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 12);
    ctx.stroke();
    // Sock
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, 6, 6, 7);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3, 8, 6, 1.5);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-3, 10.5, 6, 1.5);
    // Black shoe
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(3, 14, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- Brown Pants ---
    const bodyY = bob;
    ctx.fillStyle = '#78350f'; // rich brown
    ctx.beginPath();
    ctx.roundRect(-22, 11 + bodyY, 44, 14, 3);
    ctx.fill();

    // Black belt segments
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, 12 + bodyY, 7, 3);
    ctx.fillRect(-4, 12 + bodyY, 8, 3);
    ctx.fillRect(11, 12 + bodyY, 7, 3);

    // --- White Shirt ---
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-22, 5 + bodyY, 44, 7);

    // Collar flaps
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-6, 5 + bodyY);
    ctx.lineTo(0, 11 + bodyY);
    ctx.lineTo(-3, 5 + bodyY);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, 5 + bodyY);
    ctx.lineTo(0, 11 + bodyY);
    ctx.lineTo(3, 5 + bodyY);
    ctx.fill();

    // Red Necktie
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-2.5, 5.5 + bodyY);
    ctx.lineTo(2.5, 5.5 + bodyY);
    ctx.lineTo(3.5, 12 + bodyY);
    ctx.lineTo(0, 15 + bodyY);
    ctx.lineTo(-3.5, 12 + bodyY);
    ctx.closePath();
    ctx.fill();

    // --- Yellow Sponge Body ---
    const isShocked = this.currentAnim === 'SHOCKED';

    if (isShocked) {
      // Shock skeleton / flashing green-yellow
      ctx.fillStyle = Math.random() < 0.5 ? '#fef08a' : '#86efac';
    } else {
      ctx.fillStyle = '#facc15'; // bright sponge yellow
    }

    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-23, -34 + bodyY, 46, 40, 5);
    ctx.fill();
    ctx.stroke();

    // Organic sponge pores
    ctx.fillStyle = '#ca8a04';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(-16, -24 + bodyY, 3, 0, Math.PI * 2);
    ctx.arc(-12, -12 + bodyY, 2, 0, Math.PI * 2);
    ctx.arc(15, -26 + bodyY, 3.5, 0, Math.PI * 2);
    ctx.arc(16, -10 + bodyY, 2.5, 0, Math.PI * 2);
    ctx.arc(8, -30 + bodyY, 2, 0, Math.PI * 2);
    ctx.arc(-6, -6 + bodyY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // --- Eyes ---
    const eyeY = -22 + bodyY;
    if (this.isBlinking) {
      // Blinking lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, eyeY);
      ctx.lineTo(-2, eyeY);
      ctx.moveTo(2, eyeY);
      ctx.lineTo(16, eyeY);
      ctx.stroke();
    } else if (isShocked) {
      // Wide startled eyes with X or spirals
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-9, eyeY, 8.5, 0, Math.PI * 2);
      ctx.arc(9, eyeY, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-9, eyeY, 3.5, 0, Math.PI * 2);
      ctx.arc(9, eyeY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal big happy blue eyes
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;

      // Left eye
      ctx.beginPath();
      ctx.arc(-8.5, eyeY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right eye
      ctx.beginPath();
      ctx.arc(8.5, eyeY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Three prominent eyelashes above each eye
      ctx.lineWidth = 1.5;
      [-12, -8.5, -5].forEach((lx) => {
        ctx.beginPath();
        ctx.moveTo(lx, eyeY - 8);
        ctx.lineTo(lx - 1, eyeY - 13);
        ctx.stroke();
      });
      [5, 8.5, 12].forEach((rx) => {
        ctx.beginPath();
        ctx.moveTo(rx, eyeY - 8);
        ctx.lineTo(rx + 1, eyeY - 13);
        ctx.stroke();
      });

      // Blue iris
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(-7 + (this.facing === 'right' ? 1.5 : -1.5), eyeY, 4.2, 0, Math.PI * 2);
      ctx.arc(10 + (this.facing === 'right' ? 1.5 : -1.5), eyeY, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Black pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-7 + (this.facing === 'right' ? 1.5 : -1.5), eyeY, 2.3, 0, Math.PI * 2);
      ctx.arc(10 + (this.facing === 'right' ? 1.5 : -1.5), eyeY, 2.3, 0, Math.PI * 2);
      ctx.fill();

      // White gleam
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-8, eyeY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.arc(9, eyeY - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Long Nose ---
    ctx.save();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(0, -15 + bodyY, 3, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- Rosy Cheeks & Freckles ---
    ctx.fillStyle = 'rgba(249, 115, 22, 0.45)';
    ctx.beginPath();
    ctx.arc(-16, -13 + bodyY, 4.5, 0, Math.PI * 2);
    ctx.arc(16, -13 + bodyY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Three dots on each cheek
    ctx.fillStyle = '#ea580c';
    [[-17, -14], [-15, -12], [-14, -15], [17, -14], [15, -12], [14, -15]].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy + bodyY, 0.9, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- Mouth & Buck Teeth ---
    const mouthY = -6 + bodyY;
    if (isShocked) {
      // Shocked wavy open mouth
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(0, mouthY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Wide happy grin
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, mouthY - 4, 13, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Dimple curves
      ctx.beginPath();
      ctx.arc(-13, mouthY - 2, 3, Math.PI * 0.7, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(13, mouthY - 2, 3, -Math.PI * 0.5, Math.PI * 0.3);
      ctx.stroke();

      // Buck teeth
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.rect(-5, mouthY + 1.5, 4, 5);
      ctx.rect(1, mouthY + 1.5, 4, 5);
      ctx.fill();
      ctx.stroke();
    }

    // --- Jellyfishing Net & Arms ---
    this.drawArmAndNet(ctx, bodyY);

    ctx.restore();
  }

  private drawArmAndNet(ctx: CanvasRenderingContext2D, bodyY: number) {
    ctx.save();

    let swingProgress = 0;
    if (this.isSwinging) {
      swingProgress = this.swingTimer / this.swingDuration;
    }

    // Swing arc rotation: starts up-back, sweeps down-forward
    const swingAngle = this.isSwinging
      ? -0.6 + Math.sin(swingProgress * Math.PI) * 1.8
      : 0.15 + Math.sin(this.animTimer * 2) * 0.08;

    const armStartX = 18;
    const armStartY = -5 + bodyY;

    // Draw arm
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(armStartX, armStartY);
    const handX = armStartX + 14;
    const handY = armStartY + 6;
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Net handle & hoop attached to hand
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(swingAngle);

    // Bamboo pole
    const poleLength = this.superNetActive ? 52 : 38;
    ctx.strokeStyle = '#b45309'; // bamboo brown
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(poleLength, -2);
    ctx.stroke();

    // Ring attachments / segments on bamboo
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    [-4, 8, 20].forEach((pos) => {
      ctx.beginPath();
      ctx.moveTo(pos, -4);
      ctx.lineTo(pos, 4);
      ctx.stroke();
    });

    // Net hoop
    const hoopRadius = this.superNetActive ? 28 : 18;
    const hoopX = poleLength + hoopRadius * 0.7;
    const hoopY = -2;

    ctx.strokeStyle = this.superNetActive ? '#facc15' : '#94a3b8'; // golden hoop if super net
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(hoopX, hoopY, hoopRadius, hoopRadius * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Net mesh bag trailing backward
    ctx.fillStyle = this.superNetActive ? 'rgba(254, 240, 138, 0.35)' : 'rgba(255, 255, 255, 0.28)';
    ctx.strokeStyle = this.superNetActive ? 'rgba(234, 179, 8, 0.6)' : 'rgba(203, 213, 225, 0.5)';
    ctx.lineWidth = 1.2;

    const meshDepth = this.superNetActive ? 38 : 26;
    ctx.beginPath();
    ctx.ellipse(hoopX, hoopY, hoopRadius, hoopRadius * 0.65, 0, -Math.PI / 2, Math.PI / 2);
    ctx.quadraticCurveTo(hoopX + meshDepth * 0.6, hoopY + 12, hoopX + meshDepth, hoopY);
    ctx.quadraticCurveTo(hoopX + meshDepth * 0.6, hoopY - 12, hoopX, hoopY - hoopRadius * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cross hatching lines on mesh
    ctx.beginPath();
    ctx.moveTo(hoopX + 8, hoopY - 10);
    ctx.lineTo(hoopX + meshDepth * 0.8, hoopY + 2);
    ctx.moveTo(hoopX + 8, hoopY + 10);
    ctx.lineTo(hoopX + meshDepth * 0.8, hoopY - 2);
    ctx.stroke();

    // Whoosh visual effect when swinging
    if (this.isSwinging) {
      ctx.strokeStyle = this.superNetActive ? 'rgba(250, 204, 21, 0.7)' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, poleLength + hoopRadius * 1.5, -0.4, 0.6);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }
}
