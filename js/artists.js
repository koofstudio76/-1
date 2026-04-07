// Навигация по клику/Enter
    document.querySelectorAll('.card').forEach(card=>{
      const navigate = ()=>location.href = card.dataset.href;
      card.addEventListener('click', navigate);
      card.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(); }});
    });

    // Без внешних библиотек. Сильный 3D-наклон + параллакс слоёв.
// Основано на позиционировании курсора внутри карточки.
// Настройки:
const MAX_TILT_X = 14;   // deg up/down
const MAX_TILT_Y = 18;   // deg left/right
const PARALLAX = 24;     // px сдвиг слоёв по data-depth
const EASE = 0.12;

function lerp(a,b,t){ return a + (b-a)*t; }

document.querySelectorAll('.card .card-3d').forEach(root=>{
  const preferTilt = matchMedia('(pointer:fine)').matches;
  if(!preferTilt) return;

  const layers = [...root.querySelectorAll('.parallax-layer')];
  let raf = null;
  const target = {rx:0, ry:0, px:0, py:0};
  const current = {rx:0, ry:0, px:0, py:0};

  function onMove(e){
    const r = root.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const dx = (e.clientX - cx) / (r.width/2);   // -1..1
    const dy = (e.clientY - cy) / (r.height/2);  // -1..1
    target.ry = MAX_TILT_Y * dx;
    target.rx = -MAX_TILT_X * dy;
    target.px = PARALLAX * dx;
    target.py = PARALLAX * dy;
    if(!raf) loop();
  }
  function onLeave(){
    target.rx = target.ry = target.px = target.py = 0;
    if(!raf) loop();
  }

  function loop(){
    raf = requestAnimationFrame(()=>{
      current.rx = lerp(current.rx, target.rx, EASE);
      current.ry = lerp(current.ry, target.ry, EASE);
      current.px = lerp(current.px, target.px, EASE);
      current.py = lerp(current.py, target.py, EASE);

      root.style.transform = `perspective(1200px) rotateX(${current.rx}deg) rotateY(${current.ry}deg)`;
      layers.forEach(el=>{
        const depth = parseFloat(el.dataset.depth || '0.3');
        el.style.transform = `translate3d(${current.px*depth}px, ${current.py*depth}px, 0)`;
      });

      const still = Math.abs(current.rx-target.rx)<0.05 && Math.abs(current.ry-target.ry)<0.05 && Math.abs(current.px-target.px)<0.2;
      if(!still){ loop(); } else { cancelAnimationFrame(raf); raf=null; }
    });
  }

  root.addEventListener('mousemove', onMove);
  root.addEventListener('mouseleave', onLeave);
});
