/** Featured projects only, in a fixed order (by entry id), at most `max`. */
export function pickProjects(entries, max = 5) {
  return entries
    .filter((e) => e.data.featured === true)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .slice(0, max);
}

/** Featured posts first, then the rest, each group newest first, at most `max`. */
export function pickWriting(entries, max = 3) {
  const newest = (a, b) => b.data.pubDate - a.data.pubDate;
  const featured = entries.filter((e) => e.data.featured).sort(newest);
  const rest = entries.filter((e) => !e.data.featured).sort(newest);
  return [...featured, ...rest].slice(0, max);
}
