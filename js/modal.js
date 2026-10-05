/* Общий механизм раскрытия: окно открывается из прямоугольника
   исходного элемента через clip-path (mask reveal) и закрывается обратно. */
(function () {
  let current = null, returnFocus = null;

  const insetFrom = (clip, rect) => {
    const c = clip.getBoundingClientRect();
    const t = Math.max(0, rect.top - c.top), l = Math.max(0, rect.left - c.left);
    const r = Math.max(0, c.right - rect.right), b = Math.max(0, c.bottom - rect.bottom);
    return `${t}px ${r}px ${b}px ${l}px`;
  };

  NI.openModal = (modal, fromEl, onOpen) => {
    const clip = modal.querySelector('.modal__clip');
    returnFocus = document.activeElement;
    modal.hidden = false;
    onOpen && onOpen();
    const rect = fromEl.getBoundingClientRect();
    clip.style.transition = 'none';
    clip.style.setProperty('--clip', NI.reduced ? '0 0 0 0' : insetFrom(clip, rect));
    clip.getBoundingClientRect(); // reflow
    clip.style.transition = '';
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      clip.style.setProperty('--clip', '0px 0px 0px 0px');
    });
    current = { modal, fromEl };
    modal.querySelector('[data-close]').focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';
  };

  NI.closeModal = () => {
    if (!current) return;
    const { modal, fromEl } = current;
    const clip = modal.querySelector('.modal__clip');
    clip.style.setProperty('--clip', NI.reduced ? '0 0 0 0' : insetFrom(clip, fromEl.getBoundingClientRect()));
    modal.classList.remove('is-open');
    const v = modal.querySelector('video');
    if (v) v.pause();
    setTimeout(() => {
      modal.hidden = true;
      if (v) { v.removeAttribute('src'); v.load(); }
    }, NI.reduced ? 0 : 450);
    document.body.style.overflow = '';
    returnFocus && returnFocus.focus && returnFocus.focus({ preventScroll: true });
    current = null;
  };

  NI.modalOpen = () => !!current;

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') NI.closeModal(); });
  document.querySelectorAll('.modal').forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target.closest('[data-close]')) NI.closeModal();
    });
  });

  /* открыть картинку (фото / скриншот) */
  const photoModal = document.querySelector('[data-photo-modal]');
  NI.openImage = (el) => {
    if (!photoModal) return;
    const img = photoModal.querySelector('img');
    const missing = photoModal.querySelector('.modal__missing');
    const src = el.querySelector('img.ph-img');
    NI.openModal(photoModal, el, () => {
      if (src) {
        img.hidden = false; missing.hidden = true;
        img.src = src.src; img.alt = src.alt || '';
      } else {
        img.hidden = true; missing.hidden = false;
        missing.textContent = `Здесь будет файл: ${el.dataset.ph}`;
      }
    });
  };
})();
