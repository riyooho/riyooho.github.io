import { createStory } from '../lib/story-data.js';
import { STEPS, PLAN } from '../data/story-copy.js';
import { ease, fit, reducedMotion } from './canvas.js';
import { createTimer } from './timer.js';

const BLUE = '#2E4BD8';
const ORANGE = '#D8420B';
const SOFT = '#C3CDE6'; // orders that are hidden off-canvas in a step
const INK = '#10183F';
const LATE_ZONE = '#FCE9E2';
const AXIS = 24; // px kept free under the columns for the day labels
const STEP_MS = 9000;
const FONT = "13px 'Schibsted Grotesk', sans-serif";
const FINAL = 1e9; // "elapsed" value that means every scene is in its final state

// All scene timing in one place (milliseconds from the start of a scene).
const SCENE = {
  total: [2800, 3000, 2900, 3300, 5400], // how long each scene runs
  morph: [1400, 1100, 1100, 900, 1000], // squares moving into the scene's layout
  pulse: 1500, // Define: late orders pulse once, staggered by up to 700 ms
  line: [1000, 1400], // Measure: the 4-day line is drawn
  limitLabel: [1300, 1600],
  zone: [1300, 1900], // Measure: late zone wipes in
  lateLabel: [1800, 2200],
  rowTint: [1200, 1700], // Analyze: warehouse row lights up
  counts: [1100, 1900],
  share: [1900, 2300],
  dim: [1500, 2000], // Analyze: the other stages fade back
  sweep: [900, 2600], // Improve: slider sweeps from 0 to the chosen value
  rollout: [2900, 4900], // Control: fixes turn blue one by one (week 3 to 6)
};

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

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
  const kpiBox = el('kv').parentElement;
  const textBox = el('txt');
  let ctx;
  let W = 0;
  let H = 0;
  let step = 0;
  let pctGoal = 50; // share of warehouse delays the visitor chose to fix (slider)
  let pct = pctGoal; // the value being shown (differs from pctGoal during the Improve sweep)
  let E = FINAL; // elapsed ms in the current scene
  let ann = 1; // opacity of axis labels while squares are still moving
  let raf = 0;
  let kpiRaf = 0;
  let kpiShown = orders.length;

  /** One drawn square per order: position, size, rotation, colour, and where it moves from and to. */
  const marks = orders.map((o) => ({ o, x: 0, y: 0, s: 0, t: 0, c: BLUE, from: [0, 0, 0, 0], to: [0, 0, 0, 0] }));
  const fixedCount = () => Math.floor((warehouse.length * pctGoal) / 100);
  const ms = ([a, b]) => clamp((E - a) / (b - a));

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

  // ---------- drawing: every effect is a function of E, so E = FINAL draws the final state ----------

  function drawBackground() {
    if (step === 1) {
      const bw = W / 9;
      ctx.fillStyle = LATE_ZONE;
      ctx.fillRect(4 * bw, 0, (W - 4 * bw) * ms(SCENE.zone), H - AXIS);
    }
    if (step === 2) {
      const rowH = (H - 20) / 4;
      ctx.fillStyle = LATE_ZONE;
      ctx.fillRect(0, rowH + 1, W * ms([1200, 1700]), rowH);
    }
  }

  function drawNotes() {
    ctx.globalAlpha = ann;
    ctx.fillStyle = INK;
    ctx.strokeStyle = '#8794BC';
    ctx.lineWidth = 1;
    ctx.font = FONT;
    const text = (s, x, y, align = 'left', alpha = 1) => {
      ctx.globalAlpha = ann * alpha;
      ctx.textAlign = align;
      ctx.fillText(s, x, y);
      ctx.globalAlpha = ann;
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
      const lineDrawn = step === 1 ? ms(SCENE.line) : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      for (let d = 1; d <= 9; d++) text(d + (d === 9 ? ' days' : ''), (d - 0.5) * h.bw, y + 16, 'center');
      ctx.strokeStyle = INK;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(4 * h.bw, 10);
      ctx.lineTo(4 * h.bw, 10 + (y - 10) * lineDrawn);
      ctx.stroke();
      ctx.setLineDash([]);
      text('4-day limit', 4 * h.bw + 6, 20, 'left', step === 1 ? ms(SCENE.limitLabel) : 1);
      if (step === 1) {
        text(`${late.length} late · ${Math.round((late.length / orders.length) * 100)}%`, W - 4, 20, 'right', ms(SCENE.lateLabel));
      }
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
      const run = ease(ms(SCENE.counts));
      sites.forEach((name, i) => {
        ctx.font = (i === 1 ? '600 ' : '') + FONT;
        const y = 4 + i * rowH + u * 2 + 5;
        text(name, 0, y);
        text(String(Math.round(bySite[i] * run)), labelW + Math.ceil(bySite[i] / 4) * u + 8, y);
      });
      ctx.font = '600 ' + FONT;
      text(
        `${Math.round((warehouse.length / late.length) * 100)}% of late orders`,
        labelW + Math.ceil(bySite[1] / 4) * u + 42,
        4 + rowH + u * 2 + 5,
        'left',
        ms(SCENE.share)
      );
      ctx.font = FONT;
      text('Late orders by stage', W, H - 2, 'right');
    }
    if (step === 4) {
      const n = fixedCount();
      const [from, to] = SCENE.rollout;
      const done = E > 1e8 ? n : E < from ? 0 : Math.min(n, Math.floor(((E - from) * n) / (to - from)) + 1);
      text(`${done} of ${warehouse.length} target orders fixed`, 0, 14);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    const fixed = fixedCount();
    const [rollFrom, rollTo] = SCENE.rollout;
    for (const m of marks) {
      if (m.s < 0.3) continue;
      let size = m.s;
      let colour = m.c;
      let alpha = 1;
      if (step === 0 && m.o.late) {
        const at = SCENE.pulse + m.o.b * 700;
        size *= 1 + 0.6 * Math.sin(Math.PI * clamp((E - at) / 450));
      }
      if (step === 2 && m.o.late && m.o.site !== 1) alpha = 1 - 0.55 * ms(SCENE.dim);
      if (step === 4 && m.o.rk !== undefined && m.o.rk < fixed) {
        const at = rollFrom + ((rollTo - rollFrom) * m.o.rk) / fixed;
        if (E >= at) colour = BLUE;
        size *= 1 + 0.5 * Math.sin(Math.PI * clamp((E - at) / 300));
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = colour;
      if (m.t) {
        ctx.save();
        ctx.translate(m.x + m.s / 2, m.y + m.s / 2);
        ctx.rotate(m.t);
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      } else {
        const grow = (size - m.s) / 2;
        ctx.fillRect(m.x - grow, m.y - grow, size, size);
      }
    }
    ctx.globalAlpha = 1;
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

  /** Counts the KPI to its new value over 500 ms (jumps under reduced motion). */
  function countTo(value) {
    const from = kpiShown;
    kpiShown = value;
    cancelAnimationFrame(kpiRaf);
    if (reducedMotion()) return (el('kv').textContent = value);
    const t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / 500);
      el('kv').textContent = Math.round(from + (value - from) * ease(p));
      if (p < 1) kpiRaf = requestAnimationFrame(tick);
    })(t0);
  }

  function writeText(fade) {
    const s = STEPS[step];
    const [value, label, hot] = s.kpi(story, pct);
    el('rl').textContent = s.role;
    el('hd').textContent = s.question;
    el('bd').textContent = s.body(story, pct);
    el('rv').textContent = Math.round(pct) + '%';
    el('kv').classList.toggle('h', hot);
    el('kl').textContent = label;
    countTo(value);
    canvas.setAttribute('aria-label', `${s.question} ${el('bd').textContent}`);
    el('tb').innerHTML =
      `<caption>Step data ${step + 1}</caption>` +
      tableRows()
        .map((r, i) => '<tr>' + r.map((c) => (i ? `<td>${c}</td>` : `<th scope="col">${c}</th>`)).join('') + '</tr>')
        .join('');
    if (fade) {
      textBox.classList.remove('fade');
      void textBox.offsetWidth; // restart the CSS animation
      textBox.classList.add('fade');
    }
  }

  // ---------- moving between steps ----------

  const timer = createTimer({ duration: STEP_MS, enabled: !reducedMotion() });

  /**
   * @param {number} next step index (wraps)
   * @param {{ play?: boolean, quick?: boolean }} [how] play = animate the scene; quick = only the short move
   *   (used while dragging the slider, so the whole scene is not replayed)
   */
  function go(next, { play = false, quick = false } = {}) {
    const changed = next !== step;
    step = ((next % STEPS.length) + STEPS.length) % STEPS.length;
    timer.reset();
    cancelAnimationFrame(raf);
    el('tip').style.display = 'none';
    kpiBox.setAttribute('aria-live', 'polite');
    textBox.setAttribute('aria-live', 'polite');
    tabs.forEach((t, i) => {
      t.setAttribute('aria-pressed', String(i === step));
      t.style.removeProperty('--p');
    });
    el('sl').style.display = step === 3 ? 'block' : 'none';
    el('plan').style.display = step === 4 ? 'flex' : 'none';

    const animate = play && !reducedMotion();
    const sweep = animate && !quick && step === 3;
    const fall = animate && !quick && step === 0;
    pct = sweep ? 0 : pctGoal;
    el('rg').value = pct;
    writeText(changed);

    const g = layout(step);
    marks.forEach((m, i) => {
      m.from = fall ? [g[i][0], -24 - m.o.b * 40, g[i][2], 0] : [m.x, m.y, m.s, m.t];
      m.to = [g[i][0], g[i][1], g[i][2], step === 0 ? (m.o.rot - 0.5) * 2.4 : 0];
      m.c = g[i][3];
    });
    const put = (amount) =>
      marks.forEach((m) => {
        const z = amount(m);
        [m.x, m.y, m.s, m.t] = m.from.map((v, k) => v + (m.to[k] - v) * z);
      });

    if (!animate) {
      E = FINAL;
      ann = 1;
      put(() => 1);
      return draw();
    }

    const t0 = performance.now();
    const total = quick ? 750 : SCENE.total[step];
    const morph = quick ? 750 : SCENE.morph[step];
    if (sweep) {
      kpiBox.setAttribute('aria-live', 'off');
      textBox.setAttribute('aria-live', 'off');
    }
    let decile = -1;
    (function frame(now) {
      const e = now - t0;
      E = quick ? FINAL : e;
      const p = e / morph;
      if (sweep && e > SCENE.morph[3]) {
        pct = pctGoal * ease(clamp((e - SCENE.sweep[0]) / (SCENE.sweep[1] - SCENE.sweep[0])));
        const h = layout(3);
        marks.forEach((m, i) => {
          // follow the moving targets so squares glide to their new columns
          m.x += (h[i][0] - m.x) * 0.25;
          m.y += (h[i][1] - m.y) * 0.25;
          m.s += (h[i][2] - m.s) * 0.25;
          m.c = h[i][3];
          m.to = [h[i][0], h[i][1], h[i][2], 0];
        });
        el('rg').value = pct;
        el('rv').textContent = Math.round(pct) + '%';
        kpiShown = story.remainingLate(pct);
        el('kv').textContent = kpiShown;
        if (Math.round(pct / 10) !== decile) {
          decile = Math.round(pct / 10);
          el('bd').textContent = STEPS[3].body(story, pct);
        }
      } else {
        put((m) => ease(clamp((p - m.o.a * 0.25) / 0.75)));
      }
      ann = clamp(p * 3 - 2);
      draw();
      if (e < total) raf = requestAnimationFrame(frame);
      else {
        pct = pctGoal;
        E = FINAL;
        ann = 1;
        put(() => 1);
        if (sweep) {
          kpiBox.setAttribute('aria-live', 'polite');
          textBox.setAttribute('aria-live', 'polite');
          writeText(false);
        }
        draw();
      }
    })(t0);
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => go(i, { play: true })));
  el('rg').addEventListener('input', (e) => {
    pctGoal = Number(e.target.value);
    go(3, { play: true, quick: true });
  });

  // Arrow keys move between steps, except while the slider has focus.
  box.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    go(step + (e.key === 'ArrowRight' ? 1 : -1), { play: true });
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
    if (advanced) go(step + 1, { play: true });
    else tabs[step].style.setProperty('--p', progress * 100 + '%');
    requestAnimationFrame(frame);
  })(last);

  // Size the canvas right away so a click before the first resize callback still draws.
  [ctx, W, H] = fit(canvas);

  // The first resize callback plays the opening scene; later resizes redraw the current scene as it is.
  let opened = false;
  new ResizeObserver(() => {
    [ctx, W, H] = fit(canvas);
    if (opened) return go(step);
    opened = true;
    go(0, { play: true });
  }).observe(el('stage'));
  document.fonts?.ready.then(() => ctx && draw());
}
