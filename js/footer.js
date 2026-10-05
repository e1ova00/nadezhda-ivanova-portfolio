/* Подвал реагирует на мышь: крупное «Написать» и стрелка
   смещаются за курсором с разной скоростью. */
(function () {
  const footer = document.querySelector('[data-footer]');
  const word = footer && footer.querySelector('[data-footer-word]');
  if (!word || !NI.finePointer || NI.reduced) return;
  const [text, arrow] = word.querySelectorAll('span');
  footer.addEventListener('pointermove', (e) => {
    const r = footer.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    text.style.transform = `translate3d(${(px * 40).toFixed(1)}px, 0, 0)`;
    arrow.style.transform = `translate3d(${(px * 90).toFixed(1)}px, ${(py * 30).toFixed(1)}px, 0) rotate(${(px * 45).toFixed(1)}deg)`;
  });
  footer.addEventListener('pointerleave', () => { text.style.transform = ''; arrow.style.transform = ''; });
})();
