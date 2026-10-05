/* SIGNATURE: «невесомая» композиция изображений.
   Не physics-движок, а своя пружинно-инерционная модель:
   - каждая картинка привязана к «дому» пружиной (медленно возвращается);
   - курсор отталкивает картинки в радиусе, скорость мыши добавляет импульс;
   - пока композиция «возбуждена», картинки мягко расталкивают друг друга;
   - вращение зависит от горизонтальной скорости (momentum);
   - у больших картинок больше масса — они ленивее.
   На тач-устройствах реагирует на палец и на скорость прокрутки. */
(function () {
  const stage = document.querySelector('[data-float]');
  if (!stage || NI.reduced) return;

  const items = [...stage.querySelectorAll('.float__item')].map((el) => ({
    el, x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0,
    cx: 0, cy: 0, size: 0, mass: 1,
    r0: parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0,
  }));

  const measure = () => {
    const s = stage.getBoundingClientRect();
    items.forEach((it) => {
      const r = it.el.getBoundingClientRect();
      // «дом» = центр картинки без текущего смещения, относительно вьюпорта
      it.cx = r.left + r.width / 2 - it.x - s.left;
      it.cy = r.top + r.height / 2 - it.y - s.top;
      it.size = Math.max(r.width, r.height);
      it.mass = 0.6 + it.size / 400;
    });
  };

  const pointer = { x: -9999, y: -9999, active: false };
  let excite = 0;

  stage.addEventListener('pointermove', (e) => {
    const s = stage.getBoundingClientRect();
    pointer.x = e.clientX - s.left;
    pointer.y = e.clientY - s.top;
    pointer.active = true;
  });
  ['pointerleave', 'pointercancel', 'pointerup'].forEach((t) =>
    stage.addEventListener(t, (e) => { if (t !== 'pointerup' || e.pointerType !== 'mouse') pointer.active = false; }));

  // на телефоне — импульс от скорости прокрутки
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    if (NI.finePointer) return;
    items.forEach((it, i) => {
      const dir = i % 2 ? 1 : -1;
      it.vy += NI.clamp(dy, -40, 40) * 0.04 / it.mass;
      it.vx += dir * Math.abs(NI.clamp(dy, -40, 40)) * 0.03 / it.mass;
    });
    excite = Math.min(1, excite + Math.abs(dy) * 0.004);
    loop.wake();
  }, { passive: true });

  const K = 0.010;        // жёсткость пружины к дому (мало = медленный возврат)
  const DAMP = 0.90;      // затухание скорости
  const RADIUS = 240;     // радиус влияния курсора
  const PUSH = 1.5;       // сила отталкивания

  let last = performance.now();
  const loop = NI.loopWhileVisible(stage, (now) => {
    const dt = Math.min(2.5, (now - last) / 16.67); // нормируем к 60fps
    last = now;
    const m = NI.mouse;

    excite = pointer.active ? NI.lerp(excite, 1, 0.08) : excite * Math.pow(0.985, dt);

    items.forEach((it) => {
      const px = it.cx + it.x, py = it.cy + it.y;
      let fx = -K * it.x, fy = -K * it.y;

      if (pointer.active) {
        const dx = px - pointer.x, dy = py - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        const R = RADIUS + it.size * 0.35;
        if (d < R) {
          const f = Math.pow(1 - d / R, 2) * PUSH;
          fx += (dx / d) * f + m.vx * f * 0.6;
          fy += (dy / d) * f + m.vy * f * 0.6;
          it.va += m.vx * f * 0.08;
        }
      }
      it.fx = fx; it.fy = fy;
    });

    // мягкое взаимное расталкивание, пока композиция «разбужена»
    if (excite > 0.02) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          const dx = (b.cx + b.x) - (a.cx + a.x), dy = (b.cy + b.y) - (a.cy + a.y);
          const d = Math.hypot(dx, dy) || 1;
          const min = (a.size + b.size) * 0.42;
          if (d < min) {
            const f = (1 - d / min) * 0.35 * excite;
            a.fx -= (dx / d) * f; a.fy -= (dy / d) * f;
            b.fx += (dx / d) * f; b.fy += (dy / d) * f;
          }
        }
      }
    }

    let energy = 0;
    items.forEach((it) => {
      it.vx = (it.vx + (it.fx / it.mass) * dt) * Math.pow(DAMP, dt);
      it.vy = (it.vy + (it.fy / it.mass) * dt) * Math.pow(DAMP, dt);
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      it.va = (it.va + (-0.012 * it.a + it.vx * 0.006) * dt) * Math.pow(0.9, dt);
      it.a = NI.clamp(it.a + it.va * dt, -14, 14);
      energy += Math.abs(it.vx) + Math.abs(it.vy) + Math.abs(it.x) * 0.01 + Math.abs(it.y) * 0.01;
      it.el.style.transform =
        `translate(-50%, -50%) translate3d(${it.x.toFixed(2)}px, ${it.y.toFixed(2)}px, 0) rotate(${(it.r0 + it.a).toFixed(2)}deg)`;
    });

    // засыпаем, когда всё вернулось на место
    if (!pointer.active && energy < 0.05 && excite < 0.02) return false;
  });

  stage.addEventListener('pointerenter', () => { last = performance.now(); loop.wake(); });
  stage.addEventListener('pointermove', () => loop.wake());
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', () => { if (pointer.active) measure(); }, { passive: true });
  measure();
})();
