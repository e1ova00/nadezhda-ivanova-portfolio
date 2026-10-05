/* Хедер: после небольшого скролла становится компактным,
   при скролле вниз прячется, при скролле вверх возвращается.
   Плюс живые часы Санкт-Петербурга. */
(function () {
  const header = document.querySelector('[data-header]');
  if (header) {
    let lastY = window.scrollY, ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      header.classList.toggle('is-compact', y > 40);
      if (Math.abs(y - lastY) > 6) {
        header.classList.toggle('is-hidden', y > lastY && y > 200);
        lastY = y;
      }
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    update();
  }

  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });
    const tick = () => { clock.textContent = 'СПб ' + fmt.format(new Date()); };
    tick();
    setInterval(tick, 15000);
  }
})();
