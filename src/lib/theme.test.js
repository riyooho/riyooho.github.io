import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../../tailwind.config.mjs';
import { ratio } from './contrast.js';

const { colors, fontFamily } = config.theme.extend;

test('inner pages use the dashboard palette', () => {
  assert.equal(colors.ink, '#10183F');
  assert.equal(colors.paper, '#EBF0F8');
  assert.equal(colors.surface, '#FFFFFF');
  assert.equal(colors.accent, '#2E4BD8');
});

test('inner pages use the dashboard font', () => {
  assert.equal(fontFamily.display[0], 'Schibsted Grotesk');
  assert.equal(fontFamily.body[0], 'Schibsted Grotesk');
});

test('text tokens are readable on the page and box backgrounds (4.5:1)', () => {
  for (const bg of [colors.paper, colors.surface]) {
    for (const fg of [colors.ink, colors.muted, colors.accent]) {
      assert.ok(ratio(fg, bg) >= 4.5, `${fg} on ${bg} is ${ratio(fg, bg).toFixed(2)}`);
    }
  }
});

test('accent used on dark backgrounds (contact page) is readable on ink', () => {
  assert.ok(ratio(colors['accent-soft'], colors.ink) >= 4.5);
});
