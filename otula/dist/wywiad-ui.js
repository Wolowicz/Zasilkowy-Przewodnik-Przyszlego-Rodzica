'use strict';
/* Pytania i uprawnienia pochodzą wyłącznie z OtulaWywiadReguly.
   Żadnego wysyłania odpowiedzi, danych formularza ani dokumentów do AI. */
(function (root) {
  const STORAGE_KEY = 'otula-plan-v1';
  const PREFIX = '#moja-sprawa';
  const LOGIN = 'https://www.zus.pl/ezus/logowanie?jezyk=pl';
  const GROUPS = [['rodzina', 'Twoja rodzina'], ['ubezpieczenie', 'Ubezpieczenie'], ['okresy', 'Czas opieki'], ['kwota', 'Kwota']];
  const state = { answers: {}, statuses: {}, letter: {}, loaded: false, saved: false, container: null, defaults: null, message: '', focus: false, lastHash: null, search: '' };
  const model = () => root.OtulaWywiadModel;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const engine = () => root.OtulaWywiadReguly;
  const cleanScalar = value => (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && value.length <= 120);
  const safeUrl = value => {
    try { const u = new URL(value); return u.protocol === 'https:' && (u.hostname === 'zus.pl' || u.hostname.endsWith('.zus.pl') || u.hostname === 'gov.pl' || u.hostname.endsWith('.gov.pl')) ? u.href : ''; } catch (_) { return ''; }
  };
  const link = (url, title, cls = 'text-button') => safeUrl(url) ? `<a class="${cls}" href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(title)} <span aria-hidden="true">↗</span></a>` : '';
  function questionList(answers = state.answers) {
    const list = engine().questions(answers) || [];
    if (!answers.situation) return list;
    return list.filter(q => q.id !== 'role' && (q.id !== 'event' || ['loss','adoption-foster'].includes(answers.situation))).map(q => q.id === 'event' ? { ...q, options:q.options.filter(o => (answers.situation === 'loss' ? ['loss','childDeath'] : ['adoption','foster']).includes(o.value)) } : q);
  }
  function prune(answers) {
    let data = model().cleanAnswers(answers);
    if (typeof engine().prune === 'function') data = engine().prune(data);
    // Only keys from reachable questions are retained, never identifying PDF fields.
    const allowed = new Set(engine().questions(data).map(q => q.id).concat(['situation','extraSituations']));
    return Object.fromEntries(Object.entries(data).filter(([key]) => allowed.has(key)));
  }
  function load() {
    if (state.loaded) return;
    state.loaded = true;
    try {
      const item = model().read(root.localStorage, prune);
      state.answers = item.answers; state.statuses = item.statuses; state.letter = item.letter; state.saved = item.consent;
      if (item.migrated) model().write(root.localStorage, item, prune);
    } catch (_) { state.message = 'Zapis na urządzeniu jest niedostępny; możesz korzystać z wywiadu bez zapisywania.'; }
  }
  function save() {
    try {
      const data = model().write(root.localStorage, { answers:state.answers, statuses:state.statuses, letter:state.letter, consent:true }, prune);
      root.dispatchEvent(new CustomEvent('otula-profile-updated', { detail:{wywiad:data} }));
      state.saved = true; state.message = 'Odpowiedzi zapisane na tym urządzeniu.';
    } catch (_) { state.message = 'Nie udało się zapisać odpowiedzi; nadal możesz dokończyć wywiad.'; }
  }
  function changed() {
    state.answers = prune(state.answers);
    if (state.saved) save();
  }
  function commitAnswer(id, answer) {
    const previous = state.answers[id];
    if (previous !== undefined && JSON.stringify(previous) !== JSON.stringify(answer) && ['role','behalf','event','work'].includes(id)) {
      state.statuses = {};
      state.message = 'Zmieniono sytuację; niepasujące odpowiedzi i statusy zostały wyczyszczone.';
    }
    state.answers = model().transition(state.answers, id, answer);
    changed();
  }
  function clear() {
    state.answers = {}; state.statuses = {}; state.letter = {}; state.saved = false; state.message = 'Odpowiedzi, statusy i dane pisma zostały usunięte.';
    try { model().clear(root.localStorage); root.dispatchEvent(new CustomEvent('otula-profile-updated', {detail:{wywiad:null}})); } catch (_) { state.message = 'Wyczyszczono bieżące odpowiedzi; zapis na urządzeniu usuń w ustawieniach danych przeglądarki.'; }
  }
  function route() {
    const h = root.location.hash;
    if (!h.startsWith(PREFIX)) return [];
    return h.slice(PREFIX.length).split('/').filter(Boolean).map(p => { try { return decodeURIComponent(p); } catch (_) { return ''; } });
  }
  function go(parts, replace = false) {
    const hash = PREFIX + (parts.length ? '/' + parts.map(encodeURIComponent).join('/') : '');
    state.focus = true;
    if (replace) { root.history.replaceState(root.history.state, '', hash); render(state.container); }
    else if (root.location.hash !== hash) root.location.hash = hash;
    else render(state.container);
  }
  function notice() { return `<p class="wywiad-message" role="status" aria-live="polite">${esc(state.message)}</p>`; }
  function storageControls() {
    return `<details class="wywiad-storage"><summary>Moje odpowiedzi</summary><p>${state.saved ? 'Wybrano zapis na tym urządzeniu; kolejne odpowiedzi aktualizują ten zapis.' : 'Odpowiedzi pozostają w otwartej aplikacji, dopóki nie wybierzesz zapisu na urządzeniu.'}</p><div class="case-actions">${!state.saved ? '<button type="button" class="button secondary" data-wywiad="save">Zapisz odpowiedzi na tym urządzeniu</button>' : ''}<button type="button" class="button secondary" data-wywiad="clear">Usuń odpowiedzi i zacznij od nowa</button></div></details>`;
  }
  function progress(q, questions) {
    const group = q.group || 'rodzina';
    const answered = questions.filter(item => state.answers[item.id] !== undefined).length;
    return `<nav class="wywiad-progress" aria-label="Etapy wywiadu">${GROUPS.map(([id, title], i) => `<span class="chip ${id === group ? 'rose' : ''}"${id === group ? ' aria-current="step"' : ''}>${i + 1}. ${title}</span>`).join('')}</nav><p class="wywiad-progress-note">${answered} ${answered === 1 ? 'odpowiedź' : 'odpowiedzi'} · pytania dopasowują się do Ciebie</p>`;
  }
  function answerLabel(q, value) {
    if (value === 'unknown') return 'Jeszcze nie wiem';
    if (value === undefined) return 'Do uzupełnienia';
    const option = (q.options || []).find(o => String(o.value) === String(value));
    if (option) return option.label;
    if (q.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('.');
    if (Array.isArray(value)) return value.length ? `${value.length} ${value.length === 1 ? 'wpis' : 'wpisów'} — otwórz, aby sprawdzić daty` : 'Brak wpisów';
    return String(value) + (q.unit ? ' ' + q.unit : '');
  }
  function symbol(name, size = 24) { return typeof root.icon === 'function' ? root.icon(name, size) : (typeof icon === 'function' ? icon(name, size) : ''); }
  function glossary(q) { return root.OtulaSlownik?.buttonFor(q) || ''; }
  function crumbs(current) { return `<nav class="wywiad-crumbs" aria-label="Ścieżka"><a href="${PREFIX}">Sytuacje</a><span aria-hidden="true">/</span><span aria-current="page">${esc(current)}</span></nav>`; }
  function nextQuestion() { return questionList().find(q => state.answers[q.id] === undefined); }
  function renderLanding(additional = false) {
    const role = state.answers.role || state.defaults?.role;
    if (!state.answers.role && role) state.answers.role = role;
    const primary = model().situations.find(s => s.id === state.answers.situation);
    const roles = [['mother','Mama','heart','rose'],['father','Tata','person','gold'],['guardian','Opiekun','family','sage'],['supporter','Pomagam komuś','flower','peach']];
    state.container.innerHTML = `<section class="wywiad-page wywiad-dashboard">${additional ? `${crumbs('Dodatkowa sytuacja')}<a class="back-link text-button" href="${PREFIX}">← Wróć do: sytuacje</a>` : ''}${additional ? `<header class="page-intro"><h1 id="wywiad-title" tabindex="-1">Co jeszcze Was dotyczy?</h1></header>` : `<header class="otula-hello"><span class="tile-icon rose">${symbol('flower',26)}</span><div><h1 id="wywiad-title" tabindex="-1">Co się u Was dzieje?</h1><p>Wybierz sytuację — Otula dobierze świadczenia, policzy kwoty i przygotuje dokumenty.</p></div><a class="button secondary otula-demo" href="#kalkulator">${symbol('sun',18)} Pokaż przykład dla jury</a></header>`}<div class="wywiad-role"><span>${role ? 'Sprawdzamy dla:' : 'Dla kogo sprawdzamy wsparcie?'}</span><div class="filters">${roles.map(([id,label,ico,color])=>`<button type="button" class="filter ${role===id?'active':''}" aria-pressed="${role===id}" data-role="${id}">${symbol(ico,18)} ${label}</button>`).join('')}</div></div>${primary ? `<div class="wywiad-current"><p><strong>Główna sytuacja:</strong> ${esc(model().title(primary,role))}</p>${(state.answers.extraSituations||[]).map(id=>{const extra=model().situations.find(s=>s.id===id);return `<span class="chip rose">${esc(extra?model().title(extra,role):id)}</span>`;}).join('')}<div class="case-actions"><button type="button" class="button primary" data-wywiad="continue-case">${nextQuestion()?'Kontynuuj odpowiedzi':'Pokaż moje świadczenia'}</button><button type="button" class="button secondary" data-wywiad="results">Zobacz, co już wiadomo</button></div></div>` : ''}<label class="search-box wywiad-search">${symbol('search',22)}<span class="sr-only">Wyszukaj sytuację lub sprawę</span><input id="wywiad-search" type="search" placeholder="np. poronienie, dług składkowy, wezwanie z ZUS" value="${esc(state.search)}" autocomplete="off"></label><div id="wywiad-search-results"></div><div id="wywiad-conflict" role="status"></div>${primary&&!additional?`<a class="text-button" href="${PREFIX}/dodaj">Dodaj drugą sytuację</a>`:''}${notice()}${storageControls()}</section>`;
    const drawTiles = () => {
      const list = role ? model().tiles(role,state.search,additional).filter(s=>!additional||s.id!==state.answers.situation) : [];
      const catalog = typeof GUIDE !== 'undefined' ? GUIDE.cases : [];
      const library = model().library(state.search,catalog);
      const region = state.container.querySelector('#wywiad-search-results');
      region.innerHTML = `${!role?'<p class="zus-notice">Wybierz rolę powyżej, aby zobaczyć pasujące sytuacje.</p>':`<div class="wywiad-tiles">${list.map(s=>`<button type="button" class="wywiad-tile catalog-card ${s.color}" data-situation="${s.id}"><span class="tile-icon ${s.color}">${symbol(s.icon,26)}</span><span>${esc(model().title(s,role))}</span><span aria-hidden="true">→</span></button>`).join('')}</div>${!list.length?'<p class="zus-notice">Nie ma takiej sytuacji w tej grupie; spróbuj krótszego hasła.</p>':''}`}${library.length?`<section class="wywiad-library"><h2>W Bibliotece spraw</h2><div class="case-list">${library.map(c=>`<a class="case-row" href="#sprawa/${encodeURIComponent(c.id)}"><span class="tile-icon ${esc(c.color||'rose')}">${symbol(c.icon||'files',22)}</span><span class="case-copy"><strong>${esc(c.title||c.name)}</strong></span><span aria-hidden="true">→</span></a>`).join('')}</div></section>`:''}`;
      region.querySelectorAll('[data-situation]').forEach(button=>button.onclick=()=>chooseSituation(button.dataset.situation,additional));
    };
    state.container.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{commitAnswer('role',b.dataset.role);state.search='';renderLanding(additional);});
    state.container.querySelector('#wywiad-search').addEventListener('input',e=>{state.search=e.target.value;drawTiles();});
    drawTiles();
    bind({ 'continue-case':()=>{if(state.answers.situation==='zus-letter'&&!state.answers.event)return go(['pismo','kind']);const q=nextQuestion();go(q?['pytanie',q.id]:['wynik']);},results:()=>go(['wynik']) });
  }
  function chooseSituation(id, additional=false, confirm=false) {
    const selection=model().choose(state.answers,id,additional&&!confirm);
    if(selection.conflict){state.container.querySelector('#wywiad-conflict').innerHTML=`<div class="zus-notice"><p>Ta sytuacja dotyczy innego zdarzenia; możesz rozpocząć dla niej nowy przebieg zamiast obecnej głównej sytuacji.</p><button type="button" class="button secondary" id="wywiad-confirm-situation">Zmień główną sytuację i odpowiedzi</button></div>`;state.container.querySelector('#wywiad-confirm-situation').onclick=()=>chooseSituation(id,false,true);return;}
    if(!additional&&state.answers.situation!==id)state.statuses={};
    state.answers=selection.answers;state.search='';changed();
    if(id==='zus-letter')return go(['pismo','kind']);
    const q=['loss','adoption-foster'].includes(id)?questionList().find(q=>q.id==='event'):nextQuestion();
    go(q?['pytanie',q.id]:['wynik']);
  }
  function mountRecords(container,q,value) {
    let rows=Array.isArray(value)?value.map(row=>({...row})):[];
    const read = (strict=false) => {
      if(strict&&!rows.length)return null;
      const next=[];
      for(const row of container.querySelectorAll('[data-record-row]')){
        const data={};
        for(const f of q.fields||[]){const el=row.querySelector(`[data-record-field="${f.id}"]`);if(el.disabled)continue;if(strict&&(!el.checkValidity()||(!f.optional&&!el.value))){el.focus();return null;}if(el.value)data[f.id]=f.type==='number'?Number(el.value):el.value;}
        next.push(data);
      }
      return next;
    };
    const draw=()=>{
      container.innerHTML=`<div class="wywiad-record-list">${rows.map((row,i)=>`<fieldset class="wywiad-record" data-record-row="${i}"><legend>${esc(q.recordLabel||q.unitLabel||'Wpis')} ${i+1}</legend><div class="wywiad-record-fields">${(q.fields||[]).map(f=>`<label class="field"><span>${esc(f.title||f.label||f.id)}</span>${f.type==='choice'?`<select data-record-field="${esc(f.id)}" ${f.optional?'':'required'}><option value="">Wybierz</option>${(f.options||[]).map(o=>`<option value="${esc(o.value)}"${String(row[f.id])===String(o.value)?' selected':''}>${esc(o.label)}</option>`).join('')}</select>`:`<input data-record-field="${esc(f.id)}" type="${f.type==='date'?'date':'number'}" value="${esc(row[f.id]??'')}" ${f.optional?'':'required'}${f.min!==undefined?` min="${esc(f.min)}"`:''}${f.max!==undefined?` max="${esc(f.max)}"`:''}${f.type==='number'?` step="${esc(f.step||'any')}" inputmode="decimal"`:''} autocomplete="off">`}</label>`).join('')}</div><button class="text-button" type="button" data-record-remove="${i}">Usuń wpis ${i+1}</button></fieldset>`).join('')}</div><button class="button secondary" type="button" data-record-add${rows.length>=(q.maxItems||100)?' disabled':''}>+ ${esc(q.addLabel||'Dodaj kolejny wpis')}</button>${rows.length?'<p class="wywiad-help">Sprawdź wszystkie odcinki — nie pomijaj wcześniejszych części ani przeniesień.</p>':'<p class="wywiad-help">Dodaj pierwszy wpis albo pomiń pytanie, jeśli nie masz jeszcze pełnych danych.</p>'}`;
      container.querySelector('[data-record-add]').onclick=()=>{rows=read()||rows;rows.push({});draw();container.querySelector('[data-record-row]:last-child input, [data-record-row]:last-child select')?.focus();};
      container.querySelectorAll('[data-record-remove]').forEach(b=>b.onclick=()=>{rows=read()||rows;rows.splice(Number(b.dataset.recordRemove),1);draw();container.querySelector('[data-record-add]').focus();});
      const syncConditions=()=>{for(const row of container.querySelectorAll('[data-record-row]'))for(const f of q.fields||[]){const cond=f.visibleWhen||(f.id==='deathDate'?{field:'alive',value:'no'}:null);if(!cond)continue;const control=row.querySelector(`[data-record-field="${f.id}"]`),dependent=row.querySelector(`[data-record-field="${cond.field}"]`);const show=dependent?.value===cond.value;control.closest('label').hidden=!show;control.disabled=!show;if(!show)control.value='';}};
      container.onchange=syncConditions;syncConditions();
    };
    draw();return{read};
  }
  function plain(q) { return root.OtulaProsto ? root.OtulaProsto.get(q) : { title: q.title || q.label, help: q.help || q.hint || '', co: '', gdzie: '', nie: '' }; }
  function renderQuestion(q, questions) {
    const position = questions.findIndex(item => item.id === q.id);
    const value = state.answers[q.id];
    const choices = q.type === 'choice';
    const records = q.type === 'records';
    const options = (q.options || []).filter(option => option.value !== 'unknown');
    const picks = !choices && !records && root.OtulaProsto ? root.OtulaProsto.picks(q.id) : null;
    const pq = plain(q);
    const total = questions.length;
    const answeredCount = questions.filter(item => state.answers[item.id] !== undefined).length;
    const next = questions[position + 1];
    const canForward = value !== undefined && !!next;
    const mark = active => `<span class="wywiad-choice-mark" aria-hidden="true">${active ? '✓' : ''}</span>`;
    const same = v => String(value) === String(v);
    const pickButtons = picks ? `<div class="wywiad-choices wywiad-picks" role="group" aria-label="Szybki wybór">${picks.map(v => `<button type="button" class="filter wywiad-choice${same(v) ? ' active' : ''}" aria-pressed="${same(v)}" data-pick="${v}"><span>${v}</span>${mark(same(v))}</button>`).join('')}</div>` : '';
    const field = `<label class="field wywiad-input" for="wywiad-value"><span>${picks ? 'Albo wpisz inną liczbę' : esc(q.inputLabel || (q.type === 'date' ? 'Wybierz datę' : 'Wpisz liczbę'))}${q.unit ? ` (${esc(q.unit)})` : ''}</span><input id="wywiad-value" name="answer" type="${q.type === 'date' ? 'date' : 'number'}" value="${value === 'unknown' || value === undefined ? '' : esc(value)}"${q.min !== undefined ? ` min="${esc(q.min)}"` : ''}${q.max !== undefined ? ` max="${esc(q.max)}"` : ''}${q.type !== 'date' ? ` step="${esc(q.step || 'any')}" inputmode="decimal"` : ''} aria-describedby="wywiad-help wywiad-error" autocomplete="off" required></label>`;
    const sub = v => root.OtulaProsto && root.OtulaProsto.sub ? root.OtulaProsto.sub(q.id, v) : '';
    const input = records ? '<div id="wywiad-records"></div>'
      : choices ? `<div class="wywiad-choices" role="group" aria-labelledby="wywiad-title">${options.map((option, i) => `<button type="button" class="filter wywiad-choice${same(option.value) ? ' active' : ''}" aria-pressed="${same(option.value)}" data-option="${i}"><span class="wywiad-dot" aria-hidden="true"></span><span class="wywiad-choice-text"><b>${esc(option.label)}</b>${sub(option.value) ? `<small>${esc(sub(option.value))}</small>` : ''}</span>${mark(same(option.value))}</button>`).join('')}</div>`
      : pickButtons + field;
    const canImport = position === 0 && state.defaults && Object.keys(state.answers).length === 0;
    const groupTitle = (GROUPS.find(([id]) => id === (q.group || 'rodzina')) || GROUPS[0])[1];
    const why = pq.co ? `<details class="wywiad-why"><summary><span class="wywiad-why-icon" aria-hidden="true">?</span><span><b>Nie wiem, co to oznacza?</b><small>Dotknij, aby zobaczyć wyjaśnienie</small></span></summary><p>${esc(pq.co)}</p>${pq.gdzie ? `<p><strong>Gdzie to sprawdzić:</strong> ${esc(pq.gdzie)}</p>` : ''}</details>` : '';
    const pct = Math.round(100 * Math.max(position, 0) / Math.max(total, 1));
    state.container.innerHTML = `<section class="zus-page wywiad-page">
      <div class="wywiad-stepper"><button type="button" class="button secondary wywiad-nav-btn" data-wywiad="back"><span aria-hidden="true">←</span> ${position > 0 ? 'Poprzednie' : 'Sytuacje'}</button><div class="wywiad-progressbar" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${position + 1}" aria-label="Pytanie ${position + 1} z ${total}"><span><b>Krok ${position + 1} z ${total}</b><em>${esc(groupTitle)}</em></span><i style="width:${pct}%"></i></div><button type="button" class="button secondary wywiad-nav-btn" data-wywiad="forward"${canForward ? '' : ' disabled'}>Następne <span aria-hidden="true">→</span></button></div>
      <form class="zus-result wywiad-question" novalidate><span class="wywiad-topic"><i aria-hidden="true"></i>${esc(groupTitle)}</span><h1 id="wywiad-title" tabindex="-1">${esc(pq.title)}</h1>${pq.help ? `<p id="wywiad-help" class="wywiad-help">${esc(pq.help)}</p>` : '<p id="wywiad-help" class="sr-only"></p>'}${why}${glossary(q)}${input}<p id="wywiad-error" class="wywiad-error" role="alert"></p>${value === 'unknown' ? '<p class="wywiad-help wywiad-skipped">Na razie pominięte — możesz odpowiedzieć teraz.</p>' : ''}<div id="wywiad-unknown" hidden></div><div class="wywiad-actions">${choices ? '' : '<button type="submit" class="button primary">Dalej <span aria-hidden="true">→</span></button>'}<button type="button" class="button secondary" data-wywiad="skip">Nie wiem</button></div>${choices ? '<p class="wywiad-help wywiad-auto">Po wybraniu odpowiedzi przejdziemy dalej automatycznie.</p>' : ''}</form>
      ${canImport ? '<div class="zus-notice"><p>Masz już zapisaną rolę i sytuację rodziny w Otuli.</p><button type="button" class="text-button" data-wywiad="import">Użyj tych odpowiedzi</button></div>' : ''}
      <div class="wywiad-foot"><span>${answeredCount} z ${total} odpowiedzi</span><button type="button" class="text-button" data-wywiad="results">Pokaż, co już wiadomo →</button></div>${notice()}${storageControls()}</section>`;
    let selected = value;
    const recordEditor = records ? mountRecords(state.container.querySelector('#wywiad-records'), q, value) : null;
    const advance = answer => {
      commitAnswer(q.id, answer);
      const nextQuestions = questionList();
      const nextPos = nextQuestions.findIndex(item => item.id === q.id) + 1;
      const following = nextQuestions[nextPos];
      go(following ? ['pytanie', following.id] : ['wynik']);
    };
    const markActive = (attr, button) => state.container.querySelectorAll(`[${attr}]`).forEach(b => {
      const active = b === button; b.setAttribute('aria-pressed', String(active)); b.classList.toggle('active', active); b.querySelector('.wywiad-choice-mark').textContent = active ? '✓' : '';
    });
    let moving = false;
    const later = fn => { if (moving) return; moving = true; setTimeout(fn, 280); };
    state.container.querySelectorAll('[data-option]').forEach(button => button.addEventListener('click', () => {
      selected = options[Number(button.dataset.option)].value;
      markActive('data-option', button);
      state.container.querySelector('#wywiad-error').textContent = '';
      later(() => advance(selected));
    }));
    state.container.querySelectorAll('[data-pick]').forEach(button => button.addEventListener('click', () => {
      markActive('data-pick', button);
      later(() => advance(Number(button.dataset.pick)));
    }));
    state.container.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      const error = state.container.querySelector('#wywiad-error');
      if (records) {
        const data = recordEditor.read(true);
        if (!data) { error.textContent = 'Uzupełnij każdy wpis albo wybierz „Nie wiem”.'; return; }
        advance(data);
      } else if (choices) {
        if (selected === undefined || selected === 'unknown') { error.textContent = 'Wybierz odpowiedź albo „Nie wiem”.'; return; }
        advance(selected);
      } else {
        const el = state.container.querySelector('#wywiad-value');
        if (!el.value || !el.checkValidity()) { error.textContent = q.type === 'date' ? 'Wybierz pełną datę albo kliknij „Nie wiem”.' : 'Sprawdź wpisaną liczbę albo kliknij „Nie wiem”.'; el.focus(); return; }
        advance(q.type === 'date' ? el.value : Number(el.value));
      }
    });
    const showUnknown = () => {
      const box = state.container.querySelector('#wywiad-unknown');
      box.hidden = false;
      box.innerHTML = `<div class="wywiad-unknown-card"><h2 tabindex="-1">Nie szkodzi — wiele osób tego nie wie</h2>${pq.co ? `<p><strong>Co to znaczy:</strong> ${esc(pq.co)}</p>` : ''}${pq.gdzie ? `<p><strong>Gdzie to sprawdzić:</strong> ${esc(pq.gdzie)}</p>` : ''}${pq.nie ? `<p><strong>Jeśli pominiesz:</strong> ${esc(pq.nie)}</p>` : ''}<div class="case-actions"><button type="button" class="button primary" data-wywiad="skip-confirm">Pomiń i wróć do tego później</button><button type="button" class="button secondary" data-wywiad="skip-cancel">Odpowiem teraz</button></div></div>`;
      box.querySelectorAll('[data-wywiad]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.wywiad === 'skip-confirm') advance('unknown');
        else { box.hidden = true; state.container.querySelector('[data-option],[data-pick],#wywiad-value')?.focus(); }
      }));
      box.querySelector('h2').focus();
    };
    bind({ back: () => go(position > 0 ? ['pytanie', questions[position - 1].id] : []), forward: () => { if (canForward) go(['pytanie', next.id]); }, skip: showUnknown, results: () => {
      if (choices && selected !== undefined) commitAnswer(q.id, selected);
      if (records) { const data = recordEditor.read(true); if (data) commitAnswer(q.id, data); else { state.container.querySelector('#wywiad-error').textContent = 'Sprawdź wpisy przed pokazaniem wyniku albo kliknij „Nie wiem”.'; return; } }
      if (!choices && !records) {
        const el = state.container.querySelector('#wywiad-value');
        if (el.value && el.checkValidity()) commitAnswer(q.id, q.type === 'date' ? el.value : Number(el.value));
        else if (state.answers[q.id] === undefined) { delete state.answers[q.id]; changed(); }
      }
      go(['wynik']);
    } });
  }
  function statusLabel(status) {
    const labels = { eligible: 'Warunki wskazują na świadczenie', possible: 'Możliwe świadczenie', conditional: 'Sprawdź warunki', missing: 'Uzupełnij informacje', review: 'Do potwierdzenia', unknown: 'Do ustalenia', blocked: 'Najpierw wyjaśnij', notEligible: 'Warunki nie są spełnione', ineligible: 'Warunki nie są spełnione', needs_data: 'Uzupełnij informacje', needs_review: 'Do potwierdzenia' };
    return labels[status] || status || 'Do sprawdzenia';
  }
  function display(value) {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'object') return value.text || value.label || value.summary || (value.from && value.to ? `${value.from} – ${value.to}` : '');
    return String(value);
  }
  function canPrepare(doc, result) {
    const code = String(doc.code || '').toUpperCase();
    return !result.planned && !result.pdfContext?.planned && (['ZAM', 'ZAS-53'].includes(code) && /rodzic|opiekun|ubezpieczon|wnioskodawc|\bTy\b/i.test(doc.owner || '') || /^LEAVE-(MATERNITY|PARENTAL|PATERNITY|CHILDCARE|LOSS)$/.test(code));
  }
  const money = value => new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(value);
  function resultCard(result, i) {
    const docs = Array.isArray(result.documents) ? result.documents : [];
    const missing = Array.isArray(result.missing) ? result.missing : [];
    const blockers = result.blockers || missing.map(text=>({kind:'missing',text}));
    const check = result.check || {state:missing.length?'missing':'info',label:statusLabel(result.status),disclaimer:'To wskazówka, nie decyzja ZUS'};
    const color = check.state==='ok'?'sage':check.state==='risk'?'rose':'gold';
    const primary = docs.findIndex(d=>canPrepare(d,result));
    const amount = result.estimate ? `${money(result.estimate.daily)} za dzień${Number.isFinite(result.estimate.total)?` · razem ${money(result.estimate.total)}`:''}` : display(result.amount)||'Brakuje potwierdzonej podstawy od płatnika.';
    const toEmployer = state.answers.work==='employee' && (result.id==='childcare'||(state.answers.employmentEnded!=='yes'&&state.answers.payerSize!=='upTo20'));
    const otherPerson = result.parent && result.parent!==(state.answers.role==='supporter'?state.answers.behalf:state.answers.role);
    const online = ['municipal','za-zyciem-payment'].includes(result.id)?'https://empatia.gov.pl/':primary>=0&&!toEmployer&&!otherPerson?LOGIN:result.url;
    const onlineLabel = ['municipal','za-zyciem-payment'].includes(result.id)?'Złóż online':toEmployer?(state.answers.payerSize==='over20'||result.id==='childcare'?'Jak przekazać do kadr':'Ustal odbiorcę wniosku'):otherPerson?'Ustal odbiorcę drugiego rodzica':primary>=0?'Złóż online':'Sprawdź dalszy krok';
    const ownStatus = state.statuses[result.id];
    return `<article class="zus-result wywiad-benefit" aria-labelledby="benefit-${i}"><div class="wywiad-card-heading"><div class="wywiad-result-title"><span class="tile-icon ${['loss','transfer'].includes(result.id)?'rose':'peach'}">${symbol(result.id==='loss'?'heart':'wallet',26)}</span><h2 id="benefit-${i}">${esc(result.title)}</h2></div><span class="chip ${color}">${esc(check.label)}</span></div><p>${esc(display(result.why||result.summary))}</p>${glossary(result.id)}<dl class="wywiad-facts"><div><dt>Co i za jaki okres</dt><dd>${esc(display(result.period)||'Okres wymaga uzupełnienia dat.')}</dd></div><div><dt>Ile — brutto, bez PIT</dt><dd>${esc(amount)}</dd></div></dl>${result.recipient?`<p class="wywiad-help"><strong>Adresat:</strong> ${esc(result.recipient)}</p>`:''}<div class="wywiad-check ${color}"><strong>${esc(check.label)}</strong>${blockers.length?`<ul>${blockers.slice(0,4).map(b=>`<li><b>${b.kind==='risk'?'Ryzyko':b.kind==='document'?'Dokument':'Do ustalenia'}:</b> ${esc(b.text)}</li>`).join('')}</ul>`:'<p>Podane odpowiedzi nie wskazują brakujących warunków w sprawdzanym zakresie.</p>'}<p>${esc(check.disclaimer||'To wskazówka, nie decyzja ZUS')}</p></div>${blockers.length>4?`<details><summary>Pozostałe informacje do sprawdzenia (${blockers.length-4})</summary><ul>${blockers.slice(4).map(b=>`<li>${esc(b.text)}</li>`).join('')}</ul></details>`:''}${docs.length?`<details><summary>Kto co przygotowuje (${docs.length})</summary><ul class="wywiad-documents">${docs.map((doc,j)=>`<li><span class="chip rose">${esc(doc.owner||'Do ustalenia')}</span><strong>${esc(doc.text||doc.label||doc.code||'Dokument')}</strong><div class="case-actions">${canPrepare(doc,result)?`<button class="button secondary" type="button" data-document="${i}:${j}">Uzupełnij ${doc.code.startsWith('LEAVE-')?'wniosek do pracodawcy':esc(doc.code)}</button>`:''}${link(doc.url,'Otwórz źródłowy formularz lub instrukcję')}</div></li>`).join('')}</ul></details>`:''}<div class="wywiad-result-actions">${primary>=0?`<button type="button" class="button primary" data-document="${i}:${primary}">Pobierz uzupełniony wniosek</button>`:''}${link(online,result.id==='krus'?'Przejdź do informacji KRUS':onlineLabel, 'button secondary')}</div>${state.answers.work==='employee'?'<p class="wywiad-help">Online w eZUS składasz sprawę o zasiłek; wniosek o urlop przekazujesz pracodawcy jego kanałem.</p>':''}${result.supportRequest?`<details><summary>Prośba z Karty wsparcia</summary><p class="wywiad-support-request">${esc(result.supportRequest)}</p><a class="text-button" href="#wsparcie">Dostosuj Kartę wsparcia</a></details>`:''}<details><summary>Źródła i szczegóły</summary>${result.gain?`<p>${esc(result.gain)}</p>`:''}${link(result.url,'Przeczytaj zasadę w źródle urzędowym')}</details><details class="wywiad-status"><summary><span data-status-label>Status sprawy · ${esc(ownStatus||'nie ustawiono')}</span></summary><p class="wywiad-help">Zmień go po wykonaniu kroku lub otrzymaniu pisma — komplet dokumentów nie potwierdza wypłaty.</p><div class="filters" role="group" aria-label="Status: ${esc(result.title)}">${model().statuses.map(value=>`<button type="button" class="filter${ownStatus===value?' active':''}" aria-pressed="${ownStatus===value}" data-case-status="${esc(result.id)}" data-status-value="${esc(value)}">${value}</button>`).join('')}</div></details></article>`;
  }
  function summaryMarkup(results) {
    const summary = engine().summarize ? engine().summarize(state.answers,results) : {total:null,byParent:{},missing:[],partial:true};
    const names={mother:'Mama',father:'Tata',guardian:'Opiekun',supporter:'Bliska osoba'};
    const periods=results.flatMap(r=>(r.pdfContext?.periods||[]).map(p=>({title:r.title,...p})));
    return `<aside class="wywiad-summary"><section class="zus-result"><h2>${summary.total!==null?(summary.partial?'Policzona część wsparcia':'Razem możesz otrzymać'):'Uzupełnijmy kwotę'}</h2>${summary.total!==null?`<strong class="wywiad-summary-total">ok. ${money(summary.total)}</strong>`:'<p>Brakuje danych do wspólnej kwoty.</p>'}<span class="chip gold">Orientacyjnie, brutto, bez PIT</span>${Object.entries(summary.byParent||{}).map(([parent,total])=>`<p><strong>${esc(names[parent]||'Ta osoba')}:</strong> ${money(total)}</p>`).join('')}${summary.partial?'<p class="wywiad-help">Nie dodajemy świadczeń bez ustalonych kwot ani nakładających się okresów.</p>':''}${summary.missing?.length?`<details><summary>Brakuje: ${summary.missing.length} informacji</summary><ul>${summary.missing.slice(0,8).map(text=>`<li>${esc(text)}</li>`).join('')}</ul></details><button type="button" class="button secondary" data-wywiad="continue">Uzupełnij</button>`:''}${['birth','adoption','foster'].includes(state.answers.event)?'<a class="button secondary" href="#kalkulator/wywiad">Zobacz podział w kalkulatorze</a>':''}</section><section class="zus-result"><h2>Daty do zapamiętania</h2>${state.letter.deadline&&state.letter.deadline!=='unknown'?`<p><strong>Termin z pisma:</strong> ${esc(state.letter.deadline)}</p><a class="text-button" href="${PREFIX}/pismo/result">Pokaż pismo i przypomnienie</a>`:''}${periods.length?`<ul>${periods.map(p=>`<li><strong>${esc(p.title)}</strong><br>${esc(p.from)} – ${esc(p.to)}</li>`).join('')}</ul>`:'<p>Daty pojawią się po ustaleniu okresów lub terminu z pisma.</p>'}</section></aside>`;
  }
  function handoff(results) {
    const municipal = results.some(r => ['municipal', 'za-zyciem-payment'].includes(r.id));
    const krus = results.some(r => r.id === 'krus');
    const employment = ['employee', 'contract'].includes(state.answers.work);
    return `<section class="zus-result wywiad-handoff"><p class="small-label">Złożenie dokumentów</p><h2>Gdzie załatwić Twoją sprawę</h2><div class="zus-segments">${municipal ? `<section><h3>Świadczenie z gminy</h3><p>Złóż wniosek przez Emp@tię albo w gminie lub OPS właściwym dla miejsca zamieszkania.</p>${link('https://empatia.gov.pl/', 'Przejdź do Emp@tii', 'button secondary')}${link('https://www.gov.pl/web/gov/uzyskaj-swiadczenie-rodzicielskie', 'Sprawdź dokumenty i właściwy urząd')}</section>` : ''}${employment ? `<section><h3>${state.answers.work === 'employee' ? 'Urlop i dokumenty od pracodawcy' : 'Dokumenty od zleceniodawcy'}</h3><p>${state.answers.work === 'employee' ? 'Wniosek o urlop przekaż pracodawcy, a z kadrami ustal płatnika zasiłku i potrzebne zaświadczenie.' : 'Poproś zleceniodawcę o właściwe zaświadczenie płatnika do Twojej sprawy.'}</p><p class="wywiad-help">Skorzystaj z kanału przyjmowania dokumentów wskazanego przez płatnika.</p></section>` : ''}${krus ? `<section><h3>Sprawa w KRUS</h3><p>Dokumenty i sposób złożenia sprawdź w usłudze KRUS.</p>${link('https://www.gov.pl/web/krus/zasilek-macierzynski', 'Przejdź do informacji KRUS', 'button secondary')}</section>` : ''}<section><h3>Dokument kierowany do ZUS</h3><p>Jeśli adresatem Twojego wniosku jest ZUS, przejdź do eZUS i wybierz właściwy formularz.</p>${link(LOGIN, 'Przejdź do eZUS', 'button secondary')}<p class="wywiad-help">Przez login.gov.pl możesz użyć mObywatela, jeśli ta metoda jest dostępna.</p></section><section><h3>Dokument na papierze</h3><p>Przygotuj formularz przy świadczeniu, sprawdź go, wydrukuj i podpisz przed przekazaniem właściwemu adresatowi.</p><p class="wywiad-help">Zaświadczenia pracodawcy lub lekarza przygotowuje wskazana osoba.</p></section></div><p class="wywiad-help wywiad-handoff-note">Wniosek elektroniczny podpisujesz i wysyłasz w serwisie instytucji; Otula przygotowuje dokumenty, ale ich nie składa.</p></section>`;
  }
  function timeline(results) {
    const kinds = { maternity: ['Macierzyński', 'm'], supplementary: ['Uzupełniający', 'u'], parental: ['Rodzicielski', 'r'], paternity: ['Ojcowski', 'o'], loss: ['Po stracie', 'm'], adoption: ['Na warunkach macierzyńskiego', 'm'], sick: ['Chorobowe w ciąży', 'c'] };
    const segs = [];
    for (const r of results) {
      const text = typeof r.period === 'string' ? r.period : (r.period && r.period.text) || '';
      const days = Number((text.match(/\((\d+) dni\)/) || text.match(/(\d+) dni/) || [])[1]);
      const weeks = Number((text.match(/(\d+) tygodni/) || [])[1]);
      const len = days || (weeks ? weeks * 7 : 0);
      if (!len) continue;
      const key = Object.keys(kinds).find(k => String(r.id || '').toLowerCase().includes(k)) || (/ojcow/i.test(r.title) ? 'paternity' : /rodziciel/i.test(r.title) ? 'parental' : /uzupełn|hospitaliz/i.test(r.title) ? 'supplementary' : 'maternity');
      segs.push({ label: kinds[key][0], cls: kinds[key][1], len, who: r.parent === 'father' || key === 'paternity' ? 'Tata' : 'Mama', amount: r.estimate && Number.isFinite(r.estimate.total) ? money(r.estimate.total) : '' });
    }
    if (!segs.length) return '';
    const total = segs.reduce((s, x) => s + x.len, 0);
    return `<section class="zus-result otula-timeline"><div class="otula-timeline-head"><h2>Wasz plan urlopów</h2><span class="chip sage">${Math.round(total / 7)} tyg. łącznie</span></div><div class="otula-bar">${segs.map(s => `<span class="seg ${s.cls}" style="flex:${s.len}" title="${esc(s.label)}: ${Math.round(s.len / 7)} tyg."><b>${Math.round(s.len / 7)} tyg.</b> ${esc(s.label)}</span>`).join('')}</div><ul class="otula-legend">${segs.map(s => `<li><i class="${s.cls}"></i>${esc(s.who)} · ${esc(s.label)} · ${Math.round(s.len / 7)} tyg.${s.amount ? ` · <strong>${esc(s.amount)}</strong>` : ''}</li>`).join('')}</ul></section>`;
  }
  function missingPanel(list) {
    if (!list.length) return '';
    return `<section class="zus-result wywiad-missing"><div class="wywiad-missing-head"><span class="tile-icon gold">${symbol('help',24)}</span><div><h2>Brakuje jeszcze ${list.length} ${list.length === 1 ? 'informacji' : 'informacji'}</h2><p>Pokazujemy tylko to, czego nie wiemy. Po uzupełnieniu wynik będzie dokładniejszy.</p></div></div><ol class="wywiad-missing-list">${list.slice(0, 8).map(q => { const pq = plain(q); return `<li><div><strong>${esc(pq.title)}</strong>${pq.gdzie ? `<p><b>Gdzie to sprawdzić:</b> ${esc(pq.gdzie)}</p>` : ''}${pq.nie ? `<p class="wywiad-help">${esc(pq.nie)}</p>` : ''}</div><button type="button" class="button secondary" data-edit="${esc(q.id)}">Uzupełnij</button></li>`; }).join('')}</ol>${list.length > 8 ? `<p class="wywiad-help">I jeszcze ${list.length - 8} — pojawią się po uzupełnieniu powyższych.</p>` : ''}</section>`;
  }
  function renderResults() {
    const results = state.answers.event ? engine().assess(state.answers)||[] : [];
    const questions = questionList();
    const unknown = questions.filter(q=>state.answers[q.id]===undefined||state.answers[q.id]==='unknown');
    const answered = questions.filter(q=>state.answers[q.id]!==undefined);
    const next=unknown[0]||questions[0];
    const hasLetter = state.answers.situation==='zus-letter'||(state.answers.extraSituations||[]).includes('zus-letter')||Object.keys(state.letter).length>0;
    state.container.innerHTML=`<section class="wywiad-page">${crumbs('Świadczenia i dokumenty')}<a class="back-link text-button" href="${PREFIX}">← Wróć do: sytuacje</a><header class="page-intro"><h1 id="wywiad-title" tabindex="-1">Twoje świadczenia i dokumenty</h1><p>Sprawdź okres, kwotę i to, kto przygotowuje dokumenty.</p></header>${missingPanel(unknown)}${hasLetter?`<section class="zus-result wywiad-case-letter"><h2>Pismo z ZUS</h2><p>${state.letter.deadline&&state.letter.deadline!=='unknown'?`Termin wpisany z pisma: ${esc(state.letter.deadline)}`:'Uzupełnij rodzaj pisma i termin wskazany przez urząd.'}</p><a class="button secondary" href="${PREFIX}/pismo/${Object.keys(state.letter).length?'result':'kind'}">Otwórz pismo i następny krok</a></section>`:''}${timeline(results)}<div class="wywiad-results-layout"><div class="wywiad-results-main">${results.length?results.map(resultCard).join(''):'<div class="zus-result"><h2>Dobierz świadczenie do sytuacji</h2><a class="button primary" href="#moja-sprawa">Wybierz sytuację</a></div>'}</div>${summaryMarkup(results)}</div>${handoff(results)}<details><summary>Sprawdź lub zmień odpowiedzi (${answered.length})</summary><dl class="wywiad-answers">${answered.map(q=>`<div><dt>${esc(q.title||q.label)}</dt><dd><span>${esc(answerLabel(q,state.answers[q.id]))}</span><button type="button" class="text-button" data-edit="${esc(q.id)}" aria-label="Zmień: ${esc(q.title||q.label)}">Zmień</button></dd></div>`).join('')}</dl></details><a class="text-button" href="${PREFIX}/dodaj">Dodaj drugą sytuację</a><div id="wywiad-loss-support"></div>${notice()}${storageControls()}</section>`;
    bind({continue:()=>go(next?['pytanie',next.id]:[])});
    state.container.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>go(['pytanie',b.dataset.edit]));
    state.container.querySelectorAll('[data-document]').forEach(b=>b.onclick=()=>{const[i,j]=b.dataset.document.split(':').map(Number);go(['dokument',results[i].id,results[i].documents[j].code]);});
    state.container.querySelectorAll('[data-case-status]').forEach(b=>b.onclick=()=>{state.statuses[b.dataset.caseStatus]=b.dataset.statusValue;if(state.saved)save();const region=b.closest('.wywiad-status');region.querySelector('[data-status-label]').textContent='Status sprawy · '+b.dataset.statusValue;region.querySelectorAll('[data-case-status]').forEach(other=>{other.classList.toggle('active',other===b);other.setAttribute('aria-pressed',String(other===b));});});
    if(['loss','childDeath'].includes(state.answers.event)&&root.OtulaPismo)root.OtulaPismo.renderLossSupport(state.container.querySelector('#wywiad-loss-support'));
  }
  function renderDocument(parts) {
    const results = engine().assess(state.answers) || [];
    const result = results.find(item => item.id === parts[1]);
    const doc = result && (result.documents || []).find(item => item.code === parts[2]);
    const leaveKind = doc?.code?.startsWith('LEAVE-') ? doc.code.slice(6).toLowerCase() : null;
    const handler = leaveKind ? root.OtulaUrlopy : doc && (doc.code === 'ZAS-53' || result.pdfContext?.formCode === 'ZAS-53') ? root.OtulaChorobowe : root.OtulaWniosek;
    if (!result || !doc || !canPrepare(doc, result) || !handler || typeof handler.render !== 'function') {
      state.container.innerHTML = `<section class="zus-page wywiad-page"><a href="${PREFIX}/wynik" class="back-link text-button">← Wróć do świadczeń</a><div class="zus-result"><h1 id="wywiad-title">Przygotowanie dokumentu</h1><p>Ten dokument otworzysz w oficjalnym serwisie; wróć do listy świadczeń, aby wybrać formularz.</p>${doc ? link(doc.url, 'Otwórz oficjalny formularz', 'button primary') : ''}</div></section>`;
      return;
    }
    handler.render(state.container, { ...(result.pdfContext || {}), ...(leaveKind?{kind:leaveKind}:{}), answers: { ...state.answers }, result, benefitId: result.id, documentCode: doc.code, onBack: () => go(['wynik']) });
  }
  function renderLetter(parts) {
    if (!root.OtulaPismo) { state.message='Nie udało się wczytać ścieżki pisma; odśwież stronę.'; return renderLanding(); }
    root.OtulaPismo.render(state.container,{ data:{...state.letter}, step:parts[1], onChange:data=>{state.letter=model().cleanLetter(data);if(state.saved)save();}, onNavigate:step=>go(['pismo',step]), onBack:()=>go(state.answers.event?['wynik']:[]) });
  }
  function bind(actions = {}) {
    state.container.querySelectorAll('[data-wywiad]').forEach(b => b.addEventListener('click', () => {
      const action = b.dataset.wywiad;
      if (actions[action]) return actions[action]();
      if (action === 'save') { save(); render(state.container); }
      if (action === 'clear') { clear(); go([]); }
      if (action === 'import' && state.defaults) { state.answers = prune(state.defaults); changed(); go([]); }
    }));
  }
  function acceptDefaults(defaults) {
    if (!defaults || typeof defaults !== 'object') return;
    const src = defaults.defaults || defaults;
    const allowed = ['role', 'work', 'event', 'eventDate'];
    const data = Object.fromEntries(allowed.filter(k => cleanScalar(src[k])).map(k => [k, src[k]]));
    // Deliberately no inference of insurance, base, debt or demo identity.
    if (Object.keys(data).length) state.defaults = data;
  }
  function render(container, defaults) {
    if (!container) return;
    state.container = container; acceptDefaults(defaults);
    if (state.lastHash !== null && state.lastHash !== root.location.hash) state.focus = true;
    state.lastHash = root.location.hash;
    if (!engine() || typeof engine().questions !== 'function' || typeof engine().assess !== 'function') {
      container.innerHTML = '<section class="zus-page"><a class="back-link text-button" href="#start">← Wróć do początku</a><div class="zus-notice">Nie udało się wczytać pytań; odśwież stronę i spróbuj ponownie.</div></section>'; return;
    }
    load();
    state.answers = prune(state.answers);
    const parts = route();
    if (parts[0] === 'wynik') renderResults();
    else if (parts[0] === 'dokument') renderDocument(parts);
    else if (parts[0] === 'pismo') renderLetter(parts);
    else if (parts[0] === 'dodaj') renderLanding(true);
    else if (!parts.length) renderLanding();
    else {
      const questions = questionList();
      const requested = parts[0] === 'pytanie' ? parts[1] : '';
      const question = questions.find(q => q.id === requested) || questions.find(q => state.answers[q.id] === undefined) || questions[0];
      if (question) renderQuestion(question, questions); else renderResults();
    }
    if (state.focus) { state.focus = false; const title = container.querySelector('#wywiad-title'); if (title) title.focus({ preventScroll: true }); container.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  }
  function getAnswers() { load(); return JSON.parse(JSON.stringify(state.answers)); }
  function updateCalculatorAnswers(patch) {
    load();
    const allowed=['benefitBase','baseKnown','parentalWeeks','otherPlannedWeeks','parentalStart','otherParentalStart','otherBenefitBase','otherBaseKnown','otherConditionsConfirmed','otherRatePlan','plan','applicationDate','firstYearParental'];
    for(const key of allowed)if(cleanScalar(patch?.[key]))state.answers[key]=patch[key];
    changed();return getAnswers();
  }
  root.addEventListener('storage',event=>{
    if(state.saved&&(event.key===STORAGE_KEY||event.key===null)){
      state.answers={};state.statuses={};state.letter={};state.saved=false;state.loaded=false;state.defaults=null;
      load();state.message=state.saved?'Wczytano zmieniony zapis z drugiej karty.':'Zapis został usunięty w innej karcie.';
    }
  });
  root.OtulaWywiad = { render, clear, storageKey: STORAGE_KEY, getAnswers, updateCalculatorAnswers };
})(window);
