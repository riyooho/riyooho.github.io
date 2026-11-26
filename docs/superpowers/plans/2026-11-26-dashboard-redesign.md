# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page with a one-screen, no-scroll dashboard (profile, projects, writing, animated "How I work" story) and align the inner pages with the new look.

**Architecture:** Plain Astro components render each box on the server. Small vanilla-JS modules add behaviour (carousel, story canvas, motif). Everything testable without a browser (simulated story data, content selection, autoplay timer, palette contrast) lives in pure `.js` modules under `src/lib/` and `src/scripts/`, tested with Node's built-in runner (no new test dependency). Layout and animation are checked in a browser with one reusable script.

**Tech Stack:** Astro 4, Tailwind 3 (inner pages only), MDX, content collections, `@fontsource/schibsted-grotesk` (self-hosted font), `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-26-dashboard-redesign-design.md`
**Visual and behavioural reference (prototype, not production code):** `docs/superpowers/specs/assets/dashboard-mockup-v5.html`. Copy and number strings from it verbatim. Where this plan says "port X", X is a function or constant of that file's inline script.

## Global Constraints

- Stack stays Astro 4 + Tailwind 3 + MDX, deployed by `.github/workflows/deploy.yml` to GitHub Pages, `site: 'https://riyooho.github.io'`. The only new runtime dependency is `@fontsource/schibsted-grotesk`; no test or UI framework.
- Keep the Google tag `G-G6Y8ZVDVRS` in the head. No render-blocking third-party resources: font is self-hosted, so remove the Google Fonts `preconnect` links.
- Site language is English (`<html lang="en">`), plain business English. No em dashes in copy. No invented numbers, names, testimonials or certifications.
- Palette (exact): page `#EBF0F8`, navy `#10183F`, blue `#2E4BD8`, orange `#D8420B` (only for "late"), white box `#FFFFFF` with border `#DCE3F1`, motif `#8FA2FF`, secondary text `#4B557F`, line `#C9D2E6`, late zone `#FCE9E2`. Radius 10px box, 8px button, 6px label. Font Schibsted Grotesk 400, 500, 600, 800.
- Grid: `grid-template-columns: minmax(0,1.3fr) minmax(0,1.15fr) minmax(0,1fr)`, `grid-template-rows: minmax(0,1fr) 34vh`, `height: 100dvh`, gap `clamp(10px,1vw,16px)`. Below 1024px width or 620px height the boxes stack in one scrolling column.
- Timing: project slide 6000 ms, story step 9000 ms. Story scene durations `D=[2800,3000,2900,3300,5400]`, morph durations `MD=[1400,1100,1100,900,1000]`.
- No play, pause, previous or next buttons anywhere. Navigation is dots, step tabs, arrow keys, and autoplay. Autoplay stops while the box is hovered or focused (progress is kept, not reset), while the tab is hidden, and always under `prefers-reduced-motion: reduce`, where every scene shows its final state instead.
- The story box always shows the label "simulated data". Placeholders are always visibly labelled.
- Contrast: text 4.5:1, large text and non-text 3:1.
- Verified viewports with no scroll and no overflow: 1280x720, 1366x650, 1440x860, 1920x1080.
- Commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

Inputs the spec implies but the main tests do not exercise, most likely first. Each has its pinning test or check in the named task.

1. **Zero featured projects, or fewer than 3 posts.** Home must show labelled placeholders, never an empty box (Task 3 tests).
2. **Very long project or article titles.** Titles must clamp to two lines and never overflow a box (Task 4 CSS rule, Task 6 and 7 browser check with a 120-character title).
3. **Hidden tab and slow frames.** The autoplay timer must not advance while hidden and must not skip steps after a long frame (Task 2 tests).
4. **JavaScript disabled.** First project slide, first writing rows, profile, and story step 1 text must still be readable from the server-rendered HTML (Task 7, 8 checks).
5. **Reduced motion.** With `prefers-reduced-motion: reduce`, nothing moves, nothing autoplays, and each step shows its final state (Task 8, 9 checks; the built-in test browser already runs with reduced motion on).

---

### Task 1: Simulated story data

**Files:**
- Create: `src/lib/story-data.js`
- Test: `src/lib/story-data.test.js`
- Modify: `package.json` (add script `"test": "node --test"`)

