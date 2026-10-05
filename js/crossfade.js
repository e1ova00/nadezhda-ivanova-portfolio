/* Скролл-зависимый переход между двумя слоями (desktop → mobile).
   Прогресс 0..1 считается через getBoundingClientRect() блока.
   Слой A уменьшается и гаснет, слой B растёт и проявляется.
   Отключено на мобильной раскладке и при reduced motion. */
(function () {
  const blocks = [...document.querySelectorAll('[data-crossfade]')];
  if (!blocks.length) return;

  const setup = () => {
    const on = NI.desktop && !NI.reduced;
    blocks.forEach((b) => {
      b.classList.toggle('is-crossfade', on);
      if (!on) b.querySelectorAll('.crossfade__layer').forEach((l) => { l.style.transform = ''; l.style.opacity = ''; });
    });
    if (on) update();
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    if (!NI.desktop || NI.reduced) return;
    const vh = window.innerHeight;
    blocks.forEach((b) => {
      const r = b.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = NI.clamp((vh * 0.14 - r.top) / (r.height - vh * 0.86), 0, 1);
      const e = p * p * (3 - 2 * p); // smoothstep
      const a = b.querySelector('.crossfade__layer--a');
      const c = b.querySelector('.crossfade__layer--b');
      a.style.transform = `scale(${(1 - e * 0.3).toFixed(4)})`;
      a.style.opacity = (1 - e).toFixed(3);
      c.style.transform = `scale(${(0.8 + e * 0.2).toFixed(4)})`;
      c.style.opacity = e.toFixed(3);
    });
  };

  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  NI.mq.desktop.addEventListener('change', setup);
  NI.mq.reduce.addEventListener('change', setup);
  setup();
})();
