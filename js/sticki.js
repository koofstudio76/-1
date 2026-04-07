
/* Минимальный JS: привязка .railmenu к секциям + синхронизация слайдов */
(function() {
  const railMenus  = Array.from(document.querySelectorAll('[data-role="railmenu"]'));
  const menuLinks  = railMenus.flatMap(m => Array.from(m.querySelectorAll('a')));
  const sections   = Array.from(document.querySelectorAll('.section'));
  const slides     = Array.from(document.querySelectorAll('.slide'));

  const byKey = (list) => Object.fromEntries(list.map(el => [el.dataset.key || el.dataset.target, el]));
  const sectionsByKey = byKey(sections);
  const slidesByKey   = byKey(slides);

  let activeKey = 'tasks';

  function setActive(key) {
    if (!key || key === activeKey) return;
    activeKey = key;

    // активный пункт меню (во всех меню)
    menuLinks.forEach(a => a.classList.toggle('is-active', a.dataset.target === key));

    // слайды слева
    slides.forEach(s => {
      const on = s.dataset.key === key;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', String(!on));
    });
  }

  // Observer: следим, какая секция в зоне видимости
  const io = new IntersectionObserver((entries) => {
    const top = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (top) setActive(top.target.dataset.key);
  }, { root: null, threshold: [0.25, 0.5, 0.6, 0.75] });

  sections.forEach(sec => io.observe(sec));

  // Клик по пункту: плавный скролл
  menuLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const key = a.dataset.target;
      const target = sectionsByKey[key];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${key}`);
      }
    });
  });

  // Если есть hash — активируем соответствующий пункт на загрузке
  function applyHash() {
    const id = location.hash.replace('#','');
    if (id && sectionsByKey[id]) setActive(id);
  }
  window.addEventListener('hashchange', applyHash);
  applyHash();
})();