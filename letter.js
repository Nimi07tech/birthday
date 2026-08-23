import { CONFIG } from './config.js';
import { state } from './state.js';

/**
 * Section 7: Handwritten Letter Coordinator
 * Populates letter content dynamically from CONFIG and triggers scroll entrance
 */
export function initLetterSection() {
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
