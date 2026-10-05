/* Видео: при наведении — короткое беззвучное превью,
   по клику — раскрытие почти на весь экран (clip-path reveal).
   Файлы видео грузятся только по требованию (lazy). */
(function () {
  const modal = document.querySelector('[data-video-modal]');
  const player = modal && modal.querySelector('video');
  const missing = modal && modal.querySelector('.modal__missing');

  document.querySelectorAll('[data-video]').forEach((btn) => {
    const media = btn.querySelector('.reel__media');
    const src = btn.dataset.video;
    let preview = null;

    if (NI.finePointer && !NI.reduced) {
      btn.addEventListener('pointerenter', () => {
        if (!preview) {
          preview = document.createElement('video');
          preview.className = 'preview';
          preview.muted = true; preview.loop = true; preview.playsInline = true;
          preview.preload = 'metadata';
          preview.setAttribute('aria-hidden', 'true');
          preview.addEventListener('error', () => { preview.remove(); preview = 'none'; });
          preview.src = src;
          media.appendChild(preview);
        }
        if (preview !== 'none') preview.play().catch(() => {});
      });
      btn.addEventListener('pointerleave', () => { if (preview && preview !== 'none') preview.pause(); });
    }

    btn.addEventListener('click', () => {
      NI.openModal(modal, btn, () => {
        missing.hidden = true; player.hidden = false;
        player.onerror = () => {
          player.hidden = true; missing.hidden = false;
          missing.textContent = `Здесь будет видео: ${src}`;
        };
        player.src = src;
        player.play().catch(() => {});
      });
    });
  });
})();
