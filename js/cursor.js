/* Кастомный курсор: точка со сглаживанием + короткий хвост.
   Над элементами с data-cursor="VIEW|DRAG|PLAY|OPEN" превращается в круг с подписью.
   Только для мыши; на тач-устройствах и при reduced motion — системный курсор. */
(function () {
  const { lerp } = NI;
  const root = document.querySelector('.cursor');
  if (!root || !NI.finePointer || NI.reduced) return;

  document.documentElement.classList.add('has-cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  const label = root.querySelector('.cursor__label');

  const TRAIL = 6;
  const trail = Array.from({ length: TRAIL }, () => {
    const el = document.createElement('div');
    el.className = 'cursor__trail';
    root.appendChild(el);
    return { el, x: NI.mouse.x, y: NI.mouse.y };
  });

  const pos = { x: NI.mouse.x, y: NI.mouse.y };
  const ringPos = { x: pos.x, y: pos.y };
  let inTrailZone = false;

  function tick() {
    const m = NI.mouse;
    pos.x = lerp(pos.x, m.x, 0.35);
    pos.y = lerp(pos.y, m.y, 0.35);
    ringPos.x = lerp(ringPos.x, m.x, 0.18);
    ringPos.y = lerp(ringPos.y, m.y, 0.18);
    dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

    // хвост: каждый сегмент догоняет предыдущий — отставание нарастает
    let px = pos.x, py = pos.y;
    trail.forEach((t, i) => {
      t.x = lerp(t.x, px, 0.42 - i * 0.04);
      t.y = lerp(t.y, py, 0.42 - i * 0.04);
      const k = 1 - (i + 1) / (TRAIL + 1);
      const angle = Math.atan2(py - t.y, px - t.x);
      const visible = inTrailZone ? k * 0.9 : k * 0.25; // в архиве фото хвост ярче
      t.el.style.opacity = root.classList.contains('is-active') ? 0 : visible;
      t.el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) rotate(${angle}rad) scale(${0.4 + k * 0.8}, ${0.4 + k * 0.6})`;
      px = t.x; py = t.y;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // смена режима курсора по контексту
  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('[data-cursor]');
    if (target) {
      label.textContent = target.dataset.cursor;
      root.classList.add('is-active');
    } else {
      root.classList.remove('is-active');
    }
    inTrailZone = !!e.target.closest('[data-trail]');
  });
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => root.classList.remove('is-hidden'));
})();