**Interfaces:**
- Produces: `createStory(n = 356, seed = 11): Story` where
  `Order = { id: number, d: number, site: 0|1|2|3, late: boolean, a: number, b: number, rot: number, rk?: number }` and
  `Story = { orders: Order[], sites: string[], late: Order[], warehouse: Order[], bySite: number[], days(o: Order, pct: number): number, remainingLate(pct: number): number }`.
  `sites` is `['Supplier','Warehouse','Courier','Customer']`. `rk` is the 0-based rank of a late warehouse order within `warehouse`. `days(o, pct)` returns `Math.max(1, o.d - 4)` when `o.rk !== undefined && o.rk < warehouse.length * pct / 100`, else `o.d`.

- [ ] **Step 1: Write the failing test** in `src/lib/story-data.test.js` (`node:test`, `node:assert/strict`):
  - `'simulated data is fixed'`: with `s = createStory()`: `s.orders.length === 356`, `s.late.length === 99`, `s.warehouse.length === 75`, `deepEqual(s.bySite, [11, 75, 13, 0])`.
  - `'same seed gives the same orders'`: `deepEqual(createStory().orders, createStory().orders)`.
  - `'late means more than 4 days'`: every order satisfies `o.late === (o.d > 4)`.
  - `'scenario'`: `s.remainingLate(0) === 99`, `s.remainingLate(50) === 68`, `s.remainingLate(100) === 37`.
  - `'days only changes late warehouse orders'`: for an order with `site !== 1` or `!late`, `s.days(o, 100) === o.d`.
- [ ] **Step 2: Run** `npm test` (after adding the script). Expected: FAIL, module not found.
- [ ] **Step 3: Implement `createStory`** by porting the generator from the mockup: the seeded `rnd` (`seed * 16807 % 2147483647 / 2147483647`), the per-order draw (the order of `rnd()` calls matters and must stay as in the mockup), `rk` assignment, `eff` (as `days`), and `left` (as `remainingLate`). Pure module, no DOM.
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Commit** `feat: add seeded story data module with tests`.

---

### Task 2: Autoplay timer

**Files:**
- Create: `src/scripts/timer.js`
- Test: `src/scripts/timer.test.js`

**Interfaces:**
- Produces: `createTimer({ duration: number, enabled?: boolean }): Timer` where
  `Timer = { tick(dt: number, hold?: boolean): { advanced: boolean, progress: number }, reset(): void, setEnabled(on: boolean): void }`.
  `progress` is `elapsed / duration` in `[0,1)`. While disabled, `tick` returns `{advanced:false, progress:0}` and keeps nothing. While `hold` is true, elapsed time is kept but not increased. One `tick` never advances more than once, and a `dt` larger than `duration` is capped at `duration` (so a long frame cannot skip steps).

- [ ] **Step 1: Write the failing tests** (`node:test`):
  - `'advances after the duration'`: `t = createTimer({duration:6000})`; `t.tick(5999)` is `{advanced:false}` with `progress > 0.99`; then `t.tick(1)` is `{advanced:true, progress:0}`.
  - `'hold keeps progress'`: `tick(3000)`, `tick(4000, true)` leaves `advanced:false` and `progress === 0.5`; then `tick(3000)` is `advanced:true`.
  - `'disabled never advances'`: `createTimer({duration:6000, enabled:false}).tick(10000)` is `{advanced:false, progress:0}`.
  - `'one advance per tick'`: `tick(60000)` returns `advanced:true`, then the next `tick(1)` returns `advanced:false`.
  - `'reset'`: after `tick(3000)`, `reset()`, `tick(1).progress < 0.001`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement `createTimer`** in `src/scripts/timer.js` (pure, no `window`, no `requestAnimationFrame`; callers pass the frame delta and `document.hidden || hovered || focused` as `hold`).
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Commit** `feat: add autoplay timer with tests`.

---

### Task 3: Content schema, data hygiene and selection helpers

**Files:**
- Create: `src/lib/format.js`, `src/lib/select.js`, `src/lib/slides.js`
- Test: `src/lib/format.test.js`, `src/lib/select.test.js`, `src/lib/slides.test.js`
- Modify: `src/content/config.ts`, `src/content/blog/my-career-journey.md`
- Delete: `src/content/projects/draft-analysis.md`

**Interfaces:**
- Produces (`format.js`): `formatDate(date: Date): string` returns `'May 1, 2026'` style in UTC; `readingLabel(minutes: number): string` returns `'3 min read'`.
- Produces (`select.js`), entries shaped `{ id: string, data: {...} }` like Astro collection entries:
  `pickProjects(entries, max = 5)` returns only `data.featured === true`, sorted by `id` ascending, first `max`.
  `pickWriting(entries, max = 3)` returns featured entries newest-first (`data.pubDate`), then the rest newest-first, first `max`.
