import { CONFIG } from './config.js';
import { state } from './state.js';

/**
 * Global Audio Controller
 * Manages HTML5 Audio playback for "Perfect" by Ed Sheeran.
 * Includes a romantic Web Audio API synthesizer fallback that generates
 * a beautiful acoustic chord arpeggio if the audio file is not found.
 */
class AudioController {
  constructor() {
    this.audio = new Audio();
    this.audio.src = CONFIG.SONG_PATH;
    this.audio.preload = 'auto';
    this.audioContext = null;
    this.synthPlaying = false;
    this.synthInterval = null;
    this.isUsingFallback = false;

    this.initAudioEvents();
  }

  initAudioEvents() {
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
      console.log('Audio file not found or blocked. Initializing romantic Web Audio synthesizer fallback.');
      this.isUsingFallback = true;
    });
  }

  /**
   * Prime or start audio playback (triggered upon PIN unlock)
   */
  async play() {
    // Resume or init Web Audio context on user gesture
    if (!this.audioContext && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('AudioContext resume error:', e);
      }
    }

    if (!this.isUsingFallback) {
      try {
        await this.audio.play();
        state.set('musicPlaying', true);
        return true;
      } catch (err) {
        console.warn('HTML5 audio play blocked or missing. Switching to romantic synth fallback:', err);
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
      state.set('currentAudioTime', seconds);
    } else {
      state.set('currentAudioTime', seconds);
    }
  }

  setVolume(vol) {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Romantic Acoustic Melody Synthesizer (Fallback when perfect.mp3 is not loaded)
   * Plays a warm, soothing chord arpeggio based on "Perfect" in G Major (G - Em - C - D)
   */
  startRomanticSynth() {
    if (this.synthPlaying) return;
    this.synthPlaying = true;

    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }

    // Melodic notes (frequencies in Hz)
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

      syntheticTime = (syntheticTime + 0.35) % (state.get('audioDuration') || 263);
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
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    } catch (e) {
      // Ignore synth errors
    }
  }

  stopRomanticSynth() {
    this.synthPlaying = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }
}

export const audioController = new AudioController();
if (typeof window !== 'undefined') {
  window.audioController = audioController;
}
