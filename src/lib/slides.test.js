import test from 'node:test';
import assert from 'node:assert/strict';
import { toProjectSlides, toWritingRows } from './slides.js';

const project = { id: 'route-redesign.md', slug: 'route-redesign', data: { featured: true, category: 'Supply chain', title: 'Route redesign', description: 'Late deliveries to on time, 2025', cover: '/images/route.png' } };
const post = { id: 'my-career-journey.md', slug: 'my-career-journey', data: { featured: true, title: 'From Logistics to Logic', category: 'Personal', pubDate: new Date('2026-05-01'), readingTime: 3 } };

test('no featured project gives exactly three labelled placeholders', () => {
  const slides = toProjectSlides([]);
  assert.equal(slides.length, 3);
  assert.ok(slides.every((s) => s.placeholder && s.href === null && s.cover === null));
  assert.equal(slides[0].title, '[main project title]');
  assert.deepEqual(slides.map((s) => s.category), ['Supply chain', 'Operations', 'Business analysis']);
  assert.equal(slides[0].meta, '[problem] to [result], [year]');
});

test('one featured project gives one real slide and no placeholders', () => {
  const slides = toProjectSlides([project, { id: 'x', data: { featured: false } }]);
  assert.deepEqual(slides, [
    { category: 'Supply chain', title: 'Route redesign', meta: 'Late deliveries to on time, 2025', href: '/projects/route-redesign/', cover: '/images/route.png', placeholder: false },
  ]);
});

test('a project without cover has cover null', () => {
  const { data, ...rest } = project;
  const { cover, ...noCover } = data;
  assert.equal(toProjectSlides([{ ...rest, data: noCover }])[0].cover, null);
});

test('no posts gives three placeholder rows', () => {
  const rows = toWritingRows([]);
  assert.equal(rows.length, 3);
  assert.ok(rows.every((r) => r.placeholder && r.href === null));
  assert.equal(rows[0].title, '[article title]');
  assert.equal(rows[0].meta, '[category · date · reading time]');
});

test('one post gives one real row followed by two placeholders', () => {
  const rows = toWritingRows([post]);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { title: 'From Logistics to Logic', meta: 'Personal · May 1, 2026 · 3 min read', href: '/blog/my-career-journey/', placeholder: false });
  assert.deepEqual(rows.slice(1).map((r) => r.placeholder), [true, true]);
});
