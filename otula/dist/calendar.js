'use strict';

// Private dates stay with each child. Calendar exports use stable per-child IDs.
let calendarMonth = '';
let calendarDay = '';
let calendarDraftCase = '';
let calendarDelete = '';
const calendarReminders = [[0,'W dniu wydarzenia'],[1,'Dzień wcześniej'],[3,'3 dni wcześniej'],[7,'Tydzień wcześniej'],[14,'2 tygodnie wcześniej']];
function calendarId() { return globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+'-'+Math.random().toString(36).slice(2); }
function calendarDate(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function cleanCalendarEvents(value) {
  if(!Array.isArray(value))return [];
  return value.filter(e=>e && typeof e==='object' && parseDate(e.date) && typeof e.title==='string' && e.title.trim()).slice(0,500).map(e=>({
    id:typeof e.id==='string' && /^[a-zA-Z0-9-]{1,80}$/.test(e.id)?e.id:calendarId(),
    title:text(e.title,100), date:e.date, time:/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)?e.time:'09:00',
    remind:calendarReminders.some(([n])=>n===e.remind)?e.remind:3,
    caseId:GUIDE.cases.some(c=>c.id===e.caseId)?e.caseId:'', note:text(e.note,600), done:e.done===true,
    revision:Number.isInteger(e.revision) && e.revision>=0?e.revision:0
  }));
}
function calendarEvents() {
  const child=state.children[state.active], base=parseDate(state.date), rows=[];
  if(base) {
    if(state.stage==='pregnancy')rows.push({id:'birth-date',date:state.date,time:'09:00',title:'Przewidywany termin porodu',note:'Planowana data. Termin porodu może się zmienić.',remind:7,preview:false,planned:true});
    timeline().forEach(({item,date})=>{
      if(date && !state.done.includes(item.id))rows.push({id:'case-'+item.id,date:calendarDate(date),time:'09:00',title:item.due.label,note:item.due.note+' Termin orientacyjny. Źródło: '+item.source,remind:item.due.remind||3,caseId:item.id,preview:state.stage!=='birth'});
    });
  }
  return [...rows,...child.events.map(e=>({...e,custom:true,preview:false}))].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}
