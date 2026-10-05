/* Магнитные элементы: компактные кнопки/ссылки тянутся к курсору
   внутри своей области и пружинят обратно. Только мышь. */
(function () {
  if (!NI.finePointer || NI.reduced) return;
  const STRENGTH = 0.32;   // доля смещения от расстояния до центра
  const MAX = 14;          // предел в px

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    // защита от широких блоков: магнит только для компактных элементов
    const r0 = el.getBoundingClientRect();
    if (r0.width > 320) return;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const animate = () => {
      x = NI.lerp(x, tx, 0.2);
      y = NI.lerp(y, ty, 0.2);
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (Math.abs(x - tx) > 0.05 || Math.abs(y - ty) > 0.05) raf = requestAnimationFrame(animate);
      else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate); };

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      tx = NI.clamp(dx * STRENGTH, -MAX, MAX);
      ty = NI.clamp(dy * STRENGTH, -MAX, MAX);
      kick();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });
})();
