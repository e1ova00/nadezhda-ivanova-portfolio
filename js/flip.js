/* Flip-карточки: разворот на 180° по Y.
   Мышь — при наведении; тач и клавиатура — по нажатию / Enter.
   Наклон по курсору на родителе сознательно НЕ добавляем:
   два независимых 3D-transform на разных уровнях ломают рендеринг. */
(function () {
  document.querySelectorAll('.flip').forEach((card) => {
    card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') card.classList.add('is-flipped'); });
    card.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') card.classList.remove('is-flipped'); });
    card.addEventListener('click', (e) => { if (e.pointerType !== 'mouse') card.classList.toggle('is-flipped'); });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flipped'); }
    });
  });
})();
