import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimer } from './timer.js';

test('advances after the duration', () => {
  const t = createTimer({ duration: 6000 });
  const a = t.tick(5999);
  assert.equal(a.advanced, false);
  assert.ok(a.progress > 0.99);
  assert.deepEqual(t.tick(1), { advanced: true, progress: 0 });
});

test('hold keeps progress without resetting it', () => {
  const t = createTimer({ duration: 6000 });
  t.tick(3000);
  const held = t.tick(4000, true);
  assert.equal(held.advanced, false);
  assert.equal(held.progress, 0.5);
  assert.equal(t.tick(3000).advanced, true);
});

test('disabled never advances', () => {
  const t = createTimer({ duration: 6000, enabled: false });
  assert.deepEqual(t.tick(10000), { advanced: false, progress: 0 });
});

test('one advance per tick, even after a very long frame', () => {
  const t = createTimer({ duration: 6000 });
  assert.equal(t.tick(60000).advanced, true);
  assert.equal(t.tick(1).advanced, false);
});

test('reset clears progress', () => {
  const t = createTimer({ duration: 6000 });
  t.tick(3000);
  t.reset();
  assert.ok(t.tick(1).progress < 0.001);
});

test('setEnabled(false) stops and forgets progress', () => {
  const t = createTimer({ duration: 6000 });
  t.tick(3000);
  t.setEnabled(false);
  t.setEnabled(true);
  assert.ok(t.tick(1).progress < 0.001);
});