- Produces (`slides.js`):
  `type ProjectSlide = { category: string, title: string, meta: string, href: string | null, cover: string | null, placeholder: boolean }`,
  `type WritingRow = { title: string, meta: string, href: string | null, placeholder: boolean }`,
  `toProjectSlides(entries): ProjectSlide[]`: real slides (`href: '/projects/' + id + '/'`, `meta = data.description`, `cover = data.cover ?? null`) or, only when there are zero featured projects, exactly three placeholders titled `[main project title]`, `[second project title]`, `[third project title]` with categories `Supply chain`, `Operations`, `Business analysis` and meta `[problem] to [result], [year]`. Placeholders are never mixed with real slides.
  `toWritingRows(entries): WritingRow[]`: always exactly 3 rows; real rows have `href: '/blog/' + id + '/'` and `meta = category + ' · ' + formatDate(pubDate) + ' · ' + readingLabel(readingTime)`; missing rows are placeholders titled `[article title]` with meta `[category · date · reading time]`.

- [ ] **Step 1: Write the failing tests.**
  - format: `formatDate(new Date('2026-05-01'))` is `'May 1, 2026'`; `readingLabel(3)` is `'3 min read'`, `readingLabel(1)` is `'1 min read'`.
  - select: `pickProjects` ignores non-featured, orders by id, and caps at 5 given 7 featured; `pickWriting` puts an older featured post before a newer non-featured one and returns at most 3.
  - slides: `toProjectSlides([])` returns 3 items, all `placeholder: true`, first title `[main project title]`; one featured entry returns exactly 1 slide with `placeholder:false`; `toWritingRows([])` returns 3 placeholders; one entry returns 1 real row (meta `'Personal · May 1, 2026 · 3 min read'`) followed by 2 placeholders.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, modules not found.
- [ ] **Step 3: Implement the three modules** (pure functions, no Astro imports). Use `Intl.DateTimeFormat('en-US', {timeZone:'UTC', ...})` for `formatDate`.
- [ ] **Step 4: Update the schema and content.** In `src/content/config.ts` add `featured: z.boolean().default(false)` to `blog` and `cover: z.string().optional()` to `projects`. Add `featured: true` to the frontmatter of `my-career-journey.md`. Delete `draft-analysis.md` (lorem ipsum, must not be shown).
- [ ] **Step 5: Run** `npm test` and `npm run build`. Expected: tests PASS; build succeeds (the `/projects/` index must still build with an empty collection; if it fails, make its filter and list tolerate zero projects).
- [ ] **Step 6: Commit** `feat: content schema, selection helpers and placeholders`.

---

### Task 4: Foundation: fonts, layouts, dashboard CSS and page shell

**Files:**
- Create: `src/components/Head.astro`, `src/layouts/HomeLayout.astro`, `src/styles/dashboard.css`, `src/lib/contrast.js`, `scripts/check-layout.js`
- Test: `src/lib/contrast.test.js`
- Modify: `package.json` (+ lockfile: `npm i @fontsource/schibsted-grotesk`), `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`

**Interfaces:**
- Produces: `ratio(fg: string, bg: string): number` in `contrast.js` (WCAG 2.x, hex `#RRGGBB`).
- Produces: `Head.astro` with the Props of the current `BaseLayout` (`title`, `description`, `image`, `type`, `canonical`) rendering everything inside `<head>` (SEO, Open Graph, Twitter, JSON-LD, icons, sitemap link, Google tag), minus the Google Fonts `preconnect` links.
- Produces: `HomeLayout.astro` (same Props): imports `dashboard.css` and the four `@fontsource/schibsted-grotesk` weight stylesheets (400, 500, 600, 800), renders `<Head>`, a `<slot />`, and no site-wide scroll-animation script. `BaseLayout.astro` keeps `global.css` and the scroll-animation script, now using `<Head>` and the same font imports.
- Produces: `scripts/check-layout.js`, an async snippet to paste in a browser console or run through a browser tool. It clicks each of the five `#steps` buttons (if present), waits 300 ms each, and returns `{ w, h, scroll, bad }` where `scroll = document.documentElement.scrollHeight - innerHeight` and `bad` lists `[id, overflowY, overflowX]` for every `.box` with a non-zero overflow. Passing means `scroll === 0` and `bad` empty.
- Produces: CSS class names for later tasks: `.dash` (grid), `.box`, `.hd` (box header row), `#prof`, `#proj`, `#writ`, `#story`. Grid areas `"prof proj writ" "story story story"`.

