export type PlayerAnimation =
  | 'IDLE'
  | 'MOVE'
  | 'CATCH'
  | 'SHOCKED'
  | 'CHEER'
  | 'SAD'
  | 'FOCUSED';

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
  public swingDuration = 0.24; // seconds
  public shockTimer = 0;
  public shockDuration = 0.85;
  public invulnerabilityTimer = 0;
  public cheerTimer = 0;

  // Speeds
  public baseSpeed = 350; // px/sec
  public friction = 0.85;

  // Net swing mechanics
  public isSwinging = false;
  public netAngle = 0;
  public netRadius = 55;
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

    if (this.blinkTimer > 3.2) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.4) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Cheer countdown
    if (this.cheerTimer > 0) {
      this.cheerTimer -= dt;
      if (this.cheerTimer <= 0 && !this.isSwinging && this.shockTimer <= 0) {
        this.currentAnim = 'IDLE';
      }
    }

    // Shocked state handling
    if (this.shockTimer > 0) {
      this.shockTimer -= dt;
      this.currentAnim = 'SHOCKED';
      this.vx *= 0.5;
      this.vy *= 0.5;
      this.x += (Math.random() - 0.5) * 8;
      this.y += (Math.random() - 0.5) * 8;
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
        if (this.cheerTimer <= 0) {
          this.currentAnim = 'IDLE';
        }
      }
    }

    // Movement calculation
    const currentSpeed =
      this.baseSpeed * (this.speedBoostActive ? 1.6 : 1.0) * speedMultiplier;

    if (inputX !== 0 || inputY !== 0) {
      const len = Math.hypot(inputX, inputY) || 1;
      const targetVx = (inputX / len) * currentSpeed;
      const targetVy = (inputY / len) * currentSpeed;

      this.vx += (targetVx - this.vx) * 0.24;
      this.vy += (targetVy - this.vy) * 0.24;

      if (inputX < -0.1) this.facing = 'left';
      else if (inputX > 0.1) this.facing = 'right';

      if (!this.isSwinging && this.cheerTimer <= 0) {
        this.currentAnim = 'MOVE';
      }
    } else {
      this.vx *= this.friction;
      this.vy *= this.friction;
      if (Math.abs(this.vx) < 1) this.vx = 0;
      if (Math.abs(this.vy) < 1) this.vy = 0;

      if (!this.isSwinging && this.shockTimer <= 0 && this.cheerTimer <= 0) {
        this.currentAnim = 'IDLE';
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundaries clamping
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    const topMargin = 72;
    const bottomMargin = 88;

    if (this.x < halfW + 12) {
      this.x = halfW + 12;
      this.vx = 0;
    }
    if (this.x > bounds.width - halfW - 12) {
      this.x = bounds.width - halfW - 12;
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
    this.invulnerabilityTimer = 1.9;
  }

  public triggerCheer(duration = 1.2) {
    this.cheerTimer = duration;
    this.currentAnim = 'CHEER';
  }

  public getNetHitbox(): { x: number; y: number; radius: number } {
    const reach = this.superNetActive ? 80 : 54;
    const dir = this.facing === 'right' ? 1 : -1;
    return {
      x: this.x + dir * (this.width / 2 + reach * 0.6),
      y: this.y + 4,
      radius: this.superNetActive ? 70 : 48,
    };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Invulnerability blinking
    if (this.invulnerabilityTimer > 0 && Math.floor(this.invulnerabilityTimer * 14) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    ctx.translate(this.x, this.y);

    // Speed boost bubble trail
    if (this.speedBoostActive && Math.random() < 0.45) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(
        -this.width * 0.45 * (this.facing === 'right' ? 1 : -1),
        15 + (Math.random() - 0.5) * 20,
        4 + Math.random() * 5,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // Facing direction flip
    if (this.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const isMoving = this.currentAnim === 'MOVE';
    const isCheering = this.currentAnim === 'CHEER';
    const isShocked = this.currentAnim === 'SHOCKED';

    // Rhythmic organic breathing & swimming bob
    const bob = isCheering
      ? Math.sin(this.animTimer * 12) * 6
      : isMoving
      ? Math.sin(this.animTimer * 15) * 4
      : Math.sin(this.animTimer * 3.2) * 2.5;

    const legKick = isMoving ? Math.sin(this.animTimer * 15) * 0.4 : 0;
    const bodyTilt = isMoving ? 0.08 : 0;

    ctx.rotate(bodyTilt);

    // --- Bubble Shield ---
    if (this.shieldActive) {
      ctx.save();
      const shieldGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 58);
      shieldGlow.addColorStop(0, 'rgba(125, 211, 252, 0.2)');
      shieldGlow.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
      shieldGlow.addColorStop(1, 'rgba(186, 230, 253, 0.85)');
      ctx.fillStyle = shieldGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight arc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 55, -Math.PI * 0.75, -Math.PI * 0.35);
      ctx.stroke();
      ctx.restore();
    }

    // --- Legs & Shoes (Authentic stick legs, tube socks & shiny dress shoes) ---
    const legY = 24 + bob;
    this.drawLegs(ctx, legY, legKick);

    // --- Brown Square Pants ---
    const bodyY = bob;
    this.drawPantsAndShirt(ctx, bodyY);

    // --- Yellow Sponge Body with Scalloped Sponge Edges ---
    this.drawSpongeBody(ctx, bodyY, isShocked);

    // --- Facial Expression & Features ---
    this.drawFace(ctx, bodyY, isShocked, isCheering);

    // --- Net & Arm Animation ---
    this.drawArmAndNet(ctx, bodyY, isCheering);

    ctx.restore();
  }

  private drawLegs(ctx: CanvasRenderingContext2D, legY: number, legKick: number) {
    // Left Leg
    ctx.save();
    ctx.translate(-10, legY);
    ctx.rotate(legKick);
    // Yellow leg stick
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 13);
    ctx.stroke();
    // White sock
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3.5, 6, 7, 8);
    // Red sock stripe
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3.5, 8, 7, 1.8);
    // Blue sock stripe
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-3.5, 11, 7, 1.8);
    // Black dress shoe with heel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(3, 15, 7, 4.2, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, 16, 4, 3); // shoe heel
    ctx.restore();

    // Right Leg
    ctx.save();
    ctx.translate(10, legY);
    ctx.rotate(-legKick);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 13);
    ctx.stroke();
    // White sock
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3.5, 6, 7, 8);
    // Red sock stripe
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3.5, 8, 7, 1.8);
    // Blue sock stripe
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-3.5, 11, 7, 1.8);
    // Black dress shoe with heel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(3, 15, 7, 4.2, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, 16, 4, 3);
    ctx.restore();
  }

  private drawPantsAndShirt(ctx: CanvasRenderingContext2D, bodyY: number) {
    // Brown square pants
    ctx.fillStyle = '#78350f'; // classic cartoon brown
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-23, 11 + bodyY, 46, 14, 2);
    ctx.fill();
    ctx.stroke();

    // Black belt segments
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-19, 12.5 + bodyY, 7, 3);
    ctx.fillRect(-5, 12.5 + bodyY, 9, 3);
    ctx.fillRect(11, 12.5 + bodyY, 7, 3);

    // White shirt bar
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.fillRect(-23, 5 + bodyY, 46, 7);
    ctx.strokeRect(-23, 5 + bodyY, 46, 7);

    // Folded white collar flaps
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-7, 5 + bodyY);
    ctx.lineTo(0, 11 + bodyY);
    ctx.lineTo(-3.5, 5 + bodyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(7, 5 + bodyY);
    ctx.lineTo(0, 11 + bodyY);
    ctx.lineTo(3.5, 5 + bodyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bright crimson necktie
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, 5.5 + bodyY);
    ctx.lineTo(3, 5.5 + bodyY);
    ctx.lineTo(4, 12 + bodyY);
    ctx.lineTo(0, 16 + bodyY);
    ctx.lineTo(-4, 12 + bodyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawSpongeBody(
    ctx: CanvasRenderingContext2D,
    bodyY: number,
    isShocked: boolean
  ) {
    ctx.save();

    // Body color
    if (isShocked) {
      ctx.fillStyle = Math.random() < 0.5 ? '#fef08a' : '#86efac';
      ctx.strokeStyle = '#15803d';
    } else {
      ctx.fillStyle = '#facc15'; // vibrant sponge yellow
      ctx.strokeStyle = '#a16207'; // warm cartoon outline
    }

    ctx.lineWidth = 2.4;

    // Scalloped wavy organic sponge edge perimeter
    const w = 48;
    const h = 42;
    const top = -36 + bodyY;
    const left = -24;

    ctx.beginPath();
    ctx.moveTo(left, top + 6);

    // Top wavy edge
    for (let x = left; x <= left + w; x += 8) {
      const wave = Math.sin((x / 8) * Math.PI) * 1.5;
      ctx.lineTo(x, top + wave);
    }

    // Right wavy edge
    for (let y = top; y <= top + h; y += 7) {
      const wave = Math.sin((y / 7) * Math.PI) * 1.5;
      ctx.lineTo(left + w + wave, y);
    }

    // Bottom edge
    ctx.lineTo(left + w, top + h);
    ctx.lineTo(left, top + h);

    // Left wavy edge
    for (let y = top + h; y >= top; y -= 7) {
      const wave = Math.sin((y / 7) * Math.PI) * 1.5;
      ctx.lineTo(left - wave, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Organic sponge craters & pores (classic SpongeBob olive-green craters)
    ctx.fillStyle = '#ca8a04';
    ctx.globalAlpha = 0.4;
    [
      [-17, -26, 3.8],
      [-12, -14, 2.8],
      [16, -28, 4.2],
      [17, -12, 3.2],
      [8, -31, 2.5],
      [-7, -7, 3.5],
      [6, -6, 2.8],
    ].forEach(([px, py, rad]) => {
      ctx.beginPath();
      ctx.arc(px, py + bodyY, rad, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  private drawFace(
    ctx: CanvasRenderingContext2D,
    bodyY: number,
    isShocked: boolean,
    isCheering: boolean
  ) {
    const eyeY = -23 + bodyY;

    if (this.isBlinking) {
      // Blinking lines with eyelashes
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, eyeY);
      ctx.lineTo(-2, eyeY);
      ctx.moveTo(2, eyeY);
      ctx.lineTo(16, eyeY);
      ctx.stroke();
    } else if (isShocked) {
      // Comic startled wide eyes with lightning
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-9, eyeY, 9, 0, Math.PI * 2);
      ctx.arc(9, eyeY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-9, eyeY, 4, 0, Math.PI * 2);
      ctx.arc(9, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Comic shock lightning arcs
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-22, eyeY - 12);
      ctx.lineTo(-14, eyeY - 20);
      ctx.lineTo(-18, eyeY - 26);
      ctx.moveTo(22, eyeY - 12);
      ctx.lineTo(14, eyeY - 20);
      ctx.lineTo(18, eyeY - 26);
      ctx.stroke();
    } else {
      // Characteristic large blue cartoon eyes touching in center
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;

      // Left eye
      ctx.beginPath();
      ctx.arc(-8.5, eyeY, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right eye
      ctx.beginPath();
      ctx.arc(8.5, eyeY, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3 curved eyelashes above each eye
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      [-13, -8.5, -4].forEach((lx) => {
        ctx.beginPath();
        ctx.moveTo(lx, eyeY - 8.5);
        ctx.lineTo(lx - 1.5, eyeY - 14.5);
        ctx.stroke();
      });
      [4, 8.5, 13].forEach((rx) => {
        ctx.beginPath();
        ctx.moveTo(rx, eyeY - 8.5);
        ctx.lineTo(rx + 1.5, eyeY - 14.5);
        ctx.stroke();
      });

      // Bright blue irises
      const lookOffset = this.facing === 'right' ? 1.8 : -1.8;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(-7 + lookOffset, eyeY, 4.5, 0, Math.PI * 2);
      ctx.arc(10 + lookOffset, eyeY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Black pupils
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-7 + lookOffset, eyeY, 2.5, 0, Math.PI * 2);
      ctx.arc(10 + lookOffset, eyeY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // White sparkle gleam
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-8, eyeY - 1.8, 1.4, 0, Math.PI * 2);
      ctx.arc(9, eyeY - 1.8, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Long Cartoon Nose ---
    ctx.save();
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2.4;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(0, -15 + bodyY, 3.4, 8, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- Curved Rosy Cheeks & Freckles ---
    ctx.fillStyle = 'rgba(249, 115, 22, 0.55)';
    ctx.beginPath();
    ctx.arc(-17, -13 + bodyY, 5, 0, Math.PI * 2);
    ctx.arc(17, -13 + bodyY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cheek dimple curves
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-17, -13 + bodyY, 5.5, Math.PI * 0.7, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(17, -13 + bodyY, 5.5, -Math.PI * 0.5, Math.PI * 0.3);
    ctx.stroke();

    // 3 freckles on each cheek
    ctx.fillStyle = '#9a3412';
    [
      [-18, -14],
      [-16, -12],
      [-15, -15],
      [18, -14],
      [16, -12],
      [15, -15],
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy + bodyY, 1.0, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- Mouth & Buck Teeth ---
    const mouthY = -6 + bodyY;

    if (isShocked) {
      // Shocked open mouth
      ctx.fillStyle = '#991b1b';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, mouthY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (isCheering) {
      // Big open celebration smile showing tongue & teeth
      ctx.fillStyle = '#991b1b';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, mouthY - 3, 14, 0.15, Math.PI - 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pink tongue
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, mouthY + 5, 7, Math.PI, 0);
      ctx.fill();

      // Two white front teeth hanging from upper lip
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.4;
      ctx.fillRect(-5.5, mouthY - 3, 4.5, 5.5);
      ctx.strokeRect(-5.5, mouthY - 3, 4.5, 5.5);
      ctx.fillRect(1, mouthY - 3, 4.5, 5.5);
      ctx.strokeRect(1, mouthY - 3, 4.5, 5.5);
    } else {
      // Classic wide joyful grin
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, mouthY - 4, 14, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Two iconic square buck teeth with small gap
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.4;
      ctx.fillRect(-5.5, mouthY + 1.5, 4.5, 5.5);
      ctx.strokeRect(-5.5, mouthY + 1.5, 4.5, 5.5);
      ctx.fillRect(1, mouthY + 1.5, 4.5, 5.5);
      ctx.strokeRect(1, mouthY + 1.5, 4.5, 5.5);
    }
  }

  private drawArmAndNet(
    ctx: CanvasRenderingContext2D,
    bodyY: number,
    isCheering: boolean
  ) {
    ctx.save();

    let swingProgress = 0;
    if (this.isSwinging) {
      swingProgress = this.swingTimer / this.swingDuration;
    }

    const swingAngle = this.isSwinging
      ? -0.65 + Math.sin(swingProgress * Math.PI) * 1.9
      : isCheering
      ? -0.8 + Math.sin(this.animTimer * 10) * 0.2 // raised up in victory
      : 0.15 + Math.sin(this.animTimer * 2) * 0.08;

    const armStartX = 18;
    const armStartY = -5 + bodyY;

    // Yellow cartoon arm
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(armStartX, armStartY);
    const handX = armStartX + 14;
    const handY = isCheering ? armStartY - 12 : armStartY + 6;
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Net connected to hand
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(swingAngle);

    // Bamboo pole
    const poleLength = this.superNetActive ? 56 : 42;
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(poleLength, -2);
    ctx.stroke();

    // Bamboo rings
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    [-4, 8, 22].forEach((pos) => {
      ctx.beginPath();
      ctx.moveTo(pos, -4);
      ctx.lineTo(pos, 4);
      ctx.stroke();
    });

    // Net hoop
    const hoopRadius = this.superNetActive ? 30 : 20;
    const hoopX = poleLength + hoopRadius * 0.7;
    const hoopY = -2;

    ctx.strokeStyle = this.superNetActive ? '#facc15' : '#cbd5e1';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.ellipse(hoopX, hoopY, hoopRadius, hoopRadius * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Woven mesh net trailing
    ctx.fillStyle = this.superNetActive
      ? 'rgba(254, 240, 138, 0.4)'
      : 'rgba(255, 255, 255, 0.32)';
    ctx.strokeStyle = this.superNetActive
      ? 'rgba(234, 179, 8, 0.7)'
      : 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 1.4;

    const meshDepth = this.superNetActive ? 42 : 30;
    ctx.beginPath();
    ctx.ellipse(
      hoopX,
      hoopY,
      hoopRadius,
      hoopRadius * 0.65,
      0,
      -Math.PI / 2,
      Math.PI / 2
    );
    ctx.quadraticCurveTo(hoopX + meshDepth * 0.6, hoopY + 14, hoopX + meshDepth, hoopY);
    ctx.quadraticCurveTo(hoopX + meshDepth * 0.6, hoopY - 14, hoopX, hoopY - hoopRadius * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mesh cross hatching
    ctx.beginPath();
    ctx.moveTo(hoopX + 8, hoopY - 12);
    ctx.lineTo(hoopX + meshDepth * 0.8, hoopY + 3);
    ctx.moveTo(hoopX + 8, hoopY + 12);
    ctx.lineTo(hoopX + meshDepth * 0.8, hoopY - 3);
    ctx.stroke();

    // Dynamic swing streak
    if (this.isSwinging) {
      ctx.strokeStyle = this.superNetActive
        ? 'rgba(250, 204, 21, 0.85)'
        : 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, poleLength + hoopRadius * 1.5, -0.4, 0.65);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }
}
