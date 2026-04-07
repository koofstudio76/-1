/* Hero clip-text: фон = srcImg (опционально для вашей главной) */
(function(){
  var img = document.getElementById('srcImg');
  var hero = document.getElementById('hero');
  if (img && img.getAttribute('src') && hero) {
    hero.style.setProperty('--hero-bg', "url('" + img.getAttribute('src') + "')");
  }
}());

/* Открытие/закрытие оверлея */
const burger = document.querySelector('.burger');
const menuEl = document.getElementById('menu');

if (burger && menuEl) {
  burger.addEventListener('click', () => {
    const exp = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!exp));
    menuEl.classList.toggle('is-open', !exp);
    menuEl.setAttribute('aria-hidden', String(exp));
    document.body.style.overflow = !exp ? 'hidden' : '';
  });
}

/* Превью + темы фона */
const list = document.getElementById('menuList');
const ph   = document.getElementById('ph');
const previewCol = document.getElementById('previewCol');

function applyTheme(theme){
  switch(theme){
    case 'green':
      menuEl.style.setProperty('--menu-bg1','var(--velvet-green-1)');
      menuEl.style.setProperty('--menu-bg2','var(--velvet-green-2)');
      menuEl.style.setProperty('--menu-bg3','var(--velvet-green-3)');
      previewCol.style.background='radial-gradient(120% 90% at 50% 20%, #0f1f18,#0b1511 55%,#09110e)';
      break;
    case 'cherry':
      menuEl.style.setProperty('--menu-bg1','var(--cherry-1)');
      menuEl.style.setProperty('--menu-bg2','var(--cherry-2)');
      menuEl.style.setProperty('--menu-bg3','var(--cherry-3)');
      previewCol.style.background='radial-gradient(120% 90% at 50% 20%, #34121f,#2a0d18 55%,#1f0a12)';
      break;
    case 'navy':
      menuEl.style.setProperty('--menu-bg1','var(--navy-1)');
      menuEl.style.setProperty('--menu-bg2','var(--navy-2)');
      menuEl.style.setProperty('--menu-bg3','var(--navy-3)');
      previewCol.style.background='radial-gradient(120% 90% at 50% 20%, #0f1e44,#0b1633 55%,#091227)';
      break;
    case 'orange':
      menuEl.style.setProperty('--menu-bg1','var(--orange-1)');
      menuEl.style.setProperty('--menu-bg2','var(--orange-2)');
      menuEl.style.setProperty('--menu-bg3','var(--orange-3)');
      previewCol.style.background='radial-gradient(120% 90% at 50% 20%, #b45608,#8b4206 55%,#6a3205)';
      break;
    case 'black':
      menuEl.style.setProperty('--menu-bg1','var(--black-1)');
      menuEl.style.setProperty('--menu-bg2','var(--black-2)');
      menuEl.style.setProperty('--menu-bg3','var(--black-3)');
      previewCol.style.background='radial-gradient(120% 90% at 50% 20%, #121212,#0d0d0d 55%,#0a0a0a)';
      break;
    case 'yellow':
      menuEl.style.setProperty('--menu-bg1','var(--yellow-1)');
      menuEl.style.setProperty('--menu-bg2','var(--yellow-2)');
      menuEl.style.setProperty('--menu-bg3','var(--yellow-3)');
      previewCol.style.background='radial-gradient(120% 90% at 50% 20%, #f0c43a,#d8ad23 55%,#bb940e)';
      break;
    default:
      menuEl.style.removeProperty('--menu-bg1');
      menuEl.style.removeProperty('--menu-bg2');
      menuEl.style.removeProperty('--menu-bg3');
      previewCol.style.background='radial-gradient(120% 90% at 50% 20%, #fff,#fafafa 55%,#f2f2f2)';
  }
}

if (list) {
  list.querySelectorAll('.mi').forEach(item => {
    item.addEventListener('mouseenter', () => {
      applyTheme(item.getAttribute('data-theme') || '');
      const src = item.getAttribute('data-img');
      if (src && ph) {
        ph.classList.remove('is-on');
        setTimeout(() => {
          ph.src = src;
          ph.onload = () => ph.classList.add('is-on');
        }, 40);
      }
    });
    item.addEventListener('click', () => {
      const href = item.getAttribute('data-href') || '#';
      location.href = href;
    });
  });

  const first = list.querySelector('.mi[data-img]');
  if (first) {
    ph.src = first.getAttribute('data-img');
    ph.onload = () => ph.classList.add('is-on');
    applyTheme(first.getAttribute('data-theme'));
  }
}