- [ ] **Step 1: Write the failing test** `src/lib/contrast.test.js` asserting `ratio(fg, bg) >= min` for these `[fg, bg, min]`: `#10183F/#FFFFFF/4.5`, `#4B557F/#FFFFFF/4.5`, `#5F6990/#FFFFFF/4.5`, `#6E7DAE/#FFFFFF/3` (large text), `#7A88B3/#FFFFFF/3` (non-text border), `#2E4BD8/#FFFFFF/4.5`, `#D8420B/#FCE9E2/3`, `#FFFFFF/#10183F/4.5`, `#E3E7FA/#10183F/4.5`, `#AEB6DA/#10183F/4.5`; plus `ratio('#000000','#FFFFFF')` is `21` (within 0.01).
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, module not found.
- [ ] **Step 3: Implement `ratio`** (formula: relative luminance with the 0.03928 linearisation, then `(L1+0.05)/(L2+0.05)`). Run `npm test`. Expected PASS.
- [ ] **Step 4: Install the font and stop Tailwind injecting base styles into the home page.** `npm i @fontsource/schibsted-grotesk`; in `astro.config.mjs` use `tailwind({ applyBaseStyles: false })` (`global.css` already contains the `@tailwind` directives, so inner pages are unaffected).
- [ ] **Step 5: Refactor the head.** Move the `<head>` content of `BaseLayout.astro` into `Head.astro` (drop the two Google Fonts `preconnect` links), have `BaseLayout.astro` use it, and add `HomeLayout.astro`.
- [ ] **Step 6: Port the mockup's `<style>` into `src/styles/dashboard.css`.** Drop its Google `@import` line. Keep all rules (grid, `.box`, `.hd`, profile, projects, writing, story, `.sr`, the `max-height:760px` rules, entrance animation, reduced-motion rules, stacked fallback). Add a rule clamping box titles: `.sl h3, .feed h3 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }`.
- [ ] **Step 7: Replace `src/pages/index.astro`** with `HomeLayout` and four empty boxes (`<main class="dash">` containing `section.box#prof`, `#proj`, `#writ`, `#story`, each with an `.hd` row and its `h2`: `Projects`, `Selected writing`, `How I work`; the profile has no title).
- [ ] **Step 8: Verify.** `npm run build` passes. Run `npm run preview`, open `/` at each of the four verified viewports and run `scripts/check-layout.js`. Expected: `scroll: 0`, `bad: []`, background `#EBF0F8`, font Schibsted Grotesk (check `getComputedStyle(document.body).fontFamily`).
- [ ] **Step 9: Commit** `feat: dashboard foundation (fonts, layouts, grid, contrast test)`.

---

### Task 5: Profile box

**Files:**
- Create: `src/components/ProfileBox.astro`, `src/scripts/motif.js`, `public/images/me-crop.jpg`
- Modify: `src/pages/index.astro`
- Delete: `src/components/Hero.astro`, `public/images/me.png` (only after `grep -r "me.png\|Hero" src` shows no remaining use)

**Interfaces:**
- Consumes: classes from Task 4.
- Produces: `ProfileBox.astro` (no props) rendering `section.box#prof`. `motif.js` exports `initMotif(canvas: HTMLCanvasElement, hoverTarget: HTMLElement): void`: port `motifBuild`, `motifDraw`, `motifTo` from the mockup, scattered at rest and sorted while `hoverTarget` is hovered or focused; under reduced motion it jumps to the target state without animating; it re-fits on resize.

