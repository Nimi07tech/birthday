/**
 * Sanjana's Birthday Website - Main JavaScript Bundle
 * Handcrafted to run standalone on file:/// protocol and http/https servers.
 */
(function () {
  'use strict';

  /* ==========================================================================
     1. CONFIGURATION (Single Source of Truth)
     ========================================================================== */
  const CONFIG = {
    BIRTHDAY_NAME: "Sanjana",
    WELCOME_PIN: "1010", // ONLY PIN on the website!

    SONG_TITLE: "Perfect",
    SONG_ARTIST: "Ed Sheeran",
    SONG_PATH: "Edd_Sheeran_-_Perfect_(mp3.pm).mp3",
    SONG_COVER: "Ed_Sheeran_Perfect_Single_cover.jpg",

    PHOTO_ONE: "WhatsApp Image 2026-08-23 at 10.47.03 PM.jpeg",
    PHOTO_TWO: "WhatsApp Image 2026-08-23 at 11.02.49 PM.jpeg",
    FINAL_PHOTO: "WhatsApp Image 2026-08-23 at 10.47.03 PM.jpeg",

              LETTER_TITLE: "Dearest Sanjana,",
                LETTER_CONTENT: `Happy Birthday to someone who brings an inexplicable amount of warmth, light, and magic into this world! ✨

On your special day, I wanted to create something truly unique and handcrafted just for you—a little universe celebrating your beauty, your kindness, and every smile you share.

May this new year of your life be filled with unforgettable adventures, quiet moments of pure peace, boundless laughter, and all the dreams your heart has ever wished for.

You deserve all the stars in the night sky and all the flowers in bloom today and always.`,
                  SIGNATURE: "With all my love & endless smiles, 💗",

                    HERO_SUBTITLE: "Today is your special day.",
                      CAMERA_MESSAGE_1: "I saved these moments for you.",
                        CAMERA_MESSAGE_2: "Some memories deserve a little extra sparkle. 💗",
                          CAKE_WISH: "Yay! Make a wish, Sanjana! 🎂✨",
                            FINAL_MESSAGE_1: "Thank you for being you.",
                              FINAL_MESSAGE_2: "Some moments are meant to be remembered forever. 🌙"
};

/* ==========================================================================
   2. REACTIVE STATE MANAGER
   ========================================================================== */
class StateManager {
  constructor() {
    this.state = {
      pinUnlocked: false,
      flowerBlastPlayed: false,
      cameraRevealed: false,
      photoOneVisible: false,
      photoTwoVisible: false,
      musicPlaying: false,
      cakeCut: false,
      celebrationPlayed: false,
      letterRevealed: false,
      currentAudioTime: 0,
      audioDuration: 263,
      isCutting: false,
    };
    this.listeners = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    if (this.state[key] !== value) {
      this.state[key] = value;
      this.notify(key, value);
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key).delete(callback);
  }

  notify(key, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(cb => {
        try { cb(value); } catch (e) { console.error(e); }
      });
    }
  }
}

const state = new StateManager();

/* ==========================================================================
   3. GLOBAL AUDIO CONTROLLER (With Web Audio Synthesizer Fallback)
   ========================================================================== */
class AudioController {
  constructor() {
    this.audio = new Audio();
    this.audio.src = CONFIG.SONG_PATH;
    this.audio.preload = 'auto';
    this.audioContext = null;
    this.synthPlaying = false;
    this.synthInterval = null;
    this.isUsingFallback = false;

    this.initEvents();
  }

  initEvents() {
    this.audio.addEventListener('timeupdate', () => {
      if (!this.isUsingFallback) {
        state.set('currentAudioTime', this.audio.currentTime);
        if (this.audio.duration && !isNaN(this.audio.duration)) {
          state.set('audioDuration', this.audio.duration);
        }
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio.duration && !isNaN(this.audio.duration)) {
        state.set('audioDuration', this.audio.duration);
      }
    });

    this.audio.addEventListener('ended', () => {
      state.set('musicPlaying', false);
    });

    this.audio.addEventListener('error', () => {
      this.isUsingFallback = true;
    });
  }

  async play() {
    if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try { await this.audioContext.resume(); } catch (e) { }
    }

    if (!this.isUsingFallback) {
      try {
        await this.audio.play();
        state.set('musicPlaying', true);
        return true;
      } catch (err) {
        this.isUsingFallback = true;
        this.startRomanticSynth();
        state.set('musicPlaying', true);
        return true;
      }
    } else {
      this.startRomanticSynth();
      state.set('musicPlaying', true);
      return true;
    }
  }

  pause() {
    if (!this.isUsingFallback) {
      this.audio.pause();
    } else {
      this.stopRomanticSynth();
    }
    state.set('musicPlaying', false);
  }

  toggle() {
    if (state.get('musicPlaying')) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    if (!this.isUsingFallback) {
      this.audio.currentTime = seconds;
    }
    state.set('currentAudioTime', seconds);
  }

  setVolume(vol) {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  startRomanticSynth() {
    if (this.synthPlaying) return;
    this.synthPlaying = true;

    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }

    const melodyChords = [
      [196.00, 246.94, 293.66, 392.00], // G major
      [164.81, 246.94, 329.63, 392.00], // E minor
      [130.81, 261.63, 329.63, 392.00], // C major
      [146.83, 220.00, 293.66, 369.99]  // D major
    ];

    let chordIdx = 0;
    let noteIdx = 0;
    let syntheticTime = state.get('currentAudioTime') || 0;

    this.synthInterval = setInterval(() => {
      if (!this.synthPlaying || !this.audioContext) return;

      const chord = melodyChords[chordIdx];
      const freq = chord[noteIdx];
      this.playSynthNote(freq);

      noteIdx++;
      if (noteIdx >= chord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % melodyChords.length;
      }

      syntheticTime = (syntheticTime + 0.38) % (state.get('audioDuration') || 263);
      state.set('currentAudioTime', syntheticTime);
    }, 380);
  }

  playSynthNote(frequency) {
    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    } catch (e) { }
  }

  stopRomanticSynth() {
    this.synthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }
}

