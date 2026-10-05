/* «Шторка» для перехода по внутренним ссылкам меню:
   сплошной блок наезжает → мгновенный прыжок к разделу → блок уезжает.
   При reduced motion — обычный переход по якорю. */
(function () {
  const curtain = document.querySelector('.curtain');
  const label = curtain && curtain.querySelector('.curtain__label');
  if (!curtain) return;
  let busy = false;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || busy || NI.reduced) return;
    const id = link.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    busy = true;

    label.textContent = link.textContent.trim() || id;
    curtain.classList.remove('is-out');
    curtain.classList.add('is-in');

    setTimeout(() => {
      const html = document.documentElement;
      html.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start' });
      history.pushState(null, '', '#' + id);
      html.style.scrollBehavior = '';
      curtain.classList.remove('is-in');
      curtain.classList.add('is-out');
      setTimeout(() => {
        curtain.classList.remove('is-out');
        busy = false;
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 650);
    }, 520);
  });
})();