- [ ] **Step 1: Create the photo.** Decode the embedded `data:image/jpeg;base64,...` of the `.me img` element in the mockup into `public/images/me-crop.jpg` (360x480, about 25 KB). Do not recompress.
- [ ] **Step 2: Build `ProfileBox.astro`** with the exact copy and structure of the mockup profile: photo `<img src="/images/me-crop.jpg" width="360" height="480" fetchpriority="high" alt="Wahyu Satrio wearing glasses, light blue headphones and a pink t-shirt">`, motif canvas (`aria-hidden`), `<h1>Wahyu Satrio Nugroho</h1>`, lead paragraph, facts list (`Current`, `Location`, `Open to`), links Email (`mailto:riyonugroho@outlook.com`, primary), LinkedIn (`https://linkedin.com/in/wsnugroho`), GitHub (`https://github.com/riyooho`), and the disabled `CV coming soon` (`<span aria-disabled="true" title="CV file not available yet">`, dashed border, `cursor:not-allowed`). Load `motif.js` with a module `<script>`.
- [ ] **Step 3: Verify.** `npm run build` passes. At the four viewports, run `scripts/check-layout.js` (expect `bad: []`); hover the profile and confirm the motif sorts (`mt` reaches 1 in the page state or visually); Tab through Email, LinkedIn, GitHub and confirm a visible focus ring (white on navy). Confirm `dist/` contains `me-crop.jpg` and no `me.png`.
- [ ] **Step 4: Commit** `feat: profile box with photo and motif`.

---

### Task 6: Writing box

**Files:**
- Create: `src/components/WritingBox.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `toWritingRows(entries)` from Task 3, `getCollection('blog')` from `astro:content`.
- Produces: `WritingBox.astro` (no props) rendering `section.box#writ`: header `Selected writing` with link `All writing` to `/blog/`; an ordered list of exactly 3 rows. Real rows are links (`<a href>` wrapping the `h3`), placeholder rows are plain text with the class `ph` and a muted title colour `#5F6990`.

- [ ] **Step 1: Build the component** with numbering `01` to `03` via a CSS counter (as in the mockup), hover colour change on real rows only, and the meta line under each title.
- [ ] **Step 2: Verify.** `npm run build`; the built HTML of `/` contains the link `/blog/my-career-journey/`, the text `Personal · May 1, 2026 · 3 min read` and two `[article title]` placeholders. Temporarily set the article title to 120 characters: the title clamps to two lines and `scripts/check-layout.js` stays clean; revert it.
- [ ] **Step 3: Commit** `feat: writing box from blog collection`.

---

### Task 7: Projects box

**Files:**
- Create: `src/components/ProjectsBox.astro`, `src/scripts/carousel.js`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `toProjectSlides(entries): ProjectSlide[]` (Task 3), `createTimer` (Task 2).
- Produces: `ProjectsBox.astro` (no props) rendering `section.box#proj` (`aria-roledescription="carousel"`): header `Projects` with counter `01 / 03` and link `All projects` to `/projects/`; slides rendered on the server, the first with class `on`; a row of dots (`<button aria-label="Show project N">`). `carousel.js` exports `initCarousel(box: HTMLElement): void` with: autoplay via `createTimer({duration: 6000})` driven by `requestAnimationFrame`; `hold` true when the box is hovered or focused or `document.hidden`; disabled under `prefers-reduced-motion: reduce`; dot fill showing timer progress; dot click and ArrowLeft/ArrowRight (when focus is inside the box and not in an input) change slide; inactive slides get `inert`; counter updates.
- Slide content: category tag, `h3` title, meta line, then a preview. With `cover` set, show the image; without it, show the placeholder bar preview from the mockup labelled `Preview only, real chart coming soon` plus `Case study coming soon`. Real slides link to `href`.

- [ ] **Step 1: Build the component and `carousel.js`** (port the markup and the `thumbs` bar preview from the mockup; the carousel loop must not duplicate timer logic).
- [ ] **Step 2: Verify.** `npm run build` passes. In the page: dots count equals slide count; clicking dot 2 shows slide 2 and updates the counter; ArrowRight from a focused dot advances; `scripts/check-layout.js` is clean at the four viewports; with JavaScript disabled the first slide is visible and readable (server HTML); with 8 temporary placeholder slides the dots still fit (no horizontal overflow). Under the built-in browser's reduced motion, the slide does not change by itself after 10 seconds.
- [ ] **Step 3: Commit** `feat: projects carousel box`.

---

### Task 8: Story box (static behaviour)

