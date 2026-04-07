// ===== TEAM DATA (6 cards) =====
const TEAM = [
  {
    id: 'suslenkov',
    name: 'Сергей Сусленков',
    role: 'Основатель и худрук Koof agency',
    img: 'img/team/1.jpg',
    href: 'member-suslenkov.html'
  },
  {
    id: 'ukhanov',
    name: 'Павел Уханов',
    role: 'Гармонист-виртуоз, продюсер',
    img: 'assets/team/ukhanov.jpg',
    href: 'member-ukhanov.html'
  },
  {
    id: 'aniskin',
    name: 'Максим Анискин',
    role: 'Баритон, приглашённый солист',
    img: 'assets/team/aniskin.jpg',
    href: 'member-aniskin.html'
  },
  {
    id: 'zhukov',
    name: 'Антон Жуков',
    role: 'Дирижёр, партнёр программ',
    img: 'assets/team/zhukov.jpg',
    href: 'member-zhukov.html'
  },
  {
    id: 'sabl',
    name: 'Евгения Сабленко',
    role: 'Менеджер культурных проектов',
    img: 'assets/team/sablenko.jpg',
    href: 'member-sablenko.html'
  },
  {
    id: 'producer',
    name: 'Команда продакшн',
    role: 'Видео / мультимедиа',
    img: 'assets/team/production.jpg',
    href: 'member-production.html'
  },
];

document.addEventListener('DOMContentLoaded', () => {
  // Render team cards
  const root = document.getElementById('team');
  if(root){ root.innerHTML = TEAM.map(cardTemplate).join(''); attachTilt(root); }

  // Header interactions
  setupHeaderUI();
});

// ===== Card template =====
function cardTemplate(m){
  return `
  <a class="team-card" href="${m.href}" aria-label="${m.name} — ${m.role}">
    <div class="card-3d" data-depth="1">
      <span class="badge">team</span>
      <div class="layer bg" data-depth="0"></div>
      <div class="layer img" data-depth="2" aria-hidden="true">
        <img src="${m.img}" alt="" loading="lazy"/>
      </div>
      <div class="layer title" data-depth="3">
        <h3 class="name">${m.name}</h3>
        <p class="role">${m.role}</p>
      </div>
    </div>
  </a>`;
}

/**
 * 3D tilt + parallax layers with glare
 */
function attachTilt(container){
  const isTouch = matchMedia('(hover: none)').matches;
  const cards = [...container.querySelectorAll('.team-card')];
  cards.forEach(card => {
    const inner = card.querySelector('.card-3d');
    const layers = [...inner.querySelectorAll('[data-depth]')];
    reset();

    if(isTouch){
      card.addEventListener('touchstart', () => inner.style.transform = 'translateZ(0) scale(1.02)');
      card.addEventListener('touchend', reset);
      return;
    }

    card.addEventListener('pointerenter', () => {
      inner.style.transition = 'transform .15s ease';
      requestAnimationFrame(() => { inner.style.transform += ' rotateX(0deg) rotateY(0deg)'; });
    });

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const rx = clamp((-dy / (r.height/2)) * 10, -12, 12);
      const ry = clamp((dx / (r.width/2)) * 12, -16, 16);

      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      inner.style.setProperty('--mx', mx + '%');
      inner.style.setProperty('--my', my + '%');

      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.depth || '1');
        const tx = (dx / r.width) * depth * 8;
        const ty = (dy / r.height) * depth * 8;
        layer.style.transform = `translateZ(${depth*40}px) translate(${tx}px, ${ty}px)`;
      });
    });

    card.addEventListener('pointerleave', () => { inner.style.transition = 'transform .35s ease'; reset(); });

    function reset(){
      inner.style.transform = 'rotateX(0) rotateY(0)';
      inner.style.setProperty('--mx','50%');
      inner.style.setProperty('--my','50%');
      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.depth || '1');
        layer.style.transform = `translateZ(${depth*40}px)`;
      });
    }
  });
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// ===== Header UI (search & mega) =====
function setupHeaderUI(){
  const btnSearch = document.getElementById('btn-search');
  const searchDrop = document.getElementById('search-drop');
  const btnAgency = document.getElementById('btn-agency');
  const mega = document.getElementById('mega');
  const megaClose = document.getElementById('mega-close');

  // toggle helpers
  const show = el => { el.hidden = false; };
  const hide = el => { el.hidden = true; };

  // Search
  btnSearch?.addEventListener('click', () => {
    const open = btnSearch.getAttribute('aria-expanded') === 'true';
    btnSearch.setAttribute('aria-expanded', String(!open));
    if(open){ hide(searchDrop); }
    else { show(searchDrop); searchDrop.querySelector('.search-input')?.focus(); }
  });

  // Agency mega menu
  btnAgency?.addEventListener('click', () => {
    const open = btnAgency.getAttribute('aria-expanded') == 'true';
    btnAgency.setAttribute('aria-expanded', String(!open));
    if(open){ hide(mega); } else { show(mega); }
  });

  megaClose?.addEventListener('click', () => {
    btnAgency?.setAttribute('aria-expanded','false');
    hide(mega);
  });

  // Close on ESC / outside click
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(btnAgency?.getAttribute('aria-expanded') === 'true'){ btnAgency.setAttribute('aria-expanded','false'); hide(mega); }
      if(btnSearch?.getAttribute('aria-expanded') === 'true'){ btnSearch.setAttribute('aria-expanded','false'); hide(searchDrop); }
    }
  });

  document.addEventListener('click', (e) => {
    const t = e.target;
    if(!searchDrop?.contains(t) && !btnSearch?.contains(t) && btnSearch?.getAttribute('aria-expanded') === 'true'){
      btnSearch.setAttribute('aria-expanded','false'); hide(searchDrop);
    }
    if(!mega?.contains(t) && !btnAgency?.contains(t) && btnAgency?.getAttribute('aria-expanded') === 'true'){
      btnAgency.setAttribute('aria-expanded','false'); hide(mega);
    }
  }, true);
}
