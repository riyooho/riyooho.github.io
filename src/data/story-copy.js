// Copy for the "How I work" story. Every number comes from the simulated Story, never typed here.
// Steps follow Define, Measure, Analyze, Improve, Control; the framework itself is never named on the page.

/** @typedef {import('../lib/story-data.js').createStory} CreateStory */

/**
 * @type {Array<{
 *   tab: string, role: string, question: string,
 *   body: (s: ReturnType<CreateStory>, pct: number) => string,
 *   kpi: (s: ReturnType<CreateStory>, pct: number) => [number, string, boolean],
 * }>}
 */
export const STEPS = [
  {
    tab: 'Define',
    role: 'Define · my role: operations analyst',
    question: 'What does the customer expect?',
    body: () => 'The promise is delivery within 4 days. Each square is one order, and orange ones broke that promise.',
    kpi: (s) => [s.orders.length, 'orders in scope', false],
  },
  {
    tab: 'Measure',
    role: 'Measure · my role: business analyst',
    question: 'How big is the problem?',
    body: (s) =>
      `Baseline: ${s.late.length} of ${s.orders.length} orders took longer than 4 days. That is ${Math.round((s.late.length / s.orders.length) * 100)}% late.`,
    kpi: (s) => [s.late.length, 'late orders', true],
  },
  {
    tab: 'Analyze',
    role: 'Analyze · my role: supply chain analyst',
    question: 'Where do the delays come from?',
    body: (s) =>
      `${s.warehouse.length} of ${s.late.length} late orders (${Math.round((s.warehouse.length / s.late.length) * 100)}%) sit at the warehouse. A Pareto view says fix that stage first.`,
    kpi: (s) => [s.warehouse.length, 'stuck at warehouse', true],
  },
  {
    tab: 'Improve',
    role: 'Improve · my role: strategist',
    question: 'How much should we fix?',
    body: (s, pct) =>
      `Fixing ${Math.round(pct)}% of warehouse delays leaves ${s.remainingLate(pct)} late orders, down from ${s.late.length}. The thin outline is the baseline. Assumption: each fixed order is delivered 4 days faster.`,
    kpi: (s, pct) => [s.remainingLate(pct), 'late in this scenario', true],
  },
  {
    tab: 'Control',
    role: 'Control · my role: project manager',
    question: 'How do we make it stick?',
    body: () => 'A 6-week rollout with named owners. After go-live, the late rate is tracked weekly against the 4-day limit.',
    kpi: () => [6, 'weeks of plan', false],
  },
];

/** [task, owner, start week (0-based), length in weeks] */
export const PLAN = [
  ['Pilot the fix', 'Warehouse team', 0, 2],
  ['Train the team', 'Warehouse head', 2, 1],
  ['Roll out in phases', 'Project manager', 3, 3],
  ['Track late rate weekly', 'Analyst', 3, 3],
];
