// Small helpers shared by the canvas scripts.

export const ease = (k) => 1 - Math.pow(1 - k, 3);

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sizes a canvas to its CSS size at device pixel ratio. @returns {[CanvasRenderingContext2D, number, number]} */
export function fit(canvas) {
  const r = devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * r;
  canvas.height = h * r;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(r, 0, 0, r, 0, 0);
  return [ctx, w, h];
}
