import { state } from './state.js';

/**
 * Section 6: Interactive 3D Cake Cutting Coordinator
 * Uses Pointer Events for drag-to-cut interaction with 3D slice physics and confetti celebration.
 */
export function initCakeCutting() {
  const stage = document.getElementById('cakeStageContainer');
  const cuttingCanvas = document.getElementById('cuttingCanvas');
  const cakeSlice = document.getElementById('cakeSlice');
  const celebrationMsg = document.getElementById('cakeCelebrationMsg');
  const dragHintPill = document.getElementById('dragHintPill');

  if (!stage || !cuttingCanvas) return;

  const ctx = cuttingCanvas.getContext('2d');
  let isDragging = false;
  let trailPoints = [];
  let crossedLeft = false;
  let crossedRight = false;

  function resizeCanvas() {
    cuttingCanvas.width = stage.clientWidth * window.devicePixelRatio;
    cuttingCanvas.height = stage.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Pointer Event Handlers
  stage.addEventListener('pointerdown', (e) => {
    if (state.get('cakeCut')) return;
    isDragging = true;
    trailPoints = [];
    crossedLeft = false;
    crossedRight = false;
    stage.setPointerCapture(e.pointerId);

    const rect = stage.getBoundingClientRect();
    trailPoints.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, alpha: 1 });
  });

  stage.addEventListener('pointermove', (e) => {
    if (!isDragging || state.get('cakeCut')) return;

    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    trailPoints.push({ x, y, alpha: 1 });
    if (trailPoints.length > 25) trailPoints.shift();

    // Check if dragging across cake center zone (x ~ 160 to 240, y ~ 120 to 260)
    const centerX = rect.width / 2;
    if (x < centerX - 40 && y > 100 && y < 350) crossedLeft = true;
    if (x > centerX + 40 && y > 100 && y < 350) crossedRight = true;

    // If gesture sliced through both sides, CUT THE CAKE!
    if (crossedLeft && crossedRight && !state.get('cakeCut')) {
      triggerCakeCut();
    }

    drawTrail();
  });

  stage.addEventListener('pointerup', (e) => {
    isDragging = false;
    try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
    clearTrail();
  });

  stage.addEventListener('pointercancel', () => {
    isDragging = false;
    clearTrail();
  });

  function drawTrail() {
    ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight);
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

    // Inner bright white knife core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 6;
    ctx.stroke();
  }

  function clearTrail() {
    let fadeFrames = 0;
    const fadeOut = () => {
      ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight);
      if (trailPoints.length > 0 && fadeFrames < 8) {
        trailPoints.shift();
        drawTrail();
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

    // 1. Slice separation physics
    if (cakeSlice) {
      cakeSlice.classList.add('cut-separated');
    }

    // 2. Hide drag hint
    if (dragHintPill) {
      dragHintPill.style.opacity = '0';
      setTimeout(() => { dragHintPill.style.display = 'none'; }, 400);
    }

    // 3. Show celebration wish
    if (celebrationMsg) {
      celebrationMsg.classList.add('revealed');
    }

    // 4. Fire massive celebration confetti & heart burst
    launchCelebrationConfetti();
  }

  function launchCelebrationConfetti() {
    const stageRect = stage.getBoundingClientRect();
    const centerX = stageRect.left + stageRect.width / 2;
    const centerY = stageRect.top + stageRect.height / 2;

    const confettiColors = ['#ff4d79', '#ffb6c1', '#ffd166', '#06d6a0', '#118ab2', '#d8b4e2', '#ffffff'];
    const count = window.innerWidth < 768 ? 50 : 90;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const isHeart = Math.random() > 0.6;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];

      if (isHeart) {
        el.textContent = '💗';
        el.style.fontSize = `${Math.random() * 10 + 14}px`;
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
      const dist = Math.random() * (window.innerWidth * 0.4) + 60;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist - (Math.random() * 120 + 30);
      const rot = (Math.random() - 0.5) * 1080;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) rotate(${rot}deg) scale(1)`;
          el.style.opacity = '1';
        });
      });

      // Drift down and remove
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
