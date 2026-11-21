'use strict';
/* Pytania i uprawnienia pochodzą wyłącznie z OtulaWywiadReguly.
   Żadnego wysyłania odpowiedzi, danych formularza ani dokumentów do AI. */
(function (root) {
  const STORAGE_KEY = 'otula-wywiad-v1';
  const PREFIX = '#moja-sprawa';
  const LOGIN = 'https://www.zus.pl/ezus/logowanie?jezyk=pl';
  const GROUPS = [['rodzina', 'Twoja rodzina'], ['ubezpieczenie', 'Ubezpieczenie'], ['okresy', 'Czas opieki'], ['kwota', 'Kwota']];
  const state = { answers: {}, loaded: false, saved: false, container: null, defaults: null, message: '', focus: false, lastHash: null };
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const engine = () => root.OtulaWywiadReguly;
  const cleanScalar = value => (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && value.length <= 120);
  const safeUrl = value => {
    try { const u = new URL(value); return u.protocol === 'https:' && (u.hostname === 'zus.pl' || u.hostname.endsWith('.zus.pl') || u.hostname === 'gov.pl' || u.hostname.endsWith('.gov.pl')) ? u.href : ''; } catch (_) { return ''; }
  };
  const link = (url, title, cls = 'text-button') => safeUrl(url) ? `<a class="${cls}" href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(title)} <span aria-hidden="true">↗</span></a>` : '';
  function questionList(answers = state.answers) { return engine().questions(answers) || []; }
  function prune(answers) {
    let data = Object.fromEntries(Object.entries(answers || {}).filter(([key, value]) => !['__proto__', 'constructor', 'prototype'].includes(key) && cleanScalar(value)));
    if (typeof engine().prune === 'function') data = engine().prune(data);
    // Only keys from reachable questions are retained, never identifying PDF fields.
    const allowed = new Set(questionList(data).map(q => q.id));
    return Object.fromEntries(Object.entries(data).filter(([key]) => allowed.has(key)));
  }
  function load() {
    if (state.loaded) return;
    state.loaded = true;
    try {
      const item = JSON.parse(root.localStorage.getItem(STORAGE_KEY));
      if (item && item.version === 1 && item.answers && typeof item.answers === 'object') {
        state.answers = prune(item.answers); state.saved = true;
      }
    } catch (_) { state.message = 'Zapis na urządzeniu jest niedostępny; możesz korzystać z wywiadu bez zapisywania.'; }
  }
  function save() {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, answers: prune(state.answers), updatedAt: new Date().toISOString() }));
      state.saved = true; state.message = 'Odpowiedzi zapisane na tym urządzeniu.';
    } catch (_) { state.message = 'Nie udało się zapisać odpowiedzi; nadal możesz dokończyć wywiad.'; }
  }
  function changed() {
    state.answers = prune(state.answers);
    if (state.saved) save();
  }
  function commitAnswer(id, answer) {
    const previous = state.answers[id];
    if (previous !== undefined && previous !== answer) {
      if (id === 'event') {
        state.answers = Object.fromEntries(['role', 'behalf'].filter(key => state.answers[key] !== undefined).map(key => [key, state.answers[key]]));
        state.message = 'Zmieniono zdarzenie; daty, ubezpieczenie i okresy sprawdzimy ponownie dla nowej sytuacji.';
      } else if (id === 'role' || id === 'behalf') {
        const family = ['role', 'event', 'eventDate', 'childDob', 'count', 'otherSurviving', 'lossDocument', 'funeralCosts', 'adoptionCourt', 'fosterType', 'schoolDeferred', 'hospital', 'gestationWeeks', 'birthWeight', 'hospitalFrom', 'hospitalUntil', 'hospitalMore', 'hospitalFrom2', 'hospitalUntil2', 'hospitalMoreThanTwo', 'hospitalConfirmed', 'zaZyciem'];
        state.answers = Object.fromEntries(family.filter(key => state.answers[key] !== undefined).map(key => [key, state.answers[key]]));
        state.message = 'Zmieniono osobę; sytuację zawodową, ubezpieczenie i kwotę ustalimy dla niej osobno.';
      } else if (id === 'work') {
        for (const q of questionList()) if (q.group !== 'rodzina' && q.id !== 'work') delete state.answers[q.id];
        state.message = 'Zmieniono pracę; sprawdzimy ponownie ubezpieczenie, okresy i podstawę.';
      }
    }
    state.answers[id] = answer;
    changed();
  }
  function clear() {
    state.answers = {}; state.saved = false; state.message = 'Odpowiedzi zostały usunięte.';
    try { root.localStorage.removeItem(STORAGE_KEY); } catch (_) { state.message = 'Wyczyszczono bieżące odpowiedzi; zapis na urządzeniu usuń w ustawieniach danych przeglądarki.'; }
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
    return String(value) + (q.unit ? ' ' + q.unit : '');
  }
  function renderLanding() {
    const questions = questionList();
    const next = questions.find(q => state.answers[q.id] === undefined);
    const started = Object.keys(state.answers).length > 0;
    state.container.innerHTML = `<section class="zus-page wywiad-page"><article class="zus-result wywiad-welcome"><div><h1 id="wywiad-title" tabindex="-1">Sprawdź, jakie wsparcie możesz otrzymać</h1><p>Opowiedz o swojej sytuacji, a Otula dobierze świadczenia, potrzebne dokumenty i kolejne kroki.</p><button type="button" class="button primary" data-wywiad="begin">${started ? 'Kontynuuj moją sprawę' : 'Sprawdź moją sytuację'} <span aria-hidden="true">→</span></button></div><img src="assets/otula-hero.webp" alt="" width="720" height="720"></article><p class="wywiad-help">Nie znasz odpowiedzi? Możesz pominąć pytanie i wrócić do niego później.</p>${!started && state.defaults ? '<div class="zus-notice"><p>Masz już zapisany profil rodziny w Otuli.</p><button type="button" class="text-button" data-wywiad="import">Użyj zapisanej roli i sytuacji</button></div>' : ''}${started ? '<button type="button" class="text-button" data-wywiad="results">Zobacz dotychczasowe odpowiedzi i świadczenia</button>' : ''}${notice()}${storageControls()}</section>`;
    bind({ begin: () => go(next ? ['pytanie', next.id] : ['wynik']), results: () => go(['wynik']) });
  }
  function renderQuestion(q, questions) {
    const position = questions.findIndex(item => item.id === q.id);
    const value = state.answers[q.id];
    const choices = q.type === 'choice';
    const options = (q.options || []).filter(option => option.value !== 'unknown');
    const input = choices ? `<div class="wywiad-choices" role="group" aria-labelledby="wywiad-title">${options.map((option, i) => `<button type="button" class="filter wywiad-choice${String(value) === String(option.value) ? ' active' : ''}" aria-pressed="${String(value) === String(option.value)}" data-option="${i}"><span>${esc(option.label)}</span><span class="wywiad-choice-mark" aria-hidden="true">${String(value) === String(option.value) ? '✓' : ''}</span></button>`).join('')}</div>` : `<label class="field wywiad-input" for="wywiad-value"><span>${esc(q.inputLabel || (q.type === 'date' ? 'Data' : 'Wpisz wartość'))}${q.unit ? ` (${esc(q.unit)})` : ''}</span><input id="wywiad-value" name="answer" type="${q.type === 'date' ? 'date' : 'number'}" value="${value === 'unknown' || value === undefined ? '' : esc(value)}"${q.min !== undefined ? ` min="${esc(q.min)}"` : ''}${q.max !== undefined ? ` max="${esc(q.max)}"` : ''}${q.type !== 'date' ? ` step="${esc(q.step || 'any')}" inputmode="decimal"` : ''} aria-describedby="wywiad-help wywiad-error" autocomplete="off" required></label>`;
    const canImport = position === 0 && state.defaults && Object.keys(state.answers).length === 0;
    state.container.innerHTML = `<section class="zus-page wywiad-page"><button type="button" class="back-link text-button" data-wywiad="back"><span aria-hidden="true">←</span> ${position > 0 ? 'Wróć do poprzedniego pytania' : 'Wróć do początku'}</button>${progress(q, questions)}<form class="zus-result wywiad-question" novalidate><p class="small-label">Twoja sytuacja, krok po kroku</p><h1 id="wywiad-title" tabindex="-1">${esc(q.title || q.label)}</h1><p id="wywiad-help" class="wywiad-help">${esc(q.help || q.hint || 'Wybierz odpowiedź, która pasuje do Twojej sytuacji.')}</p>${input}<p id="wywiad-error" class="wywiad-error" role="alert"></p>${value === 'unknown' ? '<p class="wywiad-help">To pytanie zostało pominięte — możesz je teraz uzupełnić.</p>' : ''}<div class="wywiad-actions"><button type="submit" class="button primary">Dalej <span aria-hidden="true">→</span></button><button type="button" class="button secondary" data-wywiad="skip">Nie wiem — pomiń</button></div></form>${canImport ? '<div class="zus-notice"><p>Masz już zapisaną rolę i sytuację rodziny w Otuli.</p><button type="button" class="text-button" data-wywiad="import">Użyj tych odpowiedzi</button></div>' : ''}<button type="button" class="text-button" data-wywiad="results">Zobacz, co już wiadomo</button>${notice()}${storageControls()}</section>`;
    let selected = value;
    state.container.querySelectorAll('[data-option]').forEach(button => button.addEventListener('click', () => {
      selected = options[Number(button.dataset.option)].value;
      state.container.querySelectorAll('[data-option]').forEach(b => {
        const active = b === button; b.setAttribute('aria-pressed', String(active)); b.classList.toggle('active', active); b.querySelector('.wywiad-choice-mark').textContent = active ? '✓' : '';
      });
      state.container.querySelector('#wywiad-error').textContent = '';
    }));
    const advance = answer => {
      commitAnswer(q.id, answer);
      const nextQuestions = questionList();
      const nextPos = nextQuestions.findIndex(item => item.id === q.id) + 1;
      const next = nextQuestions[nextPos];
      go(next ? ['pytanie', next.id] : ['wynik']);
    };
    state.container.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      const error = state.container.querySelector('#wywiad-error');
      if (choices) {
        if (selected === undefined || selected === 'unknown') { error.textContent = 'Wybierz odpowiedź albo „Nie wiem — pomiń”.'; return; }
        advance(selected);
      } else {
        const field = state.container.querySelector('#wywiad-value');
        if (!field.value || !field.checkValidity()) { error.textContent = q.type === 'date' ? 'Wpisz pełną, poprawną datę albo pomiń pytanie.' : 'Sprawdź wpisaną wartość albo pomiń pytanie.'; field.focus(); return; }
        advance(q.type === 'date' ? field.value : Number(field.value));
      }
    });
    bind({ back: () => go(position > 0 ? ['pytanie', questions[position - 1].id] : []), skip: () => advance('unknown'), results: () => {
      if (choices && selected !== undefined) commitAnswer(q.id, selected);
      if (!choices) {
        const field = state.container.querySelector('#wywiad-value');
        if (field.value && field.checkValidity()) commitAnswer(q.id, q.type === 'date' ? field.value : Number(field.value));
        else { delete state.answers[q.id]; changed(); }
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
    return !result.planned && !result.pdfContext?.planned && ['ZAM', 'ZAS-53'].includes(code) && /rodzic|opiekun|ubezpieczon|wnioskodawc/i.test(doc.owner || '');
  }
  function resultCard(result, i) {
    const docs = Array.isArray(result.documents) ? result.documents : [];
    const amount = typeof result.amount === 'number' ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(result.amount) : display(result.amount);
    const missing = Array.isArray(result.missing) ? result.missing : [];
    return `<article class="zus-result wywiad-benefit" aria-labelledby="benefit-${i}"><div class="wywiad-card-heading"><span class="chip ${['eligible', 'possible'].includes(result.status) ? 'sage' : 'gold'}">${esc(statusLabel(result.status))}</span><h2 id="benefit-${i}">${esc(result.title)}</h2></div><p>${esc(display(result.why || result.summary))}</p><dl class="wywiad-facts"><div><dt>Co możesz otrzymać</dt><dd>${esc(amount || display(result.gain) || 'Kwota wymaga dodatkowych danych.')}</dd></div>${result.period ? `<div><dt>Za jaki czas</dt><dd>${esc(display(result.period))}</dd></div>` : ''}</dl>${result.gain && amount ? `<p class="wywiad-help">${esc(display(result.gain))}</p>` : ''}${missing.length ? `<div class="zus-notice"><strong>Co jeszcze sprawdzić</strong><ul>${missing.map(text => `<li>${esc(text)}</li>`).join('')}</ul></div>` : ''}${docs.length ? `<details><summary>Dokumenty i kto je przygotowuje (${docs.length})</summary><ul class="wywiad-documents">${docs.map((doc, j) => `<li><span class="chip rose">${esc(doc.owner || 'Do ustalenia')}</span><strong>${esc(doc.text || doc.label || doc.code || 'Dokument')}</strong><div class="case-actions">${canPrepare(doc, result) ? `<button class="button secondary" type="button" data-document="${i}:${j}">Przygotuj ${esc(doc.code)} do podpisu</button>` : ''}${link(doc.url, 'Otwórz oficjalny formularz')}</div></li>`).join('')}</ul></details>` : ''}<div class="wywiad-next">${result.nextStep ? `<p><strong>Następny krok:</strong> ${esc(result.nextStep)}</p>` : ''}${link(result.url, 'Sprawdź zasady w urzędzie')}${Array.isArray(result.sources) ? result.sources.map(source => link(typeof source === 'string' ? source : source.url, typeof source === 'string' ? 'Źródło urzędowe' : source.title || source.label || 'Źródło urzędowe')).join('') : ''}</div></article>`;
  }
  function handoff(results) {
    const municipal = results.some(r => ['municipal', 'za-zyciem-payment'].includes(r.id));
    const krus = results.some(r => r.id === 'krus');
    const employment = ['employee', 'contract'].includes(state.answers.work);
    return `<section class="zus-result wywiad-handoff"><p class="small-label">Złożenie dokumentów</p><h2>Gdzie załatwić Twoją sprawę</h2><div class="zus-segments">${municipal ? `<section><h3>Świadczenie z gminy</h3><p>Złóż wniosek przez Emp@tię albo w gminie lub OPS właściwym dla miejsca zamieszkania.</p>${link('https://empatia.gov.pl/', 'Przejdź do Emp@tii', 'button secondary')}${link('https://www.gov.pl/web/gov/uzyskaj-swiadczenie-rodzicielskie', 'Sprawdź dokumenty i właściwy urząd')}</section>` : ''}${employment ? `<section><h3>${state.answers.work === 'employee' ? 'Urlop i dokumenty od pracodawcy' : 'Dokumenty od zleceniodawcy'}</h3><p>${state.answers.work === 'employee' ? 'Wniosek o urlop przekaż pracodawcy, a z kadrami ustal płatnika zasiłku i potrzebne zaświadczenie.' : 'Poproś zleceniodawcę o właściwe zaświadczenie płatnika do Twojej sprawy.'}</p><p class="wywiad-help">Skorzystaj z kanału przyjmowania dokumentów wskazanego przez płatnika.</p></section>` : ''}${krus ? `<section><h3>Sprawa w KRUS</h3><p>Dokumenty i sposób złożenia sprawdź w usłudze KRUS.</p>${link('https://www.gov.pl/web/krus/zasilek-macierzynski', 'Przejdź do informacji KRUS', 'button secondary')}</section>` : ''}<section><h3>Dokument kierowany do ZUS</h3><p>Jeśli adresatem Twojego wniosku jest ZUS, przejdź do eZUS i wybierz właściwy formularz.</p>${link(LOGIN, 'Przejdź do eZUS', 'button secondary')}<p class="wywiad-help">Przez login.gov.pl możesz użyć mObywatela, jeśli ta metoda jest dostępna.</p></section><section><h3>Dokument na papierze</h3><p>Przygotuj formularz przy świadczeniu, sprawdź go, wydrukuj i podpisz przed przekazaniem właściwemu adresatowi.</p><p class="wywiad-help">Zaświadczenia pracodawcy lub lekarza przygotowuje wskazana osoba.</p></section></div><p class="wywiad-help wywiad-handoff-note">Wniosek elektroniczny podpisujesz i wysyłasz w serwisie instytucji; Otula przygotowuje dokumenty, ale ich nie składa.</p></section>`;
  }
  function renderResults() {
    const results = engine().assess(state.answers) || [];
    const questions = questionList();
    const unknown = questions.filter(q => state.answers[q.id] === undefined || state.answers[q.id] === 'unknown');
    const answered = questions.filter(q => state.answers[q.id] !== undefined);
    const next = unknown[0] || questions[0];
    state.container.innerHTML = `<section class="zus-page wywiad-page"><button class="back-link text-button" type="button" data-wywiad="back"><span aria-hidden="true">←</span> Wróć do odpowiedzi</button><header class="page-intro"><p class="small-label">Twoja sytuacja → Twoje świadczenia</p><h1 id="wywiad-title" tabindex="-1">Co możesz otrzymać?</h1><p>Oto świadczenia i dokumenty dobrane do Twoich odpowiedzi.</p><span class="chip gold">Orientacyjnie</span></header>${unknown.length ? `<div class="zus-notice"><p>${unknown.length} ${unknown.length === 1 ? 'informacja wymaga' : 'informacji wymaga'} uzupełnienia; brak odpowiedzi nie oznacza odmowy.</p><button type="button" class="button primary" data-wywiad="continue">Uzupełnij brakujące informacje</button></div>` : ''}<div aria-live="polite">${results.length ? results.map(resultCard).join('') : '<div class="zus-result"><h2>Zacznijmy od Twojej sytuacji</h2><p>Odpowiedz na pierwsze pytania, aby zobaczyć właściwe świadczenia.</p><button type="button" class="button primary" data-wywiad="continue">Przejdź do pytań</button></div>'}</div>${handoff(results)}<details><summary>Sprawdź lub zmień odpowiedzi (${answered.length})</summary><dl class="wywiad-answers">${answered.map(q => `<div><dt>${esc(q.title || q.label)}</dt><dd><span>${esc(answerLabel(q, state.answers[q.id]))}</span><button type="button" class="text-button" data-edit="${esc(q.id)}" aria-label="Zmień: ${esc(q.title || q.label)}">Zmień</button></dd></div>`).join('')}</dl></details>${notice()}${storageControls()}</section>`;
    bind({ back: () => go(next ? ['pytanie', next.id] : []), continue: () => go(next ? ['pytanie', next.id] : []) });
    state.container.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => go(['pytanie', b.dataset.edit])));
    state.container.querySelectorAll('[data-document]').forEach(b => b.addEventListener('click', () => {
      const [i, j] = b.dataset.document.split(':').map(Number);
      go(['dokument', results[i].id, results[i].documents[j].code]);
    }));
  }
  function renderDocument(parts) {
    const results = engine().assess(state.answers) || [];
    const result = results.find(item => item.id === parts[1]);
    const doc = result && (result.documents || []).find(item => item.code === parts[2]);
    const handler = doc && (doc.code === 'ZAS-53' || result.pdfContext?.formCode === 'ZAS-53') ? root.OtulaChorobowe : root.OtulaWniosek;
    if (!result || !doc || !canPrepare(doc, result) || !handler || typeof handler.render !== 'function') {
      state.container.innerHTML = `<section class="zus-page wywiad-page"><a href="${PREFIX}/wynik" class="back-link text-button">← Wróć do świadczeń</a><div class="zus-result"><h1 id="wywiad-title">Przygotowanie dokumentu</h1><p>Ten dokument otworzysz w oficjalnym serwisie; wróć do listy świadczeń, aby wybrać formularz.</p>${doc ? link(doc.url, 'Otwórz oficjalny formularz', 'button primary') : ''}</div></section>`;
      return;
    }
    handler.render(state.container, { ...(result.pdfContext || {}), answers: { ...state.answers }, result, benefitId: result.id, documentCode: doc.code, onBack: () => go(['wynik']) });
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
    else if (!parts.length) {
      const questions = questionList();
      if (questions.length && questions.every(q => state.answers[q.id] !== undefined)) renderResults();
      else renderLanding();
    }
    else {
      const questions = questionList();
      const requested = parts[0] === 'pytanie' ? parts[1] : '';
      const question = questions.find(q => q.id === requested) || questions.find(q => state.answers[q.id] === undefined) || questions[0];
      if (question) renderQuestion(question, questions); else renderResults();
    }
    if (state.focus) { state.focus = false; const title = container.querySelector('#wywiad-title'); if (title) title.focus({ preventScroll: true }); container.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  }
  root.OtulaWywiad = { render, clear, storageKey: STORAGE_KEY, getAnswers: () => ({ ...state.answers }) };
})(window);
