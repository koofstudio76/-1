(function(){
  const btn=document.querySelector('[data-open="agency"]');
  const menu=document.getElementById('agencyMenu');
  const close=menu ? menu.querySelector('.mega__close') : null;
  const overlay=menu ? menu.querySelector('[data-close]') : null;
  const searchBtn=document.getElementById('searchBtn');
  const searchPop=document.getElementById('searchPop');
  function setOpen(state){
    if(!menu || !btn) return;
    menu.hidden=!state; btn.setAttribute('aria-expanded', String(state));
    document.body.classList.toggle('menu-open', state);
  }
  if(btn && menu){ btn.addEventListener('click',()=>setOpen(menu.hidden)); }
  if(close) close.addEventListener('click',()=>setOpen(false));
  if(overlay) overlay.addEventListener('click',()=>setOpen(false));
  if(searchBtn && searchPop){
    searchBtn.addEventListener('click',()=>{
      const open=searchPop.hidden;
      searchPop.hidden=!open;
      searchBtn.setAttribute('aria-expanded', String(open));
    });
  }
})();
