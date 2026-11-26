import { formatDate, readingLabel } from './format.js';
import { pickProjects, pickWriting } from './select.js';

/**
 * @typedef {{ category: string, title: string, meta: string, href: string | null, cover: string | null, placeholder: boolean }} ProjectSlide
 * @typedef {{ title: string, meta: string, href: string | null, placeholder: boolean }} WritingRow
 */

const PLACEHOLDER_SLIDES = [
  ['Supply chain', '[main project title]'],
  ['Operations', '[second project title]'],
  ['Business analysis', '[third project title]'],
].map(([category, title]) => ({
  category,
  title,
  meta: '[problem] to [result], [year]',
  href: null,
  cover: null,
  placeholder: true,
}));

/** Real slides, or three labelled placeholders only when no project is featured. @returns {ProjectSlide[]} */
export function toProjectSlides(entries) {
  const picked = pickProjects(entries);
  if (picked.length === 0) return PLACEHOLDER_SLIDES.map((s) => ({ ...s }));
  return picked.map((e) => ({
    category: e.data.category,
    title: e.data.title,
    meta: e.data.description,
    href: `/projects/${e.slug}/`,
    cover: e.data.cover ?? null,
    placeholder: false,
  }));
}

/** Always three rows: real posts first, the rest labelled placeholders. @returns {WritingRow[]} */
export function toWritingRows(entries) {
  const rows = pickWriting(entries, 3).map((e) => ({
    title: e.data.title,
    meta: `${e.data.category} · ${formatDate(e.data.pubDate)} · ${readingLabel(e.data.readingTime)}`,
    href: `/blog/${e.slug}/`,
    placeholder: false,
  }));
  while (rows.length < 3) {
    rows.push({ title: '[article title]', meta: '[category · date · reading time]', href: null, placeholder: true });
  }
  return rows;
}
