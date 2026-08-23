/**
 * Section 3: Kawaii Pastel Cat World Coordinator
 */
export function initCatsSection() {
  const catCards = document.querySelectorAll('.cat-card');
  if (catCards.length === 0) return;

  // Intersection Observer for staggered entrance
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

  // Interactive Click / Tap Reaction with Floating Micro-Emojis
  catCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      createCatReactionSparkle(e.clientX || (card.getBoundingClientRect().left + 80), e.clientY || (card.getBoundingClientRect().top + 80));
    });
  });
}

function createCatReactionSparkle(x, y) {
  const emojis = ['✨', '💗', '🎂', '🐾', '🎀', '🌸', '⭐'];
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
}
