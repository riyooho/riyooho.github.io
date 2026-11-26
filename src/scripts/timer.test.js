import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimer } from './timer.js';

// Frames of 10 ms, like a real animation loop. Returns the last result and whether any frame advanced.
const run = (timer, ms, hold = false) => {
  let last;
  let advanced = false;
  for (let i = 0; i < ms / 10; i++) {
    last = timer.tick(10, hold);
    advanced ||= last.advanced;
  }
  return { ...last, advanced };
};

test('advances after the duration', () => {
  const t = createTimer({ duration: 6000 });
  const before = run(t, 5990);
  assert.equal(before.advanced, false);
  assert.ok(before.progress > 0.99);
  assert.deepEqual(t.tick(10), { advanced: true, progress: 0 });
});

test('hold keeps progress without resetting it', () => {
  const t = createTimer({ duration: 6000 });
  run(t, 3000);
  const held = run(t, 4000, true);
  assert.equal(held.advanced, false);
  assert.equal(held.progress, 0.5);
  assert.equal(run(t, 3000).advanced, true);
});

test('disabled never advances', () => {
  const t = createTimer({ duration: 6000, enabled: false });
  assert.deepEqual(run(t, 10000), { advanced: false, progress: 0 });
});

test('a long frame or a hidden tab counts as at most 100 ms, so it cannot end a step early', () => {
  const t = createTimer({ duration: 6000 });
  t.tick(1000);
  const back = t.tick(60000); // tab was hidden for a minute
  assert.equal(back.advanced, false);
  assert.ok(back.progress < 0.19, `progress jumped to ${back.progress}`);
});

test('reset clears progress', () => {
  const t = createTimer({ duration: 6000 });
  run(t, 3000);
  t.reset();
  assert.ok(t.tick(1).progress < 0.001);
});

test('setEnabled(false) stops and forgets progress', () => {
  const t = createTimer({ duration: 6000 });
  run(t, 3000);
  t.setEnabled(false);
  t.setEnabled(true);
  assert.ok(t.tick(1).progress < 0.001);
});
