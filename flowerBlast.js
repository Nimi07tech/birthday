import { state } from './state.js';

/**
 * Dramatic Romantic 3D Flower Blast Engine
 * Triggered once after the "Happiest Birthday, Sanjana" heading appears.
 */
export class FlowerBlastEngine {
  constructor(container) {
    this.container = container;
    this.isTriggered = false;
  }

  trigger() {
    if (this.isTriggered || state.get('flowerBlastPlayed')) return;
    this.isTriggered = true;
    state.set('flowerBlastPlayed', true);

    const glowBackdrop = document.querySelector('.hero-glow-backdrop');
    if (glowBackdrop) glowBackdrop.classList.add('active');

    // Create 3D burst particles (Petals, Blossom Flowers, Mini Hearts, Sparkles)
    const particleCount = window.innerWidth < 768 ? 40 : 75;
    const colors = ['#ff9ebb', '#ff4d79', '#d8b4e2', '#ffd1b3', '#ffffff', '#ffb6c1'];

    for (let i = 0; i < particleCount; i++) {
      this.create3DParticle(i, particleCount, colors);
    }
  }

  create3DParticle(index, total, colors) {
    const el = document.createElement('div');
    el.className = 'blast-petal';

    const type = Math.random();
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.floor(Math.random() * 22 + 12);

    if (type < 0.45) {
      // 1. Soft Oval Petal
      el.style.width = `${size}px`;
      el.style.height = `${size * 1.5}px`;
      el.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
      el.style.background = `linear-gradient(135deg, ${color}, rgba(255,255,255,0.8))`;
      el.style.boxShadow = `0 0 10px ${color}`;
    } else if (type < 0.75) {
      // 2. Mini Glowing Heart
      el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      el.style.filter = `drop-shadow(0 0 8px ${color})`;
    } else {
      // 3. Four-point Golden/White Sparkle
      el.innerHTML = `<svg viewBox="0 0 24 24" width="${size * 1.2}" height="${size * 1.2}" fill="#ffe066"><path d="M12 0l3.09 8.91L24 12l-8.91 3.09L12 24l-3.09-8.91L0 12l8.91-3.09z"/></svg>`;
      el.style.filter = 'drop-shadow(0 0 12px #ffe066)';
    }

    // Radial Physics Calculation
    const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = Math.random() * (window.innerWidth * 0.45) + 80;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance - (Math.random() * 60 + 20); // slightly upward bias
    const targetZ = (Math.random() - 0.5) * 400; // 3D depth towards/away from viewer

    const rotX = (Math.random() - 0.5) * 720;
    const rotY = (Math.random() - 0.5) * 720;
    const rotZ = (Math.random() - 0.5) * 720;
    const duration = Math.random() * 1.8 + 2.2; // 2.2s - 4.0s
    const delay = Math.random() * 0.2;

    // Start Position: Center behind heading
    el.style.position = 'absolute';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) translate3d(0,0,0) scale(0.2)';
    el.style.transition = `all ${duration}s cubic-bezier(0.12, 0.8, 0.32, 1) ${delay}s`;

    this.container.appendChild(el);

    // Trigger explosive expansion in next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = `translate(-50%, -50%) translate3d(${targetX}px, ${targetY}px, ${targetZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(1)`;
      });
    });

    // After blast finishes, transition particles to gentle floating and clean up
    setTimeout(() => {
      el.style.transition = 'opacity 1.5s ease, transform 3s ease';
      el.style.transform = `translate(-50%, -50%) translate3d(${targetX + (Math.random() - 0.5) * 40}px, ${targetY + 80}px, ${targetZ}px) scale(0.8)`;
      el.style.opacity = '0';

      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 3500);
    }, (duration + delay) * 1000);
  }
}