const audioController = new AudioController();

/* ==========================================================================
   4. PARTICLE UNIVERSE (Canvas Engine)
   ========================================================================== */
class ParticleUniverse {
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
    this.canvas.width = this.width * (window.devicePixelRatio || 1);
    this.canvas.height = this.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  createParticles() {
    const starCount = Math.min(100, Math.floor(this.width * 0.08));
    this.stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      depth: Math.random() * 0.3 + 0.1
    }));

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

    this.hearts = Array.from({ length: 18 }, () => ({
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

    this.petals = Array.from({ length: 14 }, () => ({
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
    ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, size / 3, 0, size);
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

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Stars
    this.stars.forEach(star => {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 0.9 || star.alpha < 0.2) star.twinkleSpeed = -star.twinkleSpeed;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = star.alpha;
      this.ctx.beginPath();
      this.ctx.arc(star.x + this.mouseX * star.depth, star.y + this.mouseY * star.depth, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Dust
    this.dust.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) p.y = this.height + 10;
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x + this.mouseX * p.depth, p.y + this.mouseY * p.depth, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Floating Hearts
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

    // Drifting Petals
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

    requestAnimationFrame(() => this.animate());
  }
}

/* ==========================================================================
   5. 3D FLOWER BLAST ENGINE
   ========================================================================== */
class FlowerBlastEngine {
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
      el.style.width = `${size}px`;
      el.style.height = `${size * 1.5}px`;
      el.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
      el.style.background = `linear-gradient(135deg, ${color}, rgba(255,255,255,0.8))`;
      el.style.boxShadow = `0 0 10px ${color}`;
    } else if (type < 0.75) {
      el.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      el.style.filter = `drop-shadow(0 0 8px ${color})`;
    } else {
      el.innerHTML = `<svg viewBox="0 0 24 24" width="${size * 1.2}" height="${size * 1.2}" fill="#ffe066"><path d="M12 0l3.09 8.91L24 12l-8.91 3.09L12 24l-3.09-8.91L0 12l8.91-3.09z"/></svg>`;
      el.style.filter = 'drop-shadow(0 0 12px #ffe066)';
    }

    const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = Math.random() * (window.innerWidth * 0.45) + 80;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance - (Math.random() * 60 + 20);
    const targetZ = (Math.random() - 0.5) * 400;

    const rotX = (Math.random() - 0.5) * 720;
    const rotY = (Math.random() - 0.5) * 720;
    const rotZ = (Math.random() - 0.5) * 720;
    const duration = Math.random() * 1.8 + 2.2;
    const delay = Math.random() * 0.2;

    el.style.position = 'absolute';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) translate3d(0,0,0) scale(0.2)';
    el.style.transition = `all ${duration}s cubic-bezier(0.12, 0.8, 0.32, 1) ${delay}s`;

    this.container.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = `translate(-50%, -50%) translate3d(${targetX}px, ${targetY}px, ${targetZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(1)`;
      });
    });

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

