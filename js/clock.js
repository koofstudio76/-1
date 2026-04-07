
(function(){
  // Создание шкалы (60 штрихов, каждые 5-й — жирный)
  function buildFace(el){
    for(let i=0;i<60;i++){
      const t=document.createElement('div');
      t.className='tick'+(i%5===0?' tick--bold':'');
      t.style.transform=`translate(-50%,-100%) rotate(${i*6}deg)`;
      t.style.top='50%'; t.style.left='50%';
      el.appendChild(t);
    }
    // цифры
    ['12','3','6','9'].forEach(n=>{
      const d=document.createElement('div');
      d.className='num'; d.dataset.p=n; d.textContent=n;
      el.appendChild(d);
    });
    // стрелки и подпись
    const h=document.createElement('div'); h.className='hand hand--h';
    const m=document.createElement('div'); m.className='hand hand--m';
    const s=document.createElement('div'); s.className='hand hand--s';
    const p=document.createElement('div'); p.className='pivot';
    const lab=document.createElement('div'); lab.className='clock__label';
    lab.textContent = el.dataset.label || el.dataset.tz;
    el.append(h,m,s,p,lab);
    return {h,m,s};
  }

  // Безопасное время в таймзоне (через formatToParts, без парсинга строк дат)
  const dtfCache = new Map();
  function getZoned(now, timeZone){
    let f = dtfCache.get(timeZone);
    if(!f){
      f = new Intl.DateTimeFormat('en-CA', {
        timeZone, hour12:false,
        year:'numeric', month:'2-digit', day:'2-digit',
        hour:'2-digit', minute:'2-digit', second:'2-digit'
      });
      dtfCache.set(timeZone, f);
    }
    const parts = f.formatToParts(now).reduce((o,p)=>{o[p.type]=p.value; return o;}, {});
    const y = Number(parts.year), mo = Number(parts.month), d = Number(parts.day);
    const hh = Number(parts.hour), mm = Number(parts.minute), ss = Number(parts.second);
    return { y, mo, d, hh, mm, ss };
  }

  function angleFor(h, m, s){
    const sec = s * 6;                       // 360/60
    const min = (m + s/60) * 6;              // 360/60
    const hour = ((h%12) + m/60 + s/3600) * 30; // 360/12
    return {hour, min, sec};
  }

  const root = document.getElementById('tzClocks');
  if(!root) return;

  const clocks = Array.from(root.querySelectorAll('.clock')).map(el=>{
    const hands = buildFace(el);
    return { el, tz: el.dataset.tz, hands };
  });

  function render(){
    const now = new Date();
    for(const c of clocks){
      const z = getZoned(now, c.tz);
      const a = angleFor(z.hh, z.mm, z.ss);
      c.hands.h.style.transform = `translate(-50%,-90%) rotate(${a.hour}deg)`;
      c.hands.m.style.transform = `translate(-50%,-90%) rotate(${a.min}deg)`;
      c.hands.s.style.transform = `translate(-50%,-90%) rotate(${a.sec}deg)`;
    }
    requestAnimationFrame(render);
  }
  render();
})();