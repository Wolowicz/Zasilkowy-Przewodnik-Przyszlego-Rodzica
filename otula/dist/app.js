'use strict';

// Every screen has its own address (#plan, #sprawa/urodzenie …), so the browser
// and the phone's system "back" button always work, and any screen can be linked.
const tabs = {
  start: ['Start', 'Start', 'home'],
  plan: ['Mój plan', 'Plan', 'plan'],
  terminy: ['Moje terminy', 'Terminy', 'calendar'],
  biblioteka: ['Biblioteka spraw', 'Sprawy', 'book'],
  wsparcie: ['Karta wsparcia', 'Wsparcie', 'mail']
};
const titles = {
  termin:'Termin', formularze:'Formularze ZUS',
  kalkulator:'Kalkulator zasiłków', 'konto-demo':'Centrum e-usług', 'e-uslugi':'Centrum e-usług', 'sprawdz-sprawe':'Sprawdź sprawę ZUS', parametry:'Parametry kalkulatora', uprawnienia:'Uprawnienia i wsparcie',
  narzedzia:'Narzędzia', rodzina:'Moja rodzina', raport:'Raport rodzinny', poradnik:'Podręcznik rodzica', pomoc:'Zapytaj AI', slowniczek:'Słowniczek urzędowy',
  powitanie: 'Powitanie', dzieci: 'Dzieci w rodzinie', praca: 'Sytuacja zawodowa',
  start: 'Start', plan: 'Mój plan', terminy: 'Moje terminy', biblioteka: 'Biblioteka spraw', wsparcie: 'Karta wsparcia',
  sprawa: 'Sprawa', sytuacja: 'Moja sytuacja', 'o-przewodniku': 'O przewodniku', dane: 'Dane na urządzeniu'
};
const parents = { termin:'terminy', formularze:'terminy', kalkulator:'start', 'konto-demo':'kalkulator', 'e-uslugi':'kalkulator', 'sprawdz-sprawe':'kalkulator', parametry:'kalkulator', uprawnienia:'kalkulator', sprawa: 'plan', sytuacja: 'start', 'o-przewodniku': 'start', dane: 'start', wsparcie: 'plan' };
const storageKey = 'otula-plan-v1';
const trailKey = 'otula-trail';
const main = document.querySelector('#main');
const sidebar = document.querySelector('#sidebar');
const mobileNavigation = document.querySelector('#mobile-navigation');
let state = loadState();
let category = 'all';
let libraryStage = 'all';
let query = '';
let planFilter = 'all';
let supportId = '';
let noticeTimeout;
let storageWarning = false;
let resetAsk = false;
let trail = loadTrail();
let position = 0;

/* ---------- state ---------- */
function newState() {
  return {active:0, children:[childRecord()], role: '', onboarded: false, stage: 'pregnancy', work: 'any', date: '', done: [],
    support: { sender: '', to: 'ty', greeting: '', sign: '' } };
}
function text(value, max) { return typeof value === 'string' ? value.slice(0, max) : ''; }
function loadState() {
  const initial = newState();
  try {
    const value = JSON.parse(localStorage.getItem(storageKey));
    if (!value || typeof value !== 'object') return initial;
    if (Object.hasOwn(GUIDE.roles, value.role)) initial.role = value.role;
    initial.onboarded = value.onboarded === true;
    if (Object.hasOwn(GUIDE.stages, value.stage)) initial.stage = value.stage;
    if (Object.hasOwn(GUIDE.work, value.work)) initial.work = value.work;
    if (parseDate(value.date)) initial.date = value.date;
    if (Array.isArray(value.done)) initial.done = GUIDE.cases.filter(item => value.done.includes(item.id)).map(item => item.id);
    if (Array.isArray(value.children) && value.children.length) {
      initial.children = value.children.filter(c=>c && typeof c==='object').map(childRecord);
      if (!initial.children.length) initial.children=[childRecord(initial)];
      initial.active = Number.isInteger(value.active) && initial.children[value.active] ? value.active : 0;
    } else initial.children=[childRecord(initial)];
    const selected=initial.children[initial.active];
    Object.assign(initial,{stage:selected.stage,date:selected.date,done:selected.done.slice()});
    const s = value.support || {};
    if (['mama', 'tata', 'neutral'].includes(s.sender)) initial.support.sender = s.sender;
    if (['ty', 'pani', 'pan'].includes(s.to)) initial.support.to = s.to;
    initial.support.greeting = text(s.greeting, 40);
    initial.support.sign = text(s.sign, 40);
  } catch { /* Storage can be unavailable on shared or restricted devices. */ }
  return initial;
}
function persist() {
  try {
    snapshotChild();
    localStorage.setItem(storageKey, JSON.stringify(state));
    storageWarning = false;
    return true;
  } catch {
    storageWarning = true;
    return false;
  }
}
function announce(message) {
  const notice = document.querySelector('#notice');
  notice.textContent = message;
  notice.classList.add('visible');
  clearTimeout(noticeTimeout);
  noticeTimeout = setTimeout(() => notice.classList.remove('visible'), 4200);
}
function saved(message) {
  const ok = persist();
  if (message || !ok) announce(ok ? message : 'Zapis działa tylko do zamknięcia strony. Przeglądarka blokuje pamięć lokalną.');
}
function role() { return state.role || 'mama'; }
function esc(value) { return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]); }

/* ---------- routing and the "back" button ---------- */
function route(hash = location.hash) {
  const [page, id] = decodeURIComponent(hash.replace(/^#/, '')).split('/');
  if (page === 'etap' || page === 'data') return {page:'dzieci'};
  if(page==='poradnik' && id==='codzienne-czynnosci')return {page,id};
  if(page==='termin')return {page,id:/^[a-zA-Z0-9-]{1,80}$/.test(id||'')?id:'nowy'};
  if(page==='konto-demo')return {page:'e-uslugi',id:id==='wniosek'?'zasilek':''};
  if(page==='e-uslugi')return {page,id:/^[a-z-]{1,30}$/.test(id||'')?id:''};
  if(page==='poradnik'||page==='pomoc')return {page,id:CARE_TOPICS.some(t=>t.id===id)||byId(id)?id:''};
  if (page === 'sprawa') return byId(id) ? { page, id } : { page: 'plan' };
  if (page === 'wsparcie') return { page, id: byId(id) ? id : '' };
  if (page === 'pulpit' || !Object.hasOwn(titles, page)) return { page: 'start' };
  return { page };
}
function loadTrail() {
  try { return JSON.parse(sessionStorage.getItem(trailKey)) || []; } catch { return []; }
}
// Remembers which in-app screen sits under each browser-history entry.
function trackRoute() {
  let index = history.state && history.state.otula;
  if (typeof index !== 'number') {
    index = trail.length ? position + 1 : 0;
    history.replaceState({ otula: index }, '');
    trail.length = index;
  }
  trail[index] = location.hash || '#start';
  position = index;
  try { sessionStorage.setItem(trailKey, JSON.stringify(trail)); } catch { /* optional */ }
}
function previousHash() {
  if (position > 0 && trail[position - 1]) return trail[position - 1];
  return null;
}
function hashLabel(hash) {
  const r = route(hash);
  if (r.page === 'sprawa') return byId(r.id).title;
  return titles[r.page];
}
function backLink(r) {
  const prev = previousHash();
  const target = prev || '#' + (parents[r.page] || 'start');
  return `<button class="back-link" data-action="back">${icon('back', 18)}<span>Wróć <span class="back-target">do: ${esc(hashLabel(target))}</span></span></button>`;
}
function goBack() {
  if (previousHash()) history.back();
  else location.hash = parents[route().page] || 'start';
}

/* ---------- plan and dates ---------- */
function fits(item, anyStage = false, stage = state.stage, child = state.children[state.active]) {
  if(item.optional)return child.extras.includes(item.id);
  return (anyStage || item.stage === stage)
    && (state.work === 'any' || !item.works || item.works.includes(state.work))
    && (!item.roles || role() === 'bliska' || item.roles.includes(role()));
}
function plan() { return GUIDE.cases.filter(item => fits(item)); }
function byId(id) { return GUIDE.cases.find(item => item.id === id); }
function unfinished() { return plan().filter(item => !state.done.includes(item.id)); }

function parseDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getFullYear() === +m[1] && +m[1] >= 1000 && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
}
function today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function addDays(date, days) { const r = new Date(date); r.setDate(r.getDate() + days); return r; }
// Calendar months, clamped to the last day of a shorter month (31 I + 1 month = 28/29 II).
function addMonths(date, months) {
  const r = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(date.getDate(), last));
  return r;
}
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function dateTodayLabel() {
  return new Intl.DateTimeFormat('pl-PL', {weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'Europe/Warsaw'}).format(new Date());
}
function fmt(date) { return new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(date); }
function dueDate(item, base) {
  const d = item.due;
  if (!d || !base) return null;
  if (d.days) return addDays(base, d.days);
  if (d.months) return addMonths(base, d.months);
  return null;
}
function dueRule(due) {
  if (due.text) return due.text;
  if (due.days) return `${due.days} dni od urodzenia`;
  return due.months === 12 ? '12 miesięcy od urodzenia' : `${due.months} miesiące od urodzenia`;
}
function countdown(date) {
  const left = daysBetween(today(), date);
  if (left > 1) return { label: `jeszcze ${left} dni`, tone: left <= 7 ? 'soon' : 'later' };
  if (left === 1) return { label: 'jutro', tone: 'soon' };
  if (left === 0) return { label: 'dzisiaj', tone: 'soon' };
  return { label: 'termin minął', tone: 'past' };
}
function timeline() {
  const base = parseDate(state.date);
  const key = due => due.days || (due.months ? due.months * 30.5 : 8);
  return GUIDE.cases.filter(item => item.due && fits(item, true))
    .map(item => ({ item, date: dueDate(item, base) }))
    .sort((a, b) => key(a.item.due) - key(b.item.due));
}
function nextUpcomingDeadline() {
  return timeline().find(entry=>entry.date && !state.done.includes(entry.item.id) && daysBetween(today(),entry.date)>=0);
}
function dueTextFor(item) {
  if (state.stage !== 'birth') return '';
  const date = dueDate(item, parseDate(state.date));
  if (!date) return '';
  const c = countdown(date);
  return `<p class="due-date">Orientacyjnie do <b>${fmt(date)}</b> <span class="chip ${c.tone}">${c.label}</span></p>`;
}

