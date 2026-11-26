const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** @param {Date} date @returns {string} e.g. "May 1, 2026" (UTC day, so the date never shifts by timezone) */
export const formatDate = (date) => dateFormat.format(date);

/** @param {number} minutes @returns {string} e.g. "3 min read" */
export const readingLabel = (minutes) => `${minutes} min read`;
