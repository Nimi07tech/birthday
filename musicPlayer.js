import { state } from './state.js';
import { audioController } from './audio.js';

/**
 * Section 5: Romantic Music Player Coordinator
 * Manages player UI, scrub bar, duration/current time counters, and animated equalizer
 */
export function initMusicPlayer() {
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
  const playerCard = document.querySelector('.music-player-card');

  if (!btnPlay) return;

  // Play / Pause Button Toggle
  btnPlay.addEventListener('click', () => {
    audioController.toggle();
  });

  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      const cur = state.get('currentAudioTime') || 0;
      audioController.seek(Math.max(0, cur - 10));
    });
  }

  if (btnForward) {
    btnForward.addEventListener('click', () => {
      const cur = state.get('currentAudioTime') || 0;
      const dur = state.get('audioDuration') || 263;
      audioController.seek(Math.min(dur, cur + 10));
    });
  }

  // State Subscriptions
  state.subscribe('musicPlaying', (isPlaying) => {
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      if (equalizer) equalizer.classList.add('playing');
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      if (equalizer) equalizer.classList.remove('playing');
    }
  });

  state.subscribe('currentAudioTime', (currentTime) => {
    const duration = state.get('audioDuration') || 263;
    const pct = (currentTime / duration) * 100;
    if (progressFill) progressFill.style.width = `${Math.min(100, pct)}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(currentTime);
  });

  state.subscribe('audioDuration', (duration) => {
    if (timeTotal) timeTotal.textContent = formatTime(duration);
  });

  // Progress Bar Click & Drag Seeking
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
        try { progressWrap.releasePointerCapture(e.pointerId); } catch(err) {}
      }
    });
  }

  // Volume Slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      audioController.setVolume(parseFloat(e.target.value));
    });
  }

  // 3D Card Hover Tilt
  if (playerCard && window.matchMedia('(hover: hover)').matches) {
    playerCard.addEventListener('mousemove', (e) => {
      const rect = playerCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      playerCard.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
    });

    playerCard.addEventListener('mouseleave', () => {
      playerCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)';
    });
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