/* ==========================================================================
   5.5 SOUND EFFECTS SYNTHESIZER (Camera Shutter & Tactile Clicks)
   ========================================================================== */
function getAudioCtx() {
  if (!window.audioCtxInstance && (window.AudioContext || window.webkitAudioContext)) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    window.audioCtxInstance = new AudioCtx();
  }
  if (window.audioCtxInstance && window.audioCtxInstance.state === 'suspended') {
    window.audioCtxInstance.resume().catch(() => { });
  }
  return window.audioCtxInstance;
}

function playKeypadTapSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) { }
}

function playCameraShutterSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Initial Shutter Blade Snap (Noise Burst)
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

    // 2. Secondary Mechanical Click (0.07s later)
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

    // 3. Magical Sparkle Chime (Photo Reveal)
    const chimeNotes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
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
  } catch (e) {
    console.warn('Camera sound synthesis error:', e);
  }
}

/* ==========================================================================
   6. SECTION 1: SECRET PIN & KEYPAD HANDLER
   ========================================================================== */
function initPinScreen() {
  const pinScreen = document.getElementById('pinScreen');
  const pinSlots = Array.from(document.querySelectorAll('.pin-slot'));
  const pinIndicatorsRow = document.getElementById('pinIndicatorsRow');
  const pinMessage = document.getElementById('pinMessage');
  const keypad = document.getElementById('pinKeypad');

  if (!pinScreen || pinSlots.length === 0) return;

  let enteredDigits = [];

  function updateSlots() {
    pinSlots.forEach((slot, idx) => {
      if (idx < enteredDigits.length) {
        slot.classList.add('filled');
      } else {
        slot.classList.remove('filled');
      }
    });
  }

  function addDigit(digit) {
    if (enteredDigits.length < 4) {
      playKeypadTapSound();
      enteredDigits.push(digit);
      updateSlots();

      if (enteredDigits.length === 4) {
        validatePin();
      }
    }
  }

  function removeDigit() {
    if (enteredDigits.length > 0) {
      playKeypadTapSound();
      enteredDigits.pop();
      updateSlots();
      clearMessage();
    }
  }

  function clearDigits() {
    playKeypadTapSound();
    enteredDigits = [];
    updateSlots();
    clearMessage();
  }

  function validatePin() {
    const entered = enteredDigits.join('');

    if (entered === CONFIG.WELCOME_PIN) {
      // SUCCESS
      showMessage('Opening your birthday surprise... ✨', 'success');
      pinScreen.classList.add('success');

      audioController.play();

      setTimeout(() => {
        pinScreen.classList.add('unlocked');
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
          mainContent.classList.add('unlocked');
        }
        state.set('pinUnlocked', true);

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('heroHeadingRevealed'));
        }, 1200);
      }, 900);
    } else {
      // ERROR
      if (pinIndicatorsRow) pinIndicatorsRow.classList.add('error');
      showMessage('Almost... try again 💗', 'error');

      setTimeout(() => {
        if (pinIndicatorsRow) pinIndicatorsRow.classList.remove('error');
        enteredDigits = [];
        updateSlots();
      }, 800);
    }
  }

  function showMessage(text, type) {
    if (!pinMessage) return;
    pinMessage.textContent = text;
    pinMessage.className = `pin-message ${type}`;
  }

  function clearMessage() {
    if (!pinMessage) return;
    pinMessage.textContent = '';
    pinMessage.className = 'pin-message';
  }

  // Keypad Click Event Delegation
  if (keypad) {
    keypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.keypad-btn');
      if (!btn) return;
      const key = btn.getAttribute('data-key');
      if (key === 'clear') {
        clearDigits();
      } else if (key === 'backspace') {
        removeDigit();
      } else if (/^[0-9]$/.test(key)) {
        addDigit(key);
      }
    });
  }

  // Physical Keyboard Support
  window.addEventListener('keydown', (e) => {
    if (state.get('pinUnlocked')) return;

    if (/^[0-9]$/.test(e.key)) {
      addDigit(e.key);
    } else if (e.key === 'Backspace') {
      removeDigit();
    } else if (e.key === 'Escape' || e.key === 'Delete') {
      clearDigits();
    } else if (e.key === 'Enter' && enteredDigits.length === 4) {
      validatePin();
    }
  });
}

