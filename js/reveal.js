/* Scroll-reveal логическими блоками через IntersectionObserver.
   Каждый блок появляется один раз и больше не отслеживается.
   data-reveal="lines" — текст делится на строки и выезжает из-под маски построчно. */
(function () {
  const blocks = document.querySelectorAll('[data-reveal]');

  // разбивка на строки по фактическому переносу (после загрузки шрифтов)
  const splitLines = (el) => {
    const target = el.querySelector('.todo') || el;
    const words = target.textContent.trim().split(/\s+/);
    target.textContent = '';
    const spans = words.map((w) => {
      const s = document.createElement('span');
      s.textContent = w + ' ';
      s.style.display = 'inline';
      target.appendChild(s);
      return s;
    });
    const lines = [];
    let top = null;
    spans.forEach((s) => {
      const t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 2) { lines.push([]); top = t; }
      lines[lines.length - 1].push(s.textContent);
    });
    target.textContent = '';
    lines.forEach((words, i) => {
      const line = document.createElement('span');
      line.className = 'line';
      const inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      inner.textContent = words.join('').trim();
      line.appendChild(inner);
      target.appendChild(line);
    });
  };

  const run = () => {
    if (!NI.reduced) document.querySelectorAll('[data-reveal="lines"]').forEach(splitLines);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    blocks.forEach((b) => io.observe(b));
  };

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(run);
})();
