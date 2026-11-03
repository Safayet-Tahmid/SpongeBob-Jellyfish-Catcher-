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
    // Classic 2000s cartoon sky flower clouds
    const colors = ['#f472b6', '#38bdf8', '#c084fc', '#fde047', '#4ade80'];
    this.flowerClouds = [];
    for (let i = 0; i < 7; i++) {
      this.flowerClouds.push({
        x: Math.random() * width,
        y: 20 + Math.random() * 110,
        size: 26 + Math.random() * 20,
        speed: 8 + Math.random() * 10,
        color: colors[i % colors.length],
        petalCount: 5,
      });
    }

    // Kelp plants
    this.kelpPlants = [];
    const kelpCount = Math.floor(width / 65);
    for (let i = 0; i < kelpCount; i++) {
      this.kelpPlants.push({
        x: i * 70 + Math.random() * 25,
        height: 65 + Math.random() * 75,
        color: i % 2 === 0 ? '#15803d' : '#166534',
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Ambient floating water bubbles
    this.ambientBubbles = [];
    for (let i = 0; i < 28; i++) {
      this.ambientBubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 3 + Math.random() * 6.5,
        speed: 22 + Math.random() * 40,
        wobble: Math.random() * Math.PI * 2,
      });
    }
  }

  public update(dt: number, bounds: { width: number; height: number }) {
    this.animTimer += dt;

    // Flower clouds drift
    for (const fc of this.flowerClouds) {
      fc.x += fc.speed * dt;
      if (fc.x > bounds.width + 70) {
        fc.x = -70;
        fc.y = 20 + Math.random() * 110;
      }
    }

    // Bubbles float upward
    for (const b of this.ambientBubbles) {
      b.y -= b.speed * dt;
      b.wobble += dt * 2.8;
      b.x += Math.sin(b.wobble) * 14 * dt;

      if (b.y < -20) {
        b.y = bounds.height + 20;
        b.x = Math.random() * bounds.width;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // 1. Classic 2000s Bikini Bottom sky-water gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    oceanGrad.addColorStop(0, '#38bdf8'); // warm azure cyan
    oceanGrad.addColorStop(0.35, '#0284c7'); // tropical ocean
    oceanGrad.addColorStop(0.7, '#0369a1'); // deep cartoon water
    oceanGrad.addColorStop(1, '#075985'); // sandy sea-bed transition
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Soft underwater caustics / sunlight ribbons
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 4; i++) {
      const beamX = width * 0.25 * i + Math.sin(this.animTimer * 0.7 + i) * 35;
      const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 110, height * 0.85);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      beamGrad.addColorStop(0.6, 'rgba(224, 242, 254, 0.04)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamX - 30, 0);
      ctx.lineTo(beamX + 50, 0);
      ctx.lineTo(beamX + 200, height * 0.85);
      ctx.lineTo(beamX + 60, height * 0.85);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Iconic SpongeBob Flower Clouds
    for (const fc of this.flowerClouds) {
      this.drawFlowerCloud(ctx, fc.x, fc.y, fc.size, fc.color);
    }

    // 4. Distant Neighborhood Landmarks (Patrick's Rock, Squidward's Moai, SpongeBob's Pineapple)
    this.drawDistantLandmarks(ctx, width, height);

    // 5. Far Background Hills (Deep Olive Green)
    ctx.save();
    ctx.fillStyle = '#4d7c0f'; // deep olive
    ctx.beginPath();
    ctx.moveTo(0, height - 100);
    ctx.bezierCurveTo(
      width * 0.22,
      height - 165,
      width * 0.42,
      height - 120,
      width * 0.62,
      height - 180
    );
    ctx.bezierCurveTo(
      width * 0.82,
      height - 130,
      width * 0.94,
      height - 150,
      width,
      height - 120
    );
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. Midground Rolling Hills with Purple Sea Flower Patches
    ctx.save();
    ctx.fillStyle = '#65a30d'; // warm meadow green
    ctx.beginPath();
    ctx.moveTo(0, height - 70);
    ctx.bezierCurveTo(
      width * 0.28,
      height - 125,
      width * 0.52,
      height - 65,
      width * 0.72,
      height - 120
    );
    ctx.bezierCurveTo(
      width * 0.88,
      height - 85,
      width * 0.95,
      height - 80,
      width,
      height - 65
    );
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Purple & orange sea flower patches on hills (iconic cartoon hill markers)
    this.drawHillFlowerPatches(ctx, width, height);
    ctx.restore();

    // 7. Foreground Vibrant Green Hills (Jellyfish Fields)
    ctx.save();
    ctx.fillStyle = '#84cc16'; // bright lime cartoon green
    ctx.beginPath();
    ctx.moveTo(0, height - 48);
    ctx.bezierCurveTo(
      width * 0.32,
      height - 82,
      width * 0.55,
      height - 35,
      width * 0.78,
      height - 75
    );
    ctx.bezierCurveTo(
      width * 0.92,
      height - 58,
      width * 0.97,
      height - 52,
      width,
      height - 42
    );
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 8. Seafloor Coral Formations & Sea Anemones
    this.drawCoralsAndAnemones(ctx, width, height);

    // 9. Swaying Kelp Plants
    for (const kelp of this.kelpPlants) {
      this.drawKelp(ctx, kelp, height);
    }

    // 10. Warm Sand Bed at the very bottom
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, height - 16, width, 16);
    ctx.fillStyle = '#ca8a04';
    for (let s = 12; s < width; s += 26) {
      ctx.beginPath();
      ctx.arc(s, height - 8, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 11. Ambient Floating Water Bubbles with Specular Highlights
    ctx.save();
    for (const b of this.ambientBubbles) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Specular gleam
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, Math.PI * 2);
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

    // 5 Petals
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

    // Center circular aperture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawHillFlowerPatches(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    // Purple & coral cartoon flower patches on the hills
    const spots = [
      [width * 0.18, height - 95, '#c084fc'],
      [width * 0.44, height - 70, '#f472b6'],
      [width * 0.68, height - 100, '#c084fc'],
      [width * 0.86, height - 75, '#fb923c'],
    ];

    spots.forEach(([sx, sy, col]) => {
      ctx.save();
      ctx.fillStyle = col as string;
      const numPetals = 4;
      for (let p = 0; p < numPetals; p++) {
        const ang = (p / numPetals) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(
          (sx as number) + Math.cos(ang) * 4,
          (sy as number) + Math.sin(ang) * 4,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sx as number, sy as number, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private drawDistantLandmarks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.globalAlpha = 0.7;

    // 1. Patrick's Rock on the left
    const rockX = width * 0.11;
    const rockY = height - 105;
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(rockX, rockY, 34, 23, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Weather vane arrow
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rockX, rockY - 23);
    ctx.lineTo(rockX, rockY - 38);
    ctx.moveTo(rockX - 8, rockY - 38);
    ctx.lineTo(rockX + 8, rockY - 38);
    ctx.stroke();

    // 2. Squidward's Moai Easter Island House in middle distance
    const moaiX = width * 0.52;
    const moaiY = height - 120;
    ctx.fillStyle = '#0891b2'; // stone turquoise
    ctx.strokeStyle = '#164e63';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(moaiX - 16, moaiY - 35, 32, 50, [12, 12, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Brow & Eyes
    ctx.fillStyle = '#155e75';
    ctx.fillRect(moaiX - 14, moaiY - 22, 28, 4);
    // Porthole eyes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(moaiX - 7, moaiY - 14, 4.5, 0, Math.PI * 2);
    ctx.arc(moaiX + 7, moaiY - 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#0891b2';
    ctx.fillRect(moaiX - 4, moaiY - 14, 8, 16);
    ctx.strokeRect(moaiX - 4, moaiY - 14, 8, 16);

    // 3. SpongeBob's Pineapple House on the right
    const pineX = width * 0.89;
    const pineY = height - 135;

    // Green leaves
    ctx.fillStyle = '#15803d';
    [-12, -4, 4, 12].forEach((lx) => {
      ctx.beginPath();
      ctx.ellipse(pineX + lx, pineY - 28, 6.5, 17, (lx / 28) * 0.65, 0, Math.PI * 2);
      ctx.fill();
    });

    // Orange fruit body
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pineX - 23, pineY - 15, 46, 52, 14);
    ctx.fill();
    ctx.stroke();

    // Diagonal crosshatching for pineapple texture
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.2;
    for (let c = -16; c <= 16; c += 10) {
      ctx.beginPath();
      ctx.moveTo(pineX + c - 8, pineY - 10);
      ctx.lineTo(pineX + c + 8, pineY + 30);
      ctx.moveTo(pineX + c + 8, pineY - 10);
      ctx.lineTo(pineX + c - 8, pineY + 30);
      ctx.stroke();
    }

    // Metal porthole window
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(pineX, pineY + 6, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawCoralsAndAnemones(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    ctx.save();

    // Left trumpet coral
    const c1X = width * 0.22;
    const c1Y = height - 28;
    ctx.fillStyle = '#f43f5e';
    [
      [-8, 0, 16],
      [0, -4, 22],
      [8, 2, 18],
    ].forEach(([dx, dy, h]) => {
      ctx.beginPath();
      ctx.roundRect(c1X + dx - 3, c1Y + dy - h, 6, h, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c1X + dx, c1Y + dy - h, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fda4af';
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
    });

    // Right purple sea anemone
    const a1X = width * 0.76;
    const a1Y = height - 26;
    ctx.fillStyle = '#a855f7';
    for (let i = -12; i <= 12; i += 5) {
      const sway = Math.sin(this.animTimer * 2 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(a1X + i, a1Y);
      ctx.quadraticCurveTo(a1X + i + sway, a1Y - 14, a1X + i + sway * 1.5, a1Y - 20);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#c084fc';
      ctx.stroke();
    }

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

    const sway = Math.sin(this.animTimer * 1.8 + kelp.phase) * 16;
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

    // Leaf bulbs
    ctx.fillStyle = kelp.color;
    ctx.beginPath();
    ctx.arc(kelp.x + sway * 0.4, baseY - kelp.height * 0.45, 5.5, 0, Math.PI * 2);
    ctx.arc(kelp.x - sway * 0.3, baseY - kelp.height * 0.75, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
