import { CONFIG } from './config.js';
import { ParticleUniverse } from './particles.js';
import { FlowerBlastEngine } from './flowerBlast.js';
import { initPinScreen } from './pin.js';
import { initCatsSection } from './cats.js';
import { initCameraMemory } from './camera.js';
import { initMusicPlayer } from './musicPlayer.js';
import { initCakeCutting } from './cake.js';
import { initLetterSection } from './letter.js';
import { initParallax } from './parallax.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Background Particle Universe
  const canvas = document.getElementById('universeCanvas');
  if (canvas) {
    new ParticleUniverse(canvas);
  }

  // 2. Initialize 3D Flower Blast Engine
  const flowerContainer = document.getElementById('flowerBlastContainer');
  let flowerBlastEngine = null;
  if (flowerContainer) {
    flowerBlastEngine = new FlowerBlastEngine(flowerContainer);
  }

  window.addEventListener('heroHeadingRevealed', () => {
    if (flowerBlastEngine) {
      setTimeout(() => {
        flowerBlastEngine.trigger();
      }, 400);
    }
  });

  // 3. Initialize Section Modules
  initPinScreen();
  initCatsSection();
  initCameraMemory();
  initMusicPlayer();
  initCakeCutting();
  initLetterSection();
  initParallax();

  // 4. Smooth Replay Button in Final Section
  const btnReplay = document.getElementById('btnReplaySurprise');
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  console.log(`✨ Handcrafted Birthday Surprise for ${CONFIG.BIRTHDAY_NAME} initialized successfully ✨`);
});
