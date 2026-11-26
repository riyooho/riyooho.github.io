import { ease, fit, reducedMotion } from './canvas.js';

/**
 * Small squares: scattered at rest, sorted while `hoverTarget` is hovered or focused.
 * Echoes the story ("messy, then measured") in miniature.
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement} hoverTarget
 */
export function initMotif(canvas, hoverTarget) {
  let squares = [];
  let ctx;
  let width = 0;
  let height = 0;
  let t = 0; // 0 scattered, 1 sorted
  let goal = 0;
  let raf = 0;

  function build() {
    [ctx, width, height] = fit(canvas);
    const u = Math.max(7, height / 6);
    const cols = Math.floor(width / u);
    const rows = Math.floor(height / u);
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    squares = [];
    for (let i = 0; i < cols; i++) {
      const p = i / cols;
      const colHeight = Math.round(rows * (0.25 + 0.75 * p));
      for (let j = 0; j < rows; j++) {
        const a = rnd(), b = rnd(), c = rnd(), d = rnd();
        if (j < rows - colHeight || d > 0.25 + p * 1.6) continue;
        const k = Math.pow(Math.max(0, 1 - p / 0.6), 1.4);
        squares.push({
          ox: i * u, oy: j * u,
          sx: i * u + (a - 0.5) * k * u * 3, sy: j * u + (b - 0.5) * k * u * 3,
          r: (c - 0.5) * k * 3, u,
        });
      }
    }
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const e = ease(t);
    ctx.fillStyle = '#8FA2FF';
    for (const m of squares) {
      ctx.save();
      ctx.translate(m.sx + (m.ox - m.sx) * e + m.u / 2, m.sy + (m.oy - m.sy) * e + m.u / 2);
      ctx.rotate(m.r * (1 - e));
      ctx.fillRect(-m.u * 0.4, -m.u * 0.4, m.u * 0.8, m.u * 0.8);
      ctx.restore();
    }
  }

  function moveTo(g) {
    goal = g;
    cancelAnimationFrame(raf);
    if (reducedMotion()) {
      t = g;
      return draw();
    }
    (function step() {
      t += (goal - t) * 0.12;
      if (Math.abs(goal - t) < 0.005) t = goal;
      draw();
      if (t !== goal) raf = requestAnimationFrame(step);
    })();
  }

  ['mouseenter', 'focusin'].forEach((e) => hoverTarget.addEventListener(e, () => moveTo(1)));
  ['mouseleave', 'focusout'].forEach((e) => hoverTarget.addEventListener(e, () => moveTo(0)));
  new ResizeObserver(build).observe(canvas);
  build();
}
