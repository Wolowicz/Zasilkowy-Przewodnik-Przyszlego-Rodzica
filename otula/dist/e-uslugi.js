'use strict';
/* Centrum e-usług – SYMULACJA wymaganych przez ZUS integracji (brief, s. 13–14):
   logowanie mObywatel, dane z ZUS, zaświadczenie o zadłużeniu, e-ZLA, PUE/eZUS, wnioski o urlopy i świadczenia,
   odpis aktu urodzenia. Wszystko działa lokalnie na fikcyjnych danych; nic nie jest wysyłane.
   Ekran #e-uslugi (oraz #e-uslugi/<usługa>) jest zarejestrowany w app.js. */

const EU_OSOBY = {
  etat: { imie: 'Anna Przykładowa', opis: 'Umowa o pracę, ubezpieczona', tytul: 'Umowa o pracę', od: '2023-02-01', chorobowe: 'obowiązkowe', ubezpieczona: true,
    platnik: 'Pracodawca zatrudniający ponad 20 osób – wypłaca zasiłek', payer: 'employer', podstawa: 6200, dlug: 0, work: 'employee',
    zla: [['2026-08-04', '2026-08-17', 'B', 'Niezdolność do pracy w okresie ciąży'], ['2026-09-01', '2026-09-30', 'B', 'Niezdolność do pracy w okresie ciąży']] },
  firma: { imie: 'Ewa Testowa', opis: 'Działalność gospodarcza, zadłużenie', tytul: 'Pozarolnicza działalność gospodarcza', od: '2024-05-01', chorobowe: 'dobrowolne', ubezpieczona: true,
    platnik: 'ZUS – samodzielnie opłacasz składki', payer: 'zus', podstawa: 4500, dlug: 1286.4, work: 'business',
    zla: [['2026-10-06', '2026-10-19', 'B', 'Niezdolność do pracy w okresie ciąży']] },
  zlecenie: { imie: 'Ola Fikcyjna', opis: 'Umowa zlecenia bez chorobowego', tytul: 'Umowa zlecenia', od: '2025-03-01', chorobowe: 'brak (nie zgłoszono dobrowolnego)', ubezpieczona: false,
    platnik: 'Brak prawa do zasiłku z ubezpieczenia chorobowego', payer: 'zus', podstawa: 0, dlug: 0, work: 'contract', zla: [] }
};
const EU_USLUGI = [
  ['dane', 'Ubezpieczenie z ZUS', 'shield'], ['zadluzenie', 'Zaświadczenie o zadłużeniu', 'file'], ['ezla', 'Zwolnienia e-ZLA', 'calendar'],
  ['ezus', 'Wiadomość do ZUS (eZUS)', 'mail'], ['urlop', 'Wniosek o urlop', 'briefcase'], ['zasilek', 'Wniosek o zasiłek (ZAM)', 'wallet'], ['odpis', 'Odpis aktu urodzenia', 'files']
];
const EU = { osoba: 'etat', zalogowany: false, etap: '', czas: 0, wiadomosci: [], wnioski: [], pobrane: false, zaswiadczenie: null };

