// Pure autoplay timer: callers pass the frame delta and whether to hold
// (hovered, focused, or tab hidden). Holding keeps progress; it never resets it.

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
      // A long frame counts as at most one full duration, so it cannot skip steps.
      elapsed += Math.min(dt, duration);
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
