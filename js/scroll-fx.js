/* Лёгкая глубина при скролле (без scroll-jacking):
   - data-speed="1.12" — элемент едет чуть быстрее/медленнее обычного скролла;
   - data-drift — крупные заголовки сдвигаются по горизонтали при вертикальном скролле;
   - боковой индекс подсвечивает текущий раздел.
   Только transform. Отключено при reduced motion. */
(function () {
  const speedEls = [...document.querySelectorAll('[data-speed]')];
  const driftEls = [...document.querySelectorAll('[data-drift]')];

  if (!NI.reduced) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      speedEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const center = r.top + r.height / 2 - vh / 2;
        const k = parseFloat(el.dataset.speed) - 1;
        el.style.transform = `translate3d(0, ${(center * -k).toFixed(1)}px, 0)`;
      });
      driftEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = 1 - (r.top + r.height) / (vh + r.height); // 0..1 пока в кадре
        el.style.transform = `translate3d(${(p * 8).toFixed(2)}vw, 0, 0)`;
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // боковой индекс + активный пункт меню
  const index = document.querySelector('.side-index');
  const items = index ? [...index.querySelectorAll('li')] : [];
  const navLinks = [...document.querySelectorAll('.header__nav a')];
  const sections = ['index', 'work', 'webapp', 'video', 'photo', 'social', 'about']
    .map((id) => document.getElementById(id)).filter(Boolean);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      items.forEach((li) => li.classList.toggle('is-active', li.dataset.for === id));
      const navId = id === 'webapp' ? 'work' : id;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + navId));
      if (index) {
        index.classList.toggle('on-dark', id === 'video');
        index.classList.toggle('is-off', id === 'about' || id === 'index');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
})();
