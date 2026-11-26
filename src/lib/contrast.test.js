import test from 'node:test';
import assert from 'node:assert/strict';
import { ratio } from './contrast.js';

test('ratio matches the WCAG reference value for black on white', () => {
  assert.ok(Math.abs(ratio('#000000', '#FFFFFF') - 21) < 0.01);
});

// [text, background, minimum]. 4.5 for text, 3 for large text and non-text parts.
const PAIRS = [
  ['#10183F', '#FFFFFF', 4.5],
  ['#4B557F', '#FFFFFF', 4.5],
  ['#5F6990', '#FFFFFF', 4.5], // placeholder titles
  ['#6E7DAE', '#FFFFFF', 3], // list numerals (large text)
  ['#7A88B3', '#FFFFFF', 3], // control borders (non-text)
  ['#2E4BD8', '#FFFFFF', 4.5],
  ['#D8420B', '#FCE9E2', 3], // late squares on the late zone
  ['#FFFFFF', '#10183F', 4.5],
  ['#E3E7FA', '#10183F', 4.5],
  ['#AEB6DA', '#10183F', 4.5],
];

for (const [fg, bg, min] of PAIRS) {
  test(`${fg} on ${bg} is at least ${min}:1`, () => {
    assert.ok(ratio(fg, bg) >= min, `got ${ratio(fg, bg).toFixed(2)}`);
  });
}
