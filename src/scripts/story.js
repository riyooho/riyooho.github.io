import { createStory } from '../lib/story-data.js';
import { STEPS, PLAN } from '../data/story-copy.js';
import { fit, reducedMotion } from './canvas.js';
import { createTimer } from './timer.js';

const BLUE = '#2E4BD8';
const ORANGE = '#D8420B';
const SOFT = '#C3CDE6'; // orders that are hidden off-canvas in a step
const INK = '#10183F';
const LATE_ZONE = '#FCE9E2';
const AXIS = 24; // px kept free under the columns for the day labels
const STEP_MS = 9000;
const FONT = "13px 'Schibsted Grotesk', sans-serif";

/**
 * The "How I work" story: five scenes drawn from simulated orders on one canvas.
 * @param {HTMLElement} box the #story section rendered by StoryBox.astro
 */
export function initStory(box) {
  const story = createStory();
  const { orders, late, warehouse, bySite, sites } = story;
  const el = (id) => box.querySelector('#' + id);
  const canvas = el('cv');
  const tabs = [...el('steps').children];
  let ctx;
  let W = 0;
  let H = 0;
  let step = 0;
  let pct = 50; // share of warehouse delays fixed in the Improve scene

  /** One drawn square per order: position, size, rotation and colour. */
  const marks = orders.map((o) => ({ o, x: 0, y: 0, s: 0, t: 0, c: BLUE }));
  const fixedCount = () => Math.floor((warehouse.length * pct) / 100);

  // ---------- layouts: [x, y, size, colour] per order, indexed by id - 1 ----------

  /** Orders stacked in columns by days; the four-wide stacks are sorted on time first, late last. */
  function histogram(daysOf) {
    const counts = {};
    const bw = W / 9;
    const u = Math.min((bw - 8) / 4, (H - AXIS - 14) / 26);
    const out = [];
    [...orders]
      .sort((a, b) => (daysOf(a) > 4) - (daysOf(b) > 4) || a.id - b.id)
      .forEach((o) => {
        const d = daysOf(o);
        const n = (counts[d] = (counts[d] ?? -1) + 1);
        out[o.id - 1] = [
          (d - 1) * bw + (bw - u * 4) / 2 + (n % 4) * u,
          H - AXIS - (Math.floor(n / 4) + 1) * u,
          u - 1.2,
          daysOf(o) > 4 ? ORANGE : BLUE,
        ];
      });
    return { out, counts, bw, u };
  }

  /** Late orders in one row per stage (supplier, warehouse, courier, customer). */
  function stageRows() {
    const labelW = 96;
    const rowH = (H - 20) / 4;
    const u = Math.min((W - labelW - 50) / Math.ceil(warehouse.length / 4), rowH * 0.2);
    const seen = [0, 0, 0, 0];
    const out = [];
    orders.forEach((o) => {
      if (!o.late) return (out[o.id - 1] = [o.a * W, H, 0, SOFT]);
      const n = seen[o.site]++;
      out[o.id - 1] = [labelW + Math.floor(n / 4) * u, 4 + o.site * rowH + (n % 4) * u, u - 1.2, ORANGE];
    });
    return { out, labelW, rowH, u };
  }

  /** The warehouse orders as a grid, rank by rank; everything else leaves the canvas. */
  function targetGrid() {
    const cols = 15;
    const u = Math.min((W * 0.31) / cols, (H - 30) / 5);
    return orders.map((o) =>
      o.rk === undefined
        ? [o.a * W, H, 0, SOFT]
        : [(o.rk % cols) * u, 24 + Math.floor(o.rk / cols) * u, u - 1.5, ORANGE]
    );
  }

  function layout(s) {
    if (s === 0) return orders.map((o) => [o.a * (W - 12), o.b * (H - 26), 6 + o.rot * 4, o.late ? ORANGE : BLUE]);
    if (s === 1) return histogram((o) => o.d).out;
    if (s === 2) return stageRows().out;
    if (s === 3) return histogram((o) => story.days(o, pct)).out;
    return targetGrid();
  }

  // ---------- drawing (final state of each scene) ----------

  function drawBackground() {
    if (step === 1) {
      const bw = W / 9;
      ctx.fillStyle = LATE_ZONE;
      ctx.fillRect(4 * bw, 0, W - 4 * bw, H - AXIS);
    }
    if (step === 2) {
      const rowH = (H - 20) / 4;
      ctx.fillStyle = LATE_ZONE;
      ctx.fillRect(0, rowH + 1, W, rowH);
    }
  }

  function drawNotes() {
    ctx.fillStyle = INK;
    ctx.strokeStyle = '#8794BC';
    ctx.lineWidth = 1;
    ctx.font = FONT;
    const text = (s, x, y, align = 'left') => {
      ctx.textAlign = align;
      ctx.fillText(s, x, y);
    };
    if (step === 0) {
      ctx.fillStyle = BLUE;
      ctx.fillRect(0, H - 11, 10, 10);
      ctx.fillStyle = ORANGE;
      ctx.fillRect(110, H - 11, 10, 10);
      ctx.fillStyle = INK;
      text('On time', 15, H - 2);
      text('Late', 125, H - 2);
    }
    if (step === 1 || step === 3) {
      const h = histogram((o) => o.d);
      const y = H - AXIS + 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      for (let d = 1; d <= 9; d++) text(d + (d === 9 ? ' days' : ''), (d - 0.5) * h.bw, y + 16, 'center');
      ctx.strokeStyle = INK;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(4 * h.bw, 10);
      ctx.lineTo(4 * h.bw, y);
      ctx.stroke();
      ctx.setLineDash([]);
      text('4-day limit', 4 * h.bw + 6, 20);
      if (step === 1) text(`${late.length} late · ${Math.round((late.length / orders.length) * 100)}%`, W - 4, 20, 'right');
      if (step === 3) {
        // thin outline = the baseline columns before any fix
        ctx.strokeStyle = '#6E7DAE';
        for (let d = 1; d <= 9; d++) {
          const rows = Math.ceil(((h.counts[d] ?? -1) + 1) / 4);
          if (rows) ctx.strokeRect((d - 1) * h.bw + (h.bw - h.u * 4) / 2 - 2, H - AXIS - rows * h.u - 2, h.u * 4 + 3, rows * h.u + 2);
        }
      }
    }
    if (step === 2) {
      const { labelW, rowH, u } = stageRows();
      sites.forEach((name, i) => {
        ctx.font = (i === 1 ? '600 ' : '') + FONT;
        const y = 4 + i * rowH + u * 2 + 5;
        text(name, 0, y);
        text(String(bySite[i]), labelW + Math.ceil(bySite[i] / 4) * u + 8, y);
      });
      ctx.font = '600 ' + FONT;
      text(`${Math.round((warehouse.length / late.length) * 100)}% of late orders`, labelW + Math.ceil(bySite[1] / 4) * u + 42, 4 + rowH + u * 2 + 5);
      ctx.font = FONT;
      text('Late orders by stage', W, H - 2, 'right');
    }
    if (step === 4) text(`${fixedCount()} of ${warehouse.length} target orders fixed`, 0, 14);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    const fixed = fixedCount();
    for (const m of marks) {
      if (m.s < 0.3) continue;
      // in the Control scene the pilot fixes turn blue
      ctx.fillStyle = step === 4 && m.o.rk !== undefined && m.o.rk < fixed ? BLUE : m.c;
      if (m.t) {
        ctx.save();
        ctx.translate(m.x + m.s / 2, m.y + m.s / 2);
        ctx.rotate(m.t);
        ctx.fillRect(-m.s / 2, -m.s / 2, m.s, m.s);
        ctx.restore();
      } else ctx.fillRect(m.x, m.y, m.s, m.s);
    }
    drawNotes();
  }

  // ---------- text, KPI and the hidden data table ----------

  function tableRows() {
    if (step === 0) return [['Status', 'Orders'], ['On time', orders.length - late.length], ['Late', late.length]];
    if (step === 2) return [['Stage', 'Late'], ...sites.map((n, i) => [n, bySite[i]])];
    if (step === 4) return [['Step', 'Owner', 'Week'], ...PLAN.map(([task, owner, from, len]) => [task, owner, `${from + 1} to ${from + len}`])];
    const daysOf = step === 3 ? (o) => story.days(o, pct) : (o) => o.d;
    return [['Days', 'Orders'], ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => [d, orders.filter((o) => daysOf(o) === d).length])];
  }

  function writeText(fade) {
    const s = STEPS[step];
    const [value, label, hot] = s.kpi(story, pct);
    el('rl').textContent = s.role;
    el('hd').textContent = s.question;
    el('bd').textContent = s.body(story, pct);
    el('rv').textContent = Math.round(pct) + '%';
    el('kv').textContent = value;
    el('kv').classList.toggle('h', hot);
    el('kl').textContent = label;
    canvas.setAttribute('aria-label', `${s.question} ${el('bd').textContent}`);
    el('tb').innerHTML =
      `<caption>Step data ${step + 1}</caption>` +
      tableRows()
        .map((r, i) => '<tr>' + r.map((c) => (i ? `<td>${c}</td>` : `<th scope="col">${c}</th>`)).join('') + '</tr>')
        .join('');
    if (fade) {
      const txt = el('txt');
      txt.classList.remove('fade');
      void txt.offsetWidth; // restart the CSS animation
      txt.classList.add('fade');
    }
  }

  // ---------- moving between steps ----------

  const timer = createTimer({ duration: STEP_MS, enabled: !reducedMotion() });

  function go(next) {
    const changed = next !== step;
    step = ((next % STEPS.length) + STEPS.length) % STEPS.length;
    timer.reset();
    el('tip').style.display = 'none';
    tabs.forEach((t, i) => {
      t.setAttribute('aria-pressed', String(i === step));
      t.style.removeProperty('--p');
    });
    el('sl').style.display = step === 3 ? 'block' : 'none';
    el('plan').style.display = step === 4 ? 'flex' : 'none';
    writeText(changed);
    const g = layout(step);
    marks.forEach((m, i) => {
      [m.x, m.y, m.s, m.c] = g[i];
      m.t = step === 0 ? (m.o.rot - 0.5) * 2.4 : 0;
    });
    draw();
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  el('rg').addEventListener('input', (e) => {
    pct = Number(e.target.value);
    go(3);
  });

  // Arrow keys move between steps, except while the slider has focus.
  box.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    go(step + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // Tooltip on the squares.
  const tip = el('tip');
  el('stage').addEventListener('pointermove', (e) => {
    const b = canvas.getBoundingClientRect();
    const x = e.clientX - b.left;
    const y = e.clientY - b.top;
    const m = marks.find((k) => k.s > 1 && x >= k.x - 2 && x <= k.x + k.s + 2 && y >= k.y - 2 && y <= k.y + k.s + 2);
    tip.style.display = m ? 'block' : 'none';
    if (!m) return;
    const days = step === 3 ? story.days(m.o, pct) : m.o.d;
    tip.textContent = `Order ${m.o.id}: ${days} days` + (m.o.late ? `, stuck at ${sites[m.o.site].toLowerCase()}` : '');
    tip.style.left = Math.max(0, Math.min(W - tip.offsetWidth, x + 12)) + 'px';
    tip.style.top = Math.max(0, y - 38) + 'px';
  });
  el('stage').addEventListener('pointerleave', () => (tip.style.display = 'none'));

  // Autoplay: holds while hovered, focused or hidden; progress fills the active tab.
  let hovered = false;
  let focused = false;
  box.addEventListener('mouseenter', () => (hovered = true));
  box.addEventListener('mouseleave', () => (hovered = false));
  box.addEventListener('focusin', () => (focused = true));
  box.addEventListener('focusout', (e) => {
    if (!box.contains(e.relatedTarget)) focused = false;
  });
  let last = performance.now();
  (function frame(now) {
    const { advanced, progress } = timer.tick(now - last, hovered || focused || document.hidden);
    last = now;
    if (advanced) go(step + 1);
    else tabs[step].style.setProperty('--p', progress * 100 + '%');
    requestAnimationFrame(frame);
  })(last);

  new ResizeObserver(() => {
    [ctx, W, H] = fit(canvas);
    go(step);
  }).observe(el('stage'));
}
