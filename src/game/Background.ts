interface FlowerCloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  petalCount: number;
}

interface KelpPlant {
  x: number;
  height: number;
  color: string;
  phase: number;
}

export class Background {
  private flowerClouds: FlowerCloud[] = [];
  private kelpPlants: KelpPlant[] = [];
  private ambientBubbles: Array<{ x: number; y: number; r: number; speed: number; wobble: number }> = [];
  private animTimer = 0;

  constructor(width: number, height: number) {
    this.init(width, height);
  }

  public init(width: number, height: number) {
    this.animTimer = 0;
    // Flower clouds (iconic SpongeBob sky flowers)
    const colors = ['#f472b6', '#38bdf8', '#c084fc', '#fde047', '#4ade80'];
    this.flowerClouds = [];
    for (let i = 0; i < 7; i++) {
      this.flowerClouds.push({
        x: Math.random() * width,
        y: 20 + Math.random() * 110,
        size: 24 + Math.random() * 18,
        speed: 10 + Math.random() * 12,
        color: colors[i % colors.length],
        petalCount: 5,
      });
    }

    // Kelp plants on the bottom
    this.kelpPlants = [];
    const kelpCount = Math.floor(width / 70);
    for (let i = 0; i < kelpCount; i++) {
      this.kelpPlants.push({
        x: i * 75 + Math.random() * 25,
        height: 60 + Math.random() * 70,
        color: i % 2 === 0 ? '#15803d' : '#166534',
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Ambient floating bubbles
    this.ambientBubbles = [];
    for (let i = 0; i < 26; i++) {
      this.ambientBubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 3 + Math.random() * 6,
        speed: 25 + Math.random() * 45,
        wobble: Math.random() * Math.PI * 2,
      });
    }
  }

  public update(dt: number, bounds: { width: number; height: number }) {
    this.animTimer += dt;

    // Move flower clouds
    for (const fc of this.flowerClouds) {
      fc.x += fc.speed * dt;
      if (fc.x > bounds.width + 60) {
        fc.x = -60;
        fc.y = 20 + Math.random() * 110;
      }
    }

    // Move ambient bubbles upward
    for (const b of this.ambientBubbles) {
      b.y -= b.speed * dt;
      b.wobble += dt * 3;
      b.x += Math.sin(b.wobble) * 15 * dt;

      if (b.y < -20) {
        b.y = bounds.height + 20;
        b.x = Math.random() * bounds.width;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // 1. Deep tropical ocean water gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#38bdf8'); // sky water cyan
    oceanGrad.addColorStop(0.35, '#0284c7'); // deep azure
    oceanGrad.addColorStop(0.75, '#0369a1'); // ocean blue
    oceanGrad.addColorStop(1, '#075985'); // sandy sea floor
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Underwater sunbeams / caustics filtering down
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 4; i++) {
      const beamX = (width * 0.25 * i) + Math.sin(this.animTimer * 0.8 + i) * 40;
      const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 120, height * 0.85);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      beamGrad.addColorStop(0.6, 'rgba(224, 242, 254, 0.05)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamX - 30, 0);
      ctx.lineTo(beamX + 60, 0);
      ctx.lineTo(beamX + 220, height * 0.85);
      ctx.lineTo(beamX + 70, height * 0.85);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Flower Clouds in the sky water
    for (const fc of this.flowerClouds) {
      this.drawFlowerCloud(ctx, fc.x, fc.y, fc.size, fc.color);
    }

    // 4. Distant Bikini Bottom Landmarks (Pineapple House & Patrick's Rock)
    this.drawDistantLandmarks(ctx, width, height);

    // 5. Far green underwater rolling hills (Jellyfish Fields)
    ctx.save();
    ctx.fillStyle = '#65a30d'; // olive lime
    ctx.beginPath();
    ctx.moveTo(0, height - 90);
    ctx.bezierCurveTo(
      width * 0.25,
      height - 150,
      width * 0.45,
      height - 110,
      width * 0.65,
      height - 165
    );
    ctx.bezierCurveTo(
      width * 0.85,
      height - 120,
      width * 0.95,
      height - 140,
      width,
      height - 110
    );
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. Near green hills with flowers & coral
    ctx.save();
    ctx.fillStyle = '#84cc16'; // bright Jellyfish Fields green
    ctx.beginPath();
    ctx.moveTo(0, height - 55);
    ctx.bezierCurveTo(
      width * 0.3,
      height - 95,
      width * 0.5,
      height - 40,
      width * 0.75,
      height - 90
    );
    ctx.bezierCurveTo(
      width * 0.9,
      height - 70,
      width * 0.96,
      height - 65,
      width,
      height - 50
    );
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 7. Swaying Kelp on the floor
    for (const kelp of this.kelpPlants) {
      this.drawKelp(ctx, kelp, height);
    }

    // 8. Sand bed texture at the very bottom
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, height - 16, width, 16);
    ctx.fillStyle = '#ca8a04';
    for (let s = 10; s < width; s += 24) {
      ctx.beginPath();
      ctx.arc(s, height - 8, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 9. Ambient floating water bubbles
    ctx.save();
    for (const b of this.ambientBubbles) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gleam
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawFlowerCloud(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.55;

    // Petals
    const petals = 5;
    ctx.fillStyle = color;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const px = Math.cos(angle) * (size * 0.65);
      const py = Math.sin(angle) * (size * 0.65);
      ctx.beginPath();
      ctx.arc(px, py, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center hole/ring
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawDistantLandmarks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.globalAlpha = 0.65;

    // Patrick's Rock on the left side
    const rockX = width * 0.12;
    const rockY = height - 100;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(rockX, rockY, 32, 22, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Weather vane arrow on top of Patrick's rock
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rockX, rockY - 22);
    ctx.lineTo(rockX, rockY - 36);
    ctx.moveTo(rockX - 7, rockY - 36);
    ctx.lineTo(rockX + 7, rockY - 36);
    ctx.stroke();

    // SpongeBob's Pineapple silhouette on the right side
    const pineX = width * 0.88;
    const pineY = height - 130;
    // Green leaves on top
    ctx.fillStyle = '#15803d';
    [-10, 0, 10].forEach((lx) => {
      ctx.beginPath();
      ctx.ellipse(pineX + lx, pineY - 26, 6, 16, (lx / 30) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
    // Orange fruit body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(pineX - 22, pineY - 14, 44, 48, 12);
    ctx.fill();
    // Round porthole window
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pineX, pineY + 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawKelp(
    ctx: CanvasRenderingContext2D,
    kelp: KelpPlant,
    height: number
  ) {
    ctx.save();
    ctx.strokeStyle = kelp.color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    const sway = Math.sin(this.animTimer * 2 + kelp.phase) * 16;
    const baseY = height - 14;

    ctx.beginPath();
    ctx.moveTo(kelp.x, baseY);
    ctx.bezierCurveTo(
      kelp.x + sway * 0.5,
      baseY - kelp.height * 0.5,
      kelp.x - sway * 0.5,
      baseY - kelp.height * 0.8,
      kelp.x + sway,
      baseY - kelp.height
    );
    ctx.stroke();

    // Little kelp leaf bulbs
    ctx.fillStyle = kelp.color;
    ctx.beginPath();
    ctx.arc(kelp.x + sway * 0.4, baseY - kelp.height * 0.45, 5, 0, Math.PI * 2);
    ctx.arc(kelp.x - sway * 0.3, baseY - kelp.height * 0.75, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