/* ---------- shared pieces ---------- */
function brand(linked=true) {
  const mark='<img src="./assets/otula-logo.svg" alt="Otula" width="114" height="34">';
  return linked?`<a class="brand" href="#start" aria-label="Otula, start">${mark}</a>`:`<span class="brand">${mark}</span>`;
}
function navLinks(active, cls, short = false) {
  const entries=Object.entries(tabs);
  if(short)for(const tool of familyTools)entries.push([tool.id,[tool.label,tool.short,tool.glyph]]);
  return entries.map(([id, [label, shortLabel, glyph]]) =>
    `<a href="#${id}" class="${cls} ${active === id ? 'selected' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon(glyph,20)}<span>${short ? shortLabel : label}</span></a>`).join('');
}
function frame(r) {
  const active = ({sprawa:'plan',slowniczek:'biblioteka'})[r.page] || r.page;
  sidebar.innerHTML = `<div class="brand-block">${brand()}<div class="brand-subtitle">Twój plan rodzicielstwa</div></div>
    <nav aria-label="Nawigacja główna"><div class="nav-label">Twoja przestrzeń</div>${navLinks(active, 'nav-item')}
    <a href="#sytuacja" class="nav-item ${active === 'sytuacja' ? 'selected' : ''}">${icon('person', 20)}<span>Moja sytuacja</span></a>
    <div class="nav-label nav-section">Zasiłki ZUS</div>
    <a href="#kalkulator" class="nav-item ${active==='kalkulator'?'selected':''}">${icon('wallet',20)}<span>Kalkulator zasiłków</span></a>
    <a href="#sprawdz-sprawe" class="nav-item ${active==='sprawdz-sprawe'?'selected':''}">${icon('file',20)}<span>Sprawdź sprawę ZUS</span></a>
    <a href="#e-uslugi" class="nav-item ${active==='e-uslugi'?'selected':''}">${icon('shield',20)}<span>Centrum e-usług</span></a>
    <a href="#uprawnienia" class="nav-item ${active==='uprawnienia'?'selected':''}">${icon('heart',20)}<span>Świadczenia w ciąży</span></a>
    <a href="#parametry" class="nav-item ${active==='parametry'?'selected':''}">${icon('adjust',20)}<span>Panel parametrów</span></a>${familyNavigation(active)}</nav>`;
  document.querySelector('.footer').innerHTML = `<a href="#o-przewodniku">${icon('help',18)} O przewodniku</a><a href="#dane">${icon('lock',18)} Dane i usuwanie profilu</a><button class="text-button" data-action="invite">${icon('share',18)} Zaproś znajomych</button><span id="invite-link"></span>`;
  const crumbs = [['start', 'Start']];
  if (r.page === 'sprawa') crumbs.push(['plan', 'Mój plan'], ['', byId(r.id).title]);
  else if (r.page !== 'start') crumbs.push(['', titles[r.page]]);
  document.querySelector('#topbar').innerHTML = `<nav class="crumb" aria-label="Jesteś tutaj">${crumbs.map(([href, label], i) =>
      i < crumbs.length - 1 ? `<a href="#${href}">${esc(label)}</a><i aria-hidden="true">/</i>` : `<strong>${esc(label)}</strong>`).join(' ')}</nav>
    <div class="mobile-brand">${brand()}<span class="brand-subtitle">Twój plan rodzicielstwa</span></div>
    <span class="frame-date">${dateTodayLabel()}</span>
    <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-navigation" data-action="toggle-menu">${icon('menu',22)}<span>Menu</span></button>`;
  mobileNavigation.hidden = true;
  mobileNavigation.innerHTML = `<div class="mobile-nav-heading"><strong>W czym pomóc?</strong><button type="button" class="icon-button" data-action="close-menu" aria-label="Zamknij menu">${icon('close',22)}</button></div>
    <div class="mobile-nav-links">${navLinks(active,'nav-item')}
    <a href="#kalkulator" class="nav-item" ${active==='kalkulator'?'aria-current="page"':''}>${icon('wallet',20)}<span>Kalkulator zasiłków</span></a>
    <a href="#sprawdz-sprawe" class="nav-item" ${active==='sprawdz-sprawe'?'aria-current="page"':''}>${icon('file',20)}<span>Sprawdź sprawę ZUS</span></a>
    <a href="#e-uslugi" class="nav-item" ${active==='e-uslugi'?'aria-current="page"':''}>${icon('shield',20)}<span>Centrum e-usług</span></a>
    <a href="#uprawnienia" class="nav-item" ${active==='uprawnienia'?'aria-current="page"':''}>${icon('heart',20)}<span>Świadczenia w ciąży</span></a>
    <a href="#parametry" class="nav-item" ${active==='parametry'?'aria-current="page"':''}>${icon('adjust',20)}<span>Panel parametrów</span></a>
    <a href="#formularze" class="nav-item" ${active==='formularze'?'aria-current="page"':''}>${icon('files',20)}<span>Dokumenty i formularze</span></a>
    ${familyTools.map(tool=>`<a class="nav-item" href="#${tool.id}" ${active===tool.id?'aria-current="page"':''}>${icon(tool.glyph,20)}<span>${tool.label}</span></a>`).join('')}
    <a href="#sytuacja" class="nav-item" ${active==='sytuacja'?'aria-current="page"':''}>${icon('adjust',20)}<span>Moja sytuacja</span></a>
    <a href="#rodzina" class="nav-item" ${active==='rodzina'?'aria-current="page"':''}>${icon('person',20)}<span>Moja rodzina</span></a></div>`;
  document.title = (r.page === 'sprawa' ? byId(r.id).title : titles[r.page]) + ' · Otula';
}
function setMobileMenu(open, restoreFocus = false) {
  const toggle=document.querySelector('.mobile-menu-toggle');
  if(!mobileNavigation || !toggle)return;
  if(open)mobileNavigation.style.setProperty('--mobile-menu-top',Math.ceil(document.querySelector('#topbar').getBoundingClientRect().bottom)+'px');
  mobileNavigation.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  window.syncAssistantLauncher?.(route(),document.body.classList.contains('arriving'));
  if(open)mobileNavigation.querySelector('a[aria-current],a')?.focus({preventScroll:true});
  else if(restoreFocus)toggle.focus({preventScroll:true});
}
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && !mobileNavigation.hidden){setMobileMenu(false,true);event.preventDefault();}
});
document.addEventListener('click',event=>{
  if(mobileNavigation.hidden)return;
  if(event.target.closest('#mobile-navigation a'))setMobileMenu(false,event.target.closest('a').hash===location.hash);
  else if(!event.target.closest('#mobile-navigation,.mobile-menu-toggle'))setMobileMenu(false);
});
document.addEventListener('focusin',event=>{
  if(!mobileNavigation.hidden && !event.target.closest('#mobile-navigation,.mobile-menu-toggle'))setMobileMenu(false);
});
window.matchMedia('(min-width: 901px)').addEventListener('change',event=>{if(event.matches)setMobileMenu(false);});
function tileIcon(item, big = false) {
  return `<span class="tile-icon ${item.color} ${big ? 'big' : ''}">${icon(item.icon, big ? 27 : 24)}</span>`;
}
function row(item, showState = false) {
  const done = state.done.includes(item.id);
  return `<a class="case-row ${done ? 'done' : ''}" href="#sprawa/${item.id}">
    ${tileIcon(done ? { icon: 'check', color: 'sage' } : item)}
    <span class="case-copy"><span class="case-title">${item.title}</span><span class="case-sub">${showState && done ? 'Gotowe · ' : ''}${item.short}</span></span>
    <span class="institution">${item.institution}</span>${icon('right', 16)}</a>`;
}
function progressBox() {
  const all = plan();
  const count = all.length - unfinished().length;
  const fraction = all.length ? count / all.length : 0;
  return `<section class="overview"><div class="overview-top"><div class="small-label">Twój postęp</div><span class="stage-label">${icon('sprout', 13)} ${GUIDE.stages[state.stage]}</span></div>
    <div class="progress-main"><div class="ring" style="--progress:${fraction * 100}%"><span>${Math.round(fraction * 100)}<small>%</small></span></div>
    <div><strong>${count} z ${all.length}</strong><p>kroków za Tobą</p></div></div>
    <a class="overview-link" href="#sytuacja">${icon('adjust', 16)} Dopasuj mój plan ${icon('right', 14)}</a></section>`;
}
function deadlineMini() {
  const base = parseDate(state.date);
  let body;
  if (!base) {
    body = `<strong>${state.stage === 'birth' ? 'Policz swoje terminy' : 'Kiedy termin porodu?'}</strong><small>Wpisz datę, a Otula policzy najważniejsze terminy</small>`;
  } else if (state.stage === 'pregnancy') {
    const left = daysBetween(today(), base);
    body = left >= 0 ? `<strong>${weeksLabel(left)}</strong><small>do przewidywanego terminu porodu</small>` : '<strong>Maluszek już z Wami?</strong><small>Zmień etap i wpisz datę urodzenia</small>';
  } else {
    const next = nextUpcomingDeadline();
    body = next ? `<strong>${fmt(next.date)}</strong><small>${next.item.due.label} · ${countdown(next.date).label}</small>` : '<strong>Brak nadchodzących terminów</strong><small>Zajrzyj do listy terminów</small>';
  }
  return `<a class="deadline-mini" href="#terminy">${tileIcon({ icon: 'calendar', color: 'gold' })}<span>${body}</span>${icon('right', 15)}</a>`;
}
function weeksLabel(days) {
  const w = Math.floor(days / 7), d = days % 7;
  if (!w) return `${d} ${d === 1 ? 'dzień' : 'dni'}`;
  return `${w} tyg.${d ? ` i ${d} ${d === 1 ? 'dzień' : 'dni'}` : ''}`;
}
function supportMini() {
  return `<a class="support-mini" href="#wsparcie"><span class="letter-art" aria-hidden="true"><i>♥</i></span>
    <span><strong>Karta wsparcia</strong><small>Uprzejmie poproś bliską osobę o pomoc</small></span>${icon('right', 15)}</a>`;
}
function heading(title, link, label) {
  return `<div class="section-title"><h2>${title}</h2>${link ? `<a href="#${link}">${label} ${icon('arrow', 15)}</a>` : ''}</div>`;
}
function empty(title, body) {
  return `<div class="empty">${icon('leaf', 28)}<strong>${title}</strong><p>${body}</p></div>`;
}
function pageHeading(kicker, title, copy) {
  return `<div class="page-intro"><div class="small-label">${kicker}</div><h1 tabindex="-1">${title}</h1>${copy ? `<p>${copy}</p>` : ''}</div>`;
}
function filterButton(action, key, label, selected) {
  return `<button data-action="${action}" data-id="${key}" class="filter ${selected === key ? 'active' : ''}" aria-pressed="${selected === key}">${label}</button>`;
}
function options(entries, selected) {
  return Object.entries(entries).map(([key, label]) => `<option value="${key}" ${selected === key ? 'selected' : ''}>${esc(label)}</option>`).join('');
}
function radios(name, entries, selected, cls = 'segmented') {
  return `<div class="${cls}">${Object.entries(entries).map(([key, label]) =>
    `<label><input type="radio" name="${name}" value="${key}" ${selected === key ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div>`;
}

/* ---------- pages ---------- */
function setupChild(child,index) {
  const birth=child.stage==='birth';
  const removable=index>0 && !state.onboarded && !child.done.length && !child.extras.length && !child.note && !child.checks.length;
  return `<details class="setup-entry" name="setup-children" data-child-index="${index}" ${state.active===index?'open':''}>
    <summary><span class="setup-bloom">${icon('flower',22)}</span><span class="entry-label"><strong data-child-title>${esc(childLabel(index))}</strong><small data-child-stage>${GUIDE.stages[child.stage]}</small></span>${icon('chevron',18)}</summary>
    <div class="setup-child"><label class="field">Imię lub pseudonim <small>Opcjonalnie</small><input type="text" data-child-field="name" maxlength="40" value="${esc(child.name)}" autocomplete="off"></label>
    <fieldset class="setup-stage"><legend>Etap</legend><div class="segmented">${Object.entries(GUIDE.stages).map(([key,label])=>`<label><input type="radio" name="stage-${index}" data-child-field="stage" value="${key}" ${child.stage===key?'checked':''}><span>${label}</span></label>`).join('')}</div></fieldset>
    <label class="field"><span data-child-date-label>${birth?'Data urodzenia':'Przewidywany termin porodu'}</span><small>Opcjonalnie</small><input type="date" data-child-field="date" min="1000-01-01" max="9999-12-31" value="${child.date}"></label>
    <label class="multiple-choice"><input type="checkbox" data-child-field="multiple" ${child.multiple?'checked':''}> Dziecko z ciąży mnogiej</label>
    ${removable?`<button class="text-button" type="button" data-action="remove-setup-child" data-id="${index}">Usuń z tej listy</button>`:''}</div></details>`;
}
function updateSetupChild(field) {
  const group=field.closest('[data-child-index]'), child=group && state.children[Number(group.dataset.childIndex)];
  if(!child)return;
  switch(field.dataset.childField){
    case 'name': child.name=field.value.slice(0,40); group.querySelector('[data-child-title]').textContent=child.name.trim() || 'Dziecko '+(Number(group.dataset.childIndex)+1); break;
    case 'date': if(!field.validity.valid || (field.value && !parseDate(field.value)))return; child.date=field.value; break;
    case 'multiple': child.multiple=field.checked; break;
    case 'stage':
      if(!field.checked || child.stage===field.value)return;
      child.stage=field.value; child.date='';
      group.querySelector('[data-child-stage]').textContent=GUIDE.stages[child.stage];
      group.querySelector('[data-child-field=date]').value='';
      group.querySelector('[data-child-date-label]').textContent=child.stage==='birth'?'Data urodzenia':'Przewidywany termin porodu'; break;
    default:return;
  }
  const selected=state.children[state.active];
  state.stage=selected.stage; state.date=selected.date;
  saved('');
}
function welcome(illustration) {
  if (route().page === 'dzieci') {
    return `<section class="welcome setup-step"><div class="welcome-copy"><h1 tabindex="-1">Dla kogo układasz plan?</h1><p>Wybierz etap dla każdego dziecka. Jeśli podasz datę, Otula wyliczy jego terminy.</p></div>
    <form id="setup-family">${state.children.map(setupChild).join('')}
    <button type="button" class="add-child" data-action="add-setup-child"><span aria-hidden="true">+</span> Dodaj kolejne dziecko</button>
    <div class="setup-actions"><button class="button primary" type="submit">Dalej ${icon('arrow',16)}</button><a class="text-button" href="#powitanie">${icon('back',16)} Wróć do wyboru roli</a></div></form></section>`;
  }
  if (route().page === 'praca') {
    const workIcons={employee:'briefcase',contract:'file',business:'wallet',other:'layers'};
    return `<section class="welcome setup-step"><div class="welcome-copy">
    <h1 tabindex="-1">${role() === 'bliska' ? 'Jak pracuje rodzic, którego wspierasz?' : 'Jaka jest Twoja sytuacja zawodowa?'}</h1>
    <p>Na tej podstawie dobierzemy sprawy dotyczące urlopów i zasiłków.</p></div>
    <div class="setup-work"><div class="role-grid work-options">${Object.entries(GUIDE.work).filter(([key]) => key !== 'any').map(([key,label]) => `<button class="role-tile" data-action="onboard-work" data-id="${key}"><span class="role-symbol">${icon(workIcons[key],22)}</span><strong>${label}</strong>${icon('right',16)}</button>`).join('')}</div>
    <div class="setup-actions"><button class="button secondary" data-action="onboard-work" data-id="any">Pomiń i otwórz plan ${icon('arrow',16)}</button><a class="text-button" href="#dzieci">${icon('back',16)} Wróć do dzieci</a></div></div></section>`;
  }
  return `<section class="welcome welcome-role" aria-labelledby="welcome-title"><div class="welcome-copy">
      <h1 id="welcome-title" tabindex="-1">Kto korzysta z Otuli?</h1><p>Dopasujemy plan do Twojej roli. Możesz ją później zmienić.</p></div>
      ${illustration}<div class="role-grid">${Object.entries(GUIDE.roles).map(([key, r]) => `<button class="role-tile ${r.color}" data-action="role" data-id="${key}">
        <span class="role-symbol">${icon(r.icon, 23)}</span><span class="role-copy"><strong>${r.label}</strong><small>${r.description}</small></span>${icon('right',16)}</button>`).join('')}</div></section>`;
}
function arrival() {
  const {page}=route();
  const step=page==='dzieci'?2:page==='praca'?3:1;
  const illustration='<img class="arrival-art" src="./assets/powitanie-z-bliskimi.webp" width="1440" height="576" alt="Babcia i koleżanka odwiedzają rodziców z noworodkiem.">';
  const content=step===1?welcome(illustration):`<div class="arrival-side">${illustration}<p>Spokojnie, po jednym kroku.<span>Układamy plan dopasowany do Was.</span></p></div><div class="arrival-inner">${welcome()}</div>`;
  return `<div class="arrival" data-step="${step}"><header class="arrival-brand"><div class="arrival-signature">${brand(false)}<span class="brand-subtitle">Twój plan rodzicielstwa</span></div><div class="arrival-progress"><span>Krok ${step} z 3</span><span class="step-track" aria-hidden="true">${[1,2,3].map(n=>`<i class="${n<=step?'complete':''}"></i>`).join('')}</span></div></header><div class="arrival-card">${content}</div></div>`;
}
function dashboardFamily() {
  const many=state.children.length>1;
  const name=state.children[state.active].name;
  const options=state.children.map((child,i)=>`<option value="${i}" ${i===state.active?'selected':''}>${esc(childLabel(i))}</option>`).join('');
  return `<div class="dashboard-family">
    ${many?`<label for="active-child">Plan dziecka</label><select id="active-child">${options}</select>`:name?`<span class="child-caption">Plan dziecka</span><strong>${esc(name)}</strong>`:''}
    <a href="#rodzina">${icon('person',16)} Moja rodzina</a></div>`;
}
function dashboardCalendar() {
  const birth=state.stage==='birth', base=parseDate(state.date);
  const upcoming=birth && base && nextUpcomingDeadline();
  const date=birth?(upcoming?.date||null):base;
  const label=birth?'Najbliższy termin':'Przewidywany termin porodu';
  let title, note, link='terminy', action='Otwórz kalendarz';
  if(!base){
    title=birth?'Dodaj datę urodzenia':'Dodaj termin porodu';
    note=birth?'Zobaczysz orientacyjne daty spraw po narodzinach.':'Zobaczysz, ile czasu zostało do przewidywanej daty.';
    action='Uzupełnij datę';
  }else if(birth){
    title=upcoming?upcoming.item.due.label:'Brak nadchodzących terminów';
    note=upcoming?`Orientacyjnie ${fmt(date)} · ${countdown(date).label}`:'W kalendarzu możesz sprawdzić także wcześniejsze daty.';
  }else{
    const left=daysBetween(today(),base);
    title=left>0?`Za ${weeksLabel(left)}`:left===0?'Termin przypada dziś':'Minął przewidywany termin';
    note=left>=0?fmt(base):'Jeśli dziecko jest już na świecie, ustaw datę urodzenia.';
    if(left<0){link='sytuacja';action='Zmień etap';}
  }
  return `<section class="home-calendar"><div class="home-kicker">${label}</div>
    <div class="calendar-entry"><span class="calendar-leaf" aria-hidden="true">${date?`<small>${date.toLocaleDateString('pl-PL',{month:'short'}).replace('.','')}</small><b>${date.getDate()}</b>`:icon('calendar',30)}</span>
    <div><h2>${title}</h2><p>${note}</p></div></div>
    <a class="dashboard-link" href="#${link}">${action} ${icon('arrow',16)}</a></section>`;
}
function start() {
  if (!state.onboarded) return arrival();
  const all=plan(), remaining=all.filter(item=>!state.done.includes(item.id));
  const [next,...later]=remaining, done=all.length-remaining.length;
  const pregnancy=state.stage==='pregnancy';
  const supporting=role()==='bliska';
  const artClass=supporting?'with-support':pregnancy && role()==='mama'?'with-mother':'with-family';
  const art=supporting
    ? '<img class="support-art" src="./assets/wsparcie-babci.webp" width="1440" height="576" alt="Babcia obejmuje dorosłą córkę.">'
    : `<div class="feature-art" aria-hidden="true"></div><img class="mobile-feature-art" src="./assets/${artClass==='with-mother'?'otula-hero':'powitanie-rodziny'}.webp" width="${artClass==='with-mother'?1260:1440}" height="${artClass==='with-mother'?840:576}" alt="">`;
  const topics=(pregnancy?['plan-porodu','torba-porodowa']:['wypis-noworodka','glod-i-sytosc']).map(id=>CARE_TOPICS.find(t=>t.id===id));
  const title=next?next.title:all.length?'Wszystkie sprawy odhaczone':'Wybierz sprawy dla rodziny';
  const copy=next?next.short:all.length?'W planie możesz wrócić do dokumentów i sprawdzić wykonane kroki.':'W bibliotece znajdziesz dokumenty i świadczenia, które możesz dodać do planu dziecka.';
  return `<div class="home-dashboard"><header class="dashboard-head"><div><div class="home-date">${dateTodayLabel()}</div><h1 tabindex="-1">Rodzinny plan</h1><p class="dashboard-stage">${icon(pregnancy?'sprout':'heart',17)} ${GUIDE.stages[state.stage]} <span>·</span> ${esc(GUIDE.roles[role()].short)}</p></div>${dashboardFamily()}</header>
  <nav class="home-shortcuts" aria-label="Najważniejsze sprawy"><a href="#plan">${icon('plan',21)} Mój plan</a><a href="#terminy">${icon('calendar',21)} Moje terminy</a><a href="#wsparcie">${icon('mail',21)} Karta wsparcia</a></nav>
  <a class="benefit-launch" href="#kalkulator"><span class="setup-bloom">${icon('wallet',23)}</span><span><strong>Zasiłki i podział opieki</strong><small>Policz wariant dla obojga rodziców</small></span>${icon('right',18)}</a><div class="dashboard-panels"><section class="home-feature ${artClass}">${art}<div class="feature-copy">
  <div class="home-kicker">${next?'Następna sprawa':'Twój plan'}</div><h2>${title}</h2><p>${copy}</p>
  <a class="button primary" href="#${next?'sprawa/'+next.id:all.length?'plan':'biblioteka'}">${next?'Otwórz sprawę':all.length?'Przejrzyj plan':'Wybierz sprawę'} ${icon('arrow',16)}</a></div></section>
  ${dashboardCalendar()}
  <section class="home-progress"><div class="home-progress-head"><h2>Postęp w planie</h2><span>${done} z ${all.length} gotowych</span></div>
  <progress value="${done}" max="${Math.max(1,all.length)}" aria-label="Gotowe sprawy" aria-valuetext="${done} z ${all.length}"></progress>
  ${later.length?`<h3>Kolejne sprawy</h3><div class="next-list">${later.slice(0,2).map(item=>row(item)).join('')}</div>`:''}
  ${next?`<a class="dashboard-link" href="#plan">Cały plan ${icon('arrow',16)}</a>`:''}</section>
  <section class="home-reading"><div class="home-kicker">${icon('book',16)} Z podręcznika rodzica</div><h2>${pregnancy?'Przed porodem':'Pierwsze tygodnie'}</h2>
  ${topics.map(t=>`<a href="#poradnik/${t.id}">${esc(t.title)} ${icon('right',15)}</a>`).join('')}</section></div></div>`;
}
function profileSummary() {
  return `<div class="profile-summary">${icon(GUIDE.roles[role()].icon)}<span><b>${GUIDE.roles[role()].short}</b> · ${GUIDE.stages[state.stage]} · ${GUIDE.work[state.work]}</span><a class="text-button" href="#sytuacja">Zmień</a></div>`;
}
function planPage() {
  let items = plan();
  if (planFilter === 'open') items = unfinished();
  if (planFilter === 'done') items = items.filter(item => state.done.includes(item.id));
  const filters = [['all', 'Wszystkie'], ['open', 'Do zrobienia'], ['done', 'Gotowe']];
  return `${pageHeading('Twój rytm, Twoja rodzina', 'Ścieżka rodzica', 'Wybierz mały krok na teraz. W każdej sprawie czekają dokumenty, instrukcja i możliwość zaplanowania własnego terminu.')}
    <div class="dashboard-grid inner-grid"><section>${profileSummary()}
    <div class="filters" role="group" aria-label="Pokaż kroki">${filters.map(([key, label]) => filterButton('filter-plan', key, label, planFilter)).join('')}</div>
    ${items.length ? parentPath(items) : empty('Brak kroków w tym widoku.', 'Wybierz inny filtr, aby zobaczyć pozostałe sprawy.')}
    <p class="plan-note">„Gotowe” oznacza Twój własny postęp. Potwierdzenie złożenia wniosku otrzymasz w urzędzie lub jego e-usłudze. <a href="#biblioteka">Przeglądaj wszystkie sprawy</a></p></section>
    <aside class="inner-aside">${progressBox()}${deadlineMini()}${supportMini()}</aside></div>`;
}
function casePage(id) {
  const item = byId(id);
  const done = state.done.includes(id);
  const selected=state.children[state.active].extras.includes(id);
  const c = item.choice;
  const answer = caseAnswers[id];
  const [who, when, wait, amount, appeal] = caseQuestions[id];
  const list = plan();
  const index = list.findIndex(x => x.id === id);
  const next = index >= 0 ? list[index + 1] : null;
  const choice = c ? `<div class="choice-box"><label for="payer">${c.question}</label><select id="payer" data-id="${id}"><option value="">Nie wiem jeszcze</option>${options(Object.fromEntries(c.options.map(o => [o.id, o.label])), '')}</select><p id="choice-hint" aria-live="polite">${c.initial}</p></div>` : '';
  return `<article class="case-page">
    <div class="case-head">${tileIcon(done ? { icon: 'check', color: 'sage' } : item, true)}<div>
      <div class="small-label">${GUIDE.stages[item.stage]} · ${GUIDE.categories[item.category].name} · ${item.institution}</div>
      <h1 tabindex="-1">${item.title}</h1></div></div>
    ${done ? `<p class="done-banner">${icon('check', 17)} Oznaczono jako gotowe. To Twój własny postęp — potwierdzenie złożenia wniosku daje urząd.</p>` : ''}
    <p class="lead">${item.meaning}</p><div class="case-benefits"><section>${icon('heart',21)}<div><h2>Co Ci to daje?</h2><p>${item.benefit}</p></div></section><section>${icon('wallet',21)}<div><h2>Ile to kosztuje?</h2><p>${item.cost}</p></div></section></div>${familyCaseHint(id,state.active)}
    <div class="deadline">${icon('clock', 21)}<div><strong>Termin</strong><p>${item.timing}</p>${dueTextFor(item)}</div></div>
    <div class="quick-answers"><section><h2>${who}</h2><p>${answer.who}</p></section><section><h2>${when}</h2><p>${answer.when}</p></section></div>
    <div class="case-columns"><section><h2>Co musisz zrobić?</h2><ol>${item.steps.map(step => '<li>' + step + '</li>').join('')}</ol></section>
    <section><h2>Co musisz przygotować?</h2><ul>${item.docs.map(doc => '<li>' + doc + '</li>').join('')}</ul></section></div>${choice}
    <div class="answer-list">${[[wait,answer.wait],[amount,answer.amount],[appeal,answer.appeal],['Informacje dodatkowe',answer.more],['Kontakt',answer.contact],['Podstawa prawna',answer.law]].filter(([title]) => title).map(([title,body]) => `<details><summary>${title}</summary><p>${body}</p></details>`).join('')}</div>
    <div class="source-box"><div class="small-label">Oficjalne źródło</div><a href="${item.source}" target="_blank" rel="noopener noreferrer">Instrukcja • ${item.institution} ${icon('external', 15)}</a>
    ${item.valueSource && item.valueSource!==item.source && item.valueSource!==item.extra?.[1] ? `<a href="${item.valueSource}" target="_blank" rel="noopener noreferrer">Sprawdź koszt lub uprawnienie ${icon('external',15)}</a>` : ''}
    ${item.extra ? `<a href="${item.extra[1]}" target="_blank" rel="noopener noreferrer">${item.extra[0]} ${icon('external', 15)}</a>` : ''}<small>Sprawdzono ${GUIDE.reviewed}</small></div>
    <div class="case-actions">${item.optional ? `<button class="button ${selected?'secondary':'primary'}" data-action="optional-plan" data-id="${id}">${icon('plan',17)} ${selected?'Usuń z planu':'Dodaj do mojego planu'}</button>` : ''}
    ${!item.optional || selected ? `<button class="button primary" data-action="toggle" data-id="${id}">${icon('check', 17)} ${done ? 'Cofnij oznaczenie' : 'Oznacz jako gotowe'}</button>` : ''}
    <button class="button secondary" data-cal-action="prepare" data-id="${id}">${icon('calendar',17)} Zaplanuj przygotowanie</button>${/ZUS/.test(item.institution)?'<a class="text-button" href="#formularze">Aktualne formularze ZUS</a>':''}
    <a class="button secondary" href="#wsparcie/${id}">${icon('mail', 16)} Poproś kogoś o pomoc</a><a class="text-button" href="#pomoc/${id}">${icon('chat',17)} Zapytaj AI o tę sprawę</a></div>
    ${next ? `<a class="next-case" href="#sprawa/${next.id}"><span><small>Następna sprawa w planie</small><strong>${next.title}</strong></span>${icon('arrow', 18)}</a>` : ''}
  </article>`;
}
function normalize(value) { return value.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('ł', 'l'); }
function libraryResults() {
  const needle = normalize(query.trim());
  const items = GUIDE.cases.filter(item => (libraryStage === 'all' || item.stage === libraryStage) && (category === 'all' || item.category === category) && normalize([item.title, item.short, item.institution, item.meaning, item.benefit, ...item.docs, ...item.steps, GUIDE.stages[item.stage], GUIDE.categories[item.category].name].join(' ')).includes(needle));
  return `<p class="count-label" role="status">Liczba spraw: ${items.length}</p><div class="catalog-grid">${items.length ? items.map(item => `<a class="catalog-card" href="#sprawa/${item.id}">
    <span class="catalog-top">${tileIcon(item)}<span class="stage-label">${GUIDE.stages[item.stage]}</span></span>
    <strong>${item.title}</strong><span class="catalog-copy">${item.short}</span><span class="catalog-foot">${item.institution} ${icon('arrow', 17)}</span></a>`).join('') : empty('Brak pasujących spraw.', 'Zmień etap, kategorię lub wpisz inne słowo, np. „ZUS”.')}</div>`;
}
function library() {
  return `${pageHeading('Przewodnik rodzica', 'Biblioteka spraw', 'Wyszukaj świadczenie lub formalność. Każda karta prowadzi do informacji właściwej instytucji.')}
    <label class="search-box">${icon('search')}<input id="query" type="search" autocomplete="off" aria-label="Szukaj sprawy" placeholder="Szukaj sprawy, dokumentu lub instytucji…"></label>
    <strong>Etap</strong><div class="filters" role="group" aria-label="Etap">${Object.entries({all:'Wszystkie', ...GUIDE.stages}).map(([key,label]) => filterButton('library-stage',key,label,libraryStage)).join('')}</div>
    <strong>Kategoria</strong><div class="filters" role="group" aria-label="Kategoria">${filterButton('filter-library', 'all', 'Wszystkie', category)}${Object.entries(GUIDE.categories).map(([key, cat]) => filterButton('filter-library', key, cat.name, category)).join('')}</div>
    <div id="results">${libraryResults()}</div>
    <a class="tool-entry" href="#slowniczek">${icon('book',23)}<span><strong>Słowniczek urzędowy</strong><small>Znajdź termin i jego wyjaśnienie.</small></span>${icon('arrow',18)}</a>`;
}
function dateLabel() {
  return state.stage === 'birth' ? 'Data urodzenia dziecka' : 'Przewidywana data porodu';
}
function deadlinesPage() { return calendarPage(); }
function supportSender() {
  return state.support.sender || ({ mama: 'mama', tata: 'tata' }[state.role] || 'neutral');
}
// Builds a warm, polite request. Polish grammar depends on who writes (mogłabym / mógłbym)
// and to whom (Ty / Pani / Pan), so the case only supplies a noun phrase and a reason.
function compose(item) {
  const sender = supportSender();
  const to = state.support.to;
  const p = { ty: { poss: 'Twoją', dat: 'Ci' }, pani: { poss: 'Pani', dat: 'Pani' }, pan: { poss: 'Pana', dat: 'Panu' } }[to];
  const greeting = state.support.greeting.trim() || (to === 'ty' ? 'Cześć' : 'Dzień dobry');
  const can = { mama: 'czy mogłabym', tata: 'czy mógłbym', neutral: 'czy mogę' }[sender];
  const body = `${can} liczyć na ${p.poss} pomoc w jednej sprawie? Bardzo proszę o ${item.ask}. ${item.reason}`;
  const thanks = sender === 'neutral'
    ? `Z góry ${p.dat} bardzo dziękuję${to === 'ty' ? ' ❤️' : '.'}`
    : `Będę ${p.dat} bardzo ${sender === 'mama' ? 'wdzięczna' : 'wdzięczny'}. ${to === 'ty' ? 'Dziękuję ❤️' : 'Z góry dziękuję.'}`;
  const sign = state.support.sign.trim();
  const ending = to === 'ty' ? sign : 'Pozdrawiam serdecznie' + (sign ? '\n' + sign : '');
  return `${greeting.replace(/[,!.]+$/, '')},\n${body}\n\n${thanks}${ending ? '\n' + ending : ''}`;
}
function support(r) {
  const item = byId(r.id || supportId) || unfinished()[0] || plan()[0] || GUIDE.cases[0];
  supportId = item.id;
  const menu = Object.fromEntries(GUIDE.cases.map(c => [c.id, c.title]));
  const touch = matchMedia('(pointer: coarse)').matches;
  return `${r.id ? backLink(r) : ''}${pageHeading('Blisko siebie', 'Karta wsparcia', 'Wybierz jedną sprawę, a Otula przygotuje uprzejmą prośbę do bliskiej osoby. Ty decydujesz, komu i jak ją wyślesz.')}
    <div class="support-layout"><section class="support-form" aria-label="Ustawienia prośby">
      <label for="support-select">1. W czym potrzebujesz pomocy?</label><select id="support-select">${options(menu, supportId)}</select>
      <fieldset><legend>2. Kto pisze?</legend>${radios('sender', { mama: 'Mama <small>„mogłabym”</small>', tata: 'Tata <small>„mógłbym”</small>', neutral: 'Neutralnie <small>„czy mogę”</small>' }, supportSender())}</fieldset>
      <fieldset><legend>3. Do kogo piszesz?</legend>${radios('to', { ty: 'Na „Ty” <small>partner, mama, przyjaciółka</small>', pani: 'Do Pani <small>np. teściowa, sąsiadka</small>', pan: 'Do Pana <small>np. teść, sąsiad</small>' }, state.support.to)}</fieldset>
      <div class="two-fields"><label class="field"><span>Zwrot na początku <small>(opcjonalnie)</small></span><input id="greeting" maxlength="40" autocomplete="off" value="${esc(state.support.greeting)}" placeholder="np. Cześć Mamo, Kochanie, Pani Basiu"></label>
      <label class="field"><span>Podpis <small>(opcjonalnie)</small></span><input id="sign" maxlength="40" autocomplete="off" value="${esc(state.support.sign)}" placeholder="np. Kasia"></label></div>
    </section>
    <section class="support-preview" aria-label="Podgląd prośby">
      <div class="request-card"><div class="request-head">${bloom()}<span>Karta wsparcia · ${item.title}</span></div>
      <textarea id="message-text" aria-label="Treść prośby — możesz ją poprawić" spellcheck="true">${esc(compose(item))}</textarea>
      <div class="request-sign">otula.</div></div>
      <p class="hint">${icon('edit', 15)} Możesz poprawić tekst przed wysłaniem. Zmiana ustawień prośby przygotuje go od nowa.</p>
      <div class="support-actions">${navigator.share ? `<button class="button primary" data-action="share">${icon('share', 17)} Wyślij…</button>` : ''}
      ${touch ? `<button class="button secondary" data-action="sms">${icon('chat', 17)} SMS</button>` : ''}
      <button class="button ${navigator.share ? 'secondary' : 'primary'}" data-action="copy">${icon('copy', 17)} Skopiuj</button></div>
      <div id="copy-feedback" role="status"></div>
      <p class="privacy-note">${icon('lock', 16)} Wysyłasz tylko ten tekst. Odbiorca nie widzi Twojego planu ani innych danych.</p>
    </section></div>`;
}
function situation(r) {
  const roleLabels = Object.fromEntries(Object.entries(GUIDE.roles).map(([k, v]) => [k, `${icon(v.icon, 19)} ${v.label}`]));
  return `${backLink(r)}${pageHeading('Twoje ustawienia', 'Moja sytuacja', 'Na tej podstawie Otula dobiera sprawy, terminy i formy w Karcie wsparcia. Zmiany zapisują się od razu.')}
    <a class="text-button" href="#powitanie">Wróć do ekranu powitalnego</a><form id="profile-form" class="settings">
      <fieldset><legend>Kto korzysta z przewodnika?</legend>${radios('role', roleLabels, role(), 'choice-tiles')}</fieldset>
      <fieldset><legend>Na jakim jesteś etapie?</legend>${radios('stage', { pregnancy: `${icon('sprout', 19)} Ciąża`, birth: `${icon('heart', 19)} Po narodzinach` }, state.stage, 'choice-tiles two')}</fieldset>
      <label class="field"><span id="date-label">${dateLabel()} <small>(opcjonalnie)</small></span><input id="date-input" name="date" type="date" min="1000-01-01" max="9999-12-31" value="${state.date}"></label>
      <label class="field"><span>Sytuacja zawodowa</span><select name="work">${options(GUIDE.work, state.work)}</select></label>
      <p class="privacy-note">${icon('lock', 16)} Wybory i postęp zapisują się tylko w tej przeglądarce.</p>
      <a class="button primary" href="#plan">Pokaż mój plan ${icon('arrow', 17)}</a>
    </form>`;
}
function about(r) {
  return `${backLink(r)}${pageHeading('Otula', 'O przewodniku', '')}<div class="prose">
    <p>Otula pomaga przyszłym i świeżo upieczonym rodzicom — mamom, tatom i ich bliskim — przygotować się do formalności w Polsce. Przy każdej sprawie znajdziesz odsyłacz do aktualnej instrukcji instytucji.</p>
    <p>To niezależny prototyp przygotowawczy do wyzwania ZUS na HackNation 2026. O przyznaniu świadczeń rozstrzyga właściwy organ. Lista spraw obejmuje wybrane sytuacje, a terminy są orientacyjne.</p>
    <p>Przegląd treści: ${GUIDE.reviewed}. Ilustracja: ImageGen. Projekt i kod powstały przy wsparciu narzędzi AI: Codex (OpenAI) i Claude (Anthropic). Kroje DM Sans i DM Serif Text są udostępnione na licencji SIL OFL.</p>
    <a class="button secondary" href="./Otula-prezentacja.pdf">Prezentacja dla jury (PDF)</a> <a class="button secondary" href="#dane">${icon('lock', 16)} Dane na urządzeniu</a></div>`;
}
function dataPage(r) {
  return `${backLink(r)}${pageHeading('Prywatność', 'Dane na urządzeniu', '')}<div class="prose">
    <p>Otula zapisuje w pamięci tej przeglądarki: rolę, etap, sytuację zawodową, opcjonalną datę porodu lub urodzenia, identyfikatory gotowych kroków oraz ustawienia Karty wsparcia (zwrot i podpis). Każdy, kto ma dostęp do tego profilu przeglądarki, może je zobaczyć.</p>
    <p>„Zapytaj AI” wysyła pytanie do serwera Otuli. Asystent automatycznie wyszukuje hasła w źródłach urzędowych i medycznych. Może przekazać treść pytania i fragmenty źródeł do OpenRouter. Pola profilu i notatki nie są dołączane. Pliki PDF i Word powstają na Twoim urządzeniu.</p>
    <p>Imiona lub pseudonimy dzieci, notatki i postęp są zapisane w tej przeglądarce. Usunięcie profilu obejmuje wszystkie dzieci. Karta wsparcia wysyła wyłącznie tekst, który widzisz. Po przejściu do usługi zewnętrznej obowiązują zasady jej operatora.</p>
    ${storageWarning ? '<p><b>Zapis w tej przeglądarce jest obecnie niedostępny.</b></p>' : ''}
    ${resetAsk ? `<div class="confirm-box" role="alertdialog" aria-labelledby="confirm-title"><strong id="confirm-title">Usunąć cały profil rodziny?</strong><p>Usuniesz wszystkie imiona, daty, notatki, wykonane kroki i ustawienia z tej przeglądarki. Tej czynności nie można cofnąć.</p>
      <div class="case-actions"><button class="button secondary" data-action="reset-cancel">Anuluj</button><button class="button primary" data-action="reset">Usuń dane</button></div></div>`
      : `<button class="button secondary" data-action="reset-ask">Usuń mój profil i dane wszystkich dzieci</button>`}</div>`;
}

/* ---------- render ---------- */
function render(focus = false) {
  const r = route();
  document.body.classList.toggle('arriving', (r.page === 'start' && !state.onboarded) || ['powitanie','dzieci','praca'].includes(r.page));
  frame(r);
  const pages = { termin:calendarEditor, formularze:formsPage, kalkulator:calculatorPage, 'e-uslugi':eUslugiPage, 'sprawdz-sprawe':sprawdzSprawePage, parametry:zusParametersPage, uprawnienia:zusGuidePage, narzedzia:toolsPage, slowniczek:glossaryPage, rodzina:childrenPage, raport:reportPage, poradnik:handbook, pomoc:helpPage, powitanie: arrival, dzieci: arrival, praca: arrival, start, plan: planPage, terminy: deadlinesPage, biblioteka: library, wsparcie: support, sytuacja: situation, 'o-przewodniku': about, dane: dataPage };
  main.innerHTML = r.page === 'sprawa' ? backLink(r) + casePage(r.id) : pages[r.page](r);
  if (['plan','terminy','sytuacja','wsparcie'].includes(r.page)) main.insertAdjacentHTML('afterbegin',childSwitch());
  if (r.page === 'biblioteka') main.insertAdjacentHTML('afterbegin','<div class="library-tools"><a href="#slowniczek">Słowniczek</a><a href="#pomoc">Zapytaj AI</a></div>');
  if (r.page === 'biblioteka') document.querySelector('#query').value = query;
  if (focus) main.querySelector('h1')?.focus({ preventScroll: true });
  window.syncAssistantLauncher?.(r,document.body.classList.contains('arriving'));
}
function refreshMessage() {
  const item = byId(supportId);
  const box = document.querySelector('#message-text');
  if (item && box) box.value = compose(item);
  const feedback = document.querySelector('#copy-feedback');
  if (feedback) feedback.textContent = '';
}
function messageText() { return document.querySelector('#message-text')?.value.trim() || ''; }
async function copyRequest() {
  const value = messageText();
  if (!value) return;
  let copied = false;
  try { await navigator.clipboard.writeText(value); copied = true; } catch {
    const field = document.querySelector('#message-text');
    field.select();
    try { copied = document.execCommand('copy'); } catch { /* Manual selection remains available. */ }
  }
  document.querySelector('#copy-feedback').textContent = copied ? 'Skopiowano. Wklej prośbę do wiadomości do wybranej osoby.' : 'Zaznacz tekst na karcie i wybierz „Kopiuj” w menu przeglądarki.';
}
async function shareRequest() {
  const value = messageText();
  if (!value) return;
  try { await navigator.share({ text: value }); } catch { /* The person closed the share sheet. */ }
}
function icsEscape(value) { return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n'); }
function icsDate(d) { return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; }
function fold(line) {
  const parts = [];
  while (line.length > 70) { parts.push(line.slice(0, 70)); line = ' ' + line.slice(70); }
  parts.push(line);
  return parts.join('\r\n');
}
function exportCalendar() { exportFamilyCalendar(); }

/* ---------- events ---------- */
document.addEventListener('click', event => {
  if (event.target.closest('.skip')) {
    event.preventDefault();
    main.focus();
    return;
  }
  const starter=event.target.closest('[data-question]');
  if(starter){const [id,q]=starterQuestions[Number(starter.dataset.question)],field=document.querySelector('#help-search');field.value=q;delete field.dataset.contextLocked;field.dataset.context=id;document.querySelector('#help-result').innerHTML=answerSearch(q,id);field.focus();return;}
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  switch (button.dataset.action) {
    case 'toggle-menu': setMobileMenu(mobileNavigation.hidden); break;
    case 'close-menu': setMobileMenu(false,true); break;
    case 'print-family': window.print(); break;
    case 'invite': inviteFamily(); break;
    case 'back': goBack(); break;
    case 'role': state.role=id; saved(''); location.hash='dzieci'; break;
    case 'add-setup-child': {
      if(!button.form.reportValidity())break;
      state.children.push(childRecord({stage:'birth'})); saved(''); render();
      const entry=main.querySelector('.setup-entry:last-of-type');
      entry.open=true; entry.querySelector('summary').focus(); break;
    }
    case 'remove-setup-child': {
      const index=Number(id);
      if(index<=0 || !state.children[index] || state.onboarded)break;
      state.children.splice(index,1);
      if(state.active>=index)state.active=Math.max(0,state.active-1);
      const child=state.children[state.active];
      Object.assign(state,{stage:child.stage,date:child.date,done:child.done.slice()});
      saved(''); render(); main.querySelector('[data-action=add-setup-child]').focus(); break;
    }
    case 'onboard-work':
      state.work=id; state.onboarded=true; planFilter='all'; saved('Plan rodziny jest gotowy.'); location.hash='start'; break;
    case 'category': query = ''; category = id; location.hash = 'biblioteka'; break;
    case 'library-stage': libraryStage = id; render(); main.querySelector('[data-action="library-stage"].active').focus(); break;
    case 'filter-library': category = id; render(); main.querySelector('[data-action="filter-library"].active').focus(); break;
    case 'filter-plan': planFilter = id; render(); main.querySelector('[data-action="filter-plan"].active').focus(); break;
    case 'copy': copyRequest(); break;
    case 'share': shareRequest(); break;
    case 'sms': location.href = 'sms:?&body=' + encodeURIComponent(messageText()); break;
    case 'ics': exportCalendar(); break;
    case 'optional-plan': {
      if(!byId(id)?.optional)break;
      const child=state.children[state.active],added=!child.extras.includes(id);
      child.extras=added?[...child.extras,id]:child.extras.filter(k=>k!==id);
      saved(added?'Dodano sprawę do planu dziecka.':'Usunięto sprawę z planu dziecka.');render();break;
    }
    case 'toggle': {
      if (!byId(id)) break;
      const done = state.done.includes(id);
      state.done = done ? state.done.filter(key => key !== id) : [...state.done, id];
      render();
      main.querySelector('[data-action="toggle"]')?.focus();
      saved(done ? 'Krok ponownie do zrobienia.' : 'Brawo! Krok oznaczony jako gotowy.');
      break;
    }
    case 'reset-ask': resetAsk = true; render(); main.querySelector('[data-action="reset-cancel"]')?.focus(); break;
    case 'reset-cancel': resetAsk = false; render(); main.querySelector('[data-action="reset-ask"]')?.focus(); break;
    case 'reset':
      try { localStorage.removeItem(storageKey); sessionStorage.removeItem(trailKey); trail=[]; position=0; } catch { announce('Przeglądarka nie pozwala usunąć zapisu. Sprawdź ustawienia pamięci witryny.'); break; }
      state = newState(); calendarMonth='';calendarDay='';calendarDraftCase='';calendarDelete=''; zusResetDrafts(); zusDemo=''; zusRules=structuredClone(ZUS_DEFAULT_RULES); resetAsk = false; supportId = ''; query = ''; category = 'all'; planFilter = 'all';
      location.hash = 'start'; render(true); announce('Usunięto zapisane dane.'); break;
  }
});
main.addEventListener('invalid',event=>{
  const entry=event.target.closest('.setup-entry');
  if(entry)entry.open=true;
},true);
document.addEventListener('change', event => {
  const t = event.target;
  if(t.dataset.childField){updateSetupChild(t);return;}
  if(t.id==='active-child'){chooseChild(Number(t.value));return;}
  if(t.name==='childstage'){main.querySelector('#new-date-label').textContent=t.value==='birth'?'Data urodzenia':'Przewidywany termin porodu';return;}
  if(t.id==='daily-category'){
    main.querySelectorAll('[data-tip-category]').forEach(card=>{card.hidden=t.value!=='all' && card.dataset.tipCategory!==t.value;});
    return;
  }
  if(t.dataset.tip){const c=state.children[state.active];c.checks=c.checks.filter(k=>k!==t.dataset.tip);if(t.checked)c.checks.push(t.dataset.tip);saved('');return;}
  if (t.id === 'support-select') {
    supportId = t.value;
    history.replaceState(history.state, '', '#wsparcie/' + supportId);
    trail[position] = location.hash;
    render(); main.querySelector('#support-select').focus(); return;
  }
  if (t.name === 'sender' || t.name === 'to') { state.support[t.name] = t.value; refreshMessage(); saved(''); return; }
  if (t.id === 'payer') {
    const choice = byId(t.dataset.id).choice;
    document.querySelector('#choice-hint').textContent = choice.options.find(o => o.id === t.value)?.text || choice.initial;
    return;
  }
  if (t.id === 'date-input') {
    if (t.validity.badInput || (t.value && !parseDate(t.value))) return;
    state.date = t.value;
    saved(state.date ? 'Zapisano datę. Terminy zostały przeliczone.' : '');
    if (route().page === 'terminy') {
      // Preserve the native editor and its active date segment while typing.
      const fresh = document.createElement('template');
      fresh.innerHTML = deadlinesPage();
      const panel = main.querySelector('.date-panel');
      panel.querySelector('[data-action="ics"]')?.remove();
      const download = fresh.content.querySelector('[data-action="ics"]');
      if (download) panel.append(download);
      while (panel.nextElementSibling) panel.nextElementSibling.remove();
      const newPanel = fresh.content.querySelector('.date-panel');
      while (newPanel.nextElementSibling) panel.after(fresh.content.lastElementChild);
    }
    return;
  }
  if (t.form && t.form.id === 'profile-form') {
    if (t.name === 'role') { state.role = t.value; state.onboarded = true; }
    if (t.name === 'stage') { if (state.stage !== t.value) { state.date = ''; main.querySelector('#date-input').value = ''; } state.stage = t.value; state.onboarded = true; planFilter = 'all'; document.querySelector('#date-label').innerHTML = `${dateLabel()} <small>(opcjonalnie)</small>`; }
    if (t.name === 'work') state.work = t.value;
    frame(route());
    saved('Zapisano.');
  }
});
document.addEventListener('input', event => {
  const t = event.target;
  if(t.dataset.childField==='name'){updateSetupChild(t);return;}
  if(t.id==='handbook-search' || t.id==='handbook-section'){document.querySelector('#handbook-contents').innerHTML=handbookContents(document.querySelector('#handbook-search').value,document.querySelector('#handbook-section').value);return;}
  if(t.id==='glossary-search'){document.querySelector('#glossary-results').innerHTML=glossaryResults(t.value);return;}
  if(t.id==='help-search'){if(t.dataset.contextLocked!=='true')delete t.dataset.context;document.querySelector('#help-result').innerHTML=t.value.trim()?answerSearch(t.value,t.dataset.context):'';return;}
  if(t.id==='child-note'){state.children[state.active].note=t.value;saved('');return;}
  if (t.id === 'query') { query = t.value; document.querySelector('#results').innerHTML = libraryResults(); }
  if (t.id === 'greeting' || t.id === 'sign') { state.support[t.id] = t.value.slice(0, 40); refreshMessage(); saved(''); }
});
document.addEventListener('submit', event => {
  event.preventDefault();
  const f=event.target;
  if(f.id==='setup-family'){if(f.reportValidity()){state.children.forEach(c=>{c.name=c.name.trim();});saved('');location.hash='praca';}return;}
  if(f.id!=='child-add' && f.id!=='child-edit')return;
  const data=new FormData(f), name=String(data.get('childname')||'').trim(), multiple=data.has('multiple');
  if(f.id==='child-add'){
    state.children.push(childRecord({name, multiple, stage:data.get('childstage'), date:data.get('childdate')}));
    chooseChild(state.children.length-1);
  }else{Object.assign(state.children[state.active],{name,multiple});saved('');render();}
  announce('Zapisano profil dziecka.');
});
window.addEventListener('storage', event => {
  if (event.key !== null && event.key !== storageKey) return;
  state = loadState(); render();
});
window.addEventListener('hashchange', () => {
  trackRoute(); resetAsk = false;
  render(true); window.scrollTo(0, 0);
});
trackRoute();
render();
