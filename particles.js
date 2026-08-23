/**
 * Multi-layered Romantic Particle Universe
 * Renders stars, glowing ambient dust, 3D floating hearts, and drifting petals
 */
export class ParticleUniverse {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.dust = [];
    this.hearts = [];
    this.petals = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.animationFrame = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - this.width / 2) * 0.05;
      this.targetMouseY = (e.clientY - this.height / 2) * 0.05;
    });

    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  createParticles() {
    // 1. Distant Twinkling Stars
    const starCount = Math.min(100, Math.floor(this.width * 0.08));
    this.stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      depth: Math.random() * 0.3 + 0.1
    }));

    // 2. Soft Ambient Dust Particles (Pink, Lavender, Cream)
    const dustColors = ['#ffb6c1', '#d8b4e2', '#ffd1b3', '#fff0f5'];
    const dustCount = Math.min(45, Math.floor(this.width * 0.04));
    this.dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 2.5 + 1,
      color: dustColors[Math.floor(Math.random() * dustColors.length)],
      alpha: Math.random() * 0.4 + 0.1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.1,
      depth: Math.random() * 0.6 + 0.2
    }));

    // 3. Floating 3D Hearts (Different depths, sizes, opacities)
    const heartCount = 18;
    this.hearts = Array.from({ length: heartCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height + this.height,
      size: Math.random() * 14 + 10,
      alpha: Math.random() * 0.45 + 0.15,
      color: Math.random() > 0.4 ? '#ff7597' : '#d8b4e2',
      vy: Math.random() * 0.6 + 0.3,
      oscillation: Math.random() * 100,
      oscillationSpeed: Math.random() * 0.02 + 0.01,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      depth: Math.random() * 0.8 + 0.4
    }));

    // 4. Drifting Flower Petals
    const petalCount = 14;
    this.petals = Array.from({ length: petalCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 10 + 6,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? '#ffb3c6' : '#ffccd5',
      vy: Math.random() * 0.5 + 0.2,
      vx: Math.random() * 0.4 + 0.1,
      angle: Math.random() * 360,
      angleSpeed: (Math.random() - 0.5) * 1.5,
      depth: Math.random() * 0.7 + 0.3
    }));
  }

  drawHeart(ctx, x, y, size, color, alpha, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // top left curve
    ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, size / 3, 0, size);
    // top right curve
    ctx.bezierCurveTo(size, size / 3, size / 2, -topCurveHeight, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPetal(ctx, x, y, size, color, alpha, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth Mouse Lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // 1. Draw & Update Stars
    this.stars.forEach(star => {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 0.9 || star.alpha < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = star.alpha;
      this.ctx.beginPath();
      const px = star.x + this.mouseX * star.depth;
      const py = star.y + this.mouseY * star.depth;
      this.ctx.arc(px, py, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Draw & Update Dust Particles
    this.dust.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10) p.y = this.height + 10;
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      const px = p.x + this.mouseX * p.depth;
      const py = p.y + this.mouseY * p.depth;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 3. Draw & Update Floating 3D Hearts
    this.hearts.forEach(h => {
      h.y -= h.vy;
      h.oscillation += h.oscillationSpeed;
      h.rotation += h.rotSpeed;

      const currentX = h.x + Math.sin(h.oscillation) * 20 + this.mouseX * h.depth;
      const currentY = h.y + this.mouseY * h.depth;

      this.drawHeart(this.ctx, currentX, currentY, h.size, h.color, h.alpha, h.rotation);

      if (h.y < -30) {
        h.y = this.height + 30;
        h.x = Math.random() * this.width;
      }
    });

    // 4. Draw & Update Petals
    this.petals.forEach(pt => {
      pt.y += pt.vy;
      pt.x += Math.sin(pt.y * 0.01) * 0.8;
      pt.angle += pt.angleSpeed;

      const currentX = pt.x + this.mouseX * pt.depth;
      const currentY = pt.y + this.mouseY * pt.depth;

      this.drawPetal(this.ctx, currentX, currentY, pt.size, pt.color, pt.alpha, pt.angle);

      if (pt.y > this.height + 20) {
        pt.y = -20;
        pt.x = Math.random() * this.width;
      }
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