function euFmt(d) { return new Date(d + 'T12:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }); }
function euZl(v) { return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v); }
function euNr(prefix) { return `${prefix}/${new Date().getFullYear()}/${String(Math.floor(100000 + Math.random() * 899999))}`; }
function euBadge() { return '<span class="eu-sym">Symulacja · dane fikcyjne</span>'; }

function euLogowanie() {
  if (EU.etap === 'kod') return `<section class="eu-okno eu-mob" aria-labelledby="eu-mob-t"><div class="eu-okno-pasek">mObywatel ${euBadge()}</div>
    <div class="eu-okno-tresc"><h2 id="eu-mob-t" tabindex="-1">Potwierdź logowanie</h2><p>Otwórz aplikację mObywatel i sprawdź, czy kod jest taki sam.</p>
    <div class="eu-kod" aria-label="Kod weryfikacyjny">${EU.kod}</div>
    <div class="case-actions"><button class="button primary" data-eu="potwierdz">Potwierdzam w telefonie</button><button class="button secondary" data-eu="anuluj">Anuluj</button></div></div></section>`;
  if (EU.etap === 'laczenie') return `<section class="eu-okno"><div class="eu-okno-tresc eu-ladowanie" role="status"><span class="eu-spinner"></span><h2>Łączenie z ZUS…</h2><p>Weryfikujemy tożsamość i otwieramy profil na PUE/eZUS.</p></div></section>`;
  return `<section class="eu-okno"><div class="eu-okno-pasek">Logowanie ${euBadge()}</div><div class="eu-okno-tresc">
    <h2 tabindex="-1">Zaloguj się, aby zobaczyć swoje dane</h2>
    <fieldset class="eu-osoby"><legend>Wybierz fikcyjną osobę do pokazu</legend>${Object.entries(EU_OSOBY).map(([k, o]) =>
      `<label><input type="radio" name="eu-osoba" value="${k}" ${EU.osoba === k ? 'checked' : ''}><span><b>${o.imie}</b>${o.opis}</span></label>`).join('')}</fieldset>
    <button class="button primary eu-mob-btn" data-eu="zaloguj">${icon('person', 18)} Zaloguj przez mObywatel</button></div></section>`;
}

function euPanel(id) {
  const o = EU_OSOBY[EU.osoba];
  switch (id) {
    case 'dane': return `<h2 tabindex="-1">Ubezpieczenie z ZUS</h2>${EU.pobrane ? `
      <div class="eu-status ${o.ubezpieczona ? 'ok' : 'brak'}">${o.ubezpieczona ? 'Podlegasz ubezpieczeniu chorobowemu' : 'Brak ubezpieczenia chorobowego'}</div>
      <dl class="eu-dane"><div><dt>Tytuł ubezpieczenia</dt><dd>${o.tytul}</dd></div><div><dt>Od</dt><dd>${euFmt(o.od)}</dd></div>
      <div><dt>Ubezpieczenie chorobowe</dt><dd>${o.chorobowe}</dd></div><div><dt>Kto wypłaca zasiłek</dt><dd>${o.platnik}</dd></div>
      ${o.podstawa ? `<div><dt>Podstawa wymiaru (przykład)</dt><dd>${euZl(o.podstawa)}</dd></div>` : ''}</dl>
      ${o.ubezpieczona ? '' : '<p class="eu-uwaga">Bez ubezpieczenia chorobowego nie ma prawa do zasiłku macierzyńskiego z ZUS. Sprawdź świadczenie rodzicielskie w gminie.</p>'}
      <div class="case-actions"><button class="button primary" data-eu="do-kalkulatora">Użyj w kalkulatorze ${icon('arrow', 16)}</button><button class="button secondary" data-eu="pobierz">Pobierz ponownie</button></div>`
      : EU.etap === 'pobieranie' ? euKroki(['Połączenie z PUE/eZUS', 'Okresy ubezpieczenia', 'Płatnik i podstawa']) :
      `<p>Pobierz okresy ubezpieczenia, płatnika i podstawę. Możesz też wpisać dane samodzielnie w kalkulatorze.</p>
      <div class="case-actions"><button class="button primary" data-eu="pobierz">Pobierz dane z ZUS</button><a class="button secondary" href="#kalkulator">Wpiszę sama</a></div>`}`;
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
      ${EU.wiadomosci.map(w => `<article class="eu-watek"><p><b>Ty · ${w.temat}</b>${esc(w.tresc)}</p><p class="eu-odp"><b>ZUS · ${w.nr}</b>Dziękujemy. Odpowiemy w ciągu 7 dni na Twój profil eZUS.</p></article>`).join('')}`;
    case 'urlop': return `<h2 tabindex="-1">Wniosek o urlop do pracodawcy</h2>
      <form class="eu-form" data-eu-form="urlop"><label class="field">Rodzaj urlopu<select name="rodzaj"><option>Urlop macierzyński</option><option>Urlop rodzicielski</option><option>Urlop ojcowski</option><option>Urlop wychowawczy</option></select></label>
      <div class="eu-para"><label class="field">Od<input type="date" name="od" required value="2026-12-01"></label><label class="field">Do<input type="date" name="do" required value="2027-04-19"></label></div>
      <label class="field">Praca w trakcie urlopu rodzicielskiego<select name="praca"><option value="0">Nie</option><option value="0.5">Tak, ½ etatu</option></select></label>
      <button class="button primary" type="submit">Wyślij do pracodawcy</button></form>${euWnioski('urlop')}`;
    case 'zasilek': return `<h2 tabindex="-1">Wniosek o zasiłek macierzyński (ZAM)</h2>
      <p>Od 24 października 2026 r. ZAM obejmuje także dawne ZUR i ZAO. ${o.payer === 'employer' ? 'Twój płatnik wypłaca zasiłek – wniosek trafia do pracodawcy.' : 'Zasiłek wypłaca ZUS – wniosek trafia do ZUS.'}</p>
      <form class="eu-form" data-eu-form="zasilek"><label class="field">Okres<select name="okres"><option>Urlop macierzyński</option><option>Urlop rodzicielski</option><option>Urlop ojcowski</option></select></label>
      <label class="field">Wariant wypłaty<select name="wariant"><option>100% i 70%</option><option>81,5% przez cały okres (wniosek do 21 dni po porodzie)</option></select></label>
      <button class="button primary" type="submit">Wyślij ${o.payer === 'employer' ? 'do pracodawcy' : 'do ZUS'}</button>
      <a class="text-button" href="https://www.zus.pl/wzory-formularzy/zasilki" target="_blank" rel="noopener">Wzór ZAM na zus.pl ${icon('external', 14)}</a></form>${euWnioski('zasilek')}`;
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

function eUslugiPage(r) {
  const usluga = r.id || '';
  const o = EU_OSOBY[EU.osoba];
  const head = `<div class="page-intro"><div class="small-label">Centrum e-usług</div><h1 tabindex="-1">Twoje sprawy w ZUS</h1>
    <p>Pokaz integracji z mObywatelem, ZUS i USC. To symulacja na fikcyjnych danych – nic nie jest wysyłane.</p></div>`;
  if (!EU.zalogowany) return head + euLogowanie();
  return head + `<div class="eu-konto"><span class="eu-avatar">${o.imie[0]}</span><div><b>${o.imie}</b><small>${o.opis}</small></div>${euBadge()}<button class="text-button" data-eu="wyloguj">Wyloguj</button></div>
    <div class="eu-uklad"><nav class="eu-menu" aria-label="Usługi">${EU_USLUGI.map(([id, n, ic]) =>
      `<a href="#e-uslugi/${id}" class="${usluga === id ? 'on' : ''}" ${usluga === id ? 'aria-current="page"' : ''}>${icon(ic, 20)}<span>${n}</span></a>`).join('')}</nav>
    <section class="eu-panel">${usluga ? euPanel(usluga) : `<h2 tabindex="-1">Wybierz usługę</h2><p>Zacznij od pobrania danych o ubezpieczeniu – pokażą, czy i kto wypłaci zasiłek.</p>
      <a class="button primary" href="#e-uslugi/dane">Pobierz dane z ZUS</a>`}</section></div>`;
}


function euOdswiez() { if (route().page === 'e-uslugi') { render(); main.querySelector('.eu-panel h2, .eu-okno h2')?.focus({ preventScroll: true }); } }
document.addEventListener('change', e => { if (e.target.name === 'eu-osoba') EU.osoba = e.target.value; });
document.addEventListener('click', e => {
  const a = e.target.closest('[data-eu]')?.dataset.eu;
  if (!a) return;
  if (a === 'zaloguj') { EU.etap = 'kod'; EU.kod = String(Math.floor(1000 + Math.random() * 8999)); }
  if (a === 'anuluj') EU.etap = '';
  if (a === 'potwierdz') { EU.etap = 'laczenie'; setTimeout(() => { EU.zalogowany = true; EU.etap = ''; EU.pobrane = false; EU.zaswiadczenie = null; location.hash = 'e-uslugi/dane'; euOdswiez(); }, 1400); }
  if (a === 'wyloguj') Object.assign(EU, { zalogowany: false, etap: '', pobrane: false, zaswiadczenie: null, wiadomosci: [], wnioski: [] });
  if (a === 'pobierz') { EU.pobrane = false; EU.etap = 'pobieranie'; EU.czas = Date.now();
    const tick = () => { if (Date.now() - EU.czas < 1900) { euOdswiez(); setTimeout(tick, 300); } else { EU.etap = ''; EU.pobrane = true; euOdswiez(); } }; tick(); return; }
  if (a === 'do-kalkulatora') {
    const o = EU_OSOBY[EU.osoba];
    zusSaveDraft({ ...zusInitial(), insurance: o.ubezpieczona ? 'yes' : 'no', baseA: o.podstawa || '', workA: o.work, payer: o.payer, debt: o.dlug ? 'debt' : 'clear', reviewInsurance: true, reviewBasis: true, reviewDates: true });
    zusAutoSubmit = true;
    location.hash = 'kalkulator'; return;
  }
  euOdswiez();
});
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-eu-form]');
  if (!f) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  const o = EU_OSOBY[EU.osoba];
  const czas = new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
  switch (f.dataset.euForm) {
    case 'zadluzenie': EU.zaswiadczenie = { data: d.data, nr: euNr('ZUS-ZAS') }; break;
    case 'ezus': EU.wiadomosci.push({ temat: d.temat, tresc: d.tresc, nr: euNr('EZUS') }); break;
    case 'urlop': EU.wnioski.push({ typ: 'urlop', nr: euNr('WN-URL'), odbiorca: 'Pracodawca (przykład)', czas,
      opis: `${d.rodzaj}: ${euFmt(d.od)} – ${euFmt(d.do)}${d.praca === '0.5' ? ', praca w wymiarze ½ etatu' : ''}.` }); break;
    case 'zasilek': EU.wnioski.push({ typ: 'zasilek', nr: euNr('ZAM'), odbiorca: o.payer === 'employer' ? 'Pracodawca (płatnik zasiłku)' : 'ZUS', czas, opis: `${d.okres}, wariant: ${d.wariant}.` }); break;
    case 'odpis': EU.wnioski.push({ typ: 'odpis', nr: euNr('USC'), odbiorca: d.usc, czas, opis: `${d.rodzaj} aktu urodzenia, odbiór: ${d.odbior.toLowerCase()}.` }); break;
  }
  euOdswiez();
});
