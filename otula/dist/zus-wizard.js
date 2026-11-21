'use strict';

// Presentation only. All entitlement and amount rules remain in zus.js.
const zusWizardSteps = ['Zdarzenie', 'Ubezpieczenie i podstawa', 'Podział', 'Wynik'];
const zusCalculatorFullPage = calculatorPage;
calculatorPage = function (r) {
  const template = document.createElement('template');
  template.innerHTML = zusCalculatorFullPage(r);
  const content = template.content;
  const form = content.querySelector('#zus-calculator');
  if (!form) return template.innerHTML;
  form.noValidate = true; // Reveal the correct step before native validation focuses it.
  form.dataset.wizardStep = '0';
  const page = content.querySelector('.zus-page');
  page.classList.add('zus-wizard');
  const examples = content.querySelector('.zus-demo-choices');
  if (examples) {
    const details = document.createElement('details');
    details.className = 'zus-wizard-examples';
    details.innerHTML = '<summary>Wypróbuj gotowy przykład</summary>';
    examples.before(details); details.append(examples);
  }
  const fields = Array.from(form.querySelectorAll(':scope > fieldset.zus-fields'));
  fields.forEach((field, i) => { field.dataset.wizardPanel = String(i); field.hidden = i !== 0; });
  // Keep the full explanations accessible without crowding the current step.
  for (const note of form.querySelectorAll('p.zus-field-note')) {
    if (note.textContent.length < 200) continue;
    const details = document.createElement('details');
    details.className = 'zus-field-note';
    const summary = document.createElement('summary');
    summary.textContent = note.textContent.startsWith('W profilu') ? 'Którą datę podać?' : note.textContent.startsWith('Dla pełnego etatu') ? 'Minimum podstawy i wymiar pracy' : 'Jak ustalić dane do tego kroku?';
    note.before(details); details.append(summary, note); note.classList.remove('zus-field-note');
  }

  const review = form.querySelector('.zus-review');
  if (review) { review.dataset.wizardPanel = '2'; review.hidden = true; }
  const submit = form.querySelector('[type="submit"]');
  submit.dataset.wizardSubmit = ''; submit.hidden = true;
  const nav = document.createElement('nav');
  nav.className = 'zus-wizard-progress'; nav.setAttribute('aria-label', 'Kroki kalkulatora');
  nav.innerHTML = zusWizardSteps.map((name, i) => `<button type="button" data-wizard-go="${i}" ${i === 0 ? 'aria-current="step"' : ''} ${i === 3 ? 'disabled' : ''}><span>${i + 1}</span><strong>${name}</strong></button>`).join('');
  form.before(nav);
  const status = document.createElement('p');
  status.className = 'zus-wizard-status'; status.id = 'zus-wizard-status';
  status.textContent = 'Krok 1 z 4 · Zdarzenie';
  form.prepend(status);
  const actions = document.createElement('div');
  actions.className = 'zus-wizard-actions';
  actions.innerHTML = '<button class="button secondary" type="button" data-wizard-prev hidden>Poprzedni krok</button><button class="button primary" type="button" data-wizard-next>Dalej: ubezpieczenie</button>';
  form.append(actions);
  actions.append(submit);
  const dossier = content.querySelector('.zus-dossier');
  if (dossier) {
    const details = document.createElement('details');
    details.className = 'zus-wizard-document';
    details.innerHTML = '<summary>Mam dokumenty lub sprawę ZUS</summary>';
    dossier.before(details); details.append(dossier);
    dossier.querySelector('.zus-steps')?.remove();
  }
  const result = content.querySelector('#zus-result');
  result.hidden = true;
  const edit = document.createElement('button');
  edit.type = 'button'; edit.className = 'button secondary zus-wizard-edit';
  edit.dataset.wizardEdit = ''; edit.hidden = true; edit.textContent = 'Zmień dane wariantu';
  result.before(edit);
  // One persistent badge; specific assumptions remain alongside the result.
  const badge = document.createElement('span');
  badge.className = 'zus-simulation-badge'; badge.textContent = 'Symulacja';
  page.prepend(badge);
  for (const p of content.querySelectorAll('.zus-notice')) {
    if (p.textContent.startsWith('Wynik jest orientacyjną symulacją.')) p.remove();
  }
  requestAnimationFrame(zusWizardInitialize);
  return template.innerHTML;
};

