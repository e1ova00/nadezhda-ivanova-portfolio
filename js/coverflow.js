/* 3D-карусель (coverflow) для скриншотов UX/UI-проектов.
   Активный слайд по центру; соседние уменьшены, сдвинуты, повёрнуты по Y
   и отодвинуты по Z; дальние почти прозрачны.
   Управление: стрелки, ←/→ на клавиатуре, драг мышью/свайп пальцем
   (с порогом, чтобы клик не считался свайпом). Клик по центральному — открыть. */
(function () {
  const root = document.querySelector('[data-coverflow]');
  if (!root) return;
  const track = root.querySelector('.coverflow__track');
  const slides = [...root.querySelectorAll('.coverflow__slide')];
  const titleEl = root.querySelector('[data-title]');
  const countEl = root.querySelector('[data-count]');
  const total = slides.length;
  const pad = (n) => String(n).padStart(2, '0');

  let active = 0, drag = 0, spacing = 300;

  const measure = () => { spacing = slides[0].offsetWidth * (window.innerWidth < 768 ? 0.78 : 0.62); };

  const render = () => {
    const shift = drag / spacing;
    slides.forEach((s, i) => {
      // кольцо: у первого слайда слева виден последний
      let o = i - active + shift;
      o = ((o + total / 2) % total + total) % total - total / 2;
      const ao = Math.abs(o);
      const side = Math.max(-1, Math.min(1, o));
      const x = o * spacing;
      const z = -Math.min(ao, 3) * 240;
      const ry = -side * 38;
      const sc = 1 - Math.min(ao, 2) * 0.1;
      s.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, 0, ${z}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      s.style.opacity = ao > 2.6 ? 0 : (1 - Math.min(ao, 2.4) * 0.38).toFixed(3);
      s.style.zIndex = 100 - Math.round(ao * 10);
      s.setAttribute('aria-hidden', i === active ? 'false' : 'true');
    });
    // название движется независимо от изображения — с отставанием
    titleEl.style.transform = `translate3d(${(drag * 0.25).toFixed(1)}px, 0, 0)`;
  };

  const setTitle = (text) => {
    if (titleEl.textContent === text) return;
    if (NI.reduced || !titleEl.textContent) { titleEl.textContent = text; return; }
    titleEl.classList.add('is-swap');
    setTimeout(() => { titleEl.textContent = text; titleEl.classList.remove('is-swap'); }, 350);
  };

  const go = (i) => {
    active = (i + total) % total;
    countEl.textContent = `${pad(active + 1)} / ${pad(total)}`;
    setTitle(slides[active].dataset.project);
    render();
  };

  root.querySelector('[data-prev]').addEventListener('click', () => go(active - 1));
  root.querySelector('[data-next]').addEventListener('click', () => go(active + 1));

  // клавиатура: когда карусель в фокусе или на экране
  let inView = false;
  new IntersectionObserver(([e]) => { inView = e.intersectionRatio > 0.5; }, { threshold: [0, 0.5, 1] }).observe(root);
  document.addEventListener('keydown', (e) => {
    if (!inView || (NI.modalOpen && NI.modalOpen())) return;
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') { go(active - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(active + 1); e.preventDefault(); }
  });

  // драг / свайп
  const THRESHOLD = 8;   // px до начала драга
  const SWIPE = 50;      // px, чтобы переключить слайд
  let startX = 0, startY = 0, pointerId = null, dragging = false, moved = false;

  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    pointerId = e.pointerId; startX = e.clientX; startY = e.clientY;
    dragging = false; moved = false;
  });
  track.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!dragging) {
      if (Math.abs(dx) < THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
      dragging = true; moved = true;
      track.setPointerCapture(pointerId);
      root.classList.add('is-dragging');
    }
    drag = dx;
    render();
  });
  const end = (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    const steps = Math.abs(drag) > SWIPE ? Math.max(1, Math.round(Math.abs(drag) / spacing)) * -Math.sign(drag) : 0;
    drag = 0;
    go(active + steps);
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);

  slides.forEach((s, i) => s.addEventListener('click', () => {
    if (moved) { moved = false; return; }
    if (i === active) NI.openImage && NI.openImage(s);
    else go(i);
  }));

  window.addEventListener('resize', () => { measure(); render(); });
  measure();
  go(0);
})();
