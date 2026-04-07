
/* ===== Dropdown ("Agency") ===== */
(function(){
  const root  = document.getElementById('agencyMenu');
  const openers = document.querySelectorAll('[data-open="agency"]');
  const overlay = root.querySelector('.mega__overlay');
  const closeBtn = root.querySelector('.mega__close');
  let prevFocus = null;

  function open(){
    if(!root.hasAttribute('hidden')) return;
    prevFocus = document.activeElement;
    root.removeAttribute('hidden'); root.dataset.state = 'open';
    document.documentElement.classList.add('no-scroll');
    openers.forEach(b => b.setAttribute('aria-expanded','true'));
  }
  function close(){
    if(root.hasAttribute('hidden')) return;
    root.setAttribute('hidden',''); root.dataset.state = '';
    document.documentElement.classList.remove('no-scroll');
    openers.forEach(b => b.setAttribute('aria-expanded','false'));
    if (prevFocus) prevFocus.focus();
  }

  openers.forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); root.hasAttribute('hidden') ? open() : close(); }));
  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(!root.hasAttribute('hidden') && e.key==='Escape'){ e.preventDefault(); close(); } });
})();

/* ===== Spinning circular-text cursor (clockwise with inertia) ===== */
(function(){
  const cursor = document.getElementById('cursor');
  if(!cursor) return;
  const dot = cursor.querySelector('.cursor__dot');
  const svg = cursor.querySelector('.cursor__svg');

  let x=0,y=0, tx=0,ty=0;
  let spin=0, spinVel=0;             // угол и угловая скорость (градусы/кадр)
  const follow = 0.25;               // сглаживание позиционирования
  const decay  = 0.92;               // затухание вращения
  const k      = 0.06;               // усиление от скорости мыши
  const maxVel = 18;                 // ограничение ускорения

  let px=0, py=0;                    // предыдущая позиция указателя

  function raf(){
    // позиция
    tx += (x - tx) * follow;
    ty += (y - ty) * follow;
    cursor.style.transform = `translate(${tx}px, ${ty}px)`;

    // вращение
    spin += spinVel;
    svg.style.transform = `translate(-50%,-50%) rotate(${spin}deg)`;
    spinVel *= decay;

    requestAnimationFrame(raf);
  }

  window.addEventListener('pointermove', e=>{
    x = e.clientX; y = e.clientY;
    // при движении добавляем момент по часовой стрелке
    const dx = x - px, dy = y - py;
    const v = Math.hypot(dx, dy);                // скалярная скорость
    spinVel = Math.min(spinVel + v * k, maxVel); // ускоряем вращение CW
    px = x; py = y;
  }, {passive:true});

  // кликабельные элементы, при наведении показываем кольца и заливку
  const HOT = 'a, button, .navbtn, .navlink, .cart, .item, [role="button"], [data-open]';
  function setState(el){
    if(el && el.closest(HOT)) cursor.classList.add('is-push');
    else cursor.classList.remove('is-push');
  }
  document.addEventListener('pointerover', e=>setState(e.target));
  document.addEventListener('pointerout',  ()=>setState(null));

  raf();
})();
(function(){
  const wrap = document.getElementById('searchWrap');
  const btn  = document.getElementById('searchBtn');
  const pop  = document.getElementById('searchPop');
  if(!wrap || !btn || !pop) return;

  const input = pop.querySelector('.search-input');

  function open(){
    wrap.classList.add('is-open');
    pop.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
    requestAnimationFrame(()=> input && input.focus());
  }
  function close(){
    wrap.classList.remove('is-open');
    pop.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  }
  function toggle(){ wrap.classList.contains('is-open') ? close() : open(); }

  btn.addEventListener('click', (e)=>{ e.preventDefault(); toggle(); });

  // Закрытие по клику вне
  document.addEventListener('click', (e)=>{
    if(!wrap.classList.contains('is-open')) return;
    if(!wrap.contains(e.target)) close();
  });

  // Esc
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && wrap.classList.contains('is-open')) { e.preventDefault(); close(); }
  });

  // Отправка формы: GET /search?q=...
  pop.querySelector('.search-form')?.addEventListener('submit', (e)=>{
    // Никакой доп. логики: по умолчанию браузер сделает навигацию на action с q=
    // Если нужен SPA-хендлинг — здесь можно перехватить и вызвать свой роутер.
  });
})();
