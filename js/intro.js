/* Intro первого экрана:
   1) имя разбивается на буквы, каждая — в обёртке overflow:hidden;
   2) буквы по очереди выезжают снизу;
   3) после конца анимации ставим .is-done — финальное состояние фиксировано,
      transition выключен, и дальше transform буквы управляет только JS
      (реакция на близость курсора) — буква не «откатится» вниз;
   4) затем проявляются портрет и подписи (CSS, класс .is-loaded на <html>).
   При повторном заходе в той же вкладке intro короче. */
(function () {
  const html = document.documentElement;
  const title = document.querySelector('[data-split]');
  const repeat = sessionStorage.getItem('ni-intro') === '1';
  try { sessionStorage.setItem('ni-intro', '1'); } catch (e) {}
  if (repeat) html.classList.add('is-repeat');

  const chars = [];
  if (title) {
    title.querySelectorAll('span').forEach((line) => {
      const text = line.textContent;
      line.textContent = '';
      line.setAttribute('aria-hidden', 'true');
      [...text].forEach((ch) => {
        const wrap = document.createElement('span');
        wrap.className = 'char-wrap';
        const c = document.createElement('span');
        c.className = 'char';
        c.textContent = ch;
        wrap.appendChild(c);
        line.appendChild(wrap);
        chars.push(c);
      });
    });
  }

  const STAGGER = repeat ? 12 : 45;
  const DURATION = 900;

  const start = () => {
    if (NI.reduced) {
      chars.forEach((c) => c.classList.add('is-done'));
      html.classList.add('is-loaded');
      return;
    }
    chars.forEach((c, i) => {
      c.style.setProperty('--d', `${i * STAGGER}ms`);
      c.classList.add('is-in');
    });
    html.classList.add('is-loaded');
    const total = chars.length * STAGGER + DURATION + 50;
    setTimeout(() => {
      chars.forEach((c) => { c.classList.remove('is-in'); c.classList.add('is-done'); });
      startProximity();
    }, total);
  };

  // ждём шрифты (но не дольше 1 с), чтобы буквы не прыгали
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1000))]).then(() => requestAnimationFrame(start));

  /* Буквы слегка приподнимаются и наклоняются рядом с курсором.
     Эффект плавно затухает к краю радиуса. */
  function startProximity() {
    if (!NI.finePointer || NI.reduced || !title) return;
    const RADIUS = 220;
    const state = chars.map(() => ({ lift: 0, tilt: 0 }));
    let rects = [];
    const measure = () => {
      rects = chars.map((c) => {
        const r = c.parentNode.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height };
      });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });

    NI.loopWhileVisible(title, () => {
      const m = NI.mouse;
      chars.forEach((c, i) => {
        const r = rects[i];
        const dx = m.x - r.x, dy = m.y - r.y;
        const d = Math.hypot(dx, dy);
        const f = d < RADIUS ? Math.pow(1 - d / RADIUS, 2) : 0;   // затухание
        const s = state[i];
        s.lift = NI.lerp(s.lift, -f * r.h * 0.09, 0.12);
        s.tilt = NI.lerp(s.tilt, f * NI.clamp(dx / RADIUS, -1, 1) * -6, 0.12);
        c.style.setProperty('--lift', `${s.lift.toFixed(2)}px`);
        c.style.setProperty('--tilt', `${s.tilt.toFixed(2)}deg`);
      });
    });
  }

  /* Портрет мягко смещается относительно текста за мышью (лёгкий параллакс). */
  const portrait = document.querySelector('[data-parallax-mouse]');
  if (portrait && NI.finePointer && !NI.reduced) {
    let x = 0, y = 0;
    NI.loopWhileVisible(portrait, () => {
      const tx = (NI.mouse.x / window.innerWidth - 0.5) * -22;
      const ty = (NI.mouse.y / window.innerHeight - 0.5) * -14;
      x = NI.lerp(x, tx, 0.06);
      y = NI.lerp(y, ty, 0.06);
      portrait.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });
  }
})();
