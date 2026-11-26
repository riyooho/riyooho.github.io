import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ratio } from '../lib/contrast.js';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const css = read('../styles/dashboard.css');

/** The declarations of the first rule whose selector is exactly `selector` (plain-string search, no regex). */
const body = (selector) => {
  const start = css.indexOf(selector + '{');
  return start < 0 ? '' : css.slice(start + selector.length + 1, css.indexOf('}', start));
};

test('autoplay never announces: no visible aria-live region, one status region for user actions', () => {
  for (const file of ['StoryBox.astro', 'ProjectsBox.astro']) {
    const src = read(`./${file}`);
    assert.ok(!src.includes('aria-live'), `${file} still has aria-live`);
    assert.ok(src.includes('role="status"'), `${file} has no role="status" region`);
  }
});

test('slide indicator track is visible against white (3:1)', () => {
  const colour = body('.dots i').match(/background:(#[0-9a-f]{6})/i)?.[1];
  assert.ok(colour, 'track colour must be an explicit hex value');
  assert.ok(ratio(colour, '#FFFFFF') >= 3, `${colour} is ${ratio(colour, '#FFFFFF').toFixed(2)}`);
});

test('list numerals are readable text (4.5:1)', () => {
  const colour = body('.feed li::before').match(/color:(#[0-9a-f]{6})/i)?.[1];
  assert.ok(colour, 'numeral colour must be an explicit hex value');
  assert.ok(ratio(colour, '#FFFFFF') >= 4.5, `${colour} is ${ratio(colour, '#FFFFFF').toFixed(2)}`);
});

test('a long project description cannot push the case study line out of the slide', () => {
  assert.match(body('.sl .meta'), /-webkit-line-clamp:2/);
});
