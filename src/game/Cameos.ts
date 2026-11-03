export class CameoManager {
  public activeCameo: {
    character: 'PATRICK' | 'SQUIDWARD' | 'SANDY' | 'PLANKTON';
    x: number;
    y: number;
    vx: number;
    facing: 'left' | 'right';
    timer: number;
    dialogue: string;
    hasDroppedItem: boolean;
  } | null = null;

  private spawnCooldown = 18; // every 18-25 seconds

  public update(
    dt: number,
    bounds: { width: number; height: number },
    onDropPowerUp: (x: number, y: number) => void
  ) {
    if (!this.activeCameo) {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0) {
        this.triggerRandomCameo(bounds);
        this.spawnCooldown = 22 + Math.random() * 15;
      }
      return;
    }

    const cameo = this.activeCameo;
    cameo.timer += dt;
    cameo.x += cameo.vx * dt;

    // Drop item trigger at middle of screen
    if (
      !cameo.hasDroppedItem &&
      Math.abs(cameo.x - bounds.width / 2) < 40 &&
      (cameo.character === 'PATRICK' || cameo.character === 'SANDY')
    ) {
      cameo.hasDroppedItem = true;
      onDropPowerUp(cameo.x, cameo.y + 20);
    }

    // Despawn when out of bounds
    if (
      (cameo.vx > 0 && cameo.x > bounds.width + 120) ||
      (cameo.vx < 0 && cameo.x < -120)
    ) {
      this.activeCameo = null;
    }
  }

  public triggerRandomCameo(bounds: { width: number; height: number }) {
    const chars: Array<'PATRICK' | 'SQUIDWARD' | 'SANDY' | 'PLANKTON'> = [
      'PATRICK',
      'SQUIDWARD',
      'SANDY',
      'PLANKTON',
    ];
    const char = chars[Math.floor(Math.random() * chars.length)];
    const fromLeft = Math.random() > 0.5;

    let y = 140 + Math.random() * (bounds.height - 300);
    let speed = 70 + Math.random() * 30;
    let dialogue = '';

    if (char === 'PATRICK') {
      dialogue = "I'm jellyfishing too, SpongeBob!";
    } else if (char === 'SQUIDWARD') {
      y = bounds.height - 130;
      speed = 50;
      dialogue = 'Will you keep the noise down?!';
    } else if (char === 'SANDY') {
      speed = 110;
      dialogue = 'Yee-haw! Catch that gold one!';
    } else if (char === 'PLANKTON') {
      y = bounds.height - 110;
      speed = 95;
      dialogue = 'The secret formula is MINE!';
    }

    this.activeCameo = {
      character: char,
      x: fromLeft ? -80 : bounds.width + 80,
      y,
      vx: fromLeft ? speed : -speed,
      facing: fromLeft ? 'right' : 'left',
      timer: 0,
      dialogue,
      hasDroppedItem: false,
    };
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (!this.activeCameo) return;
    const cameo = this.activeCameo;

    ctx.save();
    ctx.translate(cameo.x, cameo.y);

    if (cameo.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Draw speech bubble above character
    if (cameo.timer < 5 && cameo.x > 80 && cameo.x < 1200) {
      ctx.save();
      // Ensure text is not mirrored when facing left
      if (cameo.facing === 'left') {
        ctx.scale(-1, 1);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-75, -55, 150, 26, 8);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(-5, -29);
      ctx.lineTo(0, -22);
      ctx.lineTo(5, -29);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cameo.dialogue, 0, -42);
      ctx.restore();
    }

    // Render Character
    switch (cameo.character) {
      case 'PATRICK': {
        // Starfish Patrick in green-purple floral trunks
        const bob = Math.sin(cameo.timer * 4) * 3;
        ctx.translate(0, bob);

        // Body: pink starfish
        ctx.fillStyle = '#f472b6';
        ctx.strokeStyle = '#db2777';
        ctx.lineWidth = 2;

        // Head point
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.bezierCurveTo(12, -20, 18, -6, 20, 10);
        ctx.lineTo(14, 25);
        ctx.lineTo(-14, 25);
        ctx.bezierCurveTo(-18, -6, -12, -20, 0, -32);
        ctx.fill();
        ctx.stroke();

        // Lime green shorts with purple flowers
        ctx.fillStyle = '#a3e635';
        ctx.beginPath();
        ctx.roundRect(-16, 12, 32, 16, 4);
        ctx.fill();
        ctx.stroke();

        // Purple flowers on shorts
        ctx.fillStyle = '#c084fc';
        [[-8, 18], [6, 21], [0, 24]].forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Eyes & goofy smile
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -16, 4, 0, Math.PI * 2);
        ctx.arc(4, -16, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-3, -16, 1.5, 0, Math.PI * 2);
        ctx.arc(5, -16, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Waving hand
        const wave = Math.sin(cameo.timer * 10) * 0.4;
        ctx.save();
        ctx.translate(14, -2);
        ctx.rotate(wave);
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(14, -10);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'SQUIDWARD': {
        // Turquoise octopus with brown shirt
        ctx.fillStyle = '#67e8f9';
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 2;

        // Big round head
        ctx.beginPath();
        ctx.ellipse(0, -20, 15, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Big droopy nose
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.ellipse(6, -15, 4.5, 11, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Droopy eyelids & yellow eyes
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(-4, -22, 5, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -22, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Half-closed eyelids
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.rect(-9, -26, 10, 4);
        ctx.rect(0, -26, 10, 4);
        ctx.fill();

        // Brown polo shirt
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-11, 0, 22, 16);

        // Tentacle legs
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 3.5;
        [-6, -2, 2, 6].forEach((tx, idx) => {
          const tw = Math.sin(cameo.timer * 8 + idx) * 3;
          ctx.beginPath();
          ctx.moveTo(tx, 16);
          ctx.lineTo(tx + tw, 28);
          ctx.stroke();
        });
        break;
      }
      case 'SANDY': {
        // Sandy in diving suit and glass dome helmet
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-14, -5, 28, 25, 6);
        ctx.fill();
        ctx.stroke();

        // Big glass helmet dome
        const helmetGrad = ctx.createRadialGradient(-4, -20, 4, 0, -20, 18);
        helmetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        helmetGrad.addColorStop(0.8, 'rgba(186, 230, 253, 0.4)');
        helmetGrad.addColorStop(1, 'rgba(56, 189, 248, 0.7)');
        ctx.fillStyle = helmetGrad;
        ctx.strokeStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, -20, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pink flower on helmet
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(12, -34, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(12, -34, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Squirrel face inside helmet
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, -20, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3, -21, 2.5, 0, Math.PI * 2);
        ctx.arc(3, -21, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'PLANKTON': {
        // Tiny green copepod with antenna and giant red eye
        ctx.fillStyle = '#15803d';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.5;

        // Pill body
        ctx.beginPath();
        ctx.roundRect(-6, -14, 12, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Long antennae
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-3, -14);
        ctx.lineTo(-7, -26);
        ctx.moveTo(3, -14);
        ctx.lineTo(7, -26);
        ctx.stroke();

        // Giant single red eye
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -6, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(1, -6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Holding glass bottle with secret formula
        ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        ctx.fillRect(6, -6, 8, 12);
        ctx.strokeRect(6, -6, 8, 12);
        break;
      }
    }

    ctx.restore();
  }
}
