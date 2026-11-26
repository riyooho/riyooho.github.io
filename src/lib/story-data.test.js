import test from 'node:test';
import assert from 'node:assert/strict';
import { createStory } from './story-data.js';

const s = createStory();

test('simulated data is fixed', () => {
  assert.equal(s.orders.length, 356);
  assert.equal(s.late.length, 99);
  assert.equal(s.warehouse.length, 75);
  assert.deepEqual(s.bySite, [11, 75, 13, 0]);
});

test('same seed gives the same orders', () => {
  assert.deepEqual(createStory().orders, createStory().orders);
});

test('late means more than 4 days', () => {
  assert.ok(s.orders.every((o) => o.late === o.d > 4));
});

test('scenario: share of warehouse delays fixed', () => {
  assert.equal(s.remainingLate(0), 99);
  assert.equal(s.remainingLate(50), 68);
  assert.equal(s.remainingLate(100), 37);
});

test('days only changes late warehouse orders', () => {
  const other = s.orders.filter((o) => !o.late || o.site !== 1);
  assert.ok(other.length > 0);
  assert.ok(other.every((o) => s.days(o, 100) === o.d));
});
