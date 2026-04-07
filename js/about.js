 const team = [
      {
        id: 'suslenkov',
        name: 'Сергей Сусленков',
        eyebrow: 'Генеральный директор · Художественный руководитель',
        role: '',
         photo: 'img/team/1.jpg',
        detailPhoto: 'img/team/1.jpg',
        bio: 'Руководитель агентства «Ков‑Студио», солист, организатор международных гастролей. Более 20 лет на сцене, сотрудничал с ведущими филармониями Европы.',
        gallery: [11,12,13].map(n => `https://picsum.photos/200/120?random=${n}`)
      },
      {
        id: 'sablenko',
        name: 'Евгения Сабленко',
        eyebrow: 'Исполнительный директор · Продюсер проектов',
        role: 'Культурный менеджер, директор АНО «Фолиант»',
        photo: 'img/team/3.jpg',
        detailPhoto: 'img/team/3.jpg',
        bio: 'Культурный менеджер, директор АНО «Фолиант». Руководитель проектов «Атмосфера» и «Без границ», спикер форумов. Выпускница УдГУ («Менеджмент в культуре»), дирижёр хора по первому образованию.',
        gallery: [21,22,23].map(n => `https://picsum.photos/200/120?random=${n}`)
      },
        {
        id: 'liet',
        name: 'Моник Лиет',
        eyebrow: 'Административный менеджер',
        role: 'Нидерланды',
  photo: 'img/team/2.jpg',
        detailPhoto: 'img/team/2.jpg',

        bio: 'Опытный административный менеджер из Нидерландов. Более 20 лет работы в издательствах Springer и Kluwer.',
        gallery: [41,42,43].map(n => `https://picsum.photos/200/120?random=${n}`)
      },
      
      {
        id: 'novikov',
        name: 'Алексей Новиков',
        eyebrow: 'Баритон · Руководитель филиала',
        role: 'Китай',
        photo: 'img/team/5.jpg',
        detailPhoto: 'img/team/5.jpg',
        bio: 'Баритон, выпускник МГУКИ, бывший солист театра им. Сац. Живёт и работает в Китае, руководитель филиала агентства.',
        gallery: [1,2,3].map(n => `img/team/${n}.jpg?random=${n}`)
      }
    ];

    // Рендер карточек (уровень 1)
    const cardsEl = document.getElementById('cards');
    cardsEl.innerHTML = team.map(p => `
      <section class="card" aria-labelledby="${p.id}-name">
        <div class="glow"></div>
        <span class="parallax-shape shape-a"></span>
        <span class="parallax-shape shape-b"></span>
        <span class="depth-grad"></span>
        <div class="card-inner">
          <div class="media">
            <div class=\"photo-wrap\" data-open=\"${p.id}\"><img class="photo" src="${p.photo}" alt="${p.name}" loading="lazy"/></div>
          </div>
          <div class="text-block">
            <div class="eyebrow">${p.eyebrow}</div>
            <h2 class="title" id="${p.id}-name">${p.name}</h2>
            ${p.role ? `<div class="role">${p.role}</div>` : ''}
          </div>
        </div>
      </section>
    `).join('');

    // Рендер оверлеев (уровень 2)
    const overlaysEl = document.getElementById('overlays');
    overlaysEl.innerHTML = team.map(p => `
      <section class="detail" id="detail-${p.id}" role="dialog" aria-modal="true" aria-labelledby="detail-${p.id}-title">
        <button class="back" data-close="${p.id}" aria-label="Назад к списку">← Назад</button>
        <div class="detail-content">
          <div class="media">
            <div class="photo-wrap" style="transform:none"><img class="photo" src="${p.detailPhoto}" alt="${p.name}"/></div>
          </div>
           <div class="hero-info">
      <div class="inner">
        <h1 class="name">${p.name} </h1>
        <p class="role">${p.role}</p>
        <p class="bio">${p.bio}</p>

        
        <!-- по ТЗ: здесь больше ничего не выводим -->
      </div>
    </div>
          </div>
        </div>
      </section>
    `).join('');

    // Открытие/закрытие
    const open = id => {
      const el = document.getElementById(`detail-${id}`);
      if(!el) return;
      el.classList.add('active');
      document.body.style.overflow = 'hidden';
      // фокус на кнопке «Назад»
      const backBtn = el.querySelector('[data-close]');
      if (backBtn) backBtn.focus();
    };
    const close = id => {
      const el = document.getElementById(`detail-${id}`);
      if(!el) return;
      el.classList.remove('active');
      document.body.style.overflow = '';
    };

    // Делегирование кликов
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('[data-open]');
      if (openBtn){
        open(openBtn.getAttribute('data-open'));
      }
      const closeBtn = e.target.closest('[data-close]');
      if (closeBtn){
        close(closeBtn.getAttribute('data-close'));
      }
    });

    // ESC для закрытия
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape'){
        document.querySelectorAll('.detail.active').forEach(el => el.classList.remove('active'));
        document.body.style.overflow = '';
      }
    });
  
    // === 3D TILT / PARALLAX FOLLOW MOUSE ===
    (function(){
      const MAX_TILT_X = 10;   // deg up/down
      const MAX_TILT_Y = 12;   // deg left/right
      const SHAPE_SHIFT = 20;  // px parallax for shapes
      const Z_BOOST = 18;      // px

      const canTilt = matchMedia('(pointer:fine)').matches;

      function lerp(a,b,t){ return a + (b-a)*t; }

      function attachCardTilt(card){
        if(!canTilt) return;
        const inner = card.querySelector('.card-inner');
        const shapeA = card.querySelector('.shape-a');
        const shapeB = card.querySelector('.shape-b');
        const depth = card.querySelector('.depth-grad');
        const photo = card.querySelector('.photo-wrap');
        const title = card.querySelector('.title');

        let raf = null; let target = {rx:0, ry:0, ax:0, ay:0}; let current = {rx:0, ry:0, ax:0, ay:0};

        function onMove(e){
          const r = card.getBoundingClientRect();
          const cx = r.left + r.width/2; const cy = r.top + r.height/2;
          const dx = (e.clientX - cx) / (r.width/2);   // -1..1
          const dy = (e.clientY - cy) / (r.height/2);  // -1..1

          target.ry = MAX_TILT_Y * dx;      // left-right
          target.rx = -MAX_TILT_X * dy;     // up-down (invert)
          target.ax = SHAPE_SHIFT * dx;
          target.ay = SHAPE_SHIFT * dy;
          card.dataset.tilting = '1';
          if(!raf) loop();
        }
        function onLeave(){ target.rx = target.ry = target.ax = target.ay = 0; if(!raf) loop(); }

        function loop(){
          raf = requestAnimationFrame(()=>{
            // ease
            current.rx = lerp(current.rx, target.rx, 0.12);
            current.ry = lerp(current.ry, target.ry, 0.12);
            current.ax = lerp(current.ax, target.ax, 0.10);
            current.ay = lerp(current.ay, target.ay, 0.10);

            inner.style.transform = `rotateX(${current.rx}deg) rotateY(${current.ry}deg)`;
            if (photo) photo.style.transform = `translateZ(${55+Z_BOOST*Math.hypot(current.rx,current.ry)/MAX_TILT_Y}px)`;
            if (title) title.style.transform = `translateZ(${40+Z_BOOST}px)`;
            if (shapeA) shapeA.style.transform = `translate(${current.ax}px, ${current.ay}px)`;
            if (shapeB) shapeB.style.transform = `translate(${-current.ax}px, ${-current.ay}px)`;
            if (depth) depth.style.transform = `translate(${current.ax*0.8}px, ${current.ay*0.8}px)`;

            const closeEnough = Math.abs(current.rx-target.rx)<0.05 && Math.abs(current.ry-target.ry)<0.05 && Math.abs(current.ax-target.ax)<0.2;
            if (!closeEnough) { loop(); } else { cancelAnimationFrame(raf); raf=null; if(target.rx===0&&target.ry===0){ card.dataset.tilting='0'; inner.style.transform=''; if(photo) photo.style.transform=''; if(title) title.style.transform=''; if(shapeA) shapeA.style.transform=''; if(shapeB) shapeB.style.transform=''; if(depth) depth.style.transform=''; } }
          });
        }

        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
      }

      function attachDetailTilt(detail){
        if(!canTilt) return;
        const area = detail.querySelector('.detail-content');
        const photo = detail.querySelector('.detail-content .photo-wrap');
        if(!area || !photo) return;
        let raf=null; let t=0, c=0;
        function onMove(e){
          const r = area.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width/2)) / (r.width/2);
          const dy = (e.clientY - (r.top + r.height/2)) / (r.height/2);
          t = Math.min(1, Math.hypot(dx,dy));
          const rx = -MAX_TILT_X*0.6*dy; const ry = MAX_TILT_Y*0.6*dx;
          function step(){
            raf = requestAnimationFrame(()=>{
              c = lerp(c, t, 0.12);
              photo.style.transform = `rotateX(${rx*c}deg) rotateY(${ry*c}deg) translateZ(${40*c}px)`;
              if (Math.abs(c-t) > 0.01) step(); else { cancelAnimationFrame(raf); raf=null; }
            });
          }
          if(!raf) step();
        }
        function onLeave(){ photo.style.transform=''; }
        area.addEventListener('mousemove', onMove);
        area.addEventListener('mouseleave', onLeave);
      }

      // Инициализация после рендера
      document.querySelectorAll('.card').forEach(attachCardTilt);
      document.querySelectorAll('.detail').forEach(attachDetailTilt);
    })();