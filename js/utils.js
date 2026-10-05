/* Общие помощники. Всё складываем в window.NI, чтобы скрипты работали
   даже при открытии index.html двойным кликом (без сервера и модулей). */
(function () {
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mqDesktop = window.matchMedia('(min-width: 1100px)');

  const NI = {
    get reduced() { return mqReduce.matches; },
    get finePointer() { return mqFine.matches; },
    get desktop() { return mqDesktop.matches; },
    mq: { reduce: mqReduce, fine: mqFine, desktop: mqDesktop },

    lerp: (a, b, t) => a + (b - a) * t,
    clamp: (v, min, max) => Math.min(max, Math.max(min, v)),

    /* последняя позиция мыши во вьюпорте — общая для всех эффектов */
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 },

    /* rAF-цикл, который работает только пока элемент виден */
    loopWhileVisible(el, tick) {
      let running = false, visible = false, id = 0;
      const frame = (t) => {
        if (!visible) { running = false; return; }
        const keep = tick(t);
        if (keep === false) { running = false; return; }
        id = requestAnimationFrame(frame);
      };
      const start = () => { if (!running && visible) { running = true; id = requestAnimationFrame(frame); } };
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: '100px' }).observe(el);
      return { wake: start };
    },
  };

  let lastX = NI.mouse.x, lastY = NI.mouse.y, lastT = performance.now();
  window.addEventListener('pointermove', (e) => {
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    NI.mouse.vx = (e.clientX - lastX) / dt;
    NI.mouse.vy = (e.clientY - lastY) / dt;
    NI.mouse.x = lastX = e.clientX;
    NI.mouse.y = lastY = e.clientY;
    lastT = now;
  }, { passive: true });

  window.NI = NI;
})();
