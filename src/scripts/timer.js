// Pure autoplay timer: callers pass the frame delta and whether to hold
// (hovered, focused, or tab hidden). Holding keeps progress; it never resets it.

const MAX_FRAME_MS = 100;

/**
 * @param {{ duration: number, enabled?: boolean }} options
 */
export function createTimer({ duration, enabled = true }) {
  let on = enabled;
  let elapsed = 0;

  return {
    /** @returns {{ advanced: boolean, progress: number }} */
    tick(dt, hold = false) {
      if (!on) {
        elapsed = 0;
        return { advanced: false, progress: 0 };
      }
      if (hold) return { advanced: false, progress: elapsed / duration };
      // A long frame (GC pause, or the first frame after a hidden tab) counts as 100 ms at most,
      // so it can never end a step early.
      elapsed += Math.min(dt, MAX_FRAME_MS);
      if (elapsed >= duration) {
        elapsed = 0;
        return { advanced: true, progress: 0 };
      }
      return { advanced: false, progress: elapsed / duration };
    },
    reset() {
      elapsed = 0;
    },
    setEnabled(value) {
      on = value;
      elapsed = 0;
    },
  };
}