**Files:**
- Create: `src/components/StoryBox.astro`, `src/scripts/story.js`, `src/data/story-copy.js`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `createStory` (Task 1), `createTimer` (Task 2).
- Produces (`story-copy.js`): `STEPS: Array<{ tab: string, role: string, question: string, body: (s: Story) => string, kpi: (s: Story, pct: number) => [number, string, boolean] }>` and `PLAN: Array<[task: string, owner: string, startWeek: number, weeks: number]>`. Copy comes verbatim from the mockup constants `ST` and `PL`: tabs `Define, Measure, Analyze, Improve, Control`; roles `Define · my role: operations analyst`, `Measure · my role: business analyst`, `Analyze · my role: supply chain analyst`, `Improve · my role: strategist`, `Control · my role: project manager`. Percentages in the body text (28%, 76%) and counts (99, 75, 68) are computed from `Story`, never typed.
- Produces: `StoryBox.astro` (no props) rendering `section.box#story`: header `How I work` with the small label `simulated data` and the KPI (`aria-live="polite"`); the five tab buttons (`#steps`, `aria-pressed`), the text column (`#txt`), the stage with `canvas#cv`, the Gantt plan overlay (`#plan`), the scenario slider (`#sl` with `input#rg`, label `Warehouse delays fixed:`), tooltip (`#tip`) and a visually hidden data table (`.sr`) wrapped in a `div` (a bare `table` cannot be shrunk to 1px). Step 1 text and the first KPI are server-rendered.
- `story.js` exports `initStory(box: HTMLElement): void`: draws the final layout of each step on the canvas (port `lay`, `hist`, `note`, `draw`, `words` without the scene animations, and `go(s, false)`), re-fits with `ResizeObserver`, moves between steps on tab click, autoplay `createTimer({duration: 9000})` with the same hold rules as the carousel, tab progress fill via CSS variable `--p`, tooltip on hover, slider `oninput` updating the scenario, ArrowLeft/ArrowRight when focus is inside the box and not on the slider, and `aria-label` plus data table updated per step.

- [ ] **Step 1: Server-render the box** (markup and copy as the mockup, English).
- [ ] **Step 2: Implement `story.js`** as small functions rather than the mockup's single block: layout per step, canvas notes, step navigation, scenario slider, autoplay, tooltip.
- [ ] **Step 3: Verify.** `npm run build` passes. For each of the five steps at the four viewports run `scripts/check-layout.js` (expect `bad: []`; note it clicks through the steps). KPI values: step 1 `356`, step 2 `99`, step 3 `75`, step 4 `68` at the default 50%, step 5 `6`. Dragging the slider to 100% shows `37`. Reduced motion: no step change after 15 seconds. JavaScript disabled: step 1 text and `simulated data` are visible.
- [ ] **Step 4: Commit** `feat: story box with static scenes, scenario slider and autoplay`.

---

### Task 9: Story scene animations

**Files:**
- Modify: `src/scripts/story.js`, `src/components/StoryBox.astro` (the week marker), `src/styles/dashboard.css`

**Interfaces:**
- Consumes: everything from Task 8.
- Produces: per-step scenes driven by an elapsed-time value `E` (milliseconds; `E = 1e9` means the final state). Port from the mockup's `go`, `draw`, `back`, `note`: `Define` orders fall in from above, then late ones pulse once (1500 ms onward); `Measure` columns stack, the 4-day line is drawn (1000 to 1400 ms), the late zone wipes in (1300 to 1900 ms) and the label `99 late · 28%` fades in (1800 to 2200 ms); `Analyze` rows form, the warehouse row highlights (1200 to 1700 ms), counts run up (1100 to 1900 ms), `76% of late orders` fades in (1900 to 2300 ms), other rows dim (1500 to 2000 ms); `Improve` the slider sweeps from 0 to the chosen value (starts after the morph, 1700 ms long) with squares easing toward each new position; `Control` a week marker (CSS, 4 s linear, 0.9 s delay) crosses the Gantt, and from `E = 2900` over 2000 ms the first `floor(75 * pct / 100)` orange squares turn blue one by one with a short pop, with the label `N of 75 target orders fixed`. The first load plays step 1. Dragging the slider plays only a 750 ms morph, never the whole scene.
- During the Improve sweep, `aria-live` on the KPI and the text column is switched off, then switched back on and the final text written once at the end.

