// One assistant surface at a time: full route on phones, contextual aside on desktop.
(() => {
  let launcher, panel, returnFocus, panelRoute='';
  const wide=()=>window.matchMedia('(min-width: 1000px)').matches;
  const validContext=id=>Boolean(id && (byId(id)||CARE_TOPICS.some(t=>t.id===id)));
  const contextFor=r=>['sprawa','wsparcie','poradnik'].includes(r.page)&&validContext(r.id)?r.id:'';
  function updateContext(){
    if(!panel||panel.hidden)return;
    const id=panel.querySelector('#help-search')?.dataset.context;
    const topic=byId(id)||CARE_TOPICS.find(t=>t.id===id);
    const label=panel.querySelector('.assistant-panel-top p');if(label)label.textContent=topic?'Temat: '+topic.title:'Pomoc w Twoim tempie';
  }
  function close(restore=true){
    if(!panel||panel.hidden)return;
    clearAssistant();panel.hidden=true;panel.replaceChildren();document.body.classList.remove('assistant-open');
    if(wide())launcher?.setAttribute('aria-expanded','false');
    if(restore&&(returnFocus?.isConnected||launcher)) (returnFocus?.isConnected?returnFocus:launcher)?.focus();
  }
  function create(){
    if(launcher)return;
    launcher=document.createElement('button');launcher.type='button';launcher.id='assistant-launcher';launcher.className='assistant-launcher';
    launcher.innerHTML=icon('chat',22)+'<span>Zapytaj Otulę</span>';
    launcher.setAttribute('aria-controls','assistant-panel');launcher.setAttribute('aria-expanded','false');
    launcher.addEventListener('click',()=>panel&&!panel.hidden?close():open());
    panel=document.createElement('aside');panel.id='assistant-panel';panel.hidden=true;panel.tabIndex=-1;
    panel.setAttribute('aria-label','Zapytaj Otulę — pomoc przy aktualnej sprawie');
    document.body.append(launcher,panel);
  }
  function open(context){
    create();const r=route(),id=validContext(context)?context:contextFor(r);
    if(document.body.classList.contains('arriving'))return;
    if(!wide()) {close(false);location.hash='pomoc'+(id?'/'+encodeURIComponent(id):'');return;}
    if(r.page==='pomoc'){document.querySelector('#help-search')?.focus();return;}
    returnFocus=document.activeElement;panelRoute=location.hash;
    const topic=byId(id)||CARE_TOPICS.find(t=>t.id===id);
    panel.innerHTML='<div class="assistant-panel-top"><div><strong>Zapytaj Otulę</strong><p>'+(topic?'Temat: '+esc(topic.title):'Pomoc w Twoim tempie')+'</p></div><button type="button" class="assistant-close" aria-label="Zamknij asystenta">'+icon('close',22)+'</button></div><div class="assistant-panel-content">'+helpPage({page:'pomoc',id})+'</div>';
    panel.querySelector('.assistant-close').addEventListener('click',()=>close());
    panel.hidden=false;document.body.classList.add('assistant-open');launcher.setAttribute('aria-expanded','true');
    const field=panel.querySelector('#help-search');if(id)field.dataset.contextLocked='true';field.focus();
  }
  function sync(r,isArriving){
    create();
    if(isArriving||r.page==='pomoc'||(panel&&!panel.hidden&&panelRoute!==location.hash))close(false);
    const menu=document.querySelector('#mobile-navigation');
    launcher.hidden=Boolean(isArriving||r.page==='pomoc'||menu&&!menu.hidden);
    if(!wide()&&panel&&!panel.hidden){close(false);if(!launcher.hidden)launcher.focus();}
    if(wide()){launcher.setAttribute('aria-controls','assistant-panel');launcher.setAttribute('aria-expanded',String(!panel.hidden));}
    else{launcher.removeAttribute('aria-controls');launcher.removeAttribute('aria-expanded');}
  }
  window.syncAssistantLauncher=sync;
  window.OtulaAssistant={open,close,sync};
  window.addEventListener('hashchange',()=>close(false));
  window.addEventListener('resize',()=>sync(route(),document.body.classList.contains('arriving')));
  // App-level delegated handlers update the field later in the same event.
  document.addEventListener('click',event=>{if(event.target.closest('[data-question]'))queueMicrotask(updateContext);});
  document.addEventListener('input',event=>{if(event.target.id==='help-search')queueMicrotask(updateContext);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden){event.preventDefault();close();}});
})();
