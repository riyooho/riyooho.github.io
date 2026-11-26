import test from 'node:test';
import assert from 'node:assert/strict';
import { pickProjects, pickWriting } from './select.js';

const project = (id, featured) => ({ id, data: { featured } });
const post = (id, featured, pubDate) => ({ id, data: { featured, pubDate: new Date(pubDate) } });

test('pickProjects keeps featured only, ordered by id, capped at 5', () => {
  const entries = ['g', 'a', 'f', 'b', 'e', 'c', 'd'].map((id) => project(id, true));
  entries.push(project('z', false));
  assert.deepEqual(pickProjects(entries).map((e) => e.id), ['a', 'b', 'c', 'd', 'e']);
  assert.deepEqual(pickProjects(entries, 2).map((e) => e.id), ['a', 'b']);
});

test('pickProjects returns an empty list when nothing is featured', () => {
  assert.deepEqual(pickProjects([project('a', false)]), []);
});

test('pickWriting puts featured posts first, newest first, then the rest, capped at 3', () => {
  const entries = [
    post('old-featured', true, '2025-01-01'),
    post('new', false, '2026-06-01'),
    post('mid', false, '2026-01-01'),
    post('newer-featured', true, '2025-06-01'),
  ];
  assert.deepEqual(pickWriting(entries).map((e) => e.id), ['newer-featured', 'old-featured', 'new']);
});
