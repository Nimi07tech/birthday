/**
 * Global 3D Parallax & Depth Controller
 * Gently shifts elements based on mouse coordinates on desktop with smooth interpolation (lerp)
 */
export function initParallax() {
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
      const shiftX = currentX * speed;
      const shiftY = currentY * speed;
      el.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
