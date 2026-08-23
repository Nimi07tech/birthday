import { CONFIG } from './config.js';
import { state } from './state.js';
import { audioController } from './audio.js';

/**
 * Section 1: Secret PIN Screen Coordinator
 * Single PIN is strictly '1010'
 */
export function initPinScreen() {
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

  function playKeypadTapSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
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
    } catch (e) {}
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