function zusWizardInitialize() {
  const form = document.querySelector('#zus-calculator');
  if (!form) return;
  for (const name of ['kind', 'insurance', 'insuranceB', 'rate']) {
    const select = form.elements[name];
    if (!select || select.dataset.segmented) continue;
    select.dataset.segmented = 'true';
    const label = select.closest('label');
    const labelText = Array.from(label.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    const group = document.createElement('div');
    group.className = 'zus-segment-control'; group.dataset.segmentFor = name;
    group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-label', labelText);
    group.innerHTML = Array.from(select.options).map(o => `<button type="button" role="radio" data-segment-value="${esc(o.value)}" aria-checked="${o.selected}" tabindex="${o.selected ? '0' : '-1'}">${esc(o.textContent)}</button>`).join('');
    label.append(group);
    select.classList.add('zus-native-segment');
    select.hidden = true;
    select.tabIndex = -1; select.setAttribute('aria-hidden', 'true');
  }
  zusWizardSyncSegments();
  if (document.querySelector('#zus-result h2')) zusWizardShow(3, false);
}

function zusWizardSyncSegments() {
  const form = document.querySelector('#zus-calculator');
  if (!form) return;
  form.querySelectorAll('[data-segment-for]').forEach(group => {
    const select = form.elements[group.dataset.segmentFor];
    group.querySelectorAll('button').forEach(button => {
      const option = Array.from(select.options).find(o => o.value === button.dataset.segmentValue);
      button.hidden = !!option?.hidden; button.disabled = select.disabled || !!option?.disabled;
      button.textContent = option?.textContent || '';
      button.setAttribute('aria-checked', String(select.value === option?.value));
      button.tabIndex = select.value === option?.value ? 0 : -1;
    });
  });
}

function zusWizardShow(step, focus = true) {
  const form = document.querySelector('#zus-calculator');
  if (!form) return;
  step = Math.max(0, Math.min(3, step));
  if (step === 3 && !document.querySelector('#zus-result h2')) return;
  form.dataset.wizardStep = String(step); form.hidden = step === 3;
  form.querySelectorAll('[data-wizard-panel]').forEach(panel => { panel.hidden = Number(panel.dataset.wizardPanel) !== step; });
  document.querySelectorAll('[data-wizard-go]').forEach(button => {
    if (Number(button.dataset.wizardGo) === step) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
    if (button.dataset.wizardGo === '3') button.disabled = !document.querySelector('#zus-result h2');
  });
  form.querySelector('[data-wizard-prev]').hidden = step === 0;
  const next = form.querySelector('[data-wizard-next]');
  next.hidden = step >= 2;
  next.textContent = step === 0 ? 'Dalej: ubezpieczenie' : 'Dalej: podział opieki';
  form.querySelector('[data-wizard-submit]').hidden = step !== 2;
  document.querySelector('[data-wizard-edit]').hidden = step !== 3;
  document.querySelector('#zus-result').hidden = step !== 3;
  const status = document.querySelector('#zus-wizard-status');
  status.textContent = `Krok ${step + 1} z 4 · ${zusWizardSteps[step]}`;
  if (focus) {
    const target = step === 3 ? document.querySelector('#zus-result h2') : status;
    target.tabIndex = -1; target.focus({preventScroll:true}); target.scrollIntoView({block:'start',behavior:'auto'});
  }
}

function zusWizardValidateStep(form, step) {
  const controls = Array.from(form.querySelectorAll(`[data-wizard-panel="${step}"] input, [data-wizard-panel="${step}"] select, [data-wizard-panel="${step}"] textarea`));
  const invalid = controls.find(el => !el.disabled && !el.checkValidity());
  if (!invalid) return true;
  zusWizardShow(step, false); invalid.reportValidity(); return false;
}

document.addEventListener('click', event => {
  const form = document.querySelector('#zus-calculator');
  if (!form) return;
  const step = Number(form.dataset.wizardStep || 0);
  const segment = event.target.closest('[data-segment-value]');
  if (segment) {
    event.preventDefault();
    const select = form.elements[segment.parentElement.dataset.segmentFor];
    select.value = segment.dataset.segmentValue;
    select.dispatchEvent(new Event('input', {bubbles:true}));
    select.dispatchEvent(new Event('change', {bubbles:true}));
    zusWizardSyncSegments(); return;
  }
  if (event.target.closest('[data-wizard-next]') && zusWizardValidateStep(form, step)) zusWizardShow(step + 1);
  if (event.target.closest('[data-wizard-prev]')) zusWizardShow(step - 1);
  if (event.target.closest('[data-wizard-edit]')) zusWizardShow(0);
  const go = event.target.closest('[data-wizard-go]');
  if (go) {
    const target = Number(go.dataset.wizardGo);
    if (target <= step || target === 3 || zusWizardValidateStep(form, step)) zusWizardShow(target);
  }
});
document.addEventListener('keydown', event => {
  const current = event.target.closest('[data-segment-value]');
  if (!current || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const buttons = Array.from(current.parentElement.querySelectorAll('button')).filter(b => !b.hidden && !b.disabled);
  let i = buttons.indexOf(current);
  if (event.key === 'Home') i = 0;
  else if (event.key === 'End') i = buttons.length - 1;
  else i = (i + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
  buttons[i]?.click(); buttons[i]?.focus();
});
// The original submit listener retains computation and validation ownership.
document.addEventListener('submit', event => {
  if (event.target.id !== 'zus-calculator') return;
  const invalid = Array.from(event.target.elements).find(el => el.willValidate && !el.validity.valid);
  if (invalid) {
    const panel = invalid.closest('[data-wizard-panel]');
    if (panel) zusWizardShow(Number(panel.dataset.wizardPanel), false);
  }
}, true);
document.addEventListener('submit', event => {
  if (event.target.id !== 'zus-calculator' || !document.querySelector('#zus-result h2')) return;
  const kicker = document.querySelector('#zus-result .home-kicker');
  if (kicker?.textContent.startsWith('Symulacja')) kicker.remove();
  zusWizardShow(3);
});
document.addEventListener('change', event => {
  if (event.target.form?.id === 'zus-calculator') zusWizardSyncSegments();
});
document.addEventListener('input', event => {
  if (event.target.form?.id !== 'zus-calculator') return;
  const resultStep = document.querySelector('[data-wizard-go="3"]');
  if (resultStep) resultStep.disabled = !document.querySelector('#zus-result h2');
});

function zusCompactGuidePage(r) {
  const cards = [
    ['Chorobowe w ciąży','100% podstawy · do 270 dni','Niezdolność do pracy potwierdza lekarz. Okres wyczekiwania to zwykle 30 dni przy ubezpieczeniu obowiązkowym lub 90 dni przy dobrowolnym; są wyjątki.','e-ZLA z kodem B lub zaświadczenie o ciąży. Gdy wypłaca ZUS: właściwe dane płatnika, np. Z-3/Z-3a; przy działalności wniosek ZAS-53.','sick','Warunki i dokumenty'],
    ['Świadczenie rehabilitacyjne','W ciąży 100% · maks. 12 miesięcy','Po wyczerpaniu chorobowego, gdy dalsze leczenie rokuje odzyskanie zdolności do pracy. Poza ciążą: 90% przez pierwsze 3 miesiące, później 75%.','ZNp-7 i OL-9 oraz dokumenty właściwe dla Twojej sytuacji. ZUS zaleca złożenie co najmniej 6 tygodni przed końcem okresu zasiłkowego.','rehabilitation','Warunki i wniosek'],
    ['Koniec pracy w ciąży','Najpierw sprawdź datę i przyczynę','Część umów terminowych przedłuża się do porodu. Przy śmierci, upadłości lub likwidacji pracodawcy możliwe są szczególne uprawnienia.','Świadectwo pracy i dowody okoliczności. Bez zapewnienia innej pracy możliwy zasiłek w wysokości macierzyńskiego do dnia porodu; po porodzie obowiązują odrębne warunki.','insurance','Wyjątki i uprawnienia'],
    ['Pobyt dziecka w szpitalu','Uzupełniający urlop · 100% podstawy','Dodatkowy okres zależy od tygodnia ciąży, masy urodzeniowej i pobytu dziecka w szpitalu. Następuje bezpośrednio po macierzyńskim.','Zaświadczenie szpitala oraz wniosek co najmniej 21 dni przed końcem macierzyńskiego. W kalkulatorze wybierz „Wcześniactwo / hospitalizacja”.','duration','Zasady ZUS'],
    ['Utrata dziecka lub przejęcie opieki','Pomoc dopasowana do sytuacji','Po utracie ciąży lub dziecka sprawdź skrócony okres świadczenia. Choroba lub śmierć matki mogą umożliwić przejęcie opieki przez uprawnioną osobę.','Zakres dokumentów zależy od zdarzenia. Przygotuj potwierdzenia i uzgodnij okres z płatnikiem. Możesz też skorzystać z Karty wsparcia dla bliskich.','documents','Dokumenty w szczególnych sytuacjach'],
    ['Co wpływa na wypłatę?','Ubezpieczenie · podstawa · terminy','Znaczenie mają zmiany etatu, przerwy, składniki wynagrodzenia i zadłużenie przy działalności. Termin wyboru 81,5% to najpóźniej 21 dni po zdarzeniu.','Sprawdź dokumenty płatnika, stan składek i wykorzystane okresy obojga rodziców. Aktualne formularze znajdziesz w Centrum e-usług i Bibliotece spraw.','amount','Stawki i wyrównanie']
  ];
  return backLink(r) + pageHeading('Świadczenia w ciąży','Najważniejsze, na spokojnie','Wybierz swoją sytuację i rozwiń potrzebne dokumenty oraz źródła.') +
    `<div class="zus-guide-cards">${cards.map(([title,fact,body,docs,source,sourceLabel])=>`<article><p class="zus-guide-fact">${fact}</p><h2>${title}</h2><p>${body}</p><details><summary>Dokumenty i następny krok</summary><p>${docs}</p><div class="source-box">${zusSource(source,sourceLabel)}</div></details></article>`).join('')}</div>
    <section class="zus-guide-help"><div><p class="home-kicker">Nie musisz być z tym sama ani sam</p><h2>Wsparcie bliskich i organizacji</h2><p>Pomoc po stracie, dla rodziców wcześniaków i informacje o prawach okołoporodowych.</p></div><div><a class="button primary" href="#wsparcie">Przygotuj Kartę wsparcia ${icon('arrow',16)}</a><details><summary>Organizacje i kontakty</summary><div class="source-box"><a href="https://ronicpoludzku.com/" target="_blank" rel="noopener noreferrer">Ronić po Ludzku</a><a href="https://wczesniak.pl/tak-pomagamy/" target="_blank" rel="noopener noreferrer">Wcześniak Rodzice-Rodzicom</a><a href="https://rodzicpoludzku.pl/o-nas/kontakt/" target="_blank" rel="noopener noreferrer">Rodzić po Ludzku</a></div></details></div></section>`;
}
