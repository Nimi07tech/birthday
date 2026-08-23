/**
 * Central Reactive State Manager
 */
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
      audioDuration: 263, // 4:23 default for "Perfect"
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
        try {
          cb(value);
        } catch (e) {
          console.error(`Error in state subscriber for ${key}:`, e);
        }
      });
    }
  }
}

export const state = new StateManager();
if (typeof window !== 'undefined') {
  window.state = state;
}