/* ==========================================================================
   7. SECTION 3: KAWAII CATS WORLD
   ========================================================================== */
function initCatsSection() {
  const catCards = document.querySelectorAll('.cat-card');
  if (catCards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        catCards.forEach((card, idx) => {
          setTimeout(() => {
            card.classList.add('revealed');
          }, idx * 180);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const catsSection = document.getElementById('catsSection');
  if (catsSection) observer.observe(catsSection);

  catCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      const emojis = ['✨', '💗', '🎂', '🐾', '🎀', '🌸', '⭐'];
      const x = e.clientX || (card.getBoundingClientRect().left + 80);
      const y = e.clientY || (card.getBoundingClientRect().top + 80);

      for (let i = 0; i < 6; i++) {
        const el = document.createElement('div');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.position = 'fixed';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.fontSize = `${Math.random() * 14 + 16}px`;
        el.style.pointerEvents = 'none';
        el.style.zIndex = '9999';
        el.style.transition = 'all 0.9s cubic-bezier(0.2, 0.8, 0.3, 1)';
        el.style.transform = 'translate(-50%, -50%) scale(0.5)';
        el.style.opacity = '1';

        document.body.appendChild(el);

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 60 + 30;
        const destX = Math.cos(angle) * dist;
        const destY = Math.sin(angle) * dist - 40;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.1)`;
            el.style.opacity = '0';
          });
        });

        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 950);
      }
    });
  });
}

/* ==========================================================================
   8. SECTION 4: CAMERA MEMORY & TWO PHOTOS
   ========================================================================== */
function initCameraMemory() {
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

    // Play authentic camera shutter click sound
    playCameraShutterSound();

    cameraBtn.style.transform = 'scale(0.9)';
    setTimeout(() => { cameraBtn.style.transform = 'scale(1)'; }, 150);

    flashOverlay.classList.add('flashing');

    setTimeout(() => {
      flashOverlay.classList.remove('flashing');

      if (photoCard1) {
        photoCard1.classList.add('revealed');
        state.set('photoOneVisible', true);
        createHeartBurstAround(photoCard1);
      }

      setTimeout(() => {
        if (photoCard2) {
          photoCard2.classList.add('revealed');
          state.set('photoTwoVisible', true);
          createHeartBurstAround(photoCard2);
        }

        setTimeout(() => {
          if (photoMessage) photoMessage.classList.add('revealed');
        }, 400);
      }, 600);
    }, 200);
  });

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

      const angle = (i / 8) * Math.PI * 2;
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
}

/* ==========================================================================
   9. SECTION 5: "PERFECT" MUSIC PLAYER (NO PIN, NATURAL SCROLL)
   ========================================================================== */
function initMusicPlayer() {
  const btnPlay = document.getElementById('btnMusicPlay');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const progressWrap = document.getElementById('progressBarWrap');
  const progressFill = document.getElementById('progressBarFill');
  const timeCurrent = document.getElementById('timeCurrent');
  const timeTotal = document.getElementById('timeTotal');
  const equalizer = document.getElementById('equalizerBars');
  const btnRewind = document.getElementById('btnMusicRewind');
  const btnForward = document.getElementById('btnMusicForward');
  const volumeSlider = document.getElementById('volumeSlider');
  const btnVolumeMute = document.getElementById('btnVolumeMuteToggle');
  const playerCard = document.getElementById('musicPlayerCard') || document.querySelector('.music-player-card');
  const albumCoverWrap = document.getElementById('albumCoverWrap');
  const btnFavorite = document.getElementById('btnSongFavorite');

  if (!btnPlay) return;

  // Toggle playback
  btnPlay.addEventListener('click', () => {
    audioController.toggle();
  });

  // Album cover click also toggles music
  if (albumCoverWrap) {
    albumCoverWrap.style.cursor = 'pointer';
    albumCoverWrap.addEventListener('click', () => {
      audioController.toggle();
    });
  }

  // Rewind 10s
  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      const cur = state.get('currentAudioTime') || 0;
      audioController.seek(Math.max(0, cur - 10));
    });
  }

  // Forward 10s
  if (btnForward) {
    btnForward.addEventListener('click', () => {
      const cur = state.get('currentAudioTime') || 0;
      const dur = state.get('audioDuration') || 263;
      audioController.seek(Math.min(dur, cur + 10));
    });
  }

  // Romantic Favorite Heart Button with particle burst
  if (btnFavorite) {
    btnFavorite.addEventListener('click', (e) => {
      btnFavorite.classList.toggle('active');
      const isFav = btnFavorite.classList.contains('active');

      // Spawn burst of romantic hearts & sparkles
      const rect = btnFavorite.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const emojis = isFav ? ['💗', '💖', '✨', '🌸', '⭐'] : ['✨'];

      for (let i = 0; i < (isFav ? 8 : 4); i++) {
        const el = document.createElement('div');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.position = 'fixed';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.fontSize = `${Math.random() * 12 + 14}px`;
        el.style.pointerEvents = 'none';
        el.style.zIndex = '9999';
        el.style.transform = 'translate(-50%, -50%) scale(0.4)';
        el.style.transition = 'all 0.9s cubic-bezier(0.12, 0.8, 0.32, 1)';
        el.style.opacity = '1';

        document.body.appendChild(el);

        const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const dist = Math.random() * 50 + 35;
        const destX = Math.cos(angle) * dist;
        const destY = Math.sin(angle) * dist - 25;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.15)`;
            el.style.opacity = '0';
          });
        });

        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 950);
      }
    });
  }

  // Music Playing State Subscription
  state.subscribe('musicPlaying', (isPlaying) => {
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      if (equalizer) equalizer.classList.add('playing');
      if (playerCard) playerCard.classList.add('is-playing');
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      if (equalizer) equalizer.classList.remove('playing');
      if (playerCard) playerCard.classList.remove('is-playing');
    }
  });

  // Time & Progress Updates
  state.subscribe('currentAudioTime', (currentTime) => {
    const duration = state.get('audioDuration') || 263;
    const pct = (currentTime / duration) * 100;
    if (progressFill) progressFill.style.width = `${Math.min(100, pct)}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(currentTime);
  });

  state.subscribe('audioDuration', (duration) => {
    if (timeTotal) timeTotal.textContent = formatTime(duration);
  });

  // Smooth Scrubber Drag / Seek Handler
  let isSeeking = false;
  if (progressWrap) {
    const handleSeek = (e) => {
      const rect = progressWrap.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const seekRatio = clickX / rect.width;
      const duration = state.get('audioDuration') || 263;
      audioController.seek(seekRatio * duration);
    };

    progressWrap.addEventListener('pointerdown', (e) => {
      isSeeking = true;
      handleSeek(e);
      progressWrap.setPointerCapture(e.pointerId);
    });

    progressWrap.addEventListener('pointermove', (e) => {
      if (isSeeking) handleSeek(e);
    });

    progressWrap.addEventListener('pointerup', (e) => {
      if (isSeeking) {
        isSeeking = false;
        try { progressWrap.releasePointerCapture(e.pointerId); } catch (err) { }
      }
    });
  }

  // Volume Slider & Mute Toggle
  let lastVolume = 0.85;
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      audioController.setVolume(vol);
      if (vol > 0) lastVolume = vol;
    });
  }

  if (btnVolumeMute && volumeSlider) {
    btnVolumeMute.addEventListener('click', () => {
      const currentVol = parseFloat(volumeSlider.value);
      if (currentVol > 0) {
        lastVolume = currentVol;
        volumeSlider.value = '0';
        audioController.setVolume(0);
      } else {
        volumeSlider.value = String(lastVolume || 0.85);
        audioController.setVolume(lastVolume || 0.85);
      }
    });
  }

  // 3D Tilt Parallax on Player Card
  if (playerCard && window.matchMedia('(hover: hover)').matches) {
    playerCard.addEventListener('mousemove', (e) => {
      const rect = playerCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      playerCard.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });

    playerCard.addEventListener('mouseleave', () => {
      playerCard.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateY(0px)';
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

/* ==========================================================================
   10. SECTION 6: INTERACTIVE CAKE CUTTING (Realistic Physics & Knife)
   ========================================================================== */
function playCakeCutSound() {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Soft Slicing Sound (Filtered noise + gentle whoosh)
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const sliceNoise = ctx.createBufferSource();
    sliceNoise.buffer = buffer;

    const sliceFilter = ctx.createBiquadFilter();
    sliceFilter.type = 'lowpass';
    sliceFilter.frequency.setValueAtTime(1200, now);
    sliceFilter.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    const sliceGain = ctx.createGain();
    sliceGain.gain.setValueAtTime(0.25, now);
    sliceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    sliceNoise.connect(sliceFilter);
    sliceFilter.connect(sliceGain);
    sliceGain.connect(ctx.destination);
    sliceNoise.start(now);

    // 2. Joyful Celebration Fanfare Chime (C5, G5, C6, E6, G6)
    const fanfare = [523.25, 783.99, 1046.50, 1318.51, 1567.98];
    fanfare.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + 0.15 + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.75);
    });
  } catch (e) { }
}

function initCakeCutting() {
  const stage = document.getElementById('cakeStageContainer');
  const cuttingCanvas = document.getElementById('cuttingCanvas');
  const cakeSlice = document.getElementById('cakeSlice');
  const cakeCutCavity = document.getElementById('cakeCutCavity');
  const celebrationMsg = document.getElementById('cakeCelebrationMsg');
  const dragHintPill = document.getElementById('dragHintPill');
  const knifeCursor = document.getElementById('cakeKnifeCursor');

  if (!stage || !cuttingCanvas) return;

  const ctx = cuttingCanvas.getContext('2d');
  let isDragging = false;
  let trailPoints = [];
  let crumbs = [];
  let crossedLeft = false;
  let crossedRight = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    cuttingCanvas.width = stage.clientWidth * (window.devicePixelRatio || 1);
    cuttingCanvas.height = stage.clientHeight * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Track Pastry Knife position on mousemove / touchmove
  stage.addEventListener('pointermove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (knifeCursor) {
      knifeCursor.style.left = `${x}px`;
      knifeCursor.style.top = `${y}px`;
      const vx = x - lastX;
      const angle = -35 + Math.max(-25, Math.min(25, vx * 1.5));
      knifeCursor.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }

    if (isDragging && !state.get('cakeCut')) {
      trailPoints.push({ x, y, alpha: 1 });
      if (trailPoints.length > 25) trailPoints.shift();

      // Emit realistic biscuit crumbs and cream droplets
      if (Math.random() > 0.3) {
        for (let k = 0; k < 2; k++) {
          crumbs.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2 + 1,
            radius: Math.random() * 2.5 + 1.2,
            color: Math.random() > 0.5 ? '#f8c291' : '#ffffff',
            alpha: 1
          });
        }
      }

      const centerX = rect.width / 2;
      if (x < centerX - 35 && y > 100 && y < 380) crossedLeft = true;
      if (x > centerX + 35 && y > 100 && y < 380) crossedRight = true;

      if (crossedLeft && crossedRight && !state.get('cakeCut')) {
        triggerCakeCut();
      }

      drawCuttingVisuals();
    }

    lastX = x;
    lastY = y;
  });

  stage.addEventListener('pointerdown', (e) => {
    if (state.get('cakeCut')) return;
    isDragging = true;
    trailPoints = [];
    crossedLeft = false;
    crossedRight = false;
    stage.setPointerCapture(e.pointerId);

    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    trailPoints.push({ x, y, alpha: 1 });
    lastX = x;
    lastY = y;
  });

  stage.addEventListener('pointerup', (e) => {
    isDragging = false;
    try { stage.releasePointerCapture(e.pointerId); } catch (err) { }
    clearTrail();
  });

  stage.addEventListener('pointercancel', () => {
    isDragging = false;
    clearTrail();
  });

  function drawCuttingVisuals() {
    ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight);

    // Draw Crumbs
    for (let i = crumbs.length - 1; i >= 0; i--) {
      const c = crumbs[i];
      c.x += c.vx;
      c.y += c.vy;
      c.alpha -= 0.02;

      if (c.alpha <= 0) {
        crumbs.splice(i, 1);
        continue;
      }

      ctx.fillStyle = c.color;
      ctx.globalAlpha = c.alpha;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Draw Glowing Cut Line
    if (trailPoints.length < 2) return;

    ctx.strokeStyle = '#ff7597';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#ff4d79';
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
    for (let i = 1; i < trailPoints.length; i++) {
      ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.stroke();
  }

  function clearTrail() {
    let fadeFrames = 0;
    const fadeOut = () => {
      if (trailPoints.length > 0 || crumbs.length > 0) {
        if (trailPoints.length > 0) trailPoints.shift();
        drawCuttingVisuals();
        fadeFrames++;
        requestAnimationFrame(fadeOut);
      } else {
        ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight);
      }
    };
    fadeOut();
  }

  function triggerCakeCut() {
    state.set('cakeCut', true);

    // Play sound
    playCakeCutSound();

    // 1. Separate 3D slice
    if (cakeSlice) cakeSlice.classList.add('cut-separated');
    if (cakeCutCavity) cakeCutCavity.classList.add('revealed');

    // 2. Hide drag hint
    if (dragHintPill) {
      dragHintPill.style.opacity = '0';
      setTimeout(() => { dragHintPill.style.display = 'none'; }, 400);
    }

    // 3. Show celebration wish
    if (celebrationMsg) celebrationMsg.classList.add('revealed');

    // 4. Fire celebration explosion
    launchCelebrationConfetti();
  }

  function launchCelebrationConfetti() {
    const stageRect = stage.getBoundingClientRect();
    const centerX = stageRect.left + stageRect.width / 2;
    const centerY = stageRect.top + stageRect.height / 2;

    const confettiColors = ['#ff4d79', '#ffb6c1', '#ffd166', '#ff9f1c', '#d8b4e2', '#ffffff', '#06d6a0'];
    const count = window.innerWidth < 768 ? 60 : 110;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const isHeart = Math.random() > 0.55;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];

      if (isHeart) {
        el.textContent = '💗';
        el.style.fontSize = `${Math.random() * 12 + 14}px`;
      } else {
        el.style.width = `${Math.random() * 8 + 6}px`;
        el.style.height = `${Math.random() * 14 + 8}px`;
        el.style.backgroundColor = color;
        el.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
      }

      el.style.position = 'fixed';
      el.style.left = `${centerX}px`;
      el.style.top = `${centerY}px`;
      el.style.zIndex = '9999';
      el.style.pointerEvents = 'none';
      el.style.transform = 'translate(-50%, -50%) scale(0.2)';
      el.style.transition = `all ${Math.random() * 1.5 + 1.8}s cubic-bezier(0.12, 0.82, 0.32, 1)`;

      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (window.innerWidth * 0.42) + 60;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist - (Math.random() * 120 + 30);
      const rot = (Math.random() - 0.5) * 1080;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) rotate(${rot}deg) scale(1)`;
          el.style.opacity = '1';
        });
      });

      setTimeout(() => {
        el.style.transition = 'opacity 1.2s ease, transform 1.5s ease';
        el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY + 120}px)) rotate(${rot + 180}deg) scale(0.6)`;
        el.style.opacity = '0';

        setTimeout(() => {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 1300);
      }, 1600);
    }
  }
}

  /* ==========================================================================
     11. SECTION 7: PERSONAL HANDWRITTEN LETTER
     ========================================================================== */
  function initLetterSection() {
    const letterCard = document.getElementById('letterCard');
    const letterBody = document.getElementById('letterBody');
    const letterGreeting = document.getElementById('letterGreeting');
    const letterClosing = document.getElementById('letterClosing');

    if (!letterCard) return;

    if (letterGreeting) letterGreeting.textContent = CONFIG.LETTER_TITLE;
    if (letterBody) letterBody.textContent = CONFIG.LETTER_CONTENT;
    if (letterClosing) letterClosing.textContent = CONFIG.SIGNATURE;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !state.get('letterRevealed')) {
          letterCard.classList.add('revealed');
          state.set('letterRevealed', true);
          observer.disconnect();
        }
      });
    }, { threshold: 0.25 });

    const letterSection = document.getElementById('letterSection');
    if (letterSection) observer.observe(letterSection);
  }

  /* ==========================================================================
     12. 3D MOUSE PARALLAX CONTROLLER
     ========================================================================== */
  function initParallax() {
    if (!window.matchMedia('(hover: hover)').matches) return;

    const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
    if (parallaxElements.length === 0) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function update() {
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;

      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed') || '10');
        el.style.transform = `translate3d(${currentX * speed}px, ${currentY * speed}px, 0)`;
      });

      requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  /* ==========================================================================
     13. DOM INITIALIZATION
     ========================================================================== */
  function initApp() {
    const canvas = document.getElementById('universeCanvas');
    if (canvas) new ParticleUniverse(canvas);

    const flowerContainer = document.getElementById('flowerBlastContainer');
    let flowerBlastEngine = null;
    if (flowerContainer) flowerBlastEngine = new FlowerBlastEngine(flowerContainer);

    window.addEventListener('heroHeadingRevealed', () => {
      if (flowerBlastEngine) {
        setTimeout(() => { flowerBlastEngine.trigger(); }, 400);
      }
    });

    initPinScreen();
    initCatsSection();
    initCameraMemory();
    initMusicPlayer();
    initCakeCutting();
    initLetterSection();
    initParallax();

    const btnReplay = document.getElementById('btnReplaySurprise');
    if (btnReplay) {
      btnReplay.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Expose for debugging if needed
    window.audioController = audioController;
    window.state = state;
    window.CONFIG = CONFIG;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
