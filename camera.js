import { state } from './state.js';

/**
 * Section 4: Camera Memory Coordinator
 * Plays camera sound, triggers cinematic flash, and reveals Photo One & Photo Two sequentially.
 */
export function initCameraMemory() {
  const cameraBtn = document.getElementById('cameraTriggerBtn');
  const flashOverlay = document.getElementById('cameraFlashOverlay');
  const photoCard1 = document.getElementById('photoCard1');
  const photoCard2 = document.getElementById('photoCard2');
  const photoMessage = document.getElementById('photoMemoryMessage');
  const photosContainer = document.getElementById('photosMemoryContainer');

  if (!cameraBtn || !flashOverlay) return;

  cameraBtn.addEventListener('click', () => {
    if (state.get('cameraRevealed')) return;
    state.set('cameraRevealed', true);

    // Play camera shutter sound
    playCameraShutterSound();

    // 1. Camera click animation
    cameraBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
      cameraBtn.style.transform = 'scale(1)';
    }, 150);

    // 2. Cinematic Flash Sequence
    flashOverlay.classList.add('flashing');

    setTimeout(() => {
      flashOverlay.classList.remove('flashing');

      // 3. Reveal Photo 1
      if (photoCard1) {
        photoCard1.classList.add('revealed');
        state.set('photoOneVisible', true);
        createHeartBurstAround(photoCard1);
      }

      // 4. Reveal Photo 2 shortly after
      setTimeout(() => {
        if (photoCard2) {
          photoCard2.classList.add('revealed');
          state.set('photoTwoVisible', true);
          createHeartBurstAround(photoCard2);
        }

        // 5. Reveal Romantic Message
        setTimeout(() => {
          if (photoMessage) {
            photoMessage.classList.add('revealed');
          }
        }, 400);
      }, 600);
    }, 200);
  });

  // Desktop 3D Mouse Tilt for Photos Container
  if (photosContainer && window.matchMedia('(hover: hover)').matches) {
    photosContainer.addEventListener('mousemove', (e) => {
      const rect = photosContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (photoCard1 && photoCard1.classList.contains('revealed')) {
        photoCard1.style.transform = `perspective(1000px) rotateY(${5 + x * 15}deg) rotateX(${-y * 15}deg) rotateZ(-2deg) translateZ(20px)`;
      }
      if (photoCard2 && photoCard2.classList.contains('revealed')) {
        photoCard2.style.transform = `perspective(1000px) rotateY(${-5 + x * 15}deg) rotateX(${-y * 15}deg) rotateZ(2deg) translateZ(20px)`;
      }
    });

    photosContainer.addEventListener('mouseleave', () => {
      if (photoCard1 && photoCard1.classList.contains('revealed')) {
        photoCard1.style.transform = 'perspective(1000px) rotateY(5deg) rotateZ(-2.5deg) scale(1)';
      }
      if (photoCard2 && photoCard2.classList.contains('revealed')) {
        photoCard2.style.transform = 'perspective(1000px) rotateY(-5deg) rotateZ(2.5deg) scale(1)';
      }
    });
  }
}

function playCameraShutterSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // Mechanical snap
    const osc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

    clickGain.gain.setValueAtTime(0, now);
    clickGain.gain.setValueAtTime(0.3, now + 0.07);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(clickGain);
    clickGain.connect(ctx.destination);
    osc.start(now + 0.07);
    osc.stop(now + 0.14);

    // Chime
    const chimeNotes = [1046.50, 1318.51, 1567.98, 2093.00];
    chimeNotes.forEach((freq, idx) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      const startTime = now + 0.22 + idx * 0.08;

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, startTime);
      chimeGain.gain.setValueAtTime(0.001, startTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(startTime);
      chimeOsc.stop(startTime + 0.65);
    });
  } catch (e) {}
}

function createHeartBurstAround(element) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const heart = document.createElement('div');
    heart.textContent = '💗';
    heart.style.position = 'fixed';
    heart.style.left = `${centerX}px`;
    heart.style.top = `${centerY}px`;
    heart.style.fontSize = `${Math.random() * 10 + 16}px`;
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.transition = 'all 1s cubic-bezier(0.1, 0.8, 0.3, 1)';
    heart.style.transform = 'translate(-50%, -50%) scale(0.2)';
    heart.style.opacity = '1';

    document.body.appendChild(heart);

    const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5);
    const dist = Math.random() * 80 + 50;
    const destX = Math.cos(angle) * dist;
    const destY = Math.sin(angle) * dist - 30;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heart.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1)`;
        heart.style.opacity = '0';
      });
    });

    setTimeout(() => {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, 1100);
  }
}
