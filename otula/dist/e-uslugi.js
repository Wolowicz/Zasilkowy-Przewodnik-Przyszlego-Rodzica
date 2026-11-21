'use strict';
/* Centrum e-usług korzysta z jednego profilu rodziny. Osobny pokaz integracji (brief, s. 13–14):
   logowanie mObywatel, dane z ZUS, zaświadczenie o zadłużeniu, e-ZLA, PUE/eZUS, wnioski o urlopy i świadczenia,
   odpis aktu urodzenia. Wszystko działa lokalnie na fikcyjnych danych; nic nie jest wysyłane.
   Ekran #e-uslugi (oraz #e-uslugi/<usługa>) jest zarejestrowany w app.js. */

const EU_OSOBY = {
  etat: { imie: 'Anna Przykładowa', opis: 'Umowa o pracę, ubezpieczona', tytul: 'Umowa o pracę', od: '2023-02-01', chorobowe: 'obowiązkowe', ubezpieczona: true,
    platnik: 'Pracodawca zgłaszający ponad 20 osób do ubezpieczenia chorobowego (zwykle według stanu na 30 listopada poprzedniego roku)', payer: 'employer', podstawa: 6200, dlug: 0, work: 'employee',
    zla: [['2026-08-04', '2026-08-17', 'B', 'Niezdolność do pracy w okresie ciąży'], ['2026-09-01', '2026-09-30', 'B', 'Niezdolność do pracy w okresie ciąży']] },
  firma: { imie: 'Ewa Testowa', opis: 'Działalność gospodarcza, zadłużenie', tytul: 'Pozarolnicza działalność gospodarcza', od: '2024-05-01', chorobowe: 'dobrowolne', ubezpieczona: true,
    platnik: 'ZUS – samodzielnie opłacasz składki', payer: 'zus', podstawa: 4500, dlug: 1286.4, work: 'business',
    zla: [['2026-10-06', '2026-10-19', 'B', 'Niezdolność do pracy w okresie ciąży']] },
  zlecenie: { imie: 'Ola Fikcyjna', opis: 'Umowa zlecenia bez chorobowego', tytul: 'Umowa zlecenia', od: '2025-03-01', chorobowe: 'brak (nie zgłoszono dobrowolnego)', ubezpieczona: false,
    platnik: 'Do ustalenia po sprawdzeniu uprawnienia i ewentualnych wyjątków', payer: 'zus', podstawa: 0, dlug: 0, work: 'contract', zla: [] }
};
const EU_USLUGI = [
  ['dane', 'Ubezpieczenie z ZUS', 'shield'], ['zadluzenie', 'Zaświadczenie o zadłużeniu', 'file'], ['ezla', 'Zwolnienia e-ZLA', 'calendar'],
  ['ezus', 'Wiadomość do ZUS (eZUS)', 'mail'], ['urlop', 'Wniosek o urlop', 'briefcase'], ['zasilek', 'Wniosek o zasiłek (ZAM)', 'wallet'], ['odpis', 'Odpis aktu urodzenia', 'files']
];
const EU = { osoba: 'etat', zalogowany: false, etap: '', czas: 0, wiadomosci: [], wnioski: [], pobrane: false, zaswiadczenie: null };
let euTimer = null;
function euStop() { clearTimeout(euTimer); euTimer = null; EU.etap = ''; }
function euResetDemo(osoba = EU.osoba) {
  euStop();
  Object.assign(EU, { osoba: Object.hasOwn(EU_OSOBY, osoba) ? osoba : 'etat', zalogowany: false, czas: 0, wiadomosci: [], wnioski: [], pobrane: false, zaswiadczenie: null });
}
function euIsDemo(r = route()) { return r.page === 'e-uslugi' && (r.id === 'demo' || EU_USLUGI.some(([id]) => id === r.id)); }

