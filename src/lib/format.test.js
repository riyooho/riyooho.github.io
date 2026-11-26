import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, readingLabel } from './format.js';

test('formatDate uses the UTC calendar day', () => {
  assert.equal(formatDate(new Date('2026-05-01')), 'May 1, 2026');
  assert.equal(formatDate(new Date('2026-12-31T23:59:59Z')), 'December 31, 2026');
});

test('readingLabel', () => {
  assert.equal(readingLabel(3), '3 min read');
  assert.equal(readingLabel(1), '1 min read');
});
