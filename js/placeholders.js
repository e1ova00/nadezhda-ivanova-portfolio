/* Подстановка медиа: элемент с data-ph="папка/файл.jpg" пытается загрузить
   этот файл. Есть файл — показываем картинку. Нет — серая заглушка с путём,
   чтобы было видно, какой файл и куда положить. Картинки грузятся лениво. */
(function () {
  const els = document.querySelectorAll('[data-ph]');

  const load = (el) => {
    const src = el.dataset.ph;
    const img = new Image();
    img.decoding = 'async';
    img.alt = el.getAttribute('aria-label') || '';
    img.className = 'ph-img';
    img.draggable = false;
    img.onload = () => { el.classList.remove('is-missing'); el.prepend(img); el.dataset.loaded = '1'; };
    img.onerror = () => el.classList.add('is-missing');
    img.src = src;
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { load(e.target); io.unobserve(e.target); }
    });
  }, { rootMargin: '600px 0px' });

  els.forEach((el) => io.observe(el));
})();