function calendarEventCard(e) {
  const item=byId(e.caseId),kind=e.custom?'Twój termin':e.preview?'Podgląd po porodzie':e.planned?'Planowana data':'Termin orientacyjny';
  return `<article class="cal-event ${e.preview?'cal-preview':''} ${e.done?'cal-done':''}"><div class="cal-event-date"><strong>${fmt(parseDate(e.date))}</strong><span>${e.time} · ${kind}</span></div><h3>${esc(e.title)}</h3>${e.note?`<p>${esc(e.note.split(' Źródło: ')[0])}</p>`:''}
  <div class="cal-event-links">${item?`<a href="#sprawa/${item.id}">Dokumenty i instrukcja</a>`:''}${e.custom?`<a href="#termin/${e.id}">Edytuj</a><button data-cal-action="done" data-id="${e.id}" aria-pressed="${e.done}">${e.done?'Cofnij wykonanie':'Oznacz jako gotowe'}</button>`:item?`<button data-cal-action="prepare" data-id="${item.id}">Zaplanuj przygotowanie</button>`:''}
  ${!e.preview&&!e.done?`<button data-cal-action="export-one" data-id="${e.id}">${icon('calendar',17)} Do kalendarza telefonu</button>`:''}</div>${e.preview?'<small>Datę przeliczymy po wpisaniu rzeczywistego dnia narodzin.</small>':e.done?'<small>Oznaczone jako gotowe w Otuli.</small>':`<small>Przypomnienie: ${calendarReminders.find(([n])=>n===e.remind)?.[1]||e.remind+' dni wcześniej'}. Po imporcie sprawdź alarm w kalendarzu.</small>`}</article>`;
}
function calendarMonthGrid(events) {
  let month=parseDate(calendarMonth+'-01');
  if(!month){month=new Date(today().getFullYear(),today().getMonth(),1);calendarMonth=calendarDate(month).slice(0,7);}
  const offset=(month.getDay()+6)%7, days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const title=month.toLocaleDateString('pl-PL',{month:'long',year:'numeric'});
  return `<section class="month-card" aria-label="Kalendarz miesiąca"><div class="month-heading"><h2>${title}</h2><div><button data-cal-action="prev" aria-label="Poprzedni miesiąc" ${month.getFullYear()===1000&&month.getMonth()===0?'disabled':''}>${icon('back',20)}</button><button data-cal-action="next" aria-label="Następny miesiąc" ${month.getFullYear()===9999&&month.getMonth()===11?'disabled':''}>${icon('right',20)}</button></div></div>
  <div class="month-tools"><label>Miesiąc<input id="calendar-month" type="month" min="1000-01" max="9999-12" value="${calendarMonth}"></label><button class="text-button" data-cal-action="today">Dzisiaj</button></div>
  <div class="month-grid">${['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(x=>`<span class="weekday" aria-hidden="true">${x}</span>`).join('')}${'<span aria-hidden="true"></span>'.repeat(offset)}${Array.from({length:days},(_,i)=>{
    const date=calendarDate(new Date(month.getFullYear(),month.getMonth(),i+1)),found=events.filter(e=>e.date===date&&!e.done),future=found.every(e=>e.preview);
    return `<button class="month-day ${date===calendarDate(today())?'is-today':''} ${found.length?'has-events':''} ${future?'only-preview':''}" data-cal-action="day" data-id="${date}" aria-pressed="${date===calendarDay}" aria-label="${fmt(parseDate(date))}${found.length?', wydarzenia: '+found.length:''}"><span>${i+1}</span>${found.length?'<i aria-hidden="true"></i>':''}</button>`;
  }).join('')}</div><p class="month-legend"><span>● Termin</span><span>○ Podgląd po porodzie</span></p></section>`;
}
function calendarPage() {
  const events=calendarEvents(),month=calendarMonth||calendarDate(today()).slice(0,7),filtered=events.filter(e=>calendarDay?e.date===calendarDay:e.date.startsWith(month));
  const canExport=events.some(e=>!e.preview&&!e.done&&e.date>=calendarDate(today()));
  return `${pageHeading('Kalendarz rodzica','Moje terminy','Zaplanuj dokumenty, spotkania i własne sprawy dla tego dziecka.')}
  <div class="date-panel"><label class="field"><span id="date-label">${dateLabel()}</span><input id="date-input" type="date" min="1000-01-01" max="9999-12-31" value="${state.date}"></label><p>Etap: <b>${GUIDE.stages[state.stage]}</b> · <a href="#sytuacja">zmień</a></p></div>
  <div class="cal-actions"><button class="button primary" data-cal-action="new">${icon('plus',18)} Dodaj termin</button>${canExport?'<button class="button secondary" data-cal-action="export">Eksportuj nadchodzące terminy</button>':''}<a class="text-button" href="#formularze">Formularze ZUS</a></div>
  <div class="calendar-layout">${calendarMonthGrid(events)}<section class="cal-agenda" aria-live="polite"><div class="cal-agenda-heading"><h2>${calendarDay?fmt(parseDate(calendarDay)):'W tym miesiącu'}</h2>${calendarDay?'<button class="text-button" data-cal-action="all-month">Cały miesiąc</button>':''}</div>
  ${filtered.length?filtered.map(calendarEventCard).join(''):`<div class="cal-empty">${bloom()}<h3>Tu jest miejsce na Twój plan</h3><p>Dodaj przygotowanie dokumentów, wizytę lub wspólną sprawę.</p><button class="button secondary" data-cal-action="new">Dodaj termin${calendarDay?' na ten dzień':''}</button></div>`}</section></div>
  <details class="cal-help"><summary>Jak włączyć przypomnienia w telefonie?</summary><ol><li>Wybierz „Do kalendarza telefonu” przy wydarzeniu lub eksport wszystkich nadchodzących terminów.</li><li>Otwórz pobrany plik .ics w aplikacji kalendarza. Jeśli telefon nie obsługuje importu, zaimportuj plik w kalendarzu na komputerze i zsynchronizuj go z telefonem.</li><li>Sprawdź godzinę i alarm wydarzenia. Niektóre kalendarze stosują własne ustawienia powiadomień.</li></ol><p>Przypomina kalendarz urządzenia, także gdy Otula jest zamknięta. Otula nie wysyła powiadomień samodzielnie i nie synchronizuje późniejszych zmian. Po zmianie albo usunięciu terminu popraw też wydarzenie w kalendarzu.</p><p>Eksport pomija ukończone i minione sprawy oraz poglądowe daty po porodzie. Terminy urzędowe są orientacyjne: sprawdź warunki i źródło w karcie sprawy.</p></details>
  <details class="cal-help"><summary>Sprawy, których termin zależy od Twojej sytuacji</summary><p>Nie wszystkie terminy można policzyć od daty narodzin. Przygotowanie wniosku o urlop, zaświadczeń lub dokumentów pracodawcy zaplanuj po sprawdzeniu instrukcji.</p><a href="#plan">Otwórz ścieżkę rodzica</a></details>`;
}
function calendarEditor(r) {
  const existing=state.children[state.active].events.find(e=>e.id===r.id),item=byId(calendarDraftCase),newDate=calendarDay||calendarDate(addDays(today(),7));
  if(r.id && r.id!=='nowy' && !existing)return backLink(r)+empty('Nie ma takiego terminu.','Wróć do kalendarza wybranego dziecka.');
  const e=existing||{title:item?'Przygotuj: '+item.title:'',date:newDate,time:'09:00',remind:3,caseId:item?.id||'',note:''};
  return backLink(r)+pageHeading('Plan dziecka: '+esc(childLabel(state.active)),existing?'Edytuj termin':'Nowy termin','Wybierz własną datę przygotowania. Nie zmienia ona terminu wynikającego z przepisów.')+`<form id="calendar-event-form" class="calendar-form" data-id="${existing?.id||''}">
  <label class="field">Co chcesz zaplanować?<input name="title" maxlength="100" required value="${esc(e.title)}" placeholder="Np. przygotować dokumenty do ZAM"></label>
  <div class="cal-form-pair"><label class="field">Data<input name="date" type="date" min="1000-01-01" max="9999-12-31" required value="${e.date}"></label><label class="field">Godzina<input name="time" type="time" required value="${e.time}"></label></div>
  <label class="field">Przypomnienie po dodaniu do kalendarza<select name="remind">${calendarReminders.map(([n,label])=>`<option value="${n}" ${n===e.remind?'selected':''}>${label}</option>`).join('')}</select></label>
  <label class="field">Powiązana sprawa<select name="caseId"><option value="">Własna sprawa</option>${GUIDE.cases.map(c=>`<option value="${c.id}" ${c.id===e.caseId?'selected':''}>${esc(c.title)}</option>`).join('')}</select></label>
  <label class="field">Co przygotować? <span class="field-hint">Opcjonalnie</span><textarea name="note" rows="3" maxlength="600" placeholder="Twoja krótka lista rzeczy do zabrania">${esc(e.note)}</textarea></label>
  <p class="cal-form-note">Zapis w Otuli nie włącza alarmu. Po zapisaniu wybierz „Do kalendarza telefonu”, aby dodać wydarzenie z przypomnieniem.</p><div class="cal-actions"><button class="button primary" type="submit">Zapisz termin</button><a class="button secondary" href="#terminy">Anuluj</a></div></form>
  ${existing?`<div class="cal-delete">${calendarDelete===existing.id?`<p>Usunąć „${esc(existing.title)}” z Otuli? Wydarzenie w kalendarzu telefonu trzeba usunąć osobno.</p><button class="button secondary" data-cal-action="delete-confirm" data-id="${existing.id}">Usuń termin</button><button class="text-button" data-cal-action="delete-cancel">Zostaw termin</button>`:`<button class="text-button" data-cal-action="delete" data-id="${existing.id}">Usuń ten termin</button>`}</div>`:''}`;
}
function calendarFold(line) {
  const enc=new TextEncoder();let result='',part='',bytes=0;
  for(const char of line){const size=enc.encode(char).length;if(bytes+size>75){result+=part+'\r\n';part=' ';bytes=1;}part+=char;bytes+=size;}
  return result+part;
}
function calendarICS(events,childId,now=new Date()) {
  const stamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Otula//Kalendarz rodzica//PL','CALSCALE:GREGORIAN'];
  for(const e of events) {
    const description=(e.preview?'Podgląd. ':'')+e.note+(e.caseId?'\nSprawa: https://otula-dla-rodziny.etherealdaffodil4.chatgpt.site/#sprawa/'+e.caseId:'');
    lines.push('BEGIN:VEVENT',`UID:${childId}-${e.id}@otula`,`DTSTAMP:${stamp}`,`SEQUENCE:${e.revision||0}`,'CLASS:PRIVATE',`DTSTART:${e.date.replace(/-/g,'')}T${e.time.replace(':','')}00`,'DURATION:PT30M',`SUMMARY:${icsEscape('Otula: '+e.title)}`,`DESCRIPTION:${icsEscape(description)}`,'BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${icsEscape(e.title)}`,e.remind===0?'TRIGGER:PT0S':`TRIGGER:-P${e.remind}D`,'END:VALARM','END:VEVENT');
  }
  lines.push('END:VCALENDAR');return lines.map(calendarFold).join('\r\n')+'\r\n';
}
function exportFamilyCalendar(id='') {
  const all=calendarEvents(),events=all.filter(e=>!e.preview&&!e.done&&(id?e.id===id:e.date>=calendarDate(today())));
  if(!events.length){announce('Brak terminów do eksportu.');return;}
  saved('');const link=document.createElement('a'),url=URL.createObjectURL(new Blob([calendarICS(events,state.children[state.active].uid)],{type:'text/calendar;charset=utf-8'}));
  link.href=url;link.download='otula-terminy.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  announce('Pobrano plik. Otwórz go w kalendarzu i sprawdź przypomnienie.');
}
function parentPath(items) {
  const all=plan(),next=unfinished()[0],done=all.filter(c=>state.done.includes(c.id)).length;
  return `<div class="path-summary"><span class="path-flower">${bloom()}</span><div><h2>${done===all.length&&all.length?'Plan na ten etap gotowy':'Spokojnie, po jednym kroku'}</h2><p>${done} z ${all.length} spraw gotowych. Możesz wybrać dowolny krok.</p><progress value="${done}" max="${Math.max(1,all.length)}" aria-label="Postęp ścieżki"></progress></div></div><ol class="parent-path">${items.map(item=>{
    const complete=state.done.includes(item.id),active=item.id===next?.id,index=all.findIndex(c=>c.id===item.id)+1;
    return `<li class="path-step ${complete?'path-complete':active?'path-next':''}"><span class="path-node" aria-hidden="true">${complete?icon('check',24):icon(item.icon||GUIDE.categories[item.category].icon,24)}</span><div class="path-step-card"><div class="path-status">${complete?'Gotowe':active?'Proponowany następny krok':'Krok '+index} · ${GUIDE.categories[item.category].name}</div><h3><a href="#sprawa/${item.id}">${esc(item.title)}</a></h3><p>${esc(item.short)}</p>${dueTextFor(item)}<div class="path-step-actions"><a href="#sprawa/${item.id}">${complete?'Zajrzyj ponownie':'Zobacz krok'}</a><button data-cal-action="prepare" data-id="${item.id}">${icon('calendar',16)} Zaplanuj</button></div></div></li>`;
  }).join('')}</ol>`;
}
function formsPage(r) {
  const forms=[['Zasiłek macierzyński','Wnioski i oświadczenia dotyczące macierzyńskiego oraz okresów opieki.','zasilek-macierzynski','macierzynski'],['Dokumenty pracodawcy','Zaświadczenia i dokumenty przygotowywane przez płatnika.','formularze-dla-pracodawcy','ubezpieczenie'],['Zasiłek opiekuńczy','Formularze dotyczące opieki nad dzieckiem lub innym członkiem rodziny.','zasilek-opiekunczy',''],['Zasiłek chorobowy','Formularze do spraw związanych z niezdolnością do pracy.','zasilek-chorobowy','']];
  return backLink(r)+pageHeading('Dokumenty rodzica','Formularze ZUS','Najpierw sprawdź swoją sytuację w karcie sprawy, a aktualny druk wybierz w oficjalnym katalogu ZUS.')+`<div class="forms-grid">${forms.map(([title,desc,path,id])=>`<article><span class="setup-bloom">${icon('files',23)}</span><h2>${title}</h2><p>${desc}</p><a href="https://www.zus.pl/wzory-formularzy/zasilki/${path}" target="_blank" rel="noopener">Otwórz formularze w ZUS ${icon('external',16)}</a>${byId(id)?`<button data-cal-action="prepare" data-id="${id}">Zaplanuj przygotowanie</button>`:''}</article>`).join('')}</div><p class="plan-note">Oficjalny katalog sprawdzony 21.11.2026. Formularz i załączniki zależą od sprawy oraz płatnika. <a href="https://www.zus.pl/wzory-formularzy/zasilki" target="_blank" rel="noopener">Cały katalog ZUS</a></p>`;
}
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-cal-action]');if(!b)return;
  const action=b.dataset.calAction,id=b.dataset.id,child=state.children[state.active];
  if(action==='export'||action==='export-one'){exportFamilyCalendar(action==='export-one'?id:'');return;}
  if(action==='new'||action==='prepare'){calendarDraftCase=action==='prepare'?id:'';calendarDelete='';location.hash='termin/nowy';return;}
  if(action==='delete'){calendarDelete=id;render();main.querySelector('[data-cal-action=delete-confirm]')?.focus();return;}
  if(action==='delete-cancel'){calendarDelete='';render();return;}
  if(action==='delete-confirm'){child.events=child.events.filter(e=>e.id!==id);calendarDelete='';saved('Usunięto termin z Otuli.');location.hash='terminy';return;}
  if(action==='done'){const e=child.events.find(e=>e.id===id);if(e){e.done=!e.done;e.revision++;saved(e.done?'Termin oznaczony jako gotowy.':'Termin przywrócony.');render();}return;}
  if(action==='day')calendarDay=id;
  if(action==='all-month')calendarDay='';
  if(action==='today'){calendarDay=calendarDate(today());calendarMonth=calendarDay.slice(0,7);}
  if(action==='prev'||action==='next'){const base=parseDate(calendarMonth+'-01')||today(),next=new Date(base.getFullYear(),base.getMonth()+(action==='prev'?-1:1),1);if(next.getFullYear()<1000||next.getFullYear()>9999)return;calendarMonth=calendarDate(next).slice(0,7);calendarDay='';}
  render();main.querySelector(action==='day'?`[data-cal-action="day"][data-id="${id}"]`:action==='prev'||action==='next'?`[data-cal-action="${action}"]`:'.cal-agenda-heading h2')?.focus({preventScroll:true});
});
document.addEventListener('change',event=>{
  const t=event.target;
  if(t.id==='calendar-month'&&parseDate(t.value+'-01')){calendarMonth=t.value;calendarDay='';render();main.querySelector('#calendar-month').focus();}
  if(t.form?.id==='calendar-event-form'&&t.name==='caseId'&&!t.form.elements.title.value.trim()&&byId(t.value))t.form.elements.title.value='Przygotuj: '+byId(t.value).title;
});
document.addEventListener('submit',event=>{
  const f=event.target;if(f.id!=='calendar-event-form')return;event.preventDefault();if(!f.reportValidity())return;
  const d=new FormData(f),child=state.children[state.active],existing=child.events.find(e=>e.id===f.dataset.id);
  if(!String(d.get('title')).trim()||!parseDate(d.get('date'))){announce('Wpisz nazwę i prawidłową datę.');return;}
  const eventRecord=cleanCalendarEvents([{id:existing?.id||calendarId(),title:String(d.get('title')).trim(),date:d.get('date'),time:d.get('time'),remind:Number(d.get('remind')),caseId:d.get('caseId'),note:String(d.get('note')).trim(),done:existing?.done||false,revision:(existing?.revision||0)+1}])[0];
  if(existing)Object.assign(existing,eventRecord);else child.events.push(eventRecord);
  calendarDay=eventRecord.date;calendarMonth=eventRecord.date.slice(0,7);calendarDraftCase='';saved('Termin zapisany. Możesz dodać go do kalendarza telefonu.');location.hash='terminy';
});
