/* Doors v1 — универсальный модуль переходов.
   Логика:
   - при клике на ссылку/карту — закрываем двери, показываем титр, ждём и переходим, ставим флаг sessionStorage;
   - на целевой странице: если флаг есть, сначала показываем закрытые двери с титром, затем открываем и снимаем флаг;
   - при прямом заходе/обновлении — просто открываем (без закрытия перед этим).
*/
(function(){
  const curtains = document.getElementById('curtains');
  if(!curtains) return;

  const DUR = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--curtain-duration')) || 900;

  // 1) Открытие при входе
  const cameFromNav = sessionStorage.getItem('doorsFromNav') === '1';

  function openAfterLoad(){
    // Старт в закрытом состоянии, затем открыть
    curtains.classList.add('closed');
    requestAnimationFrame(()=>{ requestAnimationFrame(()=>{
      // Если пришли из навигации, чуть дольше держим титр (естественная пауза)
      setTimeout(()=> curtains.classList.remove('closed'), cameFromNav ? 160 : 0);
      sessionStorage.removeItem('doorsFromNav');
    });});
  }

  // 2) Закрытие перед уходом
  function interceptNav(e, href){
    if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    e.preventDefault();
    sessionStorage.setItem('doorsFromNav','1');
    curtains.classList.add('closed'); // закрываем + титр
    setTimeout(()=>{ window.location.href = href; }, DUR + 80);
    return true;
  }

  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a,[data-href]');
    if(!a) return;
    const href = a.getAttribute('data-href') || a.getAttribute('href');
    interceptNav(e, href);
  }, {passive:false});

  // авто-открытие
  openAfterLoad();
})();
