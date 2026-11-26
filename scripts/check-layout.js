// Paste into a browser console (or run through a browser tool) on the home page.
// Passing means: scroll === 0 and bad is empty, for every story step.
(async () => {
  const steps = [...document.querySelectorAll('#steps button')];
  const measure = () => ({
    scroll: document.documentElement.scrollHeight - innerHeight,
    bad: [...document.querySelectorAll('.box')]
      .map((b) => [b.id, b.scrollHeight - b.clientHeight, b.scrollWidth - b.clientWidth])
      .filter((r) => r[1] || r[2]),
  });
  const runs = [];
  for (const b of steps.length ? steps : [null]) {
    if (b) {
      b.click();
      await new Promise((r) => setTimeout(r, 300));
    }
    runs.push(measure());
  }
  const result = { w: innerWidth, h: innerHeight, scroll: Math.max(...runs.map((r) => r.scroll)), bad: runs.flatMap((r) => r.bad) };
  console.log(JSON.stringify(result));
  return result;
})();
