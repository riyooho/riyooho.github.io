import { fit, reducedMotion } from './canvas.js';
import { createTimer } from './timer.js';

const SLIDE_MS = 6000;
// Decorative bars for slides that have no cover image yet (labelled as a preview in the markup).
const BARS = [
  [3, 5, 4, 7, 6, 8, 9],
  [9, 8, 8, 6, 5, 4, 3],
  [4, 6, 5, 5, 7, 6, 8],
];

/**
 * Auto-advancing project slides. No arrow or play buttons: dots, arrow keys and autoplay.
 * Autoplay holds while hovered, focused or hidden, and never runs under reduced motion.
 * @param {HTMLElement} box
 */
export function initCarousel(box) {
  const slides = [...box.querySelectorAll('.sl')];
  const dots = [...box.querySelectorAll('.dots button')];
  const counter = box.querySelector('.cnt');
  const pad = (n) => String(n).padStart(2, '0');
  let index = 0;
  const timer = createTimer({ duration: SLIDE_MS, enabled: !reducedMotion() });

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle('on', k === index);
      s.inert = k !== index;
    });
    dots.forEach((d, k) => {
      d.setAttribute('aria-current', String(k === index));
      d.querySelector('b').style.width = k < index ? '100%' : '0';
    });
    if (counter) counter.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
    timer.reset();
  }

  function drawBars() {
    box.querySelectorAll('.thumb canvas').forEach((canvas, k) => {
      const [ctx, w, h] = fit(canvas);
      const bars = BARS[k % BARS.length];
      const bw = w / bars.length;
      ctx.fillStyle = '#C9D2EE';
      bars.forEach((n, i) => ctx.fillRect(i * bw + bw * 0.18, h - (n / 10) * h * 0.8, bw * 0.64, (n / 10) * h * 0.8));
    });
  }

  let hovered = false;
  let focused = false;
  box.addEventListener('mouseenter', () => (hovered = true));
  box.addEventListener('mouseleave', () => (hovered = false));
  box.addEventListener('focusin', () => (focused = true));
  box.addEventListener('focusout', (e) => {
    if (!box.contains(e.relatedTarget)) focused = false;
  });

  dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
  box.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    show(index + (e.key === 'ArrowRight' ? 1 : -1));
  });

  let last = performance.now();
  (function frame(now) {
    const { advanced, progress } = timer.tick(now - last, hovered || focused || document.hidden);
    last = now;
    if (advanced) show(index + 1);
    else {
      const fill = dots[index]?.querySelector('b');
      if (fill) fill.style.width = `${progress * 100}%`;
    }
    requestAnimationFrame(frame);
  })(last);

  new ResizeObserver(drawBars).observe(box);
  show(0);
  drawBars();
}
