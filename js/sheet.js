/* Фото-архив как «contact sheet».
   Десктоп: фотографии лежат стопкой в центре и по мере прокрутки
   расходятся по «столу» в свои позиции (--tx/--ty). Любую можно
   перетащить; клик без перетаскивания — открыть фото.
   При быстром скролле фото получают лёгкий skew.
   Мобильный / reduced motion: обычная раскладка, тап — открыть. */
(function () {
  const sheet = document.querySelector('[data-sheet]');
  if (!sheet) return;
  const stage = sheet.querySelector('.sheet__stage');
  const items = [...sheet.querySelectorAll('.sheet__item')].map((el, i) => {
    const cs = getComputedStyle(el);
    return {
      el, i,
      tx: parseFloat(cs.getPropertyValue('--tx')) / 100 || 0,
      ty: parseFloat(cs.getPropertyValue('--ty')) / 100 || 0,
      r: parseFloat(cs.getPropertyValue('--r')) || 0,
      dx: 0, dy: 0,
    };
  });

  let on = false, progress = 0, skew = 0, lastY = window.scrollY, z = 10;

  const place = () => {
    if (!on) return;
    const w = stage.offsetWidth, h = stage.offsetHeight;
    const e = progress * progress * (3 - 2 * progress);
    items.forEach((it) => {
      // в стопке — лёгкое смещение и поворот, чтобы читалась пачка
      const sx = (it.i - items.length / 2) * 4 * (1 - e);
      const x = it.tx * w * e + sx + it.dx;
      const y = it.ty * h * e - it.i * 3 * (1 - e) + it.dy;
      const rot = it.r * (0.5 + e * 0.5);
      it.el.style.transform =
        `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) skewY(${skew.toFixed(2)}deg)`;
    });
  };

  const setup = () => {
    on = NI.desktop && !NI.reduced;
    sheet.classList.toggle('is-scatter', on);
    if (!on) items.forEach((it) => { it.el.style.transform = ''; it.el.style.zIndex = ''; });
    update();
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    if (!on) return;
    const r = sheet.getBoundingClientRect();
    const vh = window.innerHeight;
    progress = NI.clamp(-r.top / (r.height - vh) * 1.35, 0, 1);
    const vel = window.scrollY - lastY;
    lastY = window.scrollY;
    skew = NI.lerp(skew, NI.clamp(vel * 0.05, -3, 3), 0.3);
    place();
    if (Math.abs(skew) > 0.02) { ticking = true; requestAnimationFrame(() => { lastY = window.scrollY; skew *= 0.85; update(); }); }
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  NI.mq.desktop.addEventListener('change', setup);

  // перетаскивание + клик
  items.forEach((it) => {
    let sx = 0, sy = 0, ox = 0, oy = 0, id = null, moved = false;
    it.el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      id = e.pointerId; moved = false;
      sx = e.clientX; sy = e.clientY; ox = it.dx; oy = it.dy;
      if (on) { it.el.setPointerCapture(id); it.el.style.zIndex = ++z; }
    });
    it.el.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id || !on) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      moved = true;
      it.el.classList.add('is-dragging');
      it.dx = ox + dx; it.dy = oy + dy;
      place();
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      it.el.classList.remove('is-dragging');
    };
    it.el.addEventListener('pointerup', end);
    it.el.addEventListener('pointercancel', end);
    it.el.addEventListener('click', () => { if (!moved) NI.openImage(it.el); moved = false; });
    it.el.addEventListener('keydown', (e) => { if (e.key === 'Enter') NI.openImage(it.el); });
  });

  setup();
})();
