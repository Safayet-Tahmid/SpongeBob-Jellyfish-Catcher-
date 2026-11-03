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

    // --- Legs & Shoes (Matching reference image: stick legs, pant cuffs, striped tube socks & bulbous dress shoes) ---
    const legY = 24 + bob;
    this.drawLegs(ctx, legY, legKick);

    // --- Brown Square Pants & White Shirt with Tie ---
    const bodyY = bob;
    this.drawPantsAndShirt(ctx, bodyY);

    // --- Yellow Sponge Body with Scalloped Ruffles & Olive-Green Craters ---
    this.drawSpongeBody(ctx, bodyY, isShocked);

    // --- Facial Expression & Features (Matching reference image eyes, nose, cheeks, smile, and teeth) ---
    this.drawFace(ctx, bodyY, isShocked, isCheering);

    // --- Net & Arm Animation ---
    this.drawArmAndNet(ctx, bodyY, isCheering);

    ctx.restore();
  }

  private drawLegs(ctx: CanvasRenderingContext2D, legY: number, legKick: number) {
    // Left Leg
    ctx.save();
    ctx.translate(-11, legY);
    ctx.rotate(legKick);

    // Brown pant cuff (from reference image)
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-4.5, -2, 9, 5, 1);
    ctx.fill();
    ctx.stroke();

    // Yellow slender stick leg
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(0, 14);
    ctx.stroke();

    // White tube sock
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.fillRect(-3.5, 7, 7, 8.5);
    ctx.strokeRect(-3.5, 7, 7, 8.5);

    // Blue sock stripe (top stripe, per reference image)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-3.5, 8.5, 7, 1.6);

    // Red sock stripe (bottom stripe, per reference image)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-3.5, 11.5, 7, 1.6);

    // Glossy black cartoon dress shoe with heel and bulbous toe
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(3.5, 16.5, 7.5, 4.4, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, 17.5, 4, 3.2); // shoe heel

    // White glossy shine gleam on shoe toe
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(5, 15, 2.5, 1.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Leg
    ctx.save();
    ctx.translate(11, legY);
    ctx.rotate(-legKick);

    // Brown pant cuff
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-4.5, -2, 9, 5, 1);
    ctx.fill();
    ctx.stroke();

    // Yellow slender stick leg
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(0, 14);
    ctx.stroke();

    // White tube sock
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.fillRect(-3.5, 7, 7, 8.5);
    ctx.strokeRect(-3.5, 7, 7, 8.5);

    // Blue sock stripe
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-3.5, 8.5, 7, 1.6);

    // Red sock stripe
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-3.5, 11.5, 7, 1.6);

    // Glossy black cartoon dress shoe
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(3.5, 16.5, 7.5, 4.4, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-2, 17.5, 4, 3.2);

    // White shine gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(5, 15, 2.5, 1.2, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawPantsAndShirt(ctx: CanvasRenderingContext2D, bodyY: number) {
    // White shirt sleeves on the sides of the body (per reference image)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-27, 4 + bodyY, 6, 8, 2);
    ctx.roundRect(21, 4 + bodyY, 6, 8, 2);
    ctx.fill();
    ctx.stroke();

    // Brown square trousers
    ctx.fillStyle = '#78350f'; // authentic cartoon brown
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-24, 11 + bodyY, 48, 14, 2);
    ctx.fill();
    ctx.stroke();

    // Four black belt dashes (2 on left, 2 on right, per reference image)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-20, 13 + bodyY, 6.5, 3.2);
    ctx.fillRect(-11, 13 + bodyY, 6.5, 3.2);
    ctx.fillRect(4.5, 13 + bodyY, 6.5, 3.2);
    ctx.fillRect(13.5, 13 + bodyY, 6.5, 3.2);

    // White shirt horizontal stripe
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.fillRect(-24, 4.5 + bodyY, 48, 7.5);
    ctx.strokeRect(-24, 4.5 + bodyY, 48, 7.5);

    // Two sharp white triangular collar flaps pointing toward the tie
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.4;

    // Left collar flap
    ctx.beginPath();
    ctx.moveTo(-10, 4.5 + bodyY);
    ctx.lineTo(-1, 11 + bodyY);
    ctx.lineTo(-4, 4.5 + bodyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right collar flap
    ctx.beginPath();
    ctx.moveTo(10, 4.5 + bodyY);
    ctx.lineTo(1, 11 + bodyY);
    ctx.lineTo(4, 4.5 + bodyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bright red four-in-hand necktie (diamond knot & hanging diamond blade)
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1.2;

    // Tie knot
    ctx.beginPath();
    ctx.moveTo(-3, 5 + bodyY);
    ctx.lineTo(3, 5 + bodyY);
    ctx.lineTo(2.5, 9 + bodyY);
    ctx.lineTo(-2.5, 9 + bodyY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tie blade hanging down over belt
    ctx.beginPath();
    ctx.moveTo(-2.5, 9 + bodyY);
    ctx.lineTo(2.5, 9 + bodyY);
    ctx.lineTo(4.5, 14.5 + bodyY);
    ctx.lineTo(0, 18.5 + bodyY);
    ctx.lineTo(-4.5, 14.5 + bodyY);
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

    // Body yellow color
    if (isShocked) {
      ctx.fillStyle = Math.random() < 0.5 ? '#fef08a' : '#86efac';
      ctx.strokeStyle = '#15803d';
    } else {
      ctx.fillStyle = '#fde047'; // bright golden cartoon yellow from reference
      ctx.strokeStyle = '#854d0e'; // crisp warm cartoon outline
    }

    ctx.lineWidth = 2.4;

    // Scalloped wavy organic sponge edge perimeter
    const w = 50;
    const h = 44;
    const top = -38 + bodyY;
    const left = -25;

    ctx.beginPath();
    ctx.moveTo(left, top + 6);

    // Top wavy edge (5 soft scalloped ripples)
    const topWaves = 5;
    const topStep = w / topWaves;
    for (let i = 0; i < topWaves; i++) {
      const x1 = left + i * topStep;
      const x2 = x1 + topStep;
      ctx.quadraticCurveTo(x1 + topStep / 2, top - 2.2, x2, top);
    }

    // Right wavy edge (5 soft scalloped ripples)
    const sideWaves = 5;
    const sideStep = h / sideWaves;
    for (let i = 0; i < sideWaves; i++) {
      const y1 = top + i * sideStep;
      const y2 = y1 + sideStep;
      ctx.quadraticCurveTo(left + w + 2.2, y1 + sideStep / 2, left + w, y2);
    }

    // Bottom edge
    ctx.lineTo(left, top + h);

    // Left wavy edge (5 soft scalloped ripples)
    for (let i = sideWaves - 1; i >= 0; i--) {
      const y1 = top + (i + 1) * sideStep;
      const y2 = top + i * sideStep;
      ctx.quadraticCurveTo(left - 2.2, y2 + sideStep / 2, left, y2);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Olive-green sponge craters & pores (Accurately positioned per reference image)
    ctx.fillStyle = '#65a30d'; // olive avocado green from reference
    ctx.globalAlpha = 0.45;

    // Distinctive craters matching reference image
    [
      // Upper-left large crater
      [-19, -30, 4.5],
      // Mid-left crater
      [-21, -18, 3.6],
      // Lower-left large crater
      [-18, -6, 4.8],
      // Lower-left corner small crater
      [-13, -1, 2.5],
      // Upper-mid forehead small crater
      [-4, -32, 2.8],
      // Upper-right forehead small crater
      [10, -31, 3.2],
      // Mid-right large crater
      [19, -17, 4.6],
      // Lower-right crater
      [17, -5, 3.8],
      // Interior cheek pore
      [-8, -2, 2.4],
      [10, -1, 2.6],
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
      // Blinking lines with curved eyelashes
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(-18, eyeY);
      ctx.lineTo(-1, eyeY);
      ctx.moveTo(1, eyeY);
      ctx.lineTo(18, eyeY);
      ctx.stroke();

      // 3 eyelashes per eye while blinking
      ctx.lineWidth = 2;
      [-14, -9.5, -5].forEach((lx) => {
        ctx.beginPath();
        ctx.moveTo(lx, eyeY);
        ctx.lineTo(lx - 1.5, eyeY - 6);
        ctx.stroke();
      });
      [5, 9.5, 14].forEach((rx) => {
        ctx.beginPath();
        ctx.moveTo(rx, eyeY);
        ctx.lineTo(rx + 1.5, eyeY - 6);
        ctx.stroke();
      });
    } else if (isShocked) {
      // Startled electrified eyes
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(-9.5, eyeY, 9.5, 0, Math.PI * 2);
      ctx.arc(9.5, eyeY, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-9.5, eyeY, 4.2, 0, Math.PI * 2);
      ctx.arc(9.5, eyeY, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Comic shock lightning arcs
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-24, eyeY - 14);
      ctx.lineTo(-16, eyeY - 22);
      ctx.lineTo(-20, eyeY - 28);
      ctx.moveTo(24, eyeY - 14);
      ctx.lineTo(16, eyeY - 22);
      ctx.lineTo(20, eyeY - 28);
      ctx.stroke();
    } else {
      // 🌟 HUGE CARTOON EYES TOUCHING IN CENTER (Exactly matching reference image)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.0;

      // Left Eye
      ctx.beginPath();
      ctx.arc(-9, eyeY, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right Eye
      ctx.beginPath();
      ctx.arc(9, eyeY, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Three thick black eyelashes above each eye (pointing up like sunbeams, per reference)
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#0f172a';
      ctx.lineCap = 'round';

      // Left eye 3 lashes
      [-14.5, -9, -3.5].forEach((lx, idx) => {
        ctx.beginPath();
        ctx.moveTo(lx, eyeY - 9.2);
        const angleOffset = idx === 0 ? -3 : idx === 1 ? 0 : 2.5;
        ctx.lineTo(lx + angleOffset, eyeY - 16.5);
        ctx.stroke();
      });

      // Right eye 3 lashes
      [3.5, 9, 14.5].forEach((rx, idx) => {
        ctx.beginPath();
        ctx.moveTo(rx, eyeY - 9.2);
        const angleOffset = idx === 0 ? -2.5 : idx === 1 ? 0 : 3;
        ctx.lineTo(rx + angleOffset, eyeY - 16.5);
        ctx.stroke();
      });

      // Vibrant cyan / light blue irises (per reference image)
      const lookOffset = this.facing === 'right' ? 1.5 : -1.5;
      ctx.fillStyle = '#06b6d4'; // bright cyan from reference
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-8 + lookOffset, eyeY, 5.0, 0, Math.PI * 2);
      ctx.arc(10 + lookOffset, eyeY, 5.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Large black pupils
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(-8 + lookOffset, eyeY, 3.2, 0, Math.PI * 2);
      ctx.arc(10 + lookOffset, eyeY, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Crisp white catchlight reflection dots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-9.2 + lookOffset, eyeY - 1.6, 1.5, 0, Math.PI * 2);
      ctx.arc(8.8 + lookOffset, eyeY - 1.6, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Pill-Shaped Curved Nose (Overlapping bottom center of eyes, per reference) ---
    ctx.save();
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 2.2;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, -14.5 + bodyY, 3.8, 8.5, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // --- Rosy Bulbous Cheeks & Freckles (Per reference image) ---
    const cheekY = -12.5 + bodyY;

    // Cheerful orange-red blush cheeks
    ctx.fillStyle = 'rgba(249, 115, 22, 0.65)';
    ctx.beginPath();
    ctx.arc(-18, cheekY, 5.5, 0, Math.PI * 2);
    ctx.arc(18, cheekY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Cheek dimple smile creases wrapping around cheeks (from reference)
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2.0;
    // Left cheek dimple
    ctx.beginPath();
    ctx.arc(-18, cheekY, 6.2, Math.PI * 0.7, Math.PI * 1.55);
    ctx.stroke();
    // Right cheek dimple
    ctx.beginPath();
    ctx.arc(18, cheekY, 6.2, -Math.PI * 0.55, Math.PI * 0.3);
    ctx.stroke();

    // Exactly 3 red/orange freckle dots on each cheek (per reference image)
    ctx.fillStyle = '#9a3412';
    [
      [-19.5, cheekY - 1],
      [-17, cheekY + 1.8],
      [-15.5, cheekY - 2],
      [19.5, cheekY - 1],
      [17, cheekY + 1.8],
      [15.5, cheekY - 2],
    ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 1.1, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- Mouth, Smile & Buck Teeth (Per reference image) ---
    const mouthY = -6 + bodyY;

    if (isShocked) {
      // Startled open mouth
      ctx.fillStyle = '#7f1d1d';
      ctx.strokeStyle = '#450a0a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, mouthY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // 🌟 CLASSIC BROAD JOYFUL CRESCENT SMILE (Directly matching reference image)
      ctx.fillStyle = '#450a0a'; // dark maroon/burgundy mouth interior
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      ctx.arc(0, mouthY - 3.5, 14.5, 0.18, Math.PI - 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Soft bright pink curved tongue resting in bottom of mouth
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, mouthY + 5.5, 7.5, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      ctx.stroke();

      // Two iconic square white buck teeth with distinct gap (from reference image)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 1.6;

      // Left buck tooth
      ctx.fillRect(-6.5, mouthY - 3, 5.0, 6.2);
      ctx.strokeRect(-6.5, mouthY - 3, 5.0, 6.2);

      // Right buck tooth
      ctx.fillRect(1.5, mouthY - 3, 5.0, 6.2);
      ctx.strokeRect(1.5, mouthY - 3, 5.0, 6.2);

      // Soft chin dimple curve underneath lower lip (per reference image)
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, mouthY + 11.5, 4.5, Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();
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
      ? -0.85 + Math.sin(this.animTimer * 10) * 0.25
      : 0.15 + Math.sin(this.animTimer * 2) * 0.08;

    const armStartX = 20;
    const armStartY = -4 + bodyY;

    // Slender yellow cartoon noodle arm (per reference)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(armStartX, armStartY);
    const handX = armStartX + 14;
    const handY = isCheering ? armStartY - 14 : armStartY + 5;
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Net connected to hand
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(swingAngle);

    // Authentic bamboo net pole
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