function euFmt(d) { return new Date(d + 'T12:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }); }
function euZl(v) { return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v); }
function euNr(prefix) { return `${prefix}/${new Date().getFullYear()}/${String(Math.floor(100000 + Math.random() * 899999))}`; }
function euBadge() { return '<span class="eu-sym">Symulacja</span>'; }

function euLogowanie() {
  if (EU.etap === 'kod') return `<section class="eu-okno eu-mob" aria-labelledby="eu-mob-t"><div class="eu-okno-pasek">mObywatel</div>
    <div class="eu-okno-tresc"><h2 id="eu-mob-t" tabindex="-1">Pokaz potwierdzenia logowania</h2><p>To fikcyjny kod. Nie otwieraj mObywatela — przycisk poniżej przechodzi do przykładu.</p>
    <div class="eu-kod" aria-label="Kod weryfikacyjny">${EU.kod}</div>
    <div class="case-actions"><button class="button primary" data-eu="potwierdz">Dalej w pokazie</button><button class="button secondary" data-eu="anuluj">Anuluj</button></div></div></section>`;
  if (EU.etap === 'laczenie') return `<section class="eu-okno"><div class="eu-okno-tresc eu-ladowanie" role="status"><span class="eu-spinner"></span><h2>Otwieranie profilu…</h2><p>Przygotowujemy przykładowy profil do tego pokazu.</p></div></section>`;
  return `<section class="eu-okno"><div class="eu-okno-pasek">Logowanie</div><div class="eu-okno-tresc">
    <h2 tabindex="-1">Wybierz profil pokazowy</h2>
    <fieldset class="eu-osoby"><legend>Wybierz fikcyjną osobę do pokazu</legend>${Object.entries(EU_OSOBY).map(([k, o]) =>
      `<label><input type="radio" name="eu-osoba" value="${k}" ${EU.osoba === k ? 'checked' : ''}><span><b>${o.imie}</b>${o.opis}</span></label>`).join('')}</fieldset>
    <button class="button primary eu-mob-btn" data-eu="zaloguj">${icon('person', 18)} Pokaż logowanie przez mObywatel</button></div></section>`;
}

function euPanel(id) {
  const o = EU_OSOBY[EU.osoba];
  switch (id) {
    case 'dane': return `<h2 tabindex="-1">Ubezpieczenie z ZUS</h2>${EU.pobrane ? `
      <div class="eu-status ${o.ubezpieczona ? 'ok' : 'brak'}">${o.ubezpieczona ? 'Podlegasz ubezpieczeniu chorobowemu' : 'Brak ubezpieczenia chorobowego'}</div>
      <dl class="eu-dane"><div><dt>Tytuł ubezpieczenia</dt><dd>${o.tytul}</dd></div><div><dt>Od</dt><dd>${euFmt(o.od)}</dd></div>
      <div><dt>Ubezpieczenie chorobowe</dt><dd>${o.chorobowe}</dd></div><div><dt>Kto wypłaca zasiłek</dt><dd>${o.platnik}</dd></div>
      ${o.podstawa ? `<div><dt>Podstawa wymiaru (przykład)</dt><dd>${euZl(o.podstawa)}</dd></div>` : ''}</dl>
      ${o.ubezpieczona ? '' : '<p class="eu-uwaga">Brak zgłoszenia wymaga sprawdzenia wyjątków, m.in. po ustaniu ubezpieczenia. Nie przesądza o prawach drugiego rodzica. Sprawdź też warunki świadczenia rodzicielskiego w gminie.</p>'}
      <div class="case-actions"><button class="button primary" data-eu="do-kalkulatora">Policz ten przykład ${icon('arrow', 16)}</button><button class="button secondary" data-eu="pobierz">Pobierz ponownie</button></div>`
      : EU.etap === 'pobieranie' ? euKroki(['Połączenie z PUE/eZUS', 'Okresy ubezpieczenia', 'Płatnik i podstawa']) :
      `<p>Zobacz, jak mogłoby wyglądać pobranie okresów ubezpieczenia, płatnika i podstawy z konta ZUS.</p>
      <div class="case-actions"><button class="button primary" data-eu="pobierz">Pobierz dane pokazowe</button><a class="button secondary" href="#e-uslugi">Wróć do mojej sytuacji</a></div>`}`;
    case 'zadluzenie': return `<h2 tabindex="-1">Zaświadczenie o zadłużeniu</h2>
      <form class="eu-form" data-eu-form="zadluzenie"><label class="field">Stan na dzień powstania prawa do zasiłku<input type="date" name="data" required value="${EU.zaswiadczenie?.data || '2026-11-01'}"></label>
      <button class="button primary" type="submit">Wystaw zaświadczenie</button></form>
      ${EU.zaswiadczenie ? `<article class="eu-dokument"><header><b>Zaświadczenie o stanie rozliczeń</b><span>${EU.zaswiadczenie.nr}</span></header>
        <p>Stan na ${euFmt(EU.zaswiadczenie.data)}: <b class="${o.dlug ? 'eu-red' : 'eu-green'}">${o.dlug ? 'zadłużenie ' + euZl(o.dlug) : 'brak zaległości'}</b></p>
        <p class="eu-uwaga">${o.dlug ? 'Przy działalności zadłużenie składkowe na dzień powstania prawa może oznaczać odmowę zasiłku. Ureguluj należność i potwierdź warunki w ZUS.' : 'Brak zaległości nie przesądza o prawie do zasiłku – liczy się też ubezpieczenie chorobowe.'}</p></article>` : ''}`;
    case 'ezla': return `<h2 tabindex="-1">Zwolnienia lekarskie e-ZLA</h2>${o.zla.length ? `<ul class="eu-lista">${o.zla.map(([od, d, kod, opis]) =>
      `<li><span class="eu-kodzla">kod ${kod}</span><div><b>${euFmt(od)} – ${euFmt(d)}</b><small>${opis} · przekazane do płatnika</small></div></li>`).join('')}</ul>
      <p class="eu-uwaga">Kod B oznacza niezdolność do pracy w ciąży – zasiłek chorobowy wynosi wtedy 100% podstawy.</p>` : '<p>Brak zwolnień lekarskich na koncie.</p>'}`;
    case 'ezus': return `<h2 tabindex="-1">Wiadomość do ZUS</h2>
      <form class="eu-form" data-eu-form="ezus"><label class="field">Temat<select name="temat"><option>Zasiłek macierzyński</option><option>Ubezpieczenie chorobowe</option><option>Zadłużenie składkowe</option></select></label>
      <label class="field">Pytanie<textarea name="tresc" rows="3" required placeholder="Np. czy mam prawo do zasiłku po zakończeniu umowy?"></textarea></label>
      <button class="button primary" type="submit">Wyślij do ZUS</button></form>
      ${EU.wiadomosci.map(w => `<article class="eu-watek"><p><b>Ty · ${esc(w.temat)}</b>${esc(w.tresc)}</p><p class="eu-odp"><b>Pokaz potwierdzenia · ${esc(w.nr)}</b>Wiadomość zapisana wyłącznie w pokazie. Odpowiedź ani termin ZUS nie są tu symulowane.</p></article>`).join('')}`;
    case 'urlop': return `<h2 tabindex="-1">Wniosek o urlop do pracodawcy</h2>
      <p>Pracownik składa wniosek o urlop do pracodawcy także wtedy, gdy zasiłek wypłaca ZUS.</p>
      <form class="eu-form" data-eu-form="urlop"><label class="field">Rodzaj urlopu<select name="rodzaj"><option>Urlop macierzyński</option><option>Urlop na warunkach macierzyńskiego</option><option>Uzupełniający urlop macierzyński</option><option>Urlop rodzicielski</option><option>Urlop ojcowski</option><option>Urlop wychowawczy</option></select></label>
      <div class="eu-para"><label class="field">Od<input type="date" name="od" required value="2026-12-01"></label><label class="field">Do<input type="date" name="do" required value="2027-04-19"></label></div>
      <label class="field">Praca w trakcie urlopu rodzicielskiego<select name="praca"><option value="0">Nie</option><option value="0.5">Tak, ½ etatu</option></select></label>
      <button class="button primary" type="submit">Wyślij do pracodawcy</button></form>${euWnioski('urlop')}`;
    case 'zasilek': return `<h2 tabindex="-1">Wniosek o zasiłek macierzyński (ZAM)</h2>
      <p>Dobierz aktualny formularz i załączniki do rodzaju opieki. ${o.work === 'employee' ? 'Pracownik kontaktuje się z pracodawcą. Jeżeli płaci ZUS, pracodawca przekazuje wymagane dokumenty płatnika.' : 'Przy wypłacie przez ZUS sprawdź dokumenty wymagane dla swojego tytułu ubezpieczenia.'}</p>
      <form class="eu-form" data-eu-form="zasilek"><label class="field">Okres<select name="okres"><option>Urlop macierzyński</option><option>Urlop na warunkach macierzyńskiego</option><option>Uzupełniający urlop macierzyński</option><option>Urlop rodzicielski</option><option>Urlop ojcowski</option></select></label>
      <label class="field">Wariant wypłaty do sprawdzenia<select name="wariant"><option>Stawka właściwa dla okresu: 100% lub 70%</option><option>81,5% po spełnieniu warunków</option></select></label>
      <p class="eu-uwaga">81,5% wymaga spełnienia warunków i wniosku w terminie. Własne 9 tygodni drugiego rodzica jest płatne 70%, a okres ojcowski i uzupełniający 100%. Sam wybór opcji nie ustala prawa ani stawki.</p>
      <button class="button primary" type="submit">Wyślij ${o.payer === 'employer' ? 'do pracodawcy' : 'do ZUS'}</button>
      <a class="text-button" href="https://www.zus.pl/pl/swiadczenia/zasilki/zasilek-macierzynski/niezbedne-dokumenty" target="_blank" rel="noopener">Dokumenty i terminy w ZUS ${icon('external', 14)}</a></form>${euWnioski('zasilek')}`;
    case 'odpis': return `<h2 tabindex="-1">Odpis aktu urodzenia</h2>
      <form class="eu-form" data-eu-form="odpis"><label class="field">Rodzaj odpisu<select name="rodzaj"><option>Odpis skrócony</option><option>Odpis zupełny</option></select></label>
      <label class="field">Urząd stanu cywilnego<input name="usc" required value="USC Warszawa (przykład)"></label>
      <label class="field">Odbiór<select name="odbior"><option>Elektronicznie na skrzynkę</option><option>Osobiście w urzędzie</option></select></label>
      <button class="button primary" type="submit">Złóż wniosek</button>
      <a class="text-button" href="https://www.gov.pl/web/cyfryzacja/rejestr-stanu-cywilnego" target="_blank" rel="noopener">Rejestr stanu cywilnego na gov.pl ${icon('external', 14)}</a></form>${euWnioski('odpis')}`;
  }
  return '';
}
function euKroki(kroki) {
  const krok = Math.min(kroki.length, Math.floor((Date.now() - EU.czas) / 600));
  return `<ol class="eu-postep" role="status">${kroki.map((k, i) => `<li class="${i < krok ? 'ok' : i === krok ? 'teraz' : ''}">${k}</li>`).join('')}</ol>`;
}
function euWnioski(typ) {
  const lista = EU.wnioski.filter(w => w.typ === typ);
  return lista.map(w => `<article class="eu-dokument eu-upo"><header><b>Potwierdzenie przesłania</b><span>${w.nr}</span></header>
    <p>${esc(w.opis)}</p><p>Odbiorca: <b>${esc(w.odbiorca)}</b> · ${w.czas}</p><small>To potwierdzenie z symulacji. Nic nie zostało wysłane do urzędu ani pracodawcy.</small></article>`).join('');
}

function euOwnPage(r) {
  const child = state.children[state.active];
  const roleLabel = GUIDE.roles[state.role]?.label || 'Do uzupełnienia';
  const workLabel = GUIDE.work[state.work] || GUIDE.work.any;
  const draft = typeof zusOwnDraft === 'function' ? zusOwnDraft() : null;
  const insurance = state.role === 'tata' ? draft?.insuranceB : state.role === 'mama' ? draft?.insurance : null;
  const insuranceLabel = { yes: 'Tak — według Twoich danych', no: 'Nie — sprawdź wyjątki i inne świadczenia' }[insurance] || 'Do sprawdzenia w wyliczeniu';
  const dateLabel = child.stage === 'birth' ? 'Data urodzenia' : 'Przewidywany termin porodu';
  const row = (label, value) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`;
  return backLink(r) + `<div class="eu-own"><div class="page-intro"><div class="small-label">Centrum e-usług</div><h1 tabindex="-1">Twoja sytuacja</h1><p>Na tej podstawie dobierzemy świadczenia, dokumenty i terminy.</p></div>
    <section class="eu-profile" aria-labelledby="eu-profile-title"><div class="eu-profile-heading"><h2 id="eu-profile-title">Dane do Twojego planu</h2><a class="text-button" href="#sytuacja">${icon('adjust', 16)} Zmień dane</a></div>
      ${state.children.length > 1 ? childSwitch(true) : `<p class="eu-child-name">${icon('heart', 20)} ${esc(childLabel(state.active))}</p>`}
      <dl class="eu-dane">${row('Rola', roleLabel)}${row('Praca', workLabel)}${row('Etap', GUIDE.stages[child.stage])}${row(dateLabel, child.date ? euFmt(child.date) : 'Jeszcze nie podano')}${row('Ubezpieczenie chorobowe', insuranceLabel)}</dl>
      <a class="text-button" href="#rodzina">${icon('person', 16)} Dodaj dziecko lub zmień plan dziecka</a>
    </section>
    <section class="eu-next" aria-labelledby="eu-next-title"><div><h2 id="eu-next-title">Sprawdź, co może Ci przysługiwać</h2><p>Zobacz warunki dla swojej sytuacji, a potem potrzebne dokumenty. Dane podane wcześniej są już uwzględnione.</p></div><a class="button primary" href="#uprawnienia">Sprawdź świadczenia ${icon('arrow', 16)}</a><a class="text-button" href="${ownCalculatorRoute()}" data-eu="wlasny">Mam dane do wyliczenia kwoty ${icon('right', 14)}</a></section>
    <div class="eu-official"><p>Masz już przygotowane dokumenty?</p><a class="text-button" href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener">Otwórz oficjalne eZUS ${icon('external', 14)}</a><a class="text-button" href="https://www.zus.pl/wzory-formularzy/zasilki" target="_blank" rel="noopener">Pobierz formularz z ZUS ${icon('external', 14)}</a></div>
    <details class="eu-demo-details"><summary>Pokaz przyszłych e-usług</summary><p>Możesz obejrzeć logowanie przez mObywatel i pobieranie danych na fikcyjnym profilu. To osobny pokaz: nie łączy się z ZUS, niczego nie wysyła i nie zmienia danych Twojej rodziny.</p><a class="button secondary" href="#e-uslugi/demo">Otwórz pokaz</a></details>
  </div>`;
}

function eUslugiPage(r) {
  if (!euIsDemo(r)) return euOwnPage(r);
  const usluga = r.id || '';
  const o = EU_OSOBY[EU.osoba];
  const head = backLink(r) + `<div class="page-intro"><div class="small-label">Centrum e-usług · pokaz</div><h1 tabindex="-1">Przykład połączenia z urzędem</h1>
    <p>Fikcyjne dane i pokazowe wysyłanie. Bez połączenia z mObywatelem, ZUS ani pracodawcą. Twój plan pozostaje osobno.</p>${euBadge()} <a class="text-button" href="#e-uslugi">Wróć do mojej sytuacji</a></div>`;
  if (!EU.zalogowany) return head + euLogowanie();
  return head + `<div class="eu-konto"><span class="eu-avatar">${o.imie[0]}</span><div><b>${o.imie}</b><small>${o.opis}</small></div><button class="text-button" data-eu="wyloguj">Wyloguj</button></div>
    <div class="eu-uklad"><nav class="eu-menu" aria-label="Usługi">${EU_USLUGI.map(([id, n, ic]) =>
      `<a href="#e-uslugi/${id}" class="${usluga === id ? 'on' : ''}" ${usluga === id ? 'aria-current="page"' : ''}>${icon(ic, 20)}<span>${n}</span></a>`).join('')}</nav>
    <section class="eu-panel">${usluga !== 'demo' ? euPanel(usluga) : `<h2 tabindex="-1">Zobacz przykładowe dane</h2><p>Zacznij od pokazowego pobrania informacji o ubezpieczeniu.</p>
      <a class="button primary" href="#e-uslugi/dane">Zobacz ubezpieczenie</a>`}</section></div>`;
}


function euOdswiez() { if (route().page === 'e-uslugi') { render(); main.querySelector('.eu-panel h2, .eu-okno h2')?.focus({ preventScroll: true }); } }
document.addEventListener('change', e => {
  if (!euIsDemo()) return;
  if (e.target.name === 'eu-osoba') euResetDemo(e.target.value);
  if (e.target.name === 'okres') {
    const select = e.target.closest('[data-eu-form="zasilek"]')?.querySelector('[name="wariant"]');
    if (select) {
      const only100 = ['Urlop ojcowski', 'Uzupełniający urlop macierzyński'].includes(e.target.value);
      select.options[1].disabled = only100;
      select.options[0].textContent = only100 ? '100% podstawy za ten okres' : 'Stawka właściwa dla okresu: 100% lub 70%';
      if (only100) select.selectedIndex = 0;
    }
  }
});
window.addEventListener('hashchange', () => { if (!euIsDemo()) euStop(); });
document.addEventListener('click', e => {
  const a = e.target.closest('[data-eu]')?.dataset.eu;
  if (!a) return;
  if (a === 'wlasny') { if (typeof zusUseOwnCase === 'function') zusUseOwnCase(); return; }
  if (!euIsDemo()) return;
  if (a === 'zaloguj') { EU.etap = 'kod'; EU.kod = String(Math.floor(1000 + Math.random() * 8999)); }
  if (a === 'anuluj') euStop();
  if (a === 'potwierdz' && EU.etap === 'kod') { EU.etap = 'laczenie'; euTimer = setTimeout(() => { if (!euIsDemo() || EU.etap !== 'laczenie') return; EU.zalogowany = true; EU.etap = ''; EU.pobrane = false; EU.zaswiadczenie = null; location.hash = 'e-uslugi/dane'; euOdswiez(); }, 1400); }
  if (a === 'wyloguj') euResetDemo();
  if (a === 'pobierz' && EU.zalogowany) { euStop(); EU.pobrane = false; EU.etap = 'pobieranie'; EU.czas = Date.now();
    const tick = () => { if (!euIsDemo() || EU.etap !== 'pobieranie') return; if (Date.now() - EU.czas < 1900) { euOdswiez(); euTimer = setTimeout(tick, 300); } else { EU.etap = ''; EU.pobrane = true; euOdswiez(); } }; tick(); return; }
  if (a === 'do-kalkulatora') {
    if (!EU.zalogowany || !EU.pobrane || typeof zusOpenExample !== 'function') return;
    const o = EU_OSOBY[EU.osoba];
    zusOpenExample({ kind: 'birth', count: 1, multiple: false, dateMode: 'actual', eventDate: '2026-11-01', childDob: '2026-11-01', insurance: o.ubezpieczona ? 'yes' : 'no', insuranceB: 'unknown', baseA: o.podstawa || '', baseB: '', workA: o.work, workB: 'any', payer: o.payer, payerB: 'unknown', debt: o.dlug ? 'debt' : 'clear', debtAmountA: o.dlug, reviewInsurance: false, reviewBasis: false, reviewDates: false }, 'Przykład e-usług: ' + o.imie);
    location.hash = 'kalkulator'; return;
  }
  euOdswiez();
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-eu-form]');
  if (!f) return;
  e.preventDefault();
  if (!euIsDemo() || !EU.zalogowany) return;
  const d = Object.fromEntries(new FormData(f));
  const o = EU_OSOBY[EU.osoba];
  const czas = new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  switch (f.dataset.euForm) {
    case 'zadluzenie': EU.zaswiadczenie = { data: d.data, nr: euNr('ZUS-ZAS') }; break;
    case 'ezus': EU.wiadomosci.push({ temat: d.temat, tresc: d.tresc, nr: euNr('EZUS') }); break;
    case 'urlop': EU.wnioski.push({ typ: 'urlop', nr: euNr('WN-URL'), odbiorca: 'Pracodawca (przykład)', czas,
      opis: `${d.rodzaj}: ${euFmt(d.od)} – ${euFmt(d.do)}${d.praca === '0.5' ? ', praca w wymiarze ½ etatu' : ''}.` }); break;
    case 'zasilek': EU.wnioski.push({ typ: 'zasilek', nr: euNr('ZAM'), odbiorca: o.work === 'employee' ? 'Pracodawca (płatnik zasiłku lub przekazujący dokumenty ZUS)' : 'ZUS', czas, opis: `${d.okres}, wariant: ${d.wariant}.` }); break;
    case 'odpis': EU.wnioski.push({ typ: 'odpis', nr: euNr('USC'), odbiorca: d.usc, czas, opis: `${d.rodzaj} aktu urodzenia, odbiór: ${d.odbior.toLowerCase()}.` }); break;
  }
  euOdswiez();
});
