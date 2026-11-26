// Simulated orders for the "How I work" story. Not real client data.
// The order of rnd() calls below is part of the data: changing it changes every number.

export const SITES = ['Supplier', 'Warehouse', 'Courier', 'Customer'];

/**
 * @param {number} n number of orders
 * @param {number} seed seed for the fixed pseudo-random sequence
 */
export function createStory(n = 356, seed = 11) {
  let state = seed;
  const rnd = () => (state = (state * 16807) % 2147483647) / 2147483647;

  const orders = [];
  for (let i = 0; i < n; i++) {
    const late = rnd() < 0.24;
    const v = rnd();
    const site = late ? (v < 0.72 ? 1 : v < 0.86 ? 0 : 2) : Math.floor(rnd() * 4);
    const d = late
      ? 5 + Math.floor(Math.pow(rnd(), 1.5) * 5)
      : Math.min(4, 1 + Math.floor((rnd() + rnd()) * 2));
    orders.push({ id: i + 1, d, site, late, a: rnd(), b: rnd(), rot: rnd() });
  }

  const lateOrders = orders.filter((o) => o.late);
  const warehouse = lateOrders.filter((o) => o.site === 1);
  warehouse.forEach((o, i) => (o.rk = i));

  // Fixing pct% of the warehouse delays makes those orders 4 days faster (never below 1 day).
  const days = (o, pct) =>
    o.rk !== undefined && o.rk < (warehouse.length * pct) / 100 ? Math.max(1, o.d - 4) : o.d;

  return {
    orders,
    sites: SITES,
    late: lateOrders,
    warehouse,
    bySite: SITES.map((_, i) => lateOrders.filter((o) => o.site === i).length),
    days,
    remainingLate: (pct) => orders.filter((o) => days(o, pct) > 4).length,
  };
}