- [ ] **Step 1: Add the scenes.** Keep the scene timing constants in one object at the top of `story.js`. The week marker is a `span.now` inside each Gantt `.bar`, shown only under `@media (prefers-reduced-motion: no-preference)`.
- [ ] **Step 2: Verify motion with a controlled clock.** In the page, override `performance.now` and `requestAnimationFrame` with a manual stepper (as in the review notes: advance in 16 ms frames) and call the step navigation. Check the mid-states: Define at 350 ms (orders above the stage), Measure at 1700 ms (zone partly wiped), Improve at 1900 ms (KPI between 99 and 68, slider between 0 and 50), Control at 3900 ms (some squares blue, counter between 0 and 37). Expected: all match, and the final states equal the Task 8 final states (KPI `68` at the end of Improve; the label `37 of 75 target orders fixed` at the end of Control with the default 50%).
- [ ] **Step 3: Verify reduced motion and layout.** Under reduced motion each step shows its final state immediately. `scripts/check-layout.js` is clean at the four viewports. Resizing the window during a scene produces no console error.
- [ ] **Step 4: Commit** `feat: animated story scenes`.

---

### Task 10: Align the inner pages

**Files:**
- Modify: `tailwind.config.mjs`, `src/styles/global.css`, `src/components/Navbar.astro` (only if a visual defect appears)

**Interfaces:**
- Consumes: palette and font from Global Constraints.
- Produces: the existing Tailwind tokens re-pointed to the new look so `/blog/`, `/blog/[slug]`, `/projects/`, `/projects/[slug]` and `/contact/` inherit it: `ink -> #10183F`, `paper -> #EBF0F8`, `surface -> #FFFFFF`, `subtle -> #DCE3F1`, `muted -> #4B557F`, `accent -> #2E4BD8`, `fontFamily.display` and `fontFamily.body` -> `['Schibsted Grotesk', 'sans-serif']`. Remove the radial orange gradient on `body` in `global.css` and the selection colour `#c8552a`. Navbar: keep Home, Portfolio, Blog; the Home link goes back to the dashboard.

- [ ] **Step 1: Change the tokens and the body gradient.**
- [ ] **Step 2: Verify.** `npm run build` passes. Open `/blog/`, `/blog/my-career-journey/`, `/projects/` and `/contact/`: no overlapping text, links readable (contrast of body text on `#EBF0F8` at least 4.5:1, use `ratio` from Task 4), and the navbar does not hide the page title. Fix defects with the smallest CSS change.
- [ ] **Step 3: Commit** `style: align inner pages with the dashboard palette and font`.

---

### Task 11: Final verification and release

**Files:**
- Modify: `.github/workflows/deploy.yml` (add a test step before the build)

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a green deploy of `main` to `https://riyooho.github.io`.

- [ ] **Step 1: Add `- name: Test` with `run: npm test` before `Build`** in `deploy.yml`.
- [ ] **Step 2: Full check.** `npm test` passes, `npm run build` passes, then the spec's definition of done: (1) no scroll or overflow at the four viewports for all five story steps; (2) no console errors; (3) contrast test green; keyboard path works (Tab reaches every control, focus ring visible, arrow keys move slides and steps); (4) reduced motion shows no movement; (5) no invented numbers, names or claims, placeholders and `simulated data` labelled; (6) every link goes to a real destination, none dead; (7) `dist/` has `me-crop.jpg` (small) and no `me.png`; (8) JavaScript disabled still shows profile, first slide, writing rows and story step 1.
- [ ] **Step 3: Commit** `ci: run tests before building`.
- [ ] **Step 4: Ask the owner before pushing.** Pushing to `main` deploys publicly. Show the owner the preview, list what is still a placeholder (projects, two articles, CV, simulated story), and push only on their yes. Never force-push.
- [ ] **Step 5: After the push**, watch the GitHub Actions run until green (`gh run watch`), then open `https://riyooho.github.io/` and repeat the no-scroll check once on the live site. Report failures with their output.

---

## Self-Review Notes

- **Spec coverage:** layout and boxes (Tasks 4 to 9), palette and font (Task 4, 10), data mapping and schema (Task 3), placeholders (Task 3), CV state (Task 5), inner pages (Task 10), accessibility and reduced motion (Tasks 2, 7, 8, 9), definition of done (Task 11). Mobile design and the owner's missing materials are out of scope by the spec (sections 2, 8, 12).
- **Layout traps found in the mockup:** the story canvas must be sized by its parent (`position:absolute; inset:0`) so it never forces a taller box, and the hidden data table must sit in a `div.sr` (a bare `table` ignores a 1px height and adds 40 to 80px of overflow). The `.box` entrance animation must stay inside the `no-preference` media query.
- **Known gaps:** `public/favicon.svg`, `apple-touch-icon.png` and `og-default.jpg` referenced by the head do not exist; Formspree `YOUR_FORM_ID` and the `@yourhandle` placeholder remain. Both are outside this plan and are listed in the spec.
